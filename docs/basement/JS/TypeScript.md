# TypeScript 基础

在学习 TypeScript 之前，要了解的是：TypeScript 是 JavaScript 的超集，是 JavaScript 预处理语言，主要提供了类型系统和对 ES6 的支持

## 为什么要学习 TypeScript？

> - 可以在编译阶段就发现大部分错误
> - 增强了编辑器和 IDE 的功能，包括代码补全、接口提示、跳转到定义、重构等
> - 即使完全用 js 语法写 ts 文件也不会出问题
> - 即使不显式的定义类型，也能够自动做出类型推论
> - 即使 TypeScript 编译报错，也可以生成 JavaScript 文件

## 安装 TypeScript

运行如下命令：

```yaml
npm i typescript -g
tsc --init //生成配置文件tsconfig.js并更改文件中的"outDir": "./js"
tsc --watch //监视文件tsconfig.js
```

## 类型

类型校验，在`TypeScript`中声明变量的时候必须加上变量类型

```typescript
let str: string = 'hello world'
let num: number = 123
let boo: boolean = true
let sym: symbol = Symbol('sym')
let u: undefined = undefined
let n: null = null
```

如果之后变量的值被改变，而且改变后的数据类型和定义的数据类型不一样，就会报错：

```typescript
let str: string = 'hello world'
str = 7 //Type 'number' is not assignable to type 'string'.
```

当然，你可以设置类型为`any`，允许被赋值为任意类型

```typescript
let str: any = 'hello world'
str = 7
```

**可以认为，声明一个变量为任意值之后，对它的任何操作，返回的内容的类型都是任意值。**

当然，如果声明的时候没有定义类型，会被识别为任意类型

```typescript
let str
str = 'zxc'
str = 7
```

下列情况必须设置为`any`类型，否则会报错：

```typescript
let oDiv: any = document.getElementById('div')
```

**注意**：不要用下面的形式：

```typescript
let str: string = new String('hello world') //thow error
```

如果你知道`new`操作符到底做了什么的话，那你应该明白这里为什么报错，`str`不是`string`而是`object`

TypeScript 有两种定义数组的方式：

```typescript
let arr1: number[] = [1, 2, 3]
let arr2: Array<number> = [1, 2, 3]
```

## 元组

上面定义的数组元素都是`number`类型，元组可以使数组中的元素多类型：

```typescript
let arr: [number, string] = [1, '2']
```

这样第一个元素类型设置为`number`，第二个设置为`string`，这样做可以实现多类型，但是限制也很明显：直接复制的时候需要提供所有元组类型中指定的项

## 类型断言

看看下面的例子：

```typescript
function getLength(something: string | number): number {
  if (something.length) {
    return something.length
  } else {
    return something.toString().length
  }
}
```

这个方法用于接收 `string` 或者 `number` 类型，我们想的是如果是 `string`，返回它的 `length`，如果不是，转化成字符串再返回它的 `length`，但很明显，ts 报错了，报错原因是 `number` 没有 `length` 属性

类型断言就是告诉编译器，“相信我，我知道自己在干什么”。`TypeScript`会假设你，程序员，已经进行了必须的检查。

类型断言有两种形式。 其一是“尖括号”语法:

```typescript
let someValue: any = 'this is a string'
let strLength: number = (<string>someValue).length
```

另一个为 `as` 语法：

```typescript
let someValue: any = 'this is a string'
let strLength: number = (someValue as string).length
```

**注意**：当你在`TypeScript`里使用`JSX`时，只有 `as`语法断言是被允许的。

## 类型推断

之前说过，如果声明的时候没有定义类型，会被识别为任意类型，但是前提是只声明变量，没有赋值

如果你将声明和赋值写在同一条语句内，那么 TypeScript 会在没有明确的指定类型的时候推测出一个类型

```typescript
let str = '123'
str = 7 //error
```

## 类型注解

显式的告诉代码，我们的 `count` 变量就是一个数字类型，这就叫做类型注解

```ts
let count: number // 类型注解
count = 123
```

## 类型检测

1. `typeof` 操作符可以用来获取一个变量或对象的类型：

```ts
interface Hero {
  name: string
  skill: string
}

const zed: Hero = { name: '影流之主', skill: '影子' }
type LOL = typeof zed // type LOL = Hero
const ahri: LOL = { name: '阿狸', skill: '魅惑' }
```

2. `instanceof`

```ts
class NumberObj {
  count: number
}
function addObj(first: object | NumberObj, second: object | NumberObj) {
  if (first instanceof NumberObj && second instanceof NumberObj) {
    return first.count + second.count
  }
  return 0
}
```

