# WEB 安全及防护原理

## XSS

XSS(Cross-site scripting)，跨站脚本攻击。

攻击者想尽一切办法将可执行的脚本注入到网页中，而恶意代码未经过滤，导致恶意脚本被执行。

### XSS 常见攻击场景

1. 在可以输入的地方植入 js 代码。
2. 在 url 后拼接 js 代码。

攻击者可以直接引用外部脚本来进行攻击，因此对输入框进行长度限制不能解决问题。

### XSS 攻击类型

#### 存储型 server

常见于带有用户保存数据的网站功能，攻击者通过可输入区域来注入恶意代码，如论坛发帖、商品评论、用户私信等。

**攻击步骤：**

1. 攻击者将恶意代码**提交到目标网站的数据库**中。
2. 用户打开目标网站时，服务端将恶意代码从数据库中取出来，拼接在 HTML 中返回给浏览器(因为用户之间是可以相互看到帖子、评论等的)。
3. 用户浏览器在收到响应后解析执行，混在其中的恶意代码也同时被执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，攻击者可以以此冒充用户行为。

#### 反射型 server

反射型与存储型不同，是将代码拼接在 url 上的。

由于这需要用户主动打开 url 才能生效，攻击者往往会使用各种手段诱导用户点击。

场景：通过 url 传递参数的功能，如搜索等。

**攻击步骤：**

1. 攻击者构造出**特殊的 url**，其中包含恶意代码。
2. 用户打开带有恶意代码的 url，网站服务端将恶意代码从 url 中取出，拼接在 html 中返回给服务器。
3. 用户浏览器接收到响应后解析，恶意代码也会被解析。
4. 恶意代码获取用户数据并发到攻击者的网站，攻击者可以以此冒充用户行为。

#### DOM 型 Browser

DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端自身的安全漏洞，其他两种属于服务器端。

场景：通过 url 传递参数的功能，如搜索，跳转等。

**攻击步骤：**

1. 攻击者构造出**特殊的 url**，其中包含恶意代码。
2. 用户打开带有恶意代码的 url。
3. 用户浏览器接收到响应后解析，前端 JavaScript 取出 url 中的恶意代码并执行。
4. 恶意代码获取用户数据并发到攻击者的网站，攻击者可以以此冒充用户行为。

我们可以模拟一下 DOM 型 XSS 攻击：

```html
<a href="" id="search">搜索</a>
<script>
  const a = document.querySelector('#search')
  const queryObj = {}
  const search = window.location.search
  search.replace(/([^&=?]+)=([^&]+)/g, (_, $1, $2) => (queryObj[$1] = decodeURIComponent($2)))
  a.href = queryObj.redirectUrl
</script>
```

然后就可以在 url 中添加 `redirectUrl` 参数了。比如 `redirectUrl=javascript:alert('你被攻击了！')`。

这时候我们点击 `a` 链接就发现已经被攻击了。如果恶意代码太多，攻击者还可以直接创建 `script` 并引入外部 js 文件达到攻击效果。

通过植入外部的 js 文件，攻击者可以轻松的获取 `cookie` 和 `webStorage` 中的信息，进而冒充用户身份。

### 防止 XSS 攻击

为了防止 XSS 攻击，我们需要防止攻击者提交恶意代码，并且防止浏览器执行恶意代码。

1. 对数据进行严格的输出编码：如 HTML 元素的编码，JS 编码，CSS 编码，URL 编码等等。避免对 HTML 进行拼接。
2. CSP HTTP Header，即 Content-Security-Policy(内部安全策略)。
   - 增加攻击难度，配置 CSP。
   - `Content-Security-Policy: default-src 'self'` 所有内容均来自站点的同一个源(不包括其子域名)。
   - `Content-Security-Policy: default-src 'self' *.XXX.com` 允许内容来自信任的域名及其子域名。
   - `Content-Security-Policy: default-src https://www.lliiooiill.cn` 这表示该服务器仅允许通过 HTTPS 的方式并仅从 `www.lliiooiill.cn` 域名来访问文档。
