# CSS 权重

说到 CSS 权重，只要写过 CSS 的基本上都要处理优先级的问题，大厂也经常将它作为面试题目。

如何缕清各个 CSS 权重等级呢？一张图就可以了：

![](http://picstore.lliiooiill.cn/1626913698%281%29.jpg)

首先我们要知道选择器有哪些类型，下面这些选择器的权重等级是递增的：

1. 如标签名(`h1`、`div` 等)，和伪元素(`::before` 等)。权重为 `0-0-1`。
2. 如类名(`.example`)、伪类(`:active` 等)和属性选择器(`[type="text"]` 等)。权重为 `0-1-0`。
3. 如 ID 选择器 `#example`。权重为 `1-0-0`。

:::tip Notice
浏览器是从高层开始比较大小的，因此低层级无论有多大，优先级都不可能超过高层级，如 `0-0-10000` 的优先级仍然小于 `0-1-0`。
:::

:::tip Notice
除了上述所提到的，通配选择符(`*`)、关系选择符(`+`、`>`、`~`、`_`、`||`)和否定伪类(`:not`)对权重本身是无影响的(但`:not()`内部声明的选择器仍会影响优先级)。
:::

## 计算 CSS 权重

考虑以下情况：

情况 1：

```css
div span {
  /* ... */
}
```

我们看到该 CSS 声明中包含两个权重为 `0-0-1` 的选择器，因此权重为 `0-0-2`。

情况 2：

```css
div.example span {
  /* ... */
}
```

我们看到该 CSS 声明中包含两个权重为 `0-0-1` 的选择器，和一个权重为 `0-1-0` 的选择器，因此权重为 `0-1-2`。

情况 3：

```css
div#example span .example {
  /* ... */
}
```

我们看到该 CSS 声明中包含两个权重为 `0-0-1` 的选择器，和一个权重为 `0-1-0` 的选择器，还有一个权重为 `1-0-0` 的选择器，因此权重为 `1-1-2`。

情况 4：

```css
#example:not(nav) ul > li:first-child::before {
  /* ... */
}
```

这个情况比较复杂，我们可以看到里面有四个权重为 `0-0-1` 的选择器(`ul`,`li`,`::before`,`nav`)和一个权重为 `0-1-0` 的选择器(`:first-child`)还有一个权重为 `1-0-0` 的选择器(`#example`)，因此权重为 `1-1-4`。

除了在 CSS 代码声明，标签内的内联样式 `style=""` 权重比上面的选择器都高。

### 特殊情况

我们现在已经明白了各种选择器的权重计算，但凡事都会有特殊情况：

#### `!important`

当我们在样式中声明 `!important` 规则时，此声明将覆盖任何其他声明，它是无敌的，只有另一个 `!important` 才能覆盖掉 `!important`！！！因此，尽量不要使用 `!important` 规则。

## 参考文章

- [CSS 权重图示](https://specifishity.com/)
- [优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)
- [The Quick Guide to CSS Specificity](https://slicejack.com/quick-guide-to-css-specificity/#:~:text=Calculating%20CSS%20Specificity%20%20%20%20Selector%20,%E2%80%93%200%2C0%20...%20%2011%20more%20rows%20)
