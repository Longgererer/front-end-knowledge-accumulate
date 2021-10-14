---
tags:
  - eventLoop
---

# EventLoop

## 什么是 Event Loop

关于 Event Loop 的定义，MDN 上对其进行了解释：

> JavaScript has a concurrency model based on an event loop, which is responsible for executing the code, collecting and processing events, and executing queued sub-tasks.

大意为：Event Loop 是一个基于**事件循环**的并发模型，事件循环负责执行代码、收集和处理事件以及执行队列中的子任务。

具体是什么呢？这就要说说**执行栈**和**事件队列**了：

执行栈也被叫做调用栈，既然是栈，当然是遵循先进后出，后进先出的顺序，这个执行栈用于**储存代码在执行期间创建的所有执行上下文**。

我们可以用一小段代码来更好地解释执行栈：

```javascript
function a() {
  console.log('123')
  b()
}
function b() {
  console.log('456')
}
a()
```

这段代码执行的时候，执行栈中发生了这些事情：

- 首先执行函数 a，a 入栈
- 执行`console.log('123')`，`console.log('123')`入栈
- `console.log('123')`出栈，执行函数 b，b 入栈
- 执行`console.log('456')`，`console.log('456')`入栈
- `console.log('456')`出栈
- 函数 b 出栈
- 函数 a 出栈

配合 gif 食用更好理解：

<a data-fancybox title="GIF.gif" href="http://picstore.lliiooiill.cn/FdoiGN4ckPnzxVO.gif">![GIF.gif](http://picstore.lliiooiill.cn/FdoiGN4ckPnzxVO.gif)</a>

以上的结果是在执行同步代码的情况下，如果是执行异步代码就不是这样子了，因为异步是非阻塞的，所以它们会被挂起放到特定队列中，也就是**事件队列**，继续执行执行栈中的其他同步任务，等待同步任务执行完毕，执行栈空了，才会将队列中的异步事件依次取出入栈执行。

## 单线程的 JavaScript

所谓的 “JavaScript 是单线程的” 并不是说 JavaScript 和单线程多线程有任何关系，而是说 JavaScript 运行的环境决定了它是已单线程的形式运行的。

H5 中有一个新特性 Web worker，虽然可以新开辟一个新线程，但这个线程仍然只是依托在主线程下面的子线程，并且不可以操作 dom 结点以及文件访问，只能进行运算和 AJAX 请求（子线程和主线程的异步请求都共用同一个 Event Loop），因此这只是个模拟出来的多线程，不代表 JavaScript 真的是以多线程形式运行。

## 详解 Event Loop

把该了解的都了解了，就要进入正题了：异步代码是按照什么顺序执行的？

异步和同步不同，显然不是按照从上到下的顺序依次执行，来看看下面的代码：

```javascript
console.log('start')
setTimeout(() => {
  console.log('console')
}, 1000)
console.log('end')
```

不用我说，输出顺序是 `start end console`，代码执行中发生了这些事情：

- `console.log('start')` 压入栈中执行，执行完出栈
- `setTimeout` 入栈，这时浏览器的**定时触发线程**开始计时
- `console.log('end')` 压入栈中执行，执行完出栈
- 1000 毫秒计时结束，将回调函数放到事件队列中
- 检查执行栈中是否为空，执行栈为空，将事件队列中的回调函数取出放入执行栈执行，执行完出栈

<a data-fancybox title="GIF.gif" href="http://picstore.lliiooiill.cn/qD3ioK21lHRxVbz.gif">![GIF.gif](http://picstore.lliiooiill.cn/qD3ioK21lHRxVbz.gif)</a>

综上所述，我们可以得知这个定时器里的 1000，并不代表程序运行 1000 毫秒后会准时执行回调函数，而是将回调放到事件队列中而已，真正执行回调的延迟时间肯定大于 1000 毫秒。

明白了这个道理，`setTimeout(()=>{}, 0)` 我们也能明白就是在执行栈为空的时候立即执行回调，而不是一运行程序就马上执行回调。

### 宏任务和微任务

我们知道，异步回调会被放入事件队列中，实际上，事件队列分为两种：**宏任务**(macro-task)队列和**微任务**(micro-task)队列，来看看常见异步任务对应的队列：

**宏任务**：

- script 整体代码
- setTimeout
- setInterval
- I/O
- dom 绑定事件
- postMessage
- MessageChannel
- requestAnimationFrame
- setImmediate(node.js)

**微任务**：

- Promise.then
- Object.observe(废弃)
- MutaionObserver
- process.nextTick(node.js)

那么宏任务和微任务的执行顺序又是如何呢？

```javascript
console.log('start')
setTimeout(function() {
  console.log('setTimeout')
}, 0)
new Promise(function(resolve) {
  console.log('newPromise')
  resolve()
}).then(function() {
  console.log('then')
})
console.log('end')
```

输出顺序：`start newPromise end then setTimeout`。

简要说下大致执行流程：

- 执行宏任务(整个 script)
- 输出 start
- 将 setTimeout 回调放入宏任务队列
- 输出 newPromise
- 将 promise.then 回调放入微任务队列
- 输出 end
- 第一轮结束，检查微任务队列是否为空
- 执行所有微任务
- 输出 then
- 第二轮结束，检查宏任务队列是否为空
- 执行所有宏任务
- 输出 setTimeout

<a data-fancybox title="GIF.gif" href="http://picstore.lliiooiill.cn/sBJuhIkD8Wv9XoK.gif">![GIF.gif](http://picstore.lliiooiill.cn/sBJuhIkD8Wv9XoK.gif)</a>

由此可得知，宏任务先于微任务执行，注意：**每执行完一个宏任务，都要检查微任务队列是否为空，否则执行所有微任务**，也就是说，微任务是一个接一个执行的，宏任务是一个一个分开执行的(这样说可能有点别扭，但我一时想不出更好的解释(＠\_＠;))。

> 有一些人认为微任务的优先级是高于宏任务的，这是因为他们忽略了整体 script，实际上整个 script 也是一个宏任务，在执行任何一个 script 文件的时候，js 引擎都会将内容包装在函数中，并将该函数与 start 或 start 事件关联，这个事件将被添加到宏任务中。

#### 优先级

既然宏任务先于微任务执行，那么宏任务之间，微任务之间是否也有优先级呢？

答案是有！！！

**宏任务优先级**：

script 整体代码 > setImmediate > MessageChannel > setTimeout / setInterval

**微任务优先级**：

process.nextTick > Promise > MutationObserver

#### setTimeout 和 setImmediate 孰先孰后

我们说 setImmediate 优先级是高于 setTimeout，那为什么还要讨论呢，我们来看看下面的代码：

```javascript
setTimeout(() => {
  console.log('end')
})
setImmediate(() => {
  console.log(789)
})
```

按照优先级排序，答案很明显是先输出 789，后输出 end，然鹅：

<a data-fancybox title="1606192520.png" href="http://picstore.lliiooiill.cn/GIDE7RPl4MUKAJy.png">![1606192520.png](http://picstore.lliiooiill.cn/GIDE7RPl4MUKAJy.png)</a>

没错，我运行了两遍，因为第一次执行得出的结果和我预想的不同，执行第二次我发现 setImmediate 和 setTimeout 的回调执行顺序完全是随机的！

这是为什么呢？来看看 node 官方文档的解释：

> For example, if we run the following script which is not within an I/O cycle (i.e. the main module), the order in which the two timers are executed is non-deterministic, as it is bound by the performance of the process

意思是说，如果我们**直接在主模块下面直接调用这两个方法，其回调执行顺序是随机的**，因为这受到了进程性能的限制(这可能会受到计算机上运行的其他应用程序的影响)，但如果我们在一个 I/O 周期内调用这两个方法，那么就符合 setImmediate>setTimeout 这个说法：

```javascript
const fs = require('fs')
fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0)
  setImmediate(() => {
    console.log('immediate')
  })
})
```

## 练习

现在我们来看这段比较长的代码巩固一下知识：

```javascript
console.log('start')
setTimeout(() => {
  console.log('timer1')
  new Promise((resolve) => {
    console.log('promise1')
    resolve()
  }).then(() => {
    setTimeout(() => {
      console.log('then1')
    })
  })
})
new Promise((resolve) => {
  console.log('promise2')
  setTimeout(() => {
    resolve()
  })
}).then(() => {
  console.log('then2')
})
process.nextTick(() => {
  console.log('process1')
})
console.log('end')
```

来分析分析：

- 首先输出 `start`
- 第一个 setTimeout 简称 Timer1 的回调进入了宏任务队列
- 输出 `promise2`
- 第二个 setTimeout 简称 Timer2 的回调进入了宏任务队列
- process.nextTick 的回调进入了微任务队列
- 输出 `end`

至此第一轮循环结束，开始第二轮，检测微任务队列：process.nextTick

- process.nextTick 入栈，输出`process1`

微任务队列清空，检测宏任务队列：Timer1，Timer2

- Timer1 入栈，输出`timer1`
- 输出 `promise1`
- 第一个 promise.then 简称 Then1 的回调进入了微任务队列

检测微任务队列：Then1

- Then1 入栈，第三个 setTimeout 简称 Timer3 的回调进入了宏任务队列

微任务队列清空，检测宏任务队列：Timer2，Timer3

- Timer2 入栈，第二个 promise.then 简称 Then2 的回调进入了微任务队列

检测微任务队列：Then2

- Then2 入栈，输出`then2`

微任务队列清空，检测宏任务队列：Timer3

- Timer3 入栈，输出`then1`

完整的输出为：

```bash
start
promise2
end
process1
timer1
promise1
then2
then1
```

:::tip Notice
以上所有例子的输出结果都是在 node12 的环境下运行，老版本可能输出结果会不一样。
:::

## node 中的 EventLoop

```javascript
setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)
```

对于 node11 之前的版本，执行过程是这样的：

1. 理想情况下这个就是一开始将两个 `setTimeout` 放进 `timers` 的阶段。
2. 等到时间到达后运行 `timer1`，把 `promise1` 的 `Promise` 放入 `timers` 的下一阶段微任务队列中，同理继续运行 `timers` 的阶段，执行 `timer2`，把 `promise2` 的 `Promise` 放入 `timers` 的下一阶段微任务队列中。
3. 直到 `timers` 队列全部执行完，才开始运行微任务队列，也就是 `promise1` 和 `promise2`。

node11 开始 EventLoop 行为与浏览器趋同。

就是 node10 只有全部执行了 `timers` 阶段队列的全部任务才执行微任务队列，而浏览器只要执行了一个宏任务就会执行微任务队列。

## 扩展

### requestAnimationFrame

我们在上面的内容里主要关注的是任务队列中回调的执行顺序，但实际上在 JS 线程执行完之后，浏览器**可能**会进行 GUI 渲染，之所以说可能，是因为**每次执行完宏任务并不一定进行 GUI 渲染**，每次进行 GUI 渲染的间隔为 16ms 左右，因为浏览器刷新频率为 60HZ，1000/60≈16ms。

requestAnimationFrame 简称 RAF，其作用就是让浏览器流畅的执行动画效果，在进行 GUI 渲染的时候，就需要用到 RAF，RAF 执行完后，在进行重绘。

使用 requestAnimationFrame 坐帧动画往往比 setTimeout 更具效率，性能更高。

## chrome73 更新

我们看以下代码：

```javascript
console.log('script start')
async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end')
}
async1()
setTimeout(function() {
  console.log('setTimeout')
}, 0)
new Promise((resolve) => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })
console.log('script end')
```

按照现在的思维，你可能会想：`async await` 就是一个语法糖，其实就是 `promise.then`，因此最先将 `await` 回调函数放入 microtask 队列，所以 `async1` 比 `promise1,promise2` 更先输出。

实际上恰好相反，`promise1,promise2` 才是更先输出的。

在 73 以下版本，首先，传递给 `await` 的值被包裹在一个 `Promise` 中。然后，处理程序附加到这个包装的 `Promise`，以便在 `Promise` 变为 `fulfilled` 后恢复该函数，并且暂停执行异步函数，一旦 `promise` 变为 `fulfilled`，恢复异步函数的执行。
每个 `await` 引擎必须创建两个额外的 `Promise`（即使右侧已经是一个 `Promise`）并且它需要至少三个 microtask 队列 `ticks`（`tick` 为系统的相对时间单位，也被称为系统的时基，来源于定时器的周期性中断（输出脉冲），一次中断表示一个 `tick`，也被称做一个“时钟滴答”、时标。）。

比如下面这个代码：

```javascript
async function f() {
  await 123
  console.log('ok')
}
```

会被解析成类似这样：

```javascript
// 73以下
function f() {
  return new Promise((resolve) => {
    resolve(123)
  })
    .then()
    .then(() => {
      console.log('ok')
    })
}
// 73以上
function f() {
  return Promise.resolve(123).then(() => {
    console.log('ok')
  })
}
```

- 如果 `RESOLVE(p)` 对于 `p` 为 `promise` 直接返回 `p` 的话，那么 `p` 的 `then` 方法就会被马上调用，其回调就立即进入 `job` 队列。
- 而如果 `RESOLVE(p)` 严格按照标准，应该是产生一个新的 `promise`，尽管该 `promise` 确定会 `resolve` 为 `p`，但这个过程本身是异步的，也就是现在进入 `job` 队列的是新 `promise` 的 `resolve` 过程，所以该 `promise` 的 `then` 不会被立即调用，而要等到当前 `job` 队列执行到前述 `resolve` 过程才会被调用，然后其回调（也就是继续 `await` 之后的语句）才加入 `job` 队列，所以时序上就晚了。

## 使用工具

[loupe 查看执行栈和事件队列工具](http://latentflip.com/loupe/)

## 参考文章

- [Concurrency model and the event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [【译】理解 Javascript 执行上下文和执行栈](https://zhuanlan.zhihu.com/p/48590085)
- [详解 JavaScript 中的 Event Loop（事件循环）机制](https://zhuanlan.zhihu.com/p/33058983)
- [js 中的宏任务与微任务](https://zhuanlan.zhihu.com/p/78113300)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout)
- [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.cn/post/6844903512845860872)
- [一次弄懂 Event Loop（彻底解决此类面试问题）](https://zhuanlan.zhihu.com/p/55511602)
