// var compare = function (x, y) {
//     return x-y
// }
// var swap = function (a, i, j) {
//     [a[i], a[j]] = [a[j], a[i]]
// }

// var bubbleSort = function (array) {
//     for (var i =0; i < array.length; i++) {
//         for (var j = 0; j < array.length - i -1; j++) {
//             if (compare(array[j], array[j + 1]) > 0) {
//                 swap(array, j, j+1)
//             }
//         }
//     }
// }
// 使用wind做一个排序动画
var Wind = require('wind')
// var swapAsync = eval(Wind.compile('async', function(a, i, j) {
//     // Wind.Async.sleep() 相当于setTimeout
//     $await(Wind.Async.sleep(20)) // 暂停20毫秒
//     var t = a[i]
//     a[i] = a[j]
//     a[j] = t
//     paint(a) // 重绘数组
// }))
// var bubbleSortAsync = eval(Wind.compile('async', function(array) {
//     for (var i = 0; i < array.length; i++) {
//         for (var j = 0; j < array.length - i -1; j++) {
//             if (compare(a[j], a[j+1]) >0 ){
//                 // $await()接受的参数是一个任务对象，表示等待任务结束后才会执行后续操作
//                 // 每一个异步操作都可以转化成一个任务
//                 $await(swapAsync(array, j, j+1))
//             }
//         }
//     }
// }))
// 将fs.readFile调用转化成一个任务模型
var Task = Wind.Async.Task
var fs = require('fs')
var readFileAsync = function (file, encoding) {
    return Task.create(function (t) {
        fs.readFile(file, encoding, function (err, file) {
            if (err) {
                t.complete('failure', err)
            } else {
                t.complete('success', file)
            }
        })
    })
}

// wind执行串行异步
var serial = eval(Wind.compile('async', function () {
    var file1 = $await(readFileAsync('file1.txt', 'utf-8'))
    console.log(file1)
    var file2 = $await(readFileAsync('file2.txt', 'utf-8'))
    console.log(file2)
    try {
        var file3 = $await(readFileAsync('file3.txt', 'utf-8'))
    } catch (err) {
        console.log(err)
    }
}))

serial().start()

// wind执行并行
var parallel = eval(Wind.compile('async', function () {
    var result = $await(Task.whenAll({
        file1: readFileAsync('file1.txt', 'utf8'),
        file2: readFileAsync('file2.txt', 'utf8')
    }))
    console.log(result.file1)
    console.log(result.file2)
}))
parallel().start()
// readFileAsync也可以简化成一行代码即可实现:
// Wind.Async.Binding.fromCallback: 无异常的调用
// Wind.Async.Binding.fromStandard: 需要处理异常的调用
var readFileAsync = Wind.Async.Binding.fromStandard(fs.readFile)