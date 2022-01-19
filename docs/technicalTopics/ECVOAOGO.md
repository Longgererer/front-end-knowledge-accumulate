# JavaScript 执行上下文和执行栈

## EC(Execution Context)执行上下文

### 执行上下文的类型

JavaScript 中有三种类型的执行上下文：

- **全局执行上下文**(GEC)：这是默认或基本的执行上下文。不在任何函数内的代码都属于全局上下文，一个程序中只能有一个全局执行上下文。它要做的有两件事：
  1. 创建一个全局对象，在浏览器中为(`window`)。
  2. 将 `this` 的值设置为全局对象。
- **函数执行上下文**(FEC)：每次调用函数时，都会为该函数创建一个全新的执行上下文。每个函数都有自己的执行上下文，但它是在调用函数时创建的，这个上下文可以保护里面的私有变量和外界互不干扰。
- **Eval 函数执行上下文**(EFEC)：在 `eval` 函数执行代码也会产生一种特殊的执行上下文，但由于我们通常不会使用它，因此就不讨论了。

每当一个函数执行完毕，则这个函数的执行上下文也将从栈中弹出，等到所有函数都运行完毕，要关闭页面的时候，全局上下文也将出栈释放，程序运行结束。如果当前上下文中的某些内容，被当前上下文以外的东西占用，那么当前上下文是不能被释放的，这就是我们熟知的闭包(Closure)。

## ECS(Execution Context Stack)执行栈

执行栈也称为调用栈，具有 LIFO(后进先出)的结构，用于存储代码执行过程中创建的所有执行上下文。

当 JavaScript 引擎第一次遇到您的脚本时，它会创建一个全局执行上下文并将其推送到当前执行堆栈。每当引擎找到函数调用时，它都会为该函数创建一个新的执行上下文并将其推送到堆栈顶部。

举个例子：

```js
let a = 1
function foo() {
  bar()
}
function bar() {
  console.log(a)
}
foo()
```

那么执行过程中执行栈的变化如下：

1. 全局执行上下文创建，压入执行栈。
2. 执行 `foo()`，`foo` 函数执行上下文创建，压入执行栈。
3. 执行 `bar()`，`bar` 函数执行上下文创建，压入执行栈。
4. `bar()` 执行完毕，当前执行上下文出栈。
5. `foo()` 执行完毕，当前执行上下文出栈。
6. 全局代码执行完毕，出栈，执行栈清空。

你可能遇到过以下错误：

```bash
Uncaught RangeError: Maximum call stack size exceeded
```

这表示你嵌套调用了太多次函数，以至于系统分配给浏览器的执行栈放不下更多的执行上下文了，通常在你进行了太多的递归调用时会发生：

```js
function a() {
  a()
}
a()
```

## LE(Lexical Environment)词法环境

执行上下文是在创建阶段创建的。在创建阶段会发生以下事情：

1. 创建了 `LexicalEnvironment`。
2. 创建了 `VariableEnvironment`。

