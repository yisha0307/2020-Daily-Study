// Reflect相当于Object对象
// 有些不同比如Reflect拥有一些Reflect.has(obj, name) && Reflect.deleteProperty(obj, name) 等方法

Proxy(target, {
    set: function (target, name, value, receiver) {
        var success = Reflect.set(target, name, value, receiver)
        if (success) {
            console.log('property ' + name + ' on ' + target + ' set to '+ value)
        }
        return success
    }
})
