# Git 详解

在说 git 之前，先说说它和 svn 等版本控制工具的不同。

从对待数据的方法上来说，大部分工具是以**文件变更列表**的方式储存，它们将存储的信息看作是一组基本文件和每个文件随时间逐步积累的差异(**基于差异的版本控制**)。

git 则不然，它更像是一个把数据看成是对小型文件系统的一系列快照，每当提交更新或保存项目状态时，就会对当时项目的全部文件创建一个快照并保存这个快照的索引，**如果文件没被修改，git 就不会重新存储该文件，而是保留一个链接指向之前存储的文件**，这么来看，git 对待数据更像是快照流而不是差异流。

## 五种状态

git 有五种状态：

- **未跟踪**(untracked)未跟踪，此文件在文件夹中，但并没有加入到 git 库，不参与版本控制。执行 `git add` 变为 staged。
- **未修改**(unmodified)文件已经入库，未修改，即版本库中的文件快照内容与文件夹中完全一致。
- **已修改**(modified)表示修改了文件，但还没保存到数据库中。
- **已暂存**(staged)表示对一个已修改文件的当前版本做了标记，使之包含在下次提交的快照中。执行 `git rm --cached [file]` 置为 untracked。
- **已提交**(committed)表示数据已经安全地保存在本地数据库中。

