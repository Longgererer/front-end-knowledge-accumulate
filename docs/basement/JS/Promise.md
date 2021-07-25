---
tags:
  - JS
  - JavaScript
---

# Promise

Promise 是异步编程的一种解决方案，它主要用于解决异步中的**回调地狱**问题 。

所谓的回调地狱就类似于下面这样：

```javascript
function a() {
  function b() {
    function c() {
      function d() {
        console.log('123')
      }
      d()
    }
    c()
  }
  b()
}
a()
```

在上述代码中，如果我想执行函数 `d`，那就必须先要执行函数 `c`...一直要执行到 `a`，这样的嵌套加回调很容易让人头晕，但这在以前是再正常不过的代码了，没人会觉得它有什么问题。

回调在异步操作中是最频繁的，为什么呢？看下面的 Node 代码：

```javascript
function getMime() {
  console.log(1)
  let a = fs.readFile('input.txt', function(data) {
    console.log(2)
    return data.toString()
  })
  console.log(a)
  console.log(3)
}
getMime()
```

这是一段 Node 代码，我想读取一个文件的信息，于是在读取文件信息的时候将它输出，然而结果却不是这样的：

```bash
依次输出：
1
undefined
3
2
```

**What**? 为什么会这样呢？

因为 Node 中 `readFile` 是一个非阻塞式 I/O,也就是异步方法，在异步方法中无法通过同步方式(`return`)来获取文件数据，因为获取数据的行为发生在所有阻塞式(同步)命令都完成之后才会开始执行。

于是 `a` 的值是 `undefined`，那么为什么先输出 `3`，再输出 `2` 呢？

一样的道理，因为异步的原因，`console.log(2)`要等到 `console.log(3)`执行完才开始执行。

那么如何获取到文件中的数据呢，用**回调(callback)**。

看下面的代码：

```javascript
function getMime(callback) {
  console.log(1)
  fs.readFile('input.txt', function(data) {
    console.log(2)
    callback(data.toString())
  })
  console.log(3)
}
getMime(function(data) {
  console.log(data)
})
```

这次传递了一个 `callback` 参数，等到执行 `readFile` 方法的时候再调用 `callback` 函数，这样就可以成功获取到数据了：

```bash
依次输出：
1
3
2
data.toString()
```

既然回调这么常用，那么出现回调地狱的情况也再正常不过了，`promise` 是怎么解决的呢？

```javascript
function ajax() {
  var request = new XMLHttpRequest()
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        return success(request.responseText)
      } else {
        return fail(request.status)
      }
    }
  }
}
```

这是 AJAX 中判断服务器状态的方法，这样写没有任何问题，但不好看，可读性也差，也不利于代码重复利用，用 `promise` 可以这样写：

```javascript
function ajax(method, url, data) {
  let request = new XMLHttpRequest()
  return new Promise(function(resolve, reject) {
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          resolve(request.responseText)
        } else {
          reject(request.status)
        }
      }
    }
    request.open(method, url)
    request.send(data)
  })
}
let p = ajax('GET', '/url')
p.then(function(text) {
  console.log(text)
}).catch(function(status) {
  console.log('ERROR: ' + status)
})
```

在上述代码中，同样封装了一个 `ajax` 方法，不同的是函数中返回了一个 `promise` 实例，成功和失败执行的操作由 `resolve` 和 `reject` 代替

可见 `promise` 最大的好处是将执行代码和处理结果的代码分离开，以链式的形式展现，不用再去写难看的嵌套代码了。

那么怎么使用 `promise` 呢？

举个栗子：

```javascript
function timer() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (false) {
        resolve('hello world')
      } else {
        reject('ERROR!')
      }
    }, 1000)
  })
}
timer()
  .then(function(data) {
    console.log(data)
  })
  .catch(function(err) {
    console.log(err)
  })
```

> 上述代码的结果是：在一秒钟之后输出`'hello world'`。

`promise` 实例的参数是一个函数，这个函数又有两个参数**resolve**, **reject**，分别对应成功执行的操作和失败执行的操作。

`setTimeout` 调用了 `resolve`，`resolve` 方法传递了一个参数`hello world`，传递参数与什么用呢？

在下面执行的时候，`then` 方法的参数是一个函数，函数的参数 `data` 就是通过 `resolve` 传递的。

如果把 `true` 改为 `false` 呢？

那么就会执行 `else` 中的命令，`reject` 传递了一个参数`ERROR`，在下面有一个 `catch` 方法，它的参数是一个函数，函式的参数 `err` 就是通过 `reject` 传递的。

在上述代码中,`timer` 返回的是一个 `promise` 对象，过一秒之后才会执行 `resolve` 方法，`then` 会等到执行 `resolve` 方法的时候才会开始执行。

当然，`then` 和 `catch` 方法最后返回的都是一个新的 `promise`。

注意：

> `resolve` 只接收一个参数，如果想传多个参数，必须以对象或数组的形式传递，否则 `resolve` 只能获取到第一个参数。

