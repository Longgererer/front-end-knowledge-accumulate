# apply，call，bind 的实现

我们知道 `apply`、`call`、`bind`是用来改变函数内部 `this` 指向的，在我们讨论如何使用 JS 代码实现它们之前，先来了解一下这三个方法。

## apply

用法：`func.apply(thisArg, [argsArray])`

**`thisArg`** 是 `func` 函数执行时内部所指向的 `this` 的值，在非严格模式下默认为 `null`、`undefined` 或全局对象 `window`。

**`argsArray`** 是一个数组或类数组对象，作为传入 `func` 函数的参数列表。

### 用法参考

```javascript
const obj = {
  arr: [1, 2, 3, 4, 5, 6],
  result: 0,
}
add.apply(obj, obj.arr)
function add(...args) {
  for (let i of args) {
    this.result += i
  }
}
console.log(obj.result) // 21
```

### 代码实现

首先我们要在 `Function.prototype` 上创建一个 `customApply` 属性，接受上下文 `thisArg` 和参数列表 `argsArray`：

```javascript
// thisArg 默认指向 window，argsArray 为空数组
Function.prototype.customApply = function(thisArg = window, argsArray = []) {}
```

对于 `customApply`，我们需要做的事情就是，将被执行函数 `fn` 的 `this` 指向目标 `thisArg`，也就是说要以 `thisArg.fn(...argsArray)` 的形式调用目标函数，然后再将函数执行所得结果返回。

```javascript
Function.prototype.customApply = function(thisArg = window, argsArray = []) {
  thisArg = thisArg || window
  // this 指向的是调用 customApply 的函数
  thisArg.fn = this
  const result = thisArg.fn(...argsArray)
  // 记得删除临时属性 fn
  delete thisArg.fn
  return result
}
```

这就实现了一个简单的 `customApply`，但注意，这个方法有漏洞！我们在目标 `thisArg` 上添加了一个临时元素 `fn`，如果 `thisArg` 本身就拥有用户自定义的 `fn` 怎么办？因此我们要创建一个独一无二的元素避免属性覆盖的情况，我们知道 `Symbol` 可以生成唯一的值，同样可以用作对象的键名：

```javascript
const fn = Symbol('fn')
thisArg[fn] = this
```

这样我们就可以避免因为属性覆盖的问题了：

```javascript
Function.prototype.customApply = function(thisArg, argsArray = []) {
  thisArg = thisArg || window
  // this 指向的是调用 customApply 的函数
  const fn = Symbol('fn')
  thisArg[fn] = this
  const result = thisArg[fn](...argsArray)
  // 记得删除临时属性 fn
  delete thisArg[fn]
  return result
}

// test1，我们为数组的原型链上加上一个方法max计算数组最大元素
Array.prototype.max = function() {
  return Math.max.customApply(null, this)
}
console.log([2, 3, 6, 3, 1, 5, 8, 1].max()) // 8

// test2，使用 slice 将伪数组转化成真数组
const fakeArr = {
  0: 123,
  length: 5,
}
console.log(Array.prototype.slice.customApply(fakeArr)) // [123, empty × 4]
```

:::tip Notice
`Array.prototype.slice` 不止能对数组进行切片，还可以把类数组转化成新数组，这需要将该方法绑定到类数组上执行，就像我们上面的 `test2` 使用 `customApply` 一样。
:::

## call

用法：`function.call(thisArg, arg1, arg2, ...)`

和 `apply` 一样，第一个参数为函数内 `this` 指向目标，后面接着的是参数列表。

### 用法参考

`call` 实现继承父构造函数：

```javascript
function Animal(species, bark) {
  Object.assign(this, { species, bark })
}
function Dog(species, bark, favor) {
  Animal.call(this, species, bark)
  this.favor = favor
}
console.log(new Dog('哈巴狗', '汪汪汪', '吃骨头'))
// {bark: "汪汪汪",favor: "吃骨头",species: "哈巴狗"}
```

