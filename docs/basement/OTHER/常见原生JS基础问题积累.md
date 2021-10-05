# 常见原生 JS 基础问题积累

## JS 基本数据类型和引用数据类型有哪些？

基本数据类型

- `boolean`
- `null`
- `undefined`
- `number`
- `string`
- `symbol`
- `bigint`

引用数据类型

- `Object`
- `Array`
- `Function`
- `Date`
- `RegExp`
- `Math`

## typeof null 为什么是 object？

这是一个历史遗留问题，早期 JavaScript 为了性能而使用低位存储变量，`000` 开头代表对象，但是 `null` 本身就表示为空也就是全 0，于是 `typeof` 会把 `null` 也判断为 `object`。

## 为什么基本类型可以直接调用原型链上的方法？

例子如下：

```javascript
const a = 123
console.log(a.toString()) // '123'
const b = '123456'
console.log(b.substring(1, 4)) // '234'
const c = true
console.log(c.valueOf()) // true
```

因为 JavaScript 提供了三种特殊的引用类型：`String`，`Number` 和 `Boolean`，也叫做**基本包装类型**。

就拿变量 `a` 来说，调用 `toString` 时发生了以下行为：

```javascript
var a = new Object(123)
a.toString()
a = null
```

1. 为 a 创建一个对应的包装类型 Number。
2. 调用 Number 实例原型链上的方法。
3. 执行完方法销毁实例。

:::tip
使用 `new Object` 而不是 `new Number`，因为由于 `Symbol` 和 `BigInt` 两种新的基本类型的出现，对它们调用 `new` 会报错，目前 ES6 规范不建议使用 `new` 来创建基本包装类。
:::

## 为什么 0.1 + 0.2 !== 0.3？

这是编程语言共同的问题，因为计算机处理器将浮点数从十进制转换成二进制的时候丢失了精度，计算完再转成十进制输出的当然是错误的结果。

二进制只能精准表达 2 除尽的数字 1/2, 1/4, 1/8，例如 0.1(1/10)和 0.2(1/5)，用二进制表示法转换成二进制实际上是一个无限循环的二进制小数，需要根据精度舍入。

```javascript
function compareTwo(n1, n2) {
  return Math.abs(n1 - n2) < Number.EPSILON
}
compareTwo(0.1 + 0.2, 0.3)
```

目前，使用 `Number.EPSILON` 作为误差判断能够解决这个问题。

### substr, substring 和 slice 的区别在哪？

`slice` 接收的是起始位置和结束位置(不包括结束位置)，并且支持负数，当接收的参数是负数时，`slice` 会将它**字符串的长度与对应的负数相加**，结果作为参数。

```javascript
const test = 'hello world'
console.log(test.slice(7, 4)) // ''
console.log(test.slice(4, 7)) // 'o w'
console.log(test.slice(4, -1)) // 'o worl'
console.log(test.slice(4, 10)) // 'o worl'
console.log(test.slice(4, 4)) // ''
```

`substring` 接收的是起始位置和结束位置(不包括结束位置)。传递负数会被当作 0 处理。但起始位置和结束位置是**通过大小判断而不是传递顺序判断**。

```javascript
const test = 'hello world'
console.log(test.substring(7, 4)) // 'o w'
console.log(test.substring(4, 7)) // 'o w'
console.log(test.substring(4, -1)) // 'hell'
console.log(test.substring(4, 4)) // ''
```

`substr` 接收起始位置和要返回的字符串长度。长度不支持负数，会替换成 0。起始位置为负数，则会将会将它**字符串的长度与对应的负数相加**，结果作为参数。

```javascript
const test = 'hello world'
console.log(test.substr(7, 4)) // 'orld'
console.log(test.substr(-2, 2)) // 'ld'
console.log(test.substr(4, -1)) // ''
console.log(test.substr(4)) // 'o world'
```

## 什么是 BigInt？

JavaScript 只能表示 -(2^53)~2^53 之间的数，超出此范围的数会失去精度。

使用 `BigInt` 可以让我们安全的计算大整数。在数字后面加上 `n` 即可。

