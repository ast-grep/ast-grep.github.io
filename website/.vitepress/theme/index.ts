import Theme from 'vitepress/theme'
import { h } from 'vue'
import Homepage from '../../src/Homepage.vue'

export default {
  ...Theme,
  Layout: () => h(Homepage),
}