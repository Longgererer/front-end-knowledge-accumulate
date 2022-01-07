<template>
  <Layout>
    <!-- <template #page-top>
      <div>这是页头</div>
    </template>
    <template #navbar-before>
      <div>navbar-before</div>
    </template>
    <template #navbar-after>
      <div>navbar-after</div>
    </template>
    <template #sidebar-top>
      <div>sidebar-top</div>
    </template>
    <template #sidebar-bottom>
      <div>sidebar-bottom</div>
    </template>
    <template #page-bottom>
      <div>这是页脚，放评论的123</div>
    </template>-->
  </Layout>
</template>

<script>
import { defineComponent, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'

export default defineComponent({
  setup () {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@docsearch/js@alpha'
    document.body.append(script)
    const route = useRoute()
    const hrefList = [
      '/basement/',
      '/algorithm/',
      '/framework/',
      '/technicalTopics/',
    ]
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="svg-arrow" style="min-width: 20px; min-height: 20px;">
      <g fill="none" fill-rule="evenodd" transform="translate(-446 -398)">
        <path fill="currentColor" fill-rule="nonzero" d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z" transform="translate(356.5 164.5)"></path>
        <polygon points="446 418 466 418 466 398 446 398"></polygon>
      </g>
    </svg>`
    function addBtn () {
      const eleList = document.querySelectorAll('.feature')
      eleList.forEach((el, index) => {
        const newDiv = document.createElement('div')
        newDiv.innerHTML = `<a href="${hrefList[index]}" class="nav-link action-button primary" aria-label="Read More"><span>Read More</span>${svgStr} </a>`
        el.appendChild(newDiv)
      })
    }
    onMounted(() => {
      addBtn()
      watch(route, (newValue) => {
        if (newValue.path === '/') {
          addBtn()
        } else {
          const prev = document.querySelector('.prev')
          const next = document.querySelector('.next')
          if (prev?.childNodes[0]) {
            prev.childNodes[0].nodeValue = ''
          }
          if (next?.childNodes[1]) {
            next.childNodes[1].nodeValue = ''
          }
        }
      })
    })
  },
  components: {
    Layout,
  },
})
</script>
<style lang="scss" src="../../styles/palette.scss"></style>
<style lang="scss" src="../../styles/cover.scss"></style>
<style lang="scss">
</style>