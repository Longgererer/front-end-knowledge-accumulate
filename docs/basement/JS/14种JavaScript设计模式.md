---
tags:
  - JavaScript
  - JS
  - 设计模式
---

# 14 种 JavaScript 设计模式

看了 《JavaScript 设计模式与开发实践》 一书，深有感触，想总结一下

## 单例模式

> 单例模式顾名思义就是只需要一个对象就够了，比如弹窗，就算点击多次按钮也只会跳出一次弹窗

这就需要一个变量判断弹窗对象是否已经创建过，如果创建过则直接返回之前创建的对象

但是还有一个问题，这个按钮我也许永远不会点，那么就没有必要在页面加载时就创建好，只需要点击按钮的时候在创建就好了，也就是**惰性单例**

```javascript
let loginBtn = document.getElementById('login')
loginBtn.onclick = function() {
  let pupUp = createPupUp()
  pupUp.style.display = 'block'
}
let createPupUp = (function() {
  let pupUp
  return function() {
    if (!pupUp) {
      pupUp = document.createElement('div')
      pupUp.innerText = 'login'
      pupUp.style.display = 'none'
      document.body.appendChild(pupUp)
    }
    return pupUp
  }
})()
```

一个可用的惰性单例就完成了，通过上述代码我们可以得出惰性单利的固定逻辑：

```javascript
let obj
if (!obj) {
  //执行代码
}
```

我们可以根据固定逻辑封装一个可复用的函数中

```javascript
let singleMode = function(fn) {
  let ele
  return function() {
    ele = ele || fn.apply(this, arguments)
    return ele
  }
}
```

由于创建不同对象的代码是有差异的，所以将创建对象的方法 `fn` 分离开作为参数传入，用变量 `ele` 保存 `fn` 的结果，由于闭包的机制，`ele` 永远不会被销毁，这就保证了创建对象的唯一性

```javascript
let createPupUp = function() {
  pupUp = document.createElement('div')
  pupUp.innerText = 'login'
  pupUp.style.display = 'none'
  document.body.appendChild(pupUp)
  return pupUp
}
let singleMode = function(fn) {
  let ele
  return function() {
    ele = ele || fn.apply(this, arguments)
    return ele
  }
}
let CreateSinglePupUp = singleMode(createPupUp)
loginBtn.onclick = function() {
  let pupUp = CreateSinglePupUp()
  pupUp.style.display = 'block'
}
```

## 策略模式

在实现某些功能的时候，与很多途径，我们的目的是找到最为合适的方法实现功能

这种模式可以解决很多问题，比如年终奖

在公司发放年终奖的时候一般会根据员工绩效不同发放不同倍数的奖金

```javascript
const reward = {
  s: function(salary) {
    return salary * 4
  },
  a: function(salary) {
    return salary * 3
  },
  b: function(salary) {
    return salary * 2
  },
}
let calcReward = function(level, salary) {
  return reward[level](salary)
}
```

策略模式还可以用于表单验证

验证代码

```javascript
const formCheck = {
  isNoEmpty: function(value, err) {
    if (value === '') {
      return err
    }
  },
  minLength: function(value, length, err) {
    if (value.length < length) {
      return err
    }
  },
  isMobile: function(value, err) {
    if (!/(^1[3|5|9][0-9]{9}$)/.test(value)) {
      return err
    }
  },
}
```

接下来利用 `Validator` 类将请求委托给 `formCheck` 对象

```javascript
const form = document.getElementById('form')
let validatorFunc = function() {
  let validator = new validator()
  validator.add(form.userName, 'isNoEmpty', '用户名不能为空')
  validator.add(form.password, 'minLength:6', '密码长度不能少于六位')
  validator.add(form.phoneNumber, 'isMobile', '手机号码格式不正确')
  let err = validator.start()
  return err
}
```

然后给表单绑定提交事件

```javascript
form.onsubmit = function() {
  const err = validatorFunc()
  if (err) {
    alert(err)
    return false
  }
}
```

