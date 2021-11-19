# Vue 常见知识点

## 1. SPA 的优缺点？

仅在 Web 页面初始化时加载相应的 HTML、JavaScript 和 CSS。一旦页面加载完成，SPA 不会因为用户的操作而进行页面的重新加载或跳转，而是采取路由机制实现页面内容的变化。

优点：

- 用户体验好。
- 避免了不必要的跳转和重复渲染。
- 对服务器压力小。
- 前后端职责分离，架构清晰。

缺点：

- 初次加载耗时多。
- 前进后退路由管理繁琐。
- SEO 难度较大。

## 2. v-show 与 v-if 有什么区别？

`v-if` 是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

`v-show` 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 的 `display` 属性进行切换。

所以，`v-if` 适用于在运行时很少改变条件，不需要频繁切换条件的场景；`v-show` 则适用于需要非常频繁切换条件的场景。

## 3. 怎样理解 Vue 的单向数据流？

所有的 `prop` 都使得其父子 `prop` 之间形成了一个单向下行绑定：父级 `prop` 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。

额外的，每次父级组件发生更新时，子组件中所有的 `prop` 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 `prop`。如果你这样做了，Vue 会在浏览器的控制台中发出警告。子组件想修改时，只能通过 `$emit` 派发一个自定义事件，父组件接收到后，由父组件修改。

## 4. computed 和 watch 的区别和运用的场景？

`computed`： 是计算属性，依赖其它属性值，并且 `computed` 的值有缓存，只有它依赖的属性值发生改变，下一次获取 `computed` 的值时才会重新计算 `computed` 的值；

`watch`： 更多的是「观察」的作用，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作；

当我们需要进行数值计算，并且依赖于其它数据时，应该使用 `computed`，因为可以利用 `computed` 的缓存特性，避免每次获取值时，都要重新计算；

当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 `watch`，使用 `watch` 选项允许我们执行异步操作 ( 访问一个 API )，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## 5. 直接给一个数组项赋值，Vue 能检测到变化吗？

Vue 不能检测到以下数组的变动：

- 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`。
- 当你修改数组的长度时，例如：`vm.items.length = newLength`。

可以使用如下方式解决第一个问题：

```js
// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
// vm.$set，Vue.set的一个别名
vm.$set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

可以使用如下方式解决第二个问题：

```js
// Array.prototype.splice
vm.items.splice(newLength)
```

## 6. Vue 如何能检测到对象任意属性的变动？

1. 深度检测

```js
new Vue({
  watch: {
    blog: {
      handler(newVal, oldVal) {
        console.log(`new: ${newVal}, old: ${oldVal}`)
      },
      deep: true,
    },
  },
})
```

2. 用字符串表示特定属性的变化

```js
new Vue({
  watch: {
    'blog.categories'(newVal, oldVal) {
      console.log(`new:${newVal}, old:${oldVal}`)
    },
  },
})
```

3. 使用 `computed` 计算属性

```js
new Vue({
  computed: {
    categories() {
      return this.blog.categories
    },
  },
  watch: {
    categories(newVal, oldVal) {
      console.log(`new:${newVal}, old:${oldVal}`)
    },
  },
})
```

## 7. Vue2 生命周期？

- `beforeCreate`：组件实例被创建之初，组件的属性生效之前。
- `created`：组件实例已经完全创建，属性也绑定，但真实 `dom` 还没有生成，不能进行 DOM 操作。
- `beforeMount`：在挂载开始之前被调用：相关的 `render` 函数首次被调用。这时虚拟 DOM 已经编译好在内存中，还没挂载到页面上。
- `mounted`：`el` 被新创建的 `vm.$el` 替换，并挂载到实例上去之后调用该钩子。在这之后整个 Vue 实例已经初始化完毕。组件进入运行状态
- `beforeUpdate`：组件数据更新之前调用，发生在虚拟 DOM 打补丁之前。这时页面显示的数据还是旧的，但 data 数据是最新的。
- `update`：组件数据更新之后。页面和 data 数据已经保持同步了。
- `activited`：`keep-alive` 专属，组件被激活时调用。
- `deactivated`：`keep-alive` 专属，组件被销毁时调用。
- `beforeDestory`：组件销毁前调用。组件开始进入销毁阶段，实例上所有的属性还处于可用状态。
- `destoryed`：组件销毁后调用。组件已完全销毁，所有属性都没有了。

## 8. 父子组件的生命周期执行顺序？

创建过程：

`父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted`

更新过程：

`父beforeUpdate->子beforeUpdate->子updated->父updated`

销毁过程：

`父beforeDestroy->子beforeDestroy->子destroyed->父destroyed`

## 9. 箭头函数能用来定义一个生命周期方法么？

