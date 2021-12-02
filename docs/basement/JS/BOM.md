# BOM 对象

Javascript 由三部分构成，ECMAScript，DOM 和 BOM，其中 BOM(Browser Object Mode) 就是浏览器对象模型，提供与浏览器交互的方法和接口。各个浏览器厂商根据 DOM 在各自浏览器上的实现(不同浏览器实现方式和效果不同)。

BOM 的核心是 window 对象，window 可以作为 js 访问浏览器窗口的一个接口，又充当了全局对象的角色。

window 对象包含属性：`Location`、`Screen`、`Navigator`、`History`。

## location

`Location` 接口表示其链接到的对象的位置（URL）。所做的修改反映在与之相关的对象上。 `Document` 和 `Window` 接口都有这样一个链接的 `Location`，分别通过 `Document.location` 和 `Window.location` 访问。

常用 API 如下：

- `href`：一个包含了完整 URL 的字符串，可以通过赋值更改。
- `protocol`：使用的协议。
- `host`：主机名+端口号。
- `hostname`：主机名。
- `port`：端口号。
- `pathname`：相对路径。
- `search`：`?` 后面的查询字符串。
- `hash`：`#` 后的锚点地址(包含 `#`)。
- `replace(url)`：跳转页面，当前页面**不会保存到会话历史**(session history)中，这样，用户点击回退按钮时，将不会再跳转到该页面。
- `assign(url)`：触发窗口加载并显示指定的 URL 的内容，当前页面会保存到会话历史。
- `reload(bol)`：方法用来刷新当前页面。当 `bol` 值为 `true` 时，将强制浏览器从服务器加载页面资源，当值为 `false` 或者未传参时，浏览器则可能从缓存中读取页面。

## Screen

Screen 接口表示一个屏幕窗口，往往指的是当前正在被渲染的 `window` 对象，可以使用 `window.screen` 获取它。

常用 API：

- `width`：屏幕的宽度。
- `height`：屏幕的高度。
- `orientation`：屏幕当前的方向。
- `pixelDepth`：返回屏幕的位深度/色彩深度(bit)。有些屏幕可显示的颜色比较少，就需要用这个来做兼容判断。
- `availWith`：窗口中水平方向可用空间的像素值。
- `availHeight`：窗口中数值方向可用空间的像素值。

## Navigator

Navigator 接口表示用户代理的状态和标识。它允许脚本查询它和注册自己进行一些活动。

常用 API：

- `cookieEnabled`：表示当前页面是否启用了 `cookie`。
- `geolocation`：返回一个 `Geolocation` 对象，通过这个对象可以访问到设备的位置信息。
- `language`：用户的首先语言，通常是浏览器用户界面的语言。当未知的时，返回 `null`。
- `userAgent`：浏览器名称和版本号的字符串。

## History

History 接口用于与浏览器历史记录进行交互。

常用 API：

- `go(num)`：从会话历史记录中加载特定页面。你可以使用它在历史记录中前后移动，移动多少取决于 `num`。
- `back()`：相当于 `go(-1)`。
- `forward()`：相当于 `go(1)`。

- `pushState(stateObj, [title, [url]])`

`pushState()` 需要三个参数: 一个状态对象, 一个标题 (目前被忽略), 和 (可选的) 一个 URL。

状态对象 `state` 是一个对象，通过 `pushState()` 创建新的历史记录条目。无论什么时候用户导航到新的状态，`popstate` 事件就会被触发，且该事件的 `state` 属性包含该历史记录条目状态对象的副本。调用 `pushState()` 后浏览器并不会立即加载传递的 url。虽然地址栏的 url 改变了。

- `replaceState(stateObj, [title, [url]])`

与 `pushState()` 相似，但 `replaceState` 是直接修改当前的历史记录而不是新建一个。注意这并不会阻止其在全局浏览器历史记录中创建一个新的历史记录项。

- `popstate` 事件

每当活动的历史记录项发生变化时， `popstate` 事件都会被传递给 window 对象。如果当前活动的历史记录项是被 `pushState` 创建的，或者是由 `replaceState` 改变的，那么 `popstate` 事件的状态属性 `state` 会包含一个当前历史记录状态对象的拷贝。

## 参考文章

- [前端知识点总结——BOM](https://segmentfault.com/a/1190000013426834?utm_source=channel-hottest)
- [BOM（浏览器对象模型）和 DOM(文档对象模型)](https://blog.csdn.net/qq_33599109/article/details/78122557)
- [最全的 DOM 和 BOM 的解释分析](https://juejin.cn/post/6844903939008102413)
- [梳理下浏览器对象模型知识（BOM）](https://juejin.cn/post/6844903576859328526)
- [Location-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Location)
- [Screen-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Screen)
- [Navigator-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator)
- [History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