`Validator` 类的实现：

```javascript
let Validator = function() {
  this.rules = []
}
Validator.prototype.add = function(dom, rule, err) {
  let ary = rule.split(':')
  this.rules.push(function() {
    let choose = ary.shift()
    ary.unshift(dom.value)
    ary.push(err)
    return formCheck[choose].apply(dom, ary)
  })
}
Validator.prototype.start = function() {
  for (let i = 0, validatorFunc; (validatorFunc = this.rules[i++]); ) {
    let msg = validatorFunc()
    if (msg) return msg
  }
}
```

## 代理模式

代理模式顾名思义就是想做一件事情，但因为某些客观因素无法直接完成，需要一个代理帮忙完成

代理分为两种： 保护代理和虚拟代理

保护代理可以帮助我们去除一些不需要或没必要的请求，比如一个演员很有名，一出门很多人都想找他要签名，合影。但是演员要去拍戏，没时间，但又不好直接拒绝有损形象，这时就要保镖(保护代理)上前阻拦粉丝。

虚拟代理可以帮助我们再合适的情况下接受请求，比如有一部戏要找演员拍，但是演员生病了，那么虚拟代理就可以等到演员病好之后再将戏拿给他拍

虚拟代理可以实现图片预加载，因为加载图片非常耗费流量和时间，图片在加载完成之前会显示为空白，使得网页很难看，常见做法是先用一张 `loading` 图片占位，用异步方式加载图片，等图片加载好了在填充到页面中

我们可以写一个创建 `img` 节点并设置图片 `src` 的方法

```javascript
let createImg = (function() {
  const imgNode = document.createElement('img')
  document.body.appendChild(imgNode)
  return {
    setSrc: function(src) {
      imgNode.src = src
    },
  }
})()
```

然后创建代理：

```javascript
let proxyImg = (function() {
  const img = new Image()
  img.onload = function() {
    createImg.setSrc(this.src)
  }
  return {
    setSrc: function(src) {
      createImg.setSrc('./loading.gif')
      img.src = src
    },
  }
})()
proxyImg.setSrc('./image1.gif')
```

让我们捋一下思路：

首先我们执行了 `proxyImg.setSrc` 方法并将真实图片路径作为参数传入，但 `setSrc` 并不会把他传给 `createImg`，而是先传一个加载动画图片，而真正图片则会在图片加载完毕触发 `onload` 方法时传入以实现图片预加载

不知道上大学的你是否深有感触：每次提交作业，老师会先让班干部把作业收齐之后再全部发到老师邮箱，这样方便查看，如果老师直接收的话，就会产生几十份邮件而不是一份，这样老师查看作业将会很麻烦

首先我们创建一个选项表单：

```html
<form action="">
  <input type="checkbox" id="1" />1 <input type="checkbox" id="2" />2 <input type="checkbox" id="3" />3
  <input type="checkbox" id="4" />4 <input type="checkbox" id="5" />5
</form>
```

每选择一个选项都要发送请求给服务器，像我这种会认真考虑的人通常会一步到位，最后发给服务器的信息不超过五条，但如果有故意捣乱的人，使劲乱点的话，服务器可就吃不消了

解决方法是收集一段时间内的请求再一次性发给服务器

```javascript
let sendReq = function(id) {
  console.log(`发送请求${id}`)
  // 执行代码
}
let proxyReq = (function() {
  let cache = []
  let timer = null
  return function(id) {
    cache.push(id)
    if (timer) return
    timer = setTimeout(function() {
      sendReq(cache.join(','))
      clearTimeout(timer)
      timer = null
      cache.length = 0
    }, 5000)
  }
})()
let checkbox = document.getElementsByTagName('input')
for (let i = checkbox.length; i--; ) {
  checkbox[i].onclick = function() {
    if (this.checked === true) proxyReq(this.id)
  }
}
```

