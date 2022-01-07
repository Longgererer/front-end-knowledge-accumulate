# 常见原生 JS 基础问题积累

## 1. JS 基本数据类型和引用数据类型有哪些？

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

## 2. typeof null 为什么是 object？

这是一个历史遗留问题，早期 JavaScript 为了性能而使用低位存储变量，`000` 开头代表对象，但是 `null` 本身就表示为空也就是全 0，于是 `typeof` 会把 `null` 也判断为 `object`。

## 3. 为什么基本类型可以直接调用原型链上的方法？

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
var a = Object(123)
a.toString()
a = null
```

1. 为 a 创建一个对应的包装类型 Number。
2. 调用 Number 实例原型链上的方法。
3. 执行完方法销毁实例。

:::tip
使用 `Object` 而不是 `new Number`，因为由于 `Symbol` 和 `BigInt` 两种新的基本类型的出现，对它们调用 `new` 会报错。因为围绕原始数据类型创建一个显式包装器对象从 ES6 开始不再被支持。然而，现有的原始包装器对象，如 `new Boolean`、`new String` 以及 `new Number`，因为遗留原因仍可被创建。
:::

## 4. 为什么 0.1 + 0.2 !== 0.3？

这是编程语言共同的问题，因为计算机处理器将浮点数从十进制转换成二进制的时候丢失了精度，计算完再转成十进制输出的当然是错误的结果。

二进制只能精准表达 2 除尽的数字 1/2, 1/4, 1/8，例如 0.1(1/10)和 0.2(1/5)，用二进制表示法转换成二进制实际上是一个无限循环的二进制小数，需要根据精度舍入。

```javascript
function compareTwo(n1, n2) {
  return Math.abs(n1 - n2) < Number.EPSILON
}
compareTwo(0.1 + 0.2, 0.3)
```

目前，使用 `Number.EPSILON` 作为误差判断能够解决这个问题。

## 5. 什么是 BigInt？

JavaScript 只能表示 $-(2^{53})$ 到 $2^{53}$ 之间的数，超出此范围的数会失去精度。

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

## 6. Symbol.hasInstance 是什么？

`Symbol.hasInstance` 用于判断某对象是否为某构造器的实例，可以用它自定义 `instanceof` 操作符在某个类上的行为。

```javascript
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance)
  }
}
console.log([] instanceof MyArray) // true
```

## 7. `[]==![]` 为什么为 true？

在 `==` 中，左右两边都需要转换为**数字**然后进行比较。

`[]` 用 `valueOf` 转换为数字为 `0`，`![]` 首先是转换为布尔值，由于 `[]` 作为一个引用类型转换为布尔值为 `true`。

因此 `![]` 为 `false`，进而在转换成数字，变为 `0`。

`0 == 0`， 结果为 `true`。

## 8. `==` 类型转换的规则？

- 两边的类型是否相同，相同的话就比较值的大小，例如 `1==2`，返回 `false`。
- 判断的类型是否是 `null` 和 `undefined`，是的话就返回 `true`。
- 判断的类型是否是 `String` 和 `Number`，是的话，把 `String` 类型转换成 `Number`，再进行比较。
- 判断其中一方是否是 `Boolean`，是的话就把 `Boolean` 转换成 `Number`，再进行比较。
- 如果其中一方为 `Object`，且另一方为 `String`、`Number` 或者 `Symbol`，会将 `Object` 转换成字符串，再进行比较。

除此之外：

1. `NaN` 和其他任何类型比较永远返回 `false`（包括和他自己）。
2. `Boolean` 和其他任何类型比较，`Boolean` 首先被转换为 `Number` 类型。

```js
true == 1 // true
true == '2' // false, 先把 true 变成 1，而不是把 '2' 变成 true
true == ['1'] // true, 先把 true 变成 1， ['1']拆箱成 '1', 再参考规则3
true == ['2'] // false, 同上
undefined == false // false ，首先 false 变成 0，然后参考规则4
null == false // false，同上
```

3. `String` 和 `Number` 比较，先将 `String` 转换为 `Number` 类型。
4. `null == undefined` 比较结果是 `true`，除此之外，`null`、`undefined` 和其他任何结果的比较值都为 `false`。
5. 原始类型和引用类型做比较时，引用类型会依照 `ToPrimitive` 规则转换为原始类型。

:::tip Notice
`ToPrimitive` 规则，是引用类型向原始类型转变的规则，它遵循先 `valueOf` 后 `toString` 的模式期望得到一个原始类型。如果还是没法得到一个原始类型，就会抛出 `TypeError`。
:::

## 9. Object.is 是什么？

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

## 10. 对象转基本类型是根据什么流程运行的？

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

## 11. 什么是闭包？闭包是如何产生的？闭包有哪些表现形式？

闭包指的是有权访问另一个函数作用域当中的变量的函数。

闭包的产生很简单，看下面代码：

```javascript
function a() {
  let b = 1
  return function () {
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

闭包用途：

1. 能够访问函数定义时所在的词法作用域(阻止其被回收)
2. 私有化变量
3. 模拟块级作用域
4. 创建模块

闭包缺点：会导致函数的变量一直保存在内存中，过多的闭包可能会导致内存泄漏

## 12. 什么是原型链？

在 JavaScript，所有函数都天生具有 `prototype` 属性，这个属性指向函数的原型对象。

经过 `new` 调用的函数称为构造函数，它返回一个全新的实例对象，这个对象有一个 `__proto__` 属性，指向构造函数的原型对象 `prototype`。该原型对象自己也有一个原型对象 `__proto__`，层层向上直到一个对象的原型对象为 `null`，这便是原型链的结束点。

## 13. hasOwnProperty, in 和 for...in 的区别

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

## 14. client，scroll 和 offset 的区别

![](http://picstore.lliiooiill.cn/2511429-16b18d86d7ea0e23.webp)

- `offsetTop` 表示元素距离上方或上层控件的距离。
- `offsetLeft` 表示元素距离左方或上层控件的距离。
- `offsetWidth` 表示元素自身的宽度。
- `offsetHeight` 表示元素自身的高度。
- `clientWidth` 表示元素中可视的宽度(不含 `border`)。
- `clientHeight` 表示元素中可视的高度(不含 `border`)。
- `scrollWidth` 表示元素实际内容的宽度(左 `padding` 与右 `padding` 之间的距离)。
- `scrollHeight` 表示元素的滚动高度。
- `scrollLeft` 表示位于元素左边界和窗口中目前可见内容和的最左端之间的距离。
- `scrollTop` 表示位于元素最顶端和窗口中可见内容的最顶端之间的距离。
- `clientX` 表示鼠标指针位置相对于当前窗口的横坐标，不包括浏览器自身控件和滚动条。
- `clientY` 表示鼠标指针位置相对于当前窗口的纵坐标，不包括浏览器自身控件和滚动条。
- `offsetX` 表示鼠标指针位置相对于触发事件的元素的横坐标。
- `offsetY` 表示鼠标指针位置相对于触发事件的元素的纵坐标。
- `screenX` 表示鼠标指针位置相对于用户整个显示屏幕的横坐标。
- `screenY` 表示鼠标指针位置相对于用户整个显示屏幕的纵坐标。

## 15. JS 垃圾回收机制

[JS 垃圾回收机制](../JS/JS垃圾回收机制)

## 16. 监听对象属性的改变

使用 `Object.defineProperty` 可以定义属性的 `set` 函数来实现对改变的监听。

但这样的话每次定义新属性都需要再用 `Object.defineProperty` 定义一下，很不方便。

ES6 中可以使用 `Proxy` 实现：

```javascript
const obj = new Proxy(
  {},
  {
    set: function () {
      //...
    },
  }
)
```

## 17. 实现一次加载一张图片，加载完之后再加载下一张

取到所有 `src` 后，首先加载第一张，监听事件，`onerror` 或者 `onload` 事件被触发后，加载下一张。

加载函数中返回一个 `Promise`，运用 `Async Await` 来实现顺序加载。

```javascript
const imgs = [
  'http://picstore.lliiooiill.cn/2511429-16b18d86d7ea0e23.webp',
  'http://picstore.lliiooiill.cn/2020031315023375.png',
  'http://picstore.lliiooiill.cn/img_recreate02-1-1.jpg',
]

function loadImg(url) {
  const img = new Image()
  img.src = url
  console.log(`开始加载${url}`)
  return new Promise((resolve) => {
    img.onload = () => {
      console.log(`${url}加载完成`)
      resolve(true)
    }
  })
}

async function orderLoadingImgs(imgs) {
  for (let url of imgs) {
    await loadImg(url)
  }
}

orderLoadingImgs(imgs)
```

## 18. 实现简单深拷贝

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

## 19. 字符串全排列

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

## 20. 数组去重方法

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
arr.filter((item, index, arr) => arr.indexOf(item, 0) === index)
```

8. 用 `reduce` + `includes`

```javascript
arr.reduce((prev, cur) => (prev.includes(cur) ? prev : [...prev, cur]), [])
```

## 21. 判断一个数据是 NaN 的方法

设 `x` 的值就是 `NaN`：

1. `Object.is(x, NaN)`。
2. `x !== x` 只有 `NaN` 不等于自身。
3. `Number.isNaN(x)`。
4. `typeof(n) === 'number' && window.isNaN(n)`。

## 22. 什么是事件委托

事件委托是利用事件冒泡，注册一个事件在父元素上就可以管理子元素某一类型的所有事件。

## 23. cookie，localStorage，sessionStorage 的区别

`cookie` 可设置**失效时间**，没有设置的话，默认是关闭浏览器后失效；数据**大小为 4kb 左右并且有个数限制**；每次请求都会**携带在 HTTP 头中**，如果使用 `cookie` 保存过多数据会带来性能问题。`cookie` **不可跨域**，只有绑定的域名才能访问。非顶级域名，如二级域名或者三级域名，设置的 `cookie` 的 `domain` 只能为顶级域名或者二级域名或者三级域名本身，不能设置其他二级域名。

修改、删除 `cookie` 时，除 `value`、`maxAge` 之外的所有属性如 `name`、`path`、`domain` 等，都要与原 `cookie` 完全一样，否则，浏览器将视为两个不同的 `cookie`。

`localStorage` 除非被手动清除，否则将会永久保存；有专门的监听变化事件：`setItemEvent`，可以用 `addEventListener` 监听。页面必须来自同一个域名（子域名无效）和端口。

`sessionStorage` 仅在当前网页会话下有效，关闭页面或浏览器后就会被清除，不同页面间无法共享 `sessionStorage` 的信息；如果一个页面包含多个 `iframe` 且他们属于同源页面，那么他们之间是可以共享 `sessionStorage` 的。

`localStorage` 和 `sessionStorage` 可以保存 5MB 的信息(注意：这里说的是**每个域名 5M**)；仅在客户端（即浏览器）中保存，不参与和服务器的通信；会将任何数据转换成字符串存储。因此存储时最好用 JSON 序列化一下。

## 24. 前端如何实现并发请求数量限制？

假设最大并发量为 4。

我们将请求列表分割成粒度为 4 的子列表，等待第一个子列表中的任务都执行完，再传入下个子列表就好了：

```javascript
// 接收请求url列表，最大并发数，回调函数
function handleFetchQueue(urls = [], max = 1, callback = () => {}) {
  const urlLen = urls.length
  const reqQueue = [] // 存储临时请求队列
  const results = [] // 存储请求结果
  let i = 0
  const handleReq = (url) => {
    const req = fetch(url)
      .then((res) => {
        console.log('当前并发：' + reqQueue)
        const len = results.push(res)
        // 如果结果集长度小于请求列表长度
        if (len < urlLen && i + 1 < urlLen) {
          // 请求完成，取出请求队列头部请求
          reqQueue.shift()
          // 进行新的请求
          handleReq(urls[++i])
        } else if (len === urlLen) {
          // 全部请求完毕
          callback(results)
        }
      })
      .catch((e) => {
        results.push(e)
      })
    if (reqQueue.push(req) < max) {
      handleReq(urls[++i])
    }
  }
  handleReq(urls[i])
}
const fetch = function (idx) {
  return new Promise((resolve) => {
    console.log(`start request ${idx}`)
    const timeout = parseInt(Math.random() * 1e4)
    setTimeout(() => {
      console.log(`end request ${idx}`)
      resolve(idx)
    }, timeout)
  })
}
const urls = Array.from({ length: 10 }, (v, k) => k)
handleFetchQueue(urls, 4, () => {
  console.log('run callback')
})
```

## 25. Set，Map，WeakMap，WeakSet 区别

### Set

`Set` 对象存储的值总是唯一的，所以需要判断两个值是否恒等。有几个需要注意的地方：

- `+0` 和 `-0` 视为恒等，所以重复。
- `NaN` 与 `NaN` 是不恒等的，但是在 `Set` 中认为 `NaN` 与 `NaN` 相等，所以重复。

`Set` 对象的属性和方法：

- `size`：返回集合所包含元素的数量。
- `add(value)`：添加值，返回 `Set` 本身，也就是说可以链式调用。
- `delete(value)`：删除值，删除成功返回 `true`，否则返回 `false`。
- `has(value)`：返回一个布尔值，表示该值是否为 `Set` 的成员。
- `clear()`：消除所有成员，没有返回值。
- `keys()`：返回键名的遍历器。
- `values()`：返回键值的遍历器。
- `entries()`：返回键值对的遍历器。
- `forEach()`：使用回调函数遍历每个成员。

由于 `Set` 结构没有键名，只有键值，所以键名和键值是同一个值，`keys()` 和 `values()` 的返回值是一样的。

### WeakSet

`WeakSet` 结构与 `Set` 类似，但成员都是数组和类似数组的对象，若调用 `add()` 方法时传入了非数组和类似数组的对象的参数，就会抛出错误。

- `WeakSet` 成员都是弱引用，可以被垃圾回收机制回收，可以用来保存 DOM 节点，不容易造成内存泄漏。
- `WeakSet` 只有 `add`，`delete` 和 `has` 三个方法，也没有 `size` 属性。
- `WeakSet` 不可迭代。

### Map

`Map` 中存储的是 `key-value` 形式的键值对, 其中的 `key` 和 `value` 可以是**任何类型**的。

`Map` 对象的属性和方法：

- `size`: 返回集合所包含元素的数量
- `set(key, val)`: 向 `Map` 中添加新元素，返回 `Map` 对象本身
- `get(key)`: 通过键值查找特定的数值并返回
- `has(key)`: 判断 `Map` 对象中是否有 `Key` 所对应的值，有返回 `true`，否则返回 `false`
- `delete(key)`: 通过键值从 `Map` 中移除对应的数据
- `clear()`: 将这个 `Map` 中的所有元素删除
- `keys()`：返回键名的遍历器
- `values()`：返回键值的遍历器
- `entries()`：返回键值对的遍历器
- `forEach()`：使用回调函数遍历每个成员

```javascript
const m = new Map().set(123, 12345)
[...m] // [[123, 12345]]
```

### WeakMap

`WeakMap` 结构与 `Map` 结构类似，也是用于生成键值对的集合。

- 只接受对象作为键名（`null` 除外），不接受其他类型的值作为键名。
- 键名是弱引用，键值可以是任意的，键名所指向的对象可以被垃圾回收，此时键名是无效的。
- 不能遍历，方法有 `get`、`set`、`has`、`delete`。

### 应用

在为 DOM 元素添加事件监听的时候就可以用到 `WeakMap` 和 `WeakSet`。

## 26. ES5/ES6 的继承除了写法之外还有其他区别么？

ES5 的继承是先创建子类的实例对象，再将父类的原型链与子类的相关联。而 ES6 则是利用 `super` 先创建父对象，再调用子类的构造函数修改 `this` 指向。

## 27. DOMContentLoaded 与 onload 的区别

`DOMContentLoaded` 事件是在 HTML 文档完全加载完的时候就触发。

`onload` 事件是在页面上的所有资源(CSS、JavaScript、Image、Iframe 等)完全加载完毕后触发。

## 28. 创建 AJAX 的过程？

1. 创建 XMLHttpRequest 对象，也就是创建一个异步调用对象。
2. 创建一个新的 HTTP 请求，并指定改 HTTP 请求的方法、URL 以及验证信息。
3. 设置响应 HTTP 状态变化的函数。
4. 发送 HTTP 请求。
5. 获取异步调用返回的数据。
6. 使用 JavaScript 和 DOM 实现局部刷新。

## 29. JS 怎么延迟加载？

1. defer
2. async
3. 动态创建 script 标签
4. 使用 setTimeout 延迟执行
5. 把 js 外部引入的文件放到页面底部，来让 js 最后引入，从而加快页面加载速度

## 30. 严格模式区别？

1. 严格模式下无法再意外创建全局变量。
2. 严格模式会使引起静默失败(silently fail,注:不报错也没有任何效果)的赋值操作抛出异常。比如对一个不可写的变量赋值会报错。
3. 在严格模式下, 试图删除不可删除的属性时会抛出异常。
4. 严格模式要求函数的参数名唯一。
5. 严格模式禁止八进制数字语法。
6. ECMAScript 6 中的严格模式禁止设置基础类型值的属性。
7. 严格模式禁用 `with`。
8. 严格模式下 `eval` 仅仅为被运行的代码创建变量, 所以 `eval` 不会使得名称映射到外部变量或者其他局部变量。
9. 不能使用 `arguments.callee`。
10. 禁止 `this` 指向全局对象。
11. `arguments` 不会自动反映函数参数的变化。

## 31. XML 和 JSON 的区别？

JSON 比 XML **数据的体积小，传输速度更快**。

JSON 与 JavaScript 的交互更加方便，**更容易读取解析处理**。但 JSON 对数据的**描述性比 XML 差**。

## 32. reduce 实现 map 方法

```javascript
Array.prototype._map = function (callback, thisArg) {
  const target = thisArg || this
  return target.reduce((list, item, index) => {
    list.push(callback.call(target, item, index, target))
    return list
  }, [])
}
```

## 33. 用 js 刷新当前页面？

- `location.reload(bol)`
- `location.replace()`
- `history.go(0)`
- `location.assign(location)`
- `location=location`

## 34. 什么是 Web worker?

在 HTML 页面中，如果在执行脚本时，页面的状态是不可响应的，直到脚本执行完成后，页面才变成可响应。web worker 是运行在后台的 js，独立于其他脚本，不会影响页面的性能。并且通过 `postMessage` 将结果回传到主线程。这样在进行复杂操作的时候，就不会阻塞主线程了。

## 35. click 在 ios 上有 300ms 延迟，原因及如何解决？

当用户一次点击屏幕之后，浏览器并不能立刻判断用户是要进行双击缩放，还是想要进行单击操作。因此，iOS Safari 就等待 300 毫秒，以判断用户是否再次点击了屏幕。有几种方法：

1. 禁用缩放

```html
<meta name="viewport" content="width=device-width, user-scalable=no" />
```

2. 检测到 `touchend` 事件后，立刻触发模拟 `click` 事件，并且把浏览器 `300` 毫秒之后真正触发的事件给阻断掉。对于移动端点击来说，会先触发 `touchstart` 和 `touchend`，然后才会触发 `click`，所以我们才需要监听 `touchend`。

3. 通过 meta 标签将网页的 `viewport` 设置为 `ideal viewport`

## 36. addEventListener 是什么？

`addEventListener(event, function, useCapture)` 其中，`event` 指定事件名；`function` 指定要事件触发时执行的函数；`useCapture` 指定事件 是否在捕获或冒泡阶段执行。

## 37. DOM 怎么添加移除移动复制创建？

1. 创建新节点：

```javascript
createDocumentFragment() //创建一个DOM片段
createElement() //创建一个具体的元素
createTextNode() //创建一个文本节点
```

2. 添加、移除、替换、插入

```javascript
appendChild()
removeChild()
replaceChild()
insertBefore() //并没有insertAfter()
```

3. 复制

```javascript
node.cloneNode()
```

## 38. mouseover、mouseenter、mouseleave、mouseout 的区别？

- `mouseover`：当鼠标移入元素或其子元素都会触发事件，所以有一个重复触发，冒泡的过程。对应的移除事件是 `mouseout`。
- `mouseenter`：当鼠标移出元素本身（不包含元素的子元素）会触发事件，也就是不会冒泡，对应的移除事件是 `mouseleave`。

## 39. 实现一个 once 函数，实现只能执行一次的效果？

```javascript
function func(fn) {
  let isFirst = true
  return function () {
    if (isFirst) {
      isFirst = false
      fn()
    }
  }
}
```

## 40. HTML5 Drag API

- `dragstart`：事件主体是被拖放元素，在开始拖放被拖放元素时触发。
- `darg`：事件主体是被拖放元素，在正在拖放被拖放元素时触发。
- `dragenter`：事件主体是目标元素，在被拖放元素进入某元素时触发。
- `dragover`：事件主体是目标元素，在被拖放在某元素内移动时触发。
- `dragleave`：事件主体是目标元素，在被拖放元素移出目标元素是触发。
- `drop`：事件主体是目标元素，在目标元素完全接受被拖放元素时触发。
- `dragend`：事件主体是被拖放元素，在整个拖放操作结束时触发。

## 41. 内部属性 `[[class]]` 是什么？

所有 `typeof` 返回值为 `"object"` 的对象（如数组）都包含一个内部属性 `[[Class]]`（我们可以把它看作一个内部的分类，而非传统的面向对象意义上的类）。这个属性无法直接访问， 一般通过 `Object.prototype.toString(..)` 来查看

## 42. 判断当前脚本是否运行在 node 中？

`typeof window === 'undefined' ? 'node' : 'browser';`

通过判断 Global 对象是否为 `window`，如果不为 `window`，当前脚本没有运行在浏览器中。

## 43. toPrecision 和 toFixed 和 Math.round 的区别？

`toPrecision(n)` 用于处理精度，所接受的参数 `n` 表示整个数字所保留的位数，会进行四舍五入。

`toFixed(n)` 是对小数点后指定位数取整，所接受的参数 `n` 表示小数点后保留的位数，会进行四舍五入。

`Math.round` 是将一个数字四舍五入到一个整数。

## 44. 如何比较两个 DOM 树的差异?

两个树的完全 diff 算法的时间复杂度为 $O(n^3)$ ，但是在前端中，我们很少会跨层级的移动元素，所以我们只需要比较同一层级的元素进行比较，这样就可以将算法的时间复杂度降低为 $O(n)$。

算法首先会对新旧两棵树进行一个深度优先的遍历，这样每个节点都会有一个序号。在深度遍历 的时候，每遍历到一个节点，我们就将这个节点和新的树中的节点进行比较，如果有差异，则将 这个差异记录到一个对象中。

在对列表元素进行对比的时候，由于 TagName 是重复的，所以我们不能使用这个来对比。我们需要给每一个子节点加上一个 key，列表对比的时候使用 key 来进行比较，这样我们才能够复用老的 DOM 树上的节点。

## 45. innerHTML、outerHTML、innerText、outerText 的区别？

- `innerHTML`：输出当前标签的文本内容，如果标签内有子标签，会连子标签本身和子标签内的文本内容一起输出。
- `outerHTML`：输出**当前标签的本身**和标签内的文本内容，如果有子标签，那么子标签本身和标签内的文本内容也将一起输出。
- `innerText`：只输出当前标签内的文本内容，如果标签内有子标签，那么也只输出子标签内的文本内容。
- `outerText`：只输出当前标签内的文本内容，如果标签内有子标签，那么也只输出子标签内的文本内容。

虽然在内容获取方面 `innerText` 与 `outerText` 会得到相同的结果，但在赋值方面则不一样，给 `outerText` 赋值会替换掉整个标签本身，而 `innerText` 仅仅会修改内部文本。

## 46. JavaScript 类数组对象的定义?

一个拥有 `length` 属性和若干索引属性的对象就可以被称为类数组对象，类数组对象和数组类似，但是不能调用数组的方法。常见的类数组对象有 `arguments` 和 DOM 方法的返回结果，还有一个函数也可以被看作是类数组对象，因为它含有 `length` 属性值，代表可接收的参数个数。

1. 通过 `call` 调用数组的 `slice` 方法来实现转换 : `Array.prototype.slice.call(arrayLike);`。
2. 通过 `call` 调用数组的 `splice` 方法来实现转换 : `Array.prototype.splice.call(arrayLike, 0);`。
3. 通过 `apply` 调用数组的 `concat` 方法来实现转换 : `Array.prototype.concat.apply([], arrayLike);`。
4. 通过 `Array.from` 方法来实现转换 : `Array.from(arrayLike);`。

## 47. 什么是尾调用

尾调用指的是函数的最后一步调用另一个函数。我们代码执行是基于执行栈的，所以当我们在一个函数里调用另一个函数时，我们会保留当前的执行上下文，然后再新建另外一个执行上下文加入栈中。使用尾调用的话，因为已经是函数的最后一步，所以这个时候我们可以不必再保留当前的执行上下文，从而节省了内存，这就是尾调用优化。但是 ES6 的尾调用优化只在严格模式下开启，正常模式是无效的。

## 48. Reflect 对象创建目的？

1. 用一个单一的全局对象去存储这些方法，能够保持其它的 JavaScript 代码的整洁、干净。
2. 修改某些 `Object` 方法的返回结果，让其变得更合理。
3. 将一些命令式的操作如 `delete`，`in` 等使用函数来替代，这样做的目的是为了让代码更加好维护，更容易向下兼容；也避免出现更多的保留字。
4. `Reflect` 对象的方法与 `Proxy` 的 `handler` 对象的方法一一对应，只要是 `Proxy` 对象的方法，就能在 `Reflect` 对象上找到对应的方法。这就让 `Proxy` 对象可以方便地调用对应的 `Reflect` 方法，完成默认行为，作为修改行为的基础。

```js
let miaoMiao = {
  _name: '疫苗',
  get name() {
    return this._name
  },
}
let miaoXy = new Proxy(miaoMiao, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver)
    // 也可以简写为 Reflect.get(...arguments)
  },
})

