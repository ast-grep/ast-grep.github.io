import { DefaultTheme, defineConfig } from 'vitepress'
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
    link: '/guide/introduction',
    items: [
      { text: 'Quick Start', link: '/guide/quick-start' },
      { text: 'Pattern Syntax', link: '/guide/pattern-syntax' },
      {
        text: 'Rule Essentials',
        link: '/guide/rule-config',
        collapsed: true,
        items: [
          { text: 'Atomic Rule', link: '/guide/rule-config/atomic-rule' },
          { text: 'Relational Rule', link: '/guide/rule-config/relational-rule' },
          { text: 'Composite Rule', link: '/guide/rule-config/composite-rule' },
          { text: 'Utility Rule', link: '/guide/rule-config/utility-rule' },
        ],
      },
      {
        text: 'Project Setup',
        collapsed: true,
        link: '/guide/scan-project',
        items: [
          { text: 'Project Configuration', link: '/guide/project/project-config' },
          { text: 'Lint Rule', link: '/guide/project/lint-rule' },
          { text: 'Test Your Rule', link: '/guide/test-rule' },
          { text: 'Error Report', link: '/guide/project/severity' },
        ],
      },
      {
        text: 'Rewrite Code',
        link: '/guide/rewrite-code',
        collapsed: true,
        items: [
          { text: 'Transform Code', link: '/guide/rewrite/transform' },
          { text: 'Rewriter Rule', link: '/guide/rewrite/rewriter' },
        ],
      },
      {
        text: 'Tooling Overview',
        link: '/guide/tooling-overview',
        collapsed: true,
        items: [
          { text: 'Outline Code', link: '/guide/outline-code' },
          { text: 'Editor Integration', link: '/guide/tools/editors' },
          { text: 'JSON mode', link: '/guide/tools/json' },
        ],
      },
      {
        text: 'API Usage',
        link: '/guide/api-usage',
        collapsed: true,
        items: [
          { text: 'JavaScript API', link: '/guide/api-usage/js-api' },
          { text: 'Python API', link: '/guide/api-usage/py-api' },
          { text: 'Performance Tip', link: '/guide/api-usage/performance-tip' },
        ],
      },
    ],
    collapsed: false,
  },
  {
    text: 'Examples',
    link: '/catalog',
    items: [
      { text: 'C', link: '/catalog/c/' },
      { text: 'C++', link: '/catalog/cpp/' },
      { text: 'Go', link: '/catalog/go/' },
      { text: 'HTML', link: '/catalog/html/' },
      { text: 'Java', link: '/catalog/java/' },
      { text: 'Kotlin', link: '/catalog/kotlin/' },
      { text: 'Python', link: '/catalog/python/' },
      { text: 'Ruby', link: '/catalog/ruby/' },
      { text: 'Rust', link: '/catalog/rust/' },
      { text: 'TypeScript', link: '/catalog/typescript/' },
      { text: 'TSX', link: '/catalog/tsx/' },
      { text: 'YAML', link: '/catalog/yaml/' },
    ],
    collapsed: true,
  },
  {
    text: 'Cheat Sheet',
    items: [
      { text: 'Rule Cheat Sheet', link: '/cheatsheet/rule' },
      { text: 'Config Cheat Sheet', link: '/cheatsheet/yaml' },
    ],
    collapsed: true,
  },
  {
    text: 'Reference',
    items: [
      {
        text: 'Command Line Interface',
        link: '/reference/cli',
        collapsed: true,
        items: [
          { text: 'ast-grep run', link: '/reference/cli/run' },
          { text: 'ast-grep scan', link: '/reference/cli/scan' },
          { text: 'ast-grep test', link: '/reference/cli/test' },
          { text: 'ast-grep new', link: '/reference/cli/new' },
          { text: 'ast-grep outline', link: '/reference/cli/outline' },
        ],
      },
      { text: 'Project Config', link: '/reference/sgconfig' },
      {
        text: 'Rule Config',
        link: '/reference/yaml',
        collapsed: false,
        items: [
          { text: 'fix', link: '/reference/yaml/fix' },
          { text: 'transformation', link: '/reference/yaml/transformation' },
          { text: 'rewriter', link: '/reference/yaml/rewriter' },
        ],
      },
      {
        text: 'Rule Object',
        link: '/reference/rule',
        collapsed: false,
        items: [{ text: 'ESQuery Style Kind', link: '/reference/rule/esquery' }],
      },
      {
        text: 'Outline Extraction Rules',
        link: '/reference/outline-rules',
        collapsed: false,
        items: [{ text: 'Field Reference', link: '/reference/outline-rule-fields' }],
      },
      { text: 'API Reference', link: '/reference/api' },
      { text: 'Language List', link: '/reference/languages' },
      { text: 'Playground Manual', link: '/reference/playground' },
    ],
    collapsed: true,
  },
  {
    text: 'Advanced Topics',
    items: [
      { text: 'Using ast-grep with AI', link: '/advanced/prompting' },
      { text: 'Frequently Asked Questions', link: '/advanced/faq' },
      {
        text: 'How ast-grep Works',
        link: '/advanced/how-ast-grep-works',
        collapsed: false,
        items: [
          { text: 'Core Concepts', link: '/advanced/core-concepts' },
          { text: 'Pattern Syntax', link: '/advanced/pattern-parse' },
          { text: 'Pattern Match Algorithm', link: '/advanced/match-algorithm' },
          { text: 'How Rewrite Works', link: '/advanced/find-n-patch' },
        ],
      },
      { text: 'Custom Language Support', link: '/advanced/custom-language' },
      { text: 'Multi-Language Documents', link: '/advanced/language-injection' },
      { text: 'Comparison with Other Tools', link: '/advanced/tool-comparison' },
    ],
    collapsed: true,
  },
  {
    text: 'Contributing',
    items: [
      { text: 'Guide', link: '/contributing/how-to' },
      { text: 'Development', link: '/contributing/development' },
      { text: 'Add New Language', link: '/contributing/add-lang' },
    ],
    collapsed: true,
  },
  {
    text: 'Links',
    items: [
      { text: 'Mastering ast-grep', link: 'https://leanpub.com/ast-grep' },
      { text: 'Playground', link: '/playground' },
      { text: 'Blog', link: '/blog' },
      {
        text: 'VSCode',
        link: 'https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode',
      },
      { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ' },
      { text: 'StackOverflow', link: 'https://stackoverflow.com/questions/tagged/ast-grep' },
      { text: 'Reddit', link: 'https://www.reddit.com/r/astgrep/' },
      { text: 'Docs.rs', link: 'https://docs.rs/ast-grep-core/latest/ast_grep_core/' },
      { text: 'Codemod Studio', link: 'https://app.codemod.com/studio' },
    ],
    collapsed: true,
  },
]