```javascript
console.log(9007199254740995n) // 9007199254740995n
console.log(9007199254740995) // 9007199254740996

BigInt('9007199254740995') // 9007199254740995n
```

`BigInt` 不支持一元加号运算符：

```javascript
console.log(+10n) // TypeError
```

`BigInt` 不支持和其他类型值混合运算：

```javascript
console.log(10n + 10n) // 20n
console.log(10 + 10n) // TypeError
```

webApi 不能接收 BigInt 类型数据：

```javascript
Math.max(2n, 4n, 6n) // TypeError
```

## Symbol.hasInstance 是什么？

`Symbol.hasInstance` 用于判断某对象是否为某构造器的实例，可以用它自定义 `instanceof` 操作符在某个类上的行为。

```javascript
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance)
  }
}
console.log([] instanceof MyArray) // true
```

## []==![] 为什么为 true？

在 `==` 中，左右两边都需要转换为**数字**然后进行比较。

`[]` 转换为数字为 `0`，`![]` 首先是转换为布尔值，由于 `[]` 作为一个引用类型转换为布尔值为 `true`。

因此 `![]` 为 `false`，进而在转换成数字，变为 `0`。

`0 == 0`， 结果为 `true`。

## `==` 类型转换的规则？

- 两边的类型是否相同，相同的话就比较值的大小，例如 `1==2`，返回 `false`。
- 判断的类型是否是 `null` 和 `undefined`，是的话就返回 `true`。
- 判断的类型是否是 `String` 和 `Number`，是的话，把 `String` 类型转换成 `Number`，再进行比较。
- 判断其中一方是否是 `Boolean`，是的话就把 `Boolean` 转换成 `Number`，再进行比较。
- 如果其中一方为 `Object`，且另一方为 `String`、`Number` 或者 `Symbol`，会将 `Object` 转换成字符串，再进行比较。

## Object.is 是什么？

`Object.is` 用于判断两个值是否为同一个值。

这在判断 `NaN` 和 `+0`，`-0` 时很有用。

```javascript
Object.is(NaN, NaN) // true
Object.is(-0, +0) // false
```

下面是一个 Polyfill：

```javascript
function customIs(x, y) {
  if (x === y) {
    // +0 !== -0
    return x !== 0 || 1 / x === 1 / y
  } else {
    // NaN === NaN
    return x !== x && y !== y
  }
}
```

## 对象转基本类型是根据什么流程运行的？

对象转基本类型，会调用内置的 `[ToPrimitive]` 函数，逻辑如下：

1. 如果有定义 `Symbol.toPrimitive` 方法，优先调用这儿方法并返回。

```javascript
const obj = {
  [Symbol.toPrimitive]() {
    return 123
  },
}
console.log(`${obj}`) // '123'
```

2. 如果有运算操作符，在 1 不满足时，优先调用 `valueOf`，如果返回值无法运算，就调用 `toString`，还是不行的话就报错。

```javascript
const obj1 = {
  valueOf() {
    return 123
  },
}
console.log(obj1 + 2) // 125

const obj2 = {
  valueOf() {
    return {}
  },
}
console.log(obj2 + 2) // [object Object]2

const obj3 = {
  valueOf() {
    return {}
  },
  toString() {
    return {}
  },
}
console.log(obj3 + 2) // TypeError
```

3. 如果不做运算，在 1 不满足时，优先使用 `toString`，不行再使用 `valueOf`，还不行就报错：

```javascript
const obj1 = {
  toString() {
    return 12
  },
}
console.log(`${obj1}`) // 12

const obj2 = {
  valueOf() {
    return 123
  },
  toString() {
    return {}
  },
}
console.log(`${obj2}`) // 123

const obj3 = {
  valueOf() {
    return {}
  },
  toString() {
    return {}
  },
}
console.log(`${obj3}`) // TypeError
```

## 什么是闭包？闭包是如何产生的？闭包有哪些表现形式？

闭包指的是有权访问另一个函数作用域当中的变量的函数。

闭包的产生很简单，看下面代码：

