module.exports = {
  title: 'lliiooiill\'s FEKA',
  description: 'Record the front-end knowledge I learned',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 增加一个自定义的 favicon(网页标签的图标)
    ['link', { rel: 'stylesheet', href: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.13.13/katex.min.css' }],
    ['link', { rel: "stylesheet", href: "https://cdn.bootcdn.net/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css" }],
    ['link', { rel: 'stylesheet', type: 'text/css', defer: true, href: 'https://cdn.bootcdn.net/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css' }],
    ['script', { src: 'https://cdn.bootcdn.net/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js' }],
  ],
  base: '', // 这是部署到github相关的配置 下面会讲
  markdown: {
    lineNumbers: true, // 代码块显示行号
    extendMarkdown: md => {
      md.set({ html: true })
      md.use(require("markdown-it-katex"))
    }
  },
  plugins: {
    '@vuepress/medium-zoom': {
      selector: 'img.zoom-custom-imgs',
      // medium-zoom options here
      // See: https://github.com/francoischalifour/medium-zoom#options
      options: {
        margin: 16
      }
    },
    '@vuepress/active-header-links': {
      sidebarLinkSelector: '.sidebar-link',
      headerAnchorSelector: '.header-anchor'
    },
    '@vuepress/back-to-top': {},
    '@vuepress/google-analytics': {
      'ga': 'G-WHDRXHWKPV'
    },
    '@vuepress/register-components': {
      componentsDir: './components'
    },
    'vuepress-plugin-element-tabs': {}
  },
  themeConfig: {
    smoothScroll: true,
    sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: '最后修改于', // 文档更新时间：每个文件git最后提交的时间
    repo: 'https://github.com/Longgererer/front-end-knowledge-accumulate',
    nav: [
      { text: '基础', link: '/basement/' },
      { text: '算法', link: '/algorithm/' }, // 内部链接 以docs为根目录
      { text: '框架', link: '/framework/' },
      { text: '技术专题', link: '/technicalTopics/' },
      { text: '博客', link: 'https://longgererer.github.io/' }, // 外部链接
      // 下拉列表
      // {
      //   text: 'GitHub',
      //   items: [
      //     { text: 'GitHub地址', link: 'https://github.com/OBKoro1' },
      //     {
      //       text: '算法仓库',
      //       link: 'https://github.com/OBKoro1/Brush_algorithm'
      //     }
      //   ]
      // }
    ],
    sidebar: {
      // docs文件夹下面的basement文件夹 文档中md文件 书写的位置(命名随意)
      '/basement/': [
        '/basement/', // basement文件夹的README.md 不是下拉框形式
        {
          title: 'JS',
          children: [
            'JS/Object常用API和原理',
            'JS/this指向',
            'JS/原型链',
            'JS/apply-call-bind实现',
            'JS/一些重要API的实现',
            'JS/理解数组及其部分API的实现',
            'JS/DOM事件',
            'JS/正则表达式',
            'JS/深拷贝与浅拷贝',
            'JS/async-await',
            'JS/Generator',
            'JS/Promise',
            'JS/TypeScript',
            'JS/Webpack生命周期',
            'JS/WebWorker',
            'JS/防抖与节流',
            'JS/函数柯里化',
            'JS/WebSocket',
            'JS/JS垃圾回收机制',
            'JS/模板字符串',
            'JS/变量存储',
            'JS/Class',
            'JS/源码映射',
            'JS/BOM'
          ],
        },
        {
          title: 'CSS',
          children: [
            'CSS/选择器',
            'CSS/BFC',
            'CSS/CSS权重',
            'CSS/Sass',
            'CSS/Grid',
            'CSS/CSS常用样式',
            'CSS/水平垂直居中',
            'CSS/瀑布流布局',
            'CSS/近年来CSS新特性'
          ],
        },
        {
          title: 'HTML',
          children: [
            'HTML/HTML标签及说明',
            'HTML/HTML5新特性',
          ]
        },
        {
          title: '其他',
          children: [
            'OTHER/浏览器进程与线程',
            'OTHER/常用正则表达式',
            'OTHER/常见原生JS基础问题积累',
            'OTHER/常见CSS和HTML基础问题积累',
            'OTHER/常见网络基础问题积累',
            'OTHER/常见webpack问题积累'
          ]
        }
      ],
      '/algorithm/': [
        '/algorithm/',
        {
          title: '常见算法',
          children: [
            '常见算法/搜索算法',
            '常见算法/排序算法',
            '常见算法/深度优先和广度优先',
            '常见算法/最短路径算法',
            '常见算法/贪婪动态规划',
            '常见算法/摩尔投票法',
            '常见算法/字符串匹配算法',
            '常见算法/缓存淘汰策略',
          ]
        },
        {
          title: 'LeetCode算法题',
          children: [
            'LeetCode算法题/简单难度',
            'LeetCode算法题/中等难度',
            'LeetCode算法题/困难难度'
          ]
        }
      ],
      '/framework/': [
        '/framework/',
        {
          title: 'Vue',
          children: [
            'vue/简单梳理vue3新特性',
            'vue/Vue常见知识点'
          ],
        },
        {
          title: 'React',
          children: [
            'react/context',
            'react/React生命周期',
            'react/ReactRouter',
            'react/ReactHook',
            'react/React常见知识点'
          ]
        }
      ],
      '/technicalTopics/': [
        '/technicalTopics/',
        {
          title: '技术专题',
          children: [
            'EventLoop',
            '前端模块化发展',
            '浏览器渲染原理',
            '状态管理',
            '浏览器缓存机制',
            'Git详解',
            '14种JavaScript设计模式',
            'Vite是什么？',
            'AST详解',
            '从输入URL到页面加载完毕',
            '跨域',
            'NPM包管理',
            'WEB安全及防护原理',
            '三次握手与四次挥手',
            'HTTPS原理',
            '详解TCPIP'
          ]
        }
      ]
    }
  }
}