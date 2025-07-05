---
author:
  - name: Herrington Darkholme
search: false
date: 2025-03-04
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep Rockets to 8000 Stars!
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/stars-8000.html
  - - meta
    - property: og:description
      content: ast-grep has recently reached 6000 stars on GitHub! This is a remarkable achievement for the project and I am deeply grateful for all the support and feedback that I have received from the open source community.
---

# ast-grep Rockets to 8000 Stars!

We are absolutely bursting with excitement to announce that ast-grep has soared past **8,000 stars** on GitHub! Every star represents a developer who sees the potential in ast-grep, and we're deeply grateful for your support.

![stars-8000](/image/blog/stars-8k.jpeg)

ast-grep's mission to make code searching, linting, and rewriting more accessible and powerful has truly resonated with the community. This blog post is your guide to all the fantastic updates, encompassing both the core ast-grep CLI tool and our ever-improving website. Buckle up, let's explore what's new!

## Expanding the Language Universe: YAML, PHP, and More!

ast-grep is rapidly becoming a truly polyglot code analysis powerhouse! We've significantly expanded our language support to empower you to work with even more of your codebase:

**YAML Support Arrives!** YAML is the backbone of configuration for countless projects. Now, ast-grep CLI officially speaks [YAML](/catalog/yaml/), allowing you to leverage the same powerful rule system to lint, search, and even rewrite your YAML configuration files. Imagine using ast-grep rules to enforce best practices in your Kubernetes manifests or streamline your CI/CD pipelines! And yes, you can even write ast-grep rules _using YAML_ itself!

**Enhanced PHP Analysis:** We've introduced a dedicated PHP language parser (`php-only-language`) for the CLI. This means more accurate and reliable analysis for your PHP code, helping you catch tricky bugs and enforce code quality standards with greater confidence.