流程是这样的：给每个 `checkbox` 绑定 `onclick` 事件，如果被选中执行 `proxyReq`，`proxyReq` 方法会将要发送的 `id` 存储在数组中，等到 5 秒之后才会执行 `sendReq` 发送请求

说完了预加载，再说一下懒加载吧，和预加载一样，懒加载是网站制作经常要用到的技术，同样适用于图片的加载，加入网站中用很多图片需要加载，那么我们可以只加载出现在可视区域内的图片

实际上懒加载经常和预加载一起使用，但这里我就不写预加载相关代码了

我在页面中放一些图片，并指定宽高

```html
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
<img
  src="default.jpg"
  data-src="https://www.google.com/logos/doodles/2019/2019-womens-world-cup-day-25-4819909247238144-law.gif"
  alt=""
/>
```

我们将这些图片的 `src` 设置为一个默认的加载图片，自定义一个 `data-src` 属性存放真正的路径

```css
img {
  display: block;
  margin-bottom: 50px;
  width: 400px;
  height: 400px;
}
```

```javascript
const img = document.getElementsByTagName('img')
const num = img.length
let proxyLazy = (function() {
  let n = 0
  return function() {
    const height = document.documentElement.clientHeight
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    for (let i = n; i < num; i++) {
      if (img[i].offsetTop < height + scrollTop) {
        if (img[i].getAttribute('src') == 'default.jpg') {
          img[i].src = img[i].getAttribute('data-src')
        }
        n++
      }
    }
  }
})()
window.onscroll = proxyLazy
```

可以说非常简单了

接下来是缓存代理

缓存代理可以为开销大的结果提供暂时存储，下次运算的时候可以直接返回前面存储的结果

真实的缓存代理可能是很复杂的，这里用一个求乘积的例子代替

```javascript
let multiply = function(...arr) {
  let result = 1
  for (let i = arr.length; i--; ) {
    result *= arr[i]
  }
  return result
}
let proxyMultiply = function(fn) {
  let cache = {}
  return function(...args) {
    let argsStr = args.join(',')
    if (argsStr in cache) {
      return cache[argsStr]
    }
    return (cache[argsStr] = fn(...args))
  }
}
let calc = proxyMultiply(multiply)
console.log(calc(1, 2, 3, 4))
console.log(calc(1, 2, 3, 4))
```

在实际项目常常会遇到分页的需求，比如后台管理系统，表格中的信息需要分很多页，这个时候就要讲已经浏览过的页面上的信息缓存下来，以防止下次切换到同一页再次进行请求

## 迭代器模式

迭代器模式可以把迭代的过程从业务逻辑中分离开，在使用迭代器模式之后，即使不管新对象的内部构造，也可以按顺序访问其中的每一个元素

### 内部迭代器和外部迭代器

```javascript
let each = function(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    fn.call(arr[i], i)
  }
}
```

这就是一个简单的内部迭代器，外界根本不应关心迭代器是怎么实现的，也只需要调用一次迭代器就可以了

但是内部迭代器的规则已经固定了，只能遍历一个数组，如果想遍历两个就不行了

外部迭代器需要显式地请求迭代下一个元素

```javascript
let Iterator = function(obj) {
  let current = 0
  let next = function() {
    current++
  }
  let isOver = function() {
    return current >= obj.length
  }
  let getItem = function() {
    return obj[current]
  }
  return {
    next,
    isOver,
    getItem,
    length: obj.length,
  }
}
```

迭代器模式也是很常用的，但是我不认为它是一种模式，因为很多语言都内置了迭代器，不需要自己编写迭代器

## 发布-订阅模式

假如我想买房，询问售楼处得知房价太贵买不起，客服告诉我过几天会打折，但具体时间也不知道，那么我需要每天都打电话给客服问他有没有打折，这样非常麻烦，我们想要的是当房价打折的时候，客服主动打电话通知我们

实际上往往有一个中介公司帮我们收集各个售楼处的信息，这样订阅者不必关心是哪个售楼处的信息，售楼处也不必知道信息要发给哪个订阅者，但是发布者和订阅者都需要知道中介公司的存在

