# Object 常用 API 和原理

## Object.assign

用法：**`Object.assign(target:object, ...sources:object[])`**

`Object.assign` 可以合并对象的属性，也是进行浅复制的常用方法，我们可以在许多场合使用它们：

```javascript
class A {
  constructor(x, y) {
    Object.assign(this, { x, y })
  }
}
// OR
Object.assign(A.prototype, { b: 1 }) // 在原型上添加属性
```

### Object.assign & Object Spread Initializer

tc39 在 [Object Spread Initializer](https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md) 文章中明确指出了：

```javascript
let aClone = { ...a }
// 等同于
let aClone = Object.assign({}, a)

let xyWithAandB = { x: 1, ...a, y: 2, ...b, ...a }
// 等同于
let xyWithAandB = Object.assign({ x: 1 }, a, { y: 2 }, b, a)
```

但 `Object.assign` 和 `{...obj}` 还是有区别的：

```javascript
const obj = { a: 1 }
{...obj, b: 2} === obj // false
Object.assign(obj, { b: 2 }) === obj // true
Object.assign({ b: 2 }, obj) === obj // false
```

可以看出对象扩展符返回的全新的对象，而 `Object.assign` 返回的是传递的第一个对象，因此 `Object.assign` 可以触发第一个对象的 `setter`：

```javascript
class A {
  set b(newB) {
    console.log(`b的新值为${newB}`)
    return newB
  }
}
Object.assign(new A(), { b: 1 }) // log: b的新值为1
```

#### Object.assign or Object Spread Initializer ?

由于 `Object.assign` 可能触发 `setter`，我认为这是一种**副作用**，会产生一些意料之外的问题；如果需要的是全新的对象而不是修改已存在的对象，那么建议使用对象扩展符，因为它**更快**，反之可以使用 `Object.assign`。

## Object.create

用法：**`Object.create(prototypeObj:object|null, propertiesObj?:object)`**

`Object.create` 是 ES6 中创建对象的新方法。

当第一个参数为 null 的时候，创建一个没有原型(`__proto__`)的对象，因此该对象无法使用 `Object.prototype` 上的任何方法，是一个纯粹的数据存储对象：

```javascript
Object.create(null) // {}
```

也可以基于原型创建对象来实现继承：

```javascript
const prototype = {
  a: 1,
  b: () => console.log('execute b'),
}
const obj = Object.create(prototype)
obj.a // 1
obj.b() // log: execute b
```

第二个参数用来定义包含描述符的属性：

```javascript
const prototype = {
  a: 1,
  b: () => console.log('execute b'),
}
const obj = Object.create(null, {
  c: {
    value: 'c',
    writable: true,
    enumerable: true,
  },
})
obj // {c: 'c'}
```

::: warning
不要认为 `Object.create` 可以继承原型就可以替代 `new` 操作符，因为 `new` 操作符可不仅仅是继承原型而已，还会执行 `constructor`。
:::

### Object.create() & new Object({}) & {}

在只考虑结果而不考虑程序内部具体执行情况时：

`Object.create(Object.prototype)` = `new Object({})` = `{}`

## Object.entries

用法：**`Object.entries(obj:object)`**

这个方法会遍历对象中的可枚举属性，然后返回一个包含多个键值对的二维数组：

```javascript
const obj = { a: 1, b: 2 }
Object.entries(obj) // [['a',1],['b',2]]
```

因此我们可以使用 `for...of` 来遍历这个二维数组：

```javascript
for (let [key, value] of Object.entries(obj)) {
  //...
}
```

也可以转换为 `Map`：

```javascript
new Map(Object.entries(obj)) // Map {a:1,b:2}
```

## Object.defineProperty

用法：**`Object.defineProperty(obj:object, prop:string|symbol, descriptor:object)`**

`defineProperty` 方法可以为目标对象添加或修改一个属性，并设置属性的描述符，最后返回目标对象本身。

`descriptor` 对象包含 6 个属性：

**`configurable`** (`default: false`) ➡ 属性是否可以被**删除**或使用 `defineProperty` **重新定义**。

**`enumerable`** (`default: false`) ➡ 属性是否可**枚举(循环遍历)**。

