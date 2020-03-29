const Deferred = require('./20200327')
const fs = require('fs')

console.log(Deferred)
// smooth(fs.readFile)
var smooth = function (method) {
    return function () {
        var deferred = new Deferred()
        var args = Array.prototype.slice.call(arguments, 0)
        args.push(deferred.callback())
        method.apply(null, args)
        return deferred.promise
    }
}

var readFile = smooth(fs.readFile)
readFile('./file1.txt', 'utf8').then(function (file) {
    return readFile(file.trim(), 'utf8')
}).then(function (file2) {
    console.log(file2)
})