```javascript
let Event = (function() {
  let list = {}
  let listen = function(key, fn) {
    if (!list[key]) list[key] = []
    list[key].push(fn)
  }
  let trigger = function() {
    let key = Array.prototype.shift.call(arguments)
    let fns = list[key]
    if (!fns || fns.length === 0) return false
    for (let i = fns.length; i--; ) {
      fns[i].apply(this, arguments)
    }
  }
  let remove = function(key, fn) {
    let fns = list[key]
    if (!fns) return false
    if (!fn) fns && (fns.length = 0)
    else {
      for (let l = fns.length - 1; l >= 0; l--) {
        let fnsItem = fns[l]
        if (fnsItem === fn) fns.splice(l, 1)
      }
    }
  }
  return {
    listen,
    trigger,
    remove,
  }
})()
let installEvent = function(obj) {
  for (let i in event) {
    obj[i] = event[i]
  }
}
Event.listen('info1', function(price) {
  console.log(price)
})
Event.listen('info2', function(price) {
  console.log(price)
})
salesOffices.trigger('info1', 1000)
salesOffices.trigger('info2', 2000)
```

## 命令模式

命令模式最常见的应用场景是，有时候要发送请求，但却不知道请求发给谁，也不知道被请求的操作是什么

假如我想用命令模式实现按钮的点击事件

```html
<button id="button1">添加</button>
<button id="button2">删除</button>
<button id="button3">修改</button>
```

```javascript
let btn1 = document.getElementById('button1')
let setCommand = function(btn, fn) {
  btn.onclick = function() {
    fn()
  }
}
let selectBar = {
  add: function() {
    console.log('添加')
  },
  edit: function() {
    console.log('修改')
  },
  del: function() {
    console.log('删除')
  },
}
let addCommand = function(receiver) {
  return function() {
    receiver.add()
  }
}
let add = addCommand(selectBar)
setCommand(btn1, add)
```

当然，这样的写法虽然实现了功能，但是 `receiver` 完全没有必要存在，只需要点击的时候执行 `selectBar.add` 就好了，完全不需要用什么模式，这种说法是正确的，我们可以不要 `receiver` 这个中间传递者

## 组合模式

事物是由相似的子事物构成的，比如我们就是由一个个原子构成的，而原子又是由更小的孙事物构成的，程序也是一样

组合模式可以用来表示树形结构，也可以用于宏命令

电脑中的文件夹就是一种树形结构，文件夹包含子文件夹，子文件夹里还包含许多文件

我们定义文件夹类和文件类，给他们加上 `add` 和 `scan` 方法用于添加和扫描文件

```javascript
let Folder = function(name) {
  this.name = name
  this.files = []
}
Folder.prototype.add = function(file) {
  this.files.push(file)
}
Folder.prototype.scan = function() {
  console.log(`扫描文件夹${this.name}`)
  for (let i = this.files.length; i--; ) {
    this.files[i].scan()
  }
}
let File = function(name) {
  this.name = name
}
File.prototype.add = function() {
  throw new Error('文件下面不能添加文件')
}
File.prototype.scan = function() {
  console.log(`扫描文件${this.name}`)
}
let folder = new Folder('0')
let folder1 = new Folder('1')
let folder2 = new Folder('2')
folder.add(folder1)
folder.add(folder2)
folder1.add(new File('1.1'))
folder1.add(new File('1.2'))
folder2.add(new File('2.1'))
folder.scan()
```

## 模板方法模式

我想冲一杯咖啡，冲一杯咖啡通常需要四个步骤：

- 烧水
- 冲咖啡
- 将咖啡倒进杯子
- 加糖

如果我想冲一杯茶，大致需要四个步骤：

- 烧水
- 泡茶
- 将茶倒进杯子
- 加柠檬

可以看到虽然一个是咖啡一个是茶，但操作步骤都是大致相同的，可以整理为下面四步：

