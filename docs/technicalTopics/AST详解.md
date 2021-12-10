# AST 详解

> 在计算机科学中， 抽象语法树(Abstract Syntax Tree)是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。

AST 这东西看上去离我们很遥远，但实际上我们所使用的的许多功能都是通过它来完成的，如代码格式化，Babel 等。

大多数的编译器在编译代码的时候一般分为三个步骤：

1. **Parsing**：将原始代码转换为抽象代码表示。
2. **Transformation**：对抽象代码的表示进行操作。
3. **Code Generation**：将操作完成的抽象代码转换成新代码。

注意：以下部分是围绕 [Esprima](https://esprima.org/demo/parse.html#) 的解析格式进行讨论的，因为该工具生成的结果是符合业界规范的。实际应用中浏览器的 JavaScript 引擎所生成的 AST 由于经过优化会有所不同。

## Parsing

编译过程分为词法分析和句法分析。

### 词法分析

词法分析就是将代码转换成一个一个的词法单元，也叫做 `token`，注意这和网络鉴权的 `token` 不同。

考虑如下代码：

```js
const sum = 1 + 2
```

Esprima 生成的 `token` 列表如下：

```js
tokens = [
  {
    type: 'Keyword',
    value: 'const',
  },
  {
    type: 'Identifier',
    value: 'sum',
  },
  {
    type: 'Punctuator',
    value: '=',
  },
  {
    type: 'Numeric',
    value: '1',
  },
  {
    type: 'Punctuator',
    value: '+',
  },
  {
    type: 'Numeric',
    value: '2',
  },
  {
    type: 'Punctuator',
    value: ';',
  },
]
```

从上可知：

- `const` 被解析成了 `Keyword`(关键字)
- `sum` 被解析成了 `Identifier`(标识符)
- `=`、`+` 和 `;` 被解析成了 `Punctuator`(标点符号)
- `1` 和 `2` 被解析成了 `Numeric`(数值)

我们可以发现，词法分析就是将代码分割成一个一个很细微的部分，哪怕是一个标点符号也会被看成独立的个体。

### 句法分析(语法分析)

句法分析就是在词法分析得到的 `token` 列表的基础上再次进行分析，将 `token` 重新格式化为 AST 的格式。

还是上面那段代码：

```js
const sum = 1 + 2
```

Esprima 生成的 AST 如下：

```js
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "sum"
          },
          "init": {
            "type": "BinaryExpression",
            "operator": "+",
            "left": {
              "type": "Literal",
              "value": 1,
              "raw": "1"
            },
            "right": {
              "type": "Literal",
              "value": 2,
              "raw": "2"
            }
          }
        }
      ],
      "kind": "const"
    }
  ],
  "sourceType": "script"
}
```

可以看出，句法分析之后得到的结果要更为详细。

## Transformation

在转换阶段需要根据自身需求遍历 AST 并修改里面的内容。

### 使用 Esprima 进行转换

在这里我们使用 `Esprima` 来完成 AST 的生成及转换。

首先安装 `Esprima`、`estraverse`(遍历 AST 时使用)和`escodegen`(将 AST 转换成正常代码)：

```bash
npm install esprima --save
npm install estraverse --save
npm install escodegen --save
```

然后我们在 js 文件中引入这些库，尝试解析一段代码。

使用 `esprima.parse` 或 `esprima.Script` 解析：

```js
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const result = esprima.parse(`const sum = 1 + 2`)
console.log(result)
```

我们将会在控制台看到输出结果：

```js
Script {
  type: 'Program',
  body: [
    VariableDeclaration {
      type: 'VariableDeclaration',
      declarations: [Array],
      kind: 'const'
    }
  ],
  sourceType: 'script'
}
```

假如我们需要对代码进行格式化处理，处理规则是将所有 `"` 变成 `'`：

```js
let tokens = esprima.parseScript(`const str = "This is a string"`, {
  tokens: true,
  range: true,
}).tokens // 获取tokens
console.log(tokens)
```

输出如下：

```bash
[
  { type: 'Keyword', value: 'const', range: [0, 5] },
  { type: 'Identifier', value: 'str', range: [6, 9] },
  { type: 'Punctuator', value: '=', range: [10, 11] },
  { type: 'String', value: '"This is a string"', range: [12, 30] },
]
```

可以看到字符串的 `type` 属性为 `String`，我们只要找到它并将它的 `value` 替换成单引号包裹的字符串就好了：

```js
let ast = esprima.parseScript(`
    var price = "12"
    var unit = "$"
  `)

function convertToSemi(string) {
  // 将双引号转换成单引号
  if (string[0] === "'") return string // 本身就是双引号开头，直接返回
  const matches = string.match(/\'/g) // 匹配字符串内单引号数量
  if (matches && matches.length >= 2) {
    // 数量大于等于2的情况下，比如 "This is 'apple'" 如果替换成 'This is 'apple''，字符串就会非法
    return string
  } else {
    // 截掉字符串前后的双引号，换成单引号
    string = string.substring(1, string.length - 1)
    return `'${string}'`
  }
}

// 遍历AST
estraverse.traverse(ast, {
  enter(node) {
    const { type, kind } = node
    if (type === 'Literal') {
      node.raw = convertToSemi(node.raw)
    }
  },
})
console.log(escodegen.generate(ast))
```

输出结果：

```bash
var price = '12'
var unit = '$'
```

## Code Generation

最后一步就是将 AST 转换为正常代码，在转换的同时还会形成源码映射 `Source map`。

:::tip Notice
如果你不了解 `Source map`，请看[Source map](../basement/JS/源码映射.html)
:::

再举一个例子，我想将代码中的 `var` 转换成 `let`：

```js
let ast = esprima.parseScript(`
    var price = 12
    var unit = '$'
    console.log(\`It costs \${price}\${unit}\`)
  `)
// 遍历AST
estraverse.traverse(ast, {
  enter(node) {
    const { type, kind } = node
    if (type === 'VariableDeclaration' && kind === 'var') {
      node.kind = 'let'
    }
  },
})
console.log(escodegen.generate(ast))
```

输出结果：

```bash
let price = 12;
let unit = '$';
console.log(`It costs ${price}${unit}`);
```

## Babel 与 AST

Babel 就是利用 AST 来将高版本代码转换成低版本代码的，其步骤和我们上面讲的：解析、转换和生成是一样的，只不过 Babel 也做了一些自己的处理：

- **解析**：Babel 是通过 Babylon 实现代码解析的，词法分析阶段把字符串形式的代码转换为词元（tokens）流，词元类似于 AST 中节点；而语法分析阶段则会把一个词元流转换成 AST 的形式，同时这个阶段会把词元中的信息转换成 AST 的表述结构。
- **转换**：Babel 通过 babel-traverse 进行深度优先遍历，维护 AST 树的整体状态，并且可完成对其的替换，删除或者增加节点。最后返回转换后的 AST。
- **生成**：Babel 通过 babel-generator 转换成 js 代码，过程就是深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。

## 实现一个 tokenizer

下面代码有一部分参考[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)。

想要实现一个简单的 `tokenizer` 其实很容易：

```js
function tokenizer(input) {
  // 储存关键字
  const KEYWORDS = ['let', 'const']

  // current 表示我们现在解析到的词元的位置，可以当成是光标
  let current = 0

  // 解析完的词元会放到该数组中
  const tokens = []

  // 遍历输入字符串
  while (current < input.length) {
    // 获得当前位置字符
    let char = input[current]

    let PUNCTUATOR = /[\(\)\;\.\=\+\-\*\/\%]/
    // 如果是一个符号，push
    if (PUNCTUATOR.test(char)) {
      tokens.push({
        type: 'Punctuator',
        value: char,
      })
      current++
      continue
    }

    let WHITESPACE = /\s/
    // 如果是空格，跳过
    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    let NUMBERS = /[0-9]/
    // 如果是数字
    if (NUMBERS.test(char)) {
      // 存储多位数字
      let value = ''

      // 数字有可能是多位的，因此我们需要循环
      while (NUMBERS.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({ type: 'Number', value })
      continue
    }

    // 如果是双引号
    if (char === '"') {
      // 储存多位字符串
      let value = ''

      // 前进一位到字符串内容
      char = input[++current]

      // 字符串有可能是多位的，因此要循环遍历
      // 如果下一位也是双引号，说明是空字符串
      while (char !== '"') {
        value += char
        char = input[++current]
      }

      // 跳过结尾的双引号
      char = input[++current]
      tokens.push({ type: 'String', value })
      continue
    }

    // 如果是单引号
    if (char === "'") {
      // 储存多位字符串
      let value = ''

      // 前进一位到字符串内容
      char = input[++current]

      // 字符串有可能是多位的，因此要循环遍历
      // 如果下一位也是单引号，说明是空字符串
      while (char !== "'") {
        value += char
        char = input[++current]
      }

      // 跳过结尾的单引号
      char = input[++current]
      tokens.push({ type: 'String', value })
      continue
    }

    let LETTERS = /[a-z]/i
    // 如果是变量名或关键字
    if (LETTERS.test(char)) {
      let value = ''
      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }

      // 如果是关键字
      if (KEYWORDS.includes(value)) {
        tokens.push({ type: 'Keyword', value })
      } else {
        tokens.push({ type: 'Identifier', value })
      }
      continue
    }

    // 如果我没有匹配到符合条件的字符，抛出异常
    throw new TypeError(`I don't know what this character is: ${char}`)
  }
  return tokens
}
```

这么一个简单的词元生成器就完成了，当然这和真正的 `tokenizer` 肯定是比不了的，我们来测试一下：

```js
console.log(tokenizer(`const a = '123'`))
```

输出：

```bash
[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'String', value: '123' }
]
```

我们成功地将这一行简单的代码转换成了词元。

至于剩下的句法分析，转换这些就不写了，详情请参考：[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js) 中的实现代码，里面有很多注释，通俗易懂。

## 相关问题

### 哪些算是词法哪些算是语法？

词法可以理解为单词的语法，比如你使用的关键字对不对，对于变量的命名符不符合要求等等；而语法就是你这些词组成的结构正不正确。

### 词法分析、语法分析、语义分析阶段能检测出什么错误？

- **词法分析**就是取出一个个词，然后给词归类、给个种别码什么的。所以遇到不认识的词或符号，一般就会报错。
- **语法分析**就是根据语法规则识别出语法单位（赋值语句、条件语句之类），并检查语法单位在语法结构上的正确性。
- **语义分析**是对语法单位进行静态的语义审查（动态的在运行时才可确定）。分析其含义，下一步就会用另一种接近目标语言或直接用目标语言去描述这个含义。此阶段要求语句的含义和使用规则正确。

## 参考文章

- [抽象语法树](https://zh.wikipedia.org/zh-hans/%E6%8A%BD%E8%B1%A1%E8%AA%9E%E6%B3%95%E6%A8%B9)
- [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)
- [AST 抽象语法树——最基础的 javascript 重点知识，99%的人根本不了解](https://segmentfault.com/a/1190000016231512)
- [V8 引擎详解（二）——AST](https://juejin.cn/post/6844904146798116871)
- [【你应该了解的】抽象语法树 AST](https://juejin.cn/post/6844904126099226631)
- [AST 详解与运用](https://zhuanlan.zhihu.com/p/266697614)
