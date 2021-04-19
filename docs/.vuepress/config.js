module.exports = {
  title: 'lliiooiill\'s FEKA',
  description: 'Record the front-end knowledge I learned',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  base: '/front-end-knowledge-accumulate/', // 这是部署到github相关的配置 下面会讲
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  themeConfig: {
    sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
    repo: 'https://github.com/Longgererer/front-end-knowledge-accumulate',
    nav: [
      { text: '基础', link: '/basement/' },
      { text: '算法', link: '/algorithm/' }, // 内部链接 以docs为根目录
      { text: '框架', link: '/framework/' },
      { text: '技术专题', link: '/technicalTopics/' },
      { text: '博客', link: 'https://longgererer.github.io/' }, // 外部链接
      // 下拉列表
      {
        text: 'GitHub',
        items: [
          { text: 'GitHub地址', link: 'https://github.com/OBKoro1' },
          {
            text: '算法仓库',
            link: 'https://github.com/OBKoro1/Brush_algorithm'
          }
        ]
      }
    ],
    sidebar: {
      // docs文件夹下面的basement文件夹 文档中md文件 书写的位置(命名随意)
      '/basement/': [
        '/basement/', // basement文件夹的README.md 不是下拉框形式
        {
          title: 'JS',
          children: [
            '/basement/JS/14种JavaScript设计模式',
            '/basement/JS/Object常用API和原理',
          ],
        },
        {
          title: 'CSS',
          children: [
            '/basement/CSS/test'
          ],
        },
        {
          title: 'HTML',
          children: [
            '/basement/HTML/test'
          ]
        }
      ],
      '/algorithm/': [
        '/algorithm/',
        {
          title: '算法',
          children: [
            '/algorithm/test'
          ]
        }
      ],
      '/framework/': [
        '/framework/',
        {
          title: 'Vue',
          children: [
            '/framework/vue/index'
          ],
        },
        {
          title: 'React',
          children: [
            '/framework/react'
          ]
        }
      ],
      '/technicalTopics/': [
        '/technicalTopics/',
        {
          title: '技术专题',
          children: [
            '/technicalTopics/test'
          ]
        }
      ]
    }
  }
}