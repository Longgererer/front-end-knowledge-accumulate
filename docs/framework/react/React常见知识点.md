# React 常见知识点

## 1. React 是怎么绑定并处理事件的？

如下：

```jsx
<div onClick="{this.handleClick.bind(this)}">点我</div>
```

React 并不是将 `click` 事件绑定到了 `div` 的真实 DOM 上，而是在 `document` 处监听了所有的事件，当事件发生并且冒泡到 `document` 处的时候，React 将事件内容封装并交由真正的处理函数运行。这样的方式不仅仅减少了内存的消耗，还能在组件挂在销毁时统一订阅和移除事件。

