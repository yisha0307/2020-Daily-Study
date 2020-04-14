const log = console.log
// ES6 Symbol对象
let s = Symbol()
log(typeof s)

var s1 = Symbol('foo')
var s2 = Symbol('bar')
log(s1, s2)

// ======= 作为属性名的Symbol ==========
var mySymbol = Symbol()
var a = {}
a[mySymbol] = 'hello!'
log(a[mySymbol])
var a = {
    [mySymbol]: 'world'
}
log(a[mySymbol])
var a = {}
Object.defineProperty(a, mySymbol, {value: 'haha'})
log(a[mySymbol])

// ========属性名的遍历=======
var obj = {}
var a = Symbol('a')
var b = Symbol('b')
obj[a] = 'Hello'
obj[b] = 'World'
var objectSymbols = Object.getOwnPropertySymbols(obj)
log(objectSymbols)
log(Object.getOwnPropertyNames(obj)) // getOwnPropertyNames()是没有Symbol的
log(Reflect.ownKeys(obj)) // Reflect.ownKeys()可以

class Collection {
    *[Symbol.iterator]() {
        let i = 0
        while(this[i] !== undefined) {
            yield this[i]
            ++i
        }
    }
}
let myCollection = new Collection()
myCollection[0] = 1
myCollection[1] = 2
for (let value of myCollection) {
    console.log(value)
}

var obj = {
    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case 'number':
                return 123
            case 'string':
                return 'str'
            case 'default':
                return 'default'
            default:
                throw new Error()
        }
    }
}
log(2*obj)
log(3+obj)
log(obj === 'default')
log(String(obj))


// ======= new运算符 ========
function create () {
    var obj = new Object(),
    Con = [].shift.call(arguments)
    // 链接到原型
    obj.__proto__ = Con.prototype
    // 绑定this实现继承，obj可以访问到构造函数中的属性
    var ret = Con.apply(obj, arguments)
    return typeof ret === 'object' ? ret:obj
}
function Car(color) {
    this.color = color
}
Car.prototype.start = function () {
    console.log(this.color + ' car start')
}
var car = create(Car, 'black')
log(car.color)
log(car.start(), '-----end------')

function add (a) {
    function sum(b) {
        a = a + b
        return sum
    }
    sum.toString = function () {
        return a
    }
    return sum
}

log(add(1))
log(add(1)(2))
log(add(1)(2)(3))
log(add(1)(2)(3)(4))