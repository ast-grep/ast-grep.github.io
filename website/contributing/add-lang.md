# Add New Language to ast-grep

Thank you for your interest in adding a new language to ast-grep!
We appreciate your contribution to this project. Adding new languages will make the tool more useful and accessible to a wider range of users.

However, there are some requirements and constraints that you need to consider before you start. This guide will help you understand the process and the standards of adding a new language to ast-grep.

## Requirements and Constraints

To keep ast-grep lightweight and fast, we have several factors to consider when adding a new language.
As a rule of thumb, we want to limit the binary size of ast-grep under 10MB after zip compression.

* **Popularity of the language**. While the popularity of a language does not necessarily reflect its merits, our limited size budget allows us to only support languages that are widely used and have a large user base. Online sources like [TIOBE index](https://www.tiobe.com/tiobe-index/) or [GitHub Octoverse](https://octoverse.github.com/2022/top-programming-languages) can help one to check the popularity of the language.

- **Quality of the Tree-sitter grammar**.  ast-grep relies on [Tree-sitter](https://tree-sitter.github.io/tree-sitter/), a parser generator tool and a parsing library, to support different languages. The Tree-sitter grammar for the new language should be _well-written_, _up-to-date_, and _regularly maintained_. You can search [Tree-sitter on GitHub](https://github.com/search?q=tree-sitter&type=repositories) or on [crates.io](https://crates.io/search?q=tree%20sitter).

- **Size of the grammar**. The new language's grammar should not be too complicated. Otherwise it may take too much space from other languages. You can also check the current size of ast-grep in the [releases page](https://github.com/ast-grep/ast-grep/releases).

- **Availability of the grammar on crates.io**. To ease the maintenance burden, we prefer to use grammars that are published on crates.io, Rust's package registry. If your grammar is not on crates.io, you need to publish it yourself or ask the author to do so.

---

Don't worry if your language is not supported by ast-grep. You can try ast-grep's [custom language support](/advanced/custom-language.html) and register your own Tree-sitter parser!

If your language satisfies the requirements above, congratulations! Let's see how to add it to ast-grep.

## Add to ast-grep Core

The first step is to add the language to ast-grep core.

TODO...

## Add to ast-grep Playground

TODO...