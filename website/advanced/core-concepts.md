# Deep Dive into ast-grep's Pattern

One key highlight of ast-grep is its pattern.

_Pattern is a convenient way to write and read expressions that describe syntax trees_. It resembles code, but with some special syntax and semantics that allow you to match parts of a syntax tree based on their structure, type or content.

While ast-grep's pattern is **easy to learn**, it is **hard to master**. It requires you to know the tree-sitter grammar and meaning of the target language, as well as the rules and conventions of ast-grep.

In this guide, we will help you grasp the core concepts of ast-grep's pattern that are common to all languages. We will also show you how to leverage the full power of ast-grep pattern for your own usage.

## What is Tree-sitter?

ast-grep is using [Tree-sitter](https://tree-sitter.github.io/) as its underlying parsing framework due to its **popularity**, **performance** and **robustness**.

Tree-sitter is a tool that generates parsers and provides an incremental parsing library.

A [parser](https://www.wikiwand.com/en/Parser_(programming_language)) is a program that takes a source code file as input and produces a tree structure that describes the organization of the code. (Contrary to ast-grep's name, the tree structure is not abstract syntax tree, as we will see later).


Writing good parsers for various programming languages is a laborious task, if even possible, for one single project like ast-grep. Fortunately, Tree-sitter is a venerable and popular tool that has a wide community support. Many mainstream languages such as C, Java, JavaScript, Python, Rust, and more are supported by Tree-sitter.
Using Tree-sitter as ast-grep's underlying parsing library allows it to _work with any language that has a well-maintained grammar available_.

Another perk of Tree-sitter is its incremental nature. An incremental parser is a parser that can update the syntax tree efficiently when the source code file is edited, without having to re-parse the entire file. _It can run very fast on every code changes in ast-greps' [interactive editing](https://ast-grep.github.io/guide/tooling-overview.html#interactive-mode)._

Finally, Tree-sitter also handles syntax errors gracefully, and it can parse multiple languages within the same file. _This makes pattern code more robust to parse and easier to write._ In future we can also support multi-language source code like Vue.

## Textual vs Structural

When you use ast-grep to search for patterns in source code, you need to understand the difference between textual and structural matching.

Source code input is text, a sequence of characters that follows certain syntax rules. You can use common search tools like [silver-searcher](https://github.com/ggreer/the_silver_searcher) or [ripgrep](https://github.com/BurntSushi/ripgrep) to search for text patterns in source code.

However, ast-grep does not match patterns against the text directly. Instead, it parses the text into a tree structure that represents the syntax of the code. This allows ast-grep to match patterns based on the semantic meaning of the code, not just its surface appearance. This is known as [structural](https://docs.sourcegraph.com/code_search/reference/structural) [search](https://docs.sourcegraph.com/code_search/reference/structural), which searches for code with a specific structure, not just a specific text.

_Therefore, the patterns you write must also be of valid syntax that can be compared with the code tree._

:::tip Textual Search in ast-grep
Though `pattern` structurally matches code, you can use [the atomic rule `regex`](/guide/rule-config/atomic-rule.html#regex) to matches the text of a node by specifying a regular expression. This way, it is possible to combine textual and structural matching in ast-grep.
:::


## AST vs CST
To represent the syntax and semantics of code, we have two types of tree structures: [AST](https://www.wikiwand.com/en/Abstract_syntax_tree) and [CST](https://eli.thegreenplace.net/2009/02/16/abstract-vs-concrete-syntax-trees/).

AST stands for Abstract Syntax Tree, which is a **simplified** representation of the code that _omits some details_ like punctuation and whitespaces.
CST stands for Concrete Syntax Tree, which is a more **faithful** representation of the code that _includes all the details_.

Tree sitter is a library that can parse code into CSTs for many programming languages. Thusly, _ast-grep, contrary to its name, searches and rewrites code based on CST patterns, instead of AST_.

Let's walk through an example to see why CST makes more sense.
Consider the JavaScript snippet `1 + 1`. Its AST representation [looks like this](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiY29uc29sZS5sb2coJE1BVENIKSIsImNvbmZpZyI6IiMgQ29uZmlndXJlIFJ1bGUgaW4gWUFNTFxucnVsZTpcbiAgYW55OlxuICAgIC0gcGF0dGVybjogaWYgKGZhbHNlKSB7ICQkJCB9XG4gICAgLSBwYXR0ZXJuOiBpZiAodHJ1ZSkgeyAkJCQgfVxuY29uc3RyYWludHM6XG4gICMgTUVUQV9WQVI6IHBhdHRlcm4iLCJzb3VyY2UiOiIxICsgMSJ9):
```
binary_expression
  number
  number
```
An astute reader should notice the imporatnt operator `+` is not encoded in AST. Meanwhile, its CST faithfully represents all critical.
```
binary_expression
  number
  +                # note this + operator!
  number
```

You might wonder if using CST will make trivial whitespaces affect your search results.
Fortunately, ast-grep uses a [smart matching algorithm](/advanced/match-algorithm.html) that can skip trivial nodes in CST when appropriate, which saves you a lot of trouble.

## Named vs Unnamed

It is possible to convert CST to AST if we don't care about punctuation and whitespaces.
Tree-sitter has two types of nodes: named nodes and unnamed nodes(anonymous nodes).

The more important _named nodes_ are defined with a regular name in the grammar rules, such as `binary_expression` or `identifier`. The less important _unnamed nodes_ are defined with literal strings such as `","` or `"+"`.

Named nodes are more important for understanding the code's structure and meaning, while unnamed nodes are less important and can be sometimes skipped by ast-grep's matching algorithms.

The following example, adapted from [tree-sitter's official guide](https://tree-sitter.github.io/tree-sitter/creating-parsers#the-first-few-rules), shows the difference in grammar definition.

```javascript
rules: {
  // named nodes are defined with the format `kind: parseRule`
  identifier: $ => /[a-z]+/,
  // binary_expression is also a named node,
  // the `+` operator is defined with a string literal, so it is an unnamed node
  binary_expression: $ => seq($.identifier, '+', $.identifier),
                                          // ↑ unnamed node
}
```
Practically, named nodes have a property called `kind` that indicates their names. You can use ast-grep's [atomic rule `kind`](/guide/rule-config/atomic-rule.html#kind) to find the specific AST node. [Playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOiBcbiAga2luZDogYmluYXJ5X2V4cHJlc3Npb24iLCJzb3VyY2UiOiIxICsgMSAifQ==) for the example below.

```yaml
rule:
  kind: binary_expression
# matches `1 + 1`
```

Further more, ast-grep's meta variable matches only named nodes by default. `return $A` matches only the first statement below. [Playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoicmV0dXJuICRBIiwiY29uZmlnIjoiIyBDb25maWd1cmUgUnVsZSBpbiBZQU1MXG5ydWxlOlxuICBhbnk6XG4gICAgLSBwYXR0ZXJuOiBpZiAoZmFsc2UpIHsgJCQkIH1cbiAgICAtIHBhdHRlcm46IGlmICh0cnVlKSB7ICQkJCB9XG5jb25zdHJhaW50czpcbiAgIyBNRVRBX1ZBUjogcGF0dGVybiIsInNvdXJjZSI6InJldHVybiAxMjNcbnJldHVybjsifQ==).

```js
return 123 // `123` is named `number` and matched.
return;    // `;` is unnamed and not matched.
```

We can use double dollar `$$VAR` to _include unnamed nodes_ in the pattern result. `return $$A` will match both statement above. [Playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoicmV0dXJuICQkQSIsImNvbmZpZyI6IiMgQ29uZmlndXJlIFJ1bGUgaW4gWUFNTFxucnVsZTpcbiAgYW55OlxuICAgIC0gcGF0dGVybjogaWYgKGZhbHNlKSB7ICQkJCB9XG4gICAgLSBwYXR0ZXJuOiBpZiAodHJ1ZSkgeyAkJCQgfVxuY29uc3RyYWludHM6XG4gICMgTUVUQV9WQVI6IHBhdHRlcm4iLCJzb3VyY2UiOiJyZXR1cm4gMTIzXG5yZXR1cm47In0=).

## Kind vs Field

Sometimes, using kind alone is not enough to find the nodes we want. A node may have several children with the same kind, but different roles in the code. For [example](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOlxuICBraW5kOiBzdHJpbmciLCJzb3VyY2UiOiJ2YXIgYSA9IHtcbiAgJ2tleSc6ICd2YWx1ZSdcbn0ifQ==), in JavaScript, an object may have multiple keys and values, all with the string kind.

To distinguish them, we can use `field` to specify the relation between a node and its parent. In ast-grep, `field` is specified in two [relational rules](/guide/rule-config/relational-rule.html#relational-rule-mnemonics): `has` and `inside`.

`has` and `inside` accept a special configuration item called `field`. The value `field` is the _field name_ of the parent-child relation. For example, the key-value `pair` in JavaScript object has two children: one with field `key` and the other with field `value`. We can use [this rule](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOlxuICBraW5kOiBzdHJpbmdcbiAgaW5zaWRlOlxuICAgIGZpZWxkOiBrZXlcbiAgICBraW5kOiBwYWlyIiwic291cmNlIjoidmFyIGEgPSB7XG4gICdrZXknOiAndmFsdWUnXG59In0=) to match the `key` node of kind `string`.

```yaml
rule:
  kind: string
  inside:
    field: key
    kind: pair
```
`field` can help us to narrow down the search scope and make the pattern more precise.

We can also use `has` to rewrite the rule above, searching the key-value `pair` with `string` key. [Playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOlxuICBraW5kOiBwYWlyXG4gIGhhczpcbiAgICBmaWVsZDoga2V5XG4gICAga2luZDogc3RyaW5nIiwic291cmNlIjoidmFyIG1hdGNoID0geyAna2V5JzogJ3ZhbHVlJyB9XG52YXIgbm9NYXRjaCA9IHsga2V5OiB2YWx1ZX0ifQ==).

```yaml
rule:
  kind: pair
  has:
    field: key
    kind: string
```

:::tip Key Difference between `kind` and `field`
* `kind` is the property of the node itself. Only named nodes have `kind`s.
* `field` is the property of the relation between parent and child. Unnamed nodes can also have `field`s.
:::

It might be confusing to new users that a node has both `kind` and `field`. `kind` belongs to the node itself, represented by blue text in ast-grep's playground. Child node has a `field` only relative to its parent, and vice-versa. `field` is represented by dark yellow text in the playground. Since field is a property of a node relation, unnamed nodes can also have `field`. For example, the `+` in the binary expression `1 + 1` has the field `operator`.

## Significant vs Trivial
TODO
