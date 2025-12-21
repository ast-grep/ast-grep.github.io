---
description: "ast-grep is a tool to search and transform code. Discover its core features: easy syntax, flexible interface, and multi-language support."
head:
  - - meta
    - name: keywords
      content: abstract syntax tree, AST, structural search, eslint, grep, codemod, introduction, high performance, linting
---

# What is ast-grep?

## Introduction

ast-grep is a new AST based tool to manage your code, at massive scale.

Using ast-grep can be as simple as running a single command in your terminal:

```bash
ast-grep --pattern 'var code = $PAT' --rewrite 'let code = $PAT' --lang js
```

The command above will replace `var` statement with `let` for all <abbr title="ast-grep will also infer the language if you omit --lang">JavaScript</abbr> files.

---

ast-grep is a versatile tool for searching, linting and rewriting code in various languages.

* **Search**: As a _command line tool_ in your terminal, `ast-grep` can precisely search code _based on AST_, running through ten thousand files in sub seconds.
* **Lint**: You can use ast-grep as a linter. Thanks to the flexible rule system, adding a new customized rule is intuitive and straightforward, with _pretty error reporting_ out of box.
* **Rewrite**: ast-grep provide API to traverse and manipulate syntax tree. Besides, you can also use operators to compose complex matching from simple patterns.

> Think ast-grep as an hybrid of [grep](https://www.gnu.org/software/grep/manual/grep.html), [eslint](https://eslint.org/) and [codemod](https://github.com/facebookincubator/fastmod).

Wanna try it out? Check out the [quick start guide](/guide/quick-start)! Or see some [examples](/catalog/) to get a sense of what ast-grep can do. We also have a [playground](/playground.html) for you to try out ast-grep online!

## Supported Languages

ast-grep supports a wide range of programming languages. Here is a list of notable programming languages it supports.

|Language Domain|Supported Languages|
|:--------------|------------------:|
|System Programming| `C`, `Cpp`, `Rust`|
|Server Side Programming| `Go`, `Java`, `Python`, `C-sharp`|
|Web Development| `JS(X)`, `TS(X)`, `HTML`, `CSS`|
|Mobile App Development| `Kotlin`, `Swift`|
|Configuration | `Json`, `YAML`, `Hcl`|
|Scripting, Protocols, etc.| `Lua`, `Nix`|

Thanks to [tree-sitter](https://tree-sitter.github.io/tree-sitter/), a popular parser generator library, ast-grep manages to support [many languages](/reference/languages) out of the box!

## Motivation

Using text-based tool for searching code is fast but imprecise. We usually prefer to parse the code into [abstract syntax tree](https://www.wikiwand.com/en/Abstract_syntax_tree) for precise matches.

However, developing with AST is tedious and frustrating. Consider this "hello-world" level task: matching `console.log` in JavaScript using Babel. We will need to write code like below.

```javascript
path.parentPath.isMemberExpression() &&
path.parentPath.get('object').isIdentifier({ name: 'console' }) &&
path.parentPath.get('property').isIdentifier({ name: 'log' })
```

This snippet deserves a detailed explanation for beginners. Even for experienced developers, authoring this snippet also requires a lot of looking up references.

The pain is not language specific. The [quotation](https://portswigger.net/daily-swig/semgrep-static-code-analysis-tool-helps-eliminate-entire-classes-of-vulnerabilities) from Jobert Abma, co-founder of HackerOne, manifests the universal pain across many languages.

> The internal AST query interfaces those tools offer are often poorly documented and difficult to write, understand, and maintain.

----

ast-grep solves the problem by providing a simple core mechanism: using code to search code with the same pattern.
Consider it as same as `grep` but based on AST instead of text.

In comparison to Babel, we can complete this hello-world task in ast-grep trivially

```bash
ast-grep -p "console.log"
```

See [playground](/playground.html) in action!

Upon the simple pattern code, we can build a series of operators to compose complex matching rules for various scenarios.

Though we use JavaScript in our introduction, ast-grep is not language specific. It is a _polyglot_ tool backed by the renowned library [tree-sitter](https://tree-sitter.github.io/).
The idea of ast-grep can be applied to many other languages!

## Features

There are a lot of other tools that looks like ast-grep, notable predecessors including [Semgrep](https://semgrep.dev/), [comby](https://comby.dev/), [shisho](https://github.com/flatt-security/shisho), [gogocode](https://github.com/thx/gogocode), and new comers like [gritQL](https://about.grit.io/)

What makes ast-grep stands out is:

### Performance

It is written in Rust, a native language and utilize multiple cores. (It can even beat ag when searching simple pattern). ast-grep can handle tens of thousands files in seconds.

### Progressiveness
You can start from creating a one-liner to rewrite code at command line with minimal investment. Later if you see some code smell recurrently appear in your projects, you can write a linting rule in YAML with a few patterns combined. Finally if you are a library author or framework designer, ast-grep provide programmatic interface to rewrite or transpile code efficiently.

### Pragmatism
ast-grep comes with batteries included. Interactive code modification is available. Linter and language server work out of box when you install the command line tool. ast-grep is also shipped with test framework for rule authors.

## Check out Discord and StackOverflow

<!-- TODO: move this to FAQ-->

Still got questions? Join our [Discord](https://discord.gg/4YZjf6htSQ) and discuss with other users!

You can also ask questions under the [ast-grep](https://stackoverflow.com/questions/tagged/ast-grep) tag on [StackOverflow](https://stackoverflow.com/questions/ask).