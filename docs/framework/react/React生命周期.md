# React 生命周期

React16.3 的生命周期如图所示：

![1.jpg](https://user-images.githubusercontent.com/12322740/44473723-89e10a00-a663-11e8-8d54-55eccdcbb126.png)

相对于之前的生命周期少了 componentWillMount, componentWillReceiveProps, componentWillUpdate 这三个阶段，但实际上这三个生命周期都还在，只是马上就要删除了，因为实在是没有什么用

在创建时首先会运行构造函数 constructor

```javascript
class Father extends React.Component {
  constructor(props) {
    super(props)
    //...
  }
}
```

接下来执行 getDerivedStateFromProps

## getDerivedStateFromProps

getDerivedStateFromProps 在第一次渲染和更新组件的时候都会被调用

如图可知： props 更新，state 更新，forceUpdate（重新 render）的时候都会调用 getDerivedStateFromProps

getDerivedStateFromProps 的作用从名字就可以看出来，就是从 props 中获取 state，也就是将 props 映射到 state 上面，这意味着你的 props 没有任何变化，而是父组件的 state 发生了变化，导致子组件重新 render，这个生命周期函数依然会被调用

getDerivedStateFromProps 是为了替代 componentWillReceiveProps 而存在的，这个函数不能够直接通过 this 访问到 class 的属性，而是通过参数提供 nextProps 以及 prevState 来进行判断，根据新传入的 props 来映射到 state

**如果 props 传入的内容不需要影响到你的 state，那么就需要返回一个 null**

```javascript
class Father extends React.Component {
  constructor(props) {
    super(props)
    //...
  }
  getDerivedStateFromProps(nextProps, prevState) {
    const { type } = nextProps
    // 当传入的type发生变化的时候，更新state
    if (type !== prevState.type) {
      return {
        type,
      }
    }
    // 否则，对于state不进行任何操作
    return null
  }
}
```

在执行完构造函数和 getDerivedStateFromProps 之后，就执行 render 函数来渲染 DOM 节点

React 根据虚拟 DOM 和 Diff 算法来更新 DOM 和 refs

然后来到 componentDidMount

## componentDidMount

当组件输出到 DOM 之后会执行 componentDidMount 钩子

具体顺序为：

componentWillMount => render => componentDidMount

componentWillMount 钩子将在 React17 被取消，componentWillMount 在组件被挂载之前被调用，所以在此方法内同步调用 setState 改变 state 是没有用的，还是建议使用 constructor 来初始化 state

**此方法是服务器渲染唯一会调用的函数**

再回到 componentDidMount 函数

依赖于 DOM 节点的初始化应该放在这里，比如通过网络请求获取数据，在该函数执行完毕后，ref 才会变成实际的 DOM

componentDidMount 中可以直接调用 setState，这会触发额外的渲染，但是这个渲染会发生在浏览器更新屏幕之前所以用户只会看到一次更新，当然它仍然会导致性能问题

## shouldComponentUpdate

shouldComponentUpdate 在 props 改变或者执行 setState 的时候触发

当父元素的 state 改变的时候，先检查自身 shouldComponentUpdate 返回值，如果为 false 则不更新 DOM，如果未 true 则会检查子元素的 shouldComponentUpdate 钩子返回值，如果返回 false，则不更新该子元素，如果为 true，再对比子元素返回的 React 元素是否和之前渲染的相同，如果相同，则不更新 DOM

```javascript
class Father extends React.Component {
  constructor(props) {
    super(props)
    //...
  }
  shouldComponentUpdate(nextProps, nextState) {
    // 检查props和state是否改变，如果没有改变则不更新DOM
    if (this.props.color !== nextProps.color) return true
    if (this.state.count !== nextState.count) return true
    return false
  }
  render(
    //...
  )
}
```

React 提供了一个 PureComponent 来帮助我们判断 props 和 state 是否改变：

```javascript
class Father extends React.PureComponent {
  constructor(props) {
    super(props)
    //...
  }
  render(
    //...
  )
}
```

在大部分情况下可以使用 PureComponent 代替手写 shouldComponentUpdate，当然，PureComponent 只进行浅比较，如果浅比较不能够发现不同，比如出现嵌套对象，就不能使用 PureComponent 了

为了解决这个问题，最好重新赋值，而不是直接改变对象或者数组中的值

比如数组可以用数组拓展符来赋值：

```javascript
updateState() {
  this.setState(state => ({
    arr: [...state.arr, 'newVal']
  }))
}
```

而对象可以使用 Object.assign 来达到目的，Object.assign 可以复制一个或多个源对象的可枚举属性值复制到目标对象中，返回值为目标对象

```javascript
this.setState((state) => ({
  colorMap: Object.assign({}, state.colorMap, { right: 'blue' }),
}))
```

当然也可以使用对象拓展符：

```javascript
this.setState((state) => ({
  colorMap: { ...state.colorMap, right: 'blue' },
}))
```

## getSnapshotBeforeUpdate

该函数在最近一次渲染输出（提交到 DOM 节点）之前调用。组件可以在发生更改之前从 DOM 中捕获一些信息（例如：滚动位置），此生命周期的任何返回值将作为参数传递给 componentDidUpdate

```javascript
class Father extends React.Component {
  constructor(props) {
    super(props)
    //...
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 根据滚动位置判断是否需要添加新的数据到页面上
    if (prevProps.list.length < this.props.list.length) {
      const list = this.listRef.current
      return list.scrollHeight - list.scrollTop
    }
    return null
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // snapshot是getSnapshotBeforeUpdate的返回值，如果有值，就说明我们新增了数据
    // 调整滚动位置使得这些新数据不会将旧的数据推出试图
    if (snapshot !== null) {
      const list = this.listRef.current
      list.scrollTop = list.scrollHeight - snapshot
    }
  }
  render() {
    return <div ref={this.listRef}>{/* ...contents... */}</div>
  }
}
```

这个用法并不是很常见

在执行完 getSnapshotBeforeUpdate 函数之后，进行 React 的 DOM 更新和 refs

之后进行 componentDidUpdate，因为组件已经被挂载，所以不会执行 componentDidMount

## componentDidUpdate

componentDidUpdate 函数在更新时会调用，在组件第一次创建挂载的时候不会执行该函数

组件更新后可以在该函数内对 DOM 进行操作，比如发送请求：

```javascript
componentDidUpdate(prevProps) {
  // 如果userID没有改变
  if (this.props.userID !== prevProps.userID) {
    // 发送请求
  }
}
```

也可以在该函数内调用 setState，但是一定要将 setState 放在一个条件循环中，否则导致死循环，所以 if 条件是必要的，同样地，componentDidUpdate 也会导致额外的重新渲染，用户不可见但是影响性能

## componentWillUnmount

当组件被销毁或者卸载，该函数会直接被调用，再次方法中执行必要的清理操作，比如清除计时器，取消网络请求和在 componentDidMount 中创建的订阅来减少内存消耗

在 componentDidMount 调用 setState 也是没有意义的