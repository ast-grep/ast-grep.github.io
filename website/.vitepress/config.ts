import { defineConfig } from 'vitepress'

const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-EZSJ3YF2RG');
`

export default defineConfig({
  lang: 'en-US',
  title: 'ast-grep',
  titleTemplate: 'lightning fast code tool',
  description: 'ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.',
  head: [
    ['script', {async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-EZSJ3YF2RG'}],
    ['script', {}, gaScript],
  ],
  outDir: './dist',
  appearance: false,
  themeConfig: {
    logo: 'logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/cli' },
      { text: 'Playground', link: '/playground' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ast-grep/ast-grep' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'Pattern Syntax', link: '/guide/pattern-syntax' },
          { text: 'Rule Configuration', link: '/guide/rule-config', items:[
            { text: 'Atomic Rule', link: '/guide/rule-config/atomic-rule' },
            { text: 'Relational Rule', link: '/guide/rule-config/relational-rule' },
            { text: 'Composite Rule', link: '/guide/rule-config/composite-rule' },
          ]},
          { text: 'Test Your Rule', link: '/guide/test-rule' },
          { text: 'Tooling Overview', link: '/guide/tooling-overview' },
          { text: 'API Usage', link: '/guide/api-usage' },
          { text: 'Editor Integration', link: '/guide/editor-integration' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Command Line Interface', link: '/reference/cli' },
          { text: 'YAML Configuration', link: '/reference/yaml' },
          { text: 'Rule Object', link: '/reference/rule' },
          { text: 'API Reference', link: '/reference/api' },
        ],
      },
      {
        text: 'Links',
        items: [
          { text: 'Playground', link: '/playground' },
          { text: 'Roadmap', link: '/links/roadmap' },
          { text: 'Docs.rs', link: 'https://docs.rs/ast-grep-core/0.1.2/ast_grep_core/' },
        ],
      },
    ],
    footer: {
      message: 'Made with ❤️  with Rust',
      copyright: 'Copyright © 2022-present Herrington Darkholme',
    }
  },
})
