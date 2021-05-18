# Webpack 生命周期

Webpack 整体流程图如下：

![webpack生命周期.jpg](https://i.loli.net/2020/04/10/DHi8YULbw1fzcMW.jpg)

下面将注意说明整个流程。

## webpack.config.js 和 shell 解析

webpack.config.js 大致结构如下：

```javascript
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

module.exports = {
    // 入口文件，是模块构建的起点，同时每一个入口文件对应最后生成的一个 chunk。
    entry: {
        bundle: [
            'webpack/hot/dev-server',
            'webpack-dev-server/client?http://localhost:8080',
            path.resolve(__dirname, 'app/app.js')
        ],
    },
    // 文件路径指向(可加快打包过程)。
    resolve: {
        alias: {
            'react': pathToReact
        }
    },
    // 生成文件，是模块构建的终点，包括输出文件与输出路径。
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },
    // 这里配置了处理各模块的 loader ，包括 css 预处理 loader ，es6 编译 loader，图片处理 loader。
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ],
        noParse: [pathToReact]
    },
    // webpack 各插件对象，在 webpack 的事件流中执行对应的方法。
    plugins: [
        new webpack.HotModuleReplacementPlugin();
    ]
};
```

整个流程的**第一步就是对 config 文件和 shell 进行解析**

每次在命令行输入 webpack 后，操作系统都会去调用 ./node_modules/.bin/webpack 这个 shell 脚本。这个脚本会去调用./node_modules/webpack/bin/webpack.js 并追加输入的参数，如 -p , -w 。(图中 webpack.js 是 webpack 的启动文件，而 \$@ 是后缀参数)。

在 webpack.js 这个文件中 **webpack 通过 optimist 将用户配置的 webpack.config.js 和 shell 脚本传过来的参数整合成 options 对象**传到了下一个流程的控制对象中。

### optimist

optimist 可以对 node 命令行进行解析，**用于激活 webpack 的加载项和插件**

在获取到参数以后，optimist 分析参数并以键值对的形式把参数对象保存在 optimist.argv 中。

假如我在命令行输入：

```dash
webpack --hot -w
```

那么 optimist.argv 的内容就会是：

```javascript
{
  hot: true,
  profile: false,
  watch: true,
  // 其他配置
}
```

### config 的合并与插件加载

在 shell 解析完毕后，需要进行 config 的合并与插件加载。

webpack 将 webpack.config.js 中的各个配置项拷贝到 options 对象中，并加载用户配置在 webpack.config.js 的 plugins 。接着 optimist.argv 会被传入 **./node_modules/webpack/bin/convert-argv.js** 中，通过判断 argv 中参数的值决定是否去加载对应插件。

最后的 options 对象包含了构建阶段所需要的重要信息。

```javascript
{
  entry: {},//入口配置
  output: {}, //输出配置
  plugins: [], //插件集合(配置文件 + shell指令)
  module: { loaders: [ [Object] ] }, //模块配置
  context: //工程路径
  // 其他配置
}
```

相对于 webpack.config.js 文件的配置只是多了一些 shell 传入的插件对象。

插件对象初始化完毕，options 将被传入下一个流程。

## 编译与构建

在获取 options 对象后，webpack 将开始初始化。

这时 Compiler 开始运作：

```javascript
function webpack(options) {
  var compiler = new Compiler();
  ...// 检查options,若watch字段为true,则开启watch线程
  return compiler;
}
```

`compiler.run` 方法将被执行，用来编译和构建流程，其中**主要的事件结点如下**：

- compile 开始编译。
- make 从入口点分析模块及其依赖的模块，创建这些模块对象。
- build-module 构建模块。
- after-compile 完成构建。
- seal 封装构建结果。
- emit 把各个 chunk 输出到结果文件。
- after-emit 完成输出。

### 构建 Compilation

`compiler.run` 方法会构建出 Compilation 对象。

Compilation 的作用如下：

- 负责组织整个打包过程，包含每个构建环节及输出环节所对应的方法。
- 存放着所有 module ，chunk，生成的 asset 以及用来生成最后打包文件的 template 的信息。

### 编译与构建流程

在构建模块之前，make 先被触发，并调用 `Compilation.addEntry` 方法，通过 options 对象中的 entry(入口) 字段找到入口 js 文件。

找到后会在 addEntry 中调用私有方法 `_addModuleChain`，作用是根据模块的类型获取对应的模块工厂并创建模块，二是构建模块。

其中，构建模块分为三步：

- 调用各 loader 处理模块之间的依赖。
  - webpack 调用 `doBuild()`，对每一个 `require()` 用对应的 loader(url-loader,css-loader 等) 进行加工，最后生成一个 js module。
- 调用 acorn 解析经 loader 处理后的源文件生成抽象语法树 AST。
- 遍历 AST，构建该模块所依赖的模块。
  - 对于当前模块，或许存在着多个依赖模块。当前模块会开辟一个依赖模块的数组，在遍历 AST 时，将 `require()` 中的模块通过 `addDependency()` 添加到数组中。
  - 当前模块构建完成后，webpack 调用 `processModuleDependencies` 开始递归处理依赖的 module，接着就会重复之前的构建步骤。

### module 处理

module 是 webpack 构建的核心实体，也是所有 module 的 父类

无论是哪种 module，都要调用 `build()` 方法构建：

```javascript
// 初始化module信息，如context,id,chunks,dependencies等。
NormalModule.prototype.build = function build(options, compilation, resolver, fs, callback) {
  this.buildTimestamp = new Date().getTime() // 构建计时
  this.built = true
  return this.doBuild(
    options,
    compilation,
    resolver,
    fs,
    function(err) {
      // 指定模块引用，不经acorn解析
      if (options.module && options.module.noParse) {
        if (Array.isArray(options.module.noParse)) {
          if (
            options.module.noParse.some(function(regExp) {
              return typeof regExp === 'string' ? this.request.indexOf(regExp) === 0 : regExp.test(this.request)
            }, this)
          )
            return callback()
        } else if (
          typeof options.module.noParse === 'string'
            ? this.request.indexOf(options.module.noParse) === 0
            : options.module.noParse.test(this.request)
        ) {
          return callback()
        }
      }
      // 由acorn解析生成ast
      try {
        this.parser.parse(this._source.source(), {
          current: this,
          module: this,
          compilation: compilation,
          options: options,
        })
      } catch (e) {
        var source = this._source.source()
        this._source = null
        return callback(new ModuleParseError(this, source, e))
      }
      return callback()
    }.bind(this)
  )
}
```

除了 `build` 外，每种 module 还包括构建到输出一系列的有关 module 生命周期的函数。

### 打包输出

webpack 会调用 Compilation 中的 `createChunkAssets` 方法进行打包后代码的生成。

首先 `createChunkAssets` 会判断文件是入口 js 还是异步加载的 js，然后采取不同的模板对象进行封装。

入口 js 会采取 render 事件触发 Template 类中的 `renderChunkModules`。

异步加载的 js 会调用 chunkTemplate 中的 `render` 方法。

- 模块封装

模块在封装的时候和它在构建时一样，都是调用各模块类中的方法。封装通过调用 module.source() 来进行各操作。

- 生成 assets

各模块进行 doBlock 后，把 module 的最终代码循环添加到 source 中。一个 source 对应着一个 asset 对象，该对象保存了单个文件的文件名( name )和最终代码( value )。