- 烧水
- 用水冲泡原料
- 将饮料倒进杯子
- 加调料

首先我们要创建一个饮料类，在创建咖啡和茶类继承饮料类

```javascript
let Beverage = function() {}
Beverage.prototype.boilWater = function() {
  console.log('烧水')
}
Beverage.prototype.brew = function() {}
Beverage.prototype.pourCup = function() {}
Beverage.prototype.addCondiments = function() {}

Beverage.prototype.init = function() {
  this.boilWater()
  this.brew()
  this.pourCup()
  this.addCondiments()
}

let Coffee = function() {}
Coffee.prototype = new Beverage()

let Tea = function() {}
Tea.prototype = new Beverage()
```

接下来 `Coffee` 和 `Tea` 要重写 `Beverage` 类的方法

```javascript
Coffee.prototype.brew = function() {
  console.log('冲咖啡')
}
Coffee.prototype.pourCup = function() {
  console.log('将咖啡倒进杯子')
}
Coffee.prototype.addCondiments = function() {
  console.log('加糖')
}
Tea.prototype.brew = function() {
  console.log('泡茶')
}
Tea.prototype.pourCup = function() {
  console.log('将茶倒进杯子')
}
Tea.prototype.addCondiments = function() {
  console.log('加柠檬')
}
```

调用 `init` 方法初始化

```javascript
let coffee = new Coffee()
coffee.init()
let tea = new Tea()
tea.init()
```

这段代码的核心就是 `init`，它规定了冲泡饮料的顺序，子类按照这个顺序就可以完成冲泡饮料，这体现了模板方法模式

事实上这种模式严重依赖**抽象类**，在上面的例子中，饮料属于抽象类，因为没人知道饮料具体是什么，咖啡可以是饮料，茶也可以是饮料，这两个才是具体类

所以抽象类不能被实例化，只能被具体类继承，同时具体类中也要统统实现抽象类中的方法，如果具体类中没有实现类似 `brew` 的方法，那一定得不到一杯饮料

因为 `JS` 本身没有抽象类，所以可以使用 `TypeScript` 或者 `ES6` 来实现

## 享元模式

享元模式的核心是运用共享技术来有效支持大量细粒度的对象

一个公司设计了很多款式的衣服，需要找模特试穿看看效果，由于有 100 件衣服，所以需要找 100 个模特来试穿，不用我说你们已经看到问题在哪里了，只需要请一位模特试穿就好了，没有必要请 100 个，这就是享元模式

享元模式有外部状态和内部状态

- 内部状态存储与对象内部
- 内部状态可以被一些状态共享
- 内部状态独立于具体的场景，通常不会改变
- 外部状态取决于具体的场景，并根据场景而变化，外部状态不能被共享

我们需要将外部状态剥离出来，这样就只剩下了可以共享的内部状态

```javascript
const Model = function(gender) {
  this.gender = gender
}
Model.prototype.takephoto = function() {
  console.log(`${this.gender}穿着${this.underwear}`)
}
const maleModel = new Model('male')
const femaleModel = new Model('female')
for (let i = 1; i < 51; i++) {
  maleModel.underwear = `第${i}款衣服`
  maleModel.takephoto()
}
for (let i = 1; i < 51; i++) {
  femaleModel.underwear = `第${i}款衣服`
  femaleModel.takephoto()
}
```

我们将外部状态分离（模特的性别）

这样所有男装给一个男模特穿就好了，女模特也一样的，这样只需要两个模特而不是 100 个

## 职责链模式

挤公交的时候，由于人太多，我们往往不能亲自将钱投到收费口，因此我们需要将钱给前面的人，这样传递 `N` 次之后完成付费

该模式的最大优点是只需要知道链中的第一个节点，而弱化了发送者和接收者之间的联系

在逛网店的时候我们经常会被优惠所吸引，这里就涉及到职责链，比如商家提供了两种优惠：满 500 减 100，满三百减 50

这个时候一般会产生下面几个字段

- orderType：订单类型，满 500 的用户记为 1，满三百的用户记为 2，不满足任何要求的记为 3
- pay：表示用户是否已经付费，如果用户有 500 元的订单，但却没有付费，还是记为 false
- stock：表示当前用于普通用户购买的手机库存数量，已经支付过超过 500 或 300 的用户不受此限制

```javascript
let order500 = function(orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log('得到100元优惠券')
  } else {
    order200(orderType, pay, stock)
  }
}
let order300 = function(orderType, pay, stock) {
  if (orderType === 2 && pay === true) {
    console.log('得到50元优惠券')
  } else {
    orderNormal(orderType, pay, stock)
  }
}
let order300 = function(orderType, pay, stock) {
  if (orderType > 0) {
    console.log('没有优惠券')
  } else {
    console.log('手机库存不足')
  }
}
```

当然，这还不能完全体现职责链模式的特点，因为每一个节点都必须知道后面的节点是什么，这样大大降低了代码的灵活性

```javascript
let order500 = function(orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log('得到100元优惠券')
  } else {
    return 'next'
  }
}
let order300 = function(orderType, pay, stock) {
  if (orderType === 2 && pay === true) {
    console.log('得到50元优惠券')
  } else {
    return 'next'
  }
}
let order300 = function(orderType, pay, stock) {
  if (orderType > 0) {
    console.log('没有优惠券')
  } else {
    console.log('手机库存不足')
  }
}
```

然后我们定义一个 chain 类，在实例化的时候传递一个需要被包装的函数

```javascript
let Chain = function(fn) {
  this.fn = fn
  this.next = null
}
Chain.prototype.setNext = function(next) {
  this.next = next
}
Chain.prototype.passRequest = function() {
  let ret = this.fn.apply(this, arguments)
  if (ret === 'next') {
    return this.next && this.next.passRequest.apply(this.next, arguments)
  }
  return ret
}
```

我们把三个订单函数分别包装成职责链的节点

```javascript
let chainOrder500 = new Chain(order500)
let chainOrder300 = new Chain(order300)
let chainOrderNormal = new Chain(orderNormal)
```

指定节点在职责链中的顺序

```javascript
chainOrder500.setNext(chainOrder300)
chainOrder300.setNext(chainOrderNormal)
```

最后把请求传递给第一个节点

```javascript
chainOrder500.passRequest(1, true, 500) // 输出500元定金预购，得到100优惠券
```

这种方式大大增加了灵活性，以后我们要是想加入新的优惠券，直接在职责链中加入一个新的节点即可

## 中介者模式

有一个人 `A`，他和 `B`，`C`，`D`，`E` 是好朋友，假如有一天 `A` 发生了改变，那么必须同时通知 `B`，`C`，`D`，`E`，我们可以在这五个人之间创建一个中介者，这样只要通知中介者就够了

银行在存款人和贷款人之间也能看成一个中介。存款人 `A` 并不关心他的钱最后被谁借走。贷款人 `B` 也不关心他借来的钱来自谁的存款。因为有中介的存在，这场交易才变得如此方便

```javascript
var goods = {
  //库存
  'red|32G': 3,
  'red|16G': 5,
  'blue|32G': 3,
  'blue|16G': 6,
}
//中介者
var mediator = (function() {
  function id(id) {
    return document.getElementById(id)
  }
  var colorSelect = id('colorSelect'),
    memorySelect = id('memorySelect'),
    numberInput = id('numberInput'),
    colorInfo = id('colorInfo'),
    memoryInfo = id('memoryInfo'),
    numberInfo = id('numberInfo'),
    nextBtn = id('nextBtn')
  return {
    changed: function(obj) {
      var color = colorSelect.value,
        memory = memorySelect.value,
        number = numberInput.value,
        stock = goods[color + '|' + memory]
      if (obj === colorSelect) {
        colorInfo.innerHTML = color
      } else if (obj === memorySelect) {
        memoryInfo.innerHTML = memory
      } else if (obj === numberInput) {
        numberInfo.innerHTML = number
      }
      if (!color) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请选择手机颜色'
        return
      }
      if (!memory) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请选择内存大小'
        return
      }
      if (Number.isInteger(number - 0) && number > 0) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请输入正确的购买数量'
        return
      }
      nextBtn.disabled = false
      nextBtn.innerHTML = '放入购物车'
    },
  }
})()
//添加事件
colorSelect.onchange = function() {
  mediator.changed(this)
}
memorySelect.onchange = function() {
  mediator.changed(this)
}
numberInput.onchange = function() {
  mediator.changed(this)
}
```

