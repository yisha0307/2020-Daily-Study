// 在开启keepalive之后，一个TCP会话可以用于多次请求和相应。
// TCP以connection为单位进行服务，HTTP服务以request为单位进行服务。
var http = require('http')
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('Hello world')
}).listen(1337, '127.0.0.1')
console.log('http server running at 127.0.0.1:1337')

// hack res.writehead
// 注入setCookie
var writeHead = res.writeHead
res.writeHead = function () {
    var cookies = res.getHeader('Set-Cookie')
    var session = serialize(key, req.session.id)
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session]
    res.setHeader('Set-Cookie', cookies)
    return writeHead.apply(this, arguments)
}
var handle = function (req, res) {
    if (!req.session.isVisit) {
        req.session.isVisit = true
        res.writeHead(200)
        res.end('the first time')
    } else {
        res.writeHead(200)
        res.end('welcome again!')
    }
}