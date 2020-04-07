// 子进程child_process模块
// 以此实现多核CPU的利用
// var http = require('http')
// http.createServer(function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'})
//     res.end('Hello world\n')
// }).listen(Math.round((1+Math.random())*1000), '127.0.0.1')

// // child_process的各个方法
// // node worker.js的各种实现
// var cp = require('child_process')
// cp.spawn('node', ['worker.js'])
// cp.exec('node worker.js', function (err, stdout, stderr) {
//     // some code
// })
// cp.execFile('worker.js', function (err, stdout, stderr) {
//     // some code
// })
// cp.fork('./worker.js')

// // 创建父子进程之间的通信
// // parent.js
// var cp = require('child_process')
// var n = cp.fork(__dirname + '/sub.js')
// n.on('message', function (m) {
//     console.log('PARENT got message: ', m)
// })
// n.send({hello: 'world'})
// // sub.js
// process.on('message', function (m) {
//     console.log('CHILD got message: ', m)
// })
// process.send({foo: 'bar'})

// 句柄传递
// 这样每个子进程不需要重新起端口进行监听
// 多个子进程可以监听相同端口
var cp = require('child_process')
var child1 = cp.fork('20200403-process.js')
var child2 = cp.fork('20200403-process.js')
// open up the server object and send the handle
var server = require('net').createServer()
server.listen(1339, function () {
    // 把一个tcp服务发给了子进程
    child1.send('server', server)
    child2.send('server', server)
    // 关掉服务
    // 使主进程更轻量
    server.close
})