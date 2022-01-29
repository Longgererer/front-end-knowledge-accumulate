# 常见 CSS&HTML 基础问题积累

## 1. CSS 盒模型

CSS 盒模型包含 4 个部分：外边距、边框、内边距和内容。

主流浏览器的元素宽高默认不包含内边距和边框在内，但在 IE 浏览器中则包含。

可以使用 `box-sizing: border-box` 兼容两种情况。

## 2. video/audio 标签的使用

```html
<video src=""></video>
<audio>
  <source src="" />
</audio>
```

`video`/`audio` 共有属性：

- `src`：视频/音频地址。
- `autoplay`：是否自动播放
- `controls`：是否显示控制条
- `loop`：是否循环播放
- `preload`：预加载，与 `autoplay` 冲突，`autoplay` 优先级更高。
- `muted`：静音模式。

除此之外，`video` 还有 `width/height` 属性和 `poster`(封面)属性。

## 3. CSS 高度塌陷

如下几个情况会导致父元素高度塌陷：

1. 子元素 `float` 值为 `left`、`right`。
2. 子元素 `position` 值为 `absolute`、`fixed`。

浮动会触发 BFC，而 BFC 区域又不会和浮动区域重叠，因此最后父元素的高度就是 0。

如下几个方式可以解决这个问题：

1. 给父元素定义高度。
2. 建立新的 BFC，父元素设置 `overflow: hidden/auto`。
3. 在浮动元素后面加一个空的块级标签如 `div`，并设置 `clear: both`。
4. 给父元素添加伪元素并设置 `content: "";display: block;clear: both`。

## 4. 如何使 chrome 浏览器显示小于 12px 的文字？

设置 `-webkit-transform: scale()`。

## 5. 网页中有大量图片加载很慢，如何优化？

1. 骨架屏+图片懒加载。通过滚动条事件判断图片与可视区域的距离来加载。
2. 小图标可以使用 csssprite 或 svgsprite。
3. 图片预加载技术，优先加载前后图片。
   1. 通过：CSS background 加载。
   2. JS Image 对象加载。

预加载和懒加载的区别是：懒加载是按需加载，可以减少不必要的请求，但预加载是一开始就加载好了。

## 6. 浏览器的 quirks 模式和 strict 模式的区别

quirks 模式又叫做怪异模式，这个模式并不遵守 W3C 的标准。但是为了能让以前的网页能够正确显示，许多浏览器并未放弃支持怪异模式。

strict 模式又叫做标准模式，遵循 W3C 标准。

浏览器可以通过 html 头部的 DOCTYPE 声明判断采用何种模式进行解析。

对于那些浏览器不能识别的 DOCTYPE 声明，浏览器采用 strict mode 解析。

DOCTYPE 声明中，没有使用 DTD 声明或者使用 HTML4 以下（不包括 HTML4）的 DTD 声明时，基本所有的浏览器都是使用 quirks mode 呈现，其他的则使用 strict mode 解析。

1. 盒模型：quirks mode 采用怪异盒模型，strict mode 使用标准盒模型。

2. 图片元素的垂直对齐方式对于行内和 `table-cell` 元素，strict mode 下 `vertical-align` 属性默认值为 `baseline`，而 quirks mode 下表格单元格 `vertical-align` 属性默认值为 `bottom`。

3. quirks mode 下，`table` 元素字体的某些样式不能通过继承得到，如 `font-size`。

4. quirks mode 下，内联元素的尺寸可以通过定义宽高改变，但 strict mode 不可以。

5. strict mode 下，`overflow` 取值默认为 `visible`。quirks mode 下，内容溢出会被看做是内容的扩展，溢出不会被裁剪。

除了这两种常见模式，还有一种 limited quirks mode (几乎标准的模式)，他与 strict mode 的唯一区别是是否对元素给定行高和基线。几乎标准模式中，如果 标签所在行没有其他的行内元素，将不指定基线。

在 HTML4.01 标准中，浏览器解析时到底使用标准模式还是兼容模式，与网页中的 DTD 直接相关，因为 HTML 4.01 基于 SGML，DTD 规定了标记语言的规则，这样浏览器才能正确地呈现。 且有三种
HTML5 不基于 SGML，因此不需要对 DTD 进行引用。只需要在顶部声明 `<!DOCTYPE html>`

## 7. 网页的三层结构

构成：结构层、表示层、行为层。

分别是：HTML、CSS、JavaScript。

HTML 实现页面结构、CSS 完成页面的表现与风格、JavaScript 实现客户端的一些功能和业务。

## 8. DOCTYPE 的作用

DOCTYPE 标签的目的是要告诉浏览器应该使用什么样的文档类型定义（DTD）来解析文档。

`<!DOCTYPE>` 声明必须是 HTML 文档的第一行，位于 `<html>` 标签之前。

如果不声明 DOCTYPE 或者声明错误的 DOCTYPE，浏览器会使用怪异模式解析 CSS。

## 9. 什么是 BFC

BFC(block formatting context)就是块级格式化上下文，它虽然属于文档流的一部分，但它将内部的内容与外部上下文隔开。这种隔离为创建 BFC 的元素做了三件事情：

1. 内部所有元素的**上下**边距，它不会与 BFC 外部的元素产生**外边距重叠**。
2. 包含了内部所有的**浮动元素**，浮动元素会参与高度计算。
3. 不会与 BFC 外面的**浮动元素**重叠。
4. 属于同一个 BFC 的两个相邻的元素垂直外边距会发生重叠。

BFC 的生成条件：

1. 根元素或包含根元素的元素。
2. 浮动元素（元素的 `float` 不是 `none`）。
3. 绝对定位元素（元素的 `position` 为 `absolute` 或 `fixed`）。
4. 行内块元素（元素的 `display` 为 `inline-block`）。
5. 表格单元格（元素的 `display` 为 `table-cell`，HTML 表格单元格默认为该值）。
6. 表格标题（元素的 `display` 为 `table-caption`，HTML 表格标题默认为该值）。
7. 匿名表格单元格元素（元素的 `display` 为 `table`、`table-row`、 `table-row-group`、`table-header-group`、`table-footer-group`（分别是 HTML `table`、`row`、`tbody`、`thead`、`tfoot` 的默认属性）或 `inline-table`）。
8. `overflow` 值不为 `visible` 的块元素。
9. `display` 值为 `flow-root` 的元素。
10. `contain` 值为 `layout`、`content` 或 `strict` 的元素。
11. 弹性元素（`display` 为 `flex` 或 `inline-flex` 元素的直接子元素）。
12. 网格元素（`display` 为 `grid` 或 `inline-grid` 元素的直接子元素）。
13. 多列容器（元素的 `column-count` 或 `column-width` 不为 `auto`，包括 `column-count` 为 1）。

## 10. 外边距重叠是什么？如何避免外边距重叠？

