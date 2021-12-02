---
tags:
  - CSS
---

# Grid

> 我们知道 `flex` 布局是一种非常优秀的布局，非常适用于响应式布局，但是 `flex` 任然不是最强大的布局，`grid` 才是现今最为强大的布局方案

`grid` 的优势在于，它可以将网页划分成一个个网格，可以任意组合成不同的网格，以实现各种各样的布局

## grid 和 flex 的区别

两者的区别是非常大的，是二维和一维的区别，`flex` 布局是轴线布局，只能指定元素相对于轴线的位置，而 `grid` 却可以将容器分为行和列，产生单元格

## 学习 grid

```html
<div id="grid">
  <div><span>1</span></div>
  <div><span>2</span></div>
  <div><span>3</span></div>
</div>
```

如果我给 `id` 为 `grid` 的元素指定为 `grid` 布局，那么它的三个 `div` 子元素就会采取网格定位，子元素里面的 `span` 则不会，因为 `span` 不是直接子元素

### display

可以设置 `div` 为块元素，也可以设置为行内元素

```css
display: grid;
display: inline-grid;
```

> 设为网格布局以后，容器子元素（项目）的 `float`、`display: inline-block`、`display: table-cell`、`vertical-align` 和 `column-*` 等设置都将失效

### 行和列

`grid-template-columns` 属性定义每一列的列宽，`grid-template-rows` 属性定义每一行的行高

```css
#grid {
  display: grid;
  grid-template-columns: 50px 50px 50px;
  grid-template-rows: 50px 50px 50px;
}
```

这样就指定了一个三行三列的网格，行高列宽都是 `50px`

也可以使用百分比

```css
#grid {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
  grid-template-rows: 33.33% 33.33% 33.33%;
}
```

使用 `repeat` 可以少写重复数值

```css
#grid {
  display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%);
}
```

`repeat` 第一个参数是重复次数，第二个是重复数值

也可以重复多个值

```css
grid-template-columns: repeat(3, 100px 20px 80px);
```

这样就会有 9 列从一至九列的宽度为 `100px 20px 80px 100px 20px 80px 100px 20px 80px`

如果想要实现子元素超过容器宽度会换行的效果，可以使用

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
}
```

想实现 `flex` 布局那样等比例宽度也可以

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

这样会产生列宽相同的两列，各占容器宽度的 50%

也可以和绝对数值一起使用

```css
.container {
  display: grid;
  grid-template-columns: 150px 1fr 2fr;
}
```

第一列宽度固定 `150px`，第三列是第二列宽度的两倍

`minmax` 可以指定长度范围，将元素宽度限制在这个范围中

```css
grid-template-columns: 1fr 1fr minmax(100px, 1fr);
```

这样第三列宽度最小为 `100px`，最大为 `1fr`

auto 表示让浏览器自己决定宽度

```css
grid-template-columns: 100px auto 100px;
```

这样第一列和第三列都是 `100px`，第二列宽度等于容器宽度减去 `200px`

可以给每一条网格线起名字，方便日后引用

```css
.container {
  display: grid;
  grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];
  grid-template-rows: [r1] 100px [r2] 100px [r3] auto [r4];
}
```

网格布局允许同一根线有多个名字，比如 `[fifth-line row-5]`

`grid-row-gap` 属性设置行与行的间隔（行间距），`grid-column-gap` 属性设置列与列的间隔（列间距）

```css
.container {
  row-gap: 20px;
  column-gap: 10px;
}
```

也可以简写为

```css
.container {
  gap: 20px 10px;
}
```

如果只写一个值，那么默认行列边距相等

### 区域

一个区域由多个单元格组成，`grid-template-areas` 属性用于定义区域

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas:
    "a b c"
    "d e f"
    "g h i";
}
```

多个单元格合并成一个区域的写法如下

```css
grid-template-areas:
  "a a a"
  "b b b"
  "c c c";
```

如果某些区域不需要利用，则使用"点"（.）表示

