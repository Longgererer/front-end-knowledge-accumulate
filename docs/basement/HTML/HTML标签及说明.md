# HTML 标签类型

HTML 中的标签默认可以分为两种类型：`block`(块)和`inline`(行内)。

## block

块级元素占据父元素的整个宽度，默认情况下，即使上一行有空间，块元素也会另起一行。

块级元素设置 `width` 和 `height` 是有效的，也可以设置 `padding` 和 `margin`，但即使设置了宽度，也仍然是独占一行。

HTML5 的块级元素如下：

**`address`**、`article`、`aside`、**`audio`**、`blockquote`、**`canvas`**、**`dd`**、**`dl`**、**`div`**、**`p`**、`fieldset`、`figcaption`、`figure`、**`footer`**、**`header`**、**`form`**、**`h1~h6`**、**`hr`**、`hgroup`、`noscript`、**`ol`**、`output`、**`pre`**、**`section`**、**`table`**、`tfoot`、**`ul`**、**`video`**

## inline

一个行内元素只占据它对应标签的边框所包含的空间，默认情况下，行内元素不会以新行开始。

`b`、`big`、`small`、**`tt`**、`i`、`abbr`、`acronym`、`cite`、`code`、`dfn`、`em`、`kbd`、`strong`、`samp`、`var`、**`a`**、`bdo`、**`br`**、**`img`**、`map`、`object`、`q`、**`script`**、**`span`**、`sub`、`sup`、**`button`**、**`input`**、**`label`**、**`select`**、**`textarea`**

## inline-block

行内块元素简单来说就是将对象呈现为 inline 对象，但是对象的内容作为 block 对象呈现。之后的内联对象会被排列在同一行内。比如我们可以给一个 link（a 元素）inline-block 属性值，使其既具有 block 的宽度高度特性又具有 inline 的同行特性。

## 参考文章

- [内容分类-MDN](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/Content_categories)
- [block，inline 和 inline-block 概念和区别](https://www.cnblogs.com/keithwang/p/3139517.html)
