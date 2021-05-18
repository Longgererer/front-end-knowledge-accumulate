---
tags:
  - JS
  - JavaScript
---

# Generator

## Generator 基本用法

Promise 解决了异步嵌套的问题，ES6 又推出了 Generator 函数，这是一个新的函数类型，也叫做**生成器**。

来看例子：

```javascript
let x = 1

function a() {
  x++
  b()
  console.log(x)
}
a()

function b() {
  x++
}
```

输出结果是什么？毫无疑问会是 3。

如果我把 b() 这条调用函数 b 的行为取消，那结果应该是 2，有没有方法可以做到在取消调用函数 b 之后，仍然可以得到 3 的结果呢？

答案就是：**Generator**。

```javascript
let x = 1

function* a() {
  x++
  yield
  console.log(x)
}

function b() {
  x++
}
```

> 可以看到 Generator 函数的声明相比普通函数多了一个*,当然也可以写成`function *a()`，`function * a()`甚至是`function*a()`，这几种写法没有本质上的区别，只是风格的不同而已。

函数里有一个`yield`命令，可以暂时把它理解为'暂停'。

然后我执行下面的命令:

```javascript
let c = a()
c.next()
console.log(x) //2
b()
c.next() //3
```

1. 在上面的代码中，执行了`let c = a()`，这个操作的意义在于构造了一个迭代器 c，这个迭代器会控制生成器\*a 中代码的执行。
2. 第一个`c.next()`使得生成器`*a`正式开始执行，它运行了生成器中第一行代码`x ++`。
3. 接下来执行`yield`，这个时候生成器暂停了，也就是说第一个`c.next()`命令已经执行结束，这时候 `*a`仍然处于运行状态，只不过它暂停了而已。
4. 此时控制台输出`x = 2`。
5. 调用函数 b 使得`x ++`。
6. 第二个`c.next()`继续执行下面的命令，控制台输出`x = 3`。

这样，整个函数就算是执行完毕了，当然，如果后面的代码中还有`yield`，那么需要执行第三个`c.next()`才能执行完整个函数。  
生成器达到了不需要在函数内调用 b，就可以得到`x = 3`的效果，它可以一次或者多次的进行停止，这取决于`yield`的数量。

Generator 函数和普通函数一样可以接收参数，但就像上面的例子一样，Generator 并没有像普通函数一样运行。

`next()`看上去像是执行两个`yield`之间的操作(如果有上一个`yield`和下一个`yield`的话)，但实际上它也需要完成上一个被暂停的`yield`表达式。

看下面的例子：

```javascript
let x = 2
function* a() {
  let y = x * (yield)
  console.log(y)
}
let b = a()
```

同样是创建了一个生成器 a，构造了一个迭代器 b，不同的是`yield`表达式写在了执行语句之内。

```javascript
b.next()
b.next(6) //12
```

第一个`next`执行`yield`之前的语句，直到`yield`暂停，第二个`next`将 6 传给正在等待的`yield`，这样 6 就被传入了生成器，最后控制台输出`y = 12`。

现在有一个问题，为什么`next`执行的次数要比`yield`多一次呢？  
因为第一个`next`总是启动一个生成器，并运行到第一个`yield`处，而第二个`next`总是调用完成第一个被暂停的`yield`表达式，第三个`next`完成第二个`yield`...  
什么意思呢？  
`next`方法会返回一个对象，这个对象的`value`属性就是当前`yield`表达式的值，也就是当前内部状态值，对象还有一个属性是`done`，表示迭代是否结束。上述代码在执行第一个`next`的时候就返回了一个对象：

![截图未命名.jpg](https://i.loli.net/2019/03/19/5c90980fe374b.jpg)

这个时候因为`yield`没有值，所以是`undefined`。

执行第二个`next`的时候：

![截图未命名.jpg](https://i.loli.net/2019/03/19/5c9098b18c1c9.jpg)

还是`undefined`,因为现在`value`并不是第一个`yield`的值了，那是什么值呢？  
把`console.log(y)`改成`return(y)`试试：

![截图未命名.jpg](https://i.loli.net/2019/03/19/5c90999320af7.jpg)

原来最后一个`next`返回的对象`value`值是最后`return`的值，如果生成器中没有`return`，那么会自动生成一个隐式的`return`返回`undefined`，这样就能解释`next`比`yield`多一个的原因了。
