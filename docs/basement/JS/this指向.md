# this指向

> 作为JS最复杂的几个机制之一，`this` 的指向往往是很难判断的，经常会出现因为 `this` 指向不对而导致的问题

以前我一直不明白 `this` 的机制到底是什么，直到看了《你不知道的JS》才算明白一些

在弄清 `this` 的指向之前，要先知道为什么要用 `this`，因为 `this` 这种难以判断的东西应该少用才是，为什么那么常用呢？

```javascript
const obj = {
  name: "Tom",
  age: 16,
  setInfo(attribute, value) {
    this.attribute = value;
  },
  getInfo(attribute) {
    console.log(this.attribute);
  }
};
obj.setInfo("name", "Lisa");
obj.getInfo("name");
```

上面的例子实现了一个设置并且获取对象属性的功能，在 `setInfo`和 `getInfo` 方法中可以通过 `this` 获取该对象实例

如果不使用 `this` 呢？

```javascript
const obj = {
  name: "Tom",
  age: 16,
  setInfo(attribute, value) {
    obj.attribute = value;
  },
  getInfo(attribute) {
    console.log(obj.attribute);
  }
};
obj.setInfo("name", "Lisa");
obj.getInfo("name");
```

不使用 `this` 同样能实现效果，唯一的不同是将 `this` 替换成了该对象的名称，这样做的缺点非常明显：耦合性太强，复用性也低，如果我们事先不知道对象的名称该怎么办呢？

```javascript
function animal(name, age) {
  this.name = name;
  this.age = age;
}
animal.prototype.setInfo = function(attribute, value) {
  this[attribute] = value;
};
animal.prototype.getInfo = function(attribute) {
  console.log(this[attribute]);
};

let cat = new animal("Tom", 6);
let mouse = new animal("Jerry", 4);

cat.getInfo("name"); //'Tom'
mouse.getInfo("name"); //'Jerry'
```

在实际项目中往往需要创建多个对象实例，这里我用组合模式实现该效果，可以看看到，在这种情况下是无法确定究竟是哪个对象调用 `setInfo` 和 `getInfo` 的

这个时候 `this` 的作用就体现出来了

## 默认绑定

默认绑定指的是没有人为的指定 `this` 的指向，这时候 `this` 指向全局对象 `window`

```javascript
var a = 1;
function func() {
  console.log(this.a);
}
func();
```

上述代码中，`func` 中的 `this` 指向的就是 `this`

但其实我个人认为默认绑定是一种隐式绑定：

```javascript
window.a = 1;
function func() {
  console.log(this.a);
}
window.func();
```

因为`a`和`func`都是在全局声明的，所以它们都属于`window`对象，只是在调用的时候可以省略掉`window`而已，这样`this`指向的实际就是调用它的对象`window`

:::tip Notice
注意：这里我是用`var`声明`a`的，如果替换成`let`或者`const`，那么输出的就会是`undefined`，因为它们的顶层对象不是`window`
:::

## 隐式绑定

```javascript
const obj = {
  a: 1,
  foo: foo
};
function foo() {
  console.log(this.a);
}
obj.foo();
```

在上述例子中，`obj`包含对`foo`的引用，因为`foo`是作为`obj`的属性被调用的（虽然`foo`实际上不属于`obj`），所以`this`指向的是`obj`

隐式绑定经常会发生绑定丢失的问题，看下面的例子：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo: foo
};
var a = 2;
var bar = obj.foo;
bar();
```

表面上我将`obj.foo`赋给`bar`，那么调用`bar`输出的应该是`obj`的`a`，但实际上只是将`obj.foo`这个函数本身给了`bar`而已，`bar`是作为全局对象的属性被调用的，所以`bar`输出的是全局对象的`a`

绑定丢失同样会发生在函数传参过程中：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo: foo
};
var a = 2;
function bar(func) {
  func();
}
bar(obj.foo);
```

`bar`仍然会输出 2，虽然`obj.foo`确实是传入了`bar`，但是在`bar`的内部，执行的并不是`obj.foo()`，在传参过程中会发生隐式赋值，将`obj.foo`赋给`func`，所以这其实和上一种情况是相同的，只是没有那么明显，如果你知道函数传参是按值传递，而不是按引用传递的话，那应该很快就能理解

不光是我们自己定义的函数会发生这种情况，`js`内置函数同样会出现这个问题：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo: foo
};
var a = 2;
setTimeout(obj.foo, 200);
```

还是输出 2，因为`js`中内置的`setTimeout`函数的实现类似于下面的代码:

```javascript
function setTimeout(func, time) {
  //time毫秒之后
  func();
}
```

所以仍然发生了绑定丢失，那么有什么方法可以解决这个问题呢？

## 显式绑定

我们知道隐式绑定会发生绑定丢失

强制绑定可以避免这种情况，可以使用`call`或者`apply`来实现显式绑定：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo: foo
};
var a = 2;
foo.call(obj); //1
```

`call`和`apply`的作用是一样的，唯一的不同是参数形式的不同：

- apply 接收两个参数，第一个参数是 this 指向，第二个参数是一个数组，用来存储传入函数的参数
- call 接受若干个参数，第一个参数是 this 指向，后面的参数全部都是传入函数的参数，用逗号分隔

使用`call`方法的前提是你已经知道函数需要多少个参数，如果事先不清楚要传多少个参数，最好用`apply`