[CSS2.1 标准](http://www.ayqy.net/doc/css2-1/box.html#collapsing-margins)

外边距重叠指的是两个或多个块级盒子的垂直相邻边界会重合，结果的边界宽度是相邻边界宽度中最大的值。如果出现负边界，则在最大的正边界中减去绝对值最大的负边界。如果没有正边界，则从零中减去绝对值最大的负边界。

但并不是所有外边距都会重叠，有例外情况：

1. 水平边距永远不会重合。
2. 相邻的盒模型中，如果其中的一个是浮动的（`float`），垂直 `margin` 不会重叠，并且浮动的盒模型和它的子元素之间也是这样。
3. 设置了 `overflow` 属性的元素和它的子元素之间的 `margin` 不被重叠（`overflow` 取值为 `visible` 除外）。
4. 设置了绝对定位（`position:absolute`）的盒模型，垂直 `margin` 不会被重叠，并且和他们的子元素之间也是一样。
5. 设置了 `display:inline-block` 的元素，垂直 `margin` 不会重叠，甚至和他们的子元素之间也是一样。
6. 如果一个盒模型的上下 `margin` 相邻，这时它的 `margin` 可能重叠覆盖（collapse through）它。在这种情况下，元素的位置（`position`）取决于它的相邻元素的 `margin` 是否重叠。
7. 根元素的垂直 `margin` 不会被重叠。

如何解决外边距重叠呢？

外边距重叠有两种：子元素外边距和父元素外边距重叠，相邻子元素之间的外边距重叠。

默认情况下，一个元素的 `margin-top` 会和它普通流中的第一个子元素(非浮动元素等)的 `margin-top` 相邻。只有在一个元素的 `height` 是 `auto` 的情况下，它的 `margin-bottom` 才会和它普通流中的最后一个子元素(非浮动元素等)的 `margin-bottom` 相邻。

根据 BFC 的定义，**两个元素只有在同一 BFC 内，才有可能发生垂直外边距的重叠，包括相邻元素、嵌套元素**。要解决 `margin` 重叠问题，**只要让它们不在同一个 BFC 内就行。**对于相邻元素，只要给它们加上 BFC 的外壳，就能使它们的 `margin` 不重叠。对于嵌套元素，只要让父级元素触发 BFC，就能使父级 `margin` 和当前元素的 `margin` 不重叠。

下面就是使用 `display: flex` 生成新的 BFC，将本会导致外边距重叠的两个元素 `div1` 和 `div2` 隔开：

:::: tabs
::: tab HTML

```html
<div class="div3">
  <div class="div1">div1</div>
</div>
<div class="div2">div2</div>
```

:::
::: tab CSS

```css
.div1,
.div2 {
  width: 200px;
  height: 200px;
  background: red;
  margin: 20px;
}
.div3 {
  display: flex; /* 在 div1 上加一层 BFC div3 */
}
.div2 {
  background: blue;
}
```

:::
::::

对于父子元素之间的外边距重叠，除了 BFC 还有两种解决方式：

1. 父元素设置上下边框。
2. 为父元素添加 `padding`，至少添加 `padding-top`。

## 11. 什么是 IFC？

IFC 是行内格式化上下文。

`display` 属性为 `inline`，`inline-block`，`inline-table` 的元素会生成 IFC。

行内格式化上下文中，盒是从包含块的顶部开始一个挨一个水平放置的。这些盒之间的水平外边距，边框和内边距都有效。包含来自同一行的盒的矩形区域叫做行框(line box)。

line box 的高度由其包含行内元素中最高的实际高度计算而来（不受到竖直方向的 padding/margin 影响)IFC 中的 line box 一般左右都贴紧整个 IFC，但是会因为 float 元素而扰乱。float 元素会位于 IFC 与 line box 之间，使得 line box 宽度缩短。 同个 IFC 下的多个 line box 高度会不同。

IFC 的行框由其包含行内元素中最高的实际高度来计算，不受竖直 `padding` 和 `margin` 影响。计算规则如下：

计算行框中每个行内级盒的高度时，对于替换元素，`inline-block` 元素和 `inline-table` 元素，这个值就是其外边距框的高度；对于行内元素，这个值是其 `line-height` 决定的。当元素 B 的高度小于它所在的行框的高度时，行框中 B 的垂直对齐方式由 `vertical-align` 属性决定。当一行的行内元素的总宽度小于它们所在的行框的宽度时，它们在行框里的水平分布由 `text-align` 属性决定。行框高度是最高的盒的顶端与最低的盒的底端之间的距离。

水平居中：当一个块要在环境中水平居中时，设置其为 `inline-block` 则会在外层产生 IFC，通过 `text-align` 则可以使其水平居中。

垂直居中：创建一个 IFC，用其中一个元素撑开父元素的高度，然后设置其 `vertical-align:middle`，其他行内元素则可以在此父元素下垂直居中。

## 12. 如何画一条 0.5px 的线

使用 meta viewport 缩放 0.5 倍。**viewport 只针对于移动端，只在移动端上才能看到效果**。

```html
<meta name="viewport" content="width=device-width, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5" />
```

采用 `transform: scale()` 的方式。

```css
transform: scale(0.5, 0.5);
```

或者使用：

```css
box-shadow: 0 0.5px 0 #000;
```

## 13. zoom 和 transform:scale() 的区别？

`transform` 的值是基于坐标系统的，`transform` 的变换过程实际上是矩阵变换的过程，被 `transform` 的元素要经过一系列的矩阵运算最终确定其坐标。

`zoom` 缩放**会改变元素真实空间大小**。因此 `zoom` 的改版会引发浏览器回流和重绘。而 `scale` 的缩放占据的原始尺寸不变，页面布局不会发生变化，浏览器只会进行重绘。

`scale` 并**不支持百分比值和 normal 关键字**，只能是数值，并且**支持负数**，**可以只控制一个维度**。

`zoom` 相反，支持百分比值，`normal` 关键字和数字，但**不支持负数**，且**只能等比例控制**。

`zoom` 的缩放以**左上角为中心**，无论如何缩放，元素的左上角坐标不变。

`scale` 默认是**居中**缩放。可以通过 `transform-origin` 属性改变缩放中心。

## 14. CSS 定位

- `fixed`：元素的位置相对于浏览器窗口是固定位置，即使窗口是滚动的它也不会移动。`fixed` 定位会使得元素脱离当前文档流，因此不占据空间。
- `absolute`：绝对定位的元素的位置相对于最近的已定位父元素，`absolute` 定位会使得元素脱离当前文档流，因此不占据空间。
- `sticky`：元素先按照普通文档流定位，然后相对于该元素在流中的 flow root(BFC) 和最近的块级元素祖先定位。而后定位表现为在跨越特定阈值之前为相对定位，之后就变为固定定位。

## 15. relative 相对于谁进行定位?

定位为 `relative` 的元素不会脱离正常的文档流，因为文档会为其预留初始的位置，只是视觉上相对原来的位置有移动。

