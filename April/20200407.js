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

var fork = require('child_process').fork
// 限制重启次数
var limit = 10
var during = 60000
var restart = []
var isTooFrequently = function () {
    // 记录重启时间
    var time = Date.now()
    var length = restart.push(time)
    if (length > limit) {
        // 取出最后10个记录
        restart = restart.slice(limit * -1)
    }
    return restart.length >= limit && restart[restart.length - 1] - restart[0] < during
}

// var workers = {}
// var createWorker = function() {
//     if (isTooFrequently()) {
//         // 触发giveup事件后，不再重启
//         process.emit('giveup', length, during)
//         return
//     }
//     var worker = fork(__dirname + '/20200407-worker.js')
//     worker.on('exit', function () {
//         console.log('Worker ' + worker.pid + ' exited.')
//         delete workers[worker.pid]
//     })
//     worker.on('message', function (message) {
//         if (message.act === 'suicide') {
//             createWorker()
//         }
//     })
//     // 句柄转发
//     workers.send('server', server)
//     workers[worker.pid] = worker
//     console.log('Create worker. pid: ' + worker.pid)
// }