明白了大致用法，现在我们来详细的了解 Promise。

## Promise 状态

一个 Promise 对象必然处于以下几种状态之一：

- **pending**：初始状态，既没有被 `resolve`，也没有被 `reject`。
- **fulfilled**：操作成功完成。
- **rejected**：抛出错误时。

一旦 Promise 的状态改变，就不会再变了，要么是 `fulfilled`，要么是 `rejected`，不会在两者之间切换。

### resolved & settled

你也许会听到有人说 **`resolved`** 或 **`settled`** 这些术语，很多人认为 `resolved` 等同于 `fulfilled`，这是错误的理解。

`settled` 不是一种状态，只是为了表达方便，它包含 `fulfilled` 和 `rejected`，因此它代表的是最终结果，一个 Promise 最终不是 `fulfilled` 就是 `rejected`。

而 `resolved` 则表示 Promise 对象处于 `settled` 状态，或者被锁定在了调用链中(意思是说一个 Promise 的最终状态受到调用链中其他 Promise 对象的状态的影响)。

如果想按照基本状态来讲可以这样区分：

1. 什么都没发生。
2. 被其他 Promise 对象锁住。
3. `fulfilled`
4. `rejected`

其中，`1,2` 为 `pending`，`3,4` 为 `settled`，`2,3,4` 为 `resolved`，`1` 为 `unresolved`。

具体说明请看[States and Fates](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md)

## Promise.resolve()

该方法接受一个参数，并返回一个将该参数解析后的 Promise 对象。

如果参数本身就是 Promise 对象，原封不动地返回：

```js
// 如果参数本身就是Promise对象，原封不动地返回
const a = new Promise(() => {})
const b = Promise.resolve(a)
console.log(a === b) // true
```

如果参数是一个带有 `then` 方法(thenable)的对象，会转换为 Promise 对象，状态为 pending：

```js
const a = {
  then(resolve, reject) {
    console.log('hello')
    resolve(123)
  },
}
Promise.resolve(a).then((res) => {
  console.log(res)
})
```

在上面的代码中，在执行 `Promise.resolve(a)` 时会执行 `a` 对象中的 `then` 方法输出 `'hello'`，然后执行自己的 `then` 方法输出 `123`。

:::tip Notice
所有 Promise 都是实现了 `then` 也就是 thenable 的对象，但并非所有 thenable 对象都是 Promise。
:::

如果参数是其他 JavaScript 值，则返回一个新的 Promise 对象，状态为 `fulfilled`：

```js
const a = Promise.resolve('Hello')
a.then((res) => {
  console.log(res) // hello
})
```

如果什么参数也没传，同样返回一个状态为 `fulfilled` 的新 Promise 对象。

`Promise.resolve('foo')` 等价于：

```js
new Promise((resolve) => resolve('foo'))
```

:::tip Notice
有关 Promise 的规范定义请看：[Promises/A+](https://promisesaplus.com/)
:::

## Promise.reject()

和 `resolve()` 方法不同，`Promise.reject()` 返回的 Promise 对象状态为 `rejected`。

`Promise.reject()` 接受一个值 `reason`，表示拒绝的原因：

```js
const a = Promise.reject('出错了')
// 等同于
const a = new Promise((resolve, reject) => reject('出错了'))

a.then(null, (reason) => {
  console.log(reason) // '出错了'
})
```

`reject` 方法不会将参数转换为 Promise，而是会原封不动的作为拒绝的原因。

## Promise.prototype.then()

`then` 方法返回一个**新的** Promise 对象，因此可以链式调用。

`then` 方法接受两个参数，成功和失败情况下的回调函数：

```js
// 输出 successful
new Promise((resolve, reject) => {
  resolve()
}).then(
  () => {
    console.log('successful')
  },
  () => {
    console.log('failed')
  }
)

// 输出 failed
new Promise((resolve, reject) => {
  reject()
}).then(
  () => {
    console.log('successful')
  },
  () => {
    console.log('failed')
  }
)
```

在链式调用中，后面的 `then` 方法可以接受前一个 `then` 的回调函数所返回的值：

```js
Promise.resolve('info')
  .then((res) => {
    console.log(res) // 'info'
    return 'then1'
  })
  .then((res) => {
    console.log(res) // 'then1'
  })
```

## Promise.prototype.catch()

`catch` 方法用于捕获 Promise 执行时所产生的错误。

实际上，`catch` 相当于 `.then(null, rejection)` 的别名。

```js
Promise.resolve()
  .then((res) => {
    throw new Error('This is an error')
  })
  .catch((err) => {
    console.log(err)
  })
```

这个时候 `catch` 捕获到了上面 `then` 方法接受的回调函数抛出的错误。

但 `catch` 只能捕获到在它前面的那些 Promise 抛出的错误，而不能捕获到后面的：

```js
Promise.resolve()
  .then((res) => {
    return 'then1'
  })
  .catch((err) => {
    console.log(err)
  })
  .then((res) => {
    throw new Error('This is an error')
  })
  .catch((err) => {
    console.log(err) // 捕获到错误 'This is an error'
  })
```

另外，如果在当前 Promise 状态已经转换为 `fulfilled` 之后再抛出错误是无效的：

```js
new Promise((resolve, reject) => {
  resolve() // 状态转换为fulfilled
  throw new Error('This is an error') // 无效
}).catch((err) => {
  console.log(err) // 不会捕获到错误
})
```

`catch` 的回调函数本身也可以抛出错误，然后被后面的 `catch` 所捕获：

```js
Promise.reject()
  .catch(() => {
    throw new Error('This is an Error')
  })
  .then(() => {
    console.log('This is then1') // 不会执行该回调函数，因为前面的catch抛出了错误
  })
  .catch((err) => {
    console.log(err) // 捕获到前面catch抛出的错误This is an Error
  })
  .then(() => {
    console.log('This is then2') // 继续执行，输出This is then2
  })
```

## Promise.all()

如果想要实现当所有 `promise` 状态都为 `fulfilled` 或者 `rejected` 的时候再执行下一个 `then` 或者 `catch`，那就要用到 `Promise.all()`。

```javascript
let start = Date.now()
function timer(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, num)
  })
}
Promise.all([timer(100), timer(200), timer(300)]).then(() => {
  console.log(Date.now() - start)
})
```

结果如下：  
<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/5c826954c1e7c.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/5c826954c1e7c.jpg)</a>