let kexingMiao = {
  __proto__: miaoXy,
  _name: '科兴疫苗',
}

// 结果是科兴疫苗
console.log(kexingMiao.name)
```

`Reflect` 的所有属性和方法都是静态的，不管 `Proxy` 怎么修改默认行为，你总可以在 `Reflect` 上获取默认行为。

## 49. 什么是 proxy ？

用法：`new Proxy(target, handler)`

`Proxy` 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”，即对编程语言进行编程。

`Proxy` 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。`Proxy` 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

## 50. 前端需要注意哪些 SEO？

1. 合理的 title、description、keywords：搜索对着三项的权重逐个减小，title 值强调重 点即可，重要关键词出现不要超过 2 次，而且要靠前，不同页面 title 要有所不同； description 把页面内容高度概括，长度合适，不可过分堆砌关键词，不同页面 description 有所不同； keywords 列举出重要关键词即可。
2. 语义化的 HTML 代码，符合 W3C 规范：语义化代码让搜索引擎容易理解网页。
3. 重要内容 HTML 代码放在最前：搜索引擎抓取 HTML 顺序是从上到下，有的搜索引 擎对抓取长度有限制，保证重要内容肯定被抓取。
4. 重要内容不要用 js 输出：爬虫不会执行 js 获取内容。
5. 少用 iframe：搜索引擎不会抓取 iframe 中的内容。
6. 非装饰性图片必须加 alt。
7. 提高网站速度：网站速度是搜索引擎排序的一个重要指标。

## 51. eslint 和 prettier 之间的冲突怎么解决？

冲突的本质在于 `eslint` 既负责了代码质量检测，又负责了一部分的格式美化工作,格式化部分的部分规则和 `prettier` 不兼容。 能不能让 `eslint` 只负责代码质量检测而让 `prettier` 负责美化呢? 好在社区有了非常好的成熟方案，即 `eslint-config-prettier` + `eslint-plugin-prettier`。

- `eslint-config-prettier` 的作用是关闭 `eslint` 中与 `prettier` 相互冲突的规则。
- `eslint-plugin-prettier` 的作用是赋予 `eslint` 用 `prettier` 格式化代码的能力。

安装依赖并修改 `.eslintrc` 文件：

```bash
// 安装依赖
yarn add eslint-config-prettier eslint-plugin-prettier -D

