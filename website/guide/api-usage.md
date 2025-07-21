# API Usage

## ast-grep as Library

ast-grep allows you to craft complicated rules, but it is not easy to do arbitrary AST manipulation.

For example, you may struggle to:

* replace a list of nodes individually, based on their content
* replace a node conditionally, based on its content and surrounding nodes
* count the number or order of nodes that match a certain pattern
* compute the replacement string based on the matched nodes

To solve these problems, you can use ast-grep's programmatic API! You can freely inspect and generate text patches based on syntax trees, using popular programming languages!

:::tip
Applying ast-grep's `fix` using JS/Python API is still experimental. See [this issue](https://github.com/ast-grep/ast-grep/issues/1172) for more information.
:::

## Language Bindings

ast-grep provides support for these programming languages:

- **JavaScript:** Powered by napi.rs, ast-grep's JavaScript API is the most robust and reliable. [Explore JavaScript API](/guide/api-usage/js-api.html)

- **Python:** ast-grep's PyO3 interface is the latest addition to climb the syntax tree! [Discover Python API](/guide/api-usage/py-api.html)

- **Rust:** ast-grep's Rust API is the most efficient way, but also the most challenging way, to use ast-grep. You can refer to [ast_grep_core](https://docs.rs/ast-grep-core/latest/ast_grep_core/) if you are familiar with Rust.


## Why and When to use API?

ast-grep's API is designed to solve the problems that are hard to express in ast-grep's rule language.

ast-grep's rule system is deliberately simple and not as powerful as a programming language.
Other similar rewriting/query tools have complex features like conditional, loop, filter or function call.
These features are hard to learn and use, and they cannot perform computation as well as a general purpose programming language.

So ast-grep chooses to have a simple rule system that is easy to learn and use. But it also has its limitations. The API is created to overcome these limitations.

If your code transformation requires complex logic, or if you need to change code that has no parser library in JavaScript or Python, ast-grep API is a good option to achieve your goal without writing a lot of complicated rules.