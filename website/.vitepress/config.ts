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
  description: 'ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.',
  head: [
    ['script', {async: 'async', src: 'https://www.googletagmanager.com/gtag/js?id=G-EZSJ3YF2RG'}],
    ['script', {}, gaScript],
  ],
  outDir: './dist',
  appearance: false,
  lastUpdated: true,
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
      { text: 'Guide', link: '/guide/introduction.html' },
      { text: 'Reference', link: '/reference/cli.html' },
      { text: 'Examples', link: '/catalog/' },
      { text: 'Playground', link: '/playground.html' },
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
          { text: 'Introduction', link: '/guide/introduction.html' },
          { text: 'Quick Start', link: '/guide/quick-start.html' },
          { text: 'Pattern Syntax', link: '/guide/pattern-syntax.html' },
          { text: 'Scan Project', link: '/guide/scan-project.html' },
          { text: 'Rule Configuration', link: '/guide/rule-config.html', collapsed: true,
            items:[
              { text: 'Atomic Rule', link: '/guide/rule-config/atomic-rule.html' },
              { text: 'Relational Rule', link: '/guide/rule-config/relational-rule.html' },
              { text: 'Composite Rule', link: '/guide/rule-config/composite-rule.html' },
              { text: 'Utility Rule', link: '/guide/rule-config/utility-rule.html' },
          ],},
          { text: 'Test Your Rule', link: '/guide/test-rule.html' },
          { text: 'Tooling Overview', link: '/guide/tooling-overview.html' },
          { text: 'API Usage', link: '/guide/api-usage.html' },
          { text: 'Editor Integration', link: '/guide/editor-integration.html' },
        ],
        collapsed: false,
      },
      {
        text: 'Examples',
        items: [
          { text: 'Catalog', link: '/catalog/'},
          { text: 'Ruby', link: '/catalog/ruby/'},
          { text: 'Rust', link: '/catalog/rust/'},
          { text: 'TypeScript', link: '/catalog/typescript/'},
        ],
        collapsed: true,
      },
      {
        text: 'Reference',
        items: [
          { text: 'Command Line Interface', link: '/reference/cli.html', collapsed: true,
            items: [
              { text: 'sg run', link: '/reference/cli/run.html' },
              { text: 'sg scan', link: '/reference/cli/scan.html' },
              { text: 'sg test', link: '/reference/cli/test.html' },
              { text: 'sg new', link: '/reference/cli/new.html' },
            ],
          },
          { text: 'Project Config', link: '/reference/sgconfig.html' },
          { text: 'Rule Config', link: '/reference/yaml.html' },
          { text: 'Rule Object', link: '/reference/rule.html' },
          { text: 'API Reference', link: '/reference/api.html' },
          { text: 'Language List', link: '/reference/languages.html' },
          { text: 'Playground Manual', link: '/reference/playground.html' },
        ],
        collapsed: true,
      },
      {
        text: 'Advanced Topics',
        items: [
          { text: 'Core Concepts', link: '/advanced/core-concepts.html'},
          { text: 'Pattern Match Algorithm', link: '/advanced/match-algorithm.html'},
          { text: 'Custom Language Support', link: '/advanced/custom-language.html'},
          { text: 'Comparison with Other Tools', link: '/advanced/tool-comparison.html'},
        ],
        collapsed: true,
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Guide', link: '/contributing/how-to.html' },
          { text: 'Development', link: '/contributing/development.html' },
          { text: 'Add New Language', link: '/contributing/add-lang.html' },
        ],
        collapsed: true,
      },
      {
        text: 'Links',
        items: [
          { text: 'Playground', link: '/playground.html' },
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