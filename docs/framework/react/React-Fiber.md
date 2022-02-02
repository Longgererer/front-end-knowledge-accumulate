# React Fiber

## 什么是 React Fiber？

> React Fiber 是对 React 核心的完全重写，换句话说，它是对旧版本的 React reconciler 的重新实现。

在 UI 首次渲染时，React 会创建一个虚拟 DOM 树，来模拟真实的 DOM 树；然后 React 遍历树，在需要渲染更改时生成一个新的虚拟 DOM 树，更新需要更新的类或元素的 DOM，这个叫 **Reconciliation**(协调)。本质上，在任何 UI 更新之后，React 都会比较新老两棵虚拟 DOM 树中的每个节点，并将累积的更改传递给渲染器。

基于此，我们考虑以下场景：

由于页面中**包含大量的组件**，当数据发生变化时，React 可能会花许多时间遍历各个节点比较，如果超出了浏览器每次刷新间隔时间(16.7ms)，那么就**没有时间执行样式布局和样式绘制了**，这样会导致渲染不流畅，产生掉帧。在 Fiber 出现之前，堆栈协调器是同步的。**所以，一个更新会递归地遍历整个树，并制作一个树的副本。假设在这之间，如果有其他的更新比它的优先级更高，那么就没有机会中止或暂停第一个更新并执行第二个更新**。

为了解决这个问题，React16 **将递归的无法中断的更新重构为异步的可中断更新**，由于曾经用于递归的虚拟 DOM 数据结构已经无法满足需要。于是，全新的 Fiber 架构应运而生。

Fiber 并不是新的概念，中文名叫**纤程**，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。

纤程实际上可以理解为协程的一种实现方式，在 JavaScript 中协程的实现便是 `Generator`。

因此 React Fiber 可以理解为 **React 内部实现的一套状态更新机制。支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态**。

## React Fiber 的解决方案

React Fiber 对于页面卡顿解决方案可以概括为三个方面：

1. 利用浏览器的空闲时间执行任务，不会长时间占用主线程。
2. 因为利用了空闲时间执行任务，所以任务需要可以被随时中断，而迭代是无法中断的，循环是随时可以中断的，因此用循环替代迭代。
3. 将对比更新操作拆分成一个个小的任务，细化到每一个 React Element 对应的 Fiber 节点。

## 调度

我们知道 React Fiber 可以调度节点的更新任务，假设我们有一些低优先级的工作(如大型计算函数或最近获取的元素的渲染)，和一些高优先级的工作(如动画)，该怎么办呢？

这个时候就应该将高优先级的工作优先于低优先级的工作，**在旧的堆栈协调器实现中，递归遍历和调用整个更新的树的渲染方法都发生在单个流程中，这可能会导致丢帧**。

### requestIdleCallback

`requestAnimationFrame` 安排高优先级的函数在下一个动画帧之前被调用。类似地，`requestIdleCallback` 安排低优先级或非必要的函数在帧结束时的空闲时间被调用。

```js
function lowPriorityWork(deadline) {
  while (deadline.timeRemaining() > 0 && workList.length > 0) {
    performUnitOfWork()
  }
  if (workList.length > 0) {
    requestIdleCallback(lowPriorityWork)
  }
}
```

`lowPriorityWork` 是一个回调函数，将在帧结束时的空闲时间内被调用。`lowPriorityWork` 会判断空余时间是否大于 `0`，如果大于 `0`，就可以做一些必要的工作，而如果工作没有完成，可以在下一帧的最后一行再次安排工作。

React Fiber 的工作就类似于这样。

## 工作原理

Fiber 节点构成的 Fiber 树对应 DOM 树，在 React 中最多会同时存在两棵 Fiber 树，当前屏幕上显示内容对应的 Fiber 树称为 **current Fiber 树**，正在内存中构建的 Fiber 树称为 **workInProgress Fiber 树**。

每次状态更新都会产生新的 workInProgress Fiber 树，然后与 current Fiber 树相比较，通过新老节点的替换完成更新。

### FiberNode

React 内部使用 [FiberNode](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117) 定义 Fiber 节点的属性，每个 Fiber 节点有个对应的 React Element，并且有各自的父子和兄弟节点指向。