**`writable`** (`default: false`) ➡ 属性是否可以**被赋值运算符改变**。

**`get`** (`default: undefined`) ➡ 属性被访问时调用的函数。

**`set`** (`default: undefined`) ➡ 属性被修改时调用的函数。

**`value`** (`default: undefined`) ➡ 属性对应的值，可以是任何有效的 JavaScript 值。

需要**注意**的地方:

在 `writable` 为 `true` 时，仍然可以通过 `defineProperty` 重新配置属性：

```javascript
const obj = {}
Object.defineProperty(obj, 'a', {
  value: 1,
  configurable: false,
  writable: true,
})
Object.defineProperty(obj, 'a', { value: 2 }) // success
```

反之，`writable` 为 `false` 时，如果 `configurable` 为 `true`，那么仍然可以通过 `defineProperty` 修改属性的值。

## Object.hasOwnProperty

用法：**`Object.hasOwnProperty(prop:string|symbol)`**

该方法返回一个布尔值，表示对象是否**直接**含有该名称的属性，名称可以是字符串或 `symbol`。

::: tip Notice
`hasOwnProperty` 只会遍历查找直接子属性而忽略 `__proto__` 上的属性。
:::

```javascript
const obj = { a: 1 }
obj.hasOwnProperty('a') // true
obj.hasOwnProperty('toString') // false
Object.prototype.hasOwnProperty('toString') // true
```

而 [for...in](#for-in) 会遍历所有可枚举属性（即使它们在原型链上）,`in` 同样会搜索原型链：

```javascript
function Animal(name) {
  this.name = name
}
Animal.prototype.bark = function() {
  console.log('汪汪汪')
}
const dog = new Animal('dog')
for (let key in dog) {
  console.log(key)
} // name bark
console.log('bark' in dog) // true
console.log(dog.hasOwnProperty('bark')) // false
```

## for...in

`for...in` 会遍历所有所有除了 `Symbol` 之外所有**可枚举**属性（包括原型链）。

```javascript
for (var prop in obj) {
  console.log(obj[prop])
}
```

如果你想过滤掉原型链上的属性，可以使用 `hasOwnProperty`：

```javascript
for (var prop in obj) {
  if (obj.hasOwnProperty(prop)) {
    console.log(obj[prop])
  }
}
```

## 讨论

### 如何使一个对象变成真正的常量

通过 `const` 声明的对象的属性是可以被修改的，下面有几个方法可以解决这个问题：

1. **`Object.defineProperty(obj:Object, prop:string|symbol, descriptor:Object)`**  
   通过 `Object.defineProperty` 将所有属性的 `configurable` 和 `writable` 设置为 `false`，这种方法可以让属性**不可修改、配置和删除**。
   ::: tip Notice
   如果想要对一个已经含有若干属性的对象进行处理，需要遍历对象来对每个属性进行配置，`enumerable` 为 `false` 的属性不会被遍历到，因此仍然可以被修改。
   :::

2. **`Object.preventExtensions(obj:Object)`**  
   `Object.preventExtensions` 将**禁止对象添加新属性，但可以删除、修改和配置现有属性**。

3. **`Object.seal(obj:Object)`**  
   `preventExtensions` 的升级版，它会在对象上调用 `preventExtensions` 并把每个属性的 `configurable` 置为 `false`，仍然可以修改属性值。

4. **`Object.freeze(obj:Object)`**  
   `seal` 的升级版，它会在对象上调用 `seal` 并把每个属性的 `writable` 置为 `false`，是级别最高的不可变性。

::: tip Notice
`Object.freeze` 是**浅冻结**，如果对象中包含了其他嵌套的子对象，那么你需要遍历到这些引用的对象并执行 `Object.freeze` 以实现深冻结。
:::

## 参考资料

- [Object.assign vs Object Spread in Node.js](https://thecodebarbarian.com/object-assign-vs-object-spread.html)  
- [Object.create in JavaScript](https://medium.com/@happymishra66/object-create-in-javascript-fa8674df6ed2)  
- [Understanding the difference between Object.create() and new SomeFunction()](https://stackoverflow.com/questions/4166616/understanding-the-difference-between-object-create-and-new-somefunction)
