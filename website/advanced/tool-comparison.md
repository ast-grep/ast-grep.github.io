# Comparison With Other Frameworks

:::danger Disclaimer
This comparison is based on the author's personal experience and opinion, which may not be accurate or comprehensive.
The author respects and appreciates all the other tools and their developers, and does not intend to criticize or endorse any of them.
The author is grateful to these predecessor tools for inspiring ast-grep! The reader is encouraged to try out the tools themselves and form their own judgment.
:::

## ast-grep

**Pros**:
* It is very performant. It uses [ignore](https://docs.rs/ignore/latest/ignore/) to do multi-thread processing, which makes it utilize all your CPU cores.
* It is language aware. It uses tree-sitter, a real parser, to parse the code into ASTs, which enables more precise and accurate matching and fixing.
* It has a powerful and flexible rule system. It allows you to write patterns, AST types and regular expressions to match code. It provides operators to compose complex matching rules for various scenarios.
* It can be used as a lightweight CLI tool or as a library, depending on your usage. It has a simple and user-friendly interface, and it also exposes its core functionality as a library for other applications.

**Cons**:
* It is still young and under development. It may have some bugs or limitations that need to be fixed or improved.
* It does not have deep semantic information or comparison equivalence. It only operates on the syntactic level of the code, which may miss some matches or may be too cumbersome to match certain code.
* More specifically, ast-grep at the moment does not support the following information:
  * [type information](https://semgrep.dev/docs/writing-rules/pattern-syntax#typed-metavariables)
  * [control flow analysis](https://en.wikipedia.org/wiki/Control-flow_analysis)
  * [data flow analysis](https://en.wikipedia.org/wiki/Data-flow_analysis)
  * [taint analysis](https://semgrep.dev/docs/writing-rules/data-flow/taint-mode)
  * [constant propagation](https://semgrep.dev/docs/writing-rules/data-flow/constant-propagation)

## [Semgrep](https://semgrep.dev/)

Semgrep is a well-established tool that uses code patterns to find and fix bugs and security issues in code.

**Pros**:
* It supports advanced features like equivalence and deep-semgrep, which allow for more precise and expressive matching and fixing.
* It has a large collection of rules for various languages and frameworks, which cover common vulnerabilities and best practices.

**Cons**:
* It is mainly focused on security issues, which may limit its applicability for other use cases.
* It is relatively slow when used as command line tools.
* It cannot be used as a library in other applications, which may reduce its integration and customization options.

## [GritQL](https://about.grit.io/)

[GritQL](https://docs.grit.io/language/overview) language is [Grit](https://docs.grit.io/)'s embedded query language for searching and transforming source code.

**Pros**:

* GritQL is generally more powerful. It has features like [clause](https://docs.grit.io/language/modifiers) from [logic programming language](https://en.wikipedia.org/wiki/Logic_programming#:~:text=A%20logic%20program%20is%20a,Programming%20(ASP)%20and%20Datalog.) and [operations](https://docs.grit.io/language/conditions#match-condition) from imperative programming languages.
* It is used as [linter plugins](https://biomejs.dev/linter/plugins/) in [Biome](https://biomejs.dev/), a toolchain for JS ecosystem.

**Cons**:
* Depending on different background, developers may find it harder to learn a multi-paradigm DSL.

## [Comby](https://comby.dev/)

Comby is a fast and flexible tool that uses structural patterns to match and rewrite code across languages and file formats.

**Pros**:
* It does not rely on language-specific parsers, which makes it more generic and robust. It can handle any language and file format, including non-code files like JSON or Markdown.
* It has a custom syntax for specifying patterns and replacements, which can handle various syntactic variations and transformations.


**Cons**:
* It is not aware of the syntax and semantics of the target language, which limits its expressiveness and accuracy. It may miss some matches or generate invalid code due to syntactic or semantic differences.
* It does not support indentation-sensitive languages like Python or Haskell, which require special handling for whitespace and indentation.
* It is hard to write complex queries with Comby, such as finding a function that does not call another function. It does not support logical operators or filters for patterns.

## [IntelliJ Structural Search Replace](https://www.jetbrains.com/help/idea/structural-search-and-replace.html)

IntelliJ Structural Search Replace is not a standalone tool, but a feature of the IntelliJ IDE that allows users to search and replace code using structural patterns.

**Pros**:
* It is integrated with the IntelliJ IDE, which makes it easy to use and customize.

**Cons**:
* Currently, IntelliJ IDEA supports the structural search and replace for Java, Kotlin and Groovy.

## [Shisho](https://github.com/flatt-security/shisho)
Shisho is a new and promising tool that uses code patterns to search and manipulate code in various languages.

**Pros**:
* It offers fast and flexible rule composition using code patterns.
* It can handle multiple languages and files in parallel, and it has a simple and intuitive syntax for specifying patterns and filters.

**Cons**:
* It is still in development and it has limited language support compared to the other tools.
It currently supports only 3 languages, while the other tools support over 20 languages.
* The tool's parent company seems to have changed their business direction.
