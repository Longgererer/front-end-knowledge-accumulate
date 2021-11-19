# JS 垃圾回收机制

我们在写一些底层语言如 C 的时候，会学习到 `malloc` 这样用于内存分配的接口，但在 JavaScript 中，这些接口没有暴露给开发者。JavaScript 的策略是在创建变量时分配内存，并在不使用它的时候**自动释放**内存进行垃圾回收(简称 GC)。但这里有个很明显的问题：**如何界定变量是否需要使用呢？**，因此本篇文章我们讨论一下 JavaScript 内部是如何处理垃圾回收的。

在我们深入研究垃圾回收器的内部工作原理之前，首先来看看堆是如何组织的。V8将堆分为了几个不同的区域：

- **新生区**：大多数对象被分配在这里。新生区是一个很小的区域，垃圾回收在这个区域非常频繁，与其他区域相独立。
- **老生指针区**：这里包含大多数可能存在指向其他对象的指针的对象。大多数在新生区存活一段时间之后的对象都会被挪到这里。
- **老生数据区**：这里存放只包含原始数据的对象（这些对象没有指向其他对象的指针）。字符串、封箱的数字以及未封箱的双精度数字数组，在新生区存活一段时间后会被移动到这里。
- **大对象区**：这里存放体积超越其他区大小的对象。每个对象有自己mmap产生的内存。垃圾回收器从不移动大对象。
- **代码区**：代码对象，也就是包含JIT之后指令的对象，会被分配到这里。这是唯一拥有执行权限的内存区（不过如果代码对象因过大而放在大对象区，则该大对象所对应的内存也是可执行的。译注：但是大对象内存区本身不是可执行的内存区）。
- **Cell区、属性Cell区、Map区**：这些区域存放Cell、属性Cell和Map，每个区域因为都是存放相同大小的元素，因此内存结构很简单。

## 可达性

如果一个值**可以通过某种方式访问到或可用**，那么它就是可达的，并且一定存储在内存中。

譬如当前执行函数内使用到的变量和参数、全局变量和许多 JavaScript 的内置全局对象等等。

举几个例子：

```javascript
let obj = {
  a: 1,
}
```

假设改代码在全局执行，我们知道 `Object` 是引用类型，因此 `obj` 存在对对象 `{a: 1}` 的引用。因此，该对象具有可达性，JavaScript 不会自动回收该对象。

```javascript
obj = null
```

现在我们重新将 `obj` 设置为 `null`，先前的对象 `{a: 1}` 已经无法访问到，JavaScript 会认为它是垃圾数据并进行回收，释放内存。

### 其他引用

如果一个值被多次引用呢？我们来看看：

```javascript
let obj1 = {
  a: 1,
}
let obj2 = obj1
```

有经验的小伙伴们应该明白：`obj1` 和 `obj2` 都只是对对象 `{a: 1}` 进行引用，因此二者指向的是同一个值。这个时候单单对 `obj1` 重新赋值是不会触发 GC 的，需要：

```javascript
obj1 = null
obj2 = null
```

现在看个复杂点的：

```javascript
function sum() {
  let a = 0
  let b = 0
  return function(addVal) {
    return (a += addVal)
  }
}
const b = sum()
b(10)
b(20)
```

这里我们写了一个闭包函数，那么在函数 `sum` 中哪些变量会被回收呢？我们可以用 Chrome 进行断点调试查看：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625539348%281%29.png">![](http://picstore.lliiooiill.cn/1625539348%281%29.png)</a>

我们可以看到，在返回的闭包(`Closure`)函数内只有引用了变量 `a`，而没有 `b`，这说明变量 `b` 已经被回收了，**JavaScript 不会回收闭包内引用到的外部函数的变量，反之则会进行 GC**。

## 垃圾收集策略

好了，我们现在大体明白在什么情况下 JavaScript 会进行 GC，那么它采用的回收策略是什么呢？

JavaScript 使用两种著名的策略来执行 GC：**引用计数技术**和**标记清除算法**。

### 引用计数

最初级的 GC 算法，该算法把 “对象是否不再需要” 定义为**对象有没有其他对象引用到它**，如果该对象引用次数为 0，则进行 GC。

```javascript
let obj1 = {
  a: 1,
} // 现在{a: 1}的引用次数为1
let obj2 = obj1 // 现在{a: 1}的引用次数为2
obj1 = null // 现在{a: 1}的引用次数为1
let a = obj2.a // 引用{a: 1}对象的a属性，现在{a: 1}的引用次数为2
obj2 = null // 现在{a: 1}的引用次数为1，还不能回收
a = null // 现在{a: 1}的引用次数为0，可以进行GC
```

引用计数方法看似没问题，其实有个明显的限制：**无法处理循环引用的对象**。

考虑以下情况：

```javascript
function func() {
  const obj1 = {}
  const obj2 = {}
  obj1.a = obj2
  obj2.a = obj1
}
func()
```

按照引用计数的思想，即使函数 `func` 执行完毕，这两个对象也不会被回收，因为这两个对象存在着至少一次相互引用，即便脱离了函数作用域，这两个对象还是存在于内存中。

IE6，7 中的 GC 采用的就是这种方式对 DOM 对象进行 GC，处理循环引用的时候很有可能会造成内存泄漏。

### 标记清除算法

标记清除算法将 “对象是否不再需要” 简化为 **对象是否可以获得**。

该算法步骤如下：

- 垃圾收集器找到所有的根，并标记他们。
- 遍历并标记来自它们的所有引用。
- 遍历标记的对象并标记它们的引用，所有被遍历到的对象都会被记住，以免将来再次遍历到同一个对象。
- ……如此操作，直到所有可达的（从根部）引用都被访问到。
- 没有被标记的对象都会被删除。

按照该算法的思想，**如果一个值无法通过任何路径访问到，就进行 GC**。

如果配上图可以理解得更快：

例如，使我们的对象有如下的结构：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625542504%281%29.jpg">![](http://picstore.lliiooiill.cn/1625542504%281%29.jpg)</a>

我们可以清楚地看到右侧有一个“无法到达的岛屿”。现在我们来看看“标记和清除”垃圾收集器如何处理它。

第一步标记所有的根

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625542524%281%29.jpg">![](http://picstore.lliiooiill.cn/1625542524%281%29.jpg)</a>

然后它们的引用被标记了：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625542548%281%29.jpg">![](http://picstore.lliiooiill.cn/1625542548%281%29.jpg)</a>

……如果还有引用的话，继续标记：

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625545819%281%29.jpg">![](http://picstore.lliiooiill.cn/1625545819%281%29.jpg)</a>

现在，无法通过这个过程访问到的对象被认为是不可达的，并且会被删除。

<a data-fancybox title="" href="http://picstore.lliiooiill.cn/1625545836%281%29.jpg">![](http://picstore.lliiooiill.cn/1625545836%281%29.jpg)</a>

相对于引用计数法，标记清除不会受困于循环引用，因此许多 JavaScript 引擎选择使用该算法进行 GC。

## 总结

通过上面的讨论，我们得知：

- JavaScript 会自动进行垃圾回收。
- 标记清除算法是现在主流的 GC 算法。
- 开发者也需要多注意清理不需要的对象节省内存开销。

## 参考文章

- [内存管理-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)
- [垃圾回收](https://zh.javascript.info/garbage-collection)
- [JavaScript 内部原理：垃圾收集](https://blog.appsignal.com/2020/10/21/garbage-collection-in-javascript.html)
- [V8 之旅： 垃圾回收器](http://newhtml.net/v8-garbage-collection/)
