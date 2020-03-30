const Step = require('step')
const fs = require('fs')

// step接受任意数量的任务，所有的任务都将会串行依法执行
// 依次读取文件：
Step(
    // this是step内部的一个next()方法
    // 讲异步调用的结果传递给了下一个任务
    function readFile1 () {
        fs.readFile('file1.txt', 'utf-8', this)
    },
    function readFile2 (err, content) {
        fs.readFile('file2.txt', 'utf-8', this)
    },
    function done (err, content) {
        console.log(content)
    }
)
// STEP执行并行任务
// this具有一个parallel()方法，告诉step需要等到所有任务都完成才能进行下一个任务
Step(
    function readFile11 () {
        fs.readFile('file1.txt', 'utf-8', this.parallel())
        fs.readFile('file2.txt', 'utf-8', this.parallel())
    },
    function done (err, content1, content2) {
        // content1 => file1
        // content2 => file2
        console.log(arguments)
    }
)

// step里的this.group()类似于parallel()的效果，但是在结果传递上略有不同
Step(
    function readDir() {
        fs.readdir(__dirname, this)
    },
    function readFiles (err, results) {
        if (err) throw err
        // create a new group
        var group = this.group()
        results.forEach(function (filename) {
            if (/\.js$/.test(filename)) {
                fs.readFile(__dirname + '/' + filename, 'utf8', group())
            }
        })
    },
    function showAll (err, files) {
        if (err) throw err
        console.dir(files)
    }
)