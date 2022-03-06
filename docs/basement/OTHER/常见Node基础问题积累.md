# 常见 Node 基础问题积累

## 1. Node 中 \_\_dirname 是什么？

`__dirname` 总是指向被执行 js 文件的绝对路径。

## 2. Node 怎么获取 cpu 内核数量？

os.cpus().length

## 3. 中间件的作用？

中间件，用来实现各种功能，比如 cookie 解析、日志记录、文件压缩等。对于同一个网络请求，可能同时有多个匹配的中间件，一般顺序执行。而最后调用的 `next()` 则是把执行控制权，从上一个中间件，转移到下一个中间件的函数。

```js
var express = require('express')
var app = express()

// 中间件1
app.use(function (req, res, next) {
  console.log(req.url) // 打印请求地址，你也可以在这里打印请求日志
  next() //
})

// 中间件2
app.use(function (req, res, next) {
  res.send('ok')
  next()
})

app.listen(3000)
```
