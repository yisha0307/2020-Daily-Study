var fork = require('child_process').fork
var cpus = require('os').cpus()

var server = require('net').createServer()
server.listen(1337)

var workers = {}
var createWorker = function () {
    var worker = fork(__dirname + '/20200407-worker.js')
    worker.on('message', function (message) {
        // 创建新工作进程在前，退出异常进程在后
        if (message.act === 'suicide') {
            createWorker()
        }
    })
    worker.on('exit', function () {
        // 退出后重新启动新的进程
        console.log('Worker '+ worker.pid + ' exited.')
        delete workers[worker.pid]
    })
    // 句柄转发
    worker.send('server', server)
    workers[worker.pid] = worker
    console.log('Create worker. pid: ' + worker.pid)
}

for (var i = 0; i<cpus.length; i++) {
    createWorker()
}
// 进程自己退出时，让所有工作进程退出
process.on('exit', function () {
    for (var pid in workers) {
        workers[pid].kill()
    }
})