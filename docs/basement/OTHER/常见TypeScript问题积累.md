# 常见 TypeScript 问题积累

## 1. 什么是 TypeScript?

TypeScript 是一个强类型的 JavaScript 超集，支持 ES6 语法，支持面向对象编程的概念，如类、接口、继承、泛型等。TypeScript 并不直接在浏览器上运行，需要编译器编译成纯 Javascript 来运行。

## 2. const 和 readonly 的区别？

1. `const` 用于变量， `readonly` 用于属性。

```ts
// type
type Foo = {
  readonly bar: number
}
// const 确保 'config' 不能够被改变了
const foo: Foo = { bar: 123 }
// 不能被改变
foo.bar = 456 // Error: foo.bar 为仅读属性

// 函数
function foo(config: { readonly num: number }) {
  // ..
}
const config = { num: 123 }
foo(config)
```

2. `const` 在运行时检查， `readonly` 在编译时检查。
3. `const` 声明的变量不得改变值，这意味着，`const` 一旦声明变量，就必须立即初始化，不能留到以后赋值； `readonly` 修饰的属性能确保自身不能修改属性，但是当你把这个属性交给其它并没有这种保证的使用者（允许出于类型兼容性的原因），他们能改变。

```ts
const foo: {
  readonly bar: number
} = {
  bar: 123,
}

function iMutateFoo(foo: { bar: number }) {
  foo.bar = 456
}

iMutateFoo(foo)
console.log(foo.bar) // 456
```

4. `const` 保证的不是变量的值不得改动，而是变量指向的那个内存地址不得改动，例如使用 `const` 变量保存的数组，可以使用 `push` ， `pop` 等方法。但是如果使用 `ReadonlyArray<number>` 声明的数组不能使用 `push` ， `pop` 等方法。

## 3. 枚举和常量枚举的区别？

1. 枚举会被编译时会编译成一个对象，可以被当作对象使用。

:::: tabs
::: tab 编译前

```ts
enum Color {
  Red,
  Green,
  Blue,
}

var sisterAn = Color.Red
console.log(sisterAn) // 0
```

:::
::: tab 编译后

```js
var Color
;(function(Color) {
  Color[(Color['Red'] = 0)] = 'Red'
  Color[(Color['Green'] = 1)] = 'Green'
  Color[(Color['Blue'] = 2)] = 'Blue'
})(Color || (Color = {}))
var sisterAn = Color.Red
```

:::
::::

可以看到 `Color` 被编译成了一个对象，包含属性：

```js
{
  "0": "Red",
  "1": "Green",
  "2": "Blue",
  "Red": 0,
  "Green": 1,
  "Blue": 2
}
```

2. `const` 枚举会在 TypeScript 编译期间被删除，`const` 枚举成员在使用的地方会被内联进来，避免额外的性能开销。

:::: tabs
::: tab 编译前

```ts
const enum Color {
  Red,
  Green,
  Blue,
}

var sisterAn = Color.Red
console.log(sisterAn) // 0
```

:::
::: tab 编译后

```js
var sisterAn = 0 /* Red */
```

:::
::::

## 4. 接口和类型别名的异同点？

1. 都可以描述对象或函数

```ts
// 接口
interface Sister {
  name: string
  age: number
}
interface SetSister {
  (name: string, age: number): void
}

// 类型别名
type Sister = {
  name: string
  age: number
}
type SetSister = (name: string, age: number) => void
```

2. 都可以扩展

`interface` 和 `type` 可以混合扩展，也就是说 `interface` 可以扩展 `type`，`type` 也可以扩展 `interface`。

但需要注意的是，接口的扩展是继承（ `extends` ）。类型别名的扩展就是交叉类型（通过 `&` 实现）。

```ts
// 接口
interface SisterAn {
  name: string
}
// 接口扩展接口
interface Sister extends SisterAn {
  age: number
}

// 类型别名
type SisterRan = {
  age: number
}
// 类型别名扩展类型别名
type SisterPro = SisterRan & {
  name: string
}

// 接口扩展类型别名
interface Sister extends SisterRan {
  name: string
}
// 类型别名扩展接口
type SisterPro = SisterAn & {
  age: number
}
```

这里需要注意的是：**接口扩展时，TypeScript 会检查扩展的接口是否可以赋值给被扩展的接口**