他是默认参照父级的原始点为原始点（父级不是必须设定 `position` 属性），无论父级存在不存在，无论有没有 TRBL(`Top`、`Right`、`Bottom`、`Left`)，均是以父级的左上角进行定位，但是父级的 `Padding` 属性会对其影响。

无父级则以文本流的顺序在上一个元素的底部为原始点。

## 16. 布局和包含块

一个元素的尺寸和位置经常受其**包含块**的影响。包含块就是这个元素**最近的祖先块元素的内容区**，但也不是总是这样。

当一个客户端代理（比如说浏览器）展示一个文档的时候，对于每一个元素，它都产生了一个盒子。每一个盒子都被划分为四个区域：

1. 内容区
2. 内边距区
3. 边框区
4. 外边距区

![](https://mdn.mozillademos.org/files/16558/box-model.png)

确定一个元素的包含块完全依赖于这个元素的 `position` 属性：

1. 如果 `position` 属性为 `static` 、 `relative` 或 `sticky`，包含块可能由它的**最近的祖先块元素**的内容区的边缘组成，也可能会建立格式化上下文。
2. 如果 `position` 属性为 `absolute` ，包含块就是由它的最近的 `position` 的值不是 `static` （也就是值为 `fixed`, `absolute`, `relative` 或 `sticky`）的祖先元素的内容区组成。
3. 如果 `position` 属性是 `fixed`，在连续媒体的情况下(continuous media)包含块是 **viewport**(可视视口) ,在分页媒体(paged media)下的情况下包含块是分页区域(page area)。
4. 如果 `position` 属性是 `absolute` 或 `fixed`，包含块也可能是由满足以下条件的最近父级元素的内边距区的边缘组成的。
   - `transform` 或 `perspective` 的值不是 `none`。
   - `will-change` 的值是 `transform` 或 `perspective`。
   - `filter` 的值不是 `none` 或 `will-change` 的值是 `filter`(只在 Firefox 下生效)。
   - `contain` 的值是 `paint` 或 `layout` 或 包含它们其中之一的合成值 (例如: `contain: strict`，`contain: content`)。

实际上，上面这些使得元素包含块所改变的原因是生成了**层叠上下文**。

## 17. 幽灵空白节点怎么产生的，如何解决？

幽灵空白节点和行内元素有关。

![](https://pic2.zhimg.com/80/fa1bef7a27a3c235a2e9bd8de5ba5448_720w.jpg)

行内元素的 `vertical-align` 默认是基线对齐的，而幽灵红白节点的大小正是 `baseline` 和 `bottom` 之间的距离，这段距离是为了容纳 `pqgj` 等等有小尾巴的西文字符而存在的。

另外，`top` 与 `bottom` 之间的距离是由 `line-height` 决定的。而如果没有设置 `line-height`，`line-height` 的默认值是基于 `font-size` 的。

综上所述，我们有几种方法可以解决这个问题：

1. 将行内元素转换为块元素。
2. 将 `vertical-align` 设置为其他值。
3. 将 `line-height` 设置为 0。
4. 将 `font-size` 设置为 0。

## 18. display:none 和 visibility:hidden 的区别？

1. `display：none` 会让元素从渲染树中消失，渲染的时候不占据任何空间；`visibility：hidden` 不会让元素从渲染树中消失，渲染的时候仍然占据空间，只是内容不可见。
2. `display：none` 是非继承属性，子孙节点消失是由于元素从渲染树中消失造成，通过修改子孙节点的属性无法显示；`visibility：hidden` 是继承属性，子孙节点消失是由于继承了 `hidden`，通过设置 `visibility：visible`，可以让子孙节点显示。
3. 读屏器不会读取 `display：none` 的元素内容，而会读取 `visibility：hidden` 的元素内容。

## 19. opacity: 0 和 visibility:hidden 的区别？

这两个属性的元素虽然都不可见且占据位置，但是有很大区别。

`visibility:hidden` 元素不可进行鼠标操作，比如 `click`，`hover` 这些都是无效的。但子元素可以通过修改 `visibility` 的值来显示自己。

`opacity: 0` 元素可以进行鼠标操作。但子元素即使修改自己的 `opacity`，也不能显示。

## 20. HTML4 和 XHTML 的区别？

HTML4.01

`<html>` 必须是 root 元素。
`<head>` 和 `<body>` 是 `<html>` 中一定有且只有的元素。
`<head>` 必须有 `<title>`， `<meta>` 和 `<style>` 可选, 他们只能在 `<head>` 里。
`<body>` 里只能有 `block` 元素。
`block` 元素不能放在 `inline` 元素里。
`block` 元素不能放在 `<p>` 里。
`<ul>` 和`<ol>` 中只能有 `<li>` 元素，但 `<li>` 里可以放其他，包括 `block` 元素。
`<blockquote>` 中只能放 `block` 元素。

XHTML：

- 文档顶部 doctype 声明不同，XHTML 的 doctype 顶部声明中明确规定了 xhtml DTD 的写法
- 元素必须始终正确嵌套
- 标签必须始终关闭
- 标签名必须小写
- 特殊字符必须转义
- 文档必须有根元素
- 属性值必须用双引号 "" 括起来
- 禁止属性最小化（例如，必须使用 checked="checked" 而不是 checked）

## 21. SGML 是什么？

SGML 是标准通用标记语言，是一种定义电子文档结构和描述其内容的国际标准语言， 是所有电子文档标记语言的起源。

## 22. HTML 空元素是什么？

首先啥是空元素呢？就是字面意思：没有内容的 HTML 元素，比较常见的空元素像`<img>`、`<link>`、`<meta>`、`<br>`、`<hr>`这种，他们往往没有关闭标签。

## 23. HTML5 离线存储原理是什么？

通过创建 `cache manifest` 文件，创建 web 应用的离线版本。

HTML5 引入了应用程序缓存，这意味着 web 应用可进行缓存，并可在没有因特网连接时进行访问。

离线存储基于一个新建的 `.appcache` 文件，通过这个文件上的解析清单离线存储资源，这些资源就会像 `cookie` 一样被存储了下来。之后当网络在处于离线状态下时，浏览器会通过被离线存储的数据进行页面展示。

要想实现离线存储，我们需要在 `html` 标签内定义一个 `manifest` 属性：

```html
<html lang="en" manifest="offlineCache.appcache"></html>
```

然后在 `offlineCache.appcache` 中：

```bash
CACHE MANIFEST #v01 image/01.jpg
NETWORK: *
FALLBACK: /
```

其中 `#v01` 是版本号，

这里需要注意一点，我们虽然只缓存了 `image/01.jpg` 但是**引入 `manifest` 的页面,即使没有被列入缓存清单中，仍然会被用户代理缓存**。

同时：

1. 在 manifest 中使用的相对路径，相对参照物为 manifest 文件。
2. CACHE MANIFEST 字符串应在第一行，且必不可少。
3. 引用 manifest 的 html 必须与 manifest 文件同源，在同一个域下。
4. 如果 manifest 文件，或者内部列举的某一个文件不能正常下载，整个更新过程都将 失败，浏览器继续全部使用老的缓存。
5. FALLBACK 中的资源必须和 manifest 文件同源。
6. 当一个资源被缓存后，该浏览器直接请求这个绝对路径也会访问缓存中的资源。
7. 站点中的其他页面即使没有设置 manifest 属性，请求的资源如果在缓存中也从缓存中访问。
8. 当 manifest 文件发生改变时，资源请求本身也会触发更新。

## 24. iframe 有哪些缺点？

1. `iframe` 会阻塞主页面的 `Onload` 事件。
2. 搜索引擎的检索程序无法解读这种页面，不利于 SEO。
3. `iframe` **和主页面共享连接池**，而浏览器对相同域名的连接有限制，所以会影响页面的并行加载。
4. 使用 `iframe` 之前需要考虑这两个缺点。如果需要使用 `iframe`，最好通过 `JavaScript` 动态给 `iframe` 添加 `src` 属性值，这样可以绕开以上两个问题。

绝大部分浏览器，主页面和其中的 `iframe` 是共享这些连接的。这意味着 `iframe` 在加载资源时可能用光了所有的可用连接，从而阻塞了主页面资源的加载。如果 `iframe` 中的内容比主页面的内容更重要，这当然是很好的。但通常情况下，`iframe` 里的内容是没有主页面的内容重要的。这时 `iframe` 中用光了可用的连接就是不值得的了。Safari 3+ 和 Opera 9+ 可同时对一个域名打开 4 个连接，Chrome 1+, IE 8 以及 Firefox 3 可以同时打开 6 个。

## 25. FOUC 是什么？

FOUC(flash of unstyled content)——浏览器样式闪烁。页面加载解析时，页面以样式 A 渲染；当页面加载解析完成后，页面突然以样式 B 渲染，导致出现页面样式闪烁。

浏览器在解析 html 的时候，当解析到 inline stylesheet 或 internal stylesheet 时，马上刷新 CSSOM Tree，CSSOM Tree 或 DOM Tree 发生变化时会引起 Render Tree 变化。在网络不好的时候，会有明显的 FOUC。

因此 FOUC 的产生是由于页面采用临时样式来渲染页面而导致的。

可以先隐藏 `body` 标签，当样式加载完成后再显示 `body`。

## 26. 渐进增强和优雅降级之间有什么不同?

渐进增强（Progressive Enhancement）：一开始就针对低版本浏览器进行构建页面，完成基本的功能，然后再针对高级浏览器进行效果、交互、追加功能达到更好的体验。

优雅降级（Graceful Degradation）：一开始就构建站点的完整功能，然后针对浏览器测试和修复。比如一开始使用 CSS3 的特性构建了一个应用，然后逐步针对各大浏览器进行 hack 使其可以在低版本浏览器上正常浏览。

```css
.transition {
  /*渐进增强写法*/
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}
.transition {
  /*优雅降级写法*/
  transition: all 0.5s;
  -o-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -webkit-transition: all 0.5s;
}
```

## 27. link 和 @import 的区别？

1. `link` 属于 HTML 标签，而 `@import` 是 CSS 提供的。
2. 页面被加载的时，`link` 会同时被加载，而 `@import` 被引用的 CSS 会等到引用它的 CSS 文件被加载完再加载。
3. `@import` 只在 IE5 以上才能识别，而 `link` 是 HTML 标签，无兼容问题。
4. `@import` 一定要写在除 `@charset` 外的其他任何 CSS 规则之前，如果置于其它位置将会被浏览器忽略，而且，在 `@import` 之后如果存在其它样式，则 `@import` 之后的分号是必须书写，不可省略的。
5. `link` 比 `@import` 优先加载，虽然 `@import` 比 `link` 样式后加载，但在渲染时，浏览器会用加载好的 CSS 代码替换掉 `@import`，因此仍然会置于样式表的最顶部，因此相同样式会被 `link` 覆盖。

## 28. position:absolute 和 float 属性的异同？

共同点：`float` 和 `absolute` 都可以让元素脱离文档流，对于行内元素还可以设置宽高。

不同点：`float` 仍然会占据位置，这体现在浮动元素和同级的非 `display: block` 的元素不会互相重叠，而同级中的 `absolute` 元素则会覆盖其他文档流中的元素。

::: tip Notice
浮动元素不会与同级的 `display: block` 进行重叠，原因是为了在网页上进行报纸一样的排版，但同级的块元素却不会为浮动元素预留位置，导致重叠。当然，如果该块元素中有非 `display: block` 元素，那么这些元素仍然不会与浮动元素发生重叠，反之则仍然会重叠。
:::

## 29. 有多少种 Doctype 文档类型？

XHTML 1.0 中有 3 种 DTD（文档类型定义）声明可以选择：过渡的（Transitional）、严格的（Strict）和框架的（Frameset）。

分别介绍如下:

1．过渡的

一种要求不很严格的 DTD，允许在页面中使用 HTML4.01 的标识（符合 xhtml 语法标准）。过渡的 DTD 的写法如下：

`"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"`

2．严格的

一种要求严格的 DTD，不允许使用任何表现层的标识和属性。严格的 DTD 的写法如下：

`"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"`

3.框架的

一种专门针对框架页面所使用的 DTD，当页面中含有框架元素时，就要采用这种 DTD。框架的 DTD 的写法如下：

`"http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd"`

HTML 4.01 规定了三种文档类型：Strict、Transitional 以及 Frameset。

**Strict** DTD，如果您需要干净的标记，免于表现层的混乱，请使用此类型。请与层叠样式表（CSS）配合使用：

`DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"`

**Transitional** DTD 可包含 W3C 所期望移入样式表的呈现属性和元素。如果您的读者使用了不支持层叠样式表（CSS）的浏览器以至于您不得不使用 HTML 的呈现特性时，请使用此类型：

`DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" " http://www.w3.org/TR/html4/loose.dtd"`

**Frameset** DTD 应当被用于带有框架的文档。除 frameset 元素取代了 body 元素之外，Frameset DTD 等同于 Transitional DTD：

`DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" " http://www.w3.org/TR/html4/frameset.dtd"`

## 30. 什么是 PWA?

[讲讲 PWA](https://segmentfault.com/a/1190000012353473)

## 31. 常见 css 布局?

[CSS 常见布局方式](https://juejin.cn/post/6844903491891118087#heading-22)

## 32. iphone 和 ipad 下输入框默认内阴影？

使用 `-webkit-appearance: none;`。

## 33. Webkit 和 Blink 内核是什么？

**Webkit**：Webkit 是 Safari 采用的内核，它的优点就是网页浏览速度较快，虽然不及 Presto 但是也胜于 Gecko 和 Trident，缺点是对于网页代码的容错性不高，也就是说对网页 代码的兼容性较低，会使一些编写不标准的网页无法正确显示。WebKit 前身是 KDE 小组 的 KHTML 引擎，可以说 WebKit 是 KHTML 的一个开源的分支。

**Blink**：谷歌在 ChromiumBlog 上发表博客，称将与苹果的开源浏览器核心 Webkit 分 道扬镳，在 Chromium 项目中研发 Blink 渲染引擎（即浏览器核心），内置于 Chrome 浏览器之中。其实 Blink 引擎就是 Webkit 的一个分支，就像 webkit 是 KHTML 的分支一样。 Blink 引擎现在是谷歌公司与 OperaSoftware 共同研发，上面提到过的，Opera 弃用了自己 的 Presto 内核，加入 Google 阵营，跟随谷歌一起研发 Blink。

## 34. title 和 alt 有什么区别？

`title` 通常当鼠标滑动到元素上的时候显示 `alt` 是 `<img>` 的特有属性，是图片内容的等价描述，用于图片无法加载时显示、读屏器阅读图片。

## 35. canvas 和 svg 的区别？

Canvas 是一种通过 JavaScript 来绘制 2D 图形的方法。Canvas 是逐像素来进行渲染的， 因此当我们对 Canvas 进行缩放时，会出现锯齿或者失真的情况。 SVG 是一种使用 XML 描述 2D 图形的语言。SVG 基于 XML，这意味着 SVG DOM 中的每个元素都是可用的。我们可以为某个元素附加 JavaScript 事件监听函数。并且 SVG 保存的是图形的绘制方法，因此当 SVG 图形缩放时并不会失真。

## 36. head 标签中必不少的是？

下面这些标签可用在 head 部分： `<base>`,`<link>`,`<meta>`,`<script>`,`<style>`, 以及 `<title>`。 `<title>` 定义文档的标题，它是 `head` 部分中唯一必需的元素。

## 37. disabled 和 readonly 的区别？

`disabled` 指当 `input` 元素加载时禁用此元素。`input` 内容不会随着表单提交。

`readonly` 规定输入字段为只读。`input` 内容会随着表单提交。

无论设置 `readonly` 还是 `disabled`，通过 `js` 脚本都能更改 `input` 的 `value`。

## 38. 关于伪类 LVHA 的解释?

`a` 标签有四种状态：链接访问前、链接访问后、鼠标滑过、激活，分别对应四种伪类`:link`、`:visited`、`:hover`、`:active`；
当链接未访问过时：

1. 当鼠标滑过 `a` 链接时，满足`:link` 和`:hover` 两种状态，要改变 `a` 标签的颜色，就必须将`:hover` 伪类在`:link` 伪类后面声明；

2. 当鼠标点击激活 `a` 链接时，同时满足`:link`、`:hover`、`:active` 三种状态，要显示 `a` 标签激 活时的样式（`:active`）

必须将`:active` 声明放到`:link` 和`:hover` 之后。因此得出 LVHA 这个顺序。

当链接访问过时，情况基本同上，只不过需要将`:link` 换成`:visited`。

这个顺序能不能变？可以，但也只有`:link` 和`:visited` 可以交换位置，因为一个链接要么访问过要么没访问过，不可能同时满足， 也就不存在覆盖的问题。

## 39. li 与 li 之间有看不见的空白间隔是什么原因引起的？

浏览器会把 `inline` 元素间的空白字符（空格、换行、Tab 等）渲染成一个空格。而为了美观。我们通常是一个 `<li>` 放在一行，这导致 `<li>` 换行后产生换行字符，它变成一个空格，占用了一个字符的宽度。

1. 将所有 `<li>` 写在同一行。不足：代码不美观。
2. 为 `<li>` 设置 `float:left`。不足：有些容器是不能设置浮动，如左右切换的焦点图等。
3. 将 `<ul>` 内的字符尺寸直接设为 0 `ul{font-size:0px;}`。不足:Safari 浏览器依然出现间隔空白。
4. 将间隔消除：`ul{letter-spacing: -5px;}ul li{letter-spacing: normal;}`。

## 40. img 的 srcset 属性？

我们常常需要在不同分辨率的设备下面展示不同大小的图片，这时就可以用到 `srcset`：

```html
<img
  srcset="elva-fairy-320w.jpg 320w, elva-fairy-480w.jpg 480w, elva-fairy-800w.jpg 800w"
  sizes="(max-width: 320px) 280px,(max-width: 480px) 440px,800px"
  src="elva-fairy-800w.jpg"
  alt="Elva dressed as a fairy"
/>
```

注意到这里使用 w 单位表示的是像素是多少，而不是你预计的 px。这是图像的真实大小。

`sizes` 定义了一组媒体条件（例如屏幕宽度）并且指明当某些媒体条件为真时，什么样的图片尺寸是最佳选择。

**`picture`** 元素也可以实现 `srcset` 的功能：

`<picture>` 元素通过包含零或多个 `<source>` 元素和⼀个 `<img>` 元素来为不同的显示/设备场景提供图像版本。浏览器 会选择最匹配的⼦ `<source>`元素，如果没有匹配的，就选择 `<img>` 元素的 `src` 属性中的 URL。然后，所选图像呈现 在 `<img>` 元素占据的空间中。

## 41. `data-` 属性的作用是什么？

`data-` 属性是 HTML5 中的新属性，用于存储页面或应用程序的私有自定义数据。`data-` 赋予我们在所有 HTML 元素上嵌入自定义 `data` 属性的能力。

`data-*` 属性包括两部分：

1. 属性名不应该包含任何大写字母，并且在前缀 `data-` 之后必须有至少一个字符。
2. 属性值可以是任意字符串。

`data-` 后面的值有以下限制：

- 该名称不能以 `xml` 开头，无论这些字母是大写还是小写；
- 该名称不能包含任何分号 (`U+003A`)；
- 该名称不能包含 `A` 至 `Z` 的大写字母。

假如标签中声明了 `<li data-test-value="1"></li>`

JS 中可以通过 `ele.dataset.testValue` 来访问到，任何破折号都会被下个字母的大写替代(驼峰拼写)。

在不支持 `dataset` 的浏览器下也可以通过 `ele.getAttribute("data-test-value")` 获取。

## 42. src 和 href 的区别？

`src` 是指向外部资源的位置，指向的内容会嵌⼊到⽂档中当前标签所在的位置，在请求 `src` 资源时会将其指向的资源 下载并应⽤到⽂档内，如 `js` 脚本，`img` 图⽚和 `frame` 等元素。当浏览器解析到该元素时，会暂停其他资源的下载和处 理，知道将该资源加载、编译、执⾏完毕，所以⼀般 `js` 脚本会放在底部⽽不是头部。

`href` 是指向⽹络资源所在位置（的超链接），⽤来建⽴和当前元素或⽂档之间的连接，当浏览器识别到它他指向的 ⽂件时，就会并⾏下载资源，不会停⽌对当前⽂档的处理。

## 43. 有哪些⽅式（CSS）可以隐藏页面元素？

- `opacity: 0`：本质上是将元素的透明度将为 0，就看起来隐藏了，但是依然占据空间且可以交互。
- `visibility: hidden`：与上⼀个⽅法类似的效果，占据空间，但是不可以交互了。
- `display: none`：这个是彻底隐藏了元素，元素从⽂档流中消失，既不占据空间也不交互，也不影响布局。
- `z-index: -9999`：原理是将层级放到底部，这样就被覆盖了，看起来隐藏了。
- `transform: scale(0,0)`：平⾯变换，将元素缩放为 0，但是依然占据空间，但不可交互。
- `width: 0;height: 0;overflow: hidden;`。
- `width: 0;height: 0;contain: paint;`：`contain: paint` 表示这个元素的子孙节点不会在它边缘外显示。
- `position: fixed;top: -1000px;`：利用 `position: fixed` 让元素以 viewport 为定位的包含块。
- `clip-path: polygon(0px 0px);`：通过剪裁元素实现。

## 44. 层叠上下文和层叠顺序？

每个网页都有一个默认的层叠上下文。这个层叠上下文的根源就是 html 元素。html 元素中的一切都被置于这个默认的层叠上下文的一个层叠层上。

普通元素的层叠水平优先由层叠上下文决定，因此，层叠水平的比较只有在当前层叠上下文元素中才有意义。

需要注意的是，诸位千万不要把层叠水平和 CSS 的 `z-index` 属性混为一谈。没错，某些情况下 `z-index` 确实可以影响层叠水平，但是，只限于定位元素以及 Flex 盒子的孩子元素；而层叠水平所有的元素都存在。

[参考文章 1](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)

[参考文章 2](https://www.zhihu.com/search?type=content&q=%E5%B1%82%E5%8F%A0%E4%B8%8A%E4%B8%8B%E6%96%87)

以下情况会生成新的层叠上下文：

1. `flex` 容器的子元素，且 `z-index` 值不为 `auto`。
2. `grid` 容器的子元素，且 `z-index` 值不为 `auto`。
3. `position` 值为 `absolute`（绝对定位）或 `relative`（相对定位）且 `z-index` 值不为 `auto` 的元素。
4. 元素的 `opacity` 值小于 `1`。
5. 元素的 `transform` 值不是 `none`。
6. 元素的 `perspective` 值不是 `none`。
7. 元素 `mix-blend-mode` 值不是 `normal`。
8. 元素的 `filter` 值不是 `none`。
9. 元素的 `isolation` 值是 `isolate`。
10. `will-change` 指定的属性值为上面任意一个。
11. 元素的 `-webkit-overflow-scrolling` 设为 `touch`。

![](https://pic1.zhimg.com/v2-52469579956b97b6b7ac6894e1ab4e28_b.jpg)

由图可知层叠顺序如下：

1. 层叠上下文`background`/`border`。
2. 负 `z-index`。
3. `block` 块状水平盒子。
4. `float` 浮动盒子。
5. `inline`/`inline-block` 水平盒子。
6. `z-index:auto` 或 `z-index:0`。
7. 正 `z-index`。

- **谁大谁上**：当具有明显的层叠水平标示的时候，如识别的 `z-index` 值，在同一个层叠上下文领域，层叠水平值大的那一个覆盖小的那一个。
- **后来居上**：当元素的层叠水平一致、层叠顺序相同的时候，在 DOM 流中处于后面的元素会覆盖前面的元素。

因此，如果一个元素已经产生了层叠上下文，他的后代哪怕是 `z-index` 负多少，都不可能比它的层级还低，一定是叠在他的上面。

## 45. 什么情况下，用 translate()而不用绝对定位？什么时候，情况相反？

`translate()` 是 `transform` 的一个值。改变 `transform` 或 `opacity` 不会触发浏览器重新布局（`reflow`）或重绘（`repaint`），只会触发复合（`compositions`）。而改变绝对定位会触发重新布局，进而触发重绘和复合。`transform` 使浏览器为元素创建一个 `GPU` 图层，但改变绝对定位会使用到 `CPU`。 因此 `translate()` 更高效，可以缩短平滑动画的绘制时间。

当使用 `translate()` 时，元素仍然占据其原始空间（有点像 `position：relative`），这与改变绝对定位不同。

## 46. 复合属性：flex ？

在 CSS3 中，我们可以使用 `flex` 属性来同时设置 `flex-grow`、`flex-shrink`、`flex-basis` 这 3 个属性。说白了，`flex` 属性就是一个简写形式，就是一个“语法糖”。

```css
ele {
  flex: grow shrink basis; // 默认三个值分别为 0 1 auto
}
```

### flex-basis

`flex-basis` 就是 `width` 的替代品，这两个都用来定义子元素的宽度。只不过在弹性盒子中，`flex-basis` 的语义会比 `width` 好一点而已。

优先级：`max-width/min-width > flex-basis > width`。

也就是说：

- 当不设置 `width` 和 `flex-basis` 时，宽度默认为内容自身的宽度。
- 设置 `width`，不设置 `flex-basis`，宽度正常随着 `width` 走，但是当 `width` 小于 `0` 时，则宽度恢复为自身内容宽度。
- 不设置 `width`，设置 `flex-basis`，当 `flex-basis` 设置值小于自身内容宽度时，`flex-basis` 不生效，不管是正值还是负值。当 `flex-basis` 设置值大于自身内容宽度时，相应宽度也会正常增加。
- 同时设置 `width`，又设置 `flex-basis`，当 `flex-basis` 大于自身内容宽度时，不管 `width` 是否设置，`flex-basis` 优先级高。当 `flex-basis` 和 `width` 都小于自身内容宽度时，`flex-basis` 和 `width` 哪个值大，宽度就是那个。当 `flex-basis` 设置值小于自身内容宽度，而 `width` 大于自身宽度时，则宽度为自身内容宽度。

### flex-grow

`flex-grow` 定义子容器的瓜分剩余空间的比例，默认为 `0`，即如果存在剩余空间，也不会去瓜分。通常将 `flex-grow` 设置为 `1` 使元素自动填满剩余空间。

### flex-shrink

如果子容器宽度超过父容器宽度，即使是设置了 `flex-grow`，但是由于没有剩余空间，就分配不到剩余空间了。

`flex-shrink` 指定了 `flex` 元素的收缩规则，默认值是 `1`。大部分场景下我们不希望元素被压缩，所以 `flex-shrink` 通常设置为 `0`。

如果子容器没有超出父容器，设置 `flex-shrink` 无效。

## 47. Base64 在 html 中的优缺点？

优点：

1. 可以节省一个 http 请求。
2. 没有跨域问题，无需考虑缓存、文件头或者 cookies 问题。

缺点：

1. 对于大图片，base64 编码会太长，导致代码可读性降低。

## 48. input 有哪些属性？

- `type`：`button`，`checkbox`，`file`，`hidden`，`image`，`password`，`radio`，`reset`，`submit`，`text`。
- `autocomplete`：规定是否使用输入字段的自动完成功能。
- `disable`：禁用此元素。
- `placeholder`：规定帮助用户填写输入字段的提示。
- `readonly`：规定输入字段为只读。
- `required`：指示输入字段的值是必需的。
- `size`：定义输入字段的宽度。
- `value`：规定 `input` 元素的值。

## 49. CSS 中有哪些长度单位？

绝对长度单位：

- `cm` 厘米
- `mm` 毫米
- `in` 英尺
- `px` 物理像素（设备像素）
- `pt` 逻辑像素
- `pc` 派卡：印刷行业使用的长度单位

像素（px）在不同的设备有不同表现。对于低 dpi 的设备，1px 是显示器的一个设备像素（点）。对于打印机或高分辨率 屏幕 1 像素表示多个设备像素。

相对长度单位：

- `em` 相对于元素的字体大小
- `ex` 相对于当前字体的 `x` 高度，很少用到
- `ch` 相对于“0”的宽度
- `rem` 相对于根元素的字体大小
- `vw` 相对于视口宽度的 `1%`
- `vh` 相对于视口高度的 `1%`
- `vmin` 当前 `vw` 和 `vh` 中较小的值的 `1%`
- `vmax` 当前 `vw` 和 `vh` 中较大的值的 `1%`
- `%` 相对于父元素

## 50. 设备像素和 css 像素有什么不同？

**设备像素**（device pixels）：是指与硬件设备直接相关的像素，是真实的屏幕设备中的像素点。比如说，一个电脑显示器的参数中，最佳分辨率是 1920x1080，那么指的就是这个显示器在屏幕上用于显示的实际像素点，也就是设备像素。

**css 像素**（css pixels）：css 像素是指网页布局和样式定义所使用的像素，也就是说，css 代码中的 px，对应的就是 css 像素。

## 51. 什么是 dpr ？

为什么移动端设计稿通常是 `750px` ?

这里所说的 `750px` 并不是绝对的，`750px` 是 iphone6 的物理像素，也叫屏幕分辨率。也就是说这个手机被出厂造出来的时候，这个屏幕上有多少个像素点，他的物理像素就是多少；

但是我们在代码里写 `width:375px`，就能充满整个宽度。是因为 iphone6 的 css 像素（逻辑像素）是 `375px`。

**dpr=物理像素/逻辑像素**，iphone6 的 dpr 为 `2`。

## 52. 打开谷歌会有四个进程，为什么？

因为打开 1 个页面至少需要 1 个网络进程、1 个浏览器进程、1 个 GPU 进程以及 1 个渲染进程，共 4 个；如果打开的页面有运行插件的话，还需要再加上 1 个插件进程。

## 53. 如何去除浮动？

1. 为 `float` 元素后的兄弟元素添加 `clear` 属性。
2. 利用伪元素元素添加 `clear` 属性。
3. 将父元素的 `overflow` 属性修改为 `overflow:auto|hidden`。
4. 除了以上方案外，还有一些其他的方案，比如将父元素的 `display` 样式属性改为 `display:table` 或者 `position:fixed`，但是这些方案容易带来更大的副作用，得不偿失，所以实践中一般都会使用以上三种方案。

## 54. 置换元素与非置换元素？

**置换元素**：

1. 一个内容 不受 CSS 视觉格式化模型控制，CSS 渲染模型并不考虑对此内容的渲染，且元素本身一般拥有固有尺寸（宽度，高度，宽高比）的元素，被称之为置换元素。

2. 置换元素就是浏览器根据元素的标签和属性，来决定元素的具体显示内容。

3. 例如浏览器会根据 img 标签的 src 属性的值来读取图片信息并显示出来，而如果查看(X)HTML 代码，则看不到图片的实际内容；又例如根据 input 标签的 type 属性来决定是显示输入框，还是单选按钮等。

4. HTML 中的 img、input、textarea、select、object 都是置换元素。这些元素往往没有实际的内容，即是一个空元素。

**非置换元素**：

HTML 的大多数元素是不可替换元素，即其内容直接表现给用户端（例如浏览器）。

## 55. 如何使用 css 实现轮播？

:::: tabs
::: tab HTML

```html
<section class="slider-container">
  <!-- 轮播器 -->
  <ul class="slider">
    <li class="slider-item slider-item1"></li>
    <li class="slider-item slider-item2"></li>
    <li class="slider-item slider-item3"></li>
    <li class="slider-item slider-item4"></li>
    <li class="slider-item slider-item5"></li>
  </ul>
  <!-- 轮播焦点 -->
  <div class="focus-container">
    <ul class="floatfix">
      <li>
        <div class="focus-item focus-item1"></div>
      </li>
      <li>
        <div class="focus-item focus-item2"></div>
      </li>
      <li>
        <div class="focus-item focus-item3"></div>
      </li>
      <li>
        <div class="focus-item focus-item4"></div>
      </li>
      <li>
        <div class="focus-item focus-item5"></div>
      </li>
    </ul>
  </div>
</section>
```

:::
::: tab CSS

```css
* {
  margin: 0;
  padding: 0;
}
ul,
li {
  list-style: none;
}
.slider-container {
  width: 50%;
  position: relative;
  margin: 0 auto;
}
.slider,
.slider-item {
  padding-bottom: 40%;
}
.slider-item {
  position: absolute;
  width: 100%;
  background-size: 100%;
}
.slider-item1 {
  background-image: url(imgs/1.jpg);
}
.slider-item2 {
  background-image: url(imgs/2.jpg);
}
.slider-item3 {
  background-image: url(imgs/3.jpg);
}
.slider-item4 {
  background-image: url(imgs/4.jpg);
}
.slider-item5 {
  background-image: url(imgs/5.jpg);
}
.focus-container {
  position: absolute;
  bottom: 2%;
  z-index: 7;
  left: 50%;
  margin-left: -45px;
}
.focus-container li {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  float: left;
  margin-right: 10px;
  background: #fff;
}
.focus-item {
  width: 100%;
  height: 100%;
  opacity: 0;
  background: #51b1d9;
  border-radius: inherit;
  animation-duration: 20s;
  animation-timing-function: linear;
  animation-name: fade;
  animation-iteration-count: infinite;
}
.focus-item1 {
  animation-delay: -1s;
}
.focus-item2 {
  animation-delay: 3s;
}
.focus-item3 {
  animation-delay: 7s;
}
.focus-item4 {
  animation-delay: 11s;
}
.focus-item5 {
  animation-delay: 15s;
}
```

:::
::::

## 56. 哪些样式可以继承?

有继承性的属性：

1. 字体系列属性：`font`、`font-family`、`font-weight`、`font-size`、`font-style`、`font-variant`、`font-stretch`、`font-size-adjust`。
2. 文本系列属性：`text-indent`、`text-align`、`text-shadow`、`line-height`、`word-spacing`、`letter-spacing`、`text-transform`、`direction`、`color`。
3. 元素可见性：`visibility`。
4. 表格布局属性：`caption-side`、`border-collapse`、`empty-cells`。
5. 列表属性：`list-style-type`、`list-style-image`、`list-style-position`、`list-style`。
6. 设置嵌套引用的引号类型：`quotes`。
7. 光标属性：`cursor`。

## 57. 1px 怎么跨设备兼容？

`1px` 边框在一些移动设备上变粗问题：

其实这个原因很简单，因为 css 中的 `1px` 并不等于移动设备的 `1px`，这些由于不同的手机有不同的像素密度。在 `window` 对象中有一个 `devicePixelRatio` 属性，他可以反应 `css` 中的像素与设备的像素比。

可以设置 0.5px 的边框：

```js
if (window.devicePixelRatio && devicePixelRatio >= 2) {
  var testElem = document.createElement('div')
  testElem.style.border = '.5px solid transparent'
  document.body.appendChild(testElem)
  if (testElem.offsetHeight == 1) {
    document.querySelector('html').classList.add('hairlines')
  }
  document.body.removeChild(testElem)
}
```

然后：

```css
div {
  border: 1px solid #bbb;
}
.hairlines div {
  border-width: 0.5px;
}
```

## 58. transform:scale 可以是负数吗，什么效果？

可以是负数，使用后会发生翻转：

1. `scaleX(-1)` 水平方向上的翻转。
2. `scaleY(-1)` 纵轴方向上的翻转。

## 59. 行内样式 width: 300px !important，怎么修改宽度为 100 呢？

1. `transform scale`。
2. `max-width`。
3. `display` + `padding`

:::: tabs
::: tab HTML

```html
<div style="width:300px !important"></div>
```

:::
::: tab CSS

```css
div {
  display: inline;
  padding: 0 50px;
  background: red;
}
```

:::
::::

## 60. transform、transition 和 animation 的区别？

`transform` 主要用于给元素做变换，主要由以下几种变换：

1. rotate(旋转)
2. scale(缩放)
3. skew(扭曲)
4. translate(移动)
5. matrix(矩阵变换)

`transition` 用来定义某个 css 属性或者多个 css 属性的变化的过渡效果。

`animation` 动画的定义，先通过 `@(-webkit-)keyframes` 定义动画名称及动画的行为，然后再通过 `animation` 的相关属性定义动画的执行效果.

相比 `transition`，`animation` 可以配合 `@keyframe` 可以不触发事件就触发动画，`transition` 关注的是样式属性的变化，属性值和时间的关系是一个三次贝塞尔曲线；而 `animation` 作用于元素本身而不是样式属性，可以使用关键帧的概念，可以实现更自由的动画效果。

`transition` 触发一次播放一次；而 `animation` 则是可以设置很多的属性，比如循环次数，动画结束的状态等等。

## 61. css 实现一个正三角形

由于 css 没有内置的 `sqrt` 函数，因此使用 `51` 来近似 `sqrt(60*60-30*30)`。

```css
div {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 30px 0 30px 51px;
  border-color: transparent;
  border-left-color: black;
}
```

## 62. Canvas 和 SVG 的区别？

Canvas 是使用 JavaScript 程序绘图(动态生成)，SVG 是使用 XML 文档描述来绘图。

SVG 是基于矢量的，所有它能够很好的处理图形大小的改变。适合静态图片展示，高保真文档查看和打印的应用场景。

Canvas 是基于位图的图像，它不能够改变大小，只能缩放显示。因此适合像素处理，动态渲染和大数据量绘制。

## 63. JPEG、JPG、PNG、GIF 图片有什么区别？

- JPG：图片颜色很多的，建议使用这个图片格式掉，可支持有陨压缩、不支持透明、不支持动画、非矢量。
- JPEG：与 JPG 格式一样，有俩名字纯粹历史遗留。
- PNG：不支持压缩、支持透明、半透明、不透明、不支持动画、非矢量。
- GIF：用的最多的就是特点就是图片很小(一般几 kb)、可支持有陨压缩、不支持全透明、支持半透明、支持动画、非矢量。

## 64. WebP 相对于 PNG、JPG 有什么优势?

WebP 的优势体现在它具有更优的图像数据压缩算法，能带来更小的图片体积，而且拥有肉眼识别无差异的图像质量。

## 65. position 各种取值意义？

- `static`，默认布局行为，即元素在文档常规流中当前的布局位置。此时 `top`, `right`, `bottom`, `left` 和 `z-index` 属性无效。
- `relative`，元素先放置在未添加定位时的位置，再在不改变页面布局的前提下调整元素位置（因此会在此元素未添加定位时所在位置留下空白）。
- `absolute`，元素会被移出正常文档流，并不为元素预留空间，通过指定元素相对于最近的非 `static` 定位祖先元素的偏移，来确定元素位置。绝对定位的元素可以设置外边距（margins），且不会与其他边距合并。
- `fixed`，元素会被移出正常文档流，并不为元素预留空间，而是通过指定元素相对于屏幕视口（viewport）的位置来指定元素位置。元素的位置在屏幕滚动时不会改变。打印时，元素会出现在的每页的固定位置。`fixed` 属性会创建新的层叠上下文。当元素祖先的 `transform`, `perspective` 或 `filter` 属性非 `none` 时，容器由视口改为该祖先。
- `sticky`，元素根据正常文档流进行定位，然后相对它的**最近滚动祖先**和**最近块级祖先**，包括 `table-related` 元素，基于 `top`, `right`, `bottom`, 和 `left` 的值进行偏移。偏移值不会影响任何其他元素的位置。

:::tip Notice
一个 `sticky` 元素会“固定”在离它最近的一个拥有“滚动机制”的祖先上(当该祖先的 `overflow` 是 `hidden`, `scroll`, `auto`, 或 `overlay` 时)，，即便这个祖先不是最近的真实可滚动祖先。
:::

## 66. 页面渲染优化手段？

- HTML 文档结构层次尽量少，最好不深于六层；
- 脚本尽量后放，放在 Body 最后面即可；
- 少量首屏样式内联放在标签内；
- 样式结构层次尽量简单；
- 在脚本中尽量减少 DOM 操作，尽量缓存访问 DOM 的样式信息，避免过度触发回流；
- 减少通过 JavaScript 代码修改元素样式，尽量使用修改 class 名方式操作样式或动画；
- 动画尽量使用在绝对定位或固定定位的元素上；
- 隐藏在屏幕外，或在页面滚动时，尽量停止动画；
- 尽量缓存 DOM 查找，查找器尽量简洁；
- 涉及多域名的网站，可以开启域名预解析

## 67. 脱离文档流指的是什么？

是一个元素脱离文档流之后，其他的元素在定位的不会被它影响，两者位置重叠都是可以的。但是脱离文档流的元素仍然在 dom 树中。

目前：`position` 为 `absolute` 和 `fixed`，`float` 为 `left` 和 `right` 的元素会脱离文档流。
