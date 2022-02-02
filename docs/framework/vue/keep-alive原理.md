# keep-alive 原理

## 介绍

keep-alive 是 Vue 的一个内置组件，本身并不会渲染成为 DOM 元素，使用 keep-alive 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。

## 使用

通常会搭配路由、动态组件使用：

```html
<keep-alive :include="whiteList" :exclude="blackList" :max="amount">
  <router-view></router-view>
</keep-alive>

<keep-alive :include="whiteList" :exclude="blackList" :max="amount">
  <component :is="currentComponent"></component>
</keep-alive>
```

当组件在 `keep-alive` 内被切换，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

::: tip Notice
在 2.2.0 及其更高版本中，`activated` 和 `deactivated` 将会在 `keep-alive` 树内的所有嵌套组件中触发。
:::

### include & exclude

`keep-alive` 支持两个过滤属性 `include` 和 `exclude`：

`include` 定义缓存白名单，值为逗号分隔字符串、正则表达式或一个数组。只有名称匹配的组件会被缓存。

`exclude` 定义缓存黑名单，值为逗号分隔字符串、正则表达式或一个数组。任何名称匹配的组件都不会被缓存。**优先级大于 `include`**。

```html
<!-- 逗号分隔字符串 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

匹配首先检查组件自身的 `name` 选项，如果 `name` 选项不可用，则匹配它的局部注册名称 (父组件 `components` 选项的键值)。匿名组件不能被匹配。

### max

`max` 表示最多可以缓存多少组件实例。一旦这个数字达到了，在新实例被创建之前，已缓存组件中最久没有被访问的实例会被销毁掉。

这里 `keep-alive` 所采用的缓存策略为 [LRU](../../algorithm/常见算法/缓存淘汰策略.html)。

## 虚拟节点

我们知道像 `keep-alive`、`transition`、`router-view` 这些内置组件都不会作为真正的节点渲染到页面上，那么 Vue 是如何处理它们的呢？

我们看看 `keep-alive` 的源代码：

```js {3}
export default {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number],
  },
  ...otherOptions, // 省略
}
```

`keep-alive` 组件中定义了一个 `abstract` 属性，Vue 在初始化生命周期的时候，为组件实例建立父子关系会根据 `abstract` 属性决定是否忽略某个组件。最后构建的组件树中就不会包含 `keep-alive` 组件。

## Vue 的渲染过程

Vue 渲染的大体过程如下：

![](http://picstore.lliiooiill.cn/980600268-5f392d78037ff_articlex.png)

首先，Vue 在渲染的时候会调用原型上的 `_render` 函数将组件转化为一个 `VNode` 实例，而 `_render` 是通过调用 `createElement` 和 `createEmptyVNode` 两个函数进行转化。

`createElement` 的转化过程会根据不同的情形选择 `new VNode` 或者调用 `createComponent` 函数做 `VNode` 实例化。

完成 `VNode` 实例化后，这时候 Vue 调用原型上的 `_update` 函数把 `VNode` 渲染为真实 DOM，这个过程又是通过调用 `__patch__` 函数完成的。

## keep-alive 包裹的组件是如何使用缓存？

下面是 `keep-alive` 所涉及的主要代码：

```js
// src/core/components/keep-alive.js
export default {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes, // 缓存白名单
    exclude: patternTypes, // 缓存黑名单
    max: [String, Number], // 缓存的组件实例数量上限
  },
  created() {
    this.cache = Object.create(null) // 缓存虚拟dom
    this.keys = [] // 缓存的虚拟dom的健集合
  },
  destroyed() {
    for (const key in this.cache) {
      // 删除所有的缓存
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  mounted() {
    // 实时监听黑白名单的变动
    this.$watch('include', (val) => {
      pruneCache(this, (name) => matches(val, name))
    })
    this.$watch('exclude', (val) => {
      pruneCache(this, (name) => !matches(val, name))
    })
  },
  render() {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot) // 找到第一个子组件对象
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // 存在组件参数
      // check pattern
      const name: ?string = getComponentName(componentOptions) // 组件名
      const { include, exclude } = this
      if (
        // 条件匹配
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key: ?string =
        vnode.key == null // 定义组件的缓存key
          ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
          : vnode.key
      if (cache[key]) {
        // 已经缓存过该组件
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key) // 调整key排序
      } else {
        cache[key] = vnode // 缓存组件对象
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          // 超过缓存数限制，将第一个删除
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true // 渲染和执行被包裹组件的钩子函数需要用到
    }
    return vnode || (slot && slot[0])
  },
}

// pruneCacheEntry 会执行组件的 destroy 钩子函数并将缓存值置为 null
function pruneCacheEntry(cache: VNodeCache, key: string, keys: Array<string>, current?: VNode) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy() // 执行组件的destroy钩子函数
  }
  cache[key] = null
  remove(keys, key)
}
```

在 `patch` 阶段，会执行 `createComponent` 函数：

```js
// src/core/vdom/patch.js
function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    /**
     * 第一次加载被包裹组件时 vnode.componentInstance 为 undefined
     * 再次访问被包裹组件时，vnode.componentInstance 的值就是已经缓存的组件实例
     */
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef((i = i.hook)) && isDef((i = i.init))) {
      i(vnode, false)
    }
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm) // 将缓存的DOM（vnode.elm）插入父元素中
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

## 参考文章

- [彻底揭秘 keep-alive 原理](https://juejin.cn/post/6844903837770203144)
- [Vue keep-alive](https://cn.vuejs.org/v2/api/#keep-alive)
