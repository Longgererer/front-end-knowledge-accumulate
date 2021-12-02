---
tags:
  - CSS
  - css
---

# Sass

Sass 分为两种版本，一个是以.sass 为后缀名，一个是以.scss 为后缀名

Sass3 其实就是 Scss，Scss 完全兼容 CSS3 且拥有 Sass 全部特性，但是格式偏向 CSS 而不是 Sass

## 嵌套规则

嵌套功能避免了重复输入父选择器，而且令复杂的 CSS 结构更易于管理

```scss
#main p {
  color: #00ff00;
  width: 97%;

  .redbox {
    background-color: #ff0000;
    color: #000000;
  }
}
```

## 父选择器 &

假如我想给 button 元素设置一个 hover 属性，用普通 css 会是这样：

```css
.btn {
  padding: 15px;
  border-radius: 4px;
}

.btn:hover {
  background-color: #ccc;
}
```

如果用父选择器就简洁多了：

```scss
.btn {
  padding: 15px;
  border-radius: 4px;
  &:hover {
    background-color: #ccc;
  }
}
```

& 必须作为选择器的第一个字符，其后可以跟随后缀生成复合的选择器：

```scss
#main {
  color: black;
  &-sidebar {
    border: 1px solid;
  }
}
```

编译后：

```scss
#main {
  color: black;
}
#main-sidebar {
  border: 1px solid;
}
```

## 属性嵌套

除了元素可以嵌套之外，属性也可以嵌套：

```scss
.funky {
  font: {
    family: fantasy;
    size: 30em;
    weight: bold;
  }
}
```

也可以这样：

```scss
.funky {
  font: 30em {
    family: fantasy;
    weight: bold;
  }
}
```

这两种写法编译后都是：

```css
.funky {
  font-family: fantasy;
  font-size: 30em;
  font-weight: bold;
}
```

## SassScript

### 变量

以\$符号开头赋值

```scss
$width: 5em;
#main {
  width: $width;
}
```

与 js 一样，sass 中定义的变量也是有作用域的，局部变量可以通过!global 转换为全局变量

```scss
#main {
  $width: 5em !global;
  width: $width;
}

#sidebar {
  width: $width;
}
```

### 数据类型

SassScript 支持如下数据类型

- 数字（包括 10px 这种也算数字）
- 字符串（包括单引号双引号和无引号的字符串）
- 颜色（包括单词，HEX 和 RGB）
- 布尔值
- null
- 数组，用空格或者逗号做分隔符（1.5em 1em 0 2em）
- maps，相当于 object(key1: value1, key2: value2)

**注意**：像 unicode 或者!important 这些一律看作无引号字符串

### 字符串

在使用#{}的时候，带引号的字符串会被编译成无引号的字符串，这样便于在 mixin 中选择

```scss
@mixin box($selector) {
  box #{$selector}:before {
    content: "hello world!";
  }
}
@include box(".header");
```

编译后：

```css
box .header:before {
  content: "hello world!";
}
```

### 数组

假如我有三个 li，我想给这三个 li 不同的背景颜色，可以使用数组来实现

```scss
$red: #ff0000;
$blue: #0000ff;
$yellow: #00ff00;

$bgList: $red $blue $yellow;

@for $i from 1 to length($bgList) + 1 {
  ul li:nth-child(#{$i}) {
    background-color: nth($bgList, $i);
  }
}
```

from 后的数值，即循环开始的 i 值不能为 0，这是语法规定的

### maps

maps 和数组不同的是 maps 必须用()包裹，并且有键值对

上面的例子也可以用 map 来实现

```scss
$red: #ff0000;
$blue: #0000ff;
$yellow: #00ff00;

$bgList: (
  1: $red,
  2: $blue,
  3: $yellow
);

@each $i, $color in $bgList {
  ul li:nth-child(#{$i}) {
    background-color: $color;
  }
}
```

### 运算

SassScript 支持数字的加减乘除、取整等运算 (+, -, \*, /, %)，如果必要会在不同单位间转换值。

```scss
p {
  width: 1in + 5pt;
}
```

编译后：

```scss
p {
  width: 1.111in;
}
```

关系运算 <, >, <=, >= 也可用于数字运算，相等运算 ==, != 可用于所有数据类型。

以下三种情况 / 将被视为除法运算符号：

- 如果值，或值的一部分，是变量或者函数的返回值
- 如果值被圆括号包裹
- 如果值是算数表达式的一部分

```scss
p {
  $width: 1000px;
  width: $width/2;
  width: round(1.5) / 2;
  height: (500px/2);
  margin-left: 5px + 8px/2px;
}
```

像 `font: 5px/2px` 本身就是 css 语法，不会被当作除法运算

### 颜色运算