```ts
// 接口扩展
interface SisterAn {
  name: string
  age: string
}
interface Sister extends SisterAn {
  name: string
  age: number
}
// 报错：
//  Interface 'Sister' incorrectly extends interface 'SisterAn'.
//  Types of property 'age' are incompatible.
//  Type 'number' is not assignable to type 'string'
```

但使用交集类型时就不会出现这种情况：

```ts
// 类型别名扩展
type SisterRan = {
  name: string
  age: string
}
type SisterPro = SisterRan & {
  name: string
  age: number
}
```

**几乎接口的所有特性都可以通过类型别名来实现**，但他们仍有区别：

1. 不同的声明范围

与接口不同，可以为任意的类型创建类型别名。类型别名的右边可以是任何类型，包括基本类型、元祖、类型表达式（ `&` 或 `|` 等）；而**在接口声明中，右边必须为变量结构**。例如，下面的类型别名就不能转换成接口：

```ts
type Name = string
type Text = string | { text: string }
type Coordinates = [number, number]
```

2. 不同的扩展形式

接口是通过继承的方式来扩展，类型别名是通过 `&` 来扩展，这个在上面说过，就不贴代码了。

3. 不同的重复定义表现形式

接口可以定义多次，多次的声明会自动合并：

```ts
interface Sister {
  name: string
}
interface Sister {
  age: number
}

const sisterAn: Sister = {
  name: 'sisterAn',
}
// 报错：Property 'age' is missing in type '{ name: string; }' but required in type 'Sister'

const sisterRan: Sister = {
  name: 'sisterRan',
  age: 12,
}
// 正确
```

但是类型别名如果定义多次，会报错：

```ts
type Sister = {
  // Duplicate identifier 'Sister'
  name: string
}

type Sister = {
  // Duplicate identifier 'Sister'
  age: number
}
```

## 5. any、unknown、never 和 void 有什么区别？

`any` 类型用于描述一个我们根本不知道类型的变量，或者说可以是任意类型的变量，不作任何约束，编译时会跳过对其的类型检查。

`unknown` 表示未知类型，即写代码的时候还不知道具体会是怎样的数据类型，是 TypeScript 3.0 中引入的新类型， 与 `any` 类似，所有类型都可以分配给 `unknown` 类型。

```ts
let notSure: unknown = 'sisterAn!'

// 可以被赋值任意类型
notSure = 'sisterAn!'
notSure = 512
notSure = { hello: () => 'Hello sisterAn!' }
```

但与 `any` 不同的是， `unknown` 类型的变量不允许被 `any` 或 `unknown` 以外的变量赋值，也不允许执行 `unknown` 类型变量的方法：

```ts
let notSure: unknown = 'sisterAn'
let notSure1: unknown = 'Hello'
let any1: any = 12
let num: number = 12

notSure = notSure1
notSure = any1

num = notSure
// error: Type 'unknown' is not assignable to type 'number'.

notSure.toLowerCase()
// error: Object is of type 'unknown'.
```

要解决这个问题，可以：

```ts
// 使用类型断言缩小未知范围
let notSure: unknown = 'sisterAn'
console.log((notSure as string).toLowerCase())
```

我们仅在 `notSure` 为 `string` 类型时，才执行 `toLowerCase` 方法，TypeScript 编译器会理解这一点，并假设类型。

`never`，永不存在的值的类型，是 TypeScript 2.0 中引入的新类型。我们知道变量一旦声明，都会默认初始化为 `undefined` ，但这不是永不存在的值，但其实有一些场景，值会永不存在，例如，那些总是会抛出异常或函数中执行无限循环的代码（死循环）的函数返回值类型：

```ts
// 抛出异常
function error(msg: string): never {
  throw new Error(msg)
} // 抛出异常会直接中断程序运行，这样程序就运行不到返回值那一步了，即具有不可达的终点，也就永不存在返回了

// 死循环
function loopForever(): never {
  while (true) {}
} //同样程序永远无法运行到函数返回值那一步，即永不存在返回
```

变量也可以声明为 `never` 类型，因为它是永不存在值的类型，所以任何类型都不能赋值给 `never` 类型（除了 `never` 本身之外）。即使 `any` 也不可以赋值给 `never`：

