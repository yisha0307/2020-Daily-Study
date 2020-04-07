// var fork = require('child_process').fork
// var cpus = require('os').cpus()
// for (var i = 0; i < cpus.length; i++) {
//     fork('./20200403.js')
// }

// 子进程
var http = require('http')
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('handled by child, pid is '+ process.pid + '\n')
})
process.on('message', function(m, tcp) {
    if (m === 'server') {
        tcp.on('connection', function (socket) {
            server.emit('connection', socket)
        })
    }
})