**Dynamic Languages in APIs:** Python and JavaScript API users, rejoice! You can now tap into dynamic language support within [PyO3](https://github.com/ast-grep/ast-grep/blob/main/crates/pyo3/tests/test_register_lang.py) and [napi](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/__test__/custom.spec.ts). This unlocks exciting possibilities for extending ast-grep's reach and integrating it into even more diverse and dynamic environments.

**Embedded Language in HTML:** We've refined support for registering [embedded languages](/advanced/language-injection.html) in the CLI, giving you even more flexibility when dealing with complex code structures like searching JavaScript/CSS in HTML.

## More Powerful Rules & Patterns

We've been laser-focused on making the ast-grep's rule system an even more powerful and precise tool for code manipulation:

**CSS inspired `nthChild` Matcher:** [nthChild](/guide/rule-config/atomic-rule.html#nthchild) is a rule to find nodes based on their positions in the parent node's children list. It is heavily inspired by CSS's nth-child pseudo-class and helps you target specific nodes in a more granular way.

**Pinpoint Precision with `range` Matchers:** Need to refine your rules to target a very specific section of code, even down to the character? ast-grep now supports [range](/guide/rule-config/atomic-rule.html#range) matchers! You can define rules that activate only within a particular line _and_ character column range. This is useful for interacting with external tools like compilers.

**Pattern with `--selector` and `--strictness` in `sg run`:** Need to fine tune your search pattern? The `--selector` and `--strictness` flag in [`sg run`](/reference/cli/run.html#run-specific-options) gives you fine-grained control over pattern matching.

**Simplified Suppression with `ast-grep-ignore`:** [Suppressing rules](/guide/project/severity.html) just got simpler! You can now use the `ast-grep-ignore` comment directly on the same line as the code you want to exclude. Less clutter, more control.

**More Robust Partial Pattern Snippet** The `ERROR` node in patterns can now match _anything_. This makes partial pattern snippet even more robust.

## Sharpening the Code Search CLI

**Glob Path Matching & Symbolic Link Traversal Unleashed:** CLI users can now leverage the power of [glob patterns](/reference/cli/run.html#globs-globs) to specify file paths and effortlessly traverse [symbolic links](/reference/cli/run.html#follow). Navigating and analyzing your projects is now more intuitive than ever.

**Rule Entity Inspection & Overwrite: Deeper Insights, More Control:** Gain insights by `--inspect` CLI flag with [semi-structured tracing output](/reference/cli/scan.html#inspect-granularity). This feature empowers advanced users with deeper debugging and customization capabilities.

**Contextual Code Scanning with Before/After Flags:** Enhance your CLI scan results with surrounding code context using the new `context`, `before`, and `after` flags. Understand the bigger picture around your matches at a glance.

**Know Your Impact: Fixed Rules Count:** The CLI now prints a count of fixed rules, giving you immediate feedback on the scope of your code modifications.

**Debugging Supercharged:** We've significantly improved debugging with prettified pattern output, Debug AST/CST visualization, and colorized output via the [`--debug-query`](/reference/cli/run.html#debug-query-format) flag. Troubleshooting and refining your rules is now a much smoother and more visual experience.

## Enhanced Tooling and API Experience

We're committed to providing a seamless developer experience across all of ast-grep's interfaces:

**Typed `SgNode` and `SgRoot` in NAPI:** For our NAPI users, we've introduced [typed `SgNode` and `SgRoot`](/blog/typed-napi.html), significantly improving type safety and code clarity when working with the API. This enhancement is [initiated](https://github.com/ast-grep/ast-grep/pull/1661) by [mohebifar](https://github.com/mohebifar) from [Codemod](https://codemod.com/).

**Rule Config in `SgNode` Match Methods:** Flexibility at your fingertips! Rule configurations can now be [passed directly](https://github.com/ast-grep/ast-grep/pull/1730) to `SgNode` match methods like `matches`, `has`, `inside`, `follows`, and `precedes`. Configure your rules dynamically within your code. This feature is also contributed by [mohebifar](https://codemod.com/).

**New `fieldChildren`:** The new `fieldChildren` method in NAPI and PyO3 provides easier access to named children nodes, simplifying AST traversal and manipulation in your API integrations.

**Powerful Code Modification in PyO3/NAPI:** Unlock advanced code modification features with Fix Related Features and Modify Edit Range in [PyO3](/guide/api-usage/py-api.html#fix-code)/[NAPI](/guide/api-usage/js-api.html#fix-code). Refactoring and code transformation just got even more powerful from within your Python and JavaScript code.

**Smaller, Faster NAPI Binaries:** We've reduced the NAPI binary size, resulting in smaller downloads and faster installations – get up and running with ast-grep even quicker!

**Robust Python Integration:** Typings for PyO3 and strictness improvements in PyO3/YAML enhance the overall robustness and reliability of our Python integration.

## Website: Documentation & Interactive Exploration

The ast-grep website isn't just a static page; it's your interactive command center for learning, exploring, and mastering ast-grep! We've poured significant effort into expanding and refining the website to be your ultimate resource:

**Documentation Deep Dive:** We've massively expanded and clarified the documentation, with deeper dives into crucial topics, clearer explanations of pattern objects, a comprehensive FAQ, and enhanced API documentation. Whether you're a beginner or an expert, you'll find valuable resources to level up your ast-grep skills.

**Revamped Blog Section:** Dive into in-depth articles and latest news in the [brand-new blog section](/blog.html). Stay up-to-date with the latest ast-grep insights and learn from real-world examples.

**Improved Sections & Navigation:** Finding what you need is now easier than ever with a reorganized and polished section and improved overall website navigation.

**Website Stability & Polish:** We've squashed styling issues, resolved mobile responsiveness problems, fixed typing errors, and eliminated broken links to ensure a smooth and reliable browsing experience across all devices.

### Interactive Example Catalog: Learn by Doing!

The [example catalog](https://ast-grep.github.io/catalog) has received a major upgrade, transforming it into an interactive learning environment:

**Interactive Rule Exploration:** Dive deep into rules with interactive features like Rule Display & Extraction, MetaVar Panel, Matched Labeling, Pattern Debugger, Selector Explorer, and Pattern Configuration & Icons. Dissect rules, understand their components, and visualize how they work – all in your browser!

**Effortless Rule Discovery:** Finding the right rule is now a breeze with new filters for language and sorting options.

**Enhanced Usability:** Small but mighty additions like Empty Filter and Rule Counting further enhance the catalog's ease of use.

See [the youtube video](https://www.youtube.com/watch?v=oNbOoBhVL8o) for a live demo.

### Playground Power-Ups: Your Online Rule Lab

The online playground at [https://ast-grep.github.io/](https://ast-grep.github.io/) is now an even more powerful lab for experimenting and refining your rules:

**Parser Version Visibility:** Small popups now display the tree-sitter version used in the playground, giving you valuable context for your rule testing.

**Reset & Counter Enhancements:** Thanks to [@zhangmo8](https://github.com/zhangmo8), we've added a Reset Button and a match counter to further streamline your playground workflow.

**CSS Support in Playground:** The online playground now speaks CSS! Test your ast-grep rules directly on CSS code snippets.

## Performance Unleashed

We're obsessed with speed and efficiency! Here are the performance enhancements we've delivered in the CLI:

**Leaner Binaries, Faster Performance:** Optimized printer implementation has resulted in significant binary size reduction and improved overall performance.

**Intelligent File Scanning:** ast-grep now only scans rule-sensitive files, dramatically improving performance for large projects. Less scanning, faster results!

**`cargo binstall` for Instant Installs:** Faster installation is now a reality with `cargo binstall` support. Get pre-built binaries and get analyzing your code in record time.

**Configurable Threads: Fine-Tune for Your Machine:** Fine-tune performance by configuring the number of threads ast-grep uses. Optimize ast-grep for your specific hardware and project needs.

... and of course, numerous bug fixes under the hood to ensure a smoother, more reliable experience!

## 🎉 Thank You - From the Bottom of Our Hearts! 🎉

Reaching over 8000 stars is an absolutely fantastic milestone, and it's all thanks to _you_, our incredible community! We are deeply grateful for your unwavering support, invaluable feedback, detailed bug reports, inspiring feature requests, and generous code contributions. You are the fuel that powers ast-grep's rocket!

**Get Started & Get Involved Today!**

- **Explore the Enhanced Website:** Dive into the wealth of resources at [https://ast-grep.github.io/](https://ast-grep.github.io/)
- **Star us on GitHub!** Show your support and help us reach the next milestone: [Star the GitHub Repo](https://github.com/ast-grep/ast-grep)
- **Try out the New Features & Give Feedback:** Join the conversation on [Discord](https://discord.com/invite/4YZjf6htSQ) and tell us what you think!
- **Contribute Rules to the Example Catalog:** Share your expertise and help others by [contributing rules](https://github.com/ast-grep/ast-grep.github.io/tree/main/website/catalog).
- **Report Bugs & Feature Requests:** Help us make ast-grep even better by reporting issues and suggesting new features on [GitHub Issues](https://github.com/ast-grep/ast-grep/issues)

We're incredibly excited to continue this journey with you! Let's keep pushing the boundaries of code searching, linting, and rewriting, making it more powerful and accessible for everyone! 🚀 ✨
