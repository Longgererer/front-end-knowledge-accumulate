# 简单梳理下Vue3的新特性

> 在 Vue3 测试版刚刚发布的时候，我就学习了下 Composition API，但没想到正式版时隔一年多才出来，看了一下发现还是增加了不少新特性的，在这里我就将它们一一梳理一遍。

本文章只详细阐述 Vue3 中重要或常用的新特性，如果想了解全部的特性请转：[Vue3 响应性基础 API](https://vue3js.cn/docs/zh/api/basic-reactivity.html)

## Composition API

这是一个非常重要的改变，我认为 Composition API 最大的用处就是**将响应式数据和相关的业务逻辑结合到一起，便于维护**(这样做的优点在处理庞大组件的时候显得尤为重要)。

之所以叫做 Composition API(或组合式 API) 是因为所有的响应式数据和业务逻辑代码都可以放在 setup 方法中进行处理，我们通过代码看一下 Vue2 的 Options API 和 Composition API 的区别：

```javascript
/* Options API */
export default {
  props: {},
  data(){},
  computed: {},
  watch: {},
  methods: {},
  created(),
  components:{}
  // ...other options
}

/* Composition API */
export default {
  props: {},
  setup(),
  components:{}
}
```

这就是两种 API 在大致结构上的不同，虽然 Composition API 提倡使用 `setup` 来暴露组件的 `data`、`computed`、`watch`、生命周期钩子... 但并不意味着强制使用，在 Vue3 中同样可以选择 Options API 或者两种写法混用。

接下来我们看看在 setup 的使用。

### setup

#### 执行时机

`setup` 在 `beforeCreate` 之前执行，因此访问不到组件实例，换句话说 **setup 内无法使用 this 访问组件实例**。

#### 参数

`setup` 方法接受两个参数 `setup(props, context)` ，`props` 是父组件传给组件的数据，`context`(上下文) 中包含了一些常用属性：

##### attrs

`attrs` 表示由上级传向该组件，但并不包含在 `props` 内的属性：

```html
<!-- parent.vue -->
<Child msg="hello world" :name="'child'"></Child>
```

```javascript
/* child.vue */
export default {
  props: { name: String },
  setup(props, context) {
    console.log(props) // {name: 'child'}
    console.log(context.attrs) // {msg: 'hello world'}
  },
}
```

##### emit

用于在子组件内触发父组件的方法

```html
<!-- parent.vue -->
<Child @sayWhat="sayWhat"></Child>
```

```javascript
/* child.vue */
export default {
  setup(_, context) {
    context.emit('sayWhat')
  },
}
```

##### slots

用来访问被插槽分发的内容，相当于 `vm.$slots`

```html
<!-- parent.vue -->
<Child>
  <template v-slot:header>
    <div>header</div>
  </template>
  <template v-slot:content>
    <div>content</div>
  </template>
  <template v-slot:footer>
    <div>footer</div>
  </template>
</Child>
```

```javascript
/* child.vue */
import { h } from 'vue'
export default {
  setup(_, context) {
    const { header, content, footer } = context.slots
    return () => h('div', [h('header', header()), h('div', content()), h('footer', footer())])
  },
}
```

## 生命周期

Vue3 的生命周期除了可以使用传统的 Options API 形式外，也可以在 `setup` 中进行定义，只不过要在前面加上 `on`：

```javascript
export default {
  setup() {
    onBeforeMount(() => {
      console.log('实例创建完成，即将挂载')
    })
    onMounted(() => {
      console.log('实例挂载完成')
    })
    onBeforeUpdate(() => {
      console.log('组件dom即将更新')
    })
    onUpdated(() => {
      console.log('组件dom已经更新完毕')
    })
    // 对应vue2 beforeDestroy
    onBeforeUnmount(() => {
      console.log('实例即将解除挂载')
    })
    // 对应vue2 destroyed
    onUnmounted(() => {
      console.log('实例已经解除挂载')
    })
    onErrorCaptured(() => {
      console.log('捕获到一个子孙组件的错误')
    })
    onActivated(() => {
      console.log('被keep-alive缓存的组件激活')
    })
    onDeactivated(() => {
      console.log('被keep-alive缓存的组件停用')
    })
    // 两个新钩子，可以精确地追踪到一个组件发生重渲染的触发时机和完成时机及其原因
    onRenderTracked(() => {
      console.log('跟踪虚拟dom重新渲染时')
    })
    onRenderTriggered(() => {
      console.log('当虚拟dom被触发重新渲染时')
    })
  },
}
```

Vue3 没有提供单独的 `onBeforeCreate` 和 `onCreated` 方法，因为 `setup` 本身是在这两个生命周期之前执行的，Vue3 建议我们**直接在** `setup` **中编写这两个生命周期中的代码**。

## Reactive API

### ref

`ref` 方法用来为一个指定的值(可以是任意类型)创建一个响应式的数据对象，该对象包含一个 `value` 属性，值为响应式数据本身。

对于 `ref` 定义的响应式数据，无论获取其值还是做运算，都要用 `value` 属性。

```javascript
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    console.log(count.value) // 0
    count.value++
    console.log(count.value) // 1
    const obj = ref({ a: 2 })
    console.log(obj.value.a) // 2
    return {
      count,
      obj,
    }
  },
}
```

但是在 `template` 中访问 `ref` 响应式数据，是不需要追加 `.value` 的:

```html
<template>
  <div>
    <ul>
      <li>count: {{count}}</li>
      <li>obj.a: {{obj.a}}</li>
    </ul>
  </div>
</template>
```

### reactive

和 `ref` 方法一样，`reactive` 也负责将目标数据转换成响应式数据，但该数据只能是**引用类型**。

```html
<template>
  <div>{{obj.a}}</div>
</template>
<script>
  export default {
    setup() {
      const obj = reactive({ a: 2 })
      obj.a++
      console.log(obj.a) // 3
      return { obj }
    },
  }
</script>
```

可以看出 `reactive` 类型的响应式数据不需要在后面追加 `.value` 来调用或使用。

#### reactive 和 ref 的区别

看上去 `reactive` 和 `ref` 十分相似，那么这两个方法有什么不同呢？

实际上 `ref` 本质上与 `reactive` 并无区别，来看看 Vue3 的部分源码(来自于 `@vue/reactivity/dist/reactivity.cjs.js`)：

```javascript
function ref(value) {
  return createRef(value)
}
function createRef(rawValue, shallow = false) {
  /**
   * rawValue表示调用ref函数时传入的值
   * shallow表示是否浅监听，默认false表示进行深度监听，也就是递归地将对象/数组内所有属性都转换成响应式
   */
  if (isRef(rawValue)) {
    // 判断传入ref函数的数据是否已经是一个ref类型的响应式数据了
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
class RefImpl {
  constructor(_rawValue, _shallow = false) {
    // 用于保存未转换前的原生数据
    this._rawValue = _rawValue
    // 是否深度监听
    this._shallow = _shallow
    // 是否为ref类型
    this.__v_isRef = true
    // 如果为深度监听，则使用convert递归将所有嵌套属性转换为响应式数据
    this._value = _shallow ? _rawValue : convert(_rawValue)
  }
  get value() {
    track(toRaw(this), 'get' /* GET */, 'value')
    return this._value
  }
  set value(newVal) {
    if (shared.hasChanged(toRaw(newVal), this._rawValue)) {
      this._rawValue = newVal
      this._value = this._shallow ? newVal : convert(newVal)
      trigger(toRaw(this), 'set' /* SET */, 'value', newVal)
    }
  }
}
// 如果val满足：val !== null && typeof val === 'object'，则使用reactive方法转换数据
const convert = (val) => (shared.isObject(val) ? reactive(val) : val)
```

如果你不明白上面的代码做了什么，假设我现在执行这行代码：

```javascript
const count = ref(0)
```

那么实际上 `ref` 函数返回的是一个 `RefImpl` 实例，里面包含如下属性：

```javascript
{
  _rawValue: 0,
  _shallow: false,
  __v_isRef: true,
  _value: 0
}
```

通过 `RefImpl` 类的 `get value()` 方法可以看出，调用 `value` 属性返回的其实就是 `_value` 属性。

:::tip Notice
Vue3 建议在定义基本类型的响应式数据时使用 `ref` 是因为基本类型不存在引用效果，这样一来在其他地方改变该值便不会触发响应，因此 `ref` 将数据包裹在对象中以实现引用效果。
:::

Vue3 会判断 `template` 中的响应式数据是否为 `ref` 类型，如果为 `ref` 类型则会在尾部自动追加 `.value`，判断方式很简单：

```javascript
function isRef(r) {
  return Boolean(r && r.__v_isRef === true)
}
```

那么其实我们是可以用 `reactive` 来伪装成 `ref` 的：

```html
<template>
  <div>{{count}}</div>
</template>
<script>
  export default {
    setup() {
      const count = reactive({
        value: 0,
        __v_isRef: true,
      })
      return { count }
    },
  }
</script>
```

虽然这样做毫无意义，不过证明了 Vue3 确实是通过 `__v_isRef` 属性判断数据是否为 `ref` 定义的。

我们再看看 `reactive` 的实现：

```javascript
function reactive(target) {
  if (target && target['__v_isReadonly' /* IS_READONLY */]) {
    return target
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers)
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
  if (!shared.isObject(target)) {
    {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // 如果target已经被代理，直接返回target
  if (target['__v_raw' /* RAW */] && !(isReadonly && target['__v_isReactive' /* IS_REACTIVE */])) {
    return target
  }
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const targetType = getTargetType(target)
  if (targetType === 0 /* INVALID */) {
    return target
  }
  const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}
```

`reactive` 方法会调用 `createReactiveObject` 代理对象中的各个属性来实现响应式，在使用 `ref` 定义引用类型数据的时候同样会用到这个方法：

```javascript
export default {
  setup() {
    console.log(ref({ a: 123 }))
    console.log(reactive({ a: 123 }))
  },
}
```

![1613874843_1_.png](http://picstore.lliiooiill.cn/v2-3c3dc0eec8098ec4282443a7eb2e0062_720w.jpg)

可以看到 `ref` 对象的 `_value` 属性和 `reactive` 一样都被代理了。

综上所述，我们可以**简单将 `ref` 看作是 `reactive` 的二次包装**，只不过多了几个属性罢了。

明白了 `ref` 和 `reactive` 的大致实现和关系，我们再来看其他的响应式 API。

### isRef & isReactive

判断一个值是否是 ref 或 reactive 类型：

```javascript
const count = ref(0)
const obj = reactive({ a: 123 })
console.log(isRef(count)) // true
console.log(isRef(obj)) // false
console.log(isReactive(count)) // false
console.log(isReactive(obj)) // true
```

### customRef

自定义 ref，常用来定义需要异步获取的响应式数据，举个搜索框防抖的例子：

```javascript
function useDebouncedRef(value, delay = 1000) {
  let timeout
  return customRef((track, trigger) => {
    /**
     * customRef回调接受两个参数
     * track用于追踪依赖
     * trigger用于出发响应
     * 回调需返回一个包含get和set方法的对象
     */
    return {
      get() {
        track() // 追踪该数据
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger() // 数据被修改，更新ui界面
        }, delay)
      },
    }
  })
}
export default {
  setup() {
    const text = useDebouncedRef('')
    const searchResult = reactive({})
    watch(text, async (newText) => {
      if (!newText) return void 0
      const result = await new Promise((resolve) => {
        console.log(`搜索${newText}中...`)
        resolve(`${newText}的搜索结果在这里`)
      })
      searchResult.data = result
    })
    return {
      text,
      searchResult,
    }
  },
}
```

```html
<template>
  <input v-model="text" />
  <div>{{searchResult.data}}</div>
</template>
```

在这个例子中我们使用 `customRef` 和防抖函数，延迟改变 `text.value` 值，当 `watch` 监听到 `text` 的改变再进行搜索以实现防抖搜索。

### toRef & toRefs

`toRef` 可以将一个 `reactive` 形式的对象的属性转换成 `ref` 形式，并且 `ref` 对象会保持对源 `reactive` 对象的引用：

```javascript
const obj1 = reactive({ a: 1 })
const attrA = toRef(obj1, 'a')
console.log(obj1.a) // 1
console.log(attrA.value) // 1
console.log(obj1 === attrA._object) // true
attrA.value++
console.log(obj1.a) // 2
```

如果使用 `ref`，那么由于 `obj1.a` 本身是一个基本类型值，最后会生成一个与原对象 `obj1` 毫无关系的新的响应式数据。

我们来看一下 `toRef` 的源码：

```javascript
function toRef(object, key) {
  return isRef(object[key]) ? object[key] : new ObjectRefImpl(object, key)
}
class ObjectRefImpl {
  constructor(_object, _key) {
    this._object = _object
    this._key = _key
    this.__v_isRef = true
  }
  get value() {
    return this._object[this._key]
  }
  set value(newVal) {
    this._object[this._key] = newVal
  }
}
```

可以看到其涉及的代码非常简单，`ObjectRefImpl` 类就是为了**保持数据与源对象之间的引用关系**(设置新 `value` 值同时会改变原对象对应属性的值)。

可能你已经注意到 `ObjectRefImpl` 类**并没有**像 `ref` 方法用到的 `RefImpl` 类一样在 `get` 和 `set` 时使用 `track` 追踪改变和用 `trigger` 触发 `ui` 更新。

因此可以得出一个结论，**toRef 方法所生成的数据仅仅是保存了对源对象属性的引用，但该数据的改变可能不会直接触发 ui 更新！**，举个例子：

```html
<template>
  <ul>
    <li>obj1: {{obj1}}</li>
    <li>attrA: {{attrA}}</li>
    <li>obj2: {{obj2}}</li>
    <li>attrB: {{attrB}}</li>
  </ul>
  <button @click="func1">addA</button>
  <button @click="func2">addB</button>
</template>
<script>
  import { reactive, toRef } from 'vue'
  export default {
    setup() {
      const obj1 = { a: 1 }
      const attrA = toRef(obj1, 'a')
      const obj2 = reactive({ b: 1 })
      const attrB = toRef(obj2, 'b')
      function func1() {
        attrA.value++
      }
      function func2() {
        attrB.value++
      }
      return { obj1, obj2, attrA, attrB, func1, func2 }
    },
  }
</script>
```

![GIF.gif](http://picstore.lliiooiill.cn/v2-92a39d5de931426d3d130ce26ae8eb89_b.webp)

可以看到，点击 addA 按钮不会触发界面渲染，而点击 addB 会更新界面。虽然 `attrB.value` 的改变确实会触发 ui 更新，但这是因为 `attrB.value` 的改变触发了 `obj2.b` 的改变，而 `obj2` 本身就是响应式数据，所以 **`attrB.value` 的改变是间接触发了 ui 更新，而不是直接原因**。

再来看看 `toRefs`，`toRefs` 可以将整个对象转换成响应式对象，而 `toRef` 只能转换对象的某个属性。但是 `toRefs` 生成的响应式对象和 `ref` 生成的响应式对象在用法上是有区别的：

```javascript
const obj = { a: 1 }
const refObj = ref(obj)
const toRefsObj = toRefs(obj)
console.log(refObj.value.a) // 1
console.log(toRefsObj.a.value) // 1
```

`toRefs` 是将对象中的每个属性都转换成 `ref` 响应式对象，而 `reactive` 是代理整个对象。

### shallowRef & shallowReactive

`ref` 和 `reactive` 在默认情况下会递归地将对象内所有的属性无论嵌套与否都转化为响应式，而 `shallowRef` 和 `shallowReactive` 则只将第一层属性转化为响应式。

```javascript
const dynamicObj2 = shallowReactive({ a: 1, b: { c: 2 } })
console.log(isReactive(dynamicObj2)) // true
console.log(isReactive(dynamicObj2.b)) // false
dynamicObj2.a++ // 触发ui更新
dynamicObj2.b.c++ // 不触发ui更新
const dynamicObj3 = shallowRef({ a: 1, b: { c: 2 } })
console.log(isRef(dynamicObj3)) // true
// ref函数在处理对象的时候会交给reactive处理，因此使用isReactive判断
console.log(isReactive(dynamicObj3.value)) // false
```

我们可以发现，`shallowRef` 和 `shallowReactive` 类型的响应式数据，在改变其深层次属性时候是不会触发 ui 更新的。

:::tip Notice
`shallowRef` 的第一层是 `value` 属性所在的那一层，而 `a` 是在第二层，因此只有当 `value` 改变的时候，才会触发 ui 更新
:::

### triggerRef

如果 `shallowRef` 只有在 `value` 改变的时候，才会触发 ui 更新，有没有办法在其他情况下手动触发更新呢？有的：

```javascript
const dynamicObj3 = shallowRef({ a: 1, b: { c: 2 } })
function func() {
  dynamicObj3.value.b.c++
  triggerRef(dynamicObj3) // 手动触发ui更新
}
```

### readonly & isReadonly

`readonly` 可将整个对象(包含其内部属性)变成只读的，并且是深层次的。

`isReadonly` 通过对象中的 `__v_isReadonly` 属性判断对象是否只读。

```javascript
const obj3 = readonly({ a: 0 })
obj3.a++ // warning: Set operation on key "a" failed: target is readonly
obj3.b.c++ // Set operation on key "c" failed: target is readonly
console.log(obj3.a) // 0
console.log(isReadonly(obj3)) // true
console.log(isReadonly(obj3.b)) // true
```

### toRaw

`toRaw` 可以返回 `reactive` 或 `readonly` 所代理的对象。

```javascript
const obj3 = { a: 123 }
const readonlyObj = readonly(obj3)
const reactiveObj = reactive(obj3)
const refObj = ref(obj3)
console.log(toRaw(readonlyObj) === obj3) // true
console.log(toRaw(reactiveObj) === obj3) // true
console.log(refObj._rawValue === obj3) // true
```

```javascript
function toRaw(observed) {
  return (observed && toRaw(observed['__v_raw' /* RAW */])) || observed
}
```

事实上，无论是 `reactive` 还是 `readonly`，都会将源对象保存一份在属性 `__v_raw` 中，而 `ref` 会将源对象或值保存在 `_rawValue` 属性中。

## computed

Vue3 将 `computed` 也包装成了一个方法，我们看看 `computed` 的源码：

```javascript
function computed(getterOrOptions) {
  let getter
  let setter
  // 判断getterOrOptions是否为函数
  if (shared.isFunction(getterOrOptions)) {
    // 如果是函数，就作为getter，这种情况下只能获取值，更改值则会弹出警告
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    // 如果不是函数，将getterOrOptions中的get和set方法赋给getter和setter
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter, shared.isFunction(getterOrOptions) || !getterOrOptions.set)
}
```

我们可以发现，`computed` 接收两种不同的参数:

```javascript
computed(() => {}) // only getter
computed({ get: () => {}, set: () => {} }) // getter and setter
```

和 Vue2 一样，`computed` 既可以单纯的用 `getter` 计算并返回数据，也可以设置 `setter` 使其变得可写。

```javascript
const count = ref(1)
const countCpy = computed(() => count.value * 2)
// 由于computed返回的是ref对象，因此使用value获取值
console.log(countCpy.value) // 2
const countCpy2 = computed({
  get: () => count.value,
  set: (newVal) => {
    count.value = newVal
  },
})
countCpy2.value = 10
console.log(countCpy2.value) // 10
```

### watch & watchEffect

Vue3 的 `watch` 和 Vue2 的 `vm.$watch` 效果是相同的。

`watch` 可以对一个 `getter` 发起监听：

```javascript
const count = ref(2)
watch(
  () => Math.abs(count.value),
  (newVal, oldVal) => {
    console.log(`count的绝对值发生了变化！count=${newVal}`)
  }
)
count.value = -2 // 没有触发watch
count.value = 1 // count的绝对值发生了变化！count=1
```

也可以侦听一个 `ref`：

```javascript
const count = ref(2)
watch(count, (newVal, oldVal) => {
  console.log(`count值发生了变化！count=${newVal}`)
})
count.value = -1 // count的绝对值发生了变化！count=-1
```

`watch` 不仅可以监听单一数据，也可以监听多个数据：

```javascript
const preNum = ref('')
const aftNum = ref('')
watch([preNum, aftNum], ([newPre, newAft], [oldPre, oldAft]) => {
  console.log('数据改变了')
})
preNum.value = '123' // 数据改变了
aftNum.value = '123' // 数据改变了
```

`watchEffect` 会在其任何一个依赖项发生变化的时候重新运行，其返回一个函数用于取消监听。

```javascript
const count = ref(0)
const obj = reactive({ a: 0 })
const stop = watchEffect(() => {
  console.log(`count或obj发生了变化,count=${count.value},obj.a=${obj.a}`)
})
// count或obj发生了变化,count=0,obj.a=0
count.value++ // count或obj发生了变化,count=1,obj.a=0
obj.a++ // count或obj发生了变化,count=1,obj.a=1
stop()
count.value++ // no log
```

可以看出：与 `watch` 不同，**`watchEffect` 会在创建的时候立即运行**，依赖项改变时再次运行；而 `watch` 只在监听对象改变时才运行。

`watch` 和 `watchEffect` 都用到了 `doWatch` 方法处理，来看看源码(删除了部份次要代码)：

```javascript
function watchEffect(effect, options) {
  return doWatch(effect, null, options)
}
const INITIAL_WATCHER_VALUE = {}
function watch(source, cb, options) {
  // 省略部分代码...
  return doWatch(source, cb, options)
}
function doWatch(
  source,
  cb,
  { immediate, deep, flush, onTrack, onTrigger } = shared.EMPTY_OBJ, // 默认为Object.freeze({})
  instance = currentInstance // 默认为null
) {
  if (!cb) {
    if (immediate !== undefined) {
      warn(
        `watch() "immediate" option is only respected when using the ` + `watch(source, callback, options?) signature.`
      )
    }
    if (deep !== undefined) {
      warn(`watch() "deep" option is only respected when using the ` + `watch(source, callback, options?) signature.`)
    }
  }
  // 省略部分代码...
  let getter
  let forceTrigger = false
  if (reactivity.isRef(source)) {
    // 如果监听的是响应式ref数据
    getter = () => source.value
    forceTrigger = !!source._shallow
  } else if (reactivity.isReactive(source)) {
    // 如果监听的是响应式reactive对象
    getter = () => source
    deep = true
  } else if (shared.isArray(source)) {
    // 如果监听由响应式数据组成的数组
    getter = () =>
      source.map((s) => {
        // 遍历数组再对各个值进行类型判断
        if (reactivity.isRef(s)) {
          return s.value
        } else if (reactivity.isReactive(s)) {
          // 如果是监听一个reactive类型数据，使用traverse递归监听属性
          return traverse(s)
        } else if (shared.isFunction(s)) {
          return callWithErrorHandling(s, instance, 2)
        } else {
          warnInvalidSource(s)
        }
      })
  } else if (shared.isFunction(source)) {
    // 如果source是一个getter函数
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2)
    } else {
      // 如果没有传递cb函数，说明使用的是watchEffect方法
      getter = () => {
        if (instance && instance.isUnmounted) {
          return
        }
        if (cleanup) {
          cleanup()
        }
        return callWithErrorHandling(source, instance, 3, [onInvalidate])
      }
    }
  } else {
    getter = shared.NOOP
    warnInvalidSource(source)
  }
  if (cb && deep) {
    // 如果传递了cb函数，并且为深层次监听，则使用traverse递归监听属性
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
  let cleanup
  const onInvalidate = (fn) => {
    cleanup = runner.options.onStop = () => {
      callWithErrorHandling(fn, instance, 4)
    }
  }
  // 省略部分代码...
  let oldValue = shared.isArray(source) ? [] : INITIAL_WATCHER_VALUE
  // 观察者回调函数job
  const job = () => {
    if (!runner.active) {
      return
    }
    if (cb) {
      const newValue = runner()
      if (deep || forceTrigger || shared.hasChanged(newValue, oldValue)) {
        if (cleanup) {
          cleanup()
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // 在监听数据首次发生更改时将undefined置为旧值
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onInvalidate,
        ])
        oldValue = newValue
      }
    } else {
      // watchEffect
      runner()
    }
  }
  // 是否允许自动触发
  job.allowRecurse = !!cb
  let scheduler
  if (flush === 'sync') {
    scheduler = job
  } else if (flush === 'post') {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
  } else {
    // default: 'pre'
    scheduler = () => {
      if (!instance || instance.isMounted) {
        queuePreFlushCb(job)
      } else {
        job()
      }
    }
  }
  const runner = reactivity.effect(getter, {
    lazy: true,
    onTrack,
    onTrigger,
    scheduler,
  })
  recordInstanceBoundEffect(runner, instance)
  // initial run
  if (cb) {
    if (immediate) {
      // 如果immediate为true，则可以一开始就执行监听回调函数
      job()
    } else {
      oldValue = runner()
    }
  } else if (flush === 'post') {
    queuePostRenderEffect(runner, instance && instance.suspense)
  } else {
    runner()
  }
  return () => {
    // 返回取消监听的函数
    reactivity.stop(runner)
    if (instance) {
      shared.remove(instance.effects, runner)
    }
  }
}
```

通过上面的代码，我们可以发现 `watch` 和 `watchEffect` 函数还接收一个 `options` 参数，这个参数默认为 `Object.freeze({})` 也就是一个被冻结的，无法添加任何属性的空对象。如果 `options` 不为空，那么它可以包含五个有效属性：`immediate`、`deep`、`flush`、`onTrack` 和 `onTrigger`，我们来看看这五个属性的作用。

`immediate` 表示立即执行，我们之前说过，`watch` 是惰性监听，仅在侦听源发生更改时调用，但 `watch` 也可以主动监听，即在 `options` 参数中添加 `immediate` 属性为 `true`:

```javascript
const count = ref(2)
watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log(`count发生了变化！count=${newVal}`)
  },
  { immediate: true }
)
// log: count发生了变化！count=2
```

这样，`watch` 在一开始就会立即执行回调。

再说说第二个属性 `deep`，我们通过上面的源码可得知，`deep` 在监听 `reactive` 响应式数据的时候会置为 `true`，即递归地监听对象及其所有嵌套属性的变化。如果想要深度侦听 `ref` 类型的响应式数据，则需要手动将 `deep` 置为 `true`

```javascript
const obj = ref({ a: 1, b: { c: 2 } })
watch(
  obj,
  (newVal, oldVal) => {
    console.log(`obj发生了变化`)
  },
  {
    deep: true,
  }
)
obj.value.b.c++ // obj发生了变化
```

第三个属性 `flush` 有三个有效值：`pre`、`sync` 和 `post`。

`pre` 为默认值，表示在组件更新前执行侦听回调；`post` 表示在更新后调用；而 `sync` 则强制同步执行回调，因为一些数据往往会在短时间内改变多次，这样的强制同步是效率低下的，不推荐使用。

```html
<template>
  <div>
    {{count}}
    <button @click="count++">add</button>
  </div>
</template>
<script>
  import { ref, watch, onBeforeUpdate } from 'vue'
  export default {
    setup() {
      const count = ref(0)
      watch(
        count,
        () => {
          console.log('count发生了变化')
        },
        {
          flush: 'post',
        }
      )
      onBeforeUpdate(() => {
        console.log('组件更新前')
      })
    },
  }
</script>
```

在点击 `add` 按钮时，先输出 `组件更新前` 再输出 `count发生了变化`，如果 `flush` 为 `pre`，则输出顺序相反。

再来看看 `onTrack` 和 `onTrigger`，这两个一看就是回调函数。`onTrack` 将在响应式 `property` 或 `ref` 作为依赖项被追踪的时候调用；`onTrigger` 将在依赖项变更导致 `watchEffect` 回调触发时被调用。

```javascript
const count = ref(0)
watchEffect(
  () => {
    console.log(count.value)
  },
  {
    onTrack(e) {
      console.log('onTrack')
    },
    onTrigger(e) {
      console.log('onTrigger')
    },
  }
)
count.value++
```

:::tip Notice
`onTrack` 和 `onTrigger` 只能在开发模式下进行调试时使用，不能再生产模式下使用。
:::

## Fragments

在 Vue2 中，组件只允许一个根元素的存在：

```html
<template>
  <div>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </div>
</template>
```

在 Vue3 中，允许多个根元素的存在：

```html
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

这不仅简化了嵌套，而且暴露出去的多个元素可以受父组件样式的影响，一定程度上也减少了 css 代码。

早在以前，React 就允许 Fragments 组件，该组件用来返回多个元素，而不用在其上面添加一个额外的父节点:

```javascript
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
    </React.Fragment>
  );
}
```

如果想在 Vue2 实现 Fragments，需要安装 Vue-fragment 包，如今 Vue3 整合了 Vue-fragment，我们可以直接使用这个功能了。

## Teleport

`Teleport` 用来解决逻辑属于该组件，但从技术角度(如 css 样式)上看却应该属于 app 外部的其他位置。

一个简单的栗子让你理解：

```html
<!-- child.vue -->
<template>
  <teleport to="#messageBox">
    <p>Here are some messages</p>
  </teleport>
</template>
```

```html
<!-- index.html -->
<body>
  <div id="app"></div>
  <div id="messageBox"></div>
</body>
```

`teleport` 接受一个 `to` 属性，值为一个 css 选择器，可以是 id，可以是标签名(如 body)等等。

`teleport` 内的元素将会插入到 to 所指向的目标父元素中进行显示，而内部的逻辑是和当前组件相关联的，除去逻辑外，上面的代码相当于这样：

```html
<!-- index.html -->
<body>
  <div id="app"></div>
  <div id="messageBox">
    <p>Here are some messages</p>
  </div>
</body>
```

因此 `teleport` 中的元素样式，是会受到目标父元素样式的影响的，这在创建全屏组件的时候非常好用，全屏组件需要写 css 做定位，很容易受到父元素定位的影响，因此将其插入到 app 外部显示是非常好的解决方法。

## Suspense

`Suspense` 提供两个 `template`，当要加载的组件不满足状态时，显示 `default template`，满足条件时才会开始渲染 `fallback template`。

```html
<!-- AsyncComponent.vue -->
<template>
  <div>{{msg}}</div>
</template>
<script>
  export default {
    setup() {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve({ msg: '加载成功' })
        }, 1000)
      })
    },
  }
</script>
```

```html
<!-- parent.vue -->
<template>
  <div>
    <Suspense>
      <template #default>
        <AsyncComponent></AsyncComponent>
      </template>
      <template #fallback>
        <h1>Loading...</h1>
      </template>
    </Suspense>
  </div>
</template>
<script>
  import AsyncComponent from './AsyncComponent.vue'
  export default {
    components: { AsyncComponent },
    setup() {},
  }
</script>
```

![GIF.gif](http://picstore.lliiooiill.cn/v2-c0d0a4352695394c00ee1752b1b8d881_b.webp)

这样在一开始会显示 1 秒的 Loading...，然后才会显示 `AsyncComponent`，因此在做加载动画的时候可以用 `Suspense` 来处理。

## 其他新特性

更多比较细小的新特性官网说的很详细，请看：[其他新特性](https://vue3js.cn/docs/zh/guide/migration/array-refs.html)。
