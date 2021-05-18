---
tags:
  - React
---

# Context

`Context` 的意思是上下文，许多 `React` 组件都是通过 `Context` 来完成的，比如 `react-redux` 的 `<Provider />`

`<Provider />` 通过 `Context` 提供一个全局的 `store`，通过 `Context` 在组件中分发 `Drag` 和 `Drop` 事件

## 作用

`Context` 的作用是这样的：

当你不想在组件树中通过逐层传递的方式传递 `props` 的时候，可以使用 `Context` 来实现跨越层级的传递

正常情况下我们通过 `props` 来将属性传递给深层组件

![1.jpg](https://upload-images.jianshu.io/upload_images/1457831-b19e007758f57df7?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

有了 `Context`，我们不再需要那么麻烦的操作：

![1.jpg](https://upload-images.jianshu.io/upload_images/1457831-b19e007758f57df7?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

使用 `Context` 一般要用到两个组件：

- Provider（生产者）
- Consumer（消费者）

可以看出来 `Context` 基于生产消费者模式

在这里，父组件就是生产者，子组件就是消费者。生产者需要通过一个静态属性 `childContextTypes` 声明提供给自组件的 `Context` 属性，并且要实现一个 `getChildContext` 方法，返回代表 `Context` 的纯对象

假设有一个父组件 `parent`，包含一个子组件 `middle`，`middle` 又包含一个子组件 `child`，现在要通过 `Context` 将属性从 `parent` 传给 `child`：

```javascript
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class Parent extends React.Component {
  static childContextTypes = {
    a: PropTypes.number,
    b: PropTypes.string,
  }

  getChildContext() {
    return {
      a: 1,
      b: 'string',
    }
  }

  render() {
    return <Middle />
  }
}

class Middle extends React.Component {
  render() {
    return <Child />
  }
}
```

父组件内定义一个静态对象 `childContextTypes`，`PropTypes`用来规范数据类型，`middle` 内不用做任何关于传递属性的操作

```javascript
class Child extends React.Component {
  static contextTypes = {
    a: PropTypes.number,
  }

  render() {
    const { a, b } = this.context
    return (
      <div>
        a:{a},b:{b}
      </div>
    )
  }
}

ReactDOM.render(<Parent />, document.getElementById('root1'))
```

子组件内也必须定义一个 `contextTypes` 静态对象才能够获取 `this.context`，并且必须要在对象内声明要接受的属性才行，不然值为 `undefined`。如上，虽然我们定义了 `b`，但没有在 `contextTypes` 对象内声明，所以子组件还是拿不到 `b` 属性的

上述代码执行结果：

![截图未命名.jpg](https://i.loli.net/2019/09/08/nlay1BmiPsg6KIf.jpg)

可以看到 `a` 的值 `1`，而 `b` 的值则获取不到

对于无状态子组件（单纯含有 `render` 函数的组件），可以通过如下方式访问父组件的 `Context`：

```javascript
const Child = (props, context) => {
  const { a } = context
  return <div>a:{a}</div>
}

Child.contextTypes = {
  a: PropTypes.number,
}
```

因为 `Child` 只含有 `render` 函数，所以可以封装成无状态组件

同样可以得到 `a` 为 `1`

## 发行版本的 Context

在发行版本的 `Context` 中新增了一个 `API`：

```javascript
// 初始化ThemeContext
const ThemeContext = React.createContext({
  background: 'red',
  color: 'white',
})
```

通过静态方法 `createContext` 创建一个 `Context`，包含两个组件：

- Provider
- Consumer

```javascript
class App extends React.Component {
  render() {
    return (
      // 向下传递属性，background值改变为green
      <ThemeContext.Provider value={{ background: 'green', color: 'white' }}>
        <Header />
      </ThemeContext.Provider>
    )
  }
}

class Header extends React.Component {
  render() {
    return <Title>Hello React Context API</Title>
  }
}

class Title extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {(context) => (
          // 由于background已经改变，所以子组件拿到的background为green而不是red
          <h1 style={{ background: context.background, color: context.color }}>{this.props.children}</h1>
        )}
      </ThemeContext.Consumer>
    )
  }
}
```

`Provider` 相当于 `getChildContext`，而 `Consumer` 子组件必须为一个函数，通过函数的参数获取 `Provider` 提供的 `Context`

## 直接访问父组件 Context 的方法

可以通过构造方法直接访问 `Context`:

`constructor(props, context)`

也可以在生命周期中访问：

- `componentWillReceiveProps(nextProps, nextContext);`
- `shouldComponentUpdate(nextProps, nextState, nextContext);`
- `componetWillUpdate(nextProps, nextState, nextContext);`

在无组件函数中，可以通过函数直接访问组件的 `Context`：

```javascript
const StatelessComponent = (props, context) => (
  ......
)
```

事实上，`React App` 就是一个组件树

![1.jpg](https://upload-images.jianshu.io/upload_images/1457831-ca45b0f51cf449ca?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

如图可知，`Child` 的父组件链为 `SubNode` -- `Node` -- `App`

其实也可以把这个树看成是一颗 `Context` 树，每个节点的 `Context`，来自父组件链上所有组件节点通过 `getChildContext()` 所提供的 `Context` 对象组合而成的对象

`Context` 就好比是一个提供给子组件访问的作用域，`Context` 中的属性可以看作是运行 `JS` 代码期间可访问的活动对象，包括变量和函数，所以我们可以把 `Context` 看成一个作用域来使用

但是不建议任何使用都是用 `Context`

![1.jpg](https://upload-images.jianshu.io/upload_images/1457831-89e9fca854376012?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

`Child` 的 `Context` 来自于 `App` 和 `Node`，如果脱离了这两个组件，`Child` 可能就无法正常工作了，这降低了 `Child` 的复用性

**所以在开发组件的过程中不要随意使用 `Context`**

原因主要有下面几点：

- `Context` 目前还处于实验阶段，可能会在后面的发行版本中有大的变化
- 对于组件而言，由于影响范围小于 `App`，如果可以做到高内聚，不破坏组件树的依赖关系，那么还是可以考虑使用 `Context` 的
- 对于组件之间的数据通信或者状态管理，优先考虑用 `props` 或者 `state` 解决，然后再考虑用其他第三方成熟库解决的，以上方法都不是最佳选择的时候，那么再考虑使用 `Context`
- `Context` 的更新需要通过 `setState()` 触发，但是这并不是可靠的

## 用 Context 作为共享数据的媒介

`App` 根节点提供的 `Context` 数据对象可以看作是 `App` 全局作用域，所以我们利用根节点组件提供的 `Context` 对象创建一些 `App` 级的全局数据，`react-redux` 就是使用这种方法

如果组件的功能不能单靠组件自身来完成，还需要依赖额外的子组件，那么可以利用 `Context` 构建一个由多个子组件组合的组件。例如，`react-router`

`react-router` 的`<Router />`自身并不能独立完成路由的操作和管理，因为导航链接和跳转的内容通常是分离的，因此还需要依赖`<Link />`和`<Route />`等子组件来一同完成路由的相关工作。为了让相关的子组件一同发挥作用，`react-router` 的实现方案是利用 `Context` 在`<Router />`、`<Link />`以及`<Route />`这些相关的组件之间共享一个 `router`，进而完成路由的统一操作和管理

## Context 开发组件

`Vue` 中有一种组件叫插槽组件 `solt`，`React` 对插槽组件的支持不是很好，可以使用 `context` 开发一套 `React` 插槽组件

假如我想写一个布局组件，像写成下面这样：

```javascript
class AppLayout extends React.Component {
  static displayName = 'AppLayout'

  render() {
    return (
      <div class="container">
        <header>
          <Slot name="header"></Slot>
        </header>
        <main>
          <Slot></Slot>
        </main>
        <footer>
          <Slot name="footer"></Slot>
        </footer>
      </div>
    )
  }
}
```

头，尾，和中间分别放一个插槽，在外层使用的时候可以这样：

```javascript
<AppLayout>
  <AddOn slot="header">
    <h1>这里可能是一个页面标题</h1>
  </AddOn>
  <AddOn>
    <p>主要内容的一个段落。</p>
    <p>另一个段落。</p>
  </AddOn>
  <AddOn slot="footer">
    <p>这里有一些联系信息</p>
  </AddOn>
</AppLayout>
```

实现如上功能需要两个组件：插槽组件 `Slot` 和 分发组件 `AddOn`

这两个组件都在 `AppLayout` 的作用域范围内，所以，可以通过 `AppLayout` 来连接 `Slot` 和 `AddOn`

`Slot` 负责占位置，提供放置内容的位置，`AddOn` 负责收集分发内容提供给插槽

## 功能实现

```javascript
// SlotProvider.js

function getDisplayName (component) {
  return component.displayName || component.name || 'component'
}

export const SlotContext = React.createContext({
  requestAddOnRenderer: () => {}
})

const slotProviderHoC = (WrappedComponent) => {
  return class extends React.Component {
    static displayName = `SlotProvider(${getDisplayName(WrappedComponent)})`

    // 用于缓存每个<AddOn />的内容
    addOnRenderers = {}

    requestAddOnRenderer = (name) => {
      if (!this.addOnRenderers[name]) {
        return undefined
      }
      return () => (
        this.addOnRenderers[name]
      )
    }

    render () {
      const {
        children,
        ...restProps
      } = this.props

      if (children) {
        // 以k-v的方式缓存<AddOn />的内容
        const arr = React.Children.toArray(children)
        const nameChecked = []
        this.addOnRenderers = {}
        arr.forEach(item => {
          const itemType = item.type
          if (item.type.displayName === 'AddOn') {
            const slotName = item.props.slot || '$$default'
            // 确保内容唯一性
            if (nameChecked.findIndex(item => item === stubName) !== -1) {
              throw new Error(`Slot(${slotName}) has been occupied`)
            }
            this.addOnRenderers[stubName] = item.props.children
            nameChecked.push(stubName)
          }
        })
      }

      return (
        <SlotContext.Provider value={
            requestAddOnRenderer: this.requestAddOnRenderer
          }>
          <WrappedComponent {...restProps} />
        </SlotContext.Provider>
      )
    }
  }
}

export const SlotProvider = slotProviderHoC
```

```javascript
// Slot.js

import { SlotContext } from './SlotProvider.js'

const Slot = ({ name, children }) => {
  return (
    <SlotContext.Consumer>
      {(context) => {
        const addOnRenderer = requestAddOnRenderer(name)
        return (addOnRenderer && addOnRenderer()) || children || null
      }}
    </SlotContext.Consumer>
  )
}

Slot.displayName = 'Slot'
Slot.propTypes = { name: PropTypes.string }
Slot.defaultProps = { name: '$$default' }
```
