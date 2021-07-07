---
tags:
  - JS
  - JavaScript
---

# Promise

Promise 是异步编程的一种解决方案，它主要用于解决异步中的**回调地狱**问题  
所谓的回调地狱就类似于下面这样：

```javascript
function a() {
  function b() {
    function c() {
      function d() {
        console.log("123");
      }
      d();
    }
    c();
  }
  b();
}
a();
```

在上述代码中，如果我想执行函数 d，那就必须先要执行函数 c...一直要执行到 a，这样的嵌套加回调很容易让人头晕，但这在以前是再正常不过的代码了，没人会觉得它有什么问题  
回调在异步操作中是最频繁的，为什么呢？看下面的 Node 代码：

```javascript
function getMime() {
  console.log(1);
  let a = fs.readFile("input.txt", function(data) {
    console.log(2);
    return data.toString();
  });
  console.log(a);
  console.log(3);
}
getMime();
```

这是一段 Node 代码，我想读取一个文件的信息，于是在读取文件信息的时候将它输出，然而结果却不是这样的：

```bash
依次输出：
1
undefined
3
2
```

**What**? 为什么会这样呢？  
因为 Node 中 readFile 是一个非阻塞式 I/O,也就是异步方法，在异步方法中无法通过同步方式(return)来获取文件数据，因为获取数据的行为发生在所有阻塞式(同步)命令都完成之后才会开始执行  
于是 a 的值是 undefined，那么为什么先输出 3，再输出 2 呢？  
一样的道理，因为异步的原因，console.log(2)要等到 console.log(3)执行完才开始执行

那么如何获取到文件中的数据呢，用**回调(callback)**  
看下面的代码：

```javascript
function getMime(callback) {
  console.log(1);
  fs.readFile("input.txt", function(data) {
    console.log(2);
    callback(data.toString());
  });
  console.log(3);
}
getMime(function(data) {
  console.log(data);
});
```

这次传递了一个 callback 参数，等到执行 readFile 方法的时候再调用 callback 函数，这样就可以成功获取到数据了：

```bash
依次输出：
1
3
2
data.toString()
```

既然回调这么常用，那么出现回调地狱的情况也再正常不过了，promise 是怎么解决的呢？

```javascript
function ajax() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        return success(request.responseText);
      } else {
        return fail(request.status);
      }
    }
  };
}
```

这是 AJAX 中判断服务器状态的方法，这样写没有任何问题，但不好看，可读性也差，也不利于代码重复利用，用 promise 可以这样写：

```javascript
function ajax(method, url, data) {
  let request = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          resolve(request.responseText);
        } else {
          reject(request.status);
        }
      }
    };
    request.open(method, url);
    request.send(data);
  });
}
let p = ajax("GET", "/url");
p.then(function(text) {
  console.log(text);
}).catch(function(status) {
  console.log("ERROR: " + status);
});
```

在上述代码中，同样封装了一个 ajax 方法，不同的是函数中返回了一个 promise 实例，成功和失败执行的操作由 resolve 和 reject 代替  
可见 promise 最大的好处是将执行代码和处理结果的代码分离开，以链式的形式展现，不用再去写难看的嵌套代码了。  
那么怎么使用 promise 呢？  
举个栗子：

```javascript
function timer() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (false) {
        resolve("hello world");
      } else {
        reject("ERROR!");
      }
    }, 1000);
  });
}
timer()
  .then(function(data) {
    console.log(data);
  })
  .catch(function(err) {
    console.log(err);
  });
```

> 上述代码的结果是：在一秒钟之后输出‘hello world’

promise 实例的参数是一个函数，这个函数又有两个参数**resolve**, **reject**，分别对应成功执行的操作和失败执行的操作  
setTimeout 调用了 resolve，resolve 方法传递了一个参数`hello world`，传递参数与什么用呢？  
在下面执行的时候，then 方法的参数是一个函数，函数的参数 data 就是通过 resolve 传递的  
如果把 true 改为 false 呢？  
那么就会执行 else 中的命令，reject 传递了一个参数`ERROR`，在下面有一个 catch 方法，它的参数是一个函数，函式的参数 err 就是通过 reject 传递的

在上述代码中,timer 返回的是一个 promise 对象，过一秒之后才会执行 resolve 方法，then 会等到执行 resolve 方法的时候才会开始执行
当然，then 和 catch 方法最后返回的都是一个新的 promise

注意：

> - resolve 只接收一个参数，如果想传多个参数，必须以对象或数组的形式传递，否则 resolve 只能获取到第一个参数

### Promise.all()

如果想要实现当所有 promise 状态都为 resolve 或者 reject 的时候再执行下一个 then 或者 catch，那就要用到 promise.all()

```javascript
let start = Date.now();
function timer(num) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, num);
  });
}
Promise.all([timer(100), timer(200), timer(300)]).then(function() {
  console.log(Date.now() - start);
});
```

结果如下：  
![截图未命名.jpg](http://picstore.lliiooiill.cn/5c826954c1e7c.jpg)

可以看到输出的是 303，至于为什么不是 300，可能是因为执行其他命令也需要消耗时间，总之 Promise.all()方法做到了执行完三个 timer 再执行 then

### Promise.race()

Promise.race()和 Promise.all()其实非常相似，不同的地方在于 all 要求的是所有 Promise 的状态都要变为 resolve 或者 reject 的时候才会执行下一步的 then 或者 catch,但是 race 要求的是只要有一个 Promise 状态变为 resolve 或 reject 就会进行后续操作，在进行后续操作的同时，如果前面传入的一些 Promise 的状态还没有变为 resolve 或 reject，不会阻止这些 Promise 的执行

```javascript
let start = Date.now();
function timer(num) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(num);
    }, num);
  });
}
Promise.race([timer(100), timer(200), timer(300)]).then(function(num) {
  console.log(num);
});
```

输出结果：

![截图未命名.jpg](http://picstore.lliiooiill.cn/5c826954c1e7c.jpg)

因为 timer(100)最先执行完，Promise 状态变为 resolve，执行 then 操作，最后输出的是 100
所以 Promise 的目的是为了让代码逻辑更加清晰，而不是减少代码量，或者加快运行速率，很多时候 Promise 代码要比之前的代码量大很多。当然，Promise 并不是处理异步最好的办法，Async/Await 的方案比 Promise 还要好。