// async处理异步
const async = require('async')
const fs = require('fs')

// async.series(): 串行执行
async.series([
    // callback并非使用者指定，由async通过高阶函数注入
    function(callback) {
      fs.readFile('file1.txt', 'utf-8', callback)
    },
    function(callback) {
      fs.readFile('file2.txt', 'utf-8', callback)
    }
  ], function (err, results) {
    //   结束所有调用之后保存的结果可以用数组的形式调用
    // results => [file1.txt, file2.txt]
})
// 上段代码等价于：
fs.readFile('file1.txt', 'utf-8', (err, content) => {
    if (err) {
        return callback(err)
    }
    fs.readFile('file2.txt', 'utf-8', function (err, data) {
        if(err) {
            return callback(err)
        }
        callback(null, [content, data])
    })
})

// 异步的并行执行
async.parallel([
    function (callback) {
        fs.readFile('file1.txt', 'utf-8', callback)
    },
    function (callback) {
        fs.readFile('file2.txt', 'utf-8', callback)
    }
], function (err, results) {
    // results => [file1.txt, file2.txt]
})
// 上面这段代码等价于下面：
var counter = 2
var results = []
var done = function (index, value) {
    results[index] = value
    counter--
    if (counter === 0) {
        callback(null, results)
    }
}
var hasError = false
var fail = function (err) {
    if (!hasError) {
        hasError = true
        callback(err)
    }
}
fs.readFile('file1.txt', 'utf-8', function (err, content) {
    if (err) {
        return fail(err)
    }
    done(0, content)
})
fs.readFile('file2.txt', 'utf-8', (err, data) => {
    if (err) {
        return fail(err)
    }
    done(1, data)
})
// EventProxy异步并行处理方案
var EventProxy = require('eventproxy')
var proxy = new EventProxy()
proxy.all('content', 'data', function(content, data) {
    callback(null, [content, data])
})
proxy.fail(callback)
fs.readFile('file1.txt', 'utf-8', proxy.done('content'))
fs.readFile('file2.txt', 'utf-8', proxy.done('data'))

// async异步调用的依赖处理
async.waterfall([
    function (callback) {
        fs.readFile('file1.txt', 'utf-8', function (err, content) {
            callback(err, content)
        })
    },
    function (arg1, callback) {
        // arg1 => file2.txt
        // arg1就是上一步传下来的content
        fs.readFile(arg1, 'utf-8', function(err, content) {
            callback(err, content)
        })
    },
    function (arg1, callback) {
        // arg1 => file3.txt
        fs.readFile(arg1, 'utf-8', function (err, content) {
            callback(err, content)
        })
    }
], function (err, result) {
    // result => file4.txt
})
// 上面这段代码等价于:
fs.readFile('file1.txt', 'utf-8', function(err, content) {
    if (err) {
        return callback(err)
    }
    fs.readFile(content, 'utf-8', function(err, data) {
        if (err) {
            return callback(err)
        }
        fs.readFile(data, 'utf-8', function(err, data3) {
            if (err) {
                return callback(err)
            }
            callback(null, data3)
        })
    })
})

// async 自动依赖处理
// p98 依赖关系分析
var deps = {
    readConfig: function (callback) {
        // read config file
        callback()
    },
    connectMongoDB: ['readConfig', function (callback) {
        // connect to DB
        // rely on 'readConfig' to complete
        callback()
    }],
    connectRedis: ['readConfig', function (callback) {
        callback()
    }],
    compileAssets: function(callback) {
        // compile asserts
        callback()
    },
    uploadAssets: ['compileAssets', function (callback) {
        // upload to CDN
        callback()
    }],
    startup: ['connectMongoDB', 'connectRedis', 'uploadAssets', function (callback) {
        // startup server
        callback()
    }]
}
// async.auto()能根据依赖关系自动分析，以最佳的方式完成上述业务
async.auto(deps)
// 也可以用eventproxy来完成