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
    ['script', {async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-EZSJ3YF2RG'}],
    ['script', {}, gaScript],
  ],
  outDir: './dist',
  appearance: false,
  vite: {
    build: {
      target: 'es2020',
      ssr: false,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
    },
  },
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
    editLink: {
      pattern: 'https://github.com/ast-grep/ast-grep.github.io/edit/main/website/:path'
    },
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'Pattern Syntax', link: '/guide/pattern-syntax' },
          { text: 'Scan Project', link: '/guide/scan-project.md' },
          { text: 'Rule Configuration', link: '/guide/rule-config', collapsed: true,
            items:[
              { text: 'Atomic Rule', link: '/guide/rule-config/atomic-rule' },
              { text: 'Relational Rule', link: '/guide/rule-config/relational-rule' },
              { text: 'Composite Rule', link: '/guide/rule-config/composite-rule' },
              { text: 'Utility Rule', link: '/guide/rule-config/utility-rule' },
          ],},
          { text: 'Test Your Rule', link: '/guide/test-rule' },
          { text: 'Tooling Overview', link: '/guide/tooling-overview' },
          { text: 'API Usage', link: '/guide/api-usage' },
          { text: 'Editor Integration', link: '/guide/editor-integration' },
        ],
        collapsed: false,
      },
      {
        text: 'Reference',
        items: [
          { text: 'Command Line Interface', link: '/reference/cli' },
          { text: 'Project Config', link: '/reference/sgconfig' },
          { text: 'Rule Config', link: '/reference/yaml' },
          { text: 'Rule Object', link: '/reference/rule' },
          { text: 'API Reference', link: '/reference/api' },
          { text: 'Language List', link: '/reference/languages' },
        ],
        collapsed: false,
      },
      {
        text: 'Advanced Topics',
        items: [
          { text: 'Core Concepts', link: '/advanced/core-concepts'},
          { text: 'Pattern Match Algorithm', link: '/advanced/match-algorithm'},
          { text: 'Custom Language Support', link: '/advanced/custom-language'},
          { text: 'Comparison with Other Tools', link: '/advanced/tool-comparison'},
        ],
        collapsed: true,
      },
      {
        text: 'Links',
        items: [
          { text: 'Playground', link: '/playground' },
          { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ'},
          { text: 'Docs.rs', link: 'https://docs.rs/ast-grep-core/latest/ast_grep_core/' },
        ],
        collapsed: true,
      },
    ],
    footer: {
      message: 'Made with ❤️  with Rust',
      copyright: 'Copyright © 2022-present Herrington Darkholme',
    },
    search: {
      provider: 'local',
    },
  },
})