3. 设置 HTTP only cookie，禁止 JavaScript 读取某些敏感 Cookie，让攻击者无法获取。

## CSRF

CSRF(Cross-site request forgery) 跨站请求伪造。

攻击者诱导受害者进入恶意网站，在第三方网站中向被攻击网站发送跨站请求，并利用受害者在被攻击网站中获取的身份凭证绕过后台的用户验证。

### CSRF 攻击步骤

1. 受害者登录 `a.com` 并保留登录凭证 `cookie`。
2. 攻击者引诱受害者在没有关闭 `a.com` 的时候打开了 `b.com`。
3. `b.com` 向 `a.com` 发送一个请求：`a.com/act=xx`浏览器会默认携带 `a.com` 的 `cookie`。
4. `a.com` 接收到请求之后验证身份成功。
5. `a.com` 以受害者的名义执行了 `act=xx`。
6. 攻击完成，攻击者在受害者不知情的情况下冒充受害者执行自己定义好的操作。

### CSRF 攻击类型

#### GET 型

在页面的某个 `img` 标签中发起一个 get 请求：

```html
<img src="http://bank.example/withdraw?name=xxx&amount=xxx" />
```

#### POST 型

自动提交表单到恶意网站

```html
<form action="http://bank.example/withdraw" method="POST">
  <input type="hidden" name="account" value="lubai" />
  <input type="hidden" name="amount" value="10000" />
  <input type="hidden" name="for" value="hacker" />
</form>
<script>
  document.forms[0].submit()
</script>
<a href="http://bank.example/withdraw?name=xxx&amount=xxxx" taget="_blank"> 错过再等⼀一点！！！快来看看 </a>
```

#### 防止 CSRF 攻击

CSRF 一般是发生在第三方域名，攻击者无法直接拿到用户的身份凭证 `cookie`。

1. Cookie SameSite
   - `SameSite: Strict` 浏览器会完全禁止第三方 `cookie`，`a.com` 访问 `b.com` 的资源，`a.com` 的 `cookie` 不会被发送到 `b.com` 服务器。因为不同源。
   - `SameSite: Lax` 在跨站点的情况下，从第三方站点链接打开和从第三方站点提交 get 方式的表单都会携带 `cookie`。但如果是使用的 post 方法或者通过 `img`，`iframe` 等标签加载的 url，这些场景都不会携带 `cookie`。
   - `SameSite: None` 任何情况下都会发送 `cookie`。
2. 同源检测
   - 通过检测 request header 中的 origin referer 等，来确定发送请求的站点是否是自己期望中的站点。可以在服务端判断 referer 是否来自可信域。
   - 对于同源的链接和引用，会发送 referer，referer 的值为 host 不带 path；如果是跨站访问则不带 referer。例如 `a.com` 引用 `b.com` 的资源，不会发送 referer。
   - 请求头属性 `Referer-Policy` 控制什么情况下应该/不应该携带 referer。

也可以在请求的时候附加额外信息：

1. CSRF Token
   - 用户打开页面的时候，服务器利用加密算法给当前用户生成 token。
   - 每次页面加载，前端把获取到的 token 加到所有能发请求的 html 元素上如 `form`，`a`。
   - 每次前端发请求都携带 token 参数。
   - 服务端每次接受请求都校验 token 的有效性。
2. 双重 Cookie
   - 用户访问网站的时候，服务器像浏览器注入一个额外的 `cookie`，内容随便，如 `csrfcookie=1231ewte673fe67qre`。
   - 每次前端发请求都会拼接上 `csrfcookie`。
   - 服务端每次发请求，就去校验请求参数里的值和 `cookie` 里的值是否一致。

双重 Cookie 的安全性不如 CSRF Token：

