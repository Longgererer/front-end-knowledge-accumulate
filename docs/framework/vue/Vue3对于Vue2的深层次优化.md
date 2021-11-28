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

## PatchFlag(静态标记)

在 Vue2 中，每一个组件对应一个 `Observer` 实例，它会在组件渲染过程中把用到的数据记录为依赖，当依赖发生改变触发 `setter`，则会通知 `Observer` 使得关联的组件重新渲染。

假如有一个组件：

```html
<template>
  <div id="content">
    <p class="text">静态文本</p>
    <p class="text">静态文本</p>
    <p class="text">{{ message }}</p>
    <p class="text">静态文本</p>
    <p class="text">静态文本</p>
  </div>
</template>
```

可以看到，组件内部只有一个动态节点，剩余一堆都是静态节点。而 Vue2 中的虚拟 DOM 采用的是全量对比的模式，因此在 `message` 改变之后，diff 算法会将所有 p 标签都比较一次。

Vue3 在 diff 算法中相比 Vue2 增加了**PatchFlag(静态标记)**。

在创建虚拟 DOM 时，根据 DOM 内容是否会发生改变而给予一个静态标记 `flag`。

我们在下面这个网站查看代码编译后生成的结构：[Vue3 模板编译](https://vue-next-template-explorer.netlify.app/)

```js
import {
  createElementVNode as _createElementVNode,
  toDisplayString as _toDisplayString,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from 'vue'

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createElementBlock('div', { id: 'content' }, [
      _createElementVNode('p', { class: 'text' }, '静态文本'),
      _createElementVNode('p', { class: 'text' }, '静态文本'),
      _createElementVNode('p', { class: 'text' }, _toDisplayString(_ctx.message), 1 /* TEXT */),
      _createElementVNode('p', { class: 'text' }, '静态文本'),
      _createElementVNode('p', { class: 'text' }, '静态文本'),
    ])
  )
}
```

我们可以发现，包含 `message` 依赖的 `p` 标签后面多了一个 `1` 标记，表示文本。

Vue3 为不同类型分配了不同的标记值：

```js
export const enum PatchFlags {

  TEXT = 1,// 动态的文本节点
  CLASS = 1 << 1,  // 2 动态的 class
  STYLE = 1 << 2,  // 4 动态的 style
  PROPS = 1 << 3,  // 8 动态属性，不包括类名和样式
  FULL_PROPS = 1 << 4,  // 16 动态 key，当 key 变化时需要完整的 diff 算法做比较
  HYDRATE_EVENTS = 1 << 5,  // 32 表示带有事件监听器的节点
  STABLE_FRAGMENT = 1 << 6,   // 64 一个不会改变子节点顺序的 Fragment
  KEYED_FRAGMENT = 1 << 7, // 128 带有 key 属性的 Fragment
  UNKEYED_FRAGMENT = 1 << 8, // 256 子节点没有 key 的 Fragment
  NEED_PATCH = 1 << 9,   // 512
  DYNAMIC_SLOTS = 1 << 10,  // 动态 slot
  HOISTED = -1,  // 特殊标志是负整数表示永远不会用作 diff
  BAIL = -2 // 一个特殊的标志，指代差异算法
}
```

如果标签中既包含了多个动态依赖，标记值则为对应的依赖类型相加，假如 `p` 标签依赖动态文本，动态 `class` 和动态 `style`，那么标记值就是 `1+2+4=7`：

```js
_createElementVNode(
  'p',
  {
    class: _normalizeClass(['text', _ctx.dynamic]),
    style: _normalizeStyle({ background: _ctx.red }),
  },
  _toDisplayString(_ctx.message),
  7 /* TEXT, CLASS, STYLE */
)
```

## hoistStatic(静态提升)

先举个例子：

```js
for (let i = 0; i < 10000; i++) {
  for (let j = 0; j < 100; j++) {}
}

for (let i = 0; i < 100; i++) {
  for (let j = 0; j < 10000; j++) {}
}

let i = 0
let j = 0
for (; i < 100; i++) {
  for (; j < 10000; j++) {}
}
```

上面这三个循环哪个最快呢？这样的题目应该见怪不怪了吧，先看测试结果：

![](http://picstore.lliiooiill.cn/1637909765%281%29.jpg)

由于第一个循环总共声明了 `10000` 次 `i`，`10000*100` 次 `j`，因此耗时最长。

第二个循环总共声明了 `100` 次 `i`，`10000*100` 次 `j`，因此耗时第二。

第三个循环总共声明了 `1` 次 `i`，`1` 次 `j`，因此速度最快。

我们可以发现将循环中或者经常重复调用的代码块中的变量提升到上一级会大大增加执行速度。

再以之前的模板代码举例，在开启了静态提升后，编译后的代码如下：

```js
import {
  createElementVNode as _createElementVNode,
  toDisplayString as _toDisplayString,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from 'vue'

const _hoisted_1 = { id: 'content' }
const _hoisted_2 = /*#__PURE__*/ _createElementVNode('p', { class: 'text' }, '静态文本', -1 /* HOISTED */)
const _hoisted_3 = /*#__PURE__*/ _createElementVNode('p', { class: 'text' }, '静态文本', -1 /* HOISTED */)
const _hoisted_4 = { class: 'text' }
const _hoisted_5 = /*#__PURE__*/ _createElementVNode('p', { class: 'text' }, '静态文本', -1 /* HOISTED */)
const _hoisted_6 = /*#__PURE__*/ _createElementVNode('p', { class: 'text' }, '静态文本', -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createElementBlock('div', _hoisted_1, [
      _hoisted_2,
      _hoisted_3,
      _createElementVNode('p', _hoisted_4, _toDisplayString(_ctx.message), 1 /* TEXT */),
      _hoisted_5,
      _hoisted_6,
    ])
  )
}
```

可以发现 Vue3 将创建好的静态标签全部提升到了 `render` 函数外，只有依赖 `message` 的动态标签才会保留，这样只有第一次执行 `render` 函数的时候才需要创建静态标签，这些标签会被保存，之后再执行 `render` 直接调用即可，不用再重新创建了。

静态标签的标记值为 `-1`，这意味着永远不会被 diff 函数所比较。

## cacheHandler(事件监听缓存)

默认情况下 `@click` 事件被认为是动态变量，所以每次更新视图的时候都会追踪它的变化。但是正常情况下，我们的 `@click` 事件在视图渲染前和渲染后，都是同一个事件，基本上不需要去追踪它的变化，所以 Vue 3.0 对此作出了相应的优化叫事件监听缓存。

```html
<div>
  <p @click="handleClick">屋里一giao</p>
</div>
```

编译后是这样：

```js
import {
  createElementVNode as _createElementVNode,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from 'vue'

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createElementBlock('div', null, [
      _createElementVNode('p', { onClick: _ctx.handleClick }, '屋里一giao', 8 /* PROPS */, ['onClick']),
    ])
  )
}
```

这里 `p` 标签的标记为 `8`，表示动态属性，不包括类名和样式。因此我们要开启事件缓存。

开启事件缓存后：

```js
import {
  createElementVNode as _createElementVNode,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from 'vue'

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createElementBlock('div', null, [
      _createElementVNode(
        'p',
        {
          onClick: _cache[0] || (_cache[0] = (...args) => _ctx.handleClick && _ctx.handleClick(...args)),
        },
        '屋里一giao'
      ),
    ])
  )
}
```

开启之后，`p` 标签就没有标记了，也就是不会被 diff 算法处理，提升了性能。

## SSR 服务端渲染

当你在开发中使用 SSR 开发时，Vue 3.0 会将静态标签直接转化为文本：

编译前：

```html
<div id="content">
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
  <p class="text">{{ message }}</p>
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
</div>
```

编译后：

```js
import { mergeProps as _mergeProps } from 'vue'
import { ssrRenderAttrs as _ssrRenderAttrs, ssrInterpolate as _ssrInterpolate } from 'vue/server-renderer'

export function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _cssVars = { style: { color: _ctx.color } }
  _push(
    `<div${_ssrRenderAttrs(
      _mergeProps({ id: 'content' }, _attrs, _cssVars)
    )}><p class="text">静态文本</p><p class="text">静态文本</p><p class="text">${_ssrInterpolate(
      _ctx.message
    )}</p><p class="text">静态文本</p><p class="text">静态文本</p></div>`
  )
}
```

## StaticNode(静态节点)

在客户端渲染的时候，只要标签嵌套得足够多，编译时也会将其转化为 HTML 字符串：

编译前：

```html
<div id="content">
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
  <p class="text">静态文本</p>
</div>
```

编译后：

```js
import {
  createElementVNode as _createElementVNode,
  createStaticVNode as _createStaticVNode,
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from 'vue'

const _hoisted_1 = { id: 'content' }
const _hoisted_2 = /*#__PURE__*/ _createStaticVNode(
  '<p class="text">静态文本</p><p class="text">静态文本</p><p class="text">静态文本</p><p class="text">静态文本</p><p class="text">静态文本</p>',
  5
)
const _hoisted_7 = [_hoisted_2]

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock('div', _hoisted_1, _hoisted_7)
}
```

## 源码体积

相比 Vue2，Vue3 整体体积变小了，除了移出一些不常用的 API，再重要的是 Tree shanking。

任何一个函数，如 `ref`、`reactive`、`computed` 等，仅仅在用到的时候才打包，没用到的模块都被摇掉，打包的整体体积变小。

在 Vue2 中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是 Vue 实例在项目中是单例的，捆绑程序无法检测到该对象的哪些属性在代码中被使用到：

```js
import Vue from 'vue'

Vue.nextTick(() => {})
```

而在 Vue3 中，如果您不使用其某些功能，它们将不会包含在您的基础包中：

```js
import { nextTick, observable } from 'vue'

nextTick(() => {})
```

## 源码结构

Vue3 不同于 Vue2 也体现在源码结构上，Vue3 把耦合性比较低的包分散在 `packages` 目录下单独发布成 `npm` 包。 这也是目前很流行的一种大型项目管理方式 **Monorepo**。

## 参考文章

- [Vue3 的响应式和以前有什么区别，Proxy 无敌？](https://juejin.cn/post/6844904122479542285)
- [Vue3 教程：Vue 3.x 快在哪里？](https://juejin.cn/post/6903171037211557895)