```ts
let never1: never

// any 也不能分配给 never
let any1: any = 'sisterAn'
never1 = any1 // Error

// 作为函数返回类型的 never
let never2: never = (() => {
  throw new Error('Throw error')
})()

never1 = never2
```

`void` 某种程度上来说正好与 `any` 相反，表示无任何类型，没有类型，如果是函数则应没有返回值或者返回 `undefined` ：

```ts
function hello(): void {
  console.log('Hello sisterAn')
}
```

也可以声明一个 `void` 类型的变量，不过你只能为它赋予 `undefined` 、 `null` （注意，`"strictNullChecks": true` 时会报错）和 `void` 类型的值：

```ts
let void1: void
let null1: null = null
let und1: undefined = undefined
let void2: void

void1 = void2
void1 = und1
void1 = null1 // Type 'null' is not assignable to type 'void'.
```

## 6. TypeScript 中的 this 和 JavaScript 中的 this 有什么差异？

TypeScript：`noImplicitThis: true` 的情况下，必须去声明 `this` 的类型，才能在函数或者对象中使用 `this`。箭头函数的 `this` 和 ES6 中箭头函数中的 `this` 是一致的。

## 7. TypeScript 中使用 Union Types 时有哪些注意事项？

属性或方法访问: 当 TypeScript 不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型里共有的属性或方法。

```ts
function getLength(something: string | number): number {
  return something.length
}
// index.ts(2,22): error TS2339: Property 'length' does not exist on type >'string | number'.
// Property 'length' does not exist on type 'number'.

function getString(something: string | number): string {
  return something.toString()
}
// 公共方法和属性可以访问
```

## 8. TypeScript 如何设计 Class 的声明？

```ts
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  greet(): string {
    return 'Hello, ' + this.greeting
  }
}
let greeter = new Greeter('world')
```

## 9. TypeScript 中如何联合枚举类型的 Key?

```ts
enum str {
  A,
  B,
  C,
}
type strUnion = keyof typeof str
// 相当于
type strUnion = 'A' | 'B' | 'C'

const a: strUnion = 'A'
const b: strUnion = 'D' // Type '"D"' is not assignable to type '"A" | "B" | "C"'.
```

## 10. ?. 可选链是什么？

ES11（ES2020）新增的特性，TypeScript 3.7 支持了这个特性。

```ts
var age = user && user.info && user.info.getAge && user.info.getAge()
```

使用可选链代替：

```ts
var age = user?.info?.getAge?.()
```

TypeScript 在尝试访问 `user.info` 前，会先尝试访问 `user` ，`user` 既不是 `null` 也不是 `undefined` 才会继续往下访问，如果 `user` 是 `null` 或者 `undefined`，则表达式直接返回 `undefined`。

## 11. ?? 空值合并运算符是什么？

ES12（ES2021）新增的特性，TypeScript 3.7 支持了这个特性，当左侧的操作数为 `null` 或者 `undefined` 时，返回其右侧操作数，否则返回左侧操作数。

```ts
var user = { level: null }
var level1 = user.level ?? '暂无等级' // level1 -> '暂无等级'
var level2 = user.other_level ?? '暂无等级' // level2 -> '暂无等级'
```

与逻辑或操作符（`||`） 不同，`||` 会在左侧操作数为 `falsy` 值（例如，`''` 或 `0`）时返回右侧操作数。也就是说，如果使用 `||` 来为某些变量设置默认值，可能会遇到意料之外的行为：

```ts
var user = { level: 0 }
var level1 = user.level || '暂无等级' // level1 -> 暂无等级
var level2 = user.level ?? '暂无等级' // level2 -> 0
```

## 12 ?: 可选参数和属性符是什么？

TypeScript 特有的，在 TypeScript 2.0 支持了这个特性，可选参数和属性会自动把 `undefined` 添加到他们的类型中，即使他们的类型注解明确不包含 `undefined` 。例如，下面两个类型是完全相同的：

```ts
// 使用--strictNullChecks参数进行编译
type T1 = (x?: number) => string // x的类型是 number | undefined
type T2 = (x?: number | undefined) => string // x的类型是 number | undefined
```

在 TypeScript 里，我们使用 `?:` 最多的情况是在接口中，通常：