```javascript
function a() {
  let b = 1
  return function() {
    return ++b
  }
}
const c = a()
console.log(c()) // 2
console.log(c()) // 3
```

`a` 的作用域指向 `window` 和它本身，返回的函数的作用域指向 `window`，`a` 和它本身。因此即使返回的函数 `a` 之外的地方被调用，它也仍然可以访问到 `a` 作用域内的变量。

闭包不光可以通过返回函数的形式实现，还可以通过传入函数参数的形式：

```javascript
let a = 1
function foo() {
  let a = 2
  function baz() {
    console.log(a)
  }
  bar(baz)
}
function bar(fn) {
  fn()
}
foo() // 2
```

实际上在定时器、事件监听、Ajax 请求、跨窗口通信，Web Workers 或者任何异步中，只要使用了回调函数，实际上就是在使用闭包。

## 什么是原型链？

在 JavaScript，所有函数都天生具有 `prototype` 属性，这个属性指向函数的原型对象。

经过 `new` 调用的函数称为构造函数，它返回一个全新的实例对象，这个对象有一个 `__proto__` 属性，指向构造函数的原型对象 `prototype`。该原型对象自己也有一个原型对象 `__proto__`，层层向上直到一个对象的原型对象为 `null`，这便是原型链的结束点。

## hasOwnProperty, in 和 for...in 的区别

`hasOwnProperty` 检查对象自身中是否含有该属性(无论是否可枚举)而不检查原型链。

```javascript
const obj = {}
Object.defineProperty(obj, 'a', {
  value: 1,
  enumerable: false,
})
console.log(obj.hasOwnProperty('a'))
console.log(obj.hasOwnProperty('__proto__'))
```

`in` 操作符只要通过对象能够访问到就会返回 `true`。

```javascript
console.log('__proto__' in Object) // true
```

`for...in` 只会遍历对象本身可枚举的属性而不检查原型链。

## JS 如何实现继承？

`call`/`apply`/`bind` 继承：

```javascript
function Parent() {
  this.name = 'parent'
}
Parent.prototype.printName = function() {
  console.log(this.name)
}
function Child() {
  Parent.call(this) // Parent.apply(this) | Parent.bind(this)()
  this.type = 'child'
}
const boy = new Child()
console.log(boy) // {name: 'parent', type: 'child'}
boy.printName() // boy.printName is not a function
```

我们可以看出这种继承方式无法继承父构造函数原型中定义的属性，因为我们并没有把 `Child` 的原型对象指向 `Parent`。

因此我们需要手动进行指向：

```javascript
function Parent() {
  this.name = 'parent'
  this.list = [1, 2, 3]
}
Parent.prototype.printName = function() {
  console.log(this.name)
}
function Child() {
  Parent.call(this)
  this.__proto__ = Parent.prototype
  this.type = 'child'
}
const boy = new Child()
boy.printName() // 'parent'
```

但是这样有个问题：

```javascript
console.log(boy instanceof Child) // false
```

我们发现 `boy` 并不是 `Child` 的实例，因为我们没有把 `boy` 的原型对象指向 `Child` 而是指向了 `Parent`。

即使 `new` 操作符会自动帮我们指向 `Child`，但被我们覆盖掉了。因此，我们需要将 `Child` 原型对象指向 `Parent`。

```javascript
function Parent() {
  this.name = 'parent'
  this.list = [1, 2, 3]
}
Parent.prototype.printName = function() {
  console.log(this.name)
}
function Child() {
  Parent.call(this)
  this.type = 'child'
}
Child.prototype.constructor = Child
Child.prototype.__proto__ = Parent.prototype
const boy1 = new Child()
```

## client，scroll 和 offset 的区别

