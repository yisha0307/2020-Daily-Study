import { fstat } from "fs"
import { toUnicode } from "punycode"

// session
// 通过查询字符串来实现浏览器和服务器端数据的对应
// 有的服务器在禁用了cookie之后，会采用这种方式进行退化
// 缺点1：session直接存在内存里，但是内存中的数据量加大，必然会引起垃圾回收的频繁扫描
// 缺点2：可能为了利用多核cpu而启动多个进程，用户请求的连接可能随意分配到各个进程中，node的进程和进程之间是不能直接共享内存的，用户的session可能会引起错乱
// 采用的解决方案是将session集中化，将原本可能分散在多个进程中的数据，统一转移到集中的数据存储中
const key = 'session_id'
const EXPIRES = 20*60*1000
var sessions = {}
function getURL (_url, key, value) {
    var obj = url.parse(_url, true)
    obj.query[key] = value
    return url.format(obj)
}
var generate = function () {
    var session = {}
    session.id = (new Date()).getTime() + Math.random()
    session.cookie = {
        expire: (new Date()).getTime() + EXPIRES
    }
    sessions[session.id] = session
    return session
}
var handle = function (req, res) {
    if (!req.session.isVisit) {
        req.session.isVisit = true
        res.writeHead(200)
        res.end('welcome')
    } else {
        res.writeHead(200)
        res.end('welcome again!')
    }
}

function (req, res) {
    var redirect = function (url) {
        res.setHeader('Location', url)
        res.writeHead(302)
        res.end()
    }
    var id = req.query[key]
    if (!id) {
        var session = generate()
        redirect(getURL(req.url, key, session.id))
    } else {
        var session = sessions[id]
        if (session) {
            if (session.cookie.expire > (new Date()).getTime()) {
                // 更新超时时间
                session.cookie.expire = (new Date()).getTime() + EXPIRES
                req.session = session
                handle(req, res)
            } else {
                // 超时了，删除旧的数据，并重新生成
                delete sessions[id]
                var session = generate()
                redirect(getURL(req.url, key, session.id))
            }
        } else {
            // 如果session过期或者口令不对，重新生成session
            var session = generate()
            redirect(getURL(req.url, key, session.id))
        }
    }
}


// 协商缓存
// 向服务器询问带上”if-modified-since", 如果没有变化server会返回一个304码，重定向到client的缓存
var fs = require('fs')
var handleCache = function (req, res) {
    fs.stat(filename, function (err, stat) {
        var lastModified = stat.mtime.toUTCString()
        if (lastModified === req.headers['if-modified-since']) {
            res.writeHead(304, 'Not Modified')
            res.end
        } else {
            fs.readFile(filename, function(err, file) {
                var lastModified = stat.mtime.toUTCString()
                res.setHeader('Last-Modified', lastModified)
                res.writeHead(200, 'Ok')
                res.end(file)
            })
        }
    })
}
// 协商缓存 E-Tag
// 对文件进行hash
var getHash = function (str) {
    var shasum = crypto.createHash('sha1')
    return shasum.update(str).digest('base64')
}
var handleCacheByETag = function (req, res) {
    fs.readFile(filename, function (err, file) {
        var hash = getHash(file)
        var noneMatch = req.headers['if-none-match']
        if (hash === noneMatch) {
            res.writeHead(304, 'Not Modified')
            res.end()
        } else {
            res.setHeader('ETag', hash)
            res.writeHead(200, 'OK')
            res.end(file)
        }
    })
}

// 强缓存
// Expires或者Cache-Control
var handleStrongCache = function(req, res) {
    fs.readFile(filename, function (err, file) {
        var expires = new Date()
        expires.setTime(expires.getTime() + 10*365*24*60*60*1000)
        res.setHeader('Expires', expires.toUTCString())
        // OR max-age
        // max-age会覆盖expires
        res.setHeader('Cache-Control', 'max-age=' + 10*365*24*60*60*1000)
        res.writeHead(200, 'OK')
        res.end(file)
    })
}

// Basic认证
// 如果没有携带认证内容会返回一个401码
// 缺点是几乎是明文传输，除非是在https，否则太不安全
function (req, res) {
    var auth = req.headers['authorization'] || ''
    var parts = auth.split(' ')
    var method = parts[0] || '' // Basic
    var encoded = parts[1] || ''
    var decoded = new Buffer(encoded, 'base64').toString('utf-8').split(':')
    var user = decoded[0]
    var pass = decoded[1]
    if (!checkUser(user, pass)) {
        // 浏览器会自动弹出对话框进行交互式提交认证信息
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"')
        res.writeHead(401)
        res.end()
    } else {
        handle(req, res)
    }
}

