---
author:
  - name: Herrington Darkholme
sidebar: false
search: false
date: 2024-05-19
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep got 6000 stars!
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/stars-6000.html
  - - meta
    - property: og:description
      content: ast-grep has recently reached 6000 stars on GitHub! This is a remarkable achievement for the project and I am deeply grateful for all the support and feedback that I have received from the open source community.
---

# ast-grep got 6000 stars!

We are thrilled to announce that [ast-grep](https://ast-grep.github.io/), the powerful code search tool, has reached a stellar milestone of 6000 stars on GitHub! This is a testament to the community's trust in our tool and the continuous improvements we've made. Let's dive into the latest features and enhancements that make ast-grep the go-to tool for developers worldwide.

![ast-grep 6k stars](/image/blog/stars-6k.png)


## Feature Enhancements

- **Rewriters Addition**: We've added support for rewriters [#855](https://github.com/ast-grep/ast-grep/pull/855), enabling complex code transformations and refactoring with ease. The new feature unlocks a novel functional programming like code rewrite scheme: [find and patch](/advanced/find-n-patch.html). Check out our previous [blog post](https://dev.to/herrington_darkholme/find-patch-a-novel-functional-programming-like-code-rewrite-scheme-3964) for more details.

![rewriter](/image/blog/rewriter.png)


- **Error/Warning Suppression Support**: The new feature [#446](https://github.com/ast-grep/ast-grep/pull/446) allows users to suppress specific errors or warnings via the [code comment](/guide/project/lint-rule.html#suppress-linting-error) `ast-grep-ignore`. ast-grep also [respects suppression comments](https://github.com/ast-grep/ast-grep/issues/1019) in Language Server Protocol (LSP), making it easier to manage warnings and errors in your codebase.


- **Enhanced Rule Constraints**: The ast-grep rule `constraints` previously only accepted `pattern`, `kind` and `regex`.
Now it accepts a full rule [#855](https://github.com/ast-grep/ast-grep/pull/855), providing more flexibility than ever before.

## VSCode extension

The [ast-grep VSCode extension](https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode) is an official [VSCode integration](/guide/tools/editors.html) for this CLI tool. It unleashes the power of structural search and replace (SSR) directly into your editor.

### Notable Features
- **Search**: Find code patterns with syntax tree.
- **Replace**: Refactor code with pattern.
- **Diagnose**: Identify issues via ast-grep rule.

## Performance Boost

- **Parallel Thread Output Fix**: A significant fix [#be230ca](https://github.com/ast-grep/ast-grep/commit/be230ca) ensures parallel thread outputs are now guaranteed, boosting overall performance.

## Architectural Evolution

- **Tree-Sitter Version Bump**: We've upgraded to the latest tree-sitter version, enhancing parsing accuracy and speed. In future releases, we plan to leverage tree-sitter's [new Web Assembly grammar](https://zed.dev/blog/language-extensions-part-1) to support even more languages.
- **Scan and Diff Merge**: The [refactor](https://github.com/ast-grep/ast-grep/commit/c78299d2902662cd98bda44f3faf3fbc88439078) combines `CombinedScan::scan` and `CombinedScan::diff` for a more streamlined process.
- **Input Stream Optimization**: Now, ast-grep avoids unnecessary input stream usage when updating all rules [#943](https://github.com/ast-grep/ast-grep/pull/943), making it possible to use `sg scan --update-all`.

## Usability Improvements

- **Error Messaging for Rule File Parsing**: The VSCode extension now provides clearer error messages [#968](https://github.com/ast-grep/ast-grep/pull/968) when rule file parsing fails, making troubleshooting a breeze.

- **Better Pattern Parsing**: Improved expando character replacement [#883](https://github.com/ast-grep/ast-grep/pull/883) to make pattern .
- **More Permissive Patterns**: Patterns have become more permissive [#1087](https://github.com/ast-grep/ast-grep/pull/1087) that allows matching `$METAVAR` with different syntax kind.

## Enhanced Error Reporting

We've introduced a suite of features to improve error reporting, making it easier to debug and refine your code:

- Report undefined meta-variables, errors in fixes, unused rewriters, and undefined utility rules.
- Add field ID errors for relational rules and optimize test updates to avoid erroneous reports.
- Shift from reporting file counts to error counts for a more meaningful insight into code quality.


![error report](/image/blog/error-report.png)



## Language Support Expansion

- **Haskell Support**: Haskell enthusiasts rejoice! ast-grep now supports Haskell via tree-sitter-haskell [#1128](https://github.com/ast-grep/ast-grep/pull/1128), broadening our language coverage.

## NAPI Advancements

- **NAPI Linux x64 musl Support**: Our latest feat in NAPI [#c4d7902](https://github.com/ast-grep/ast-grep/commit/c4d7902) adds support for Linux x64 musl, ensuring wider compatibility and performance.

## Thanks

As ast-grep continues to grow, we remain committed to providing a tool that not only meets but exceeds the expectations of our diverse user base.


![sponsors](/image/blog/sponsor2.png)


We thank each and every one of you, espeically ast-grep's sponsors, for your support, contributions, and feedback that have shaped ast-grep into what it is today. Here's to many more milestones ahead!
