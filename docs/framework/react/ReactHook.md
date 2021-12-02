# React Hook

> Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

Hook 是为了解决以下问题：

- 组件之间复用状态逻辑很难
- 复杂组件变得难以理解
- 难以理解的 class

使用 Hook 可以在无需修改组件结构的情况下复用状态逻辑

Hook 将组件中相互关联的部分拆分成更小的函数，而不是按照生命周期划分

Hook 可以在不使用 class 的情况下使用更多的 React 特性

## State Hook

在使用 State Hook 之前要先引入 useState：

```javascript
import React, { useState } from 'react'
```

React 官网有一个计数器的例子：

```javascript
function calcNum() {
  // 使用解构赋值
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

在 Hook 之前，用 function 写的组件都是无状态组件，只有一个 render 功能，无法拥有自己的状态值，而有了 hook，就可以通过 useState 来实现 this.setState 功能

useState 接收一个值作为一个 state 的初始值，返回一个数组。这个数组有两个成员组成，第一个是状态的当前值，第二个是改变这个状态值的方法，就是一个专属的 setState

在使用 this.setState 的时候，必须要传入一个对象，而 useState 不需要这么做

与 this.setState 不同的是，useState 不会将新的 state 与旧的 state 合并

可以用如下几种方法调用 useState：

```javascript
function ExampleWithManyStates() {
  // 声明多个 state 变量！
  const [age, setAge] = useState(42)
  const [fruit, setFruit] = useState('banana')
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }])
  // ...
}
```

useState 只接收一个初始值，可以为数字，字符串，数组，对象等等

## Effect Hook

Effect Hook 可以让你在函数组件中执行副作用操作

主要的副作用操作如下：

- 数据获取
- 设置定义
- 手动更改 React 组件中的 DOM
- 其他

可以将 Effect Hook 看作是 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合

在组件内部我们可以在 useEffect 中直接访问 state 变量或是 props，不需要通过 this.state.属性名或者 this.props.属性名访问

React 官网有这样的例子：

```javascript
import React, { useState, useEffect } from 'react'

function Example() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    document.title = `You clicked ${count} times`
  })
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

首先引入了 useState 和 useEffect，然后添加了一个状态 count，初始值为 0。

在 useEffect 中传入了一个箭头函数，函数内对 DOM 进行了操作，将 title 变成点击次数

每次 render 都会执行 useEffect，这是默认的行为，注意：**useEffect 在 render 函数执行之后才会执行，而不是发生在 mount 或 update 之后，React 保证 DOM 在运行的时候就已经更新了副作用**

副作用分为两种：

- 需要清除的
- 不需要清除的

### 不需要清除的 Effect

像发送网络请求，手动变更 DOM，记录日志，这些操作都是不需要清除的操作，因为执行完就可以忽略它们了

### 需要清除的 Effect

假如说你在 useEffect 中涉及到了订阅操作，那么就需要在 componentWillUnmount 中清除这个订阅操作，否则会导致内存泄漏

```javascript
class FriendStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isOnline: null }
    this.handleStatusChange = this.handleStatusChange.bind(this)
  }

  componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    )
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    )
  }

  handleStatusChange(status) {
    this.setState({
      isOnline: status.isOnline
    })
  }

  render() {
    if (this.state.isOnline === null) {
      return 'Loading...'
    }
    return this.state.isOnline ? 'Online' : 'Offline'
  }
}
```

这是 React 官网上的一个例子，FriendStatus 类在 componentDidMount 钩子上订阅了 this.props.friend.id，将 id 和 handleStatusChange 传入 ChatAPI.unsubscribeFromFriendStatus 中来获取好友的在线状态，然后在 componentWillUnmount 中清除了这个订阅

上面的例子转换成 Hook 如下：

```javascript
function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null)

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline)
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange)
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange)
    }
  })

  if (isOnline === null) return 'Loading...'

  return isOnline ? 'Online' : 'Offline'
}
```

可见 Hook 相对于 class 形式的组件要简洁很多，因为 useEffect 将 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数融合在了一起

useEffect 返回的函数就是 componentWillUnmount 中要执行的函数，这是 useEffect 函数的可清除机制，每个 useEffect 都可以返回一个清除函数，可以将添加和移除订阅的代码放到一起

## Hook 注意事项

**只在 React 函数最顶层使用 Hook**

**不要在循环，条件或嵌套函数中调用 Hook**

可以安装 eslint-plugin-react-hooks 来强制执行这条规则

```bash
npm install eslint-plugin-react-hooks --save-dev
```

当然我们可以在单个组件中使用多个 State Hook 或 Effect Hook

**只要 Hook 的调用顺序在每次渲染中都是相同的，React 就可以知道哪个 state 对应哪个 useState**

这也是为什么不能使用 if 或者 for 循环来包含 Hook 的原因

如果想有条件的执行一个 Hook，可以将判断放到 Hook 内部

```javascript
useEffect(function persistForm() {
  if (name !== '') localStorage.setItem('formData', name)
})
```

## 自定义 Hook

如果一个 Hook 需要应用在多个函数中，可以将 Hook 提取出来

自定义 Hook 是一个函数，其名称以 “use” 开头，函数内部可以调用其他的 Hook

```javascript
import React, { useState, useEffect } from 'react'

function useFriendStatus(friendID) {
  // 添加一个状态isOnline，初始值为null
  const [isOnline, setIsOnline] = useState(null)
  // 每次渲染都会执行useEffect
  useEffect(() => {
    // 将isOnline更新为status.isOnline
    function handleStatusChange(status) {
      setIsOnline(status.isOnline)
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange)
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange)
    }
  })

  return isOnline
}
```

useFriendStatus 就是一个自定义 Hook，自定义 Hook 不需要具有特殊的标识，可以自由决定参数是什么，以及它应该返回什么，除了名字要用 use 开头之外，它就像一个普通函数一样

useFriendStatus 的作用是订阅好友在线状态，所以需要将 ID 作为参数

```javascript
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null)
  //...
  return isOnline
}
```

然后就可以使用它了：

```javascript
// 好友在线状态
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id)

  if (isOnline === null) return 'Loading...'

  return isOnline ? 'Online' : 'Offline'
}
// 联系人列表在线状态
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id)

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>{props.friend.name}</li>
  )
}
```

**在两个组件中使用相同的 Hook 不会共享同一个 state**，因为自定义 Hook 是一个重用状态逻辑的机制，所以每次调用 Hook 的时候，其中所有 state 和副作用都是完全隔离的

## 多个 Hook 间传递信息

```javascript
// 联系人列表
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' }
]

function ChatRecipientPicker() {
  // 存储出初始ID
  const [recipientID, setRecipientID] = useState(1)
  // 将ID传入，判断好友在线状态
  const isRecipientOnline = useFriendStatus(recipientID)

  return (
    <div>
      {/*显示好友是否在线*/}
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      {/*在选择改变的时候获取当前选择联系人ID*/}
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {/*遍历联系人列表*/}
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

这里我们用到了两个 Hook：

- useState
- useFriendStatus

由于 useState 为我们提供了 recipientID 状态变量的最新值，因此我们可以将它作为参数传递给自定义的 useFriendStatus Hook