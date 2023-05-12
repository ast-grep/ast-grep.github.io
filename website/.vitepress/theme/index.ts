import Theme from 'vitepress/theme'
import { h } from 'vue'
import Homepage from '../../src/Homepage.vue'
import './custom.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => [h(Homepage)],
    })
  },
}
