// UDP客户端
var dgram = require('dgram')
var message = new Buffer.from('深入浅出node.js')
var client = dgram.createSocket('udp4')
// socket.send(buf, offset, length, port, address, callback)
client.send(message, 0, message.length, 41234, 'localhost', function (err, bytes) {
    client.close()
})