颜色值的运算是分段计算进行的，也就是分别计算红色，绿色，以及蓝色的值：

```scss
p {
  color: #010203 + #040506;
}
```

计算 01 × 2 = 02 02 × 2 = 04 03 × 2 = 06，然后编译为

```css
p {
  color: #020406;
}
```

当然，如果颜色包含了 alpha，则两个 alpha 必须要一样才能计算

在有引号的文本字符串中使用 #{} 插值语句可以添加动态的值：

```scss
p:before {
  content: "I ate #{5 + 10} pies!";
}
```

## 指令

### @import

@import 除了可以导入 css 外还能导入 sass 和 scss 文件

如果需要导入 SCSS 或者 Sass 文件，但又不希望将其编译为 CSS，只需要在文件名前添加下划线，这样会告诉 Sass 不要编译这些文件，但导入语句中却不需要添加下划线。

```scss
@import "colors";
```

这样会添加 \_colors.scss 文件

假设 example.scss 文件包含以下样式：

```scss
.example {
  color: red;
}
```

然后导入到 #main 样式内

```scss
#main {
  @import "example";
}
```

将会被编译为

```css
#main .example {
  color: red;
}
```

### @extend

一个元素使用的样式与另一个元素完全相同，但又添加了额外的样式，通常会在 HTML 中给元素定义两个 class，一个通用样式，一个特殊样式

scss 可以这样做

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}
.seriousError {
  @extend .error;
  border-width: 3px;
}
```

有时，需要定义一套样式并不是给某个元素用，而是只通过 @extend 指令使用

可以用@extend-Only 选择器

```scss
#context a%extreme {
  color: blue;
  font-weight: bold;
  font-size: 2em;
}
.notice {
  @extend %extreme;
}
```

编译为

```css
#context a.notice {
  color: blue;
  font-weight: bold;
  font-size: 2em;
}
```

### @for

@for 指令可以在限制的范围内重复输出格式，每次按要求（变量的值）对输出结果做出变动

格式有两种：

- `@for $var from <start> through <end>`
- `@for $var from <start> to <end>`

这两个的区别在于 through 包含开始和结束的值，使用 to 只包含开始而不包含结束值，\$var 可以是任何变量，开始和结束值必须为整数值

```scss
@for $i from 1 through 3 {
  .item-#{$i} {
    width: 2em * $i;
  }
}
```

编译为：

```css
.item-1 {
  width: 2em;
}
.item-2 {
  width: 4em;
}
.item-3 {
  width: 6em;
}
```

### @each

格式为 `$var in <list>`

\$var 可以是任何变量名， list 是一连串的值

@each 将变量 \$var 作用于值列表中的每一个项目，然后输出结果

### @while

@while 指令重复输出格式直到表达式返回结果为 false。这样可以实现比 @for 更复杂的循环，只是很少会用到

```scss
$i: 6;
@while $i > 0 {
  .item-#{$i} {
    width: 2em * $i;
  }
  $i: $i - 2;
}
```

### @mixin

混合指令（Mixin）用于定义可重复使用的样式，避免了使用无语意的 class

```scss
@mixin large-text {
  font: {
    family: Arial;
    size: 20px;
    weight: bold;
  }
  color: #ff0000;
}
```

### @include

使用 @include 指令引用混合样式，格式是在其后添加混合名称，以及需要的参数

```scss
.page-title {
  @include large-text;
  padding: 4px;
  margin-top: 10px;
}
```

编译为

```scss
.page-title {
  font-family: Arial;
  font-size: 20px;
  font-weight: bold;
  color: #ff0000;
  padding: 4px;
  margin-top: 10px;
}
```

@mixin 也可以接收参数

```scss
@mixin sexy-border($color, $width) {
  border: {
    color: $color;
    width: $width;
    style: dashed;
  }
}
p {
  @include sexy-border(blue, 1in);
}
```

混合指令也可以使用给变量赋值的方法给参数设定默认值，然后，当这个指令被引用的时候，如果没有给参数赋值，则自动使用默认值

```scss
@mixin sexy-border($color, $width: 1in) {
  border: {
    color: $color;
    width: $width;
    style: dashed;
  }
}
p {
  @include sexy-border(blue);
}
h1 {
  @include sexy-border(blue, 2in);
}
// 也可以用关键词参数，增加可读性
h1 {
  @include sexy-border($color: blue, $width: 2in);
}
```

当不知道传入多少个参数的时候，可以用：

```scss
@mixin box-shadow($shadows...) {
  -moz-box-shadow: $shadows;
  -webkit-box-shadow: $shadows;
  box-shadow: $shadows;
}
.shadows {
  @include box-shadow(0px 4px 5px #666, 2px 6px 10px #999);
}
```

## 输出形式

sass 的[四种输出形式](https://www.sass.hk/docs/)
