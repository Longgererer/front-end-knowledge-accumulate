# 理解数组及其部分 API 的实现

这篇文章里我们探讨一下数组及其部分 API 的实现，这可以进一步地提升对数组的全面理解。

首先我们要明白 JavaScript 中的**数组实际上就是一个具有数字键名和 `length` 属性的对象**。

我们先来看看数组的几种声明方式：

```javascript
const arr = [] // 字面量
const arr = new Array() // 构造函数
```

这三种声明方式有什么区别呢？就上面这个例子的结果来说没有任何区别。但从用法上来说，`Array` 函数可以接收参数，如果将一个正整数传给构造函数，会生成一个该长度的数组：

```javascript
const arr = new Array(8) // arr = [] and arr.length=8
```

这种方式只会为数组提供 8 个元素的内存空间，而不是在数组中添加 8 个空元素。

如果传递多个参数，会生成一个包含这些元素的数组：

```javascript
const arr = new Array(8, 9, 10) // arr = [8,9,10]
```

另外，`[]` 和 `new Array()` 还有一个关键的区别是：由于 `new Array()` 可以事先声明数组长度，这会导致 `push` 和 `unshift` 方法的性能与 `[]` 的不同，至于为什么不同，下面说 `push` 和 `unshift` 的时候会讲到。

:::tip Notice
直接调用 `Array()`，也可以创建数组，这和 `new Array()` 没有任何区别，根据规范描述：`Array` 在作为普通函数而不是构造函数调用时，它将创建一并初始化一个新的 `Array` 对象。
:::

## Array

首先我们创造一个“自己”的数组，我们要编写一个构造函数 `CustomArray` 来实现 `Array` 函数的功能。

`CustomArray` 函数需要满足如下几点：

- 可以作为构造函数，也可以作为普通函数调用。
- 接收一个正整数参数并生成对应长度的自定义数组。
- 接收多个参数并生成包含这些元素的自定义数组。
- `length` 是不可枚举属性。
- 可迭代，可以使用数组扩展符以及 `for...of` 进行迭代。

```javascript
function CustomArray(...args) {
  const arr = Object.create(CustomArray.prototype)
  Object.defineProperty(arr, 'length', {
    value: 0,
    enumerable: false,
    writable: true,
  })
  // 判断是否只有一个参数
  if (args.length === 1) {
    const firstArg = args[0]
    // 该参数如果是NaN、Infinity或浮点数，报错
    if (typeof firstArg === 'number') {
      if (Number.isNaN(firstArg) || firstArg === Infinity || ~~firstArg !== firstArg) {
        throw new RangeError('Invalid array length')
      } else {
        arr.length = firstArg
      }
    } else {
      arr[0] = firstArg
    }
  } else {
    // 将参数按顺序添加到自定义数组中，length做递增
    for (let item of args) {
      arr[arr.length] = item
      arr.length++
    }
  }
  // 定义Symbol.iterator方法使对象可以进行迭代遍历
  arr[Symbol.iterator] = function*() {
    yield* Object.values(this)
  }
  return arr
}
```

:::tip Notice
只要正确地实现了 `Symbol.iterator` 方法，任何数据都可以进行迭代，因为扩展符和 `for...of` 都是通过 `Symbol.iterator` 进行遍历的。
:::

我们测试一下结果：

```javascript
new CustomArray(-1) // error: Uncaught RangeError: Invalid array length
new CustomArray(8) // {length: 8}
new CustomArray(1, 2, 3) // {0: 1, 1: 2, 2: 3, length: 3}
new CustomArray(1)[0] // 1
console.log([...new CustomArray(1, 2, 3)]) // [1, 2, 3]
```

OK！现在我们在此基础上实现其他的数组 API！

## push

`push` 方法会将参数列表添加进数组尾部，每添加一个元素，`length` 就递增，最后返回数组长度：