3. `keyof` 与 `Object.keys` 略有相似，只不过 `keyof` 取 `interface` 的键

```ts
interface Point {
  x: number
  y: number
}

// type keys = "x" | "y"
type keys = keyof Point

// 用 keyof 可以更好的定义数据类型
function get<T extends object, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]
}
```

## 枚举类型

枚举（Enum）类型用于取值被限定在一定范围内的场景，枚举类型用 `enum` 定义

```typescript
enum obj {
  a = 1,
  b = 2,
}
```

如果枚举类型的标识符没有赋值，那么它们的值就是数组的下标

```typescript
enum color {
  red,
  blue,
  gray,
}
let c: color = color.red
console.log(c) //0
```

枚举类型非常好的用途是表示状态码：

```typescript
enum Err {
  'undefined' = -1,
  'null' = 0,
  'success' = 1,
}
```

## 多类型

可以给一个变量声明多个类型：

```typescript
let str: number | string = 2
str = 'sas'
```

## void

`void` 类型,表示没有任何类型，一般表示方法

```typescript
function func(): void {
  //...
}
```

如果方法不返回任何类型，应该声明为 `void`  
如果设置了类型，就必须返回对应类型的值

```typescript
function func(): object {
  return { a: 1 }
}
```

## never

`never` 类型表示的是那些永不存在的值的类型。例如， `never` 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 `never` 类型，当它们被永不为真的类型保护所约束时。

```typescript
let nev: never = null || undefined
let func: never = (() => {
  throw new Error('错误')
})()
```

`never` 类型只能赋值给另外一个 `never`,

## 函数

可以指定函数参数类型

```typescript
let getInfo = function(name: string, age: number): string {
  return `${name},${age}`
}
```

可以在参数后面加上问号，表示参数可传可不传

```typescript
let getInfo = function(name: string, age?: number): string {
  if (age) {
    return `${name},${age}`
  } else {
    return `${name}`
  }
}
console.log(getInfo('张三'))
```

**注意**：可选参数必须配置到参数的最后面，否则无法判断你传入的参数是否是可选的参数

ES6 的三点运算符，可以实现传若干个参数到函数的方法：

```typescript
function sum(...result: number[]): number {
  let sum = 0
  for (let i = 0; i < result.length; i++) {
    sum += result[i]
  }
  return sum
}
console.log(sum(1, 2, 3, 4, 5))
```

## 函数的重载

Java 中的重载：两个函数名字相同，但是参数不一样，这是会出现重载函数  
TypeScript 中的重载：通过为同一个函数提供多个函数类型定义来试下多种功能的目的  
ES5 中的重载：出现同名的方法，下面的方法会替换上面的方法

```typescript
function getInfo(name: string): string
function getInfo(age: number): number
function getInfo(str: any): any {
  if (typeof str === 'string') {
    return `我是${str}`
  } else {
    return `今年${str}岁`
  }
}
console.log(getInfo(25))
console.log(getInfo('小明'))
```

这样也可以实现重载：

```typescript
function getInfo(name: string): string
function getInfo(name: string, age: number): string
function getInfo(name: any, age?: any): any {
  if (age) {
    return `${name}---${age}`
  } else {
    return `${name}`
  }
}
```

## 类

在 TypeScript 中，类的定义其实和 ES6 语法一样，只是多了数据类型的声明：

```typescript
class Person {
  name: string
  constructor(name: string) {
    //构造函数，实例化类的时候触发的函数
    this.name = name
  }
  getName(): string {
    return this.name
  }
  setName(name: string): void {
    this.name = name
  }
}
```

类的继承

```typescript
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }
  run(): string {
    return `${this.name}`
  }
}
class Web extends Person {
  constructor(name: string) {
    super(name) //初始化父类的构造函数
  }
}
let w = new Web('李四')
w.run()
```

TypeScript 中为类提供了三种修饰符  
`public` 公有，`protected` 受保护，在类中可以访问，类外无法访问，`private` 私有的，只有当前类能访问，子类和外部都不能访问  
属性如果不加修饰符默认是公有

```typescript
class Person {
  protected name: string
  constructor(name: string) {
    this.name = name
  }
  run(): string {
    return `${this.name}`
  }
}
class Web extends Person {
  constructor(name: string) {
    super(name) //初始化父类的构造函数
  }
}
let w = new Web('李四')
w.run()
let x = new Person('张三')
alert(x.name) //报错，浏览器能够执行是因为它转换成了es5的代码。但实际上在ts中这是错误的写法
```