可以看到输出的是 `303`，至于为什么不是 `300`，可能是因为执行其他命令也需要消耗时间，总之 `Promise.all()`方法做到了执行完三个 `timer` 再执行 `then`。

`Promise.all()` 方法接受的参数不一定非要是数组，只要是可迭代的(具有 Iterator 属性) 对象，且返回的每个成员都是 Promise 实例就可以。

当数组中所有 Promise 的状态都变成 `fulfilled`，`a` 的状态才会变成 `fulfilled`，之后会返回一个包含每个 Promise 的结果的数组：

```js
function timer(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num)
    }, num)
  })
}
const a = Promise.all([timer(100), timer(200), timer(300)]).then((res) => {
  console.log(res) // [100, 200, 300]
})
```

如果传入的 Promise 中其中一个遭到拒绝(`rejected`)，`Promise.all` 会将被拒绝的 Promise 的结果返回，而不管其他 `Promise` 是否完成。

```js
function timer(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(num)
    }, num)
  })
}
Promise.all([timer(100), timer(200), timer(300)]).catch((res) => {
  console.log(res) // 100
})
```

## Promise.race()

`Promise.race()`和 `Promise.all()`其实非常相似，不同的地方在于 `all` 要求的是所有 `Promise` 的状态都要变为 `fulfilled` 或者 `rejected` 的时候才会执行下一步的 `then` 或者 `catch`,但是 `race` 要求的是只要有一个 `Promise` 状态变为 `fulfilled` 或 `rejected` 就会进行后续操作，在进行后续操作的同时，如果前面传入的一些 `Promise` 的状态还没有变为 `fulfilled` 或 `rejected`，不会阻止这些 `Promise` 的执行。

```javascript
let start = Date.now()
function timer(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num)
    }, num)
  })
}
Promise.race([timer(100), timer(200), timer(300)]).then((num) => {
  console.log(num)
})
```

输出结果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/5c826954c1e7c.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/5c826954c1e7c.jpg)</a>

因为 `timer(100)`最先执行完，`Promise` 状态变为 `fulfilled`，执行 `then` 操作，最后输出的是 `100`。

## Promise.finally

该方法返回一个 Promise 对象，在当前 promise 结束时，无论结果是 `fulfilled` 还是 `rejected`，都会执行指定的回调函数。

考虑如下情况：

```js
new Promise((resolve, reject) => {
  // do something
  resolve() // or reject()
})
  .then(() => {
    // do something
  })
  .catch((err) => {
    // do something
  })
  .finally(() => {
    console.log(123)
  })
```

无论我们是执行 `Promise.resolve()` 还是 `Promise.reject()`，最后都会进入到 `finally` 回调函数中进行最后处理。

因此，如果你想在请求无论成功与否都要做一些处理时，可以使用 `finally`。

`finally` 的回调函数不接受任何参数，因此也就无法得知前面的 Promise 的状态。`finally` 方法总是会返回原来的值，它其实类似于：

```js
Promise.resolve().then(
  (res) => {
    return res
  },
  (err) => {
    throw err
  }
)
```

## 参考文章

- [Promises/A+](https://promisesaplus.com/)
- [阮一峰 ECMAScript 6 (ES6) 标准入门教程 第三版](https://www.bookstack.cn/read/es6-3rd/spilt.11.docs-promise.md)
- [ES6 之 promise(resolve 与 reject)](https://www.jianshu.com/p/b511bfc58ae9)