```javascript
CustomArray.prototype.push = function(...items) {
  for (let i of items) {
    this[this.length] = i
    this.length++
  }
  return this.length
}
const arr = new CustomArray(1, 2, 3)
console.log(arr.push(4)) // 4
console.log(arr) // {0: 1, 1: 2, 2: 3, 3: 4, length: 4}
```

`push` 方法会将元素添加到数组堆栈的末尾，如果发现原本分配给数组的内存空间已经装不下新元素，就会新开辟一个 `oldstack.length * 1.5-1` 的空间，将旧的信息复制到新空间，如果一开始使用 `new Array(length)` 分配了一定大小的空间给数组，将会减少申请新空间的次数，提升性能。

## pop

`pop` 用于删除数组最后一个元素，它要做的事情如下：

- `length` 自减。
- 删除下标 `length-1` 的元素。
- 返回被删除的元素。

```javascript
CustomArray.prototype.pop = function() {
  this.length--
  const removedElement = this[this.length]
  delete this[this.length]
  return removedElement
}
const arr = new CustomArray(1, 2, 3)
console.log(arr.pop()) // 3
console.log(arr) // {0: 1, 1: 2, length: 2}
```

## shift

`shift` 方法从数组中删除第一个元素，它要做的事情如下：

- `length` 自减。
- 将除了第一个之外的所有元素下标自减。
- 返回被删除的元素，如果数组为空返回 `undefined`。

```javascript
CustomArray.prototype.shift = function() {
  this.length--
  const removedElement = this[0]
  for (let i = 1; i <= this.length; i++) {
    this[i - 1] = this[i]
  }
  delete this[this.length]
  return removedElement
}
const arr = new CustomArray(1, 2, 3, 4, 5, 6)
console.log(arr.shift()) // 1
console.log(arr) // {0: 2, 1: 3, 2: 4, 3: 5, 4: 6, length: 5}
```

:::tip Notice
虽然我们实现了 `shift` 的功能，但在数组过于庞大的情况下，这个 `shift` 无疑是低效的，因此这并不是 V8 引擎的解决方案。实际上只需要调整数组所存放的内存地址释放第一个元素就好了，而不需要做所谓的“全部元素向左平移”。
:::

## unshift

`unshift` 将元素添加到数组的开头，它要做的事情如下：

- `length` 增加相应长度。
- 接收一个或多个元素并插入到数组头部。
- 返回 `length` 值。

```javascript
CustomArray.prototype.unshift = function(...args) {
  const oldLen = this.length
  const argLen = args.length
  this.length += argLen
  for (let i = oldLen - 1; i >= 0; i--) {
    // 已存在的元素后移
    this[i + argLen] = this[i]
  }
  for (let i = 0; i < argLen; i++) {
    this[i] = args[i]
  }
  return this.length
}
const arr = new CustomArray(4, 5)
console.log(arr.unshift(2, 3)) // 4
console.log(arr) // {0: 2, 1: 3, 2: 4, 3: 5, length: 6}
```

`unshift` 和 `shift` 一样采取的是重新分配内存的策略而不是通过移动索引。

`unshift` 和 `push` 虽然都会引起堆栈溢出，但由于 `unshift` 是将元素添加到数组开头，所以必然会导致内存的重新分配和数据复制(将旧数组的数据)复制到新分配的内存中，而 `push` 只是在添加了一定元素的时候会发生这样的情况。

## map

`map` 方法会创建一个新数组，其结果是数组中的每个元素是调用一次提供的函数后的返回值，它要做的事情如下：

- 接收一个回调函数 `callback`，该函数执行后的返回值作为元素的新值，`callback` 接受一个必要参数 `currentValue` 为当前处理的数组元素，接收两个可选参数 `index` 和 `array`，分别是当前处理元素的索引和数组本身。
- 接收一个 `thisArg` 作为执行 `callback` 时的 `this` 指向。
- 返回原数组每个元素执行回调函数后的结果组成的新数组。

