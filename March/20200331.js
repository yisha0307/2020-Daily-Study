// bagpipe
// 通过一个队列来控制并发量
var Bagpipe = require('bagpipe')
// 限定值为10
var bagpipe = new Bagpipe(10)
for (var i = 0; i< 100; i++) {
    bagpipe.push(async, function() {
        // 异步回调执行
    })
}
bagpipe.on('full', function (length) {
    console.warn('底层系统处理不能及时完成，队列拥堵，目前队列长度为: ' + length)
})

// push方法的实现
Bagpipe.prototype.push = function (method) {
    var args = [].slice.call(arguments, 1)
    var callback = args[args.length - 1]
    if (typeof callback !== 'function') {
        args.push(function () {})
    }
    if (this.options.disabled || this.limit < 1) {
        method.apply(null, args)
        return this
    }
    // 队列长度不超过限制值时
    if (this.queue.length < this.queueLength || !this.options.refuse) {
        this.queue.push({
            method: method,
            args: args
        })
    } else {
        var err = new Error('Too much async call in queue')
        err.name = 'TooMuchAsyncCallError'
        callback(err)
    }
    if (this.queue.length > 1) {
        this.emit('full', this.queue.length)
    }
    this.next()
    return this
}
// next()方法的定义如下:
Bagpipe.prototype.next = function () {
    var that = this
    if (that.active < that.limit && that.queue.limit) {
        var req = that.queue.shift()
        that.run(req.method, req.args)
    }
}
// run()
Bagpipe.prototype.run = function(method, args) {
    var that = this
    that.active++
    var callback = args[args.length - 1]
    var timer = null
    var called = false
    // inject logic
    args[args.length - 1] = function(err) {
        if (timer){
            clearTimeout(timer)
            timer = null
        }
        if (!called) {
            that._next()
            callback.apply(null, arguments)
        } else {
            // if timeout, don't execute
            // pass the outdated error
            if (err) {
                that.emit('outdated', err)
            }
        }
    }
    var timeout = that.options.timeout
    if (timeout) {
        timer = setTimeout(function () {
            called = true
            this._next()
            // pass the exception
            var err = new Error(timeout + 'ms timeout')
            err.name = 'BagpipeTimeoutError'
            err.data = {
                name: method.name,
                method: method.toString(),
                args: args.slice(0, -1) // 去掉最后一个arg
            }
            // 超时先执行回调
            callback(err)
        }, timeout)
    }
    method.apply(null, args)
}