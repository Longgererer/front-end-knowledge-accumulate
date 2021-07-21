# WebSocket

## 什么是 WebSocket

WebSocket 是 HTML5 WebSockets 规范定义的一种网络传输协议，它真正地实现了 TCP**全双工通信**。

在 WebSocket 中，客户端只需与服务器进行一次的“握手”来建立连接，因为 WebSocket 连接是持久连接，因而在连接建立后，客户端与服务端可以随时随地进行通信，进行双向数据传输。

WebSocket 协议与 HTTP 协议不同，这是为了实现兼容性，WebSocket 通过 HTTP 端口 80 和 443 进行工作，并支持 HTTP 代理和中介，还要在握手过程中需要使用 HTTP Upgrade 头部从 HTTP 协议更改为 WebSocket 协议，如：

```http
Connection: Upgrade
Upgrade: websocket
```

:::tip Notice
Upgrade 是 HTTP 协议提供的一种特殊机制，允许将已建立的连接升级成新的、不相容的协议；目前最常升级的协议就是 WebSocket。
:::

在与服务器建立连接成功后，HTTP 连接断开，由同样为链路层 I/O 协议的 WebSocket 连接代替。

## 为什么要使用 WebSocket

早期，很多网站为了实现推送技术，都采用**轮询**的方式，这种方式需要客户端不断地像服务端发出请求来查看是否有新的推送，这种方式带来的结果常常是消耗大量带宽只得到很少的数据。

:::tip Notice
所谓轮询指的是浏览器每隔一段时间向服务器发送 HTTP 请求，服务器返回数据给客户端。
:::

## WebSocket 的使用

使用 WebSocket 构造函数开启 WebSocket 连接：

```javascript
const socket = new WebSocket('ws://websocket.example.com')
```

:::tip Notice
WebSocket 的 url 采用 ws 方案，这是 WebSocket 连接的新网址架构，还有 wss 用于安全的 WebSocket 连接，等效于 HTTPS。ws 未加密默认端口为 80；wss 加密，默认端口为 443。
:::

现在来编写一个 Node.js 端的 WebSocket 来响应客户端：

```javascript
const WebSocketServer = require('websocket').server
const http = require('http')
// 创建http服务并监听端口8081
const server = http.createServer(() => {})
server.listen(8081, () => {})
// 创建websocket实例
const wsServer = new WebSocketServer({
  httpServer: server,
})
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin)
  connection.on('message', (message) => {
    // 处理客户端发来的数据
  })
  connection.on('close', (connection) => {
    // 连接断开
  })
})
```

当连接建立成功后，会触发客户端 WebSocket 的 `open` 事件：

```javascript
const socket = new WebSocket('ws://websocket.example.com')
socket.onopen = (event) => {
  console.log('Connection has been established successfully.')
}
```

除了 `onopen`，还有 `onerror`、`onmessage` 和 `onclose`：

```javascript
socket.onerror = (error) => {
  console.log(error)
}
socket.onmessage = (event) => {
  console.log(`message from server: ${event.data}`)
}
socket.onclose = (event) => {
  console.log('Connection has been closed successfully.')
}
```

使用 `send` 发送数据：

```javascript
socket.onopen = (event) => {
  socket.send('Hi')
}
```

这会触发服务端 WebSocket 的 `onmessage` 事件：

```javascript
connection.on('message', (event) => {
  console.log(event.data) // Hi
})
```

:::warning Notice
`send` 方法默认只能发送字符串、ArrayBuffer、Blob 和 ArrayBufferView，不能直接发送数组，键值对等等数据类型。
:::

## 数据帧

数据帧由控制帧和数据帧组成，协议如下：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/ws_data_frame.png">![](http://picstore.lliiooiill.cn/ws_data_frame.png)</a>

至于这里面的详细信息可以看看[websocket 协议帧解析](https://zhuanlan.zhihu.com/p/72289051)，这里只讲控制帧。

控制帧用于 WebSocket 协议交换状态信息，控制帧可以插在消息片段之间。

目前控制帧的操作码 opcode 定义了 oxo8(关闭帧)、oxo9(Ping 帧)、oxoA(Pong 帧)。

### 关闭帧

关闭帧中可能会包含内容来表示关闭的原因，如果终端在收到一个关闭帧之前没有发送一个关闭帧，那么终端必须发送一个关闭帧给予回应。

如果客户端和服务端同时发送了关闭帧，两个终端都会发送和接受到一个关闭帧，并且应该认为 WebSocket 连接已经关闭，同时关闭底层 TCP 连接。

### Ping 和 Pong 帧

如果收到了一个 Ping 帧，终端必须发送一个 Pong 帧进行回应，作为回应发送的 Pong 帧必须完整携带 Ping 帧中传过来的“应用数据”字段，除非已经收到了关闭帧，因此 Ping 和 Pong 用于检测远端是否仍然有应答。

### 心跳检测

WebSocket 为了保持客户端、服务端的实时双向通信，需要确保客户端、服务端之间的 TCP 通道保持连接没有断开。

这个时候需要使用心跳检测来实现：客户端每隔一段时间向服务端发送 Ping 帧，服务端发送 Pong 帧作为回应，表示连接正常。

## 参考文章

- [WebSocket-维基百科](https://zh.wikipedia.org/wiki/WebSocket)
- [About HTML5 WebSocket](https://www.websocket.org/aboutwebsocket.html)
- [WebSockets 简介：将套接字引入网络](https://www.html5rocks.com/zh/tutorials/websockets/basics/)
- [编写 WebSocket 服务器](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)