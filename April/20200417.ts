// class
class Point {
    static origin = new Point(0, 0)
    static distanceToOrigin(p: Point) {
        return Math.sqrt(p.x * p.x + p.y + p.y)
    }
    x: number;
    y: number;
    constructor (x: number, y: number) {
        this.x = x
        this.y = y
    }
    printPoint(): void {
        console.log(this.x, this.y)
    }
}

interface PointInstanceType {
    x: number;
    y: number;
    printPonint (): void
}

let p1: Point;
let p2: PointInstanceType;

// 泛型 generics
function createArray<T>(length: number, value: T) : Array<T> {
    let result: T[] = []
    for (let i = 0; i< length; i++) {
        result[i] = value
    }
    return result
}
createArray(3, 'x')

// 多个类型参数
function swap <T,U>(tuple: [T, U]) : [U, T] {
    return [tuple[1], tuple[0]]
}
swap([7, 'seven'])

// 泛型约束
interface Lengthwise {
    length: Number;
}
function loggingIdentity<T extends Lengthwise>(arg: T) : T {
    console.log(arg.length)
    return arg
}
loggingIdentity('123')

function copyFields <T extends U, U> (target: T, source: U) : T {
    for (let id in source) {
        target[id] = (<T>source)[id]
    }
    return target
}
let x = { a: 1, b: 2, c: 3, d: 4 };
copyFields(x, {b: 10, d: 20})

// 泛型接口
interface SearchFunc {
    (source: string, subString: string): boolean
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
    return source.search(subString) !== -1
}

// 泛型类
class GenericNumber <T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}
let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0
myGenericNumber.add = function (x, y) { return x+y}