1. 如果前端和后端域名不一样，如 `a.XXX.com` 和 `b.XXX.com`，如果后端希望前端能拿到 `csrfcookie`，就只能把这个 `cookie` 设置到 `a.com` 下面，并且不能设置 `http-only`。
2. 这样的话 `a.com` 下每个子域名都可以获取到这个 `cookie`。
3. 一旦网站受到 XSS 攻击，`cookie` 很容易被获取。
4. 攻击者利用篡改或者窃取的 `csrfcookie`，就可以进行攻击了。

## Node 防护

### 文件操作

假如我们提供一个静态服务，通过请求的参数 url 来返回给用户或者前端想要的资源。

攻击者在访问你的服务器时可以通过拼接相对路径, 一次次猜你项目的结构, 并且可以访问到你服务器上的各种资源！

express，koa 等都自带插件来屏蔽这个问题的发生。

我们可以使用 `resolve-path` 解决。

```javascript
const fs = require('fs')
const http = require('http')
const path = require('path')
const resolvePath = require('resolve-path')
http
  .createServer(function(req, res) {
    try {
      // 获取 rootDir
      const rootDir = path.join(__dirname, 'static')
      const file = resolvePath(rootDir, req.url)
      fs.readFile(file, function(err, data) {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' })
        res.end(data)
      })
    } catch (e) {
      // catch 住错误，防止服务器直接挂掉
      console.log(e)
      res.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' })
      res.end('找不不到对应的资源')
    }
  })
  .listen(8081)
console.log('server listening on port 8081')
```

因为 `resolve-path` 对 `path` 做了严格的限制。所以不能使用相对路径访问。

### 时序攻击

时序攻击属于旁路攻击，可以理解为旁敲侧击。

比方说某个函数负责比较用户输入的密码和存放在系统内部密码是否相同，如果函数从第一位开始比较，发现不同就立即返回，那么通过计算返回的速度就知道大概是哪一位开始不同的。这样就实现了电影中经常出现的按位破解密码的场景。密码破解复杂度成千上万倍甚至百万千万倍的下降。

最简单的防御方法是：“发现错误的时候并不立即返回，而是设一个标志位，直到完全比较完两个字符串再返回”。

### ReDOS

正则表达式攻击，假如后台用正则表达式对一个动态字符串进行校验，校验时间和字符串匹配成功与否密切相关。

```javascript
console.time('case-1')
;/A(B|C+)+D/.test('ACCCCCCCCCCCCCCCCCCCCCCCCCCCCD') // case-1: 0.30000000074505806 ms
console.timeEnd('case-1')
console.time('case-2') // 不不能匹配成功
;/A(B|C+)+D/.test('ACCCCCCCCCCCCCCCCCCCCCCCCCCCCX') // case-2: 1308.300000000745 ms
console.timeEnd('case-2')
console.time('case-3') // 不不能匹配成功
;/A(B|C+)+D/.test(`A${'C'.repeat(30)}X`)
console.timeEnd('case-3') // case-3: 5138.5 ms
```

对于这样的字符串，每当一次匹配不成功，就会尝试回溯到上一个字符，看看有没有其他的组合来匹配这个字符串。

可以发现，对于这样的正则表达式来说，错误的字符串会比正确的字符串花上数倍时间，甚至需要用秒做单位。

想解决这个问题，就要避免在代码里避免动态构造正则（即 `new RegExp(...)`）。即使要构造，也绝对要避免从用户输入构建。

## HSTS

HSTS（HTTP Strict Transport Security）HTTP 严格传输安全技术可以强制客户端使用 HTTPS 与服务器建立连接。

如果一个网站声明了 HSTS 策略，浏览器必须拒绝所有的 HTTP 连接并阻止用户接受不安全的 SSL 证书。 目前大多数主流浏览器都支持 HSTS(只有一些移动浏览器无法使用它)。

对于声明了 HSTS 的网站，即使你在输入 url 时跳过协议部分，也仍然会重定向到 HTTPS。

