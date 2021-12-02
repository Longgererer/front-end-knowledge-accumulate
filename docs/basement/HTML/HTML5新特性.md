# HTML5 新特性

再说 HTML5 新特性之前，先看看 HTML4/XHTML 的头部声明长什么样子：

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

HTML5 的头部声明显然要简洁许多：

```html
<!DOCTYPE html>
```

## 新标签

### 区块和段落元素

- **`section`**：表示一个包含在 HTML 文档中的独立部分，没有具体的语义元素来表示，一般来说包含一个标题。
- **`article`**：表示文档、页面、应用或网站中的独立结构，它可能是论坛帖子、杂志或新闻文章、博客、用户提交的评论等等。
- **`nav`**：表示页面的一部分，其目的是在当前文档或其他文档中提供导航链接。导航部分的常见示例是菜单，目录和索引。
- **`header`**：用于展示介绍性内容，通常包含一组介绍性的或是辅助导航的实用元素。它可能包含一些标题元素，但也可能包含其他元素，比如 Logo、搜索框、作者名称，等等。
- **`footer`**：表示最近一个章节内容或者根节点元素的页脚。一个页脚通常包含该章节作者、版权数据或者与文档相关的链接等信息。
- **`aside`**：表示一个和其余页面内容几乎无关的部分，被认为是独立于该内容的一部分并且可以被单独的拆分出来而不会使整体受影响。其通常表现为侧边栏等。
- **`hgroup`**：代表文档章节所属的多级别的目录，它将多个`<h1>`至`<h6>`的子元素组装到一起。

:::tip Notice
事实上 `hgroup` 元素已经从 HTML5(W3C) 规范中删除，但大部分浏览器都实现了这个标签，因此仍然可以使用。
:::

### 音频和视频

- **`audio`**：用于在文档中嵌入音频内容。
- **`video`**：用于在 HTML 或者 XHTML 文档中嵌入媒体播放器，用于支持文档内的视频播放。

### 表单

HTML5 为 **`input`** 添加了更多属性：

- **`color`**：用于指定颜色的控件；在支持的浏览器中，激活时会打开取色器。
- **`date`**：输入日期的控件（年、月、日，不包括时间）。在支持的浏览器激活时打开日期选择器或年月日的数字滚轮。
- **`datetime-local`**：输入日期和时间的控件，不包括时区。在支持的浏览器激活时打开日期选择器或年月日的数字滚轮。
- **`month`**：输入年和月的控件，没有时区。
- **`range`**：此控件用于输入不需要精确的数字。控件是一个范围组件，默认值为正中间的值，使用 `min` 和 `max` 来控制值的范围。
- **`search`**：用于搜索字符串的单行文字区域。输入文本中的换行会被自动去除。在支持的浏览器中可能有一个删除按钮，用于清除整个区域。拥有动态键盘的设备上的回车图标会变成搜索图标。
- **`tel`**：用于输入电话号码的控件。拥有动态键盘的设备上会显示电话数字键盘。
- **`time`**：用于输入时间的控件，不包括时区。
- **`url`**：用于输入 URL 的控件。类似 text 输入，但有验证参数，在支持动态键盘的设备上有相应的键盘。

还添加了 **`output`** 元素，表示计算或用户操作的结果。

### 语义元素

- **`mark`**：表示为引用或符号目的而标记或突出显示的文本，这是由于标记的段落在封闭上下文中的相关性或重要性造成的，它可以用来显示搜索引擎搜索后关键词。
- **`figure`**：代表一段独立的内容，经常与说明 `figcaption` 配合使用，并且作为一个独立的引用单元。
- **`figcaption`**：与其相关联的图片的说明/标题，用于描述其父节点 `figure` 元素里的其他数据。
- **`data`**：将一个指定内容和机器可读的翻译联系在一起。
- **`time`**：用来表示 24 小时制时间或者公历日期，若表示日期则也可包含时间和时区。
- **`progress`**：用来显示一项任务的完成进度.虽然规范中没有规定该元素具体如何显示，浏览器开发商可以自己决定，但通常情况下，该元素都显示为一个进度条形式。
- **`meter`**：用来显示已知范围的标量值或者分数值。
- **`main`**：呈现了文档的 `body` 或应用的主体部分。主体部分由与文档直接相关，或者扩展于文档的中心主题、应用的主要功能部分的内容组成。

## 强制校验

HTML5 对表单添加了新的表单校验，可以在不写一行脚本代码的情况下对用户的输入进行数据校验。

### input

- **`type="URL"`**：要求值必须是绝对的 URL。
- **`type="email"`**：要求值必须是正确邮箱格式。

### 验证相关特性

- **`pattern`**：输入的值必须匹配设置的模式，`pattern` 本身为一个正则表达式。

  - 支持：`text`、`search`、`url`、`tel`、`email`、`password` 类型的 `input`。

