<template>
  <main class="home" :aria-labelledby="data.heroText !== null ? 'main-title' : null">
    <header class="hero">
      <img v-if="data.heroImage" :src="$withBase(data.heroImage)" :alt="data.heroAlt || 'hero'" />

      <h1 v-if="data.heroText !== null" id="main-title">
        {{ data.heroText || $title || 'Hello' }}
      </h1>

      <p v-if="data.tagline !== null" class="description">
        {{ data.tagline || $description || 'Welcome to your VuePress site' }}
      </p>

      <p v-if="data.actionText && data.actionLink" class="action">
        <NavLink class="action-button" :item="actionLink" />
      </p>
    </header>

    <div v-if="data.features && data.features.length" class="features">
      <div v-for="(feature, index) in data.features" :key="index" class="feature">
        <div class="title-box">
          <h2>{{ feature.title }}</h2>
          <div class="title-bar"></div>
        </div>
        <p>{{ feature.details }}</p>
      </div>
      <div class="feature new-blog">
        <div class="title-box">
          <h2>🌟近期更新</h2>
          <div class="title-bar"></div>
        </div>
        <p>
          <ul>
            <li>
              👉<a href="../../../basement/JS/JS%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E6%9C%BA%E5%88%B6.html">基础/JavaScript: JS 垃圾回收机制 发布于2021/7/6</a>👈
            </li>
            <li>
              👉<a href="../../../basement/CSS/CSS常用样式.html">基础/CSS: CSS 常用样式 发布于2021/7/10</a>👈
            </li>
          </ul>

        </p>
        <p></p>
      </div>
    </div>

    <Content class="theme-default-content custom" />

    <div v-if="data.footer" class="footer">
      {{ data.footer }}
    </div>
  </main>
</template>

<script>
import NavLink from './NavLink.vue'

export default {
  name: 'Home',

  components: { NavLink },

  computed: {
    data() {
      return this.$page.frontmatter
    },

    actionLink() {
      return {
        link: this.data.actionLink,
        text: this.data.actionText,
      }
    },
  },
}
</script>

<style lang="stylus">
.home
  padding $navbarHeight 2rem 0
  max-width $homePageWidth
  margin 0px auto
  display block
  .hero
    text-align center
    img
      max-width: 100%
      max-height 280px
      display block
      margin 3rem auto 1.5rem
    h1
      font-size 3rem
    h1, .description, .action
      margin 1.8rem auto
    .description
      max-width 35rem
      font-size 1.6rem
      line-height 1.3
      color lighten($textColor, 40%)
    .action-button
      display inline-block
      font-size 1.2rem
      color #fff
      background-color $accentColor
      padding 0.8rem 1.6rem
      border-radius 4px
      transition background-color .1s ease
      box-sizing border-box
      border-bottom 1px solid darken($accentColor, 10%)
      &:hover
        background-color lighten($accentColor, 10%)
  .features
    border-top 1px solid $borderColor
    padding 1.2rem 0
    max-width 960px
    margin-top 2.5rem
    display grid
    grid-template-columns 1fr 1fr 1fr
    grid-gap 20px
    grid-auto-flow row dense
    border none
    margin 0 auto
  .feature
    // flex-grow 1
    // flex-basis 30%
    // max-width 30%
    filter grayscale(100%)
    .title-box
      display inline-block
      h2
        font-size 1.4rem
        font-weight 700
        padding-bottom 0
        color lighten($textColor, 10%)
        border none
        margin-bottom 5px
      p
        color lighten($textColor, 25%)
      .title-bar
        width 0
        border-bottom 2px solid transparent
        transition all 0.3s ease
    &:hover
      filter none
      .title-bar
        width 100%
  .new-blog
    grid-column-start 2
    grid-column-end 4
  .footer
    padding 2.5rem
    border-top 1px solid $borderColor
    text-align center
    color lighten($textColor, 25%)

@media (max-width: $MQMobile)
  .home
    .features
      flex-direction column
    .feature
      max-width 100%
      padding 0 2.5rem

@media (max-width: $MQMobileNarrow)
  .home
    padding-left 1.5rem
    padding-right 1.5rem
    .hero
      img
        max-height 210px
        margin 2rem auto 1.2rem
      h1
        font-size 2rem
      h1, .description, .action
        margin 1.2rem auto
      .description
        font-size 1.2rem
      .action-button
        font-size 1rem
        padding 0.6rem 1.2rem
    .feature
      h2
        font-size 1.25rem
</style>