```js
function FiberNode(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode) {
  // 作为静态数据结构的属性
  this.tag = tag
  this.key = key
  this.elementType = null
  this.type = null
  this.stateNode = null

  // 用于连接其他Fiber节点形成Fiber树
  // 指向父级Fiber节点
  this.return = null
  // 指向子Fiber节点
  this.child = null
  // 指向右边第一个兄弟Fiber节点
  this.sibling = null
  this.index = 0

  this.ref = null

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps
  this.memoizedProps = null
  this.updateQueue = null
  this.memoizedState = null
  this.dependencies = null

  this.mode = mode

  this.effectTag = NoEffect
  this.nextEffect = null

  this.firstEffect = null
  this.lastEffect = null

  // 调度优先级相关
  this.lanes = NoLanes
  this.childLanes = NoLanes

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null
}
```

### 遍历

Fiber 树的遍历遵循深度优先：

1. Fiber 从最上面的 React 元素开始遍历，并为其创建一个 Fiber 节点。
2. 然后，它转到子元素，为这个元素创建一个 Fiber 节点。这样继续下去，直到到达叶子元素。
3. 现在，它检查是否有兄弟节点元素。如果有，它就遍历兄弟节点元素，然后再到兄弟姐妹的叶子元素。
4. 如果没有兄弟节点，那么它就返回到父节点。

### 初始渲染

在第一次渲染之前，不会有任何树。React Fiber 遍历每个组件的渲染函数的输出，并为每个 React 元素在树上创建一个 Fiber 节点。

比如下面这段代码：

```jsx
function App() {
  return (
    <div className="wrapper">
      {' '}
      {/* A */}
      <div className="list">
        {' '}
        {/* B */}
        <div className="list-item">List item A</div> {/* C */}
        <div className="list-item">List item B</div> {/* D */}
      </div>
      <div className="btn-group">
        {/* E */}
        <button>btn1</button> {/* F */}
        <button>btn2</button> {/* G */}
      </div>
    </div>
  )
}
```

在第一次渲染之前，不会有任何树。React Fiber 遍历每个组件的渲染函数的输出，遍历的顺序就如上面的注释字母顺序所示。

结合上边说的 FiberNode 属性，可以得出整个 Fiber 树的大致结构为：

