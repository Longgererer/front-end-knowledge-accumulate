# Vue3 对于 Vue2 的深层次优化

## Proxy 代替 Object.defineProperty

Vue3 使用 `Proxy` 代替 `Object.defineProperty` 是为什么呢？先来单纯地比较一下这两个 API 在进行双向绑定时的优劣。

### Proxy vs Object.defineProperty

这两个 API 在处理响应式数据时的区别如下：

1. `Object.defineProperty` 只能劫持对象的属性，因此需要循环遍历对象，还要处理嵌套对象，非常麻烦和低效。而 `Proxy` 可以劫持整个对象，当然也不支持嵌套对象。
2. `Object.defineProperty` 仅支持 6 个属性的劫持，而 `Proxy` 可以支持 13 个！

![](https://pic4.zhimg.com/80/v2-8161e0af941b8f803a5c2dec0cc2b10b_720w.jpg)

3. `Object.defineProperty` 只能劫持对象，而 `Proxy` 还可以劫持数组，因此使用 `pop`、`push` 等方法改变数组 `length` 也可以被监听到，而不必像 Vue2 一样对数组方法进行二次封装。

```js
const arr = [1, 2, 3]
const arrP = new Proxy(arr, {
  set(target, key, value, receiver) {
    console.log(key, value)
    return value
  },
})

arrP[0] = -1 // 0 -1
arrP.push(4) // 3 4; length 4
```

> 实际上，`Object.defineProperty` 并非不能劫持数组，毕竟数组也只是以数字为键的特殊对象，但是对一个数组遍历监听属性变化代价太大，因此 Vue2 没有这样做。

4. `Object.defineProperty` 兼容性较好，`Proxy` 兼容性较差并且没有合适的 polyfill，这也是 Vue2 没有采用 `Proxy` 的原因。

5. `Object.defineProperty` 对新增属性需要手动进行监听，因此 Vue2 中给 `data` 中的数组或对象新增属性时，需要使用 `vm.$set` 才能保证新增的属性也是响应式的。

## 源码结构

Vue3 不同于 Vue2 也体现在源码结构上，Vue3 把耦合性比较低的包分散在 `packages` 目录下单独发布成 `npm` 包。 这也是目前很流行的一种大型项目管理方式 **Monorepo**。

## 参考文章

- [Vue3 的响应式和以前有什么区别，Proxy 无敌？](https://juejin.cn/post/6844904122479542285)