export default defineConfig({
  lang: 'en-US',
  title: 'ast-grep',
  description:
    'ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.',
  head: [
    ['script', { async: 'async', src: 'https://www.googletagmanager.com/gtag/js?id=G-EZSJ3YF2RG' }],
    ['script', {}, gaScript],
  ],
  outDir: './dist',
  // appearance: false,
  cleanUrls: true,
  lastUpdated: true,
  transformPageData(pageData) {
    const canonicalUrl = `https://astgrep.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl },
    ])
  },
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
      { text: 'Guide', link: '/guide/introduction' },
      {
        text: 'Reference',
        items: [
          { text: 'Command Line Interface', link: '/reference/cli' },
          { text: 'Rule Config', link: '/reference/yaml' },
          { text: 'Rule Object', link: '/reference/rule' },
          { text: 'Playground Manual', link: '/reference/playground' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'FAQ', link: '/advanced/faq' },
          { text: 'Rule Examples', link: '/catalog' },
          { text: 'Custom Language', link: '/advanced/custom-language' },
          { text: 'Contributing', link: '/contributing/how-to' },
          { text: 'Blog', link: '/blog' },
          { text: 'Mastering ast-grep', link: 'https://leanpub.com/ast-grep' },
        ],
      },
      { text: 'Playground', link: '/playground' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ast-grep/ast-grep' },
      { icon: 'discord', link: 'https://discord.com/invite/4YZjf6htSQ' },
      { icon: 'leanpub', link: 'https://leanpub.com/ast-grep', ariaLabel: 'Mastering ast-grep' },
    ],
    editLink: {
      pattern: 'https://github.com/ast-grep/ast-grep.github.io/edit/main/website/:path',
    },
    sidebar: {
      '/blog': [
        { text: 'Blog List', link: '/blog' },
        { text: 'Homepage', link: '/' },
        { text: 'Mastering ast-grep', link: 'https://leanpub.com/ast-grep' },
        {
          text: 'VSCode',
          link: 'https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode',
        },
        { text: 'Discord', link: 'https://discord.com/invite/4YZjf6htSQ' },
        { text: 'StackOverflow', link: 'https://stackoverflow.com/questions/tagged/ast-grep' },
        { text: 'Reddit', link: 'https://www.reddit.com/r/astgrep/' },
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
    hostname: 'https://astgrep.com',
  },
})
