// // cluster模块可以实现多进程架构
// // 比child_process更便捷
// var cluster = require('cluster')
// cluster.setupMaster({
//     exec: './20200407-worker.js'
// })

// var cpus = require('os').cpus()
// for (var i = 0; i < cpus.length; i++) {
//     cluster.fork()
// }

var cluster = require('cluster')
var http = require('http')
var numCPUs = require('os').cpus().length

if (cluster.isMaster) {
    // fork workers
    for (var i = 0; i <numCPUs; i++) {
        cluster.fork()
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.')
    })
} else {
    // workers can share any TCP connection
    // in this case its a http server
    http.createServer(function(req, res) {
        res.writeHead(200)
        res.end('hello world')
    }).listen(8000)
}
