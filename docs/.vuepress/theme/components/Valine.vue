<template>
  <section style="border-top: 2px solid #eaecef;padding-top:1rem;margin-top:2rem;">
    <div class="line"></div>
    <div class="read-count">
      <!-- id 将作为查询条件 -->
      <span class="leancloud-visitors" data-flag-title="Your Article Title">
        <span class="post-meta-item-text">👁️‍🗨️ </span>
        <span class="leancloud-visitors-count"></span>
      </span>
    </div>
    <h3>
      <a href="javascript:;"></a>
      评论💬：
    </h3>
    <div id="valine-vuepress-comment"></div>
  </section>
</template>

<script>
export default {
  name: 'Valine',
  data() {
    return {
      valine: null,
    }
  },
  mounted() {
    const Valine = require('valine')
    if (typeof window !== 'undefined') {
      this.window = window
      window.AV = require('leancloud-storage')
    }
    this.valine = new Valine()
    this.initValine()
  },
  watch: {
    $route(to, from) {
      if (from.path != to.path) {
        this.initValine()
      }
    },
  },
  methods: {
    initValine() {
      let path = location.origin + location.pathname
      // vuepress打包后变成的HTML不知为什么吞掉此处的绑定`:id="countId"`
      document.getElementsByClassName('leancloud-visitors')[0].id = path
      this.valine.init({
        el: '#valine-vuepress-comment',
        appId: 'YgqOaVYU7mANDprMIzk65ojL-gzGzoHsz', // your appId
        appKey: 'ltQrdwSx1cefu87liG294cr4', // your appKey
        notify: false,
        verify: false,
        path: path,
        visitor: true,
        avatar: 'retro',
        placeholder: '谈谈你的看法😁',
      })
    },
  },
}
</script>
<style lang="stylus" scoped>
.read-count
  text-align right
.line
  border-top 1px dashed
  margin-bottom 1rem
@media (max-width: $MQNarrow)
  section
      padding 0 2rem
</style>
