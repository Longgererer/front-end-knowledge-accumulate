# ES6 class

在 `class` 之前，我们一般使用 "**构造函数**" 构建对象。现在有了 `class`，我们可以更好地进行面向对象编程。

这是一个简单的 ES5 构造函数：

```js
function User(name, gender) {
  this.name = name
  this.gender = gender
}

const tom = new User('Tom', 'male')
```

:::tip Notice
在 JavaScript 中，所谓的构造函数与其他语言如 Java 并无相同之处，仅仅是因为该函数被 `new` 调用才叫做构造函数。
:::

这是 ES6 class 版本的：

```js
class User {
  constructor(name, gender) {
    this.name = name
    this.gender = gender
  }
}
const tom = new User('Tom', 'male')
```

`class` 实际上是一种特殊的函数，就像你能够定义的函数表达式和函数声明一样，类语法有两个组成部分：类表达式和类声明。

```js
// 类声明
class User {}
// 类表达式
const User = class {}
// 类也是函数
console.log(typeof User) // function
// 并且类本身就指向构造函数
User === User.prototype.constructor // true
```

:::tip Notice
类和函数有一个重要的不同就是：函数存在声明提升，而类不会，你必须在类声明了之后再实例化。
:::

实例的属性除非显式定义在其本身（即定义在 `this` 对象上），否则都是定义在原型上（即定义在 `class` 上）：

```js
//定义类
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  toString() {
    return '(' + this.x + ', ' + this.y + ')'
  }
}
var point = new Point(2, 3)
point.toString() // (2, 3)
point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
```

## 构造函数

`constructor` 方法用于创建和初始化一个由 `class` 创建的对象，当通过 `new` 调用时，会自动调用该方法。

:::tip Notice
一个类必须拥有 `constructor` 方法！如果没有显式定义，则会默认添加一个返回当前实例对象 `this` 的 `constructor`。
:::

## getter&setter

与 ES5 一样，在 `class` 的内部可以使用 `get` 和 `set` 关键字，对某个属性设置存值函数和取值函数，拦截该属性的存取行为。

```js
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter'
  }
  set prop(value) {
    console.log('setter: ' + value)
  }
}
let inst = new MyClass()
inst.prop = 123 // setter: 123
inst.prop // 'getter'
```

## `static`

静态方法调用直接在类上进行，不能在类的实例上调用。静态方法通常用于创建实用程序函数，**静态方法不会被子类继承**。

```js
class User {
  static staticMethod() {
    console.log('This is a static method')
  }
}
const Tom = new User()
Tom.staticMethod() // error: Tom.staticMethod is not a function
User.staticMethod() // log: This is a static method
```

静态方法调用同一个类中的其他静态方法，可使用 `this` 关键字，但在非静态方法中，不能直接使用 `this` 关键字来访问静态方法。而是要用类名来调用：

```js
class User {
  constructor() {
    this.method()
  }
  method() {
    User.staticMethod1()
  }
  static staticMethod1() {
    this.staticMethod2()
  }
  static staticMethod2() {
    console.log('This is static method 2')
  }
}
new User() // log: This is static method 2
```

**静态属性**（ES7）：同 ES6 的静态方法声明方式，可以在 `Class` 内部声明，声明方式为在属性声明前加上 `static` 关键字：

```js
//ES6:
class Foo {}
Foo.prop = 1 //静态属性（类的属性）

//ES7:
class Foo {
  static prop = 1 //静态属性
}

class MyClass {
  static myStaticProp = 42
  constructor() {
    console.log(MyClass.myProp) // 42
  }
}
```

## 类的 `prototype` 属性和 `__proto__` 属性

大多数浏览器的 ES5 实现之中，每一个对象都有 `__proto__` 属性，指向对应的构造函数的 `prototype` 属性。`Class` 作为构造函数的语法糖，同时有 `prototype` 属性和 `__proto__` 属性，因此同时存在两条继承链。

子类的 `__proto__` 属性，表示构造函数的继承，总是指向父类。子类 `prototype` 属性的 `__proto__` 属性，表示方法的继承，总是指向父类的 `prototype` 属性。

## `super`

`super` 可以当作函数使用：

```js
class Parent {}
class Child extends Parent {
  constructor() {
    super()
  }
}
```

