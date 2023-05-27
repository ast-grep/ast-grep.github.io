# Deep Dive into ast-grep's Pattern

One key highlight of ast-grep is its pattern.

_Pattern is a convenient way to write and read expressions that describe syntax trees_. It resembles code, but with some special syntax and semantics that allow you to match parts of a syntax tree based on their structure, type or content.

While ast-grep's pattern is **easy to learn**, it is **hard to master**. It requires you to know the tree-sitter grammar and meaning of the target language, as well as the rules and conventions of ast-grep.

In this guide, we will help you grasp the core concepts of ast-grep's pattern that are common to all languages. We will also show you how to leverage the full power of ast-grep pattern for your own usage.

## What is Tree-sitter

ast-grep is using [Tree-sitter](tree-sitter.github.io/) as its underlying parsing framework due to its **popularity**, **performance** and **robustness**.

Tree-sitter is a tool that generates parsers and provides an incremental parsing library.

A [parser](https://www.wikiwand.com/en/Parser_(programming_language)) is a program that takes a source code file as input and produces a tree structure that describes the organization of the code. (Contrary to ast-grep's name, the tree structure is not abstract syntax tree, as we will see later).


Writing good parsers for various programming languages is a laborious task, if even possible, for one single project like ast-grep. Fortunately, Tree-sitter is a venerable and popular tool that has a wide community support. Many mainstream languages such as C, Java, JavaScript, Python, Rust, and more are supported by Tree-sitter.
Using Tree-sitter as ast-grep's underlying parsing library allows it to _work with any language that has a well-maintained grammar available_.

Another perk of Tree-sitter is its incremental nature. An incremental parser is a parser that can update the syntax tree efficiently when the source code file is edited, without having to re-parse the entire file. _It can run very fast on every code changes in ast-greps' [interactive editing](https://ast-grep.github.io/guide/tooling-overview.html#interactive-mode)._

Finally, Tree-sitter also handles syntax errors gracefully, and it can parse multiple languages within the same file. _This makes pattern code more robust to parse and easier to write._ In future we can also support multi-language source code like Vue.


## Core Concepts
A list of ast-grep's concepts

### Textual vs Structural
TODO
### AST vs CST
TODO
### Named nodes vs Unnamed nodes
TODO
### Kind vs Field
TODO
### Significant vs Trivial
TODO

## Match Algorithm

In descending order of strict-ness

* CST: all nodes are matched
* Smart: all nodes except source trivial nodes are matched.
* Significant: only significant nodes are matched
* AST: only ast nodes are matched
* Lenient: ast-nodes excluding comments are matched

Currently ast-grep only supports cst.