[官方文档](http://ecma-international.org/ecma-262/6.0/) 文档将 LE 定义为：

> 词法环境是一种规范类型，用于根据 ECMAScript 代码的词法嵌套结构定义标识符与特定变量和函数的关联。一个词法环境由一个环境记录(Environment Record)和一个对外部词法环境(outer)的可能为 `null` 的引用组成。

当然，除了上面所说的环境记录，父级词法环境引用之外，还包含一个 `ThisBinding`，储存当前词法作用域中 `this` 的指向。

![](http://picstore.lliiooiill.cn/1_tq3-6dXcBbDH2XAE2uMC5Q.png)

词法环境所要做的是跟踪变量、函数名和相关值，举个例子：

```js
function foo() {
  var a = 10
  function bar() {}
}
foo()
```

当调用 `foo` 时，一个新的函数环境就生成了，这个环境可能是这样的：

```js
ExecutionEnvironment: {
  LexicalEnvironment: {
    EnvironmentRecord: {
      a: 10,
      bar: function() {},
    },
    outer: <ParentLexicalEnvironment>,
    ThisBinding: <globalObject>
  },
  ...
}
```

`LexicalEnvironment` 中包含了当前执行上下文中所声明的变量，函数，除了这些环境记录外同时还会创建对它的父级执行上下文的引用 `ParentLexicalEnvironment`，当 JavaScript 在当前执行上下文中找不到属性时，他们会使用 `ParentLexicalEnvironment` 在父级中寻找，以此类推。。。直到全局执行上下文，如果仍然没有找到则会产生 `Reference Error XXX is not defined` 错误。

## VE(Variable Environment)变量环境

变量环境和词法环境非常相似，在 ES6 中，他们的唯一区别是：

- `LexicalEnvironment` 用于存储函数声明和使用 `let` 和 `const` 所声明的变量的绑定。
- `VariableEnvironment` 存储的是使用 `var` 声明的变量的绑定。

那如果我不用任何声明方式：

```js
a = 1
```

变量 `a` 该存到哪里呢？

**不用任何声明方式的变量将会直接视为全局对象的属性**，而全局内使用 `var` 声明，除了会保存在当前 `VariableEnvironment` 中，还会映射给全局对象一份，因此在浏览器中：

```js
var a = 1
console.log(a === window.a) // true
```

而 `let` 和 `const` 所定义的变量则不会映射到全局对象中。

## 举个例子

通过一个例子来更好地理解这些概念：

```js
let a = 20
const b = 30
var c
function multiply(e, f) {
  var g = 20
  return e * f * g
}
c = multiply(20, 30)
```

当执行这段代码时，JavaScript 首先会创建全局执行上下文来执行全局代码，因此，在创建阶段，全局执行上下文将如下所示：

```js
GlobalExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      a: <uninitialized>,
      b: <uninitialized>,
      multiply: <function>
    },
    outer: null,
    ThisBinding: <globalObject>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      c: undefined,
      outer: null,
    },
    ThisBinding: <globalObject>
  }
}
```

在执行阶段，变量赋值完成。所以全局执行上下文在执行阶段看起来像这样：

```js
GlobalExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      a: 20,
      b: 30,
      multiply: <function>
    },
    outer: null,
    ThisBinding: <globalObject>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      c: undefined,
      outer: null,
    },
    ThisBinding: <globalObject>
  }
}
```

当执行到 `multiply(20, 30)` 时将会创建一个新的函数执行上下文来执行函数代码，这个函数执行上下文就像这样：

```js
FunctionExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      Arguments: {
        0: 20,
        1: 30,
        length: 20
      },
      outer: <globalLexicalEnvironment>,
      ThisBinding: <globalObject or undefined>
    },
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      g: undefined,
      outer: <globalLexicalEnvironment>,
      ThisBinding: <globalObject or undefined>
    }
  }
}
```

在此之后，执行上下文进入执行阶段，这意味着对函数内部变量的赋值已经完成。所以函数执行上下文在执行阶段看起来像这样：

```js
FunctionExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      Arguments: {
        0: 20,
        1: 30,
        length: 20
      },
      outer: <globalLexicalEnvironment>,
      ThisBinding: <globalObject or undefined>
    },
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      g: 20,
      outer: <globalLexicalEnvironment>,
      ThisBinding: <globalObject or undefined>
    }
  }
}
```

函数执行完成后，返回的结果被储存在变量 `c` 中，所以全局词法环境被更新了。之后，全局代码完成，程序结束。

:::tip Notice
在创建阶段，`let` 和 `const` 定义的变量没有任何关联的值，但是 `var` 定义的变量被设置为 `undefined`，这是因为，在创建阶段，会扫描代码中的变量和函数声明，而函数声明完整地存储在环境中，`var` 声明的变量最初设置为 `undefined`，`let` 和 `const` 则保持未初始化状态；这就是为什么你可以在 `var` 声明之前访问已定义的变量，而访问 `let` 和 `const` 定义的变量会出现引用错误。这就是我们说的**变量提升**(Variable Hoisting)。
:::

## 闭包(Closure)

当我们执行：

```js
var x = 1
function foo(y) {
  return function (z) {
    return x + y + z
  }
}
var f = foo(2)
f(3)
```

我们在控制台中打上断点进行调试，当执行到 `f(3)` 的时候，控制台显示：

![](http://picstore.lliiooiill.cn/1642486537%281%29.jpg)

我们发现，当执行 `f(3)`，JavaScript 创建一个新的函数执行上下文，除了包含我们上面说的属性信息之外，还多了一个 `Closure`，这是因为虽然 `foo` 函数已经执行完毕，其执行上下文已经从执行栈中推出，但函数 `f` 的执行上下文由于访问了其父级 `foo` 执行上下文中的变量 `z`，`f` 会产生一个 `Closure` 对象，保留对 `z` 的引用。

一旦全部代码执行完毕，`f` 的执行上下文将被推出，闭包也将消失。

考虑以下代码：

```js {3}
var x = 1
function foo(y) {
  var b = 1
  return function (z) {
    return x + y + z
  }
}
var f = foo(2)
f(3)
```

如果我们定义一个不会被当前上下文以外的东西所访问的变量 `b`，那么 `Closure` 对象中会包含 `b` 的引用么？

![](http://picstore.lliiooiill.cn/1642487267%281%29.jpg)

按道理来说，函数 `foo` 的执行上下文所包含的变量都应当保存在闭包中，因为它们对于所返回的匿名函数来说是可达的。

但实际情况是：如果从代码中可以明显看出有未使用的外部变量，那么就会将其删除(至少对 V8 引擎来说是如此)，因此我们可以确定：只有**活动变量**(也就是会被当前上下文之外的地方所访问的变量)才会被保存在闭包中。

## 参考文章

- [前端系统化学习【JS 篇】:（九）EC、STACK、VO、AO、GO 浏览器底层运行机制](https://juejin.cn/post/6874592740395450376)
- [Understanding Execution Context and Execution Stack in Javascript](https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0)
- [Execution Context, Lexical Environment, and Closures in JavaScript](https://betterprogramming.pub/execution-context-lexical-environment-and-closures-in-javascript-b57c979341a5)
- [变量作用域，闭包](https://zh.javascript.info/closure)
- [JavaScript Execution Context and Hoisting Explained with Code Examples](https://www.freecodecamp.org/news/javascript-execution-context-and-hoisting/)
