# Vite 是什么？

在此之前先贴一个[Vite 官中文档](https://cn.vitejs.dev/)

## 概述

Vite 基于 **ESM(ES modules)** 以肉眼可见的迅速进行开发模式下的模块热更新(HMR)，在生产模式下使用 Rollup 打包代码。

> 如果你不了解 ESM，可以看看 [模块化](./前端模块化发展.html#esm-es-modules)。

## 项目搭建

我们这次分析的 Vite 版本为 `2.3.7`。

首先常规操作，创建一个 Vite 项目：

```bash
npm init @vitejs/app
```

项目创建好，安装好了依赖，运行项目，我们在控制台中可以看到 `index.html` 中的代码：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1623728773%281%29.jpg">![](http://picstore.lliiooiill.cn/1623728773%281%29.jpg)</a>

可以看到 Vite 确实是依赖 ESM 进行模块化的。

## 流程

Vite 配置并启动了一个 Koa 和 WebSocket 服务。WebSocket 服务是用来进行 HMR 热更新的，这个等下会说到。而 Koa 服务则拦截浏览器对 ESM 的请求，将对应路径下的文件做一定处理并返回给客户端。

## 预构建

在启动 Vite 时，Vite 会对项目中所有依赖进行**预构建**。

由于 Vite 是使用 ESM 的形式导入模块，因此需要先将 CommonJS 或 UMD 形式的依赖转换为 ESM 形式。第二就是将多模块整合成单模块，通常情况下一个包包含许多内置模块，引入的时候如果不做处理，浏览器会发出许多个请求导致页面加载变慢。

### 缓存

在这之前，先了解一下 Vite 的文件缓存系统。预构建的依赖会被缓存到 `node_module/.vite` 中，只有在特定情况下如 `package.json` 依赖项改变时才会重新进行预构建。

`node_module` 中的依赖是**强缓存**的，因此单纯的修改依赖项文件是不会触发热更新的，可以删除 `node_module/.vite` 或者在命令行使用 `--force` 命令启动开发服务器来强制更新。

### 路径处理

我们在浏览器控制台查看各个模块的请求路径时会发现，Vite 会对我们请求的依赖进行路径处理：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1623748694%281%29.jpg">![](http://picstore.lliiooiill.cn/1623748694%281%29.jpg)</a>

比如高亮的这一行 Vue，Vite 会将依赖 Vue 的路径改成 `node_modules/.vite/vue.js?v=hash`，`node_module/.vite` 也就是 Vite 的预构建缓存的位置。除了 `node_module` 中的依赖项，其他路径都是正常的项目路径。

对于 `.vue` 文件，Vite 会进行进一步处理，就拿 `App.vue` 来说，这是原本的代码：

```javascript
<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + Vite" />
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

这是处理后的代码：

```javascript
import { createHotContext as __vite__createHotContext } from '/@vite/client'
// HMR
import.meta.hot = __vite__createHotContext('/src/App.vue')
// 引入子组件
import HelloWorld from '/src/components/HelloWorld.vue'

const _sfc_main = {
  expose: [],
  setup(__props) {
    return { HelloWorld }
  },
}
import {
  createVNode as _createVNode,
  createTextVNode as _createTextVNode,
  Fragment as _Fragment,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from '/node_modules/.vite/vue.js?v=a25af474'

// 创建虚拟node节点
const _hoisted_1 = /*#__PURE__*/ _createVNode(
  'img',
  {
    alt: 'Vue logo',
    src: '/src/assets/logo.png',
  },
  null,
  -1 /* HOISTED */
)
// 渲染节点
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createBlock(
      _Fragment,
      null,
      [_hoisted_1, _createVNode($setup['HelloWorld'], { msg: 'Hello Vue 3 + Vite' })],
      64 /* STABLE_FRAGMENT */
    )
  )
}
// 引入App.vue的样式表
import '/src/App.vue?vue&type=style&index=0&lang.css'

// 省略
```

`'/src/App.vue?vue&type=style&index=0&lang.css'` 内容：

```javascript
import { createHotContext as __vite__createHotContext } from '/@vite/client'
// HMR
import.meta.hot = __vite__createHotContext('/src/App.vue?vue&type=style&index=0&lang.css')
import { updateStyle, removeStyle } from '/@vite/client'
const id = 'E:/personal web/vite-analysis/vite-project/src/App.vue?vue&type=style&index=0&lang.css'
// style
const css =
  '\n#app {\n  font-family: Avenir, Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-align: center;\n  color: #2c3e50;\n  margin-top: 60px;\n}\n'
updateStyle(id, css)
import.meta.hot.accept()
export default css
import.meta.hot.prune(() => removeStyle(id))
```

因此 Vite 实际上将 Vue 文件分成了两个部分，一个是处理 HTML 和 JS 的代码，一个是处理 CSS 的代码。

在我们修改样式的时候，WebSocket 服务检测到改变，发送消息给客户端，浏览器会重新请求新的样式，请看下图：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1623750858%281%29.jpg">![](http://picstore.lliiooiill.cn/1623750858%281%29.jpg)</a>

可以看到更新样式后，WebSocket 发送了一个 message，里面包含了更新的路径以及时间戳。浏览器会发送这样的请求：`http://localhost:3000/src/App.vue?import&t=1623750496994&vue&type=style&index=0&lang.css` 里面就包含了路径和时间戳，时间戳可以确保唯一性。

但如果我们修改的是 HTML 或 JS，则会直接请求 `App.vue`:

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1623751155%281%29.jpg">![](http://picstore.lliiooiill.cn/1623751155%281%29.jpg)</a>

因此，在我们修改了 `App.vue` 的 HTML 或 JS 代码后，浏览器会发送两个请求：`/src/App.vue` 和 `'/src/App.vue?vue&type=style&index=0&lang.css'`。

## 静态资源处理

Vite 会对引入的静态资源如图片，样式文件等路径做处理(包括 CSS 中的 `url()` 引入)；在开发模式下正常路径引入，在生产模式下会进一步处理，如：

```javascript
import img from './assets/logo.png'
```

打包之后路径就变成了 `/assets/logo.03d6d6da.png`。

当然，这看上去和之前用 Webpack 打包是类似的，但区别在于 `import` 的时候既可以使用开发期间的项目根路径，也可以使用相对路径。

## 热更新 HMR

之前我们说过，Vite 的 HMR 是通过 WebSocket 实现的。结合上面的一些例子我们也能得出一个结论：**服务端监听代码文件的改变，通过 WebSocket 向服务端发送更新文件的信息通知客户端发送新的请求来更新代码。**

同时，Vite 也暴露了一些 [HMR API](https://www.vitejs.net/guide/api-hmr.html) 供开发者使用。

## ESBuild

Vite 在开发环境下使用的是 `ESBuild` 进行依赖预构建，最大的原因就是 `ESBuild` 实在是太快了速度远远超过 `Rollup`， 更不要说 `Webpack`。

### ESBuild 为什么那么快？

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1623808034%281%29.png">![](http://picstore.lliiooiill.cn/1623808034%281%29.png)</a>

根据这张图的数据不难发现，无论是构建 TS 还是 JS，`ESBuild` 都有着一骑绝尘的优势。

在 [ESBuild 官网](https://esbuild.github.io/faq/#why-is-esbuild-fast)上，开发者明确的说明了为什么 `ESBuild` 如此之快：

- `ESBuild` 是使用 GO 编写的，并且由于 GO 的并行性，线程之间也可以共享内存，因此在速度上相比 JavaScript 有着极大的优势。
- `ESBuild` 会充分利用所有可用的内核确保效率最大化。
- `ESBuild` 为了避免使用第三方工具带来的性能损失，全部从 0 开始编写。
- 有效利用内存，最大限度地重用数据。

### 生产环境下仍然使用 Rollup

截至目前：2021-6-16，由于 `ESBuild` 暂时还不太稳定，因此 Vite 没有将它用于生产构建，不过相信在不久地将来一定会实现。

## 支持 React

Vite 虽然是 Vue 的作者开发的，但是不仅支持 Vue，其他框架如 React 也支持，甚至支持 SSR(服务器渲染)。

## 最后

更多的有关 Vite 的说明，配置等，请看 [Vite 官中文档](https://cn.vitejs.dev/)