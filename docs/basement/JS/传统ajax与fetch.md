# 传统 ajax 与 fetch

Ajax 英文全称为 `Asynchronous JavaScript + XML` ，翻译过来就是异步 JavaScript 和 XML。

它是用来描述一种使用现有技术集合的“新”方法的，这里的“新”方法主要涉及到: HTML 或 XHTML、CSS、 JavaScript、DOM、XML、XSLT，以及最重要的 **XMLHttpRequest**。

因此 Ajax 并不指代某项技术。

## 传统 ajax

传统 ajax 就是通过 `XMLHttpRequest` 进行异步请求的，分为 4 个步骤：

```js
function ajax(url, fnSucc, fnFaild) {
  // 1.创建XHR实例
  const oAjax = new XMLHttpRequest()
  // 2.连接服务器（打开和服务器的连接）
  oAjax.open('GET', url, true)
  // 3.发送
  oAjax.send()
  // 4.接收
  oAjax.onreadystatechange = () => {
    if (oAjax.readyState === 4) {
      if (oAjax.status === 200) {
        // 成功
        fnSucc(oAjax.responseText)
      } else {
        // 失败
        if (fnFaild) {
          fnFaild()
        }
      }
    }
  }
}
```

`readyState` 有 5 种状态，由数字 `0-4` 表示，分别为：

1. `unsent`：XHR 对象已经构建。
2. `opened`：`open` 方法已成功调用。在此状态期间，可以使用设置请求标头 `setRequestHeader()`，并且可以使用该 `send` 方法启动获取。
3. `headers received`：已遵循所有重定向（如果有）并且已收到响应的所有标头。
4. `loading`：正在接收响应正文。
5. `done`：数据传输已完成或传输过程中出现问题（例如，无限重定向）。

如果请求过程中想要停止请求，可以使用：

```js
oAjax.abort()
```

传统 ajax 的优势在于：

1. 兼容性好。
2. 页面局部刷新，优化了用户体验，也减少了服务器的压力。

## fetch

实际上 `fetch` 也是 `ajax` 的一种，只不过传统 `ajax` 以 XHR 为核心。

`fetch` 是全局 `window` 的一个方法，它的主要使用 `promise` 语法来处理结果/回调。

请注意，`fetch` 规范与传统 `ajax` 主要有以下的不同：

当接收到一个代表错误的 HTTP 状态码时，从 `fetch()` 返回的 `Promise` 不会被标记为 `reject`，即使响应的 HTTP 状态码是 404 或 500。相反，它会将 `Promise` 状态标记为 `resolved` (如果响应的 HTTP 状态码不在 200 - 299 的范围内，则设置 `resolved` 返回值的 `ok` 属性为 `false` )，仅当网络故障时或请求被阻止时，才会标记为 `reject`。

`fetch` 不会发送跨域 `cookies`，除非在初始化选项中使用 `credentials` 添加相应的配置才可以。

`fetch` 常用于对外部资源内容的请求。

`fetch` 自身并没有提供中止请求的方法。但是部分浏览器有实现 `AbortController`，可以通过 `AbortController` 中止 `fetch` 请求：

```js
const controller = new AbortController()
const signal = controller.signal
setTimeout(() => controller.abort(), 5000)

fetch('/api/user/CaiCai', {
  signal, // 在option中加入signal
  method: 'POST',
  // credentials:'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'CaiCai',
    age: '26',
  }),
})
  .then((res) => {
    return res.json()
  })
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })
```

`fetch` 相比传统 ajax 优势如下：

1. `fetch` 返回的是 `promise` 对象，比 `XMLHttpRequest` 的实现更简洁，`fetch` 使用起来更简洁，完成工作所需的实际代码量也更少。
2. `fetch` 可自定义是否携带 `Cookie`。
3. `fetch` 的兼容性也越来越好了。
4. `fetch` 自身并没有提供 `abort` 的方法，需要 `AbortController` 去处理中止，并且 `AbortController` 的兼容性不太好。

## 参考文章

- [Fetch 入门](https://juejin.cn/post/6844903741057925128)
- [有同学问我：Fetch 和 Ajax 有什么区别？](https://juejin.cn/post/6997784981816737800)
- [使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
- [3.4. States](https://xhr.spec.whatwg.org/#handler-xhr-onreadystatechange)