```ts
interface Point {
  x: number
  y: number
}

let point: Point
point = { x: 1, y: 2 }
```

其中 `point` 中的两个属性 `x` 、 `y` 都是必须的，如果赋值时缺少任意一个就会报错。

但接口里的属性不全都是必需的。有些是只在某些条件下存在，或者根本不存在。 所以，这里就需要可选属性（ `?.` ），即属性是**可选的**。

```ts
interface Point {
  x: number
  y: number
  z?: number // 可选属性
}

let point: Point
point = { x: 1, y: 2 }
```

在 TypeScript 有两个内置的工具泛型可以帮助我们处理接口的可选操作：

- `Partial` ：把接口中的所有属性变成可选的。
- `Required` ：将接口中所有可选的属性改为必须的。

`Partial` 的作用即把类型中的所有属性变成可选的：

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface Point {
  x: number
  y: number
}

type PartialPoint = Partial<Point>

// PartialPoint 相当于：
// type PartialPoint = {
//     x?: number;
//     y?: number;
// }
// 所有属性均变成可选
```

`Required` 的作用刚好与 `Partial` 相反，就是将接口中所有可选的属性改为必须的，区别就是把 `Partial` 里面的 `?` 替换成了 `-?`：

```ts
type Required<T> = {
  [P in keyof T]-?: T[P]
}

interface Point {
  x?: number
  y?: number
}

type RequiredPoint = Required<Point>

// RequiredPoint 相当于：
// type RequiredPoint = {
//     x: number;
//     y: number;
// }
// 所有属性均必须
```

## 13. ! 非空断言操作符是什么？

TypeScript 特有的，在 TypeScript 2.0 支持了这个特性，在上下文中当类型检查器无法断定类型时，一个新的后缀表达式操作符 `!` 可以用于断言操作对象是非 `null` 和非 `undefined` 类型的。具体而言，运算 `x!` 产生一个不包含 `null` 和 `undefined` 的 `x` 的值。

```ts
function sayHello(hello: string | undefined) {
  const hi1 = hello!.toLowerCase() // OK
  const hi2 = hello.toLowerCase() // Error: Object is possibly 'undefined'
}
```

这种情况下没有使用非空断言操作符就会报错，因为在 `hello` 为 `undefined` 的时候是不会有 `toLowerCase` 方法的。

当然，不要向上面这样使用非空断言操作符，这只会防止编译的时候报错，在运行时还是可能会报错的。因此这样做的前提是你断言 `hello` 一定是 `string` 类型。

类型守卫用于确保该类型在一定的范围内，常用 `typeof` 、 `instanceof` 、`in` 等

```ts
function sayHello(hello: string | undefined) {
  if (typeof hello === 'string') {
    const hi = hello.toLowerCase()
  }
}
```

在 TypeScript 4.4 前，这样使用会报错：

```ts
function sayHello(hello: string | undefined) {
  const isSay = typeof hello === 'string'
  if (isSay) {
    const hi1 = hello.toLowerCase() // Error: Object is possibly 'undefined'.
    const hi2 = hello!.toLowerCase() // OK
  }
}
```

这与之前版本 TypeScript 对编译代码的判断和处理有关。

## 14. \_ 数字分隔符是什么？

ES12（ES2021）新增的特性，TypeScript 2.7 就已经支持了这个特性， 这个特性允许用户在数字之间使用下划线 `_` 来对数字分组。

```ts
const million = 1_000_000
const phone = 173_1777_7777
const bytes = 0xff_0a_b3_f2
const word = 0b1100_0011_1101_0001

