# 常见 CSS&HTML 基础问题积累

## CSS 盒模型

CSS 盒模型包含 4 个部分：外边距、边框、内边距和内容。

主流浏览器的元素宽高默认不包含内边距和边框在内，但在 IE 浏览器中则包含。

可以使用 `box-sizing: border-box` 兼容两种情况。

## video/audio 标签的使用

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

## CSS 高度塌陷

当所有子元素设置浮动，且父元素没有设置高度，这个时候父元素就会产生高度塌陷。

浮动会触发 BFC，而 BFC 区域又不会和浮动区域重叠，因此最后父元素的高度就是 0。

如下几个方式可以解决这个问题：

1. 给父元素定义高度。
2. 建立新的 BFC，父元素设置 `overflow: hidden/auto`。
3. 在浮动元素后面加一个空的块级标签如 `div`，并设置 `clear: both`。
4. 给父元素添加伪元素并设置 `content: "";display: block;clear: both`。

## 如何使 chrome 浏览器显示小于 12px 的文字？

设置 `-webkit-transform: scale()`。

## 网页中有大量图片加载很慢，如何优化？

1. 骨架屏+图片懒加载。通过滚动条事件判断图片与可视区域的距离来加载。
2. 小图标可以使用 csssprite 或 svgsprite。
3. 图片预加载技术，优先加载前后图片。
   1. 通过：CSS background 加载。
   2. JS Image 对象加载。

预加载和懒加载的区别是：懒加载是按需加载，可以减少不必要的请求，但预加载是一开始就加载好了。

## 浏览器的 quirks 模式和 strict 模式的区别

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

## 网页的三层结构

构成：结构层、表示层、行为层。

分别是：HTML、CSS、JavaScript。

HTML 实现页面结构、CSS 完成页面的表现与风格、JavaScript 实现客户端的一些功能和业务。

## DOCTYPE 的作用

DOCTYPE 标签的目的是要告诉浏览器应该使用什么样的文档类型定义（DTD）来解析文档。

`<!DOCTYPE>` 声明必须是 HTML 文档的第一行，位于 `<html>` 标签之前。

如果不声明 DOCTYPE 或者声明错误的 DOCTYPE，浏览器会使用怪异模式解析 CSS。

## 什么是 BFC

BFC(block formatting context)就是块级格式化上下文，它虽然属于文档流的一部分，但它将内部的内容与外部上下文隔开。这种隔离为创建 BFC 的元素做了三件事情：

1. 内部所有元素的**上下**边距，它不会与 BFC 外部的元素产生**外边距重叠**。
2. 包含了内部所有的**浮动元素**，浮动元素会参与高度计算。
3. 不会与 BFC 外面的**浮动元素**重叠。

给元素添加以下任意属性会创建 BFC：

1. `float` 值不为 `none`。
2. `overflow` 值不为 `visible`。
3. `display` 为非 `block` 的块级容器，包含：`inline-block`、`table-cell`、`table-caption`、`flex`、`inline-flex`、`grid` 和 `inline-grid`。
4. `position` 为 `absolute` 或 `fixed`。

## 外边距重叠是什么？如何避免外边距重叠？

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

对于父子元素之间的外边距重叠，除了 BFC 还有两种解决方式：

1. 父元素设置上下边框。
2. 为父元素添加 `padding`，至少添加 `padding-top`。

## 什么是 IFC？

IFC 是行内格式化上下文。

display 属性为 `inline`，`inline-block`，`inline-table` 的元素会生成 IFC。

行内格式化上下文中，盒是从包含块的顶部开始一个挨一个水平放置的。这些盒之间的水平外边距，边框和内边距都有效。包含来自同一行的盒的矩形区域叫做行框。

IFC 的行框由其包含行内元素中最高的实际高度来计算，不受竖直 `padding` 和 `margin` 影响。计算规则如下：

计算行框中每个行内级盒的高度时，对于替换元素，`inline-block` 元素和 `inline-table` 元素，这个值就是其外边距框的高度；对于行内元素，这个值是其 `line-height` 决定的。当元素 B 的高度小于它所在的行框的高度时，行框中 B 的垂直对齐方式由 `vertical-align` 属性决定。当一行的行内元素的总宽度小于它们所在的行框的宽度时，它们在行框里的水平分布由 `text-align` 属性决定。行框高度是最高的盒的顶端与最低的盒的底端之间的距离。

## 如何画一条 0.5px 的线

使用 meta viewport 缩放 0.5 倍。**viewport 只针对于移动端，只在移动端上才能看到效果**。

```html
<meta name="viewport" content="width=device-width, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5" />
```

采用 `transform: scale()` 的方式。

```css
transform: scale(0.5, 0.5);
```

## zoom 和 transform:scale() 的区别？

