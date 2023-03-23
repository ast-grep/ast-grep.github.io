import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

const sponsorImg = 'https://raw.githubusercontent.com/HerringtonDarkholme/sponsors/main/sponsorkit/sponsors.svg'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(
        'div', {style: { margin: 'auto', width: 'fit-content'}},
          h('img', {src: sponsorImg})),
    })
  },
}