// .eslintrc
{
   // 其余的配置
 - "extends": ["eslint:recommended", "standard"]
 + "extends": ["eslint:recommended", "standard",  "plugin:prettier/recommended"]
  // 其余的配置
}
```

## 52. 判断当前节点类型?

1. 元素节点
2. 属性节点
3. 文本节点
4. 注释节点
5. 文档节点

通过 `nodeObject.nodeType` 判断节点类型：其中，`nodeObject` 为 DOM 节点（节点对象）。该属性返回以数字表示的节点类型，例如，元素节点返回 `1`，属性节点返回 `2` 。

## 53. 什么是装饰器

装饰器是一种与类相关的语法糖，用来包装或者修改类或者类的方法的行为，其实装饰器就是设计模式中装饰者模式的一种实现方式。

装饰器是 ES7 提出来的一个提案。

假如我们要得到两数相加的值并输出：

```js
function add(a, b) {
  return a + b
}
console.log(add(1, 2)) // 3
```

可以看到我们在 `console.log` 函数中调用了 `add` 函数，装饰器就适合在这种函数嵌套的形式中使用：

```js
class MyClass {
  @log
  add(a, b) {
    return a + b
  }
}

function log(val) {
  console.log(val)
}

new MyClass().add(1, 2) // 控制台输出 3
```

由于该特性目前处于提案 Stage2 阶段，因此我们还不能使用它们进行开发。

由此可知，装饰器实际上就是一个语法糖。

## 54. 怎么清空一个数组？

1. `arr.length = 0;`，这种方式不会改变原始数组引用。这意味着，如果您将一个数组引用分配给具有赋值运算符（=）的其他数组，则在一个数组上应用此方法也将清除另一个数组。
2. `arr = []`，此方法会改变原始数组引用。它将对空数组的引用分配给原始变量。
3. 使用 `pop()/shift()`直到结束，随着数组中元素数量的增加，这种方法可能会变得很慢。您将发现此方法与之前方法之间存在真正的性能差异，其中 Array 中的元素数量较多。
4. `arr.splice(0, arr.length)`，使用 `.splice()` 效果很好，性能也很好！但由于该 `.splice()` 函数将返回包含所有已删除项的数组，因此它实际上将返回原始数组的副本。

## 55. Array(100).map(x=>1) 结果是什么？

`Array(100)` 所创建的是稀疏数组，即不存在真实元素，节省内存空间。在控制台上显示为 `[empty]`。

正因为没有元素，所以它也不会有 `map` 操作，所以 `Array(100).map(x => 1)` 仍然返回为 `[empty]`。

## 56. 如何生成一个包含 100 个元素 1 的数组？

```js
// 使用Array.from
Array.from(Array(100), (x) => 1)
// 使用apply
Array.apply(null, Array(100)).map((x) => 1)
// 使用fill
Array(100).fill(1)
```

## 57. 用 setTimeout 模拟 setInterval？

考虑到 `setTimeout` 只会执行一次 `callback`，而 `setInterval` 会持续执行，模拟的关键就在于模拟这种持续执行，所以当上一个 `setTimeout` 完成后，需要执行下一个 `setTimeout`，代码如下：

```js
const intervalId = function simulateInterval(callback, interval) {
  let timerId = null

  function fn() {
    callback()
    const prevTimmerId = timerId
    timerId = setTimeout(fn, interval)
    clearTimeout(prevTimmerId)
  }

  return setTimeout(fn, interval)
}
```

## 58. find、findIndex、indexOf 的区别？

- `find`：`find()` 方法接受一个函数，返回数组中第一个满足条件的**元素**，找不到返回 `undefined`。
- `findIndex`：`findIndex()` 方法返回数组中满足提供的测试函数的第一个**元素的索引**。若没有找到对应元素则返回 `-1`。
- `indexOf`：`indexOf()` 方法返回在数组中可以找到指定元素的第一个**索引**，找不到返回-1。

## 59. 什么是纯函数？

简单来说，一个函数的返回结果只依赖于它的参数，并且在执行过程里面没有副作用，我们就把这个函数叫做纯函数。

```js
const a = 1
const foo = (b) => a + b
foo(2) // => 3
```

`foo` 函数不是一个纯函数，因为它返回的结果依赖于外部变量 `a`。因此当我们传入同样的数 `2`，并不能保证结果一定是 `3`。

纯函数很严格，也就是说你几乎除了计算数据以外什么都不能干，计算的时候还不能依赖除了函数参数以外的数据。

约束如下：

1. 同样的输入必定得到同样的输出。
2. 不得改写参数。
3. 不能调用系统 I/O 的 API。
4. 能调用 `Date.now()` 或者 `Math.random()` 等不纯的方法。

## 60. 什么是高阶函数？

高阶函数满足一下这些条件：

1. 情况 1: 参数是函数。
2. 情况 2: 返回是函数。

常见的高阶函数:

1. 定时器设置函数。
2. 数组的 `map()`/`filter()`/`reduce()`/`find()`/`bind()`。

作用:

1. 能实现更加动态, 更加可扩展的功能。

## 61. 什么是尾递归？

假如我们需要计算阶乘，使用递归的方法如下：

```js
const factorial = function (n) {
  if (n <= 1) return 1
  return factorial(n - 1) * n
}
console.log(factorial(5)) // 120
```

我们知道递归调用太多会大量占用内存来存储递归函数的状态，如果我们想要获取 `10000` 的阶乘呢？

函数调用会产生“调用记录（存储着函数的相关信息）”存放在栈中，当有函数返回，对应的调用记录才会消失，上述用普通递归实现的阶乘的执行过程中，不断的调用自身，导致一直没有返回，这样也就不断的在栈中存储调用记录。而当调用自身的次数过多后，就会产生我们常说的“栈溢出”。

尾调用就是：在函数执行的最后一步返回一个函数调用。举个例子：

```js
const factorial = (n, init = 1) => {
  if (n <= 1) return n * init
  return factorial(n - 1, n * init)
}
```

不过，目前为止，各平台已经不再支持尾递归优化，因此该技术已经是过去式了。

## 62. 如何创建 Ajax？

```js
// 1. 创建 XMLHttpRequest 实例
let xhr = XMLHttpRequest()
// 2. 打开和服务器的连接
xhr.open('get', 'URL')
// 3.发送
xhr.send()
// 4. 接收变化。
xhr.onreadystatechange = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    // readyState: ajax 状态，status：http 请求状态
    console.log(xhr.responseText) //响应主体
  }
}
```

## 63. Ajax 有哪些状态？

Ajax 状态一共有 5 种 `xhr.readyState`，分别是 0, 1, 2, 3, 4。

- 状态 0：`unsent`，刚创建的 `XMLHttpRequest` 实例，还没有发送。
- 状态 1：（载入）已调用 `send()` 方法，正在发送请求。
- 状态 2：（载入完成）`send()` 方法执行完成，已经接收到全部响应内容。
- 状态 3：`loading`，（交互）正在解析响应内容。
- 状态 4：`done`，表示响应的主体内容解析完成，可以在客户端调用了。

## 64. 为什么 axios 为什么既能在浏览器环境运行又能在服务器(node)环境运行？

因为：`axios` 在浏览器端使用 `XMLHttpRequest` 对象发送 ajax 请求；在 node 环境使用 `http` 对象发送 ajax 请求。

问题来了：`axios` 如何判断这两种环境呢？

```js
defaults.adapter = getDefaultAdapter()
function getDefaultAdapter() {
  var adapter
  if (typeof XMLHttpRequest !== 'undefined') {
    // 浏览器环境
    adapter = require('./adapter/xhr')
  } else if (typeof process !== 'undefined') {
    // node环境
    adapter = require('./adapter/http')
  }
  return adapter
}
```

## 65. Axios 的优点？

1. Axios 是一个基于 `promise` 的 HTTP 库，支持 `promise` 所有的 API。
2. 它可以拦截请求和响应。
3. 它可以转换请求数据和响应数据，并对响应回来的内容自动转换成 JSON 类型的数据。
4. 安全性更高，客户端支持防御 CSRF。
5. 同时支持浏览器和 Node.js 环境。

## 66. Axios 怎么拦截请求和响应？

Axios 提供了请求拦截器和响应拦截器来分别处理请求和响应，通过 `axios.interceptors.request` 和 `axios.interceptors.response` 对象提供的 `use` 方法，就可以分别设置请求拦截器和响应拦截器：

```js
// 添加请求拦截器
axios.interceptors.request.use((config) => {
  // ...
  return config
})
// 添加响应拦截器
axios.interceptors.response.use((data) => {
  // ...
  return data
})
```

## 67.已知如下数组，编写一个程序，将数组扁平化，并去除其中重复部分数据，最终得到一个升序且不重复的数组？

```js
arr = [
  [1, 2, 2],
  [3, 4, 5, 5],
  [6, 7, 8, 9, [11, 12, [12, 13, [14]]]],
]
```

```js
function flat(arr) {
  const newArr = []
  !(function func(list) {
    list.map((item) => {
      if (Array.isArray(item)) {
        func(item)
      } else {
        newArr.push(item)
      }
    })
  })(arr)
  return newArr
}
function delRepeat(arr) {
  const res = []
  arr.forEach((item) => {
    if (arr.indexOf(item) === -1) {
      res.push(item)
    }
  })
  return res
}
```

## 68. async/await 的优缺点？

优点：

1. 它做到了真正的串行的同步写法，代码阅读相对容易。
2. 对于条件语句和其他流程语句比较友好，可以直接写到判断条件里面。
3. 处理复杂流程时，在代码清晰度方面有优势。

缺点：

1. 无法处理 `promise` 返回的 `reject` 对象，要借助 `try...catch...`。
2. `await` 只能串行，做不到并行。`await` 做不到并行，不代表 `async` 不能并行。只要 `await` 不在同一个 `async` 函数里就可以并行。
3. 全局捕获错误必须用 `window.onerror`，不像 `Promise` 可以专用 `window.addEventListener('unhandledrejection', function)`，而 `window.onerror` 会捕获各种稀奇古怪的错误，造成系统浪费。

## 69. 什么是 web components？

Web Components 由三项主要技术组成，它们可以一起使用来创建封装功能的定制元素，可以在你喜欢的任何地方重用，不必担心代码冲突。

- **Custom elements（自定义元素）**：一组 JavaScript API，允许您定义 `custom elements` 及其行为，然后可以在您的用户界面中按照需要使用它们。
- **Shadow DOM（影子 DOM）**：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
- **HTML templates（HTML 模板）**： `<template>` 和 `<slot>` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

![](https://pic4.zhimg.com/80/v2-f90e70d7fba773af63b6ed383d5bc707_720w.jpg)

Web Components 目前的支持度并不高，因此需要谨慎使用。

## 70. JS 中阻止冒泡事件的方法?

1. `event.stopPropagation()`

这是阻止事件的冒泡方法，不让事件向 document 上蔓延，但是默认事件任然会执行，当你掉用这个方法的时候，如果点击一个连接，这个连接仍然会被打开。

2. `event.preventDefault()`

这是阻止默认事件的方法，调用此方法是，连接不会被打开，但是会发生冒泡，冒泡会传递到上一层的父元素。

3. 在事件回调中 `return false`

这个方法比较暴力，他会同事阻止事件冒泡也会阻止默认事件；写上此代码，连接不会被打开，事件也不会传递到上一层的父元素；可以理解为 `return false` 就等于同时调用了 `event.stopPropagation()` 和 `event.preventDefault()`。

## 71. Generator 协程工作原理？

Generator 引入的“协程”概念，这就意味着我们可以以同步的方式来书写异步代码。

Generator 对象同时实现了：可迭代协议（`Symbol.iterator`）和 迭代器协议（`next()`）。

```js
function* g() {
  yield 'a'
  yield 'b'
  yield 'c'
  return 'ending'
}