### 代码实现

`call` 与 `apply` 除了参数形式之外没有其他区别，因此实现方法是类似的：

```javascript
Function.prototype.customCall = function(thisArg, ...argsArray) {
  thisArg = thisArg || window
  const fn = Symbol('fn')
  thisArg[fn] = this
  const result = thisArg[fn](...argsArray)
  delete thisArg[fn]
  return result
}

// test，就拿用法参考里面的例子
function Animal(species, bark) {
  Object.assign(this, { species, bark })
}
function Dog(species, bark, favor) {
  Animal.customCall(this, species, bark)
  this.favor = favor
}
console.log(new Dog('哈巴狗', '汪汪汪', '吃骨头'))
// {bark: "汪汪汪",favor: "吃骨头",species: "哈巴狗"}
```

## bind

用法：`function.bind(thisArg[, arg1[, arg2[, ...]]])`

**`thisArg`** 是需要绑定的目标，如果使用 `new` 运算符构造绑定函数，则忽略该参数。如果没有传递该参数则使用原来的执行作用域。

**`arg1, arg2, ...`** 是函数调用时传入的参数。

调用 `bind` 函数并不会执行被绑定的函数，只会返回该函数的拷贝，该拷贝函数拥有指定的 `this` 值。

### 用法参考

```javascript
const obj = {
  a: 2,
  get2Power(power) {
    return this.a ** power
  },
}
// get2PowerFunc 作为 window 属性而不是作为 obj 属性被调用
const get2PowerFunc = obj.get2Power
get2PowerFunc.bind(obj)(10) // 1024
```

### 代码实现

首先我们的 `customBind` 函数接收一个 `thisArg` 作为 `this` 指向的目标，同时返回一个接受若干参数的函数。

```javascript
Function.prototype.customBind = function(thisArg) {
  return (...args) => {
    // 这里的 this 指向的就是调用 customBind 的函数
    return this.apply(thisArg, args)
  }
}
```

这还不够，后续的参数列表 `args` 可以分开传，比如调用 `bind` 的时候传几个参数，执行绑定后函数的时候再传几个参数：

`func.bind(this, arg1)(arg2, arg3)`

其实也很简单，只要把两次传的参数一起传给 `apply` 就好了：

```javascript
Function.prototype.customBind = function(thisArg, ...bindArgs) {
  return (...args) => {
    return this.apply(thisArg, [...bindArgs, ...args])
  }
}
```

我们初步完成了 `customBind` 的功能，但我们前面说过：**如果使用 `new` 运算符构造绑定函数，则忽略该参数**。

因此，我们要判断被绑定的函数是否是被 `new` 调用的：

```javascript
Function.prototype.customBind = function(thisArg, ...bindArgs) {
  const self = this
  /**
   * 因为下面我们需要将this.prototype绑定到bindFunc.prototype上
   * 但如果之后修改了bindFunc.prototype的话也会造成绑定函数的prototype的改变
   * 因此需要一个临时函数tempFunc进行中转，代替bindFunc.prototype
   */
  const tempFunc = function() {}
  // 由于需要支持new操作符，因此返回的函数bindFunc就不能是箭头函数了
  const bindFunc = function(...args) {
    // 如果this指向的是tempFunc，说明使用了new进行实例化，忽略thisArg
    return self.apply(this instanceof tempFunc ? this : thisArg, [...bindArgs, ...args])
  }
  tempFunc.prototype = self.prototype
  bindFunc.prototype = new tempFunc()
  return bindFunc
}
```

## 参考文章

- [Implement your own — call(), apply() and bind() method in JavaScript](https://blog.usejournal.com/implement-your-own-call-apply-and-bind-method-in-javascript-42cc85dba1b)
- [apply bind call 详解 和 实际应用](https://juejin.cn/post/6844904018607603726)
- [Array.prototype.slice()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
- [JavaScript 深入之 bind 的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)