```css
grid-template-areas:
  "a . c"
  "d . f"
  "g . i";
```

划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。默认的放置顺序是"先行后列"，即先填满第一行，再开始放入第二行

如果想要改变顺序，先填满列再填满行，可以将 `grid-auto-flow` 属性的值改为 `column`, `grid-auto-flow` 的默认属性是 `row`

```css
grid-auto-flow: column;
```

`row dense` 表示先行后列并且尽可能填满不留空白

```css
grid-auto-flow: row dense;
```

也可以变成 `column dense`

### 对齐

`justify-items` 属性设置单元格内容的水平位置（左中右），`align-items` 属性设置单元格内容的垂直位置（上中下）。

```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```

这几个属性说明如下

- start：对齐单元格的起始边缘
- end：对齐单元格的结束边缘
- center：单元格内部居中
- stretch：拉伸，占满单元格的整个宽度（默认值）

`place-items` 属性是 `align-items` 属性和 `justify-items` 属性的合并简写形式

```css
place-items: <align-items> <justify-items>;
```

省略第二个值表示两个值相等

`justify-content` 属性是整个内容区域在容器里面的水平位置（左中右），`align-content` 属性是整个内容区域的垂直位置（上中下）

```css
.container {
  justify-content: start | end | center | stretch | space-around | space-between
    | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between |
    space-evenly;
}
```

这几个属性说明如下

- start - 对齐容器的起始边框
- end - 对齐容器的结束边框
- center - 容器内部居中
- stretch - 项目大小没有指定时，拉伸占据整个网格容器
- space-around - 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与容器边框的间隔大一倍
- space-between - 项目与项目的间隔相等，项目与容器边框之间没有间隔
- space-evenly - 项目与项目的间隔相等，项目与容器边框之间也是同样长度的间隔

`place-content` 属性是 `align-content` 属性和 `justify-content` 属性的合并简写形式

```css
place-content: <align-content> <justify-content>;
```

如果省略第二个值，浏览器就会假定第二个值等于第一个值

有时候，一些项目的指定位置，在现有网格的外部。比如网格只有 3 列，但是某一个项目指定在第 5 行，这时，浏览器会自动生成多余的网格，以便放置项目

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-auto-rows: 50px;
}
```

### 子元素属性

子元素的位置是可以指定的，具体方法就是指定子元素的四个边框，分别定位在哪根网格线

- grid-column-start 属性：左边框所在的垂直网格线
- grid-column-end 属性：右边框所在的垂直网格线
- grid-row-start 属性：上边框所在的水平网格线
- grid-row-end 属性：下边框所在的水平网格线

这四个属性的值还可以使用 `span` 关键字，表示"跨越"，即左右边框（上下边框）之间跨越多少个网格

```css
.item-1 {
  grid-column-start: span 2;
}
```

这样就表示 1 号元素的左边框距离右边框跨越 2 个网格

`grid-column` 属性是 `grid-column-start` 和 `grid-column-end` 的合并简写形式，`grid-row` 属性是 `grid-row-start` 属性和 `grid-row-end` 的合并简写形式

```css
.item-1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
/* 等同于 */
.item-1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
}
```

`grid-area` 属性指定项目放在哪一个区域

```css
.item-1 {
  grid-area: e;
}
```

`grid-area` 属性还可用作 `grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end` 的合并简写形式，直接指定项目的位置

```css
.item {
  grid-area: <row-start> / <column-start> / <row-end> / <column-end>;
}
```

```css
.item-1 {
  grid-area: 1 / 1 / 3 / 3;
}
```

`justify-self` 属性设置单元格内容的水平位置（左中右），跟 `justify-items` 属性的用法完全一致，但只作用于单个项目。

`align-self` 属性设置单元格内容的垂直位置（上中下），跟 `align-items` 属性的用法完全一致，也是只作用于单个项目。

```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
}
```

`place-self` 属性是 `align-self` 属性和 `justify-self` 属性的合并简写形式

如果省略第二个值，`place-self` 属性会认为这两个值相等