- **`min & max`**：设置输入值的最大/最小值，`min` 和 `max` 的值的格式与 `input` 类型相匹配。

  - 支持：`range`、`number`、`date`、`month`、`week`、`datetime`、`datetime-local` 和 `time` 类型的 `input`。

- **`required`**：这个属性指定用户在提交表单之前必须为该元素填充值。

  - 支持：`text`、`search`、`url`、`tel`、`email`、`password`、`date`、`datetime`、`datetime-local`、`month`、`week`、`time`、`number`、`checkbox`、`radio`、`file` 类型的 `input`；也支持 `select` 和 `textarea` 元素。

- **`step`**：使用 `min` 和 `max` 属性来限制可以设置数字或日期时间值的增量。

  - 支持：`date`、`month`、`week`、`datetime`、`range`、`time`、`datetime-local`、`number` 类型的 `input`。

- **`maxlength`**：所输入值(字符串)的最大长度。

  - 支持：`text`、`search`、`url`、`tel`、`email`、`password` 类型的 `input`；也支持 `textarea` 元素。

:::warning Notice
永远不要相信从客户端传递到服务器的数据。 即使您的表单正确验证并防止输入格式错误，恶意用户仍然可以更改网络请求。
:::

## iframe

- **`sandbox`**：该属性对呈现在 `iframe` 框架中的内容启用一些额外的限制条件。有效的值请看：[iframe-sandbox](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-sandbox)
- **`seamless`**：布尔值，使 `iframe` 与父级页面融为一体(去掉边框和滚动条)。
- **`srcdoc`**：该属性是一段 HTML 代码，这些代码会被渲染到 `iframe` 中。如果浏览器不支持 `srcdoc` 属性，则会渲染 `src` 属性表示的内容。

## MathML

MathML(Mathematical Markup Language) 是一个用于描述数学公式、符号的一种 XML 标记语言。

相关技术请参考 [MathML-MDN](https://developer.mozilla.org/zh-CN/docs/Web/MathML)

## WebSocket

WebSocket 我在其他文章中已经讨论过，有关 WebSocket 的介绍可以看 [WebSocket](../JS/WebSocket.md)

## Server-Sent Events

相对于 WebSocket，SSE 的使用场景更少，这是因为 SSE 只支持服务端到客户端的主动推送，而 WebSocket 是全双工通信的；第二是因为浏览器对 SSE 的支持度不如 WebSocket。具体功能请看 [使用服务器发送事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events)。

## WebRTC

WebRTC 中的 RTC 是实时通信的简称，这是一种支持在浏览器客户端之间语音/视频交流和数据分享的技术。WebRTC 作为一项标准,使得所有浏览器无需安装插件或第三方软件，就可以点对点地分享应用数据和进行电话会议。

具体功能请看 [WebRTC-MDN](https://developer.mozilla.org/zh-CN/docs/conflicting/Web/API/WebRTC_API_d8621144cbc61520339c3b10c61731f0)

:::tip Notice
不要因为 WebSocket 可以实现实时通信就代替 WebRTC 进行语音/数据交流，要知道，WebSocket 是一个 TCP 协议，在严苛的网络条件下无法进行流畅的通信。
:::

## Storage

HTML5 提供了新的方式来代替 cookie 存储一些数据在浏览器中。

### sessionStorage

`sessionStorage` 维护着在页面会话期间有效的存储空间，除非当前标签页关闭，否则即使刷新页面，会话也会一直持续；每在新标签或者新窗口中打开一个新页面，都会初始化一个新的会话。

用法请看 [Window.sessionStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage)

### localStorage

`localStorage` 类似于 `sessionStorage` 将数据存储在浏览器会话中，但 `localStorage` 是持久的，即使标签页关闭，也不会消失，这意味着如果不主动删除 `localStorage` 中的数据，数据将永久存在。

用法请看 [Window.localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)

## IndexedDB

IndexedDB 是存储在客户端本地的 NoSQL 数据库，相对于 `localStorage`，IndexedDB 可以存储大量的数据，因此对于大量结构化存储，IndexedDB 的优势更加明显。

使用 IndexedDB 执行的操作是异步执行的，以免阻塞应用程序。

IndexedDB 的使用方式类似于 MongoDB，具体用法可以参考[indexedDB](https://zhuanlan.zhihu.com/p/26639553)。

## 参考文章

- [28 HTML5 Features, Tips, and Techniques you Must Know](https://code.tutsplus.com/tutorials/28-html5-features-tips-and-techniques-you-must-know--net-13520)
- [HTML5-MDN](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5)
- [Server-Sent Events 的协议细节和实现](https://zhuanlan.zhihu.com/p/21308648)
- [HTML5 进阶系列：indexedDB 数据库](https://zhuanlan.zhihu.com/p/26639553)