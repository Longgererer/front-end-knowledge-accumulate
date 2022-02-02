# Vue 响应式原理

![](http://picstore.lliiooiill.cn/3814431403-5b874b92512d9.png)

Vue 数据响应式变化主要涉及 Observer、Watcher、Dep 这三个主要的类。因此要弄清 Vue 响应式变化需要明白这个三个类之间是如何运作联系的；以及它们的原理，负责的逻辑操作。

当把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的 `property`，并使用 `Object.defineProperty` 把这些 `property` 全部转为 `getter/setter`。在 vue initData 的时候，将 `_data` 上面的数据代理到 `vm` 上，通过 `observer` 类将所有的 `data` 变成可观察的，及对 `data` 定义的每一个属性进行 `getter\setter` 操作，这就是 Vue 实现响应式的基础。

## Observer

`Observer` 类是将每个目标对象（即 `data`）的键值转换成 `getter/setter` 形式，**用于进行依赖收集以及调度更新**。这个类做了如下几件事情：

1. `observer` 实例绑定在 `data` 的 `ob` 属性上面，防止重复绑定。
2. 若 `data` 为数组，先实现对应的变异方法（Vue 重写了数组的 7 种原生方法）再将数组的每个成员进行观察，使之成响应式数据。
3. 否则执行 `walk()` 方法，遍历 `data` 所有的数据，进行 `getter/setter` 绑定。这里的核心方法就是 `defineReactive(obj, keys[i], obj[keys[i]])`。

```js
// 监听对象属性Observer类
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
```

### 深度监听

`data` 往往不是只有一层的对象，而是多层嵌套，这个时候 `defineReactive` 方法会利用递归的方式将内部的对象也进行监听：

```js
function defineReactive(obj, key, val) {
  new Observer(val) // 深度监听
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      return val
    },
    set: function reactiveSetter(newVal) {
      // 注意：value一直在闭包中，此处设置完之后，再get时也是会得到最新的值
      if (newVal === val) return
      new Observer(val) // 深度监听
      updateView()
    },
  })
}
```

### 数组监听

`object.defineProperty` 虽然可以监听数组(以下标作为键名的方式)，但数组往往会包含大量的元素，**出于性能考虑**，Vue 没有使用 `object.defineProperty` 监听数组，那么在 Vue 中又是如何去监听数组的变化，其实 Vue 将被侦听的数组的变更方法进行了包裹。类似下面这样：

```js
// 防止全局污染，重新定义数组原型
const oldArrayProperty = Array.prototype
// 创建新对象，原型指向oldArrayProperty
const arrProto = Object.create(oldArrayProperty)

const methods = ['push', 'pop', 'shift', 'unshift', 'splice']
methods.forEach((methodName) => {
  arrProto[methodName] = function () {
    oldArrayProperty[methodName].call(this, ...arguments) // 实际执行数组的方法
    updateView() // 更新视图
  }
})

// 在Observer函数中对数组进行处理
if (Array.isArray(value)) {
  value.__proto__ = arrProto
}
```

## 依赖收集

依赖收集简单理解就是收集只在实际页面中用到的 `data` 数据，那么 Vue 是如何进行依赖收集的，这也就是下面要讲的 `Watcher`、`Dep` 类了。

被 Observer 的 `data` 在触发 `getter` 时，`Dep` 就会收集依赖，然后打上标记。

![](http://picstore.lliiooiill.cn/1124618109-58a55e0c03354.png)

可以看出来，`Observer`、`Dep` 和 `Watcher` 三者分别为**发布订阅模式**的发布者、调度中心和订阅者。

在 Vue 中模版编译过程中的指令或者数据绑定都会实例化一个 `Watcher` 实例，实例化过程中会触发 `get()` 将自身指向 `Dep.target`。

`data` 在 `Observer` 时执行 `getter` 会触发 `dep.depend()` 进行依赖收集，当 `data` 中被 `Observer` 的某个对象值变化后，触发 `subs` 中观察它的 `watcher` 执行 `update()` 方法，最后实际上是调用 `watcher` 的回调函数 `cb`，进而更新视图。

具体源码如下：

### Dep

```js
// Dep是订阅者Watcher对应的数据依赖
var Dep = function Dep() {
  //每个Dep都有唯一的ID
  this.id = uid++
  //subs用于存放依赖
  this.subs = []
}

//向subs数组添加依赖
Dep.prototype.addSub = function addSub(sub) {
  this.subs.push(sub)
}
//移除依赖
Dep.prototype.removeSub = function removeSub(sub) {
  remove(this.subs, sub)
}
//设置某个Watcher的依赖
//这里添加了Dep.target是否存在的判断，目的是判断是不是Watcher的构造函数调用
//也就是说判断他是Watcher的this.get调用的，而不是普通调用
Dep.prototype.depend = function depend() {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}

Dep.prototype.notify = function notify() {
  var subs = this.subs.slice()
  //通知所有绑定 Watcher。调用watcher的update()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```

### Watcher

Watcher 有三种类型，一个是计算属性 `computed` 创建的 `computedWatcher`，一个是侦听器 `watch` 创建的 `userWatcher`，还有一个是用于渲染更新 dom 的 `renderWatcher`，一个组件只有一个 `renderWatcher`，有多个 `computedWatcher` 和 `userWatcher`。

::: tip Notice
一个组件只有一个 `renderWatcher`，这是为了减少 watcher 实例所占用的内存开销。
:::

下面代码只涉及 `renderWatcher`：

```js
var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm
  if (isRenderWatcher) {
    vm._watcher = this
  }
  // 当前Watcher添加到vue实例上
  vm._watchers.push(this)
  // 参数配置，options默认false
  if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.computed = !!options.computed
    this.sync = !!options.sync
    this.before = options.before
  } else {
    this.deep = this.user = this.computed = this.sync = false
  }
  this.cb = cb
  this.id = ++uid$1 // uid for batching
  this.active = true
  this.dirty = this.computed //用于计算属性
  this.deps = []
  this.newDeps = []
  //内容不可重复的数组对象
  this.depIds = new _Set()
  this.newDepIds = new _Set()
  this.expression = expOrFn.toString()
  //将watcher对象的getter设为updateComponent方法
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  } else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
      this.getter = function () {}
    }
  }
  //如果是计算属性，就创建Dep数据依赖，否则通过get获取value
  if (this.computed) {
    this.value = undefined
    this.dep = new Dep()
  } else {
    this.value = this.get()
  }
}

Watcher.prototype.get = function get() {
  pushTarget(this) //将Dep的target添加到targetStack，同时Dep的target赋值为当前watcher对象
  var value
  var vm = this.vm
  try {
    // 调用updateComponent方法
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (this.user) {
      handleError(e, vm, 'getter for watcher "' + this.expression + '"')
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget() //update执行完成后，又将Dep.target从targetStack弹出。
    this.cleanupDeps()
  }
  return value
}

//这是全局唯一的，因为任何时候都可能只有一个watcher正在评估。
Dep.target = null
var targetStack = []

function pushTarget(_target) {
  if (Dep.target) {
    targetStack.push(Dep.target)
  }
  Dep.target = _target
}

function popTarget() {
  Dep.target = targetStack.pop()
}

//当依赖项改变时调用。前面有提到。
Watcher.prototype.update = function update() {
  var this$1 = this

  /* istanbul ignore else */
  //是否计算属性
  if (this.computed) {
    if (this.dep.subs.length === 0) {
      this.dirty = true
    } else {
      this.getAndInvoke(function () {
        this$1.dep.notify()
      })
    }
    //是否缓存
  } else if (this.sync) {
    //调用run方法执行回调函数
    this.run()
  } else {
    queueWatcher(this)
  }
}

Watcher.prototype.run = function run() {
  if (this.active) {
    //这里的cb就是指watcher的回调函数
    this.getAndInvoke(this.cb)
  }
}

Watcher.prototype.getAndInvoke = function getAndInvoke(cb) {
  var value = this.get()
  if (value !== this.value || isObject(value) || this.deep) {
    //设置新的值
    var oldValue = this.value
    this.value = value
    this.dirty = false
    if (this.user) {
      try {
        cb.call(this.vm, value, oldValue)
      } catch (e) {
        handleError(e, this.vm, 'callback for watcher "' + this.expression + '"')
      }
    } else {
      //执行回调函数
      cb.call(this.vm, value, oldValue)
    }
  }
}
```

## 参考文章

- [当面试官问你 Vue 响应式原理，你可以这么回答他](https://juejin.cn/post/6844903597986037768)
- [Vue 源码解读之 Dep,Observer 和 Watcher](https://segmentfault.com/a/1190000016208088)
- [通俗易懂的 Vue 响应式原理以及依赖收集](https://juejin.cn/post/6845166890575216648)
