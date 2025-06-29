import { defineConfig, DefaultTheme } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EZSJ3YF2RG');
`

const sidebar: DefaultTheme.Sidebar = [
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
          { text: 'Error Report', link: '/guide/project/severity.html' },
        ],
      },
      { text: 'Rewrite Code', link: '/guide/rewrite-code.html', collapsed: true,
        items: [
          { text: 'Transform Code', link: '/guide/rewrite/transform.html' },
          { text: 'Rewriter Rule', link: '/guide/rewrite/rewriter.html' },
        ],
      },
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
    link: '/catalog',
    items: [
      { text: 'C', link: '/catalog/c/'},
      { text: 'C++', link: '/catalog/cpp/'},
      { text: 'Go', link: '/catalog/go/'},
      { text: 'HTML', link: '/catalog/html/'},
      { text: 'Java', link: '/catalog/java/'},
      { text: 'Kotlin', link: '/catalog/kotlin/'},
      { text: 'Python', link: '/catalog/python/'},
      { text: 'Ruby', link: '/catalog/ruby/'},
      { text: 'Rust', link: '/catalog/rust/'},
      { text: 'TypeScript', link: '/catalog/typescript/'},
      { text: 'TSX', link: '/catalog/tsx/'},
      { text: 'YAML', link: '/catalog/yaml/'},
    ],
    collapsed: true,
  },
  {
    text: 'Cheat Sheet',
    items: [
      { text: 'Rule Cheat Sheet', link: '/cheatsheet/rule.html' },
    ],
    collapsed: true,
  },
  {
    text: 'Reference',
    items: [
      { text: 'Command Line Interface', link: '/reference/cli.html', collapsed: true,
        items: [
          { text: 'ast-grep run', link: '/reference/cli/run.html' },
          { text: 'ast-grep scan', link: '/reference/cli/scan.html' },
          { text: 'ast-grep test', link: '/reference/cli/test.html' },
          { text: 'ast-grep new', link: '/reference/cli/new.html' },
        ],
      },
      { text: 'Project Config', link: '/reference/sgconfig.html' },
      { text: 'Rule Config', link: '/reference/yaml.html', collapsed: false,
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
      { text: 'How ast-grep Works', link: '/advanced/how-ast-grep-works.html', collapsed: false,
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
      { text: 'Codemod Studio', link: 'https://app.codemod.com/studio' },
      { text: 'Blog', link: '/blog.html' },
      { text: 'VSCode', link: 'https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode'},
      { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ'},
      { text: 'StackOverflow', link: 'https://stackoverflow.com/questions/tagged/ast-grep'},
      { text: 'Reddit', link: 'https://www.reddit.com/r/astgrep/'},
      { text: 'Docs.rs', link: 'https://docs.rs/ast-grep-core/latest/ast_grep_core/' },
    ],
    collapsed: true,
  },
]

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
    plugins: [llmstxt()],
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
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/introduction.html' },
      {
        text: 'Reference',
        items: [
          { text: 'Command Line Interface', link: '/reference/cli.html' },
          { text: 'Rule Config', link: '/reference/yaml.html' },
          { text: 'Rule Object', link: '/reference/rule.html' },
          { text: 'Playground Manual', link: '/reference/playground.html' },
        ]
      },
      {
        text: 'Resources',
        items: [
          { text: 'FAQ', link: '/advanced/faq.html' },
          { text: 'Rule Examples', link: '/catalog' },
          { text: 'Custom Language', link: '/advanced/custom-language.html' },
          { text: 'Contributing', link: '/contributing/how-to.html' },
          { text: 'Blog', link: '/blog.html' },
        ],
      },
      { text: 'Playground', link: '/playground.html' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ast-grep/ast-grep' },
      { icon: 'discord', link: 'https://discord.com/invite/4YZjf6htSQ' },
    ],
    editLink: {
      pattern: 'https://github.com/ast-grep/ast-grep.github.io/edit/main/website/:path'
    },
    sidebar: {
      '/blog/': [
        { text: 'Blog List', link: '/blog.html' },
        { text: 'Homepage', link: '/' },
        { text: 'VSCode', link: 'https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode'},
        { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ'},
        { text: 'StackOverflow', link: 'https://stackoverflow.com/questions/tagged/ast-grep'},
        { text: 'Reddit', link: 'https://www.reddit.com/r/astgrep/'},
        { text: 'Docs.rs', link: 'https://docs.rs/ast-grep-core/latest/ast_grep_core/' },
      ],
      '/': sidebar,
    },
    footer: {
      message: 'Made with ❤️  with Rust',
      copyright: 'Copyright © 2022-present Herrington Darkholme',
    },
    search: {
      provider: 'local',
    },
  },
  sitemap: {
    hostname: 'https://ast-grep.github.io',
  },
})