g() // 返回一个对象
```

`g()` 并不会执行 `g` 函数，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是迭代器对象（Iterator Object）。

第一次执行 `gen.next()` 返回一个非常非常简单的对象 `{value: "a", done: false}`，`'a'` 就是 `g` 函数执行到第一个 `yield` 语句之后得到的值，`false` 表示 `g` 函数还没有执行完，只是在这暂停。

接下来执行 `gen.next()` 会依次返回 `{value: "b", done: false}`，`{value: "c", done: false}` 和 `{value: "ending", done: true}`。

如果继续调用 `gen.next()`，就会返回 `{value: undefined, done: true}`。

如果函数 `g` 没有 `return`，那么函数实际上会在尾部自动加上一个 `return undefined`，因此第四次执行 `gen.next()` 就会返回 `{value: undefined, done: true}`。

`yield` 的阻塞原理是什么？

举个例子：

```js
function* fn() {
  let a = 1
  yield a
  a++
  yield a
  a++
  return a
}
```

我们在第一次调用 `fn()` 的时候，并不会执行 `fn` 内部的命令，因此这时 `a` 的值还是 `undefined`。也就是说，在函数开头就停止住了。

因此：第一次运行 `fn()`，一句代码都不会执行；当执行 `next()`，则会一路畅行直到碰到一个 `yield`，然后会在执行完 `yield` 这行代码之后阻塞住。

更深层次的理解 `yield`：

```js
function* test(x) {
  var y = 2 * (yield x + 1)
  var z = yield y / 3
  console.log(x, y, z)
  return x + y + z
}
var a = test(5)
a.next() // {value: 6, done: false}
a.next(12) // {value: 8, done : false}
a.next(13) // {value: 42, done: true}
```

调用 `test` 函数传了一个 `5` 赋给 `x`，第一次调用 `next`，返回的就是 `5+1` 为 `6`，第二次调用 `next` 将 `12` 传递给第一个 `yield` 作为返回值，因此 `y = 2 * 12` 为 `24`，因此 `z` 的值就是 `24 / 3` 为 `8`。最后：`x=5,y=24,z=13`，最后 `return` 的值为 `42`。由此可得：`next()` 传参是对 `yield` 整体的传参。

## 72. 手写一个 Async Await？

```js
function asyncToGenerator(generatorFunc) {
  return function () {
    const gen = generatorFunc.apply(this, arguments)
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let generatorResult
        try {
          generatorResult = gen[key](arg)
        } catch (error) {
          return reject(error)
        }
        const { value, done } = generatorResult
        if (done) {
          return resolve(value)
        } else {
          return Promise.resolve(value).then(
            (val) => step('next', val),
            (err) => step('throw', err)
          )
        }
      }
      step('next')
    })
  }
}
```

## 73. 手写 Promise.all

```js
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    if (!promises || typeof promises !== 'object' || typeof promises[Symbol.iterator] !== 'function') {
      reject(TypeError())
    }
    if (promises.length === 0) {
      resolve([])
    } else {
      let ans = []
      let index = 0
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          (data) => {
            // 不能用Push操作,因为不能确定谁先回来,要用index来记录，否则无法准确获得当前收到的结果的数目
            index++
            ans[i] = data
            if (index === promises.length) {
              resolve(ans)
            }
          },
          (error) => {
            reject(error)
          }
        )
      }
    }
  })
}
```

## 74. 对象的深度克隆，包括 function，Date，RegExp 和 symbol 类型？

```js
function deepClone(origin, target, hash = new WeakMap()) {
  //origin:要被拷贝的对象
  // 需要完善，克隆的结果和之前保持相同的所属类
  const target = target || {}

  // 处理特殊情况
  if (origin == null) return origin //null 和 undefined 都不用处理
  if (origin instanceof Date) return new Date(origin)
  if (origin instanceof RegExp) return new RegExp(origin)
  if (typeof origin !== 'object') return origin // 普通常量直接返回

  //  防止对象中的循环引用爆栈，把拷贝过的对象直接返还即可
  if (hash.has(origin)) return hash.get(origin)
  hash.set(origin, target) // 制作一个映射表

  // 拿出所有属性，包括可枚举的和不可枚举的，但不能拿到symbol类型
  const props = Object.getOwnPropertyNames(origin)
  props.forEach((prop, index) => {
    if (origin.hasOwnProperty(prop)) {
      if (typeof origin[prop] === 'object') {
        if (Object.prototype.toString.call(origin[prop]) == '[object Array]') {
          //数组
          target[prop] = []
          deepClone(origin[prop], target[prop], hash)
        } else if (Object.prototype.toString.call(origin[prop]) == '[object Object]') {
          //普通对象
          target[prop] = {}

          deepClone(origin[prop], target[prop], hash)
        } else if (origin[prop] instanceof Date) {
          // 处理日期对象
          target[prop] = new Date(origin[prop])
        } else if (origin[prop] instanceof RegExp) {
          // 处理正则对象
          target[prop] = new RegExp(origin[prop])
        } else {
          //null
          target[prop] = null
        }
      } else if (typeof origin[prop] === 'function') {
        const _copyFn = function (fn) {
          const result = new Function('return ' + fn)()
          for (let i in fn) {
            deepClone[(fn[i], result[i], hash)]
          }
          return result
        }
        target[prop] = _copyFn(origin[prop])
      } else {
        //除了object、function，剩下都是直接赋值的原始值
        target[prop] = origin[prop]
      }
    }
  })

  // 单独处理symbol
  const symKeys = Object.getOwnPropertySymbols(origin)
  if (symKeys.length) {
    symKeys.forEach((symKey) => {
      target[symKey] = origin[symKey]
    })
  }
  return target
}
```

## 75. 什么是 Intersection Observer？

`IntersectionObserver` 接口提供了一种异步观察目标元素与其祖先元素或顶级文档视窗交叉状态的方法。祖先元素与视窗被称为**根**(root)。

当一个 `IntersectionObserver` 对象被创建时，其被配置为监听根中一段给定比例的可见区域。一旦 `IntersectionObserver` 被创建，则无法更改其配置，所以一个给定的观察者对象只能用来监听可见区域的特定变化值；然而，你可以在同一个观察者对象中配置监听多个目标元素。

网页开发时，常常需要了解某个元素是否进入了"视口"（viewport），即用户能不能看到它。

传统的实现方法是，监听到 `scroll` 事件后，调用目标元素的 `getBoundingClientRect()` 方法，得到它对应于视口左上角的坐标，再判断是否在视口之内。这种方法的缺点是，由于 `scroll` 事件密集发生，计算量很大，容易造成性能问题。

用法：

```js
var io = new IntersectionObserver(callback, option)
// 开始观察
io.observe(document.getElementById('example'))
// 停止观察
io.unobserve(element)
// 关闭观察器
io.disconnect()

