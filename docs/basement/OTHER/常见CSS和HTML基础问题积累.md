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

## 