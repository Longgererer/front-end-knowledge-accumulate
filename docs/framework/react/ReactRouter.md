# React-router

## 安装

```bash
npm i react-router --save
```

## 路由配置

```javascript
class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h1>App</h1>
        <div>{this.props.children}</div>
      </div>
    )
  }
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  )
}

function Inbox(props) {
  return (
    <div>
      <h2>Inbox</h2>
      {props.children || 'Welcome to your Inbox'}
    </div>
  )
}

function Message(props) {
  return <h3>Message {this.props.params.id}</h3>
}

ReactDOM.render(
  <Router>
    <Route path='/' component={App}>
      <Route path='about' component={About} />
      <Route path='inbox' component={Inbox}>
        <Route path='messages/:id' component={Message} />
      </Route>
    </Route>
  </Router>,
  document.body
)
```

如此配置，根据路由不同显示的组件是不一样的：

| URL                 | 组件                |
| ------------------- | ------------------- |
| /                   | App                 |
| /about              | App->About          |
| /inbox              | App->Inbox          |
| /inbox/messages/:id | App->Inbox->Message |

## 添加首页

当当前路径为根目录/的时候，渲染的是 App 组件，App 代码如下：

```javascript
class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h1>App</h1>
        <div>{this.props.children}</div>
      </div>
    )
  }
}
```

我们想渲染一个 App 中的组件，不过此时 this.props.children 的值为 undefined，我们可以使用 IndexRoute 来设置一个页面：

```javascript
import { IndexRoute } from 'react-router'

const Dashboard = React.createClass({
  render() {
    return <div>Welcome to the app!</div>
  }
})

ReactDOM.render(
  <Router>
    <Route path='/' component={App}>
      {/* 当 url 为/时渲染 Dashboard */}
      <IndexRoute component={Dashboard} />
      <Route path='about' component={About} />
      <Route path='inbox' component={Inbox}>
        <Route path='messages/:id' component={Message} />
      </Route>
    </Route>
  </Router>,
  document.body
)
```

## 解耦

在多层嵌套路由中使用绝对路径，可以实现对 URL 的绝对掌控，我们不需要在 URL 中添加更多的层级，使得 URL 更加简洁：

```javascript
ReactDOM.render(
  <Router>
    <Route path='/' component={App}>
      <IndexRoute component={Dashboard} />
      <Route path='about' component={About} />
      <Route path='inbox' component={Inbox}>
        {/* 使用 /messages/:id 替换 messages/:id */}
        <Route path='/messages/:id' component={Message} />
      </Route>
    </Route>
  </Router>,
  document.body
)
```

如上的路由关系：

| URL           | 组件                |
| ------------- | ------------------- |
| /             | App->Dashboard      |
| /about        | App->About          |
| /inbox        | App->Inbox          |
| /messages/:id | App->Inbox->Message |

注意：**绝对路径在动态路由中可能无法使用**

我们在上面将 `messages/:id` 替换成了`/messages/:id`，假如用户访问`/index/messages/:id`，那么它安徽看到一个错误页面，这是不好的，所以应该做兼容处理：

```javascript
import { Redirect } from 'react-router'

ReactDOM.render(
  <Router>
    <Route path='/' component={App}>
      <IndexRoute component={Dashboard} />
      <Route path='about' component={About} />
      <Route path='inbox' component={Inbox}>
        <Route path='/messages/:id' component={Message} />

        {/* 跳转 /inbox/messages/:id 到 /messages/:id */}
        <Redirect from='messages/:id' to='/messages/:id' />
      </Route>
    </Route>
  </Router>,
  document.body
)
```

当用户访问 `/index/messages/:id`，会自动跳转到 `/messages/:id`

在跳转页面的时候我们常常需要做权限判断，Route 可以定义 onEnter 和 onLeave 两个 Hook

这两个 Hook 会在页面跳转确认的时候触发一次，可以用来做权限验证或者在跳转前将一些数据持久化保存起来

## 配置方式

如果不想使用 JSX 来配置路由，可以使用 route 数组：

```javascript
const routeConfig = [
  {
    path: '/',
    component: App,
    indexRoute: { component: Dashboard },
    childRoutes: [
      { path: 'about', component: About },
      {
        path: 'inbox',
        component: Inbox,
        childRoutes: [
          { path: '/messages/:id', component: Message },
          {
            path: 'messages/:id',
            onEnter: function(nextState, replaceState) {
              replaceState(null, '/messages/' + nextState.params.id)
            }
          }
        ]
      }
    ]
  }
]

ReactDOM.render(<Router routes={routeConfig} />, document.body)
```

## 路径匹配

路由路径是匹配一个（或一部分）URL 的 一个字符串模式

有如下几个规则：

- :paramName – 匹配一段位于 /、? 或 # 之后的 URL。 命中的部分将被作为一个参数
- () – 在它内部的内容被认为是可选的
- \* – 匹配任意字符（非贪婪的）直到命中下一个字符或者整个 URL 的末尾，并创建一个 splat 参数

```html
<Route path="/hello/:name"
  ><!-- 匹配 /hello/michael 和 /hello/ryan -->
  <Route path="/hello(/:name)"
    ><!-- 匹配 /hello, /hello/michael 和 /hello/ryan -->
    <Route path="/files/*.*"
      ><!-- 匹配 /files/hello.jpg 和 /files/path/to/hello.jpg</Route> -->
    </Route>
  </Route>
</Route>
>
```

## 优先级

路由算法会根据定义的顺序自顶向下匹配路由，所以，当拥有两个兄弟路由的节点配置的时候，必须要确认前一个路由不会匹配后一个路由中的路径：

```javascript
<Route path="/comments" ... />
<Redirect from="/comments" ... />
```

## Histories

使用 history 的可以：

- 监听浏览器的地址栏变化
- 解析这个 URL 转化为 location 对象
- router 使用它匹配到路由
- 正确地渲染对应的组件

常用的 history 形式：

- browserHistory
- hashHistory
- createMemoryHistory

可以通过 React Router 引入：

```javascript
import { browserHistory } from 'react-router'
```

然后：

```javascript
render(
  <Router history={browserHistory} routes={routes} />,
  document.getElementById('app')
)
```