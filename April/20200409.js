const moment = require('moment')
const util = require('util')
const os = require('os')
// format Error TO record err log
var format = function (msg) {
    let ret = ''
    if (!msg) {
        return ret
    }
    const date = moment()
    const time = date.format('YYYY-MM-DD HH:mm:ss')
    if (msg instanceof Error) {
        var err = {
            name: msg.name,
            data: msg.data
        }
        err.stack = msg.stack
        ret = util.format('%s %s: %s\nHost: %s\nData: %j\n%s\n\n', time, err.name, err.stack, os.hostname(), err.data, time)
        console.log(ret)
    } else {
        ret = time + ' ' + util.format.apply(util, arguments) + '\n'
    }
    return ret
}