console.log(phone) // 17317777777
```

需要注意的是以下函数是不支持分隔符：

```ts
const million = '1_234_567'
Number(million) // NaN
parseInt(million) // 1
parseFloat(million) // 1
```

## 15. & 交叉类型是什么？

在 TypeScript 中，交叉类型是将多个类型合并为一个类型，我们可以通过 `&` 把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性

```ts
type PointX = {
  x: number
}
type Point = PointX & {
  y: number
}
let point: Point = {
  x: 1,
  y: 2,
}
```

如果存在同名但类型不同的属性：

```ts
type PointX = {
  x: number
  z: string
}
type Point = PointX & {
  y: number
  z: number
}
let point: Point = {
  x: 1,
  y: 2,
  z: 3, // Type 'number' is not assignable to type 'never'.
}
```

这里 `z` 为什么会是 `never` 类型喃？因为 `string & number` 的值是永不存在的值，即 `never`。

多个类型合并为一个交叉类型时，如果多个类型间存在同名基础类型属性时，合并后的同名基础类型属性为 `never` ，如果同名属性均为非基础类型，则可以成功合并：

```ts
type PointX = {
  x: number
  z: { x: string }
}
type Point = PointX & {
  y: number
  z: { z: number }
}
let point: Point = {
  x: 1,
  y: 2,
  z: {
    x: '1',
    z: 2,
  },
}
```

## 16. | 联合类型是什么？

联合类型表示一个值可以是几种类型之一，用竖线（ `|` ）分隔每个类型，所以 `number | string | boolean` 表示一个值可以是 `number`， `string`，或 `boolean`。

```js
// 变量声明
let user: string | number | boolean = 'an'

// 类型别名
type U = string | number | boolean
const a: U = '1'
const b: U = 1
const c: U = true

// 函数
const helloName = (name: string | undefined) => {
  /* ... */
}
```

## 17. 类有哪些修饰符？

- `public` 默认修饰符，TypeScript 中类中的成员默认为 `public`。
- `private` 类的成员不能在类的外部访问，子类也不可以。
- `protected` 类的成员不能在类的外部访问，但是子类中可以访问。如果一个类的构造函数，修饰符为 `protected`，那么此类只能被继承，无法实例化。
- `readonly` 关键字 `readonly` 可以将实例的属性，设置为只读。

在构造函数的参数中使用 `private`、`protected`、`public` 或者 `readonly`，可以将声明和赋值合并至一处

```ts
// Boo，Far声明name属性的方式是一致的
class Boo {
  public name: string
  constructor(theName: string) {
    this.name = theName
  }
}
class Far {
  constructor(public name: string, private b: string) {}
}
```

## 18. 什么是不变、双向协变、协变和逆变？

- **协变** (Covariant)：协变表示 `Comp<T>` 类型兼容和 `T` 的一致。
- **逆变** (Contravariant)：逆变表示 `Comp<T>` 类型兼容和 `T` 相反。
- **双向协变** (Bivariant)：双向协变表示 `Comp<T>` 类型与 `T` 类型双向兼容。
- **不变** (Invariant)：不变表示 `Comp<T>` 类型与 `T` 类型双向都不兼容。

```ts
interface SuperType {
  base: string
}
interface SubType extends SuperType {
  addition: string
}

// subtype compatibility
let superType: SuperType = { base: 'base' }
let subType: SubType = { base: 'myBase', addition: 'myAddition' }
superType = subType

// Covariant
type Covariant<T> = T[]
let coSuperType: Covariant<SuperType> = []
let coSubType: Covariant<SubType> = []
coSuperType = coSubType

// Contravariant --strictFunctionTypes true
type Contravariant<T> = (p: T) => void
let contraSuperType: Contravariant<SuperType> = function(p) {}
let contraSubType: Contravariant<SubType> = function(p) {}
contraSubType = contraSuperType

// Bivariant --strictFunctionTypes false
type Bivariant<T> = (p: T) => void
let biSuperType: Bivariant<SuperType> = function(p) {}
let biSubType: Bivariant<SubType> = function(p) {}
// both are ok
biSubType = biSuperType
biSuperType = biSubType

