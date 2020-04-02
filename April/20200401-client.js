// /**
//  * http client
//  */
// var http = require('http')

// var options = {
//     hostname: '127.0.0.1',
//     port: 1337,
//     path: '/',
//     method: 'GET'
// }
// var req = http.request(options, function (res) {
//     console.log('STATUS: ' + res.statusCode)
//     console.log('HEADERS: ' + JSON.stringify(res.headers))
//     res.setEncoding('utf8')
//     res.on('data', function (chunk) {
//         console.log(chunk)
//     })
// })
// req.end()

var socket = new WebSocket('ws://127.0.0.1:12012/updates')
socket.onopen = function () {
    setInterval(() => {
        // every 50ms send message to the server
        if (socket.bufferedAmount == 0) {
            socket.send(getUpdateData())
        }
    }, 50);
}
socket.onmessage = function (event) {
    // TODO: event.data
    // receive data from server
}
