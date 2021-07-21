---
tags:
  - CSS
  - css
---

# BFC

BFC（Block formatting context）就是块级格式化上下文，它是一个独立的渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及其子元素的关系和相互作用。

## 特性

- 内部 box 会在垂直方向一个接一个的放置
- box 垂直方向的距离由 margin 决定，在一个 BFC 中，两个相邻的块级盒子的垂直外边距会产生重叠
- 每个元素的 margin box 的左边， 与包含块 border box 的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此
- BFC 的区域不会与 float box 重叠
- BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此
- 计算 BFC 的高度时，浮动元素也参与计算

## 生成方式

- `html` 根元素
- `float` 浮动
- `position` 为 `absolute` 或 `fixed`
- `overflow`: `auto`/`hidden`/`scroll` 的元素
- `display` 为 `inline-block`, `table-cell`, `table-caption`, `flex`, `inline-flex`, `grid`

## 作用

### 自适应两栏布局

```html
<div class="aside"></div>
<div class="main"></div>
```

```css
.aside {
  width: 100px;
  height: 150px;
  float: left;
  background: yellowgreen;
}
.main {
  height: 200px;
  background: cornflowerblue;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/SekgUuoIrvlX5x1.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/SekgUuoIrvlX5x1.jpg)</a>

可以看到 aside 浮动之后，main 的左边依然会和 aside 的左边相接触，而 BFC 区域不会和 float box 区域重叠，可以将 main 变为 BFC 布局：

```css
.main {
  height: 200px;
  background: cornflowerblue;
  overflow: hidden;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/NZFdrI8AYvGPw2E.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/NZFdrI8AYvGPw2E.jpg)</a>

成功实现自适应两栏布局

### 清除内部浮动

```html
<div class="parent">
  <div class="child"></div>
  <div class="child"></div>
</div>
```

```css
.parent {
  border: 5px solid #fcc;
  width: 300px;
}

.child {
  border: 5px solid #f66;
  width: 100px;
  height: 100px;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/7GcmXgTaHyjYlz9.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/7GcmXgTaHyjYlz9.jpg)</a>

假如我想将两个盒子浮动变成一行，就会出现因为浮动元素不会撑开父元素导致的布局问题：

```css
.child {
  border: 5px solid #f66;
  width: 100px;
  height: 100px;
  float: left;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/SkfVv1Pj6T4c89t.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/SkfVv1Pj6T4c89t.jpg)</a>

根据 BFC 规则，计算 BFC 的高度时，float 元素也参与计算：

```css
.parent {
  border: 5px solid #fcc;
  width: 300px;
  overflow: hidden;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/5Eou4mSR1IBQAWV.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/5Eou4mSR1IBQAWV.jpg)</a>

### 防止垂直外边距重叠

还是用上面的例子：

```css
.parent {
  border: 5px solid #fcc;
  width: 200px;
}
.child {
  border: 5px solid #f66;
  width: 100px;
  height: 100px;
  margin: 50px;
}
```

效果：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/gUW59qHtymds2R8.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/gUW59qHtymds2R8.jpg)</a>

可以明显地看到两个子元素的垂直外边距重合了，只有 50px，根据 BFC 规则：Box 的垂直方向由 margin 决定，属于同一个 BFC 的两个相邻 Box 的 margin 会发生重叠

所以可以有两种解决方法：

- 使两个 Box 不相邻

```html
<div class="parent">
  <div class="child"></div>
  <div class="warp"></div>
  <div class="child"></div>
</div>
```

```css
.warp {
  overflow: hidden;
}
```

- 使两个 Box 不属于同一个 BFC

```html
<div class="parent">
  <div class="child"></div>
  <div class="warp">
    <div class="child"></div>
  </div>
</div>
```

```css
.warp {
  overflow: hidden;
}
```

效果都为：

<a data-fancybox title="截图未命名.jpg" href="http://picstore.lliiooiill.cn/jhpQ2dAb3DqSkG9.jpg">![截图未命名.jpg](http://picstore.lliiooiill.cn/jhpQ2dAb3DqSkG9.jpg)</a>

> BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。

因为 BFC 内部的元素和外部的元素绝对不会互相影响，因此， 当 BFC 外部存在浮动时，它不应该影响 BFC 内部 Box 的布局，BFC 会通过变窄，而不与浮动有重叠。同样的，当 BFC 内部有浮动时，为了不影响外部元素的布局，BFC 计算高度时会包括浮动的高度。避免 margin 重叠也是这样的一个道理。