类成员的静态属性我们可以直接通过类名调用,不能用 `this.属性名` 在类的内部使用。

```typescript
class Person {
  public name: string
  static age: number = 20
  constructor(name: string) {
    this.name = name
  }
  run(): string {
    return `${this.name}`
  }
  static print() {
    console.log(Person.age)
  }
}
Person.print()
```

**多态**：父类定义一个方法不去实现，让继承他的子类去实现，每一个子类都有不同的表现

```typescript
class Animal {
  name: string
  constructor(name: string) {
    this.name = name
  }
  eat() {
    //具体吃什么，要让继承他的子类去实现，每一个子类的表现不一样
    console.log('吃')
  }
}
class Dog extends Animal {
  constructor(name: string) {
    super(name)
  }
  eat() {
    return this.name + '吃肉'
  }
}
```

**abstract**  
`abstract` 定义的抽象类和抽象方法，抽象类中的抽象方法不包含具体实现并且必须在派生类中去实现  
`abstract` 方法只能放在抽象类里面且抽象方法必须实现父类的方法

```typescript
abstract class Animal {
  public name: string
  constructor(name: string) {
    this.name = name
  }
  abstract eat(): any
}
let a = new Animal() //报错，无法直接创建抽象类的实例
class Dog extends Animal {
  //抽象类的子类必须实现父类的抽象方法
  constructor(name: any) {
    super(name)
  }
  eat() {
    console.log(this.name + '吃饭')
  }
}
```

## json 约束

```typescript
function printLabel(labelInfo: { label: string }): void {
  console.log('printLabel')
}
printLabel({ label: '张三' })
```

## 接口

接口是行为和动作的规范，对批量方法进行约束

```typescript
interface FullName {
  firstName: String
  secondName: string
}
function printName(name: FullName) {
  console.log(`${name.firstName}·${name.secondName}`)
}
printName('123') //错误
let obj1: object = {
  age: 20,
  firstName: '张',
  secondName: '三',
}
printName(obj1) //只要包含firstName和secondName就行
```

**接口可选属性**

```typescript
interface Name{
    firstName: string;
    secondName?: string;//可选属性，可传可不传
}
function getName(name: Name){
    console.log(name)
}
getName({//参数的顺序可以不一样
    secondName: '三'
    firstName: '四'
})
```

**函数类型接口**  
**加密的函数类型接口**

```typescript
interface encrypt {
  (key: string, value: string): string
}
let md5: encrypt = function(key: string, value: string): string {
  return key + value
}
//参数类型必须严格按照接口定义的约束
let sha: encrypt = function(key: string, value: string): string {
  return key + '----' + value
}
```

**可索引接口**

```typescript
interface User {
  [index: number]: string //索引值必须是number，对应的值必须是字符串
}
let arr1: User = ['123', '244']
```

**对对象的约束**

```typescript
interface UserObj {
  [index: string]: string
}
let obj: UserObj = {
  index: 'as',
}
```

**类类型接口**：和抽象类有些相似

```typescript
interface Animal {
  name: string
  eat(str: string): void
}

class Dog implements Animal {
  name: string
  constructor(name: string) {
    this.name = name
  }
  eat(name: string) {
    console.log(this.name)
  }
}

let d = new Dog('阿黑')
d.eat('老鼠')
```

其他类实现接口必须按照接口的标准去写，必须实现接口的属性和方法

**接口的扩展**：接口可以继承接口

```typescript
interface Animal {
  eat(): void
}
interface Person extends Animal {
  work(): void
}
class Web implements Person {
  public name: string
  constructor(name: string) {
    this.name = name
  }
  work() {}
  eat() {}
}
```

类可以在继承父类的同时实现接口，规则和前面讲的一样

```typescript
interface Habit {
  eat(str: string): void
}
class Animal {
  public name: string
  constructor(name: string) {
    this.name = name
  }
  do(sth: string) {
    console.log(this.name + sth)
  }
}
class Cat extends Animal implements Habit {
  constructor(name: string) {
    super(name)
  }
  eat(str: string): void {
    //...
  }
}
```

**只读属性**
一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用 readonly 来指定只读属性:

```typescript
interface Point {
  readonly x: number
  readonly y: number
}
```

`ReadonlyArray<T>`类型可以保证数组创建之后不会被更改

```typescript
let a: number[] = [1, 2, 3, 4]
let ro: ReadonlyArray<number> = a
ro[0] = 12 // error!
ro.push(5) // error!
ro.length = 100 // error!
a = ro // error!
```

## 泛型

泛型可以解决类，接口方法的复用性，以及对不特定数据类型的支持