ES5 的继承，实质是先创造子类的实例对象 `this`，然后再将父类的方法添加到 `this` 上面，而在 ES6 中，子类想要继承父类，必须调用 `super`，实质是先将父类实例对象的属性和方法，加到 `this` 上面（所以必须先调用 `super` 方法），然后再用子类的构造函数修改 `this`。因此，当你在子类构造函数中操作 `this` 的代码必须写在 `super` 后面。

执行了 `super` 就是执行了父类构造函数，但 `super` 内部的 `this` 指向的是子类，`super` 执行后返回的也是子类的实例，因此相当于执行 `Parent.prototype.constructor.call(this)`

`super` 也可以调用父类上的静态方法，但只有在子类的静态方法上才可以这么做，非静态方法中还是要通过父类名字调用静态方法：

```js
class Parent {
  constructor() {}
  method() {
    console.log('This is a method from parent')
  }
  static staticMethod() {
    console.log('This is a staticMethod from parent')
  }
}
class Child extends Parent {
  constructor() {
    super()
    super.method()
  }
  static staticChildMethod() {
    super.staticMethod()
  }
}
new Child() // This is a method from parent
Child.staticChildMethod() // This is a staticMethod from parent
```

可以在子类的静态方法中调用父类的静态方法，此时 `super` 指向的是父类本身。在子类普通方法和 `constructor` 中可以调用父类的普通方法，此时 `super` 指向的是父类的原型。

**通过 `super` 调用父类方法时，`super` 会绑定子类的 `this`**。

```js
class Parent {
  constructor() {
    this.x = 1
  }
  method() {
    console.log(this.x)
  }
}
class Child extends Parent {
  constructor() {
    super()
    this.x = 2
    super.method()
  }
}
new Child() // log: 2
```

因此，如果使用 `super` 对属性赋值，那么改变的将是子类的属性而不是父类属性：

```js
class Parent {
  constructor() {
    this.x = 1
  }
}
class Child extends Parent {
  constructor() {
    super()
    this.x = 2
    super.x = 3
    console.log(this.x) // 3
  }
}
new Child()
```

直接输出 `super` 是会报错的，因为 JS 引擎不知道 `super` 是作为函数调用还是作为对象使用。

```js
class Parent {}
class Child extends Parent {
  constructor() {
    console.log(super) // error
  }
}
```

### super 只能在类中使用么？

不是，`super` 还可以在对象字面量中使用：

```js
const obj1 = {
  method1() {
    console.log("method 1");
  }
}

const obj2 = {
  method2() {
   super.method1();
  }
}

Object.setPrototypeOf(obj2, obj1);
obj2.method2(); // logs "method 1"
```

## 公共字段

可以在类中声明公共字段。

```js
class Rectangle {
  height = 0 // 初始化的公共字段
  width // 未初始化的公共字段
  static bgc = '#FFFFFF' // 静态公共字段
  constructor(height, width, bgc) {
    this.height = height
    this.width = width
    Rectangle.bgc = bgc
  }
}
const rectangle = new Rectangle(12, 21)
console.log(rectangle.height) // log: 12
```

## 私有字段

私有字段使用 `#` 开头，只能在类的内部进行调用，而不能在类之外引用。

```js
class Rectangle {
  #height = 0
  #width
  constructor(height, width) {
    this.#height = height
    this.#width = width
  }
  getHeight() {
    return this.#height
  }
}
const rectangle = new Rectangle(12, 21)
console.log(rectangle.#height) // error: Private field '#height' must be declared in an enclosing class
console.log(rectangle.getHeight()) // log: 12
```

除了这个新特性之外，还有几种方法可以实现：

```js
class SimCard {
  constructor(number, type, pinCode) {
    this.number = number
    this.type = type
    let _pinCode = pinCode
    // this property is intended to be a private one
    this.getPinCode = () => {
      return _pinCode
    }
  }
}
const card = new SimCard('444-555-666', 'Nano SIM', 1515)
console.log(card._pinCode) // outputs undefined
console.log(card.getPinCode()) // outputs 1515
```

在 JS 界约定俗成使用 `_` 开头作为私有属性，然后配合 `getter` 实现私有属性机制。

也可以使用 `Symbol` 定义唯一属性来实现：