所有的生命周期钩子自动绑定 `this` 上下文到实例中，所以不能使用箭头函数来定义一个生命周期方法 (例如 `created: () => this.fetchTodos())`,会导致 `this` 指向父级。

## 10. 如何监听路由缓存过的组件的加载？

在使用 `vue-router` 时有时需要使用来缓存组件状态，这个时候 `created` 钩子就不会被重复调用了，如果我们的子组件需要在每次加载或切换状态的时候进行某些操作，可以使用 `activated` 钩子触发。

## 11. 在哪个生命周期内可以调用异步请求？

可以在钩子函数 `created`、`beforeMount`、`mounted` 中进行调用，因为在这三个钩子函数中，`data` 已经创建，可以将服务端端返回的数据进行赋值。

但是本人推荐在 `created` 钩子函数中调用异步请求，因为在 `created` 钩子函数中调用异步请求有以下优点：

1. 能更快获取到服务端数据，减少页面  `loading` 时间；
2. ssr  不支持 `beforeMount` 、`mounted` 钩子函数，所以放在 `created` 中有助于一致性；

## 12. 父组件可以监听到子组件的生命周期吗？

比如有父组件 `Parent` 和子组件 `Child`，如果父组件监听到子组件挂载 `mounted` 就做一些逻辑处理，可以通过以下写法实现：

```html
<!-- Parent.vue -->
<Child @mounted="doSomething" />
```

```js
// Child.vue
mounted() { this.$emit("mounted"); }
```

可以在父组件引用子组件时通过 `@hook` 来监听即可:

```html
<Child @hook:mounted="doSomething"></Child>
```

当然，在执行 `doSomething` 之前，子组件的 `mounted` 已经被执行了。

## 13. 谈谈你对 keep-alive 的了解？

`keep-alive` 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：

- 一般结合路由和动态组件一起使用，用于缓存组件；
- 提供 `include` 和 `exclude` 属性，两者都支持字符串或正则表达式， `include` 表示只有名称匹配的组件会被缓存，`exclude` 表示任何名称匹配的组件都不会被缓存 ，其中 `exclude` 的优先级比 `include` 高；
- 对应两个钩子函数 `activated` 和 `deactivated` ，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated`。

## 14. 为什么组件中的 data 必须是一个函数，然后 return 一个对象，而 new Vue 实例里，data 可以直接是一个对象？

因为组件是用来复用的，且 JS 里对象是引用关系，如果组件中 `data` 是一个对象，那么这样作用域没有隔离，子组件中的 `data` 属性值会相互影响，如果组件中 `data` 选项是一个函数，那么每个实例可以维护一份被返回对象的独立的拷贝，组件实例之间的 `data` 属性值不会互相影响；而 `new Vue` 的实例，是不会被复用的，因此不存在引用对象的问题。

## 15. v-model 原理？

使用 `v-model` 指令在表单 `input`、`textarea`、`select` 等元素上创建双向数据绑定，本质上不过是**语法糖**，`v-model`在内部为不同的输入元素使用不同的属性并抛出不同的事件：

- `text` 和 `textarea` 元素使用 `value` 属性和 `input` 事件；
- `checkbox` 和 `radio` 使用 `checked` 属性和 `change` 事件；
- `select` 字段将 `value` 作为 `prop` 并将 `change` 作为事件。

如果在自定义组件中，`v-model` 默认会利用名为 `value` 的 `prop` 和名为 `input` 的事件，如下所示：

```bash
父组件：
<ModelChild v-model="message"></ModelChild>

子组件：
<div>{{value}}</div>

props:{
    value: String
},
methods: {
  test1(){
     this.$emit('input', '小红')
  },
},
```

## 16. Vue 组件间通信有哪几种方式?

1. `props / $emit` 适用 父子组件通信。
2. `ref` 与 `$parent / $children` 适用 父子组件通信。
3. `EventBus` （`$emit / $on`） 适用于 父子、隔代、兄弟组件通信。
4. `$attrs/$listeners` 适用于 隔代组件通信。
5. `provide / inject` 适用于 隔代组件通信。
6. Vuex 适用于 父子、隔代、兄弟组件通信。

## 17. 对象删除属性不触发视图更新怎么解决？

使用 `delete` 删除对象属性不会触发视图更新：`delete this.obj.pro`。这是因为 Vue 不能检测到对象属性的删除。

使用 `vm.$delete` 就可以触发更新了。

## 18. vue-router 中常用的 hash 和 history 路由模式实现原理？

早期的前端路由的实现就是基于 `location.hash` 来实现的。其实现原理很简单，`location.hash` 的值就是 URL 中 `#` 后面的内容。比如下面这个网站，它的 `location.hash` 的值为 `#search`：`https://www.word.com#search`。

hash 路由模式的实现主要是基于下面几个特性：

1. URL 中 hash 值只是客户端的一种状态，也就是说当向服务器端发出请求时，hash 部分不会被发送；
2. hash 值的改变，都会在浏览器的访问历史中增加一个记录。因此我们能通过浏览器的回退、前进按钮控制 hash 的切换；
3. 可以通过 a 标签，并设置 href 属性，当用户点击这个标签后，URL 的 hash 值会发生改变；或者使用 JavaScript 来对 `loaction.hash` 进行赋值，改变 URL 的 hash 值；
4. 我们可以使用 `hashchange` 事件来监听 hash 值的变化，从而对页面进行跳转（渲染）。

HTML5 提供了 History API 来实现 URL 的变化。其中做最主要的 API 有以下两个：`history.pushState()` 和 `history.repalceState()`。这两个 API 可以在不进行刷新的情况下，操作浏览器的历史纪录。唯一不同的是，前者是新增一个历史记录，后者是直接替换当前的历史记录

history 路由模式的实现主要基于存在下面几个特性：

1. `pushState` 和 `repalceState` 两个 API 来操作实现 URL 的变化 ；
2. 我们可以使用 `popstate` 事件来监听 url 的变化，从而对页面进行跳转（渲染）；
3. `history.pushState()` 或 `history.replaceState()` 不会触发 `popstate` 事件，这时我们需要手动触发页面跳转（渲染）。

## 19. Vue 是如何实现数据双向绑定的？

Vue 数据双向绑定主要是指：数据变化更新视图，视图变化更新数据。

Vue 主要通过以下 4 个步骤来实现数据双向绑定的：
实现一个监听器 Observer：对数据对象进行遍历，包括子属性对象的属性，利用 Object.defineProperty() 对属性都加上 setter 和 getter。这样的话，给这个对象的某个值赋值，就会触发 setter，那么就能监听到了数据变化。

实现一个解析器 Compile：解析 Vue 模板指令，将模板中的变量都替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，调用更新函数进行数据更新。

实现一个订阅者 Watcher：Watcher 订阅者是 Observer 和 Compile 之间通信的桥梁 ，主要的任务是订阅 Observer 中的属性值变化的消息，当收到属性值变化的消息时，触发解析器 Compile 中对应的更新函数。

实现一个订阅器 Dep：订阅器采用 发布-订阅 设计模式，用来收集订阅者 Watcher，对监听器 Observer 和 订阅者 Watcher 进行统一管理。

## 20. 为什么 splice 方法可以触发数组更新？

Vue 将被侦听的数组的变更方法进行了包裹，所以它们也将会触发视图更新。这些被包裹过的方法包括：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `sort()`
- `reverse()`

```js
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

`Vue.set` 在操作数组时，也是调用的 `splice`：

```js
function set(target: Array<any> | Object, key: any, val: any): any {
  // ...
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // ...
}
```

## 21. `vm.$forceUpdate()` 是做什么的？

强制使 `Vue` 实例重新渲染，其实 `this.list[1] = 'jerry'` 操作，`list` 确实已经更改了，我们调用 `vm.$forceUpdate()` 可以强制渲染。

通常你应该避免使用这个方法，而是通过数据驱动的正常方法来操作，想想你只是想更改某个数组项，但是却可能更新了整个组件。

## 22. Proxy 与 Object.defineProperty 优劣对比?

`Proxy` 的优势如下:

- 可以直接监听对象而非属性，任何属性发生变化都可以监听到，只是嵌套属性还是要用递归遍历；
- 可以直接监听数组的变化；
- 有多达 13 种拦截方法,不限于 `apply`、`ownKeys`、`deleteProperty`、`has` 等等是 `Object.defineProperty` 不具备的；
- 返回的是一个新对象,我们可以只操作新的对象达到目的,而 `Object.defineProperty` 只能遍历对象属性直接修改；
- 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利；

`Object.defineProperty` 的优势如下:

- 兼容性好，支持 IE9，而 `Proxy` 的存在浏览器兼容性问题,而且无法用 polyfill 磨平，因此 Vue 的作者才声明需要等到下个大版本( 3.0 )才能用 `Proxy` 重写。

## 23. 虚拟 DOM 的优缺点？

优点：

1. 无需手动操作 DOM，依靠数据来驱动视图变化。
2. 性能：虚拟 DOM 的性能并不是最优的，有时并不比直接操作 DOM 来的快，但至少可以保证在你不需要手动优化的情况下，依然可以提供还不错的性能，即保证性能的下限。
3. 跨平台： 虚拟 DOM 本质上是 JavaScript 对象,而 DOM 与平台强相关，相比之下虚拟 DOM 可以进行更方便地跨平台操作，例如服务器渲染、weex 开发等等。

缺点：

1. 无法进行极致优化： 虽然虚拟 DOM + 合理的优化，足以应对绝大部分应用的性能需求，但在一些性能要求极高的应用中虚拟 DOM 无法进行针对性的极致优化。

## 24. 虚拟 DOM 实现原理？

虚拟 DOM 的实现原理主要包括以下 3 部分：

- 用 JavaScript 对象模拟真实 DOM 树，对真实 DOM 进行抽象；
- diff 算法 — 比较两棵虚拟 DOM 树的差异；
- pach 算法 — 将两个虚拟 DOM 对象的差异应用到真正的 DOM 树。

[详细文章](https://juejin.cn/post/6844903895467032589)

## 25. Vue 中的 key 有什么作用？

`key` 的作用是：`key` 是为 Vue 中 `vnode` 的唯一标记，通过这个 `key`，我们的 `diff` 操作可以更准确、更快速。

更准确：因为带 `key` 就不是就地复用了，在 `sameNode` 函数 `a.key === b.key` 对比中可以避免就地复用的情况。所以会更加准确。

更快速：利用 `key` 的唯一性生成 `map` 对象来获取对应节点，比遍历方式更快。

实际上，并不是所有情况下都需要使用 `key`，比如你需要在改变列表顺序时明确的显示过渡效果，那就要使用 `key`，如果没这方面要求，不使用 `key` 反而更快。

## 26. 说说 vue 常用内置指令？

- `v-text` 指令将数据解析为纯文本，更新元素的文本内容。
- `v-html` 更新元素的 `innerHTML`。注意：**内容按普通 HTML 插入 - 不会作为 Vue 模板进行编译**
- `v-cloak` 可以隐藏未编译的差值表达式`{{}}`直到实例准备完毕。
- `v-show` 根据表达式之真假值，切换元素的 `display` 属性。当条件变化时该指令触发过渡效果。
- `v-if` 根据表达式的值的真假值来有条件地渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。
- `v-else/v-else-if` 同样用于条件判断，接在 `v-if` 后面。
- `v-for` 基于源数据多次渲染元素或模板块。此指令之值，必须使用特定语法：
  - 接收 `Array | Object | number | string | Iterable` 作为迭代对象。
  - 用法：`v-for="(item, index) in items"`,`v-for="(val, name, index) in object"` 等。
- `v-on` 绑定事件监听器，支持修饰符：
  - `.stop` - 调用 `event.stopPropagation()`。
  - `.prevent` - 调用 `event.preventDefault()`。
  - `.capture` - 添加事件侦听器时使用 `capture` 模式。
  - `.self` - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
  - `.{keyCode | keyAlias}` - 只当事件是从特定键触发时才触发回调。
  - `.native` - 监听组件根元素的原生事件。
  - `.once` - 只触发一次回调。
  - `.left` - 只当点击鼠标左键时触发。
  - `.right` - 只当点击鼠标右键时触发。
  - `.middle` - 只当点击鼠标中键时触发。
  - `.passive` - 以 `{ passive: true }` 模式添加侦听器。
- `v-bind` 动态地绑定一个或多个 `attribute`，或一个组件 `prop` 到表达式。支持修饰符：
  - `.prop` 作为一个 DOM property 绑定而不是作为 `attribute` 绑定。(差别在哪里？)
  - `.camel` 将 kebab-case attribute 名转换为 camelCase。
  - `.sync` 语法糖，会扩展成一个更新父组件绑定值的 `v-on` 侦听器。
- `v-model` 双向绑定，语法糖。
  - `.lazy` 通过这个修饰符，转变为在 `change` 事件再同步。
  - `.number` 自动将用户输入值转化为数值类型。
  - `.trim` 自动过滤用户输入的收尾空格。
- `v-slot` 提供具名插槽或需要接收 `prop` 的插槽。
- `v-pre` 跳过这个元素和它的子元素的编译过程。可以用来显示原始差值表达式。跳过大量没有指令的节点会加快编译。
- `v-once` 只渲染元素和组件一次。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

## 27. v-text 和 v-html 替换规则？

`v-text` 会更新元素的文本内容，而 `v-html` 会将字符串呈现为 `html` 代码并放入元素中。

`v-html` 内容按普通 HTML 插入 - 不会作为 Vue 模板进行编译。在单文件组件里，`scoped` 的样式不会应用在 `v-html` 内部，因为那部分 HTML 没有被 Vue 的模板编译器处理。

`v-html` 有可能会导致 XSS 攻击，因此不要用来绑定用户自定义的字符串。

## 28. 详细说说 v-bind.sync?

`v-model` 可以用来进行双向绑定，但如果我们需要对多个值进行绑定怎么办呢？

如果你封装过组件，你就知道直接使用 `v-model` 对组件进行双向绑定会产生许多副作用。因为这样子组件就可以改变父组件了，因此可以使用 `v-bind` + `$emit` 的形式：

```html
<!-- 父组件 -->
<text-document v-bind:title="doc.title" v-on:update:title="doc.title = $event"></text-document>
```

```js
// 子组件
this.$emit('update:title', newTitle)
```

我们在父组件内，给子组件绑定一个 `title`，然后使用 `v-on` 监听子组件改变 `title` 时执行的 `emit` 更新。

为了方便起见，可以使用 `sync` 语法糖代替：

```html
<text-document :title.sync="doc.title"></text-document>
```

如果同时设置多个绑定属性，可以：

```html
<text-document v-bind.sync="doc"></text-document>
```

这样，`doc` 对象中的每一个属性都会作为一个独立的 `prop` 传进去，然后各自添加用于更新的 `v-on` 监听器。

## 29. 详细说说 v-bind.prop?

在 html 标签里，我们可以定义各种 attribute。在浏览器解析 DOM 树渲染页面后，每个标签都会生成一个对应的 DOM 节点。节点是一个对象，所以会包含一些 properties，attributes 也是其中一个 property。

Attribute 对象包含标签里定义的所有属性，Property 只包含 HTML 标准的属性，不包含自定义属性（eg: data-xxx）。

`v-bind` 默认绑定到 DOM 节点的 attribute 上，使用 `.prop` 修饰符后，会绑定到 property。

**注意**：

- 使用 property 获取最新的值；
- attribute 设置的自定义属性会在渲染后的 HTML 标签里显示，property 不会。

因此使用 `prop` 修饰符可以通过自定义属性存储变量，避免暴露数据，防止污染 HTML 结构。

举个例子：

```bash
<input id="input" type="foo" value="11" :data="inputData"></input>
// 标签结构: <input id="input" type="foo" value="11" data="inputData 的值"></input>
// input.data === undefined
// input.attributes.data === this.inputData

<input id="input" type="foo" value="11" :data.prop="inputData"></input>
// 标签结构: <input id="input" type="foo" value="11"></input>
// input.data === this.inputData
// input.attributes.data === undefined
```

## 30. 请你说说 Vue 中 slot 和 slot-scope?

`slot` 分为三种，默认插槽、具名插槽和作用域插槽。

**子组件中**：

- 插槽用 `<slot>` 标签来确定渲染的位置，里面放如果父组件没传内容时的后备内容。
- 具名插槽用 `name` 属性来表示插槽的名字，不传为默认插槽。
- 作用域插槽在作用域上绑定属性来将子组件的信息传给父组件使用，这些属性会被挂在父组件 `slot-scope` 接受的对象上。

```html
<template>
  <div>
    <main>
    <!-- 默认插槽 -->
      <slot>
        <!-- slot内为后备内容 -->
        <h3>没传内容</h3>
      </slot>
    </main>
    <!-- 具名插槽 -->
    <header>
      <slot name="header">
        <h3>没传header插槽</h3>
      </slot>
    </header>
    <!-- 作用域插槽 -->
    <footer>
      <slot name="footer" testProps="子组件的值">
        <h3>没传footer插槽</h3>
      </slot>
    <footer>
  </div>
</template>
```

父组件中在使用时：

- `slot` 属性弃用，`v2.6+` 具名插槽通过指令参数 `v-slot:插槽名` 的形式传入，可以简化为 `#插槽名`。
- `slot-scope` 属性弃用，`v2.6+` 作用域插槽通过 `v-slot:xxx="slotProps"` 的 `slotProps` 来获取子组件传出的属性。
- `v-slot` 属性只能在 `<template>` 上使用，但在【只有默认插槽时】可以在组件标签上使用。

```html
<!-- Parent -->
<template>
  <child>
    <!--默认插槽-->
    <template v-slot>
      <div>默认插槽</div>
    </template>
    <!--具名插槽-->
    <template #header>
      <div>具名插槽</div>
    </template>
    <!--作用域插槽-->
    <template #footer="slotProps">
      <div>{{slotProps.testProps}}</div>
    </template>
  <child>
</template>
```

当使用作用域插槽时：

- 同样可以通过解构获取 `v-slot={user}`。
- 还可以重命名 `v-slot="{user: newName}"` 和定义默认值 `v-slot="{user = '默认值'}"`。
- 插槽名可以是动态变化的 `v-slot:[slotName]`。

注意：

- 默认插槽名为 `default`，可以省略 `default` 直接写 `v-slot`，缩写为#时不能不写参数，写成 `#default`（这点所有指令都一样，`v-bind`、`v-on`）
- 多个插槽混用时，`v-slot` 不能省略 `default`。

## 31. 作用域插槽的原理是怎样的？

`slot` 本质上是返回 `VNode` 的函数，一般情况下，Vue 中的组件要渲染到页面上需要经过
`template >> render function >> VNode >> DOM` 过程。组件挂载的本质就是执行渲染函数得到 `VNode`，至于 `data/props/computed` 这些属性都是给 `VNode` 提供数据来源。

在 2.5 之前，如果是普通插槽就直接是 `VNode` 的形式了，而如果是作用域插槽，由于子组件需要在父组件访问子组件的数据，所以父组件下是一个未执行的函数 `(slotScope) => return h('div', slotScope.msg)`，接受子组件的 `slotProps` 参数，在子组件渲染实例时会调用该函数传入数据。

在 2.6 之后，两者合并，普通插槽也变成一个函数，只是不接受参数了。

## 32. nextTick 知道吗，实现原理是什么？

由于 Vue DOM 更新是异步执行的，即修改数据时，视图不会立即更新，而是会监听数据变化，并缓存在同一事件循环中，等同一数据循环中的所有数据变化完成之后，再统一进行视图更新。为了确保得到更新后的 DOM，所以设置了 `Vue.nextTick()` 方法。

在下次 DOM 更新循环结束之后执行延迟回调。`nextTick` 主要使用了宏任务和微任务。根据执行环境分别尝试采用

- `Promise`
- `MutationObserver`
- `setImmediate`
- 如果以上都不行则采用 `setTimeout`

定义了一个异步方法，多次调用 `nextTick` 会将方法存入队列中，通过这个异步方法清空当前队列。

源码实现如下：

```js
// 空函数，可用作函数占位符
import { noop } from 'shared/util'
// 错误处理函数
import { handleError } from './error'
// 是否是IE、IOS、内置函数
import { isIE, isNative } from './env'

// 用来存储所有需要执行的回调函数
const callbacks = []

// 用来标志是否正在执行回调函数
let pending = false

// 对callbacks进行遍历，然后执行相应的回调函数
function flushCallbacks() {
  pending = false
  // 这里拷贝的原因是：
  // 有的cb 执行过程中又会往callbacks中加入内容
  // 比如 $nextTick的回调函数里还有$nextTick
  // 后者的应该放到下一轮的nextTick 中执行
  // 所以拷贝一份当前的，遍历执行完当前的即可，避免无休止的执行下去
  const copies = callbacks.slice(0)
  callbacks.length = 0 // 清空 callback
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
let timerFunc // 异步执行函数 用于异步延迟调用 flushCallbacks 函数
// 在2.5中，我们使用(宏)任务(与微任务结合使用)。
// 然而，当状态在重新绘制之前发生变化时，就会出现一些微妙的问题
// (例如#6813,out-in转换)。
// 同样，在事件处理程序中使用(宏)任务会导致一些奇怪的行为
// 因此，我们现在再次在任何地方使用微任务。
// 优先使用 Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) || MutationObserver.toString === '[object MutationObserverConstructor]')
) {
  // 当 原生Promise 不可用时，使用 原生MutationObserver
  let counter = 1
  // 创建MO实例，监听到DOM变动后会执行回调flushCallbacks
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true, // 设置true 表示观察目标的改变
  })

  // 每次执行timerFunc 都会让文本节点的内容在 0/1之间切换
  // 切换之后将新值复制到 MO 观测的文本节点上
  // 节点内容变化会触发回调
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter) // 触发回调
  }
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

`nextTick`：

```js
export function nextTick(cb? Function, ctx: Object) {
  let _resolve
  // cb 回调函数会统一处理压入callbacks数组
  callbacks.push(() => {
    if(cb) {
      try {
        cb.call(ctx)
      } catch(e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })

  // pending 为false 说明本轮事件循环中没有执行过timerFunc()
  if(!pending) {
    pending = true
    timerFunc()
  }

  // 当不传入 cb 参数时，提供一个promise化的调用
  // 如nextTick().then(() => {})
  // 当_resolve执行时，就会跳转到then逻辑中
  if(!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

## 33. Computed 和 Watch 的区别？

`Computed` 本质是一个具备缓存的 `watcher`，依赖的属性发生变化就会更新视图。适用于计算比较消耗性能的计算场景。当表达式过于复杂时，在模板中放入过多逻辑会让模板难以维护，可以将复杂的逻辑放入计算属性中处理。

`Watch` 没有缓存性，更多的是观察的作用，可以监听某些数据执行回调。当我们需要深度监听对象中的属性时，可以打开 `deep：true` 选项，这样便会对对象中的每一项进行监听。这样会带来性能问题，优化的话可以使用字符串形式监听，如果没有写到组件中，不要忘记使用 `unWatch` 手动注销哦。

## 34. Vue 事件绑定原理是什么？

原生事件绑定是通过 `addEventListener` 绑定给真实元素的，组件事件绑定是通过 Vue 自定义的 `$on` 实现的。

## 35. v-on 实现原理？

`v-on` 指令在 vue 中用于绑定 DOM/自定义事件 的响应处理函数，可以用在 HTML 原生标签上，也可以用于自定义的 vue 组件标签上。

`v-on` 指令是在模板(即 `template` 标签中)的，只要在模板中的事物，一定会经过模板编译的处理，模板编译大致上可以分为 AST 和 Codegen。

AST 处理后，会在对应的 AST 节点上生成 `events` 属性，`events` 属性是一个对象，`key` 值是 `v-on` 绑定的事件名称，值是事件的响应函数。

AST 处理后生成的节点树，会经过 Codegen 处理生成渲染函数。

Codegen 时递归的对每一个 AST 节点进行处理。针对 `events` 属性，最终的 `data` 属性中有一个 `on` 属性(如果有 `native` 事件，还会有 `nativeOn` 属性)，`on` 属性的值也是一个对象，其中的 `key` 值是事件名称，`value` 值是事件响应函数。

举个例子：

```html
// App.vue
<template>
  <div id="app">
    <button @click="handleButtonClick"></button>
    <HelloWorld @customEvent="handleCustomEvent" />
  </div>
</template>
```

经由 AST，Codegen，最终生成的渲染函数如下：

```js
// App.vue 编译后的render函数
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    'div',
    { attrs: { id: 'app' } },
    [
      _c('button', { on: { click: _vm.handleButtonClick } }),
      _vm._v(' '),
      _c('HelloWorld', { on: { customEvent: _vm.handleCustomEvent } }),
    ],
    1
  )
}
```

在实例化 vue 组件时，会进行初始化处理，在初始化时就会对 `events` 属性进行处理。

`$emit` 的逻辑很简单，就是从 `vm._events` 属性中取对应事件的响应函数，然后执行。

## 36. Vue 模版编译原理?

简单说，Vue 的编译过程就是将 template 转化为 render 函数的过程。会经历以下阶段：

1. 生成 AST 树
2. 优化
3. codegen

首先解析模版，生成 AST 语法树(一种用 JavaScript 对象的形式来描述整个模板)。使用大量的正则表达式对模板进行解析，遇到标签、文本的时候都会执行对应的钩子进行相关处理。

Vue 的数据是响应式的，但其实模板中并不是所有的数据都是响应式的。有一些数据首次渲染后就不会再变化，对应的 DOM 也不会变化。那么优化过程就是深度遍历 AST 树，按照相关条件对树节点进行标记。这些被标记的节点(静态节点)我们就可以跳过对它们的比对，对运行时的模板起到很大的优化作用。

编译的最后一步是将优化后的 AST 树转换为可执行的代码。

## 37. Vue2.x 和 Vue3.x 渲染器的 diff 算法原理是什么？

### Vue2.x

简单来说，diff 算法有以下过程

- 同级比较，再比较子节点
- 先判断一方有子节点一方没有子节点的情况(如果新的 `children` 没有子节点，将旧的子节点移除)
- 比较都有子节点的情况(核心 diff)
- 递归比较子节点

正常 Diff 两个树的时间复杂度是 $O(n^3)$，假设两个树的节点数都为 $n$，每一个节点都需要和另一个树的全部节点依次比较，因此复杂度为 $O(n^2)$，在对比过程中发现旧节点在新的树中未找到，那么就需要把旧节点删除，删除一棵树的一个节点(找到一个合适的节点放到被删除的位置)的时间复杂度为 $O(n)$,同理添加新节点的复杂度也是 $O(n)$,合起来 diff 两个树的复杂度就是 $O(n^3)$。

但实际情况下我们很少会进行跨层级的移动 DOM，所以 Vue 将 Diff 进行了优化，从 $O(n^3) -> O(n)$，只有当新旧 `children` 都为多个子节点时才需要用核心的 Diff 算法进行同层级比较。

Vue2 的核心 Diff 算法采用了双端比较的算法，同时从新旧 `children` 的两端开始进行比较，也就是说在新旧两个树的头部和尾部分别放上指针，然后不断的对比合拢。

双端比较步骤（按顺序）：

1. `oldStartNode` 和 `newStartNode` 对比，若相同两个指针都往右移一位，不同则进入下一步
2. `oldEndNode` 和 `newEndNode` 对比，若相同两个指针都往 左移一位，不同则进入下一步
3. `oldStartNode` 和 `newEndNode` 对比，若相同则将 `oldStartNode` 移动至结尾，`oldStartNode` 指针右移一位，`newEndNode` 指针 左移一位 ，不同则进入下一步
4. `oldEndNode` 和 `newStartNode` 对比，若相同则将 `oldEndNode` 移动至开头，`oldEndNode` 指针左移一位， `newStartNode` 指针右移一位，不同则结束，**注意** ：以上任意步骤成功指针移动后，将重新开始从第一步开始比较！

参考图：

![](http://picstore.lliiooiill.cn/1635491107%281%29.jpg)

#### 特殊情况

![](http://picstore.lliiooiill.cn/1635491647%281%29.jpg)

有的时候执行了 4 个步骤都没有匹配，这下怎么办呢？

那么我们该怎么办呢？我们拿新列表的第一个节点 `b` 去旧列表进行进行遍历比较，这里会有两种情况， **找到相同节点** 和 **没找到相同节点**。

在旧节点中找到 相同节点 `b` ，将节点 `b` 移动到首位 ，就像上面的步骤四一样。 然后重新开始进行双端的步骤对比。

如果我们没有在旧列表里面找到节点，就在新树头部添加一个 `e` 节点 ，然后将 `newStartNode` 指针后移， 然后开始进行双端对比！重复之前的步骤。

### Vue3.x

Vue3.x 借鉴了 ivi 算法和 inferno 算法。

在创建 `VNode` 时就确定其类型，以及在 `mount/patch` 的过程中采用位运算来判断一个 `VNode` 的类型，在这个基础之上再配合核心的 Diff 算法，使得性能上较 Vue2.x 有了提升。

该算法中还运用了动态规划的思想求解最长递归子序列。

## 38. created 使用 async 之后，会阻塞后续生命周期的执行么？

不会，vue 的生命周期不会设计成阻塞形式的。因此，即便将 `created` 变成 `async` 函数在里面做异步请求，也仍然是等到 `mounted` 之后再执行。因此如果在请求后改变数据还是会造成数据的二次渲染。

## 39. computed 和 methods 的区别？

`computed` 计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。这就意味着只要 `message` 还没有发生改变，多次访问 `reversedMessage` 计算属性会立即返回之前的计算结果，而不必再次执行函数。而方法却会执行。

`methods` 可以接受参数，而 `computed` 不能。

## 40. watch 是一个对象时，它有哪些选项？

- `handler` 监听数据变化时执行的函数。
- `deep` 是否深度。
- `immediate` 是否立即执行。

## 41. vue-router 全局守卫，局部守卫有哪些，触发顺序如何？

全局路由守卫：`beforeEach`，`beforeResolve(v2.5+)`，`afterEach`。

单个路由独享：`beforeEnter`。

组件独享路由：`beforeRouteEnter`，`beforeRouteUpdate`，`beforeRouteLeave`。

**参数或查询的改变并不会触发进入/离开的导航守卫**!

- `beforeEach` ：全局前置守卫，进入路由之前被调用。
- `beforeResolve`：全局解析守卫(2.5.0+) 在 `beforeRouteEnter` 调用之后调用。
- `afterEach`：全局后置钩子，进入路由之后 注意:**不支持 next()**。

- `beforeEnter`：路由只独享这一个钩子，在 `routes` 里配置。

- `beforeRouteEnter`：进入路由前，此时实例还没创建，无法获取到 `this`。但是回调的执行时机在 `mounted` 后面。
- `beforeRouteUpdate`：路由复用同一个组件时，可以访问组件的 `this`，比如 `/foo/1` 跳转到 `/foo/2` 时用到了同样的 `Foo` 组件，产生了组件复用，就会触发这个钩子。
- `beforeRouteLeave`：离开当前路由，此时可以用来保存数据，或数据初始化，或关闭定时器等等，可以访问组件的 `this`。我们用它来禁止用户离开，比如还未保存草稿，或者在用户离开前，将 `setInterval` 销毁，防止离开之后，定时器还在调用。

## 42. 路由导航切换路由解析过程中生命周期执行顺序是怎样的？

- 触发进入其他路由。
- 调用要离开路由的组件守卫 `beforeRouteLeave`。
- 调用局前置守卫：`beforeEach`。
- 在重用的组件里调用 `beforeRouteUpdate`，没有重用路由组件则不执行。
- 调用路由独享守卫 `beforeEnter`。
- 解析异步路由组件。
- 在将要进入的路由组件中调用 `beforeRouteEnter`。
- 调用全局解析守卫 `beforeResolve`。
- 导航被确认。
- 调用全局后置钩子的 `afterEach` 钩子。
- 触发 DOM 更新。
- `beforeCreate`。
- `created`。
- `beforeMount`。
- `deactivated` 离开缓存组件 `a`，没有 `keep-alive` 缓存就会触发 `a` 的 `beforeDestroy` 和 `destroyed` 组件销毁钩子。
- `mounted`。
- `activated` 进入缓存组件，进入 `a` 的嵌套子组件(如果有的话)。
- 执行 `beforeRouteEnter` 守卫中传给 `next` 的回调函数。

## 43. vue-router 动态路由是什么？

我们经常需要把某种模式匹配到的所有路由，全都映射到同个组件。例如，我们有一个 `User` 组件，对于所有 `ID` 各不相同的用户，都要使用这个组件来渲染。那么，我们可以在 vue-router 的路由路径中使用**动态路径参数**。

但如果我们是从一个用户的页面跳到另外一个用户的页面，仅仅改变动态路由的参数不会触发跳转，有三种解决办法：

```js
beforeRouteUpdate(to, from, next){
  this.getData(to.params.ID)
}
```

或者：

```js
{
  watch：{
    "router":function(){
      this.getData(this.$router.params.ID)
    }
  }
}
```

或者通过绑定 `key` 实现强制刷新：

```html
<router-view :key="$route.fullPath"></router-view>
```

## 44. Vue 源码有用到哪些设计模式？

### 观察者模式

Vue **响应式**使用到的设计模式是**观察者模式**，观察者模式由观察对象和观察者组成。

- **观察对象** (Subject)：拥有两个必要标识，通知当前实例所拥有的观察者的方法。给当前实例添加观察者的方法。
- **观察者**（Observer）：拥有一个必要标识，通知实例更新状态的方法。

观察对象 (Subject) 通过自己内部的通知函数，调用所有观察者列表中所有观察者对应的回调函数，达到通知观察者的目的。

观察者（Observer）通过调用观察者对象（Subject）中的添加方法，把自己回调函数传入他的观察者列表中。

实现代码：

```js
/**
 * 观察监听一个对象成员的变化
 * @param {Object} obj 观察的对象
 * @param {String} targetVariable 观察的对象成员
 * @param {Function} callback 目标变化触发的回调
 */
function observer(obj, targetVariable, callback) {
  if (!obj.data) {
    obj.data = {}
  }
  Object.defineProperty(obj, targetVariable, {
    get() {
      return this.data[targetVariable]
    },
    set(val) {
      this.data[targetVariable] = val
      // 目标主动通知观察者
      callback && callback(val)
    },
  })
  if (obj.data[targetVariable]) {
    callback && callback(obj.data[targetVariable])
  }
}
```

### 发布-订阅模式

Vue 的事件触发(`$on` 和 `$emit`)使用的是发布订阅模式。

发布订阅模式是对象中的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖与它的对象都将得到状态改变的通知。

发布订阅模式有三个角色：

- **订阅者**，订阅者的作用是：向调度中心注册一个事件，这个事件的作用是处理状态改变后的业务。
- **发布者**，发布者的作用是：向调度中心发起一个状态改变的通知。
- **调度中心**，调度中心的作用是：将发布者状态改变时向调度中心发送的通知，告知给订阅者。

node.js 中 `EventEmitter` 中的 `on` 和 `emit` 就用到了这个模式。

实现代码：

```js
class Event {
  constructor() {
    // 所有 eventType 监听器回调函数（数组）
    this.listeners = {}
  }
  /**
   * 订阅事件
   * @param {String} eventType 事件类型
   * @param {Function} listener 订阅后发布动作触发的回调函数，参数为发布的数据
   */
  on(eventType, listener) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = []
    }
    this.listeners[eventType].push(listener)
  }
  /**
   * 发布事件
   * @param {String} eventType 事件类型
   * @param {Any} data 发布的内容
   */
  emit(eventType, data) {
    const callbacks = this.listeners[eventType]
    if (callbacks) {
      callbacks.forEach((c) => {
        c(data)
      })
    }
  }
}

const event = new Event()
event.on('open', (data) => {
  console.log(data)
})
event.emit('open', { open: true })
```

### 工厂模式

Vue 在生成 `VNode` 的时候使用了工厂模式，虚拟 DOM 根据参数的不同返回基础标签的 VNode 和组件 VNode：

```js
class VNode (tag, data, children) { ... }

function createElement(tag, data, children) {
  return new VNode(tag, data, children)
}

createElement('div', { class: 'body' }, [
  createElement('a', { class: 'title', attrs: { href: 'www.baidu.com' } }),
  createElement('span', { class: 'content' }, '百度网址')
])
```

### 单例模式

vuex 和 vue-router 的插件注册方法 `install` 判断如果系统存在实例就直接返回掉。

### 策略模式

策略模式指对象有某个行为，但是在不同的场景中，该行为有不同的实现方案 - 比如 Vue 中选项的合并策略。当组件初始化时会调用 `mergeOptions` 方法进行合并，采用策略模式针对不同的属性进行合并。

Vue 中的全局选项如下：

1. Vue.component 注册的 【全局组件】
2. Vue.filter 注册的 【全局过滤器】
3. Vue.directive 注册的 【全局指令】
4. Vue.mixin 注册的 【全局 mixin】

全局注册的选项，其实会被传递引用到你的每个组件中，这样，**全局选项** 和 **组件选项** 就会合并起来，之后组件便能访问到全局选项，然后你就可以在组件内使用全局注册的选项，比如使用 **全局过滤器**。

其实就是像你在自己的组件声明 components 一样，只是全局注册的话，Vue 背后偷偷给你的每个组件都合并多一个全局选项的引用。

但是为了保证全局选项不被污染，又不可能每个组件都深度克隆一份全局选项导致开销过大，所以会根据不同的选项，做不同的处理。

## 45. 发布者模式和观察者模式的区别?

相同点：

都是对象中的一种一对多的依赖关系，当对应的状态发生改变时，执行相应的更新。

不同点：

1. 发布者模式有调度中心，观察者模式没有调度中心。
2. 发布者模式的更新是由调度中心发起的，而观察者模式的更新是由目标（订阅者）发起的
3. 发布者模式，双方并不知道对方的存在，而观察者模式是必须要知道的，基础自定义事件。
4. 发布者模式是低耦合的，而观察者是高耦合的。

## 46. Vue.mixin 的使用场景和原理是什么？

在日常开发中，我们经常会遇到在不同组件中经常用到一些相同或者相似的代码，这些代码的功能相对独立，可以通过 vue 的 `mixin` 功能抽离公共的业务逻辑，原理类似“对象的继承”，当组件初始化时会调用 `mergeOptions` 方法进行合并，采用策略模式针对不同的属性进行合并。当组件和混入对象含有相同名选项时，这些选项将以恰当的方式进行“合并”。

合并原理可以理解为：

举个例子：

1. 组件选项：代号为 A
2. 组件-mixin：代号为 B
3. 组件-mixin-mixin ：代号为 C
4. 全局选项 ：代号为 D

包括选项：data，provide

把两个函数合并加到一个新函数中，并返回这个函数。在函数里面，会执行那两个方法。

按照这个流程，使用代号：

1. D 和 C 合并成一个函数 (CD)，函数执行时，会执行 C ，再执行 D。
2. (CD) 和 B 合并成 一个函数 (B(CD))，函数执行时，会执行 B ，再执行 (CD)。
3. (B(CD)) 和 A 合并成一个函数，函数执行时，会执行 A ，再执行 (B(CD))。

有点绕，简化执行流程是： **A->B->C->D**

```js
var test_mixins = {
  data() {
    return { name: 34 }
  },
}

var a = new Vue({
  mixins: [test_mixins],
  data() {
    return { name: 12 }
  },
})
```

向上面这种情况，`mixin` 和组件本身的 `data` 都有 `name` 这个数据，很显然会以组件本身的为主，因为组件本身权重大。

其他的属性，都是按照类似的规则，如果组件本身已经具有该属性并且不为 `undefined`，那么 `mixin` 就不会覆盖原来的属性。

对于传进来的**生命周期函数**，则会按照权重从小到大排列，会合并成一个数组：

1. 全局 mixin - created，
2. 组件 mixin-mixin - created，
3. 组件 mixin - created，
4. 组件 options - created

执行的时候也是从上到下依次执行。

对于 `watch`，也合并成一个下面这样的数组，权重越大的越放后面。执行顺序和上面的一样。

`components`，`filters`，`directives` 会产生**原型叠加**，两个对象合并的时候，不会相互覆盖，而是 **权重小的被放到权重大的的原型上**。

这样权重大的，访问快些，因为作用域链短了：

```dash
A.__proto__ = B
B.__proto__ = C
C.__proto__ = D
```

`props`，`methods`，`computed`，`inject` 会产生**覆盖叠加**。

两个对象合并，如果有重复 `key`，权重大的覆盖权重小的。

组件的 `props：{ name:""}`
组件 mixin 的 `props：{ name:"", age: "" }`

那么 把两个对象合并，有相同属性，以 权重大的为主，组件的 `name` 会替换 `mixin` 的 `name`。

**直接替换**是默认的处理方式，当选项不属于上面的处理方式的时候，就会像这样处理，包含选项：**el**，**template**，**propData** 等，因为这些属性只允许存在一个，因此只使用权重最大的选项。

## 47. Vuex 为什么要分模块并且加命名空间？

模块： 由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，`store` 对象就有可能会变得相当臃肿。为了解决以上问题，`Vuex` 允许我们将 `store` 分割成模块（module）。每个模块拥有自己的 `state`、`mutation`、`action`、`getter`、甚至是嵌套子模块。

命名空间： 默认情况下，模块内部的 `action`、`mutation`、`getter` 是注册在全局命名空间的 --- 这样使得多个模块能够对同一 `mutation` 或 `action` 做出响应。如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced:true` 的方式使其成为带命名的模块。当模块被注册后，他所有 `getter`、`action`、及 `mutation` 都会自动根据模块注册的路径调整命名。

## 48. 什么是 MutationObserver?

MutationObserver 是 HTML5 中的 API，是一个用于监视 DOM 变动的接口，它可以监听一个 DOM 对象上发生的子节点删除、属性修改、文本内容修改等。该功能是 DOM3 Events 规范的一部分。

调用过程是要先给它绑定回调，得到 MO 实例，这个回调会在 MO 实例监听到变动时触发。这里 MO 的回调是放在 microtask 中执行的。

下面是例子：

```js
// 选择需要观察变动的节点
const targetNode = document.getElementById('some-id')

// 观察器的配置（需要观察什么变动）
const config = { attributes: true, childList: true, subtree: true }

// 当观察到变动时执行的回调函数
const callback = function(mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('A child node has been added or removed.')
    } else if (mutation.type === 'attributes') {
      console.log('The ' + mutation.attributeName + ' attribute was modified.')
    }
  }
}

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback)

// 以上述配置开始观察目标节点
observer.observe(targetNode, config)

// 之后，可停止观察
observer.disconnect()
```

## 49. Vue.set 方法原理?

对于 Vue 的响应式对象和数组，以下情况是不会触发 Vue 的视图更新的。

1. 直接更改数组下标来修改数组的值。
2. 在实例创建之后添加新的属性到实例上。
3. 删除响应式对象的属性。

因为响应式数据 我们给对象和数组本身新增了 `__ob__` 属性，代表的是 `Observer` 实例。当给对象新增不存在的属性，首先会把新的属性进行响应式跟踪 然后会触发对象 `__ob__` 的 `dep` 收集到的 `watcher` 去更新，当修改数组索引时我们调用数组本身的 `splice` 方法去更新数组。

## 50. Vue.extend 作用和原理?

`Vue.extend` 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。

其实就是一个子类构造器，是 Vue 组件的核心 api。实现思路就是使用原型继承的方法返回了 vue 的子类，并且利用 `mergeOptions` 把传入组件的 `options` 就和父类的 `options` 进行了合并。

## 51. 写过自定义指令吗？原理是什么？

指令本质上是装饰器，是 vue 对 HTML 元素的扩展，给 HTML 元素添加自定义功能。vue 编译 DOM 时，会找到指令对象，执行指令的相关方法。

自定义指令有五个生命周期（也叫钩子函数），分别是 `bind`、`inserted`、`update`、`componentUpdated`、`unbind`：

1. `bind`：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
2. `inserted`：被绑定元素插入父节点时调用。
3. `update`：被绑定元素所在的模板更新时调用，而不论绑定值是否变化。通过比较前后的绑定值。
4. `componentUpdated`：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
5. `unbind`：只调用一次，指令与元素解绑时调用。

原理：

1. 在生成 ast 语法树时，遇到指令会给当前元素添加 `directives` 属性。
2. 通过 `genDirectives` 生成指令代码。
3. 在 patch 前将指令的钩子提取到 cbs 中，在 patch 过程中调用对应的钩子。
4. 当执行指令对应钩子函数时，调用对应指令定义方法。

初始化全局 API 时，在 platforms/web 下，调用 createPatchFunction 生成 VNode 转换为真实 DOM 的 patch 方法。

在 patch 过程中，每此调用 createElm 生成真实 DOM 时，都会检测当前 VNode 是否存在 data 属性，存在，则会调用 invokeCreateHooks，走初创建的钩子函数。

对于首次创建，执行过程如下：

1. `oldVnode === emptyNode`，`isCreate` 为`true`，调用当前元素中所有 `bind` 钩子方法。
2. 检测指令中是否存在 `inserted` 钩子，如果存在，则将 `insert` 钩子合并到 `VNode.data.hooks` 属性中。
3. DOM 挂载结束后，会执行 `invokeInsertHook`，所有已挂载节点，如果 `VNode.data.hooks` 中存在 `insert` 钩子。则会调用，此时会触发指令绑定的 `inserted` 方法。

一般首次创建只会走 `bind` 和 `inserted` 方法，而 `update` 和 `componentUpdated` 则与 `bind` 和 `inserted` 对应。在组件依赖状态发生改变时，会用 VNode diff 算法，对节点进行打补丁式更新，其调用流程：

1. 响应式数据发生改变，调用 `dep.notify`，通知数据更新。
2. 调用 `patchVNode`，对新旧 VNode 进行差异化更新，并全量更新当前 VNode 属性（包括指令，就会进入 `updateDirectives` 方法）。
3. 如果指令存在 `update` 钩子方法，调用 `update` 钩子方法，并初始化 `componentUpdated` 回调，将 `postpatch hooks` 挂载到 `VNode.data.hooks` 中。
4. 当前节点及子节点更新完毕后，会触发 `postpatch hooks`，即指令的 `componentUpdated` 方法

## 52. 函数式组件使用场景和原理？

函数式组件与普通组件的区别：

1. 函数式组件需要在声明组件时指定 `functional:true`。
2. 不需要实例化，所以没有 `this`，`this` 通过 `render` 函数的第二个参数 `context` 代替。
3. 没有生命周期钩子函数，不能使用计算属性，`watch`。
4. 不能通过 `$emit` 对外暴露事件，调用事件只能通过 `context.listeners.click` 的方式调用外部传入的事件。
5. 因为函数组件时没有实例化的，所以在外部通过 `ref` 去引用组件时，实际引用的是 `HTMLElement`。
6. 函数式组件的 `props` 可以不用显示声明，所以没有在 `props` 里面声明的属性都会被自动隐式解析为 `prop`，而普通的组件所有未声明的属性都解析到 `$attrs` 里面，并自动挂载到组件根元素上（可以通过 `inheritAttrs` 属性禁止）。

优点：1.由于函数组件不需要实例化，无状态，没有生命周期，所以渲染性要好于普通组件 2.函数组件结构比较简单，代码结构更清晰。

使用场景：

一个简单的展示组件，作为容器组件使用 比如 `router-view` 就是一个函数式组件。 “高阶组件”---用于接受一个组件为参数，返回一个被包装过的组件。

## 53. v-if 和 v-for 用在一起会冲突怎么办？

`v-if` 和 `v-for` 一起使用，`v-for` 的优先级要高于 `v-if`。

因此该模板：

```html
<ul>
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
</ul>
```

将会经过如下运算：

```js
this.users.map((user) => {
  if (user.isActive) {
    return user.name
  }
})
```

哪怕我们只渲染出一小部分的用户元素，也得在每次重新渲染的时候遍历整个列表，不论活跃用户是否发生了改变。

因此有几种解决办法：

1. 用 `computed` 属性计算出符合条件的数组再渲染：

```js
{
  computed: {
    result(){
      return this.users.filter((item) => user.isActive)
    }
  }
}
```

2. 将 `v-for` 提升到上一层的 `template` 中：

```html
<ul>
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">
      {{ user.name }}
    </li>
  </template>
</ul>
```

3. 使用 `v-show` 代替 `v-if`，由于 `v-show` 只是将 `display` 置为 `none`，因此仍然会包含到 DOM 树中。

```html
<ul>
  <li v-for="user in users" v-show="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
</ul>
```

## 54. params 和 query 的区别？

`query` 要用 `path` 来引入，`params` 要用 `name` 来引入，接收参数都是类似的，分别是 `this.$route.query.name` 和 `this.$route.params.name` 。`url` 地址显示：`query` 更加类似于我们 ajax 中 `get` 传参，`params` 则类似于 post，说的再简单一点，前者在浏览器地址栏中显示参数，后者则不显示。

注意点：`query` 刷新不会丢失 `query` 里面的数据 `params` 刷新会丢失 `params` 里面的数据。

## 55. Vue 的 EventBus 是什么？

EventBus 是消息传递的一种方式，基于一个消息中心，订阅和发布消息的模式，称为发布订阅者模式。

- `on('name', fn)` 订阅消息，`name:` 订阅的消息名称，`fn:` 订阅的消息。
- `emit('name', args)` 发布消息, `name:` 发布的消息名称 ，`args:` 发布的消息。

```js
class Bus {
  constructor() {
    this.callbacks = {}
  }
  $on(name, fn) {
    this.callbacks[name] = this.callbacks[name] || []
    this.callbacks[name].push(fn)
  }
  $emit(name, args) {
    if (this.callbacks[name]) {
      //存在遍历所有callback
      this.callbacks[name].forEach((cb) => cb(args))
    }
  }
}
const EventBus = new EventBusClass()
EventBus.on('fn1', function(msg) {
  alert(`订阅的消息是：${msg}`)
})
EventBus.emit('fn1', '你好，世界！')
```

## 56. Vuex getter 是什么？

使用 `getter` 属性，相当 Vue 中的计算属性 `computed`，只有原状态改变派生状态才会改变。如果 Vuex 中要从 `state` 派生一些状态出来，且多个组件使用它，就可以使用 `getter`。

`getter` 接收两个参数，第一个是 `state`，第二个是 `getters`(可以用来访问其他 `getter`)。

然后在组件中可以用计算属性 `computed` 通过 `this.$store.getters.total` 这样来访问这些派生转态。

## 57. Vuex 中 action 和 mutation 有什么区别？

- `action` 提交的是 `mutation`，而不是直接变更状态。`mutation` 可以直接变更状态。
- `action` 可以包含任意异步操作。`mutation` 只能是同步操作。
- 提交方式不同，`action` 是用 `this.$store.dispatch('ACTION_NAME',data)` `来提交。mutation` 是用 `this.$store.commit('SET_NUMBER',10)` 来提交。
- 接收参数不同，`mutation` 第一个参数是 `state`，而 `action` 第一个参数是 `context`，其包含了：

```js
context = {
  state, // 等同于 `store.state`，若在模块中则为局部状态
  rootState, // 等同于 `store.state`，只存在于模块中
  commit, // 等同于 `store.commit`
  dispatch, // 等同于 `store.dispatch`
  getters, // 等同于 `store.getters`
  rootGetters, // 等同于 `store.getters`，只存在于模块中
}
```

## 58. Vuex 中 action 通常是异步的，那么如何知道 action 什么时候结束呢？

在 `action` 函数中返回 `Promise`，然后再提交时候用 `then` 处理：

```js
actions:{
  SET_NUMBER_A({commit},data){
    return new Promise((resolve,reject) =>{
      setTimeout(() =>{
        commit('SET_NUMBER',10);
        resolve();
      },2000)
    })
  }
}
this.$store.dispatch('SET_NUMBER_A').then(() => {
  // ...
})
```

## 59. 在模块中，getter 和 mutation 接收的第一个参数 state，是全局的还是模块的？

第一个参数 `state` 是模块的 `state`，也就是局部的 `state`。

## 60. 用过 Vuex 模块的命名空间吗？为什么使用，怎么使用?

默认情况下，模块内部的 `action`、`mutation` 和 `getter` 是注册在全局命名空间，如果多个模块中 `action`、`mutation` 的命名是一样的，那么提交 `mutation`、`action` 时，将会触发所有模块中命名相同的 `mutation`、`action`。

这样有太多的耦合，如果要使你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。

```js
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
```

## 61. 怎么在带命名空间的模块内提交全局的 mutation 和 action？

将 `{ root: true }` 作为第三参数传给 `dispatch` 或 `commit` 即可。

```js
this.$store.dispatch('actionA', null, { root: true })
this.$store.commit('mutationA', null, { root: true })
```

## 62. 怎么在带命名空间的模块内注册全局的 action？

```js
export default {
  actions: {
    actionA: {
        root: true,
        handler (context, data) { ... }
    }
  }
}
```

## 63. 怎么使用 mapState，mapGetters，mapActions 和 mapMutations 这些函数来绑定带命名空间的模块？

首先使用 `createNamespacedHelpers` 创建基于某个命名空间辅助函数。

```js
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('moduleA')
export default {
  computed: {
    // 在 `module/moduleA` 中查找
    ...mapState({
      a: (state) => state.a,
      b: (state) => state.b,
    }),
  },
  methods: {
    // 在 `module/moduleA` 中查找
    ...mapActions(['actionA', 'actionB']),
  },
}
```

## 64. 在 Vuex 插件中怎么监听组件中提交 mutation 和 action？

```js
export default function createPlugin(param) {
  return (store) => {
    store.subscribe((mutation, state) => {
      console.log(mutation.type) //是那个mutation
      console.log(mutation.payload)
      console.log(state)
    })
    // store.subscribeAction((action, state) => {
    //     console.log(action.type)//是那个action
    //     console.log(action.payload)//提交action的参数
    // })
    store.subscribeAction({
      before: (action, state) => {
        //提交action之前
        console.log(`before action ${action.type}`)
      },
      after: (action, state) => {
        //提交action之后
        console.log(`after action ${action.type}`)
      },
    })
  }
}
```

然后在 `store/index.js` 文件中写入:

```js
import createPlugin from './plugin.js'
const myPlugin = createPlugin()
const store = new Vuex.Store({
  // ...
  plugins: [myPlugin],
})
```

## 65. 怎么在 Vuex 中监听属性的变化？

`store.watch` 方法的作用就是监听 `state` 或是 `getters` 的变化，它实际上跟 vue 实例的 `watch` 作用差不多，比如 `state` 有一个状态叫 `a`：

```js
{
  created() {
    this.$store.watch((state, getter) => {
      return state.a
    }, (newVal) => {
      console.log('变成了', newVal);
    });
  },
}
```

只要 `state` 的 `a` 有变化，就会被监听到。

## 66. Vuex.subscribe 是什么？

`subscribe` 方法用来订阅 `store` 的 `mutation`。`handler` 会在每个 `mutation` 完成后调用，接收 `mutation` 和经过 `mutation` 后的状态作为参数，要停止订阅，调用此方法返回的函数即可停止订阅。通常用于插件。

## 67. Vuex 的 registerModule 和 unregisterModule

`registerModule` 用来动态注册一个新的 `module`，也是只在插件中使用，因为但凡你能写死 `module`，也犯不着动态注册，一旦必须动态注册，一定是在外部插件中使用。

`unregisterModule` 用于注销 `module`。

## 68. Vuex 的严格模式是什么？

在严格模式下，无论何时发生了状态变更且不是由 `mutation` 函数引起的，将会抛出错误。这能保证所有的状态变更都能被调试工具跟踪到。

在 `Vuex.Store` 构造器选项中开启,如下：

```js
const store = new Vuex.Store({
  strict: true,
})
```

## 69. Vue 依赖收集(Watcher、Dep)原理？

```js
new Vue({
  template: `<div>
            <span>text1:</span> {{text1}}
        <div>`,
  data: {
    text1: 'text1',
    text2: 'text2',
  },
})
```

可以从以上代码看出，`data` 中 `text2` 并没有被模板实际用到，为了提高代码执行效率，我们没有必要对其进行响应式处理，因此，依赖收集简单理解就是收集只在实际页面中用到的 `data` 数据。

Vue 内部使用 `Watcher` 和 `Dep` 来实现依赖收集。

被 `Observer` 的 `data` 在触发 `getter` 时，`Dep` 就会收集依赖，然后打上标记，这里就是标记为 `Dep.target`。

`Watcher` 是一个观察者对象。依赖收集以后的 `watcher` 对象被保存在 `Dep` 的 `subs` 中，数据变动的时候 `Dep` 会通知 `watcher` 实例，然后由 `watcher` 实例回调 `cb` 进行视图更新。

`Watcher` 可以接受多个订阅者的订阅，当有 `data` 变动时，就会通过 `Dep` 给 `Watcher` 发通知进行更新。

```js
class Observer {
  constructor(value) {
    this.value = value
    if (!value || typeof value !== 'object') {
      return
    } else {
      this.walk(value)
    }
  }
  walk(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key])
    })
  }
}
// 订阅者Dep，存放观察者对象
class Dep {
  constructor() {
    this.subs = []
  }
  /*添加一个观察者对象*/
  addSub(sub) {
    this.subs.push(sub)
  }
  /*依赖收集，当存在Dep.target的时候添加观察者对象*/
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  // 通知所有watcher对象更新视图
  notify() {
    this.subs.forEach((sub) => {
      sub.update()
    })
  }
}
class Watcher {
  constructor() {
    /* 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到 */
    Dep.target = this
  }
  update() {
    console.log('视图更新啦')
  }
  /*添加一个依赖关系到Deps集合中*/
  addDep(dep) {
    dep.addSub(this)
  }
}
function defineReactive(obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.depend() /*进行依赖收集*/
      return val
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return
      dep.notify()
    },
  })
}
class Vue {
  constructor(options) {
    this._data = options.data
    new Observer(this._data) // 所有data变成可观察的
    new Watcher() // 创建一个观察者实例
    console.log('render~', this._data.test)
  }
}
let o = new Vue({
  data: {
    test: 'hello vue.',
  },
})
o._data.test = 'hello mvvm!'

Dep.target = null
```

## 70. vue 中怎么定义全局函数？

1. `Vue.prototype`。

2. 写一个模块文件，挂载到 `main.js` 上面：`exports.install`+`Vue.prototype`

```js
export default {
  install(Vue)  {
    Vue.prototype.getToken = {
      ...
    }
  }
}
```

`main.js` 引入并使用：

```js
import fun from './fun' // 路径示公共JS位置决定
Vue.use(fun)
```

3. 使用 `Vue.mixin` 全局混入来注册全局方法：

```js
Vue.mixin({
  methods: {
    loadPage(routerName, param) {
      if (param) {
        this.$router.push({ name: routerName, query: param })
      } else {
        this.$router.push({ name: routerName })
      }
    },
  },
})
```

在 `main.js` 中注册全局方法，所有组件都可以调用该方法了，不过要注意的是，如果组件有与之同名的 `loadPage` 方法，则会覆盖 `mixin` 中的方法。

