---
tags:
  - JS
  - JavaScript
---

# DOM 事件

DOM 一共分为四个级别：DOM0 级，DOM1 级，DOM2 级和 DOM3 级  
DOM 事件有三种：DOM0 级事件处理，DOM2 级事件处理和 DOM3 级事件处理  
如下图：

![1.jpg](http://picstore.lliiooiill.cn/2020031315023375.png)

## DOM0 级事件

```html
<button onclick="func">点我</button>
<script>
  function func() {
    console.log(1)
  }
</script>
```

这是 DOM0 之前 HTML 的事件处理，是最早的一种事件处理方式，也是最不推荐的一种。因为标签内事件所触发的函数名称和 JS 中的函数有强烈的耦合性，一旦函数名称修改，也必须修改 html 所触发的事件名，非常麻烦，但这种方法可以不需要操作 DOM 就完成事件的绑定。

DOM0 级事件处理就是**将函数赋给事件处理属性**：

```javascript
const btn = document.getElementById('btn')
btn.onclick = function () {
  console.log(1)
}
```

这种处理方式的优点是简单，具有跨浏览器的优势，所有浏览器都支持这种写法。如果想解绑事件可以使用`btn.onclick = null`来解绑事件。DOM0 事件处理的缺点也很明显，就是无法绑定多个处理函数，于是有了 DOM2 级事件处理。

## DOM2 级事件

DOM2 级事件弥补了 DOM0 级事件无法绑定多个处理函数的缺点：

```javascript
const btn = document.getElementById('btn')
function func() {
  console.log(1)
}
btn.addEventListener('click', func, false)
btn.addEventListener('mouseenter', func, true)

// 解绑事件
btn.removeEventListener('click', func, false)
btn.removeEventListener('mouseenter', func, true)
```

DOM2 级事件通过`addEventListener`方法监听事件的触发，想要解绑事件可以通过`removeEventListener`来解绑事件。

:::tip Notice
如果同一个监听事件分别为“事件捕获”和“事件冒泡”注册了一次，这两次事件需要分别移除。两者不会互相干扰。移除捕获监听器不会影响非捕获版本的相同监听器，反之亦然。
:::

## DOM3 级事件

DOM3 级事件并没有新增绑定事件的方法，而是添加了许多事件类型：

1. 变动事件，当底层 DOM 结构发生变化时触发，如：DOMsubtreeModified
2. UI 事件，当用户与页面上的元素交互时触发，如：load、scroll
3. 焦点事件，当元素获得或失去焦点时触发，如：blur、focus
4. 鼠标事件，当用户通过鼠标在页面执行操作时触发如：dbclick、mouseup
5. 滚轮事件，当使用鼠标滚轮或类似设备时触发，如：mousewheel
6. 文本事件，当在文档中输入文本时触发，如：textInput
7. 键盘事件，当用户通过键盘在页面上执行操作时触发，如：keydown、keypress
8. 合成事件，当为 IME（输入法编辑器）输入字符时触发，如：compositionstart

## DOM 事件流

这里着重说一下`addEventListener`这个方法，`addEventListener`接受三个参数，第一个是事件名称，第二个是事件处理函数，第三个布尔值，表示事件在何时执行。  
`true`代表事件在捕获阶段执行，`false`代表事件在冒泡阶段执行。

事件捕获和事件冒泡如下图所示：
![1.jpg](http://picstore.lliiooiill.cn/img_recreate02-1-1.jpg)

### 事件捕获

事件捕获是自上而下执行,首先`windows`会捕获到事件，然后`html`会捕获到，接着是`body`、最后是`div`捕获到。

举个栗子：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <div id="div1">
      <div id="div2">div2</div>
    </div>
    <script>
      const oDiv1 = document.getElementById('div1')
      const oDiv2 = document.getElementById('div2')
      oDiv1.addEventListener(
        'click',
        () => {
          console.info(2)
        },
        true
      )
      oDiv2.addEventListener(
        'click',
        () => {
          console.info(1)
        },
        true
      )
    </script>
  </body>
</html>
```

点击`div2`，最后控制台输出的是`2、1`，这是因为发生了事件捕获，在`div1`捕获到事件的时候会触发自身的`click`事件，等到`div2`捕获到事件的时候才会触发`div2`的`click`事件。

### 事件冒泡

事件冒泡和事件捕获恰恰相反，是自下而上执行：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <div id="div1">
      <div id="div2">div2</div>
    </div>
    <script>
      const oDiv1 = document.getElementById('div1')
      const oDiv2 = document.getElementById('div2')
      oDiv1.addEventListener(
        'click',
        () => {
          console.info(2)
        },
        false
      )
      oDiv2.addEventListener(
        'click',
        () => {
          console.info(1)
        },
        false
      )
    </script>
  </body>
</html>
```

点击`div2`，最后控制台输出的是`1、2`，这是因为发生了事件冒泡，在`div2`被点击之后出发自身的`click`事件，然后事件会冒泡到`div1`，触发`div1`的`click`事件。

了解了事件捕获和事件冒泡，做道题试一下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <div id="div1">
      <div id="div2">
        <div id="div3">div3</div>
      </div>
    </div>
    <script>
      const oDiv1 = document.getElementById('div1')
      const oDiv2 = document.getElementById('div2')
      const oDiv3 = document.getElementById('div3')
      oDiv1.addEventListener(
        'click',
        () => {
          console.info(1)
        },
        false
      )
      oDiv1.addEventListener(
        'click',
        () => {
          console.info(2)
        },
        true
      )
      oDiv2.addEventListener(
        'click',
        () => {
          console.info(3)
        },
        false
      )
      oDiv2.addEventListener(
        'click',
        () => {
          console.info(4)
        },
        true
      )
      oDiv3.addEventListener(
        'click',
        () => {
          console.info(5)
        },
        false
      )
      oDiv3.addEventListener(
        'click',
        () => {
          console.info(6)
        },
        true
      )
    </script>
  </body>
</html>
```

点击`div3`，会输出什么？  
答案是： `2、4、5、6、3、1`  
下面来分析一下步骤：

1. div1 捕获事件发生，输出 2
2. div2 捕获事件发生，输出 4
3. div3 冒泡事件发生，输出 5
4. div3 捕获事件发生，输出 6
5. div2 冒泡事件发生，输出 3
6. div1 冒泡事件发生，输出 1

这里就有疑问了，不应该是先捕获，再冒泡的么，为什么这里是先执行冒泡呢？

因为我们点击的是`div3`，也就是说在`div1`和`div2`捕获完成的时候，已经处于事件目标阶段，而不是事件冒泡阶段，这个时候，在绑定捕获代码之前写了绑定的冒泡阶段的代码，所以在目标元素上就不会遵守先发生捕获后发生冒泡这一规则，而是先绑定的事件先发生。按照从上到下的顺序，先绑定的事件就先执行。而不是按照捕获和冒泡的顺序。

### 事件委托

事件委托就是利用冒泡的原理，把事件加到父元素或祖先元素上，触发执行效果。

事件委托有什么优点呢？假如`ul`中又 100 个`li`标签，我需要在点击`li`的时候获取该`li`的文本内容，那么我就要利用`for`循环给每一个`li`添加一个`click`事件,操作`DOM`本身就是一个消耗资源的操作，加上`for`循环，简直就是噩梦。访问`DOM`的次数越多，引起浏览器重回与回流的次数就越多，如何减少`DOM`操作？答案是**事件委托**。

看下面的代码：

```html
<ul id="list">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
  <li>6</li>
  <!--...-->
</ul>
<script>
  ;(function () {
    const list = document.getElementById('list')
    list.addEventListener('click', showText, false)
    function showText(e) {
      const x = e.target
      if (x.nodeName.toLowerCase() === 'li') {
        alert('The color is ' + x.innerText)
      }
    }
  })()
</script>
```

利用事件冒泡机制，只要点击`li`就会触发`ul`上的`click`事件，事件处理函数接受一个参数`event`，`event`是一个对象，它提供了参数`target`，`target`就可以表示当前事件操作的`DOM`，但仅仅是可以表示而已，因为它不是真正的`DOM`，可以用`nodeName`来获取标签名，由于标签名是大写的，所以转换成小写（便于查看），这样就只会在点击 li 的时候触发该事件了。

事件委托相比原始的`for`循环事件绑定大大减少了`DOM`操作，只需要监听一个`ul`就能达到效果。