// callback 会在元素刚开始进入视线和完全离开视线触发
var io = new IntersectionObserver((entries) => {
  console.log(entries)
})
```

我们希望某些静态资源（比如图片），只有用户向下滚动，它们进入视口时才加载，这样可以节省带宽，提高网页性能。这就叫做"惰性加载"。有了 IntersectionObserver API，实现起来就很容易了。

IntersectionObserver API 是异步的，不随着目标元素的滚动同步触发。规格写明，`IntersectionObserver` 的实现，应该采用 `requestIdleCallback()`，即只有线程空闲下来，才会执行观察器。这意味着，这个观察器的优先级非常低，只在其他任务执行完，浏览器有了空闲才会执行。

实现图片懒加载：

```html
<!-- 图片元素设置 lazyload 属性 -->
<img src="图片链接" alt="图片说明" lazyload="true" />
<script>
  /**
   * @method lazyLoad
   * @param {NodeList} $imgList      图片元素集合
   * @param {number}   preloadHeight 预加载高度
   */
  function lazyLoad($imgList, preloadHeight = 1000) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 目标元素出现在 root 可视区，返回 true
            const $target = entry.target
            const src = $target.getAttribute('lazyload')

            if (src) {
              $target.setAttribute('src', src) // 真正加载图片
            }
            observer.unobserve($target) // 解除观察
          }
        })
      },
      {
        rootMargin: `0px 0px ${preloadHeight}px 0px`,
      }
    )

    Array.prototype.forEach.call($imgList, ($item) => {
      if ($item.getAttribute('src')) return // 过滤已经加载过的图片
      observer.observe($item) // 开始观察
    })
  }
  // 观察图片元素
  lazyLoad(document.querySelectorAll('[lazyload]'))
