// proxy属于元编程
// 在这个例子中，对于一个空对象做了一层拦截，重定义了get和set方法
var obj = new Proxy({}, {
    get: function (target, key, receiver) {
        console.log(`getting ${key}!`)
        return Reflect.get(target, key, receiver)
    },
    set: function (target, key, value, receiver) {
        console.log(`setting ${key}!`)
        return Reflect.set(target, key, value, receiver)
    }
})

obj.count = 1
++obj.count
console.log(obj.count)

// var proxy = new Proxy(target, handler)
var proxy = new Proxy({}, {
    get: function(target, property) {
        return 35
    }
})

console.log(proxy.time)
console.log(proxy.age)
console.log(proxy.name)

var handler = {
    get: function (target, name) {
        if (name === 'prototype') return Object.prototype
        return 'Hello, ' + name
    },
    apply: function (target, thisBinding, args) { return args[0] },
    construct: function (target, args) { return args[1] }
}
var fproxy = new Proxy(function(x,y) {
    return x+y
}, handler)

console.log(fproxy(1,2))
// new fproxy(1,2)
console.log(fproxy.prototype)
console.log(fproxy.foo)


function createArray(...elements) {
    let handler = {
        get(target, propKey, receiver) {
            let index = Number(propKey)
            if (index < 0) {
                propKey = String(target.length + index)
            }
            return Reflect.get(target, propKey, receiver)
        }
    }
    let target = []
    target.push(...elements)
    return new Proxy(target, handler)
}

let arr = createArray('a', 'b', 'c')
console.log(arr[-2])

var pipe = (function () {
    let pipe
    return function (value) {
        pipe = []
        return new Proxy({}, {
            get: function (pipeObject, fnName) {
                if (fnName === 'get') {
                    return pipe.reduce((val, fn) => fn(val), value)
                }
                pipe.push(fnName)
                return pipeObject
            }
        })
    }
}())
var double = n => n*2
var pow = n => n * n
var reverseInt = n => n.toString().split('').reverse().join('') | 0

console.log(pipe(3).get)

// set()
let validator = {
    set: function (obj, prop, value) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer')
            }
            if (value > 200) {
                throw new RangeError('The age seems invalid')
            }
        }
        obj[prop] = value
    }
}
let person = new Proxy({}, validator)
person.age = 100
console.log(person.age)
// person.age = 'yong'
// console.log(person.age)

// 防止内部属性被外部读/写
var handler = {
    get (target, key) {
        invariant(key, 'get')
        return target[key]
    },
    set (target, key, value) {
        invariant(key, 'set')
        return true
    }
}
function invariant (key, action) {
    if (key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`)
    }
}
var target = {}
var proxy = new Proxy(target, handler)
// try this
// console.log(proxy._prop)
// proxy._prop = 'v'

// apply()
// 拦截函数的调用、call和apply的操作
var handler = {
    apply (target, ctx, args) {
        return Reflect.apply(...arguments)
    }
}
var target = function () {return 'I am the target'}
var handler = {
    apply () {
        return 'I am the proxy'
    }
}
// 调用的时候被proxy拦截
var p = new Proxy(target, handler)
console.log(p())

var twice = {
    apply (target, ctx, args) {
        return Reflect.apply(...arguments) * 2
    }
}
function sum (left, right) {
    return left + right
}
// 用apply()的必须是Function
var proxy = new Proxy(sum, twice)
console.log(proxy(1, 2))
console.log(proxy.call(null, 5, 6))
console.log(proxy.apply(null, [7, 8]))

// has()
var handler = {
    has (target, key) {
        // 向in操作符隐藏私有属性
        if (key[0] === '_') {
            return false
        }
        return key in target
    }
}
var target = {_prop: 'foo', prop: 'foo'}
var proxy = new Proxy(target, handler)
console.log('_prop' in proxy)

// construct() : 用于拦截new命令
var handler = {
    construct (target, args) {
        return new target(...args)
    }
}
var p = new Proxy(function() {}, {
    construct: function (target, args) {
        console.log('called: '+ args.join(', '))
        return {value: args[0] * 10}
    }
})
console.log(new p(1).value)

// defineProperty() : 拦截了Object.defineProperty的操作
var handler = {
    defineProperty (target, key, descriptor) {
        return false
    }
}
var target = {}
var proxy = new Proxy(target, handler)
proxy.foo = 'bar'
console.log(proxy.foo)

// enumerate() : 用于拦截for...in循环
var handler = {
    enumerate (target) {
        // 只有私有
        return Object.keys(target).filter(key => key[0] !== '_')[Symbol.iterator]()
    }
}
var target = {prop: 'foo', _bar: 'baz', _prop: 'foo'}
var proxy = new Proxy(target, handler)
for (let key in proxy) {
    console.log(key)
}

var p1 = new Proxy({}, {
    enumerate(target) {
        return 1
    }
})
for (var x in p1) {console.log(x)}

// getOwnPropertyDescriptor()
var handler = {
    getOwnPropertyDescriptor (target, key) {
        if (key[0] === '_') {
            return
        }
        return Object.getOwnPropertyDescriptor(target, key)
    }
}
var proxy = new Proxy(target, handler)
console.log(Object.getOwnPropertyDescriptor(proxy, 'wat'))
console.log(Object.getOwnPropertyDescriptor(proxy, '_bar'))
console.log(Object.getOwnPropertyDescriptor(proxy, 'prop'))

// getPrototypeOf()
// 用来拦截getPrototypeOf()、instanceof
var proto = {}
var p = new Proxy({}, {
    getPrototypeOf(target) {
        return proto
    }
})
console.log(Object.getPrototypeOf(p) === proto)

// isExtensible()
var p = new Proxy({}, {
    isExtensible: function(target) {
        console.log('called')
        return true
    }
})
Object.isExtensible(p)

// ownKeys()
var target = {
    _bar: 'foo',
    _prop: 'bar',
    prop: 'baz'
}
var handler = {
    ownKeys (target) {
        return Reflect.ownKeys(target).filter(key => key[0] !== '_')
    }
}
var proxy = new Proxy(target, handler)
for (let key of Object.keys(proxy)) {
    console.log(key)
}