比如你输入 `www.baidu.com`，浏览器会假设你想访问 `http://www.baidu.com`，HTTP 请求发到 `www.baidu.com` 之后会返回 301 状态码将请求重定向到 HTTPS 站点。

这时服务器发回来的响应头是这样的：

```dash
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

这表示每个连接到该网站及其子域的下一年（31536000 秒）从这个头被接收的时刻起必须是一个 HTTPS 连接。如果浏览器接收到使用 HTTP 加载资源的请求，则必须尝试使用 HTTPS 请求替代。 如果 HTTPS 不可用，则必须直接终止连接。

### HSTS 是否完全安全？

你第一次访问这个网站的时候，是不受 HSTS 保护的。如果网站向 HTTP 连接添加 HSTS 头，则该报头将被忽略。这是因为攻击者可以在**中间人攻击**（man-in-the-middle attack）中删除或添加头部。HSTS 报头不可信，除非它是通过 HTTPS 传递的。

此外，每次浏览器读取 header 时，HSTS 的 `max-age` 都会刷新，最大值为两年。这意味着保护是永久性的，只要两次访问之间不超过两年。如果你两年没有访问一个网站，它会被视为一个新网站。与此同时，如果你提供 max-age 0 的 HSTS header，浏览器将在下一次连接尝试时将该站点视为一个新站点（这对测试非常有用）。

可以通过**将域名添加到浏览器 HSTS 预加载列表**中来避免第一次无保护的情况。这个方法不是 HSTS 标准的一部分，但是它被所有主流浏览器使用。

## clickJacking 攻击

clickJacking(点击挟持)攻击是一种视觉上的欺骗手段，它能够执行的关键在于 `iframe` 标签，通过它 web 开发者可以实现页中页这样的东西。

常见的点击挟持有两种：

1. 攻击者使用一个透明的 iframe，覆盖在一个网页上，然后诱使用户在该页面上进行操作，此时用户将在不知情的情况下点击透明的 iframe 页面。这并不是要把自己的 iframe 嵌入到别人的网页中，而是把别人的网页利用 iframe 嵌入到自己的网站页面中来。
2. 攻击者使用一张图片覆盖在网页，遮挡网页原有位置的含义。

### X-Frame-Options

响应头 `X-Frame-Options` 用来给浏览器指示允许一个页面可否在 `frame`，`iframe`，`embed` 或者 `object` 中展现的标记。站点可以通过确保网站没有被嵌入到别人的站点里面，从而避免 **clickJacking 攻击**。

`X-Frame-Options` 有几个可选值：

- `DENY`：浏览器会拒绝当前页面加载任何 frame 页面。
- `SAMEORIGIN`：frame 页面的地址只能为同源域名下的页面。
- `ALLOW-FROM https://example.com/`：允许 frame 加载的页面地址。

使用 nginx 配置： `add_header X-Frame-Options SAMEORIGIN`

### 图片覆盖

攻击者使用一张或者多张图片，利用 `style` 将图片覆盖在网页上，而图片本身所带的信息是具有欺骗含义的。这种攻击很容易出现在网站本身的页面。

在防御图片覆盖攻击时，需要检查用户提交的 HTML 代码中，`img` 标签的 `style` 属性是否可能导致浮出。

## 参考文章

- [Content Security Policy (CSP) 介绍](https://i.jakeyu.top/2018/08/26/Content-Security-Policy-CSP-%E4%BB%8B%E7%BB%8D/)
- [什么是 HSTS，为什么要使用它？](https://zhuanlan.zhihu.com/p/130946490)
- [在 nginx 中设置 X-Frame-Options Header](https://juejin.cn/post/6979052224068452360)
- [ClickJacking 漏洞的原理](https://www.zhuyingda.com/blog/b6.html?origin=75)
- [Web 安全之点击劫持（ClickJacking）](https://www.cnblogs.com/lovesong/p/5248483.html)
- [常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/)
