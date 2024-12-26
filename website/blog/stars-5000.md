---
author:
  - name: Herrington Darkholme
search: false
date: 2024-01-20
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: 'ast-grep: 5000 stars and beyond!'
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/stars-5000.html
  - - meta
    - property: og:description
      content: ast-grep has recently reached 5000 stars on GitHub! This is a remarkable achievement for the project and I am deeply grateful for all the support and feedback that I have received from the open source community.
---

# ast-grep: 5000 stars and beyond!

We are thrilled to announce that ast-grep has reached 5000 stars on [GitHub](https://github.com/ast-grep/ast-grep)! This is a huge milestone for our project and we are very grateful for your feedback, contributions, and encouragement.


![ast-grep star history](/image/blog/stars-5k.png)

## Why ast-grep?

[ast-grep](https://ast-grep.github.io/) is a tool that allows you to search and transform code using abstract syntax trees (ASTs). ASTs are tree-like representations of the structure and meaning of source code. By using ASTs, ast-grep can perform more accurate and powerful operations than regular expressions or plain text search.

We have introduced a lot of new features in the past few months, and we want to share them with you. We hope that you will find them useful and that they will help you write better code.

## What's new in ast-grep?

### Core
* We have redesigned and implemented a [new pattern engine](https://x.com/hd_nvim/status/1735850666235687241) inspired by [difftastic](https://github.com/Wilfred/difftastic). Now, patterns use Rust structures to represent the syntax of code, instead of tree-sitter objects. This improves performance by minimizing tree traversal and allows for more reliable and user-friendly pattern-matching.

### CLI
* You can now use [`--inline-rules`](https://ast-grep.github.io/reference/cli/scan.html#inline-rules-rule-text) to run rules without creating any files on your disk! You can pass everything, pattern/rule/input, as a string. This is great for scripting!
* [`--stdin`](https://ast-grep.github.io/reference/cli/run.html#stdin) will always wait for your input so you can match some code written in your terminal.
* You can also select [custom languages](https://ast-grep.github.io/advanced/custom-language.html) in [`sg new`](https://ast-grep.github.io/reference/cli/new.html).

### Language Support
* We have added support for three new languages: bash, php and elixir.
* We have updated our language support to include golang's generic syntax and python's pattern matching syntax.
* You can try out kotlin on our [playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoia290bGluIiwicXVlcnkiOiJrb3RsaW4iLCJyZXdyaXRlIjoiJEEgPz89ICRCOyIsImNvbmZpZyI6IiIsInNvdXJjZSI6ImZ1biBtaW5hbWkoKSB7XG4gICAgdmFsIGtvdGxpbiA9IFwi5Y2X44GT44Go44KK44KTXCJcbn0ifQ==)!

### Rule
* You can now use `expandStart` and `expandEnd` to [adjust the fix range](https://ast-grep.github.io/reference/yaml/fix.html#fixconfig) selection for more precise code transformations.
* You can also use [`languageGlob`](https://ast-grep.github.io/reference/sgconfig.html#languageglobs) to register alias languages for extension override, which gives you more flexibility in handling different file types.

### Node/Python API
* We have added to napi a new function [parseAsync](https://github.com/ast-grep/ast-grep/blob/beb6f50e936809071e6bacae2c854aefa8e46d11/crates/napi/index.d.ts#L104-L111), which allows you to leverage multiple cores in Node.js for faster code parsing.
* We have also added [language globs](https://github.com/ast-grep/ast-grep/blob/beb6f50e936809071e6bacae2c854aefa8e46d11/crates/napi/index.d.ts#L45) to findInFiles in napi, which makes it easier to search for code patterns in non-standard files (like searching HTML in `.vue` file).
* You can now use [`getTransformed`](https://github.com/ast-grep/ast-grep/blob/beb6f50e936809071e6bacae2c854aefa8e46d11/crates/napi/index.d.ts#L75) in napi to get the transformed code as a string.

### Doc
* We have improved our [napi](https://ast-grep.github.io/guide/api-usage/js-api.html)/[pyo3](https://ast-grep.github.io/guide/api-usage/py-api.html) documentation and added sandbox/colab links for you to try out ast-grep online!
* We have also updated our [transformation](https://ast-grep.github.io/reference/yaml/transformation.html) and [code fix](https://ast-grep.github.io/reference/yaml/fix.html) documentation with more examples and explanations.
* We have added new language examples for [go](https://ast-grep.github.io/catalog/go/) and [python](https://ast-grep.github.io/catalog/python/), which show you how to use ast-grep with these popular languages.
* We have created an ast-grep [bot](https://ast-grep.github.io/guide/introduction.html#check-out-discord-bot) on [discord](https://discord.com/invite/4YZjf6htSQ), which can answer your questions and provide tips and tricks on using ast-grep.

### Community
* We are excited to see that some awesome projects are using ast-grep for their code transformations, such as:
  - [vue-macro cli](https://github.com/vue-macros/vue-macros-cli) helps you migrate your Vue projects to the latest version of Vue
  - a new [unocss engine](https://github.com/zhiyuanzmj/transformer-attributify-jsx-sg) transforms JSX attributes into CSS classes
* We are also happy to see that some innovative platforms are using ast-grep as one of their tools to help developers understand and improve their codebases, such as:
  - [coderabbit](https://coderabbit.ai/) uses ast-grep to help AI analyzing your code and provide insights and recommendations
  - [codemod](https://codemod.com/) is considering ast-grep as a new underlying tool in their code transformation studio


## What's next in ast-grep?

### Applying sub-rules to sub-nodes

Currently, ast-grep can only apply rules/transformations to the whole node that matches the pattern. This limits the flexibility and expressiveness of ast-grep, compared to other tools like [babel](https://babeljs.io/) or [libcst](https://libcst.readthedocs.io/en/latest/).

_We want to make ast-grep more powerful by allowing it to apply sub-rules to the metavariable nodes within the matching node._ This will enable ast-grep to handle more complex and diverse use cases in code transformation.

For example, we can merge multiple decorators into one mega decorator in Python. This is impossible without API in the current version of ast-grep.


![screenshot of transforming python code](/image/blog/subrule-demo.png)



The basic workflow of ast-grep is _**"Find and Patch"**_:

1. **Find** a target node based on rule/pattern.
2. **Generate** a new string based on the matched node.
3. **Replace** the node text with the generated fix.

However, this workflow does not allow us to generate different text for different sub-nodes in a rule. (This is like not being able to write `if` statements.)
Nor does it allow us to apply a rule to multiple sub-nodes of a node. (This is like not being able to write `for` loops.)

To overcome these limitations, we will add three new steps between step 1 and step 2:


a. **Find** a list of different sub-nodes that match different sub-rules.
b. **Generate** a different fix for each sub-node based on the matched sub-rule.
c. **Join** the fixes together and store the string in a new metavariable for later use.

The new steps are similar to the existing **_"Find and Patch"_** workflow, but with more granularity and control.

This is like doing syntax tree oriented programming. We can apply different rules to different sub-nodes, just like using conditional statements. We can also apply rules to multiple sub-nodes, just like using loops. _"Find and Patch" is kind of a specialized "Functional Programming" over the AST!_

That said, applying sub-rules is an advanced feature that requires a lot of learning and practice. When in doubt, you can always use the existing [N-API](https://ast-grep.github.io/guide/api-usage/js-api.html)/[PyO3](https://ast-grep.github.io/guide/api-usage/py-api.html) workflow!

## Thank you!

We want to thank all the ast-grep users and supporters for your feedback, contributions, and encouragement.

And we want to especially thank ast-grep's sponsors!

![ast-grep sponsors](/image/blog/sponsor1.png)



We hope that you enjoy the new features and improvements in ast-grep. We are always working to make ast-grep better and we look forward to hearing from you.

Happy coding!