```javascript
CustomArray.prototype.map = function(callback, thisArg) {
  const arr = thisArg || this
  if (typeof callback !== 'function') {
    throw new TypeError(`${callback} is not a function`)
  }
  const result = new CustomArray()
  for (let i = 0; i < arr.length; i++) {
    let res = callback.call(arr, arr[i], i, arr)
    result.push(res)
  }
  return result
}
const arr = new CustomArray(1, 2, 3)
const newArr = arr.map((item) => item * 2)
console.log(arr) // {0: 1, 1: 2, 2: 3, length: 3}
console.log(newArr) // {0: 2, 1: 4, 2: 6, length: 3}
```

## reduce

`reduce` 方法对数组中每一个元素执行一次回调函数 `callback`，将结果汇总并返回，它要做的事情如下：

- `callback` 函数接收四个参数 `acc` 累加器，`cur` 当前值，`idx` 当前索引，`src` 源数组，`callback` 的执行结果将分配给累加器。
- 接受一个可选参数 `initialValue` 作为累加器的初始值，如果没有提供，默认使用数组第一个参数。
- 返回累加器的结果。

```javascript
CustomArray.prototype.reduce = function(callback, initialValue) {
  if (this.length === 0) {
    throw TypeError('Reduce of empty array with no initial value')
  }
  let acc = initialValue || this[0]
  for (let i = 1; i < this.length; i++) {
    let cur = this[i]
    acc = callback(acc, cur, i, this)
  }
  return acc
}
const arr = new CustomArray(1, 2, 3)
const result = arr.reduce((acc, cur) => acc + cur)
console.log(result) // 6
```

## slice

`slice` 方法返回一个新的数组对象，对象是一个由 `begin` 和 `end` 决定的原数组的浅拷贝(包括 `begin`，不包括 `end`)。

`slice` 方法要做的事情如下：

- 接受一个可选参数 `begin`，如果为负数，则表示倒数第几个元素；如果超出数组索引范围，返回空数组；如果没有，则默认为是 0。
- 接受一个可选参数 `end`，取值规则与 `begin` 一样，但如果省略或大于数组索引范围，则默认为数组末尾。
- 提取索引范围在 `begin` 和 `end` 之间的元素，放入新数组中并返回。

:::tip Notice
`slice` 方法会把 `begin` 和 `end` 的值先转化为整数，因此 `arr.slice(false, true)` 实际上等同于 `arr.slice(0,1)`。
:::

```javascript
CustomArray.prototype.slice = function(begin, end) {
  const len = this.length
  // len是Infinity或没有传值(undefined)的时候默认为数组末尾
  if (end === Infinity || end === undefined) end = len
  // 转换成整数
  begin = parseInt(begin)
  end = parseInt(end)
  const result = new CustomArray()
  // begin如果是NaN，置为0；大于等于数组长度直接返回空数组；如果小于0，-n就换算为倒数第n个，最小值为0
  if (Number.isNaN(begin)) {
    begin = 0
  } else if (begin >= len) {
    return result
  } else if (begin < 0) {
    begin = len + begin
    begin < 0 && (begin = 0)
  }
  // end如果是NaN，置为0；大于等于数组长度置为数组长度；如果小于0，-n就换算为倒数第n个，最小值为0
  if (Number.isNaN(end)) {
    end = 0
  } else if (end >= len) {
    end = len
  } else if (end < 0) {
    end = len + end
    end < 0 && (end = 0)
  }
  for (let i = begin; i < end; i++) {
    result.push(this[i])
  }
  return result
}
const arr = new CustomArray(1, 2, 3, 4)
console.log(arr.slice()) // {0: 1, 1: 2, 2: 3, 3: 4, length: 4}
console.log(arr.slice(1, -1)) // {0: 1, 1: 2, 2: 3, length: 3}
```

## splice

`splice` 方法通过删除或替换现有元素或者原地添加新的元素来修改原数组，并以数组形式返回被修改的内容。

`splice` 做了这些事情：

