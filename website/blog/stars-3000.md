---
author:
  - name: Herrington Darkholme
search: false
date: 2023-11-02
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep got 3000 stars!
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/stars-3000.html
  - - meta
    - property: og:description
      content: ast-grep has recently reached 3000 stars on GitHub! This is a remarkable achievement for the project and I am deeply grateful for all the support and feedback that I have received from the open source community.
---

# ast-grep got 3000 stars!

![3000 stars](/image/blog/star3k.png)

I am very excited and thankful to share with you that ast-grep, a code search and transformation tool that I have been working on for the past year, has recently reached 3000 stars on GitHub! This is a remarkable achievement for the project and I am deeply grateful for all the support and feedback that I have received from the open source community.

## What is ast-grep?

[ast-grep](https://ast-grep.github.io) is a tool that allows you to search and transform code using abstract syntax trees (ASTs). ASTs are tree-like representations of the structure and meaning of source code. By using ASTs, ast-grep can perform more accurate and powerful operations than regular expressions or plain text search.

ast-grep supports multiple programming languages, such as JavaScript, [TypeScript](/catalog/typescript/), Python, [Ruby](/catalog/ruby/), Java, C#, [Rust](/catalog/rust/), and more. You can write [patterns](/guide/pattern-syntax.html) and rules in [YAML](/guide/rule-config/atomic-rule.html) format to specify what you want to match and how you want to transform it. You can also use the command-line interface (CLI) or the web-based [playground](/playground.html) to run ast-grep on your code.

## Why use ast-grep?

ast-grep can help you with many tasks that involve code search and transformation, such as:

- Finding and fixing bugs, vulnerabilities, or code smells
- Refactoring or migrating code to a new syntax or framework
- Enforcing or checking coding standards or best practices
- Analyzing various code using a uniform interface

> ast-grep can save you time and effort by automating repetitive or tedious tasks that would otherwise require manual editing or complex scripting.

## What’s new in ast-grep?

ast-grep is constantly evolving and improving thanks to the feedback and contributions from the users and sponsors. Here are some of the recent changes and updates of ast-grep:

- ast-grep’s YAML rule now has a new `transform` rule: `conversion`, which can change matches to different cases, such as upper, lower, or camelcase.
- ast-grep’s diff/rewriting now can fix multiple rules at once. See [commit](https://github.com/ast-grep/ast-grep/commit/2b301116996b7b010ed271672d35a3529fb36e56)
- `ast-grep test -f`now accepts regex to selectively run ast-grep’s test case.
- `ast-grep --json` supports multiple formats that powers [telescope-sg](https://github.com/Marskey/telescope-sg), a neovim plugin that integrates ast-grep with telescope.
- ast-grep now prints matches with context like `grep -A -B -C`. See [issue](https://github.com/ast-grep/ast-grep/issues/464)
- JSON schema is added for better YAML rule editing. See [folder](https://github.com/ast-grep/ast-grep/tree/main/schemas)
- ast-grep now has official github action setup! See [action](https://github.com/ast-grep/action)
- New documentation for [rewriting code](/guide/rewrite-code.html), [example catalogs](/catalog/), and [playground](/reference/playground.html).

## What’s next for ast-grep?

ast-grep has many plans and goals for the future to make it more useful and user-friendly. Here are some of the upcoming features and enhancements of ast-grep:

- Add python api support to allow users to write custom scripts using ast-grep. See [issue](https://github.com/ast-grep/ast-grep/issues/389)
- Support global language config to let users specify default options for each language. See [issue](https://github.com/ast-grep/ast-grep/issues/658)
- Improve napi documentation to help users understand how to use the native node module of ast-grep. See [issue](https://github.com/ast-grep/ast-grep/issues/682)
- Add metavar filter to make ast-grep run more powerful by allowing users to filter matches based on metavariable values. See [issue](https://github.com/ast-grep/ast-grep/issues/379)
- Add ast-grep’s pattern/rule tutorial to teach users how to write effective and efficient patterns and rules for ast-grep. See [issue](https://github.com/ast-grep/ast-grep.github.io/issues/154)
- Add examples to ast-grep’s reference page to illustrate the usage and functionality of each option and feature. See [issue](https://github.com/ast-grep/ast-grep.github.io/issues/266)

## How to get involved?

If you are interested in ast-grep and want to try it out, you can install it from [npm](https://www.npmjs.com/package/@ast-grep/cli) or [GitHub](https://github.com/ast-grep/ast-grep). You can also visit the [website](https://ast-grep.github.io/) to learn more about the features, documentation, and examples of ast-grep.

If you want to contribute to the code or documentation of ast-grep, we have prepared a thorough [contribution guide](/contributing/how-to.html) for you! You can also report issues, suggest features, or ask questions on the issue tracker.

## Thank you!

I hope you are as enthusiastic as I am about the progress and future of ast-grep. I sincerely value your feedback, suggestions, and contributions. Please do not hesitate to contact me if you have any questions or comments.

Thank you for your wonderful support. You are making a difference in the open source community and in the lives of many developers who use ast-grep.