</script>
```

如果浏览器不支持，可以使用 [polyfill](https://github.com/w3c/IntersectionObserver/tree/main/polyfill)

## 76. localStorage 可以设置过期时间吗？怎么去实现呢？

存储的值加一个时间戳，下次取值时验证时间戳。

```js
Storage.prototype.setExpire = (key, value, expire) => {
  let obj = {
    data: value,
    time: Date.now(),
    expire: expire,
  }
  localStorage.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getExpire = (key) => {
  let val = localStorage.getItem(key)
  if (!val) {
    return val
  }
  val = JSON.parse(val)
  if (Date.now() - val.time > val.expire) {
    localStorage.removeItem(key)
    return null
  }
  return val.data
}

// 使用
localStorage.setExpire('userId', 'zhangsan', 5000)
window.setInterval(() => {
  console.log(localStorage.getExpire('userId'))
}, 1000)
```

## 77. 哪些方法可以将字符串转换为 JavaScript 代码执行？

如下：

```js
eval('console.log(123)') // 123
new Function('console.log(123)')() // 123
setInterval('console.log(123)', 0)
setTimeout('console.log(123)', 0)
```

## 79. 代码块和表达式的区别？

JavaScript 规定，如果行首是大括号，一律解释为语句（即代码块）。如果要解释为表达式（即对象），必须在大括号前加上圆括号。

## 80. 编译原理中词法分析、语法分析、语义分析的区别？

**词法分析**阶段是编译过程的第一个阶段。这个阶段的任务是从左到右一个字符一个字符地读入源程序，即对构成源程序的字符流进行扫描然后根据构词规则识别单词(也称单词符号或符号)。词法分析程序实现这个任务。

**语法分析**是编译过程的一个逻辑阶段。语法分析的任务是在词法分析的基础上将单词序列组合成各类语法短语，如“程序”，“语句”，“表达式”等等，语法分析程序判断源程序在结构上是否正确，源程序的结构由上下文无关文法描述。

**语义分析**是编译过程的一个逻辑阶段. 语义分析的任务是对结构上正确的源程序进行上下文有关性质的审查, 进行类型审查。

## 81. 怎么处理数万条数据的虚拟列表？

使用 webWorker 接收后台传过来的海量数据，使用 indexedDB 而不是内存来存储列表数据。

## 82. 判断一个对象是否为空对象？

1. 将 JSON 对象转化为 JSON 字符串，再判断该字符串是否为 `{}`

```js
var data = {}
console.log(JSON.stringify(data) === '{}')
```

2. `for...in`

```js
var obj = {}
var b = function () {
  for (var key in obj) {
    return false
  }
  return true
}
alert(b()) //true
```

3. `Object.getOwnPropertyNames()`

```js
var data = {}
var arr = Object.getOwnPropertyNames(data)
alert(arr.length == 0) //true
```

4. `Object.keys()`

```js
var data = {}
var arr = Object.keys(data)
alert(arr.length == 0) //true
```

## 83. undefined 和 null 的区别？

JavaScript 的最初版本是这样区分的：`null` 是一个表示"无"的对象，转为数值时为 `0`；`undefined` 是一个表示"无"的原始值，转为数值时为 `NaN`。

```js
Number(undefined) // NaN
Number(null) // 0
```

但除了这些，它们两个还有很多区别：

1. `null` 表示"没有对象"，即该处不应该有值，比如原型链的终点为 `null`，同时，除非定义为 `null`，否则不会出现 `null`。`undefined` 表示"缺少值"，就是此处应该有一个值，但是还没有定义。
2. `undefined` 是 `window` 对象中的一个只读属性，不能在全局更改或重新声明 `undefined`，但在函数中可以。

```js
undefined = 123
console.log(undefined) // undefined

let undefined = 123 // Uncaught SyntaxError: Identifier 'undefined' has already been declared

;(function () {
  let undefined = 123
  console.log(undefined) // 123
})()
```

由于 `undefined` 在函数中可以被改写，因此通常使用 `void 0` 代替 `undefined` 做返回值。

实际上，ECMAScript 明确规定 `void` 操作符 对任何表达式求值都返回 `undefined` ，这和函数执行操作后没有返回值的作用是一样的，JavaScript 中的函数都有返回值，当没有 `return` 操作时，就默认返回一个原始的状态值，这个值就是 `undefined`，表明函数的返回值未被定义。

```js
void 0 // undefined
void false // undefined
void [] // undefined
void null // undefined
void function fn() {} // undefined
```

## 84. 普通函数和箭头函数的区别？

1. 用了箭头函数，`this` 就不是指向 `window`，而是父级上下文（指向是不可变的）。
2. 不能够使用 `arguments` 对象。
3. 不能用作构造函数，这就是说不能够使用 `new` 命令，否则会抛出一个错误。
4. 不可以使用 `yield` 命令，因此箭头函数不能用作 `Generator` 函数。

## 85. 如何实现 ES6 的模板字符串？

```js
let name = 'web'
let age = 10
let str = '你好，${name} 已经 ${age}岁了'
str = str.replace(/\$\{([^}]*)\}/g, function () {
  return eval(arguments[1])
})
console.log(str) //你好，web 已经 10岁了
```

## 86. JS 如何实现继承？

`call`/`apply`/`bind` 继承：

```javascript
function Parent() {
  this.name = 'parent'
}
Parent.prototype.printName = function () {
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
Parent.prototype.printName = function () {
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
Parent.prototype.printName = function () {
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

## 87. substr, substring 和 slice 的区别在哪？

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

## 88. 数组中的 Empty 是怎么回事？

在 JavaScript 的数组是以稀疏数组的形式存在的，所以当在某些位置没有值时，就需要使用某个值去填充。当然对于稀疏数组在各种浏览器中会存在优化的操作，例如在 V8 引擎中就存在快数组与慢数组的转化，此外在 V8 中对于 empty 的描述是一个空对象的引用。

在 JavaScript 中使用 `Array` 构造器创建出的存在空位的问题，默认并不会以 undefined 填充，而是以 empty 作为值，需要注意的是，空位并不是 `undefined`，`undefined` 表示的是没有定义，但是本身 `undefined` 就是一个基本数据类型，是一个值，而是 empty 表示了该处没有任何值，是一个完全为空的位置。

```js
console.log([, , ,]) // (3) [empty × 3]
console.log(new Array(3)) // (3) [empty × 3]
console.log([undefined, undefined, undefined]) // (3) [undefined, undefined, undefined]
console.log(0 in [undefined, undefined, undefined]) // true
console.log(0 in [, , ,]) // false // in 是检查索引 此处表示 0 位置是没有值的
```

一些数组方法会忽略 empty 空位，另外一些则是将空位转为 `undefined`：

```js
// forEach 忽略空位
;[1, , 2].forEach((v) => console.log(v)) // 1 2

// for in 忽略空位
for (let key in [1, , 2]) {
  console.log(key)
} // 0 2

// filter 忽略空位
console.log([1, , 2].filter((v) => true)) // [1, 2]

// every 忽略空位
console.log([1, , 1].every((v) => v === 1)) // true

// some 忽略空位
console.log([1, , 1].some((v) => v !== 1)) // false

// map 遍历时忽略空位 新数组保留空位
console.log([1, , 1].map((v) => 11)) // (3) [11, empty, 11]

// join 将空位与undefined以及null视为空字符串
console.log([1, , 1, null, undefined].join('|')) // 1||1||

// toString 将空位与undefined以及null视为空字符串
console.log([1, , 1, null, undefined].toString()) // 1,,1,,

// Array.form 将空位转为undefined
console.log(Array.from([1, , 2])) // (3) [1, undefined, 2]

// ... 将空位转为undefined
console.log([...[1, , 2]]) // (3) [1, undefined, 2]

// copyWithin 将空位一并拷贝
console.log([1, , 2].copyWithin()) // (3) [1, empty, 2]

// for of 遍历空位并将值作为undefined
for (let key of [1, , 2]) {
  console.log(key)
} // 1 undefined 2

// includes 将空位处理成undefined
console.log([, , ,].includes(undefined)) // true

// entries 将空位处理成undefined
console.log([...[1, , 2].entries()]) // [[0, 1], [1, undefined], [2, 2]]

// keys 会取出空位的索引
console.log([...[1, , 2].keys()]) // [0, 1, 2]

// values 将空位处理成undefined
console.log([...[1, , 2].values()]) // [1, undefined, 2]

// find 将空位处理成undefined
console.log([, , 1].find((v) => true)) // undefined

// find 将空位处理成undefined
console.log([, , 1].findIndex((v) => true)) // 0
```

## 89. Symbol 是什么？有哪些用处？

`Symbol()` 函数只有一个参数，字符串 `description`。这个字符串参数的唯一作用是辅助调试，也就是它的 `toString()` 值。但是请注意，两个具有相同 `description` 的 `symbol` 也是不相等的。

有一个全局的 `symbol` 注册中心，用 `Symbol.for()` 创建的 `symbol` 会添加到这个注册中心，并用它的 `description` 作为索引键。也就是说，如果你用 `Symbol.for()` 创建带有相同 `description` 的两个 `symbol`，它们就是相等的。

```js
const symbol1 = Symbol.for('test')
const symbol2 = Symbol.for('test')

symbol1 === symbol2 // true
console.log(symbol1) // 'Symbol(test)'
```

通常来说，除非你有非常好的理由，否则不应该使用全局注册中心，因为这会造成命名冲突。

作用有二：

1. 阻止对象属性名冲突。

Symbol 在不知道对象原有属性名的情况下，扩展对象属性很有用，可以有效地防止属性名冲突的问题。

2. 模拟私有属性，让外界无法访问到。

由于任何两个 `symbol` 都是不相等的，在 JavaScript 里可以很方便地用来模拟私有属性。`symbol` 不会出现在 `Object.keys()` 的结果中，因此除非你明确地 `export` 一个 `symbol`，或者用 `Object.getOwnPropertySymbols()` 函数获取，否则其他代码无法访问这个属性。

```js
const symbol = Symbol('test')
const obj = {}
obj[symbol] = 'test'

Object.keys(obj) // []

// 除非有这个 symbol 的引用，否则无法访问该属性
obj[Symbol('test')] // undefined

// 用 getOwnPropertySymbols() 依然可以拿到 symbol 的引用
const [symbol] = Object.getOwnPropertySymbols(obj)
obj[symbol] // 'test'
```

还有一个原因是 `symbol` 不会出现在 `JSON.stringify()` 的结果里，确切地说是 `JSON.stringify()` 会忽略 `symbol` 属性名和属性值：

```js
const symbol = Symbol('test')
const obj = { [symbol]: 'test', test: symbol }

JSON.stringify(obj) // "{}"
```

## 90. 前端错误异常的捕获方式？

1. `try catch`

`try catch` 的问题在于：**能捕捉到的异常必须是线程执行已经进入 `try catch` 但 `try catch` 未执行完的时候抛出来的。**

因此，异步代码、语法错误、跨域、Promise 异常都无法被捕获。

如果想要捕获到异步代码产生的错误，需要使用 Async Await：

```js
const request = async () => {
  try {
    const { code, data } = await somethingThatReturnsAPromise()
  } catch (err) {
    console.error('request error', err)
  }
}
```

2. `window.onerror = cb`

当 JavaScript 运行时错误（包括语法错误）发生时，`window` 会触发一个 `ErrorEvent` 接口的事件，并执行 `window.onerror()`。

但这里有个信息要注意，语法错误会导致出现语法错误的那个脚本块执行失败，所以语法错误会导致当前代码块运行终止，从而导致整个程序运行中断，如果语法错误这个发生在我们的错误监控语句块中，那么我们就什么也监控不到了。

3. `Promise.then().catch(cb)`

`Promise` 中的错误会被 `Promise.prototype.catch` 捕获，所以我们通过这种方式捕获错误。

4. `element.onerror`

当一项资源（如 `<img>` 或 `<script>`）加载失败，加载资源的元素会触发一个 `Event` 接口的 `error` 事件，并执行该元素上的 `onerror()` 处理函数。

这些 `error` 事件不会向上冒泡到 `window`，不过能被单一的 `window.addEventListener` 捕获。

5. `window.addEventListener("unhandledrejection", cb)`

最新的规范中定义了 `unhandledrejection` 事件用于全局捕获 `promise` 对象没有 `rejection` 处理器时异常情况。

6. `window.addEventListener('error', cb, true)`

资源加载失败，不会冒泡，但是会被 `addEventListener` 捕获，所以我们可以指定在加载失败事件的捕获阶段捕获该错误。

## 91. Array.from 是用来做什么的？

`Array.from()` 方法对一个**类似数组**或**可迭代对象**创建一个新的，**浅拷贝**的数组实例。

它接受如下参数：

1. `arrayLike`：想要转换成数组的伪数组（拥有一个 `length` 属性和若干索引属性的任意对象）对象或可迭代对象（可以获取对象中的元素,如 `Map` 和 `Set` 等）。
2. `mapFn`：可选，如果指定了该参数，新数组中的每个元素会执行该回调函数。
3. `thisArg`：可选，执行回调函数 `mapFn` 时 `this` 对象。

## 92. 前端如何进行跨页面通信？

在满足同源策略的情况下，有这些技术可以用来实现跨页面通信：

1. BroadCast Channel

BroadCast Channel 可以帮我们创建一个用于广播的通信频道。当所有页面都监听同一频道的消息时，其中某一个页面通过它发送的消息就会被其他所有页面收到。它的 API 和用法都非常简单。

下面的方式就可以创建一个标识为 TOM 的频道：

```js
const bc = new BroadcastChannel('TOM')
```

各个页面可以通过 `onmessage` 来监听被广播的消息：

```js
bc.onmessage = function (e) {
  const data = e.data
  const text = '[receive] ' + data.msg + ' —— tab ' + data.from
  console.log('[BroadcastChannel] receive message:', text)
}
```

要发送消息时只需要调用实例上的 `postMessage` 方法即可

```js
bc.postMessage(mydata)
```

2. Service Worker

Service Worker 是一个可以长期运行在后台的 Worker，能够实现与页面的双向通信。多页面共享间的 Service Worker 可以共享，将 Service Worker 作为消息的处理中心（中央站）即可实现广播效果。

```js
navigator.serviceWorker.register('../util.sw.js').then(function () {
  console.log('Service Worker 注册成功')
})
```

其中 `../util.sw.js` 是对应的 Service Worker 脚本。Service Worker 本身并不自动具备“广播通信”的功能，需要我们添加些代码，将其改造成消息中转站：

```js
/* ../util.sw.js Service Worker 逻辑 */
self.addEventListener('message', function (e) {
  console.log('service worker receive message', e.data)
  e.waitUntil(
    self.clients.matchAll().then(function (clients) {
      if (!clients || clients.length === 0) {
        return
      }
      clients.forEach(function (client) {
        client.postMessage(e.data)
      })
    })
  )
})
```

我们在 Service Worker 中监听了 `message` 事件，获取页面（从 Service Worker 的角度叫 client）发送的信息。然后通过 `self.clients.matchAll()` 获取当前注册了该 Service Worker 的所有页面，通过调用每个 client（即页面）的 `postMessage` 方法，向页面发送消息。这样就把从一处（某个 Tab 页面）收到的消息通知给了其他页面。

处理完 Service Worker，我们需要在页面监听 Service Worker 发送来的消息：

```js
/* 页面逻辑 */
navigator.serviceWorker.addEventListener('message', function (e) {
  const data = e.data
  const text = '[receive] ' + data.msg + ' —— tab ' + data.from
  console.log('[Service Worker] receive message:', text)
})
```

3. LocalStorage

当 LocalStorage 变化时，会触发 `storage` 事件。利用这个特性，我们可以在发送消息时，把消息写入到某个 LocalStorage 中；然后在各个页面内，通过监听 `storage` 事件即可收到通知。

```js
window.addEventListener('storage', function (e) {
  if (e.key === 'ctc-msg') {
    const data = JSON.parse(e.newValue)
    const text = '[receive] ' + data.msg + ' —— tab ' + data.from
    console.log('[Storage I] receive message:', text)
  }
})
```

在各个页面添加如上的代码，即可监听到 LocalStorage 的变化。当某个页面需要发送消息时，只需要使用我们熟悉的 `setItem` 方法即可。

::: tip Notice
只有值真的变化了，才会触发 `storage` 事件
:::

4. Shared Worker

Shared Worker 是 Worker 家族的另一个成员。普通的 Worker 之间是独立运行、数据互不相通；而多个 Tab 注册的 Shared Worker 则可以实现数据共享。

Shared Worker 在实现跨页面通信时的问题在于，它无法主动通知所有页面，因此，我们会使用轮询的方式，来拉取最新的数据。思路如下：

让 Shared Worker 支持两种消息。一种是 post，Shared Worker 收到后会将该数据保存下来；另一种是 get，Shared Worker 收到该消息后会将保存的数据通过 postMessage 传给注册它的页面。也就是让页面通过 get 来主动获取（同步）最新消息。具体实现如下：

首先，我们会在页面中启动一个 Shared Worker，启动方式非常简单：

```js
// 构造函数的第二个参数是 Shared Worker 名称，也可以留空
const sharedWorker = new SharedWorker('../util.shared.js', 'ctc')
```

然后，在该 Shared Worker 中支持 get 与 post 形式的消息：

```js
/* ../util.shared.js: Shared Worker 代码 */
let data = null
self.addEventListener('connect', function (e) {
  const port = e.ports[0]
  port.addEventListener('message', function (event) {
    // get 指令则返回存储的消息数据
    if (event.data.get) {
      data && port.postMessage(data)
    }
    // 非 get 指令则存储该消息数据
    else {
      data = event.data
    }
  })
  port.start()
})
```

之后，页面定时发送 get 指令的消息给 Shared Worker，轮询最新的消息数据，并在页面监听返回信息：

```js
// 定时轮询，发送 get 指令的消息
setInterval(function () {
  sharedWorker.port.postMessage({ get: true })
}, 1000)

// 监听 get 消息的返回数据
sharedWorker.port.addEventListener(
  'message',
  (e) => {
    const data = e.data
    const text = '[receive] ' + data.msg + ' —— tab ' + data.from
    console.log('[Shared Worker] receive message:', text)
  },
  false
)
sharedWorker.port.start()
```

最后，当要跨页面通信时，只需给 Shared Worker postMessage 即可：

```js
sharedWorker.port.postMessage(mydata)
```

5. window.open + window.opener

当我们使用 `window.open` 打开页面时，方法会返回一个被打开页面 `window` 的引用。而在未显示指定 noopener 时，被打开的页面可以通过 `window.opener` 获取到打开它的页面的引用 —— 通过这种方式我们就将这些页面建立起了联系（一种树形结构）。

代码请看[前端跨页面通信，你知道哪些方法？](https://blog.csdn.net/p3118601/article/details/88966864)

## 93. 怎么判断页面是否被嵌套在 iframe 里？

`console.log(window.self === window.top)`，如果返回 `false` 说明页面被嵌套在 `iframe` 中了。

## 94. 函数式编程的特点以及应用场景？

函数式编程 属于声明式编程中的一种，它的主要思想是 将计算机运算看作为函数的计算，也就是把程序问题抽象成数学问题去解决。

函数式编程有以下几个特点：

1. 函数可以和变量一样，可以赋值给其他变量，也可以作为参数，传入一个函数，或者作为别的函数返回值。
2. 函数式编程中的每一步都是单纯的运算，而且都有返回值。
3. 无副作用，不会产生除运算以外的其他结果。
4. 同一个输入永远得到同一个数据。
5. 函数的运行不依赖于外部变量，只依赖于输入的参数。
6. 惰性求值：预先定义多个操作，但不立即求值，在需要使用值时才去求值，可以避免不必要的求值，提升性能，柯里化一种惰性求值。
7. 复用性好。

基于这些特点，又衍生出了许多应用场景：

- **纯函数**：同样的输入得到同样的输出，无副作用。
- **函数组合**：将多个依次调用的函数，组合成一个大函数，简化操作步骤。
- **高阶函数**：可以加工函数的函数，接收一个或多个函数作为输入、输出一个函数。
- **闭包**：函数作用域嵌套，实现的不同作用域变量共享。
- **柯里化**：将一个多参数函数转化为多个嵌套的单参数函数。
- **偏函数**：缓存一部分参数，然后让另一些参数在使用时传入，`bind` 就是采用偏函数的思想。
- **惰性求值**：预先定义多个操作，但不立即求值，在需要使用值时才去求值，可以避免不必要的求值，提升性能。
- **递归**：控制函数循环调用的一种方式。
- **尾递归**：避免多层级函数嵌套导致的内存溢出的优化，已废弃。
- **链式调用**：让代码更加优雅。

## 95. JSX 如何映射为 JavaScript?

使用 JSX 可以在 JS 文件中写 HTML 的语句，但是实际上最终编译时又会被转换为 JavaScript。

我们可以在 [repl](https://babeljs.io/repl/) 上查看转换的 JavaScript。

至于编译本身的工作，是由 Babel 完成的，举个例子：

:::: tabs
::: tab 转换前

```html
<div className="App">
  <h1 className="title">I am the title</h1>
  <p className="content">I am the content</p>
</div>
```

:::
::: tab 转换后

```js
'use strict'

React.createElement(
  'div',
  { className: 'App' },
  React.createElement('h1', { className: 'title' }, 'I am the title'),
  React.createElement('p', { className: 'content' }, 'I am the content')
)
```

:::
::::

所有的 JSX 标签都被转化成了 `React.createElement` 调用，这也就意味着，我们写的 JSX 其实写的就是 `React.createElement`。因此 JSX 完全就是一种语法糖。
