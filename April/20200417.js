// class
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.distanceToOrigin = function (p) {
        return Math.sqrt(p.x * p.x + p.y + p.y);
    };
    Point.prototype.printPoint = function () {
        console.log(this.x, this.y);
    };
    Point.origin = new Point(0, 0);
    return Point;
}());
var p1;
var p2;
// 泛型 generics
function createArray(length, value) {
    var result = [];
    for (var i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}
createArray(3, 'x');
// 多个类型参数
function swap(tuple) {
    return [tuple[1], tuple[0]];
}
swap([7, 'seven']);
function loggingIdentity(arg) {
    console.log(arg.length);
    return arg;
}
loggingIdentity('123');
function copyFields(target, source) {
    for (var id in source) {
        target[id] = source[id];
    }
    return target;
}
var x = { a: 1, b: 2, c: 3, d: 4 };
copyFields(x, { b: 10, d: 20 });
var mySearch;
mySearch = function (source, subString) {
    return source.search(subString) !== -1;
};
// 泛型类
var GenericNumber = /** @class */ (function () {
    function GenericNumber() {
    }
    return GenericNumber;
}());
var myGenericNumber = new GenericNumber();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) { return x + y; };
