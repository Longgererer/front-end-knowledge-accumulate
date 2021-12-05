# 一些重要 API 的实现

## `new`

`new` 操作符行为如下：

1. 创建一个全新的空对象。
2. 将对象的 `__proto__` 指向构造函数的 `prototype`。
3. 将构造函数的 `this` 绑定到该对象上并执行
4. 如果执行结果返回的是一个对象，就正常返回；如果不是就返回全新的对象。

```javascript
function customNew(constructor, ...args) {
  if (typeof constructor !== 'function') throw 'constructor is not a function'
  const obj = Object.create(constructor.prototype)
  // 等于
  // const obj = {}
  // obj.__proto__ = constructor.prototype
  const res = constructor.apply(obj, args)
  return res instanceof Object ? res : obj
}
```

## `Object.create()`

`Object.create` 接受两个参数：

1. `proto` 是需要继承的原型对象。
2. `propertiesObject` 是需要添加到原型对象中的属性集合。该属性遵从 `defineProperties` 第二个参数的格式。

在第一个参数为 `null` 的时候，`Object.create` 会返回一个没有 `__proto__` 属性(为 `null`)的对象。

在第一个参数不为 `null` 时，生成对象的 `__proto__` 就会指向传入的 `proto`。

```javascript
function customCreate(proto, propertiesObject = {}) {
  if (typeof proto !== 'object') throw 'Object prototype may only be an Object or null'
  const obj = {}
  obj.__proto__ = proto
  Object.defineProperties(obj, propertiesObject)
  return obj
}
```

## `instanceof`

`instanceof` 会检测左边的对象是否为右边对象的实例，实际上就是判断：

```javascript
left.__proto__ === right.prototype
```

并且会沿着原型链寻找。

```javascript
function F() {}
const obj = new F()
console.log(obj instanceof F) // true
console.log(obj instanceof Object) // true
```

因此我们需要利用循环沿着原型链向上寻找：

```javascript
function customInstanceof(left, right) {
  let proto = left.__proto__
  while (true) {
    if (proto === null) return false
    if (proto === right.prototype) return true
    proto = proto.__proto__
  }
}
```
