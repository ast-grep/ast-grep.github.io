import { defineConfig } from 'vitepress'

const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EZSJ3YF2RG');
`

const monacoPrefix = 'monaco-editor/esm/vs'

export default defineConfig({
  lang: 'en-US',
  title: 'ast-grep',
  description: 'ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.',
  head: [
    ['script', {async: 'async', src: 'https://www.googletagmanager.com/gtag/js?id=G-EZSJ3YF2RG'}],
    ['script', {}, gaScript],
  ],
  outDir: './dist',
  // appearance: false,
  lastUpdated: true,
  vite: {
    build: {
      target: 'es2020',
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
      { icon: 'discord', link: 'https://discord.com/invite/4YZjf6htSQ' },
    ],
    editLink: {
      pattern: 'https://github.com/ast-grep/ast-grep.github.io/edit/main/website/:path'
    },
    sidebar: [
      {
        text: 'Guide',
        link: '/guide/introduction.html',
        items: [
          { text: 'Quick Start', link: '/guide/quick-start.html' },
          { text: 'Pattern Syntax', link: '/guide/pattern-syntax.html' },
          { text: 'Rule Essentials', link: '/guide/rule-config.html', collapsed: true,
            items:[
              { text: 'Atomic Rule', link: '/guide/rule-config/atomic-rule.html' },
              { text: 'Relational Rule', link: '/guide/rule-config/relational-rule.html' },
              { text: 'Composite Rule', link: '/guide/rule-config/composite-rule.html' },
              { text: 'Utility Rule', link: '/guide/rule-config/utility-rule.html' },
          ],},
          {
            text: 'Project Setup', collapsed: true, link: '/guide/scan-project.html',
            items: [
              { text: 'Project Configuration', link: '/guide/project/project-config.html' },
              { text: 'Lint Rule', link: '/guide/project/lint-rule.html' },
              { text: 'Test Your Rule', link: '/guide/test-rule.html' },
            ],
          },
          { text: 'Rewrite Code', link: '/guide/rewrite-code.html' },
          {
            text: 'Tooling Overview', link: '/guide/tooling-overview.html', collapsed: true,
            items: [
              { text: 'Editor Integration', link: '/guide/tools/editors.html' },
              { text: 'JSON mode', link: '/guide/tools/json.html' },
            ],
          },
          { text: 'API Usage', link: '/guide/api-usage.html', collapsed: true,
            items:[
              { text: 'JavaScript API', link: '/guide/api-usage/js-api.html' },
              { text: 'Python API', link: '/guide/api-usage/py-api.html' },
              { text: 'Performance Tip', link: '/guide/api-usage/performance-tip.html' },
            ]},
        ],
        collapsed: false,
      },
      {
        text: 'Examples',
        link: '/catalog/',
        items: [
          { text: 'C', link: '/catalog/c/'},
          { text: 'Go', link: '/catalog/go/'},
          { text: 'Java', link: '/catalog/java/'},
          { text: 'Python', link: '/catalog/python/'},
          { text: 'Ruby', link: '/catalog/ruby/'},
          { text: 'Rust', link: '/catalog/rust/'},
          { text: 'TypeScript', link: '/catalog/typescript/'},
          { text: 'TSX', link: '/catalog/tsx/'},
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
          { text: 'Rule Config', link: '/reference/yaml.html', collapsed: true,
            items: [
              { text: 'fix', link: '/reference/yaml/fix.html' },
              { text: 'transformation', link: '/reference/yaml/transformation.html' },
              { text: 'rewriter', link: '/reference/yaml/rewriter.html' },
            ],
          },
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
          { text: 'Frequently Asked Questions', link: '/advanced/faq.html'},
          { text: 'How ast-grep Works', link: '/advanced/how-ast-grep-works.html',
            items: [
              { text: 'Core Concepts', link: '/advanced/core-concepts.html'},
              { text: 'Pattern Syntax', link: '/advanced/pattern-parse.html'},
              { text: 'Pattern Match Algorithm', link: '/advanced/match-algorithm.html'},
              { text: 'How Rewrite Works', link: '/advanced/find-n-patch.html'},
            ] ,
          },
          { text: 'Custom Language Support', link: '/advanced/custom-language.html'},
          { text: 'Multi-Language Documents', link: '/advanced/language-injection.html'},
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
          { text: 'VSCode', link: 'https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode'},
          { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ'},
          { text: 'StackOverflow', link: 'https://stackoverflow.com/questions/tagged/ast-grep'},
          { text: 'Reddit', link: 'https://www.reddit.com/r/astgrep/'},
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