# Web Workers

Web Workers 让 JavaScript 多线程变成了可能，线程可以执行任务而不干扰用户界面

使用 Worker 有如下限制：

- 不能直接操作 DOM 节点
- 不能使用 window 对象的默认方法和属性，但仍然可以使用很多如 WebSockets，IndexedDB 等数据存储机制，和其他属性，也可以发起 ajax 请求
- Worker 运行的脚本文件**必须与主线程脚本同源**
- Worker 线程**无法读取本地文件**

Worker 所运行的脚本必须保存在一个独立的文件中

```javascript
const worker = new Worker('test.js')
```

如果指定文件存在，在这个网络文件下载并执行之前，是不会创建 Worker 的，如果 Worker 路径返回 404，就不会创建 Worker，但不会有任何提示

```javascript
worker.postMessage()
```

Worker 同样需要 postMessage 的方式来启动

postMessage 方法的参数，就是主线程传给 Worker 的数据，可以是各种数据类型，包括二进制

```javascript
worker.onmessage = (res) => {
  callback(res)
}
function callback(res) {
  console.log(res)
}
```

主线程通过 worker.onmessage 指定监听的函数，接受子线程发回来的消息

Worker 完成任务以后，主线程就可以把它关掉

```javascript
worker.terminate()
```

Worker 线程的文件内，需要有一个监听函数监听 message 事件

self 代表子线程的全局对象

```javascript
self.addEventListener(
  'message',
  (e) => {
    self.postMessage(e.data)
  },
  false
)
```

Worker 可以根据主线程发来的信息判断自己要做什么：

```javascript
self.addEventListener(
  'message',
  (e) => {
    switch (e.data.cmd) {
      case 'start':
        self.postMessage(data.msg)
        break
      case 'stop':
        self.close() // 关闭自身
    }
  },
  false
)
```

Worker 自己也可以加载脚本

```javascript
importScripts('a.js') // 单个脚本
importScripts('a.js', 'b.js') // 多个脚本
```

Worker 如果运行出错，会触发自身的 onerror 事件，主线程可以监听该事件

```javascript
worker.onerror((event) => {
  // ...
})
// 或者
worker.addEventListener('error', (event) => {
  // ...
})
```

之所以说 Worker 接受的是任何可靠本数据类型是因为传递数据传的是拷贝的值而不是地址，这样 Worker 内部的修改不会影响到主线程

主线程与 Worker 之间也可以交换二进制数据，比如 File、Blob、ArrayBuffer 等类型

JavaScript 允许主线程把二进制数据直接转移给子线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面，这使得主线程可以快速把数据交给 Worker，不会产生性能负担

当然，Worker 载入的也可以是同一个网页的代码

```html
<script id="worker" type="app/worker">
  addEventListener('message', function () {postMessage('some message')}, false)
</script>
```

```javascript
const blob = new Blob([document.querySelector('#worker').textContent])
const url = window.URL.createObjectURL(blob)
const worker = new Worker(url)
worker.onmessage = function (e) {
  // ...
}
```

先将嵌入网页的脚本代码，转成一个二进制对象，然后为这个二进制对象生成 URL，再让 Worker 加载这个 URL。这样就做到了，主线程和 Worker 的代码都在同一个网页上面

注意，script 标签的 type 属性必须要是浏览器不认识的值，否则这段脚本就会被执行

## Worker 线程完成轮询

有时，浏览器需要轮询服务器状态，以便第一时间得知状态改变。这个工作可以放在 Worker 里面

```javascript
function createWorker(f) {
  var blob = new Blob(['(' + f.toString() +')()']);
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
}
var pollingWorker = createWorker(function (e) {
  var cache;
  function compare(new, old) { ... };
  setInterval(function () {
    fetch('/my-api-endpoint').then(function (res) {
      var data = res.json();
      if (!compare(data, cache)) {
        cache = data;
        self.postMessage(data);
      }
    })
  }, 1000)
});
pollingWorker.onmessage = function () {
  // render data
}
pollingWorker.postMessage('init');
```

## MessageChannel

简单来说，MessageChannel 创建了一个通信的管道，这个管道有两个口子，每个口子都可以通过 `postMessage` 发送数据，而一个口子只要绑定了 `onmessage` 回调方法，就可以接收从另一个口子传过来的数据。

MessageChannel 常用于渲染线程和多个 worker 线程之间的交流：

```js
var channel = new MessageChannel();
var para = document.querySelector('p');
var ifr = document.querySelector('iframe');
var otherWindow = ifr.contentWindow;

ifr.addEventListener("load", function () {
  otherWindow.postMessage('Hello from the main page!', '*', [channel.port2]);
}, false);

channel.port1.onmessage = function (e) {
  para.innerHTML = e.data;
}  
```
