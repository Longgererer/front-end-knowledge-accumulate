# 一些重要 API 的实现

## `new`

`new` 操作符行为如下：

1. 创建一个全新的空对象。
2. 将对象的 `__proto__` 指向构造函数的 `prototype`。
3. 将构造函数的 `this` 绑定到该对象上并执行
4. 如果执行结果返回的是一个对象，就正常返回；如果不是就返回全新的对象。

```javascript
function customNew(constructor, ...args) {
  if (typeof constructor !== 'function') throw 'constructor is not a function'
  const obj = Object.create(constructor.prototype)
  // 等于
  // const obj = {}
  // obj.__proto__ = constructor.prototype
  const res = constructor.apply(obj, args)
  return res instanceof Object ? res : obj
}
```

## `Object.create()`

`Object.create` 接受两个参数：

1. `proto` 是需要继承的原型对象。
2. `propertiesObject` 是需要添加到原型对象中的属性集合。该属性遵从 `defineProperties` 第二个参数的格式。

在第一个参数为 `null` 的时候，`Object.create` 会返回一个没有 `__proto__` 属性(为 `null`)的对象。

在第一个参数不为 `null` 时，生成对象的 `__proto__` 就会指向传入的 `proto`。

```javascript
function customCreate(proto, propertiesObject = {}) {
  if (typeof proto !== 'object') throw 'Object prototype may only be an Object or null'
  const obj = {}
  obj.__proto__ = proto
  Object.defineProperties(obj, propertiesObject)
  return obj
}
```

## `instanceof`

`instanceof` 会检测左边的对象是否为右边对象的实例，实际上就是判断：

```javascript
left.__proto__ === right.prototype
```

并且会沿着原型链寻找。

```javascript
function F() {}
const obj = new F()
console.log(obj instanceof F) // true
console.log(obj instanceof Object) // true
```

因此我们需要利用循环沿着原型链向上寻找：

```javascript
function customInstanceof(left, right) {
  let proto = left.__proto__
  while (true) {
    if (proto === null) return false
    if (proto === right.prototype) return true
    proto = proto.__proto__
  }
}
```

## `Promise.all`

```js
Promise.customAll = function (promises) {
  /**
   * 将数组中的非Promise转换为Promise
   * 只要有一个Promise转换为rejected，返回该错误信息
   * 全部fulfilled，返回结果数组
   */
  return new Promise((resolve, reject) => {
    const result = []
    let count = 0
    promises.forEach((promise, index) => {
      const cpyPromise = promise
      if (Object.prototype.toString.call(cpyPromise).slice(8, -1) !== 'Object') {
        promise = new Promise((resolve) => {
          resolve(cpyPromise)
        })
      }
      promise.then(
        (res) => {
          result[index] = res
          count++
          if (count === promises.length) {
            resolve(result)
          }
        },
        (err) => {
          reject(err)
        }
      )
    })
  })
}
```

## compose

实现以下功能：

```js
function fn1(x) {
  return x + 1
}
function fn2(x) {
  return x + 2
}
function fn3(x) {
  return x + 3
}
function fn4(x) {
  return x + 4
}
const a = compose(fn1, fn2, fn3, fn4)
console.log(a(1)) // 1+4+3+2+1=11
```

实现如下：

```js
function compose(...fns) {
  return function (x) {
    return fns.reduce((acc, cur) => {
      return cur(acc)
    }, x)
  }
}
```

## 扁平化数组

```js
function flat(arr) {
  const result = []
  for (let item of arr) {
    if (Array.isArray(item)) {
      result.push(...flat(item))
    } else {
      result.push(item)
    }
  }
  return result
}
```

## `Promise.race`

```js
Promise.customRace = function (promises) {
  /**
   * 将数组中的非Promise转换为Promise
   * 只要有一个Promise的状态改变，就返回该Promise的结果
   */
  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      const cpyPromise = promise
      if (Object.prototype.toString.call(cpyPromise).slice(8, -1) !== 'Object') {
        promise = new Promise((resolve) => {
          resolve(cpyPromise)
        })
      }
      promise.then(
        (res) => {
          resolve(res)
        },
        (err) => {
          reject(err)
        }
      )
    })
  })
}
```

## `String.prototype.trim`

```js
String.prototype.customTrim = function () {
  return this.replace(/^\s+|\s+$/g, '')
  // or
  // return this.replace(/^\s+(.*?)\s+$/, '$1')
}
```

## DeepClone