```typescript
function getData(value: string): string {
  return value
}
```

上面这个方法只能返回 `string` 类型的数据，但是我想同时返回 `number` 和 `string` 类型，有两种办法解决：

> 1. 将返回值类型改为 `any`，但这是绝对不推荐的做法，因为这等于放弃类型检查
> 2. 使用泛型

泛型可以支持不特定的数据类型，定义泛型可以用任意的大写字母，但是最好用 `T`

```typescript
function getData<T>(value: T): T {
  return value
}
getData<number>(123) //指定的是number，传入的必须是number，返回的也要是number
getData<string>('123')
```

**类的泛型**

```typescript
class Min<T> {
  public list: T[] = []
  add(value: T): void {
    //...
  }
}
```

**泛型接口**

```typescript
interface Config<T> {
  (value: T): T
}
let getData: Config<string> = function<T>(value: T): T {
  return value
}
getData('str')
```

## in

类似于数组和字符串的 `includes` 方法，也有遍历的作用，拿到 ts 类型定义的 `Key`，获取 `Key` 还有个方法：`keyof` 是取类型的 `key` 的联合类型， `in` 是遍历类型的 `key`

```ts
function judgeWhoTwo(animal: Waiter | Teacher) {
  if ('skill' in animal) {
    animal.skill()
  } else {
    animal.say()
  }
}
```

## 工具类

### Partial<T>

将 `T` 中所有属性转换为可选属性。返回的类型可以是 `T` 的任意子集

```ts
export interface UserModel {
  name: string
  age?: number
  sex: number
}

type JUserModel = Partial<UserModel>
// 相当于
type JUserModel = {
  name?: string | undefined
  age?: number | undefined
  sex?: number | undefined
}
```

`Partial<T>` 的内部实现：

```ts
type Partial<T> = { [P in keyof T]?: T[P] }
```

### Required<T>

通过将 `T` 的所有属性设置为必选属性来构造一个新的类型。与 `Partial` 相反

```ts
type JUserModel2 = Required<UserModel>
// 相当于
type JUserModel2 = {
  name: string
  age: number
  sex: number
}
```

### Readonly<T>

将 `T` 中所有属性设置为只读

```ts
type JUserModel3 = Readonly<UserModel>

// =
type JUserModel3 = {
  readonly name: string
  readonly age?: number | undefined
  readonly sex: number
}
```

### Record<K,T>

构造一个类型，该类型具有一组属性 `K`，每个属性的类型为 `T`。可用于将一个类型的属性映射为另一个类型。`Record` 后面的泛型就是对象键和值的类型。

简单理解：`K` 对应对应的 `key`，`T` 对应对象的 `value`，返回的就是一个声明好的对象。

```ts
type TodoProperty = 'title' | 'description'

type Todo = Record<TodoProperty, string>
// =
type Todo = {
  title: string
  description: string
}

interface IGirl {
  name: string
  age: number
}

type allGirls = Record<string, IGirl>
```

### Pick<T,K>

在一个声明好的对象中，挑选一部分出来组成一个新的声明对象

```ts
interface Todo {
  title: string
  description: string
  done: boolean
}

type TodoBase = Pick<Todo, 'title' | 'done'>

// 相当于
type TodoBase = {
  title: string
  done: boolean
}
```

### Omit<T,K>

从 `T` 中取出除去 `K` 的其他所有属性。与 `Pick` 相对。

### Exclude<T,U>

从 T 中排除可分配给 U 的属性，剩余的属性构成新的类型

```ts
type T0 = Exclude<'a' | 'b' | 'c', 'a'>

// 相当于
type T0 = 'b' | 'c'
```

### Extract<T,U>

从 `T` 中抽出可分配给 `U` 的属性构成新的类型。与 `Exclude` 相反

```ts
type T0 = Extract<'a' | 'b' | 'c', 'a'>

// 相当于
type T0 = 'a'
```

### NonNullable<T>

去除 `T` 中的 `null` 和 `undefined` 类型

### Parameters<T>

返回类型为 `T` 的函数的参数类型所组成的数组

```ts
type T0 = Parameters<() => string> // []

type T1 = Parameters<(s: string) => void> // [string]
```

### ReturnType<T>

`function T` 的返回类型

```ts
type T0 = ReturnType<() => string> // string

type T1 = ReturnType<(s: string) => void> // void
```

### InstanceType<T>

返回构造函数类型 `T` 的实例类型; 相当于 js 中的，不过返回的是对应的实例

```ts
class C {
  x = 0
  y = 0
}

type T0 = InstanceType<typeof C> // C
```