- 接收参数 `start`，指修改的开始位置，如果超出了数组的长度，则从数组末尾添加内容；如果是负数，则表示数组末尾开始第几位；如果负数绝对值大于数组长度，则为 0。
- `deleteCount` 是一个整数，表示要移除的元素的个数，如果 `deleteCount` 大于 `start` 之后的元素总数，则删除后面的全部元素。如果省略该参数，或它的值大于等于 `array.length - start`，那么 `start` 之后的元素都会被删除。如果是 0 或者负数，则不移除元素。
- 接收若干个元素，将元素从 `start` 位置开始添加进数组。
- 返回被删除元素组成的数组

```javascript
CustomArray.prototype.splice = function(start, deleteCount, ...restArgs) {
  const result = new CustomArray()
  const removedList = new CustomArray()
  let len = this.length
  const addLen = restArgs.length
  let i
  // 如果start大于数组长度或等于Infinity，置为数组长度
  if (start > len || start === Infinity) start = len
  start = parseInt(start)
  // 如果deleteCount为Infinity，置为数组长度
  if (deleteCount === Infinity) deleteCount = len
  deleteCount = parseInt(deleteCount)

  // 如果start为NaN，置为0；如果小于0，如-n，则为数组倒数第n个，也就是 len+start，最小为0
  if (Number.isNaN(start)) {
    start = 0
  } else if (start < 0) {
    start = len + start
    if (start < 0) start = 0
  }
  // 如果deleteCount为NaN或小于-则置为0，如果deleteCount大于len-start，就把start后面全部元素删掉，置为len-start
  if (Number.isNaN(deleteCount) || deleteCount < 0) {
    deleteCount = 0
  } else if (deleteCount > len - start) {
    deleteCount = len - start
  }
  // 先将start前面不需要更改的元素push进result
  for (i = 0; i < start; i++) {
    result.push(this[i])
  }
  // 再将需要插入的元素push进result
  for (i = 0; i < addLen; i++) {
    result.push(restArgs[i])
  }
  // 将需要删除的元素push进removedList
  for (i = start; i < start + deleteCount; i++) {
    removedList.push(this[i])
  }
  // 将数组后面剩下的元素，push进result
  for (i = start + (deleteCount || 0); i < len; i++) {
    result.push(this[i])
  }

  let resLen = result.length
  this.length = resLen
  while (resLen--) {
    this[resLen] = result[resLen]
  }

  return removedList
}
```

## flat

`flat` 方法用于扁平化数组，也就是减少数组内部的子数组嵌套。它要做的事情如下：

- 接收一个参数 `depth`，表示提取嵌套数组的结构深度，默认为 1。
- 通过递归找到对应层次的数组并扁平化。
- 返回扁平化后的数组。

由于我们的自定义数组 `CustomArray` 不适合扁平化，因此这里仅仅是改写 `Array` 的 `flat` 方法。

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)有多个方法可以替代 `flat`，这里只展示其中一个：

```javascript
Array.prototype.customFlat = function(depth = 1) {
  const result = []
  !(function flat(list, depth) {
    for (let item of list) {
      if (Array.isArray(item) && depth > 0) {
        flat(item, depth - 1)
      } else {
        item !== void 0 && result.push(item)
      }
    }
  })(this, depth)
  return result
}
const a = [1, [2, 3, 4, 5], [1, 2, 3, [4, 5, [6]]]]
console.log(a.customFlat(1)) // [1, 2, 3, 4, 5, 1, 2, 3, [4, 5, [6]]]
```

## 结论

我们在上面实现了许多JS数组常用的方法，不得不说，想实现它们并不难

## 参考文章

- [Creating your own implementation of Array](https://ui.dev/creating-your-own-array/)
- [Write Your Own Reduce Function JavaScript](https://dev.to/thomas_hoadley/write-your-own-reduce-function-javascript-2953)
- [Alternate method to splice function in JavaScript](https://stackoverflow.com/questions/6515385/alternate-method-to-splice-function-in-javascript)