`transform` 的值是基于坐标系统的，`transform` 的变换过程实际上是矩阵变换的过程，被 `transform` 的元素要经过一系列的矩阵运算最终确定其坐标。

`zoom` 缩放**会改变元素真实空间大小**。因此 `zoom` 的改版会引发浏览器回流和重绘。而 `scale` 的缩放占据的原始尺寸不变，页面布局不会发生变化，浏览器只会进行重绘。

`scale` 并**不支持百分比值和 normal 关键字**，只能是数值，并且**支持负数**，**可以只控制一个维度**。

`zoom` 相反，支持百分比值，`normal` 关键字和数字，但**不支持负数**，且**只能等比例控制**。

`zoom` 的缩放以**左上角为中心**，无论如何缩放，元素的左上角坐标不变。

`scale` 默认是**居中**缩放。可以通过 `transform-origin` 属性改变缩放中心。

`zoom` **受浏览器最小字号限制**，文字只能缩小到最小字号；而 `scale` 是纯粹地进行文字缩小。

## CSS 定位

- `fixed`：元素的位置相对于浏览器窗口是固定位置，即使窗口是滚动的它也不会移动。`fixed` 定位会使得元素脱离当前文档流，因此不占据空间。
- `absolute`：绝对定位的元素的位置相对于最近的已定位父元素，`absolute` 定位会使得元素脱离当前文档流，因此不占据空间。
- `sticky`：元素先按照普通文档流定位，然后相对于该元素在流中的 flow root(BFC) 和最近的块级元素祖先定位。而后定位表现为在跨越特定阈值之前为相对定位，之后就变为固定定位。

## relative 相对于谁进行定位?

定位为 `relative` 的元素脱离正常的文档流，但其在文档流中的位置依然存在，只是视觉上相对原来的位置有移动。

他是默认参照父级的原始点为原始点（父级不是必须设定 `position` 属性），无论父级存在不存在，无论有没有 TRBL(`Top`、`Right`、`Bottom`、`Left`)，均是以父级的左上角进行定位，但是父级的 `Padding` 属性会对其影响。

无父级则以文本流的顺序在上一个元素的底部为原始点。

## 布局和包含块

一个元素的尺寸和位置经常受其**包含块**的影响。包含块就是这个元素**最近的祖先块元素的内容区**，但也不是总是这样。

当一个客户端代理（比如说浏览器）展示一个文档的时候，对于每一个元素，它都产生了一个盒子。每一个盒子都被划分为四个区域：

1. 内容区
2. 内边距区
3. 边框区
4. 外边距区

![](https://mdn.mozillademos.org/files/16558/box-model.png)

确定一个元素的包含块完全依赖于这个元素的 `position` 属性：

1. 如果 `position` 属性为 `static` 、 `relative` 或 `sticky`，包含块可能由它的**最近的祖先块元素**的内容区的边缘组成，也可能会建立格式化上下文。
2. 如果 `position` 属性为 `absolute` ，包含块就是由它的最近的 `position` 的值不是 `static` （也就是值为 `fixed`, `absolute`, `relative` 或 `sticky`）的祖先元素的**内边距区的边缘**组成。
3. 如果 `position` 属性是 `fixed`，在连续媒体的情况下(continuous media)包含块是 **viewport**(可视视口) ,在分页媒体(paged media)下的情况下包含块是分页区域(page area)。
4. 如果 `position` 属性是 `absolute` 或 `fixed`，包含块也可能是由满足以下条件的最近父级元素的内边距区的边缘组成的。
   - `transform` 或 `perspective` 的值不是 `none`。
   - `will-change` 的值是 `transform` 或 `perspective`。
   - `filter` 的值不是 `none` 或 `will-change` 的值是 `filter`(只在 Firefox 下生效)。
   - `contain` 的值是 `paint` (例如: `contain: paint;`)。

## 幽灵空白节点怎么产生的，如何解决？

幽灵空白节点和行内元素有关。

![](https://pic2.zhimg.com/80/fa1bef7a27a3c235a2e9bd8de5ba5448_720w.jpg)

行内元素的 `vertical-align` 默认是基线对齐的，而幽灵红白节点的大小正是 `baseline` 和 `bottom` 之间的距离，这段距离是为了容纳 `pqgj` 等等有小尾巴的西文字符而存在的。

另外，`top` 与 `bottom` 之间的距离是由 `line-height` 决定的。而如果没有设置 `line-height`，`line-height` 的默认值是基于 `font-size` 的。

综上所述，我们有几种方法可以解决这个问题：

1. 将行内元素转换为块元素。
2. 将 `vertical-align` 设置为其他值。
3. 将 `line-height` 设置为 0。
4. 将 `font-size` 设置为 0。
