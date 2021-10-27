# 常见 webpack 问题积累

## webpack loader 和 plugins 的区别？

loader 一般是将某个语法统一处理为统一的语法。比如将 `less` 转换为 `css`。

plugin 一般是在打包前或打包后对结果进行再次操作。是一个扩展器，它丰富了 webpack 本身，针对是 loader 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。

## 常用的 webpack loader？

- `raw-loader`：加载文件原始内容（utf-8）。
- `file-loader`：把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件 (处理图片和字体)。
- `url-loader`：与 `file-loader` 类似，区别是用户可以设置一个阈值，大于阈值会交给 `file-loader` 处理，小于阈值时返回文件 base64 形式编码 (处理图片和字体)。
- `source-map-loader`：加载额外的 Source Map 文件，以方便断点调试。
- `svg-inline-loader`：将压缩后的 SVG 内容注入代码中。
- `image-loader`：加载并且压缩图片文件。
- `json-loader` 加载 JSON 文件（默认包含）。
- `babel-loader`：把 ES6 转换成 ES5。
- `ts-loader`: 将 TypeScript 转换成 JavaScript。
- `css-loader`：加载 CSS，支持模块化、压缩、文件导入等特性。
- `style-loader`：把 CSS 代码注入到 JavaScript 中，通过 DOM 操作去加载 CSS。
- `postcss-loader`：扩展 CSS 语法，使用下一代 CSS，可以配合 autoprefixer 插件自动补齐 CSS3 前缀。
- `sass-loader`：将 SCSS/SASS 代码转换成 CSS。
- `eslint-loader`：通过 ESLint 检查 JavaScript 代码。
- `vue-loader`：加载 Vue.js 单文件组件。
- `i18n-loader`: 国际化。

## 常用的 webpack plugins？

- `webpack-bundle-analyzer`：可视化 Webpack 输出文件的体积 (业务组件、依赖第三方模块)。
- `define-plugin`：定义环境变量 (Webpack4 之后指定 mode 会自动配置)。
- `ignore-plugin`：忽略部分文件。
- `mini-css-extract-plugin`：分离样式文件，CSS 提取为独立文件，支持按需加载 (替代 extract-text-webpack-plugin)。

## Webpack 构建流程简单说一下？

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

**初始化参数**：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。

**开始编译**：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译。

**确定入口**：根据配置中的 entry 找出所有的入口文件。

**编译模块**：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。

**完成模块编译**：在经过第 4 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。

**输出资源**：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会。

**输出完成**：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

## 使用 webpack 开发时，你用过哪些可以提高效率的插件？

- `webpack-dashboard`：可以更友好的展示相关打包信息。
- `HotModuleReplacementPlugin`：模块热替换。

## 文件监听原理？

在发现源码发生变化时，自动重新构建出新的输出文件。

Webpack 开启监听模式，有两种方式：

启动 `webpack` 命令时，带上 `--watch` 参数在配置 `webpack.config.js` 中设置 `watch:true`。

缺点：每次需要手动刷新浏览器。

原理：轮询判断文件的最后编辑时间是否变化，如果某个文件发生了变化，并不会立刻告诉监听者，而是先缓存起来，等 `aggregateTimeout` 后再执行。

## 说一下 Webpack 的热更新原理吧？

热更新(`HMR`)可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块。

`HMR` 的核心就是客户端从服务端拉去更新后的文件，准确的说是 `chunk diff` (`chunk` 需要更新的部分)，实际上 `WDS` 与浏览器之间维护了一个 `Websocket`，当本地资源发生变化时，`WDS` 会向浏览器推送更新，并带上构建时的 `hash`，让客户端与上一次资源进行对比。客户端对比出差异后会向 `WDS` 发起 `Ajax` 请求来获取更改内容(文件列表、`hash`)，这样客户端就可以再借助这些信息继续向 `WDS` 发起 `jsonp` 请求获取该 `chunk` 的增量更新。

`WDS` 就是 `webpack dev server`。

后续的部分(拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？)由 `HotModulePlugin` 来完成，提供了相关 API 以供开发者针对自身场景进行处理，像 `react-hot-loader` 和 `vue-loader` 都是借助这些 API 实现 `HMR`。

## 文件指纹是什么？怎么用？

- `Hash`：和整个项目的构建相关，只要项目文件有修改，整个项目构建的 `hash` 值就会更改。
- `Chunkhash`：和 `Webpack` 打包的 `chunk` 有关，不同的 `entry` 会生出不同的 `chunkhash`。
- `Contenthash`：根据文件内容来定义 `hash`，文件内容不变，则 `contenthash` 不变。

## 如何提高 webpack 构建速度？

- 通过 externals 配置来提取常用库
- 利用 DllPlugin 和 DllReferencePlugin 预编译资源模块 通过 DllPlugin 来对那些我们引用但是绝对不会修改的 npm 包来进行预编译，再通过 DllReferencePlugin 将预编译的模块加载进来。
- 使用 Happypack 实现多线程加速编译
- 使用 webpack-uglify-parallel 来提升 uglifyPlugin 的压缩速度。原理上 webpack-uglify-parallel 采用了多核并行压缩来提升压缩速度
- 使用 Tree-shaking 和 Scope Hoisting 来剔除多余代码

## 什么是 bundle,chunk,module？

- `bundle` 是 `webpack` 打包出来的文件。
- `chunk` 是 `webpack` 在进行模块的依赖分析的时候，代码分割出来的代码块。
- `module` 是开发中的单个模块。