```js
function deepClone(origin, target, hash = new WeakMap()) {
  //origin:要被拷贝的对象
  // 需要完善，克隆的结果和之前保持相同的所属类
  const target = target || {}

  // 处理特殊情况
  if (origin == null) return origin //null 和 undefined 都不用处理
  if (origin instanceof Date) return new Date(origin)
  if (origin instanceof RegExp) return new RegExp(origin)
  if (typeof origin !== 'object') return origin // 普通常量直接返回

  //  防止对象中的循环引用爆栈，把拷贝过的对象直接返还即可
  if (hash.has(origin)) return hash.get(origin)
  hash.set(origin, target) // 制作一个映射表

  // 拿出所有属性，包括可枚举的和不可枚举的，但不能拿到symbol类型
  const props = Object.getOwnPropertyNames(origin)
  props.forEach((prop, index) => {
    if (origin.hasOwnProperty(prop)) {
      if (typeof origin[prop] === 'object') {
        if (Object.prototype.toString.call(origin[prop]) == '[object Array]') {
          //数组
          target[prop] = []
          deepClone(origin[prop], target[prop], hash)
        } else if (Object.prototype.toString.call(origin[prop]) == '[object Object]') {
          //普通对象
          target[prop] = {}

          deepClone(origin[prop], target[prop], hash)
        } else if (origin[prop] instanceof Date) {
          // 处理日期对象
          target[prop] = new Date(origin[prop])
        } else if (origin[prop] instanceof RegExp) {
          // 处理正则对象
          target[prop] = new RegExp(origin[prop])
        } else {
          //null
          target[prop] = null
        }
      } else if (typeof origin[prop] === 'function') {
        const _copyFn = function (fn) {
          const result = new Function('return ' + fn)()
          for (let i in fn) {
            deepClone[(fn[i], result[i], hash)]
          }
          return result
        }
        target[prop] = _copyFn(origin[prop])
      } else {
        //除了object、function，剩下都是直接赋值的原始值
        target[prop] = origin[prop]
      }
    }
  })

  // 单独处理symbol
  const symKeys = Object.getOwnPropertySymbols(origin)
  if (symKeys.length) {
    symKeys.forEach((symKey) => {
      target[symKey] = origin[symKey]
    })
  }
  return target
}
```

## `setInterval`

```js
const customSetInterval = (callback, delay, ...args) => {
  let timerId = null
  const func = () => {
    timerId = setTimeout(
      () => {
        func()
        callback()
      },
      delay,
      ...args
    )
  }
  func()
  return () => clearTimeout(timerId)
}
```

## `setTimeout`

```js
const customSetTimeout = (callback, delay, ...args) => {
  let timerId = null
  timerId = setInterval(
    () => {
      callback()
      clearInterval(timerId)
    },
    delay,
    ...args
  )
  return () => clearInterval(timerId)
}
```

## 判断循环引用

```js
const isCyclic = (obj) => {
  let stackSet = new Set()
  let detected = false
  const detect = (obj) => {
    if (obj && typeof obj != 'object') {
      return
    }
    if (stackSet.has(obj)) {
      return (detected = true)
    }
    stackSet.add(obj)
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        detect(obj[key])
      }
    }
    stackSet.delete(obj)
  }
  detect(obj)
  return detected
}
```

## 并行限制的 Promise

JS 实现一个带并发限制的异步调度器 `Scheduler`，保证同时运行的任务最多有两个。

```js
class Scheduler {
  constructor() {
    this.queue = []
    this.maxCount = 2
    this.runCount = 0
  }
  // promiseCreator执行后返回的是一个Promise
  add(promiseCreator) {
    // 小于等于2，直接执行
    this.queue.push(promiseCreator)
    this.runQueue()
  }

  runQueue() {
    // 队列中还有任务才会被执行
    if (this.queue.length && this.runCount < this.maxCount) {
      // 执行先加入队列的函数
      const promiseCreator = this.queue.shift()
      // 开始执行任务 计数+1
      this.runCount += 1

      promiseCreator().then(() => {
        // 任务执行完毕，计数-1
        this.runCount -= 1
        this.runQueue()
      })
    }
  }
}

const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

const scheduler = new Scheduler()

const addTask = (time, order) => {
  scheduler.add(() => timeout(time).then(() => console.log(order)))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
```

## 发布订阅模式

```js
class EventEmitter {
  constructor() {
    this.events = {}
  }
  // 事件监听
  on(evt, callback, ctx) {
    if (!this.events[evt]) {
      this.events[evt] = []
    }
    this.events[evt].push(callback)
    return this
  }
  // 发布事件
  emit(evt, ...payload) {
    const callbacks = this.events[evt]
    if (callbacks) {
      callbacks.forEach((cb) => cb.apply(this, payload))
    }
    return this
  }
  // 删除订阅
  off(evt, callback) {
    // 啥都没传，所有的事件都取消
    if (typeof evt === 'undefined') {
      delete this.events
    } else if (typeof evt === 'string') {
      // 删除指定事件的回调
      if (typeof callback === 'function') {
        this.events[evt] = this.events[evt].filter((cb) => cb !== callback)
      } else {
        // 删除整个事件
        delete this.events[evt]
      }
    }
    return this
  }
  // 只进行一次的事件订阅
  once(evt, callback, ctx) {
    const proxyCallback = (...payload) => {
      callback.apply(ctx, payload)
      // 回调函数执行完成之后就删除事件订阅
      this.off(evt, proxyCallback)
    }
    this.on(evt, proxyCallback, ctx)
  }
}
```

## 防抖

```js
const debounce = function (func, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
```

## 节流

```js
const throttle = function (func, delay) {
  let timer = null
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args)
        timer = null
      }, delay)
    }
  }
}
```

## 柯里化

```js
const curry = (func, ...args) => {
  const fnLen = func.length
  return function (...innerArgs) {
    innerArgs = args.concat(innerArgs)
    if (innerArgs.length < fnLen) {
      return curry(func, ...innerArgs)
    } else {
      func.apply(this, innerArgs)
    }
  }
}
```
