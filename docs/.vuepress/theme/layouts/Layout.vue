<template>
  <div class="theme-container" :class="pageClasses" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />

    <div class="sidebar-mask" @click="toggleSidebar(false)" />

    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar" class="sidebar" :class="isSidebarFold?'sidebar-fold':'sidebar-unfold'">
      <template #top>
        <slot name="sidebar-top" />
      </template>
      <template #bottom>
        <slot name="sidebar-bottom" />
      </template>
    </Sidebar>

    <SidebarButton class="sidebar-button" @click.native="foldSidebar" :class="isSidebarFold?'sidebar-button-fold':''"/>

    <Home v-if="$page.frontmatter.home" />

    <Page v-else :sidebar-items="sidebarItems" :class="isSidebarFold?'page-fold':''">
      <template #top>
        <slot name="page-top" />
      </template>
      <template #bottom>
        <slot name="page-bottom" />
      </template>
    </Page>
  </div>
</template>

<script>
import Home from '@theme/components/Home.vue'
import Navbar from '@theme/components/Navbar.vue'
import Page from '@theme/components/Page.vue'
import Sidebar from '@theme/components/Sidebar.vue'
import SidebarButton from '@theme/components/SidebarButton.vue'
import { resolveSidebarItems } from '../util'

export default {
  name: 'Layout',

  components: {
    Home,
    Page,
    Sidebar,
    Navbar,
    SidebarButton,
  },

  data() {
    return {
      isSidebarOpen: false,
      isSidebarFold: false,
    }
  },

  computed: {
    shouldShowNavbar() {
      const { themeConfig } = this.$site
      const { frontmatter } = this.$page
      if (frontmatter.navbar === false || themeConfig.navbar === false) {
        return false
      }
      return this.$title || themeConfig.logo || themeConfig.repo || themeConfig.nav || this.$themeLocaleConfig.nav
    },

    shouldShowSidebar() {
      const { frontmatter } = this.$page
      return !frontmatter.home && frontmatter.sidebar !== false && this.sidebarItems.length
    },

    sidebarItems() {
      return resolveSidebarItems(this.$page, this.$page.regularPath, this.$site, this.$localePath)
    },

    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass
      return [
        {
          'no-navbar': !this.shouldShowNavbar,
          'sidebar-open': this.isSidebarOpen,
          'no-sidebar': !this.shouldShowSidebar,
        },
        userPageClass,
      ]
    },
  },

  mounted() {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false
    })
  },

  methods: {
    foldSidebar() {
      this.isSidebarFold = !this.isSidebarFold
    },
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen
      this.$emit('toggle-sidebar', this.isSidebarOpen)
    },

    // side swipe
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }
    },

    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x
      const dy = e.changedTouches[0].clientY - this.touchStart.y
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true)
        } else {
          this.toggleSidebar(false)
        }
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
$main = #61dafb;
$white = #F8F8F8;
$textShadow = 0px -2px 0px rgba(0, 0, 0, 0.3);
.sidebar
  left 0
  transition all 0.3s ease
.sidebar-fold
  left -320px
.sidebar-button
  position fixed
  left 16rem
  top 5rem
  z-index 1000
  transition all 0.3s ease
  border-radius 50%
  &:hover
    color $white
    background-color $main
    text-shadow $textShadow
    box-shadow 0 0 5px $main
.sidebar-button-fold
  left 10px
.page-fold
  padding-left 0rem
@media (max-width: $MQNarrow)
  .sidebar-button
    left 13.5rem
  .sidebar-button-fold
    left 10px
@media (max-width: $MQMobile)
  .sidebar
    transform none
  .sidebar-button
    top 0.6rem
    left 0.6rem !important
    
</style>
