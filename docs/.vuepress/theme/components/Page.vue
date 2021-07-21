<template>
  <main class="page">
    <slot name="top" />

    <Content class="theme-default-content" />
    <PageEdit />

    <PageNav v-bind="{ sidebarItems }" />

    <slot name="bottom" />
    <Valine />
  </main>
</template>

<script>
import PageEdit from './PageEdit.vue'
import PageNav from './PageNav.vue'
import Valine from './Valine.vue'

export default {
  components: {
    PageEdit,
    PageNav,
    Valine,
  },
  props: ['sidebarItems'],
}
</script>
<style lang="stylus">
@require '../styles/wrapper.styl'

.page
  padding-bottom 2rem
  display block
.theme-default-content
  background-image linear-gradient(90deg,#272727 3%,#0000 0),linear-gradient(1turn,#272727 3%,#0000 0)
  background-size 20px 20px
  background-position 8% 10%
</style>
