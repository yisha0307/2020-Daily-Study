var http = require('http')
var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('handled by child, pid is '+ process.pid + '\n')
    // 模拟未捕获的异常
    throw new Error('throw exception')
})
var worker
process.on('message', function (m, tcp) {
    if (m === 'server') {
        worker = tcp
        worker.on('connection', function (socket) {
            server.emit('connection', socket)
        })
    }
})
process.on('uncaughtException', function (err) {
    // 日志记录
    logger.error(err)
    // 工作进程在得知崩溃后，立即向主进程发送一个自杀信号
    process.send({act: 'suicide'})
    worker.close(function () {
        // 所有已有连接断开后，退出进程
        process.exit(1)
    })
    // 5秒后退出进程
    // 如果是长连接而不是http服务的短连接的话，需要设置一个默认的值，强制在限定的时间内退出
    setTimeout(() => {
        process.exit(1)
    }, 5000);
})