![](http://picstore.lliiooiill.cn/1643703590%281%29.jpg)

### 更新阶段

如果是程序运行过程中由特定 API 如(setState)导致的更新的情况怎么办呢？

这个时候，内存中存在 current Fiber 和 workInProgress Fiber 两棵树，这个时候就不会为每个 React Element 创建 FiberNode 了。Fiber 会将每一个更新任务分等级，如动画，或用户输入的优先级高于从获取的数据中渲染项目的列表。

Fiber 使用 `requestAnimationFrame` 来处理优先级较高的更新，使用 `requestIdleCallback` 的 polyfill 处理优先级较低的更新。因此，在调度工作时，Fiber 检查当前更新的优先级和 deadline(帧结束后的自由时间)。**如果优先级高于待处理的工作，或者没有截止日期或者截止日期尚未到达，Fiber 可以在一帧之后安排多个工作单元。而下一组工作单元会被带到更多的帧上**。这就是使 Fiber 有可能暂停、重用和中止工作单元的原因。

#### scheduler 调度算法

scheduler 是用来做任务调度的，所有任务在一个调度生命周期内都有一个过期时间与调度优先级，但是调度优先级最终还是会转换为过期时间，只是过期时间长短的问题，过期时间越短代表越饥饿，优先级也就越高，但已经过期了的任务也会被视为饥饿任务。

调度优先级分为：

- 立即执行优先级，立即过期
- 用户阻塞型优先级，250 毫秒后过期
- 空闲优先级，永不过期，可以在任意空闲时间内执行
- 普通优先级，5 秒后过期

一个调度生命周期分为几个阶段：

1. 调度前
   - 注册任务队列(环状链表，头接尾，尾接头)，按照过期时间从小到大排列，如果当前任务是最饥饿的任务，则排到最前面，并立即开始调度，如果并不是最饥饿的任务，则放到队列中间或者最后面，不做任何操作，等待被调度。
2. 调度准备
   - 通过 `requestAnimationFrame` 在下一次屏幕刚开始刷新的帧起点时计算当前帧的截止时间(33 毫秒内)。
   - 如果不超过当前帧的截止时间且当前任务没有过期，进入任务调度。
   - 如果已经超过当前帧的截止时间，但没有过期，进入下一帧，并更新计算帧截止时间，重新判断时间(轮询判断)，直到没有任何过期超时或者超时才进入任务调度。
   - 如果已经超过当前帧的截止时间，同时已经过期，进入过期调度。
3. 正式调度
   - 执行调度
     - 在当前帧的截止时间前批量调用所有任务，不管是否过期。
   - 过期调度
     - 批量调用饥饿任务或超时任务的回调，删除任务节点。
4. 调度完成
5. 检查任务队列是否还有任务
   - 先执行最饥饿的任务。
   - 如果存在任务，则进入下一帧，进入下一个调度生命周期。

### 渲染阶段

这个阶段也可以叫做协调阶段，我们知道 React 的协调算法就是从 Fiber 树的根部开始遍历，处理每个 FiberNode，我们可以把处理步骤分为开始和结束两个阶段。

Fiber 的源代码在：[GitHub](https://github.com/facebook/react/blob/f765f022534958bcf49120bf23bc1aa665e8f651/packages/react-reconciler/)

#### 开始

遍历从 [workLoop](https://github.com/facebook/react/blob/f765f022534958bcf49120bf23bc1aa665e8f651/packages/react-reconciler/src/ReactFiberScheduler.js#L1136) 函数开始，它调用 `performUnitOfWork` 函数，`performUnitOfWork` 函数内部调用 `beginWork` 函数，这是 Fiber 上发生实际工作的地方。

在 React 中使用 [beginWork](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.new.js) 函数进行渲染的开始阶段工作，如果 Fiber 没有任何待处理的工作，它就会直接跳出(跳过) Fiber 而不进入开始阶段。这就是在遍历大树时，Fiber 跳过已经处理过的 Fiber ，直接跳到有待处理工作的 Fiber。

如果有子 Fiber，`beginWork` 函数返回子 Fiber，如果没有子 Fiber 则返回空。函数 `performUnitOfWork` 持续迭代并调用子 Fiber，直到叶节点到达。在叶子节点的情况下，`beginWork` 返回 `null`，因为没有任何子节点，`performUnitOfWork` 函数调用 `completeUnitOfWork` 函数，进入结束阶段。

#### 结束

这个 `completeUnitOfWork` 函数通过调用一个 `completeWork` 函数来完成当前单位的工作。如果有的话，`completeUnitOfWork` 会返回一个同级的 Fiber 来执行下一个工作单元，如果没有工作的话，则会完成 return(parent) Fiber 。这将一直持续到返回值为空，也就是说，直到它到达根节点。和 `beginWork` 一样，`completeWork` 也是一个发生实际工作的函数，而 `completeUnitOfWork` 是用于迭代的。

渲染阶段的结果会产生一个效果列表(副作用)。这些效果就像插入、更新或删除宿主组件的节点，或调用类组件节点的生命周期方法。这些 Fiber 被标记为各自的效果标签。

### 提交阶段

这是一个阶段，完成的工作将被用来在用户界面上渲染它。由于这一阶段的结果对用户来说是可见的，所以不能被分成部分渲染。这个阶段是一个同步的阶段。

在这里，workInProgress 树替换为 current 树，实际的 DOM 更新，如插入、更新、删除，以及对生命周期方法的调用或者更新相对应的引用发生在 effect(副作用) 列表中的节点上。

## 放弃 requestIdleCallback

很遗憾，React16 至今都没有真正使用上 `requestIdleCallback`，而是 hack 了一个 `requestIdleCallback`，主要还是因为浏览器的兼容性和各个浏览器对于 `requestIdleCallback` 的运行机制不同的问题。

`requestIdleCallback` 的执行间隔时间是 React 认为的一个可以接受的最大值，默认为 33ms，如果运行设备能做到大于 30fps，那么它会去调整这个值(通常情况下可以调整到 16.6ms)。调整策略是用当前每帧的总时间与实际每帧的时间进行比较，当实际时间小于当前时间且稳定(前后两次都小于当前时间)，那么就会认为这个值是有效的，然后将每帧时间调整为该值(取前后两次中时间大的值)。

## 参考文章

- [Introduction to React Fiber](https://flexiple.com/react/react-fiber/#:~:text=FAQs-,What%20is%20React%20Fiber%3F,new%20reconciliation%20algorithm%20in%20React.)
- [React fiber 原理解析及自定义实现（一）](https://segmentfault.com/a/1190000039227277#:~:text=Fiber%E5%B0%B1%E6%98%AFReact%E6%8F%90%E5%87%BA%E7%9A%84,%E4%B8%80%E4%B8%AA%E4%B8%AA%E5%B0%8F%E7%9A%84%E4%BB%BB%E5%8A%A1%E3%80%82)
- [React 技术揭秘](https://react.iamkasong.com/)
- [React Fiber 简介 —— React 背后的算法](https://juejin.cn/post/7006612306809323533)
- [浅谈 React Scheduler 任务管理](https://zhuanlan.zhihu.com/p/48254036)