![](https://upload-images.jianshu.io/upload_images/2511429-16b18d86d7ea0e23.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

![](https://upload-images.jianshu.io/upload_images/2511429-4d42f61ffa6c8cd7.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

![](https://upload-images.jianshu.io/upload_images/2511429-2e3165599cdea492.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

![](https://upload-images.jianshu.io/upload_images/2511429-384eec8d8d3cc4f2.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

![](https://upload-images.jianshu.io/upload_images/2511429-c46ac0a02c0a6108.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

![](https://upload-images.jianshu.io/upload_images/2511429-1781b8614212a647.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

## JS 垃圾回收机制

[JS 垃圾回收机制](../JS/JS垃圾回收机制)

## 监听对象属性的改变

使用 `Object.defineProperty` 可以定义属性的 `set` 函数来实现对改变的监听。

但这样的话每次定义新属性都需要再用 `Object.defineProperty` 定义一下，很不方便。

ES6 中可以使用 `Proxy` 实现：

```javascript
const obj = new Proxy(
  {},
  {
    set: function() {
      //...
    },
  }
)
```

## 实现一次加载一张图片，加载完之后再加载下一张

取到所有 `src` 后，首先加载第一张，监听事件，`onerror` 或者 `onload` 事件被触发后，加载下一张。

```javascript
const obj = new Image()
obj.src = 'XXX.jpg'
obj.onload = () => {
  document.getElementById('imageList').innerHTML += `<img src=${src}/>`
}
```

## 实现简单深拷贝

```javascript
function getType(x) {
  return Object.prototype.toString.call(x).slice(8, -1)
}
function deepClone(x) {
  let type = getType(x)
  let res
  switch (type) {
    case 'Object': {
      res = {}
      for (let key in x) {
        res[key] = deepClone(x[key])
      }
      break
    }
    case 'Array': {
      res = []
      x.forEach((item, index) => {
        res[index] = deepClone(item)
      })
      break
    }
    default: {
      res = x
    }
  }
  return res
}
```

## 字符串全排列

使用拼接法。在全排列中，字符串中的每个字符开头的次数是一样的。比如 `abc` 中 `a`，`b`，`c` 开头的次数各为 2。

我们先以 `a` 开头，计算 `bc` 的全排列为 `bc`，`cb`，再将 `a` 拼接上去变成 `abc` 和 `acb`；再以 `b` 开头计算 `ac` 的全排列并拼接，以此类推。。。

```javascript
function perm(str) {
  if (str.length <= 1) {
    return [str]
  } else {
    const res = []
    for (let i = 0; i < str.length; i++) {
      const curch = str[i]
      const newStr = str.substring(0, i) + str.substring(i + 1)
      const permStr = perm(newStr)
      for (let j = 0; j < permStr.length; j++) {
        res.push(curch + permStr[j])
      }
    }
    return res
  }
}
```

## 数组去重方法

1. 利用 `Set` 集合去重

```javascript
Array.from(new Set(arr))
```

2. `for` + `splice`

```javascript
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (Object.is(arr[i], arr[j])) {
      //第一个等同于第二个，splice方法删除第二个
      arr.splice(j, 1)
      j--
    }
  }
}
```

3. 利用 `indexOf` 去重

```javascript
const array = []
for (let i = 0; i < arr.length; i++) {
  if (array.indexOf(arr[i]) === -1) {
    array.push(arr[i])
  }
}
```

4. 用 `sort` 去重

```javascript
arr = arr.sort()
const array = [arr[0]]
for (let i = 1; i < arr.length; i++) {
  if (arr[i] !== arr[i - 1]) {
    array.push(arr[i])
  }
}
```

5. 用 `Map` 去重

```javascript
const map = new Map()
for (let i = 0; i < arr.length; i++) {
  if (!map.get(arr[i])) {
    map.set(arr[i], true)
  }
}
const res = []
map.forEach((_, key) => {
  res.push(key)
})
console.log(res)
```

6. 用 `includes` 去重

```javascript
const array = []
for (let i = 0; i < arr.length; i++) {
  if (!array.includes(arr[i])) {
    array.push(arr[i])
  }
}
```

7. 用 `filter` 去重

```javascript
arr.filter((item, index, arr) => {
  arr.indexOf(item, 0) === index
})
```

8. 用 `reduce` + `includes`

```javascript
arr.reduce((prev, cur) => (prev.includes(cur) ? prev : [...prev, cur]), [])
```

## 重绘与回流是什么

