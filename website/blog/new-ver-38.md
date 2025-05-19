---
author:
  - name: Herrington Darkholme
search: false
date: 2025-05-18
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep new release 0.38
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/new-ver-38.html
  - - meta
    - property: og:description
      content: ast-grep 0.38 brings some fantastic new features to improve your code searching and linting experience, alongside a significant internal shift.
---

# ast-grep 0.38 is Here

We're excited to announce the release of ast-grep 0.38! This version brings some fantastic new features to improve your code searching and linting experience, alongside a significant internal shift that paves the way for exciting future developments.

For those new to ast-grep, it's a powerful command-line tool that lets you search and rewrite code based on its structure (Abstract Syntax Trees or ASTs), not just text. Think of it as `grep` or `sed`, but for code syntax!

Let's dive into what's new:

##  New Features

### Customizable Code Highlighting with `labels`

One of the exciting new additions is the `labels` field for your rule configurations. Previously, ast-grep's highlighting was pre-programmed and could not provide much context. Now, you can customize the highlighting of your matches with labels that are more meaningful and relevant to your codebase. These clearer labels also contribute to a cleaner and more intuitive user interface when viewing diagnostics.

![Example of Customizable Code Highlighting](/image/blog/labels-demo.png)

But the benefits don't stop at individual understanding. The labels field offers a fantastic way to embed more guidance directly into your rules, and it allow you to share coding best practices, style guide reminders, or domain-specific knowledge across your entire team. This feature helps disseminate expertise and maintain consistency effortlessly. For example, [Sam Wight](https://github.com/samwightt), the lables feature's proposer, is using ast-grep to help his team to write better [Angular code](/catalog/typescript/missing-component-decorator.html)!

![Example of VSCode](/image/blog/labels-vscode.jpeg)

Furthermore, this improved diagnostic experience isn't confined to the command line. The ast-grep VSCode extension now fully respects these labels, bringing this enhanced highlighting via the Language Server Protocol (LSP). You can click on the label message in the VSCode diagnostic popup and jump to the relevant code point!

### `--json` Output Gets More Informative

The `--json` output option can now include rule `metadata` when you use the new `--include-metadata` flag. This is helpful for integrating ast-grep into other tools or for more detailed programmatic analysis, e.g. [SonarQube](https://github.com/ast-grep/ast-grep/issues/1987).

## Tree-sitter Independence

This is a significant architectural change! Previously, ast-grep was tightly coupled with tree-sitter, a fantastic parser generator tool. While tree-sitter has been foundational to ast-grep's ability to support many languages, this tight coupling had limitations.

*   **Introducing `SgNode`:** We've abstracted the core AST node representation with a new trait called `SgNode`. This makes ast-grep's core logic more flexible and less dependent on a single parsing technology.
*   **WASM Power-Up:** The ast-grep WebAssembly (WASM) module, which powers our interactive playground, now directly uses `tree-sitter-web` instead of the wrapper library [`tree-sitter-facade`](https://github.com/ast-grep/tree-sitter-wasm/tree/main/crates/tree-sitter-facade).
*   **Paving the Way for the Future:** This independence opens doors for exciting new possibilities:
    *   **Proof of Concept OXC Integration:** We're exploring [integration](https://github.com/ast-grep/ast-grep/pull/1970) with Oxc, a high-performance JavaScript/TypeScript toolchain written in Rust. Oxc boasts an extremely fast parser, which could bring significant performance benefits to ast-grep for JavaScript and TypeScript projects.
    *   **Future SWC Integration:** Similarly, we're looking into [leveraging SWC](https://github.com/swc-project/plugins/pull/435), another Rust-based platform for fast JavaScript/TypeScript compilation and transformation.

This move is all about future-proofing ast-grep and allowing us to adopt the best parsing technologies for different languages and use cases, ultimately leading to a faster and more versatile tool for you.

## Breaking Changes

### Dropped Support for Older Linux Versions (glibc < 2.35)

Due to [an upgrade in the GitHub Actions build images](https://github.com/actions/runner-images/issues/11101), ast-grep binaries are now built on Ubuntu 22.04. This means they rely on a newer version of glibc (GNU C Library).

**Impact:** Pre-compiled ast-grep binaries will no longer support distributions with glibc versions older than 2.35. For example, Ubuntu 20.04, which has glibc 2.31, is no longer directly supported by our pre-built binaries. This change also impacts [@ast-grep/napi](https://www.npmjs.com/package/@ast-grep/napi).

**Alternatives:** If you are on an older Linux distribution, you can still use ast-grep by:
* Building it from source.
* Using package managers that might compile it for your specific distribution if available (like AUR for Arch Linux).
* Consider upgrading your system to a more recent version of your Linux distribution.
* Keep using ast-grep 0.37 if you don't want to upgrade your system.

### Rust Library API Breaking Changes

For users of ast-grep as a Rust library, please note the following API adjustments:

*   `AstGrep` is now an alias for `Root`.
*   Tree-sitter specific methods within the `Language` trait have been moved to a new `LanguageExt` trait.
*   `StrDoc` and related types have been relocated to the `ast_grep_core::tree_sitter` module.

These changes are part of the larger effort to decouple ast-grep from tree-sitter and provide a cleaner, more maintainable library interface.

## Get Started with 0.38!

We believe these changes, especially the move towards parser independence and the enhanced diagnostic labeling, will make ast-grep an even more powerful and user-friendly tool for your everyday development tasks.

Head over to our [GitHub repo](https://github.com/ast-grep/ast-grep)  to grab the latest version. Check out the [documentation](https://ast-grep.github.io/) for more details on how to use the new features.

We're excited to see how you use ast-grep 0.38! As always, your feedback is invaluable, so please don't hesitate to open issues or discussions on our GitHub repository.

Happy Grepping!