// Invariant --strictFunctionTypes true
type Invariant<T> = { a: Covariant<T>; b: Contravariant<T> }
let inSuperType: Invariant<SuperType> = { a: coSuperType, b: contraSuperType }
let inSubType: Invariant<SubType> = { a: coSubType, b: contraSubType }
// both are not ok
inSubType = inSuperType
inSuperType = inSubType
```

## 19. 什么是泛型？

泛型用来来创建可重用的组件，一个组件可以支持多种类型的数据。这样用户就可以以自己的数据类型来使用组件。简单的说，“泛型就是把类型当成参数”。

## 20. -?，-readonly 是什么含义？

用于删除修饰符：

```ts
type A = {
  a: string
  b: number
}
type B = {
  [K in keyof A]?: A[K]
}
type C = {
  [K in keyof B]-?: B[K]
}
type D = {
  readonly [K in keyof A]: A[K]
}
type E = {
  -readonly [K in keyof A]: A[K]
}
```

## 21. TS 的类型兼容是基于什么的？

TS 的类型兼容是基于**结构**的，不是基于名义的。下面的代码在 ts 中是完全可以的，但在 java 等基于名义的语言则会抛错。

```ts
interface Named {
  name: string
}
class Person {
  name: string
}
let p: Named
// ok
p = new Person()
```

## 22. 什么是 const 断言？

`const` 断言，TypeScript 会为变量添加一个自身的字面量类型。

1. 对象字面量的属性，获得 `readonly` 的属性，成为只读属性。
2. 数组字面量成为 `readonly tuple` 只读元组。
3. 字面量类型不能被扩展（比如从 `hello` 类型到 `string` 类型）。

```ts
// type '"hello"'
let x = 'hello' as const
// type 'readonly [10, 20]'
let y = [10, 20] as const
// type '{ readonly text: "hello" }'
let z = { text: 'hello' } as const
```

## 23. implements 与 extends 的区别？

- `extends`，子类会继承父类的所有属性和方法。
- `implements`，使用 `implements` 关键字的类将需要实现需要实现的类的所有属性和方法。

## 24. 枚举和 object 的区别？

1. 枚举可以通过枚举的名称，获取枚举的值。也可以通过枚举的值获取枚举的名称。
2. `object` 只能通过 `key` 获取 `value`。
3. 数字枚举在不指定初始值的情况下，枚举值会从 `0` 开始递增。
4. 虽然在运行时，枚举是一个真实存在的对象。但是使用 `keyof` 时的行为却和普通对象不一致。必须使用 `keyof typeof` 才可以获取枚举所有属性名。

## 25. 如何在 window 扩展类型？

```ts
declare global {
  interface Window {
    myCustomFn: () => void
  }
}
```

## 26. TypeScript 模块的加载机制？

假设有一个导入语句 `import { a } from "moduleA"`。

1. 首先，编译器会尝试定位需要导入的模块文件，通过绝对或者相对的路径查找方式。
2. 如果上面的解析失败了，没有查找到对应的模块，编译器会尝试定位一个外部模块声明（`.d.ts`）。

## 27. TypeScript 中对象展开会有什么副作用吗？

1. 展开对象后面的属性会覆盖前面的属性。
2. 仅包含对象自身的可枚举属性，不可枚举的属性将会丢失。

## 28. declare，declare global 是什么？

- `declare` 是用来定义全局变量、全局函数、全局命名空间、`js modules`、`class` 等。
- `declare global` 为全局对象 `window` 增加新的属性。

## 29. 简述工具类型 Exclude、Omit、Merge、Intersection、Overwrite 的作用？

- `Exclude<T, U>` 从 `T` 中排除出可分配给 `U` 的元素。
- `Omit<T, K>` 的作用是忽略 `T` 中的某些属性。
- `Merge<O1, O2>` 是将两个对象的属性合并。
- `Compute<A & B>` 是将交叉类型合并。
- `Intersection<T, U>`的作用是取 `T` 的属性,此属性同样也存在与 `U`。
- `Overwrite<T, U>` 是用 `U` 的属性覆盖 `T` 的相同属性。

## 30. 数组定义有几种方式？

1. 按类型

```ts
let arr: number[] = [1, 2, 3, 4] // 数字数组 不允许出现其他数据类型
let arr2: string[] = ['h', 'h', 'h'] // 字符串数组
let arr3: any[] = [1, 'h', 'h', 3] //允许数组中出现任意类型
```

2. 用接口表示数组，一般用于描述类数组

```ts
interface arr {
  [index: number]: number
}

let list: arr = [1, 2, 3, 4]
```

用接口描述数组没太大必要，但类数组不能用普通的数组的方式来描述，需要使用接口来表示类数组的形状。常用的类数组都有自己的接口定义，比如 `IArguments`,`NodeList`,`HTMLCollection`。

3. `Array<elementType>` 用数组泛型表示数组

```ts
let arr: Array<string> = ['bonjour', 'hello']
let arr2: Array<number> = [1, 2]
let arr3: Array<any> = [1, 2, 'hh']
```