## 装饰者模式

假设我们在制作一款飞行射击游戏，随着经验值的增加，我们操作的飞机对象可以升级成更厉害的飞机，一级的飞机只能发射子弹，二级的飞机可以发射火箭弹，三级的飞机可以发射导弹

我们来实现一下

```javascript
let plane = {
  fire: function() {
    console.log('发射子弹')
  },
}
let rocketShell = function() {
  console.log('发射火箭弹')
}
let guidedMissile = function() {
  console.log('发射导弹')
}
let fire1 = plane.fire
plane.fire = function() {
  fire1()
  rocketShell()
}
let fire2 = plane.fire
plane.fire = function() {
  fire2()
  guidedMissile()
}
plane.fire()
```

分别输出发射子弹，发射火箭弹，发射导弹

很多时候我们需要给程序添加额外的功能，但如果以前的功能是别人写的，你并不知道这个函数如何实现，那么可以在不改变原函数代码的情况下实现功能的添加

```javascript
function a() {
  console.log('这是原函数')
}
let _a = a
a = function() {
  _a()
  console.log('这是新添加的功能')
}
```

假如我想给 `window.onload` 事件绑定一个函数，但又不知道这个事件有没有被其他人绑定过，可以这样写

```javascript
window.onload = function() {
  console.log(1)
}
let _onload = window.onload || function() {}
window.onload = function() {
  _onload()
  console.log(2)
}
```

这样的代码是符合开放-封闭原则的

## 状态模式

有一个电灯，电灯的明暗由开关来控制，灯关掉的时候需要按下开关来开启电灯，电灯开启的时候需要按下开关关闭电灯

同一个开关按钮，在不同状态下，表现出来的行为是不一样的

```javascript
let Light = function() {
  this.state = 'off'
  this.button = null
}
Light.prototype.init = function() {
  let button = document.createElement('button')
  button.innerText = '开关'
  this.button = document.body.appendChild(button)
  this.button.onclick = () => {
    this.buttonWasPressed()
  }
}
Light.prototype.buttonWasPressed = function() {
  if (this.state === 'off') {
    console.log('开灯')
    this.state = 'on'
  } else if (this.state === 'on') {
    console.log('关灯')
    this.state = 'off'
  }
}
let light = new Light()
light.init()
```

## 适配器模式

适配器模式是一种亡羊补牢的模式，因为我们永远也不会知道未来会发生什么，所以当我们今天写的代码不再适用于新系统的时候，我们可以使用适配器模式将旧接口包装成新街口，使它继续保持生命力

```javascript
let googleMap = {
  show: function() {
    console.log('开始渲染谷歌地图')
  },
}
let baiduMap = {
  display: function() {
    console.log('开始渲染百度地图')
  },
}
let renderMap = function(map) {
  if (map.show instanceof Function) {
    map.show()
  }
}
let baiduMapAdapter = {
  show: function() {
    return baiduMap.display()
  },
}
renderMap(googleMap)
renderMap(baiduMapAdapter)
```

代码如上，一开始我们只显示谷歌地图，直接调用 `googleMap.show` 就可以了，但是现在还需要显示百度地图，但是百度地图渲染方法和谷歌的不一样，这就需要我们包装一下，不改动百度地图的源代码就解决问题
