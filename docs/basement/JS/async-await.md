---
tags:
  - JS
  - JavaScript
---

# async/await

## 介绍

继`ES6`出现`promise`之后,再也不用担心回调地狱,但是`promise`也不是十全十美，`async/await`可以让异步代码看起来就像同步的一样，这就是要学习它的原因。

首先创建一个简单的 promise:

```javascript
function getData() {
  return new Promise(function(resolve) {
    let data = { name: "Tom" };
    resolve(data);
  });
}
let p = getData();
p.then(data => {
  console.log(data);
  return "over";
});
```

`getData`返回一个新的`promise`实例，成功`resolve`之后返回`data`的值，上面的写法是用`ES6promise`的写法。

```javascript
async function go() {
  console.log(await getData());
  return "over";
}
console.log(go);
go();
```

`async`用于定义一个异步函数,该函数隐式的返回一个`Promise`,该`promise`的`reosolve`值就是函数`return`的值。(示例中`reosolve`值就是字符串`over`)。

`await`必须在`async`定义的函数中使用,当函数执行的时候,一旦遇到`await`就会先返回,等到异步操作完成,再接着执行函数体内后面的语句。

可以看出用`async/await`写出来的代码,最明显的一点就是代码要比`promise`简洁。

第二个优势,`async/await`可以让`try/catch`既能处理同步错误也可以处理异步产生的错误,在一般情况下使用`try/catch`是不能够检测异步错误的,因为`try/catch`本身就是同步的,这也就是为什么说`async/await`看起来像同步的原因之一。

```javascript
async function go() {
  try{
    console.log(JSON.parse(await getData())
    return 'over'
  } catch(error) {
    cons
  }
}
```

有时候可能需要嵌套异步,也就是这样：

```javascript
function go() {
  return promise1().then(value1 => {
    return promise2(value1).then(value2 => {
      return promise3(value1, value2);
    });
  });
}
```

循环嵌套看起来很让人不爽,一个解决的方法是使用`promise.all`

```javascript
function go() {
  return promise1()
    .then(value1 => {
      return promise.all([value1, promise2(value1)]);
    })
    .then((value1, value2) => {
      return promise3(value1, value2);
    });
}
```

但这样做可读性未免也太差了,而且将`promise.all`本身的作用是用来将多个`Promise`实例包装起来,这样直接和`value1`一起使用也太奇怪了。

最好的方法是使用`async/await`：

```javascript
async function go() {
  const value1 = await promise1();
  const value2 = await promise2(value1);
  return promise3(value1, value2);
}
```

`async/await`可以让异步代码变得“同步”,但是会使异步代码不再明显,识别异步代码可能要花一些功夫。

## 深入理解

`async`函数的返回值是一个`promise`对象:

```javascript
async function test() {
  return "hello";
}
const a = test();
console.log(a);
```

返回值出乎意料,是一个`promise`对象：

```dash
Promise {<resolved>: "hello"}
```

可以得出一个结论：`async`函数返回的是一个`promise`对象,如果在函数中`return`一个直接量,`async`会把这个值通过`promise.resolve()`封装成`promise`对象,如果没有返回值输出的则是`Promise.resolve(undefined)`。

我们知道`await`不能在`async`函数外使用,所以当无法使用`await`获取返回值的时候还是要用`then`。

```javascript
test().then(v => {
  console.log(v);
});
```

如果没有`await`,那么`async`函数会立即执行,并返回一个`promise`对象,这和一个返回`promise`对象的普通函数没有区别。

`await`等待的是一个表达式,计算结果是`promise`或者其他值,`await`等待的实际上是一个返回值,它可以用于任意表达式的返回结果，根据结果分两种情况：

- 如果`await`最后等到的不是一个`promise`对象，那么`await`的运算结果就是表达式返回的东西。
- 如果`await`最后等到的是一个`promise`对象，那么他会等待`promise`的状态变成`resolve`，然后得到`resolve`的值，作为`await`表达式的运算结果。

::: warning
`await`命令后面的`Promise`对象，运行结果可能是`rejected`，所以最好把`await`命令放在`try...catch`代码块中。
:::