// 检查有没有body
var hasBody = function (req) {
    return 'transfer-encoding' in req.headers || 'content-length' in req.headers
}
function (req, res) {
    if (hasBody(req)) {
        var buffers = []
        req.on('data', function (chunk) {
            buffers.push(chunk)
        })
        req.on('end', function () {
            req.rawBody = Buffer.concat(buffers).toString()
            handle(req, res)
        })
    } else {
        handle(req, res)
    }
}

// application/x-www-form-urlencoded的post报文格式
// foo=bar&baz=val
var handle = function (req, res) {
    if (req.headers['content-type'] === 'application/x-www-urlencoded') {
        req.body = querystring.parse(req.rawBody)
    }
    // 业务代码
    todo(req, res)
}
// JSON的报文格式
// content-type: application/json; charset=utf-8
var mime = function (req) {
    var str = req.headers['content-type'] || ''
    return str.split(';')[0]
}
var handleJSON = function (req, res) {
    if (mime(req) === 'application/json') {
        try {
            req.body = JSON.parse(req.rawBody)
        } catch (e) {
            res.writeHead(400)
            res.end('Invalid JSON')
            return
        }
    }
    todo(req, res)
}
// XML文件
// 需要支持XML到JSON对象转换的库
var xml2js = require('xml2js')
var handleXML = function (req, res) {
    if (mime(req) === 'application/xml') {
        xml2js.parseString(req.rawBody, function (err, xml) {
            if (err) {
                res.writeHead(400)
                res.end('Invalid XML')
                return
            }
            req.body = xml
            todo(req, res)
        })
    }
}
// 上传文件
// 接受大小未知的数据量时，需要非常谨慎
// 不能采用先接受内容再解析的方式
function (req, res) {
    if (hasBody(req)) {
        var done = function () {
            handle(req, res)
        }
        if (mime(req) === 'application/json') {
            parseJSON(req, done)
        } else if (mime(req) === 'application/xml') {
            parseXML(req, done)
        } else if (mime(req) === 'multipart/form-data') {
            parseMultipart(req, done)
        } else {
            handle(req, res)
        }
    }
}
// formidable: 基于流式处理报文，将接收到的文件写入到系统的临时文件夹中，并返回相应的路径
var formidable = require('formidable')
function (req, res) {
    if (hasBody(req)) {
        if (mime(req) === 'multipart/form-data') {
            var form = new formidable.IncomingForm()
            form.parse(req, function(err, fields, files) {
                req.body = fields
                req.files = files
                // 在业务代码中只需要检查req.body和req.files即可
                handle(req, res)
            })
        } else {
            handle(req, res)
        }
    }
}

// RESTful接口设计
var routes = {'all': []}
var app = {}
app.use = function (path, action) {
    routes.all.push([pathRegexp(path), action])
}
['get', 'put', 'delete', 'post'].forEach(method => {
    routes[method] = []
    app[method] = function (path, action) {
        routes[method].push([pathRegexp(path), action])
    }
});

// 接口分发之前先做匹配
var match = function (pathname, routes) {
    for (var i = 0; i<routes.length;i++) {
        var route = routes[i]
        var reg = route[0].pathRegexp
    }
}

// 中间件异常处理
// 为next()方法添加err参数，并捕获中间件直接抛出的同步异常
var handle = function (req, res, stack) {
    var next = function (err) {
        if (err) {
            return handle500(err, req, res, stack)
        }
        var middleware = stack.shift()
        if (middleware) {
            // 传入next()函数自身，使中间件能够执行结束后递归
            try {
                middleware(req, res, next)
            } catch (e) {
                next(e)
            }
        }
    }
    next()
}
// 中间件的错误需要自己抛出来
var session = function (req, res, next) {
    var id = req.cookies.sessionid
    store.get(id, function(err, session) {
        if (err) {
            // 将异常通过next()传递
            return next(err)
        }
        req.session = session
        next()
    })
}
var handle500 = function (err, req, res, stack) {
    stack = stack.filter(function (middleware) {
        return middleware.length === 4
    })
    var next = function () {
        var middleware = stack.shift()
        if (middleware) {
            middleware(err, req, res, next)
        }
    }
    next()
}

// 响应附件下载的API（res.sendfile)
// 可以不需要页面渲染直接下载 Content-Disposition
var mime = require('mime')
res.sendfile = function (filepath) {
    fs.stat(filepath, function(err, stat) {
        var stream = fs.createReadStream(filepath)
        res.setHeader('Content-Type', mime.lookup(filepath))
        res.setHeader('Content-Length', stat.size)
        res.setHeader('Content-Disposition', 'attchment; file="' + path.basename(filepath) + '"')
        res.writeHead(200)
        stream.pipe(res)
    })
}
// 响应json
res.json = function(json) {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify(json))
}
// 响应跳转
res.redirect = function (url) {
    res.setHeader('Location', url)
    res.writeHead(302)
    res.end('Redirect to ' + url)
}
