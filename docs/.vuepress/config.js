const path = require('path')
const allowTags = ['math', 'semantics', 'mrow', 'msup', 'annotation', 'mtext', 'mi', 'mo', 'mover', 'msubsup', 'mn', 'msub', 'msqrt']

module.exports = {
  title: 'lliiooiill\'s FEKA',
  description: 'Record the front-end knowledge I learned',
  bundler: '@vuepress/webpack',
  bundlerConfig: {
    vue: {
      compilerOptions: {
        isCustomElement (tag) {
          if (allowTags.includes(tag)) {
            return true
          }
          return false
        }
      }
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/public/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.13.13/katex.min.css' }],
    ['link', { rel: "stylesheet", href: "https://cdn.bootcdn.net/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css" }],
  ],
  theme: path.resolve(__dirname, './theme'),
  markdown: {
    code: {
      lineNumbers: true,
    },
    links: {
      externalIcon: false
    },
    toc: true
  },
  extendsMarkdown: md => {
    md.set({ html: true })
    md.use(require("markdown-it-katex"))
  },
  plugins: [
    [
      '@vuepress/active-header-links',
      {
        sidebarLinkSelector: '.sidebar-link',
        headerAnchorSelector: '.header-anchor'
      }
    ],
    [
      '@vuepress/plugin-palette',
      { preset: 'sass' },
    ],
    '@snippetors/vuepress-plugin-tabs'
  ],
  themeConfig: {
    logo: 'logo.gif',
    sidebarDepth: 3,
    lastUpdated: true,
    editLink: false,
    lastUpdatedText: '最后更新',
    repo: 'https://github.com/Longgererer/front-end-knowledge-accumulate',
    navbar: [
      { text: '基础', link: '/basement/' },
      { text: '算法', link: '/algorithm/' },
      { text: '框架', link: '/framework/' },
      { text: '技术专题', link: '/technicalTopics/' },
    ],
    sidebar: {
      '/basement/': [
        {
          text: 'JavaScript',
          children: [
            '/basement/JS/Object常用API和原理.md',
            '/basement/JS/this指向.md',
            '/basement/JS/原型链.md',
            '/basement/JS/apply-call-bind实现.md',
            '/basement/JS/一些重要API的实现.md',
            '/basement/JS/理解数组及其部分API的实现.md',
            '/basement/JS/DOM事件.md',
            '/basement/JS/正则表达式.md',
            '/basement/JS/深拷贝与浅拷贝.md',
            '/basement/JS/async-await.md',
            '/basement/JS/Generator.md',
            '/basement/JS/Promise.md',
            '/basement/JS/TypeScript.md',
            '/basement/JS/Webpack生命周期.md',
            '/basement/JS/WebWorker.md',
            '/basement/JS/防抖与节流.md',
            '/basement/JS/函数柯里化.md',
            '/basement/JS/WebSocket.md',
            '/basement/JS/JS垃圾回收机制.md',
            '/basement/JS/模板字符串.md',
            '/basement/JS/变量存储.md',
            '/basement/JS/Class.md',
            '/basement/JS/源码映射.md',
            '/basement/JS/BOM.md'
          ],
        },
        {
          text: 'CSS',
          children: [
            '/basement/CSS/选择器.md',
            '/basement/CSS/BFC.md',
            '/basement/CSS/CSS权重.md',
            '/basement/CSS/Sass.md',
            '/basement/CSS/Grid.md',
            '/basement/CSS/CSS常用样式.md',
            '/basement/CSS/瀑布流布局.md',
            '/basement/CSS/近年来CSS新特性.md'
          ],
        },
        {
          text: 'HTML',
          children: [
            '/basement/HTML/HTML标签及说明.md',
            '/basement/HTML/HTML5新特性.md',
          ]
        },
        {
          text: '其他',
          children: [
            '/basement/OTHER/浏览器进程与线程.md',
            '/basement/OTHER/常用正则表达式.md',
            '/basement/OTHER/常见原生JS基础问题积累.md',
            '/basement/OTHER/常见CSS和HTML基础问题积累.md',
            '/basement/OTHER/常见网络基础问题积累.md',
            '/basement/OTHER/常见webpack问题积累.md',
            '/basement/OTHER/常见TypeScript问题积累.md',
          ]
        }
      ],
      '/algorithm/': [
        {
          text: '常见算法',
          children: [
            '/algorithm/常见算法/搜索算法.md',
            '/algorithm/常见算法/排序算法.md',
            '/algorithm/常见算法/二叉树.md',
            '/algorithm/常见算法/深度优先和广度优先.md',
            '/algorithm/常见算法/最短路径算法.md',
            '/algorithm/常见算法/贪婪动态规划.md',
            '/algorithm/常见算法/摩尔投票法.md',
            '/algorithm/常见算法/字符串匹配算法.md',
            '/algorithm/常见算法/缓存淘汰策略.md',
          ]
        },
      ],
      '/framework/': [
        {
          text: 'Vue',
          children: [
            '/framework/vue/简单梳理vue3新特性.md',
            '/framework/vue/Vue3对于Vue2的深层次优化.md',
            '/framework/vue/Vue常见知识点.md'
          ],
        },
        {
          text: 'React',
          children: [
            '/framework/react/context.md',
            '/framework/react/React生命周期.md',
            '/framework/react/ReactRouter.md',
            '/framework/react/ReactHook.md',
            '/framework/react/React常见知识点.md'
          ]
        }
      ],
      '/technicalTopics/': [
        {
          text: '技术专题',
          children: [
            '/technicalTopics/EventLoop.md',
            '/technicalTopics/前端模块化发展.md',
            '/technicalTopics/浏览器渲染原理.md',
            '/technicalTopics/状态管理.md',
            '/technicalTopics/浏览器缓存机制.md',
            '/technicalTopics/Git详解.md',
            '/technicalTopics/14种JavaScript设计模式.md',
            '/technicalTopics/Vite是什么？.md',
            '/technicalTopics/AST详解.md',
            '/technicalTopics/从输入URL到页面加载完毕.md',
            '/technicalTopics/跨域.md',
            '/technicalTopics/NPM包管理.md',
            '/technicalTopics/WEB安全及防护原理.md',
            '/technicalTopics/三次握手与四次挥手.md',
            '/technicalTopics/HTTPS原理.md',
            '/technicalTopics/详解TCPIP.md'
          ]
        }
      ]
    }
  }
}