```js
const SimCard = (() => {
  const _pinCode = Symbol('PinCode')
  class SimCard {
    constructor(number, type, pinCode) {
      this.number = number
      this.type = type
      this[_pinCode] = pinCode
    }
    get pinCode() {
      return this[_pinCode]
    }
  }
  return SimCard
})()
const card = new SimCard('444-555-666', 'Nano SIM', 1515)
console.log(card._pinCode) // outputs undefined
console.log(card.pinCode) // outputs 1515
```

不过外部仍然可以使用 `Object.getOwnPropertySymbols(SimCard)` 来获取使用 `Symbol` 定义的属性。

## `new.target`

`new.target` 属性允许你检测函数和或者构造方法是否是通过 `new` 被调用的，如果是 `new` 调用的，`new.target` 就会返回一个指向构造方法或函数的引用。在普通函数调用中，`new.target` 的值是 `undefined`。

```js
function User() {
  if (new.target === undefined) {
    console.log('没有使用new调用')
  } else {
    console.log(new.target === User) // true
  }
}
```

但在有子类继承父类时，实例化子类时 `new.target` 会返回子类，因此可以用来写出不能独立使用、必须继承后才能使用的类：

```js
class Parent {
  constructor(){
    if(new.target === Parent) {
      throw new Error('本类不能被实例化！')
    }
  }
}
class Child extends Parent {
  constructor{
    super()
  }
}
new Parent() // 报错：本类不能被实例化！
new Child() // 正确
```

## 内部实现

我们知道 JavaScript 中所谓的 `class` 不过是一个语法糖而已，与 Java 的 `class` 完全不同。那么 JavaScript 的 `class` 是如何实现的呢？

在此之前，如果不明白 `new` 做了什么，可以看 [new 绑定](./this指向.html#new-绑定)。

我们知道在 ES5 中经过 `new` 调用的构造函数产生的实例会把 `__proto__` 指向构造函数的 `prototype`，如果是 ES6 的 `class` 呢？

```js
class User {
  constructor(name) {
    this.name = name
  }
}
const tom = new User('Tom')
console.log(tom.__proto__ === User.prototype) // true
console.log(tom.__proto__.constructor === User) // true
```

因此，`new` 调用构造函数和类产生的结果都是相同的。只是一个指向构造函数本身，一个指向类。

我们在 ES5 中可以使用原型链继承属性和方法：

```js
function User(name) {
  this.name = name
}
User.prototype.getName = function () {
  return this.name
}
const tom = new User('tom')
console.log(tom.getName()) // log: tom
```

上面的代码在 ES6 `class` 中可以等同于：

```js
class User {
  constructor(name) {
    this.name = name
  }
  getName() {
    return this.name
  }
}
const tom = new User('tom')
```

## 箭头函数和普通函数

我们知道类中可以定义箭头函数也可以定义普通函数：

```js
class A {
  constructor() {}
  b() {}
  c = () => {}
}
```

但实际上两者完全不同，我们来看一个例子：

```js
class A {
  constructor() {}
  b() {}
  c = () => {}
}
const d = new A()
const e = new A()
console.log(d.b === e.b) // true
console.log(d.c === e.c) // false
```

在类中箭头函数的定义实际上会变成：

```js
class A {
  constructor() {
    this.c = () => {}
  }
}
A.prototype.b = function () {}
```

也就是说，箭头函数和普通属性的行为一样，每创建一个子类都会重新定义，而普通函数则是定义在类的原型上的。

## 总结

`class` 的本质还是 ES5 的原型链和构造函数，但是比原来的语法更加方便。`class` 没有声明提升，也不能覆写，但是函数有声明提升，也可以覆写。

## 参考文章

- [class-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [理解 es6 class 中 constructor 方法 和 super 的作用](https://juejin.cn/post/6844903638674980872)
- [阮一峰 ECMAScript 6 (ES6) 标准入门教程 第三版](https://www.bookstack.cn/read/es6-3rd/spilt.6.docs-class.md)
- [详解 ES6 关键字 Class](https://zhuanlan.zhihu.com/p/365598749)
- [JavaScript ES6 类的静态方法、属性和实例方法、属性](https://www.jianshu.com/p/d886052ac98c)
- [一万字 ES6 的 class 类，再学不懂，请把我锤死（语法篇）](https://juejin.cn/post/7000891889465425957)
- [一万字 ES6 的 class 类，再学不懂，请把我锤死（继承篇）](https://juejin.cn/post/7001284277291712526)