![](http://picstore.lliiooiill.cn/63651-20170909091456335-1787774607.jpg)

所以 git 项目拥有三个阶段：**工作区**、**暂存区**和**git 仓库目录**。

工作区是对项目的某个版本独立提取出来的内容，从 git 仓库中将文件提取出来放到磁盘上修改。

暂存区是一个保存了下次将要提交的文件信息的文件，一般在 git 仓库目录中。

git 仓库目录时 git 用来保存项目的元数据核对像数据库的地方，是 git 中最重要的部分。

基本的 git 工作流程如下：

1. 在工作区中修改文件。
2. 将你想要下次提交的更改选择性地暂存，这样只会将更改的部分添加到暂存区。
3. 提交更新，找到暂存区的文件，将快照永久性存储到 git 目录。

## 命令

在目录中初始化仓库。

```bash
git init
```

如果在一个非空文件夹进行版本控制，可以使用 add 来指定所需文件进行追踪。

`git add` 既可以追踪文件，也可以把已跟踪的文件放到暂存区，还能用于合并时把有冲突的文件标记为已解决状态等，所以这个命令的作用应该是**精确地将内容添加到下一次提交中**。

```bash
git add 文件路径
```

克隆现有的仓库

```bash
git clone 仓库链接
```

可以查看哪些文件处于什么状态，不外乎两种：已跟踪或未跟踪。

```bash
git status
```

运行 commit 提交，注意：**commit 提交的是最后一次运行 add 时暂存的版本，而不是当前工作目录的版本，如果想提交最新版本，需要再使用 add 重新暂存**。

```bash
git commit
```

如果想要 git 忽略一些不需要提交的文件，创建 `.gitignore`。

```bash
cat .gitignore
*.[oa] // 忽略所有以.o或.a结尾的文件
*~ // 忽略所有~结尾的文件
```

如果想知道具体修改了哪些内容，使用 diff 查看。

`git diff` 本身只显示尚未暂存的改动，而不是自提交以来所做的所有改动，如果你用 add 暂存了改动的文件，使用 diff 将不会看到结果。

```bash
git diff
```

mv 命令可以改动文件名。

```bash
git mv 改动前名字 改动后名字
```

运行 mv 等同于：

```bash
mv 改动前名字 改动后名字
git rm 改动前名字
git add 改动后名字
```

使用 log 命令查看提交历史，在不输入任何参数的条件下默认按时间顺序输出所有提交历史，包含作者名字，邮件地址等等。

```bash
git log
```

如果只是想快速浏览某个搭档的提交所带来的变化，可以使用 patch 参数。

```bash
git log --patch
```

下面是一些 log 命令的常用参数：

| 参数            | 说明                                                                                                      |
| :-------------- | :-------------------------------------------------------------------------------------------------------- |
| `-p`            | 按补丁格式显示每个提交引入的差异                                                                          |
| `--stat`        | 显示每次提交的文件修改统计信息                                                                            |
| `--shortstat`   | 只显示 --stat 中最后的行数修改添加移除统计                                                                |
| `--pretty`      | 使用其他格式显示历史提交信息。可用的选项包括 oneline、short、full、fuller 和 format（用来定义自己的格式） |
| `--graph`       | 在日志旁以 ASCII 图形显示分支与合并历史                                                                   |
| `--name-status` | 显示新增、修改、删除的文件清单                                                                            |
| `--name-only`   | 仅在提交信息后显示已修改的文件清单                                                                        |

有的时候提交完才发现有几个文件没有添加，或者提交信息写错了，可以使用 amend 重新提交。

```bash
git commit --amend
```

可以推送自己的项目到远程仓库。

```bash
git push origin master
```

## 分支

之前我们说过，git 对待数据是以快照的方式保存。

在进行 commit 提交时，git 会保存一个提交对象。该对象包含一个指向暂存内容快照的指针，还包含作者的姓名，邮箱等等信息以及指向它的父对象的指针。当然，首次提交的提交对象没有父对象。多个分支合并产生的提交对象则有多个父对象。

假设有一个工作目录，里面包含了三个将要被暂存和提交的文件，暂存操作会为每一个文件计算校验和。然后把当前版本文件的快照保存到 git 仓库，然后将校验和加入到暂存区域等待提交。

这样 git 仓库就有五个对象：三个**保存着文件快照的 blob**，一个**记录着目录结构和 blob 对象索引的树对象**，以及一个**提交对象**。

当做些修改后再次提交，这次产生地提交对象会包含一个指向上一个提交对象的指针。

git 的分支实质上是一个**指向提交对象的可变指针**，git 的默认分支名字是 master，这和其他分支并没有区别。

创建新分支：

```bash
git branch test
```

这会在当前提交对象上创建一个指针，当然，这仅仅是创建一个新分支，并不会自动切换到新分支上。

可以使用 checkout 切换分支

```bash
git checkout test
```

创建并切换分支

```bash
git checkout -b test
```

主分支会随着提交操作自动向前移动，当 test 和 master 分支指向的提交对象不同时，切换分支会使工作目录恢复成切换分支所指向的快照内容，这便于项目向另一个方向进发。

这会使提交历史产生分叉：

![](https://git-scm.com/book/en/v2/images/advance-master.png)

想要合并分支的话，先切换到 master 上，再合并分支：

```bash
git checkout master // 单人开发
git pull origin master // 如果是多人开发，可能需要把远程master的代码pull下来
git merge test // 把test合并到master上
```

删除分支：

```bash
git push origin -d test // 删除远程分支
git branch -d test // 删除本地分支
```

如果在两个不同的分支中对同一文件的同一个部分进行了不同的修改，就会产生合并冲突。

这时 git 做了合并，但是没有创建一个新的合并提交，git 会暂停下来等待你解决冲突。

使用 `git status` 查看冲突(unmerged)文件，这样就可以打开这些文件然后手动解决冲突。

fetch 命令可以更新你的远程追踪分支。

```bash
git fetch
```

remote 可以查看已存在的远程分支

```bash
git remote
```

## git 高级命令

**跳到之前的分支**：

```bash
git checkout -
```

**查看我的分支和 master 的不同**：

```bash
git diff master..my-branch
```

### git commit --amend

提交后发现有错误，修正。"amend" 是「修正」的意思。当前 commit 上增加一个 commit，而是会把当前 commit 的内容和暂存区里的内容合并起来，创建一个新的 commit，并用这个新的 commit 替换掉当前 commit。

**编辑上次提交**：

```bash
git commit --amend -m "更好的提交日志"
```

**在上次提交中附加一些内容，保持提交日志不变**：

```bash
git add . && git commit --amend --no-edit
```

### git reset --hard HEAD^

提交后修正都不想，写的太烂了，直接丢弃。HEAD 就是当前 commit 的引用，HEAD^表示的 HEAD 的父 commit。

**丢弃上一次提交，重置回上次提交前的状态**：

```bash
git reset --hard HEAD^ # 回退到上一版
git reset --hard HEAD^^ # 回退到倒数第二版
git reset --hard 3628164 # 回退到 commit id 为3628164的版本
```

### git rebase

merge 之后，commit 历史就会出现分叉，这种分叉再汇合的结构会让有些人觉得混乱
可以用 rebase 来代替 merge，就不会出现分叉。

在 master 分支上合并 branch1：

```bash
git checkout master
git merge branch1
```

如果把 merge 换成 rebase，可以这样操作：

```bash
git checkout branch1 # 签出分支branch1 HEAD 指向了 branch1
git rebase master # 站在branch 1上 rebase操作
```

### git pull --rebase

那就先看看 git pull，我们都知道是同步代码，拉取远程最新的代码 git pull 命令其本质是：把远程仓库使用 git fetch 取下来以后再进行 git merge 操作的。

如果本地什么都没有修改 git pull 其实是和 git fetch 一样的。

如果在本地什么都没有修改的情况下 git pull rebase 和 git pull 和 git fetch 都是一样的。

有修改的情况下 git pull rebase 相比会改变父 commit。--rebase 可以让提交记录看起来很连续和优美，而不是多出很多无用的 merge commit。

### git stash

在代码写了一部分后，而这时想要切换到另一个分支做其他事情，又不想因为过会儿回到这一点而做了一半的工作创建一次提交。这种场景下就可以使用 git stash 命令。

git stash 的意思是暂存，可以把我们工作目录所有的未提交的修改都保存起来。

git stash pop 就是将暂存的修改恢复回未提交状态，它会与当前工作区的代码合并。

git stash drop 丢弃最近一次stash的文件

git stash clear 删除所有的stash

## git 协议

git 可以使用四种不同的协议传输资料：**本地协议**，**HTTP 协议**，**SSH 协议**和 **git 协议**。

## git 常见面试题

### 常用到几种 git 命令

- 初始化 git 仓库：`git init`
- 将文件添加到下一次提交中(暂存区)：`git add file` / `git add .`
- 查看工作区状况：`git status`
- 拉取远程分支：`git fetch`
- 合并分支：`git merge`
- 拉取并合并分支：`git pull` = `git fetch` + `git merge`
- 提交暂存区的文件：`git commit`

### 提交时发生冲突，你能解释冲突是如何产生的吗，是如何解决的

两个不同的分支中对同一文件的同一个部分进行了不同的修改，就会产生合并冲突

对比本地文件和远程分支的文件，然后把远程分支上的文件内容修改到本地文件，然后再提交冲突文件，使其保证与远程分支文件一致，然后再提交自己修改的那部分。

使用命令：

- `git stash` 把工作区的修改提交到栈区，目的是保存工作区的修改。
- `git pull` 拉取远程分支上的代码并合并到本地分支，目的是消除冲突。
- `git stash pop` 把保存在栈区的修改部分合并到最新的工作空间中。

### 什么是 Git 中的“裸存储库”

创建裸存储库

```bash
git init --bare
```

裸存储库中只包含版本控制信息而没有工作文件，并且它不包含特殊的 `.git` 子目录，它直接在主目录本身包含 `.git` 子目录中的所有内容:

- 一个 `.git` 子目录，其中包含你的仓库所有相关的 git 修订历史记录。
- 工作树，或签出的项目文件的副本。

### 如何还原已经 push 并公开的提交

删除或修复新提交中的错误文件，并将其推送到远程存储库。这是修复错误的最自然方式。对文件进行必要的修改后，将其提交到我将使用的远程存储库。

### git merge 和 git rebase 的区别

git merge 会把分支的差异内容 pull 到本地，然后与本地分支的内容一并形成一个 committer 对象提交到主分支上，合并后的分支与主分支一致。

git rebase 会把分支优先合并到主分支，然后把本地分支的 commit 放到主分支后面，合并后的分支就好像从合并后主分支又拉了一个分支一样，本地分支本身不会保留提交历史。

![](http://picstore.lliiooiill.cn/1_pzT4KMiZDOFsMOKH-cJjfQ.png)

从上图就可以看出，rebase 可以提供一套线性的，清晰的代码修改历史。而 merge 则很容易产生网状结构，很难去研究每个历史对应的代码。

但这并不代表 rebase 比 merge 要好，因为 rebase 并不是将分支中的 commit 直接拼在主分支的后面，而是会创建新的 commit，因此会失去分支改动的历史。

在别人合并了你的代码以后，并且增加了提交就不能使用 git rebase 了，这时他已经在你的提交节点上产生了新的提交节点，如果此时你在本地使用 git rebase 你们两者的提交历史将会不一致，再次合并时又会产生一个全新的合并记录，这样 git rebase 就失去了意义。（一般多人开发时基本不用 git rebase 这个命令，因为你大多数情况下是不知道同事是否已经提交过代码的）

### 如何把本地仓库的内容推向一个空的远程仓库

先连接远程仓库：

```bash
git remote add origin 远程仓库地址
```

如果是第一次推送，则进行下面命令，-u 是指定 origin 为默认主分支

```bash
git push -u origin master
```

### fork，branch，clone 之间有什么区别

fork 是对存储仓库进行远程的，服务器端的拷贝，从源头上就有区别，实际上不属于 git 范畴。

clone 不是复刻，克隆是对某个远程仓库的本地拷贝，拷贝的是整个仓库，包括所有历史记录和分支。

branch 是代码的一个独立版本，**用于处理单一存储仓库中的变更，并最终目的是用于与其他部分代码合并**。

## 常用命令速查表

[git命令大全](https://juejin.cn/post/6844903598522908686)

![](http://picstore.lliiooiill.cn/3248447-92fbd92bdad2a763.jpg)

## 相关教程

- [阮一峰 Git 教程](https://www.bookstack.cn/read/git-tutorial/README.md)