但是这还不能够解决绑定丢失的问题，需要采用硬绑定：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 1,
  foo: foo
};
var a = 2;
function bar() {
  foo.call(obj);
}
setTimeout(bar, 100);
```

硬绑定可以保证`bar`无论在哪里被调用都不可能修改内部的`this`

硬绑定是一种非常常用的模式，比如创建一个可以重复使用的函数：

```javascript
function compare(newValue) {
  if (newValue < this.value) {
    console.log(this.value);
  } else {
    console.log(newValue);
  }
}
let obj = {
  value: 1
};
let bar = compare.bind(obj);
let a = bar(2); //2
```

这里我没有使用`call`或者`apply`，因为`ES5`为`function`提供了内置方法`bind`来绑定`this`，`bind`会返回一个新的函数，它会将`this`绑定到你制定的对象上，并调用原始函数

bind 的内部实现可以这样的代码理解：

```javascript
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      // 可能的与 ECMAScript 5 内部的 IsCallable 函数最接近的东西
      throw new TypeError(
        "Function.prototype.bind - what " +
          "is trying to be bound is not callable"
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {}, //用作做中间桥梁的空函数(原型继承)
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP && oThis //如果后面又对返回的fBound函数进行new操作了,那oThis为空,new绑定覆盖原绑定
            ? this
            : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };
    fNOP.prototype = this.prototype; //因为返回的apply方法只继承构造方法,所以得连上原函数的prototype
    fBound.prototype = new fNOP(); //利用原型式继承

    return fBound;
  };
}
```

这是`MDN`上关于`bind`方法的描述，可以说是最接近`ES5`的`bind`实现方法了：

1. 首先判断调用者是否为函数  
2. 传入 othis，othis 指的就是调用 bind 时指定的 this 指向目标  
3. Array.prototype.slice.call( arguments, 1 )将传入的第一个参数作为预设参数  
4. aArgs.concat( Array.prototype.slice.call( arguments ) )将剪切下来的第一个参数和 arguments 连接  
5. 将调用者的 prototype 指向 fNOP 的 prototype

## new 绑定

看下面的代码：

```javascript
function foo(name, age) {
  this.name = name;
  this.age = age;
}
foo.prototype.getInfo = function(attribute) {
  console.log(this[attribute]);
};
let b = new foo("Tom", 16);
b.getInfo("name"); //Tom
```

在一些后端语言中，使用`new`初始化一个类的时候会调用类中的构造函数，但在`js`中原理是完全不一样的，在`js`中只有被`new`调用的函数才能叫作构造函数，构造函数不属于也不会实例化某个类，严格的来说它甚至不能叫做构造函数，`new foo()`只是对`foo`函数的构造调用而已,而 foo 只是一个被 new 调用的普通函数

那么`new`操作符究竟做了些什么呢？

1. 创建一个全新的空对象
2. 设置原型链，将新对象的`_proto_`属性指向构造函数的`prototype`
3. 将构造函数的`this`指向新对象
4. 如果是值类型，返回新对象，如果是引用类型，返回这个引用类型的对象

同样地，`new`绑定也可以改变`this`的指向

## 软绑定

硬绑定可以解决隐式绑定中绑定丢失的问题，但是这样会造成许多问题，比如硬绑定之后无法再改变`this`的指向，使得函数的灵活性大大降低

如果可以给默认绑定一个全局对象和`undefined`以外的值，就可以实现和硬绑定一样的效果，同时又可以解决无法手动修改`this`指向的问题

```javascript
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this;
    var curried = [].slice.call(arguments, 1);
    var bound = function() {
      return fn.apply(
        !this || this === (window || global) ? obj : this,
        curried.concat.apply(curried, arguments)
      );
    };
    bound.prototype = Object.create(fn.prototype);
    return bound;
  };
}
```

我们可以看到软绑定的代码其实和`ES5`内置的`bind`方法有些相似，它会检查调用时的`this`，如果`this`绑定到全局或者`undefined`，那就把指定的默认对象`obj`绑定到`this`，否则不会修改`this`，此外，这段代码还支持可选的函数柯里化

## 箭头函数的 this 指向

上面几种绑定方式都可应用于普通函数中，但是箭头函数是一个例外

箭头函数是 ES6 定义的一个特殊函数类型，它不会根据上面所述的几种规则改变 this 指向，而是根据外层作用域来决定 this

```javascript
this.name = "Jerry";
const obj = {
  name: "Tom",
  func: function() {
    return () => {
      console.log(this.name);
    };
  }
};
let b = obj.func();
b(); //Tom
```

结果非常让人惊讶，如果想看待普通函数一样看待箭头函数的话，那么因为将`obj.func()`赋给 b 这个操作已经丢失了对`obj`的引用，那么`this`指向的就应该是`window`而不是`obj`，但事实是，`this`的指向根本没有改变，这是为什么呢？

因为在`func`内部创建箭头函数的时候，箭头函数会捕获调用时`func`的`this`，由于`func`的`this`是绑定在`obj`上的，所以`b`中的`this`也会绑定到`obj`上，这和硬绑定有一些相似，同样地，箭头函数中的`this`无法被修改，即使是使用`new`也不行

为什么会造成这种结果？因为箭头函数本身无法绑定 this！也就是说他根本没有自己的 this！它会捕获其所在（即定义的位置）上下文的 this 值，作为自己的 this 值，它的 this 在它定义的时候就已经确定了

虽然箭头函数无法修改`this`绑定，但是其本身的机制可以解决很多防止`this`丢失的问题：

```javascript
this.a = 2;
const obj = {
  a: 1,
  func: function() {
    let that = this;
    setTimeout(function() {
      console.log(that.a);
    }, 100);
  }
};
obj.func();
```

这是在箭头函数之前经常用来解决`this`丢失的方法，在函数内把 this 存进一个变量中，这样`settimeout`便不会使用默认绑定，如果是箭头函数呢？也能达到同样的效果，箭头函数不需要创建一个变量来储存`this`，听起来蛮不错的，当然它也不是没有缺点，比如可读性较低，混合使用箭头函数和普通函数也会使得代码更加难维护等等。