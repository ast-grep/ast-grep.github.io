---
layout: home
title: ast-grep | structural search/rewrite tool for many languages
titleTemplate: 'ast-grep'
description: ast-grep is a fast and polyglot tool for code structural search, lint, rewriting at large scale.
head:
  - - meta
    - name: keywords
      content: structural search, abstract syntax tree, linting, refactor, command line tool, tree-sitter, multiple programming languages, Rust

hero:
  name: AST-GREP
  text: Find Code by Syntax
  tagline: ast-grep(sg) is a fast and polyglot tool for code structural search, lint, rewriting at large scale.
  image:
    src: ./logo.svg
    alt: ast-grep
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/ast-grep/ast-grep

features:
  - icon: ⚡️
    title: Performant
    details: Blazing fast search and replace across thousands of source code files, powered by parallel Rust.
  - icon: 📚
    title: Polyglot
    details: Supports many programming languages out of box! You can also register your own tree-sitter parsers by dynamic loading.
  - icon: 👟
    title: Progressive
    details: Supports multiple forms of usages from one-line command to fully programmatic interface, scaling to different scenarios.
  - icon: 🛠️
    title: Pragmatic
    details: Not a toy but a batteries-included tool with interactive codemod, language server and testing tool.

---