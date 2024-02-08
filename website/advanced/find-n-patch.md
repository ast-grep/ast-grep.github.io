# Find & Patch: A Novel Functional Programming like Code Rewrite Scheme

## Introduction

Code transformation is a powerful technique that allows you to modify your code programmatically. There are many tools that can help you with code transformation, such as [Babel](https://babeljs.io/)/[biome](https://github.com/biomejs/biome/discussions/1762) for JavaScript/TypeScript, [libcst](https://libcst.readthedocs.io/en/latest/) for Python, or [Rector](https://getrector.com/) for PHP. Most of these tools use imperative APIs to manipulate the [abstract syntax tree](https://www.wikiwand.com/en/Abstract_syntax_tree) (AST) of your code.

In this post, we will introduce a different approach to code transformation called **Find & Patch**.

This scheme lets you rewrite complex code using a fully declarative [Domain-Specific Language](https://www.wikiwand.com/en/Domain-specific_language) (DSL). While the scheme is powerful, the underlying concept is simple: find certain nodes, rewrite them, and recursively repeat the rewriting.

The idea of Find & Patch comes from developing [ast-grep](https://ast-grep.github.io/), a tool using AST to find and replace code patterns. We realized that this approach can be generalized and extended to support more complex and diverse code transformations!

At the end of this article, we will compare Find & Patch to functional programming on the tree of syntax nodes. You can apply filter nodes using `rule`, map them via `transform`, and compose them with `rewriters`.

This gives you a lot of flexibility and expressiveness to manipulate your code!

## What is ast-grep?

[ast-grep](https://github.com/ast-grep/ast-grep) is a tool to search and rewrite code based on ASTs. It is like `grep` for code, but with the power of ASTs.
More concretely, ast-grep can find code patterns using its [rule system](https://ast-grep.github.io/guide/rule-config/atomic-rule.html). It can also rewrite the matched code using [meta-variables](https://ast-grep.github.io/guide/pattern-syntax.html#meta-variable) based on the rule.

ast-grep's rewriting can be seen as two steps: finding target nodes and patching them with new text.

## Find and Patch: How ast-grep Rewrites Code

The basic rewriting workflow of ast-grep is like below:

1. _Find_: search the nodes in the AST that match the rewriter rules (hence the name ast-grep).
2. _Rewrite_: generate a new string based on the matched meta-variables.
3. _Patch_: replace the node text with the generated fix.

Let's see a simple example: replace `console.log` with `logger.log`. The following rule will do the trick.

```yaml
rule:
  pattern: console.log($MSG)
fix: logger.log($MSG)
```

The rule above is quite straightforward. It matches the `console.log` call, using the pattern, and replaces it with the `logger.log` call.
The meta-variable `$MSG` captures the argument of `console.log` and is used in the `fix` field.

ast-grep also has several other fields to fine-tune the process. The core fields in ast-grep's rule map naturally to the idea of **Find & Patch**.

* **Find**
  * Find a target node based on the [`rule`](https://ast-grep.github.io/reference/rule.html)
  * Filter the matched nodes based on [`constraints`](https://ast-grep.github.io/reference/yaml.html#constraints)
* **Patch**
  * Rewrite the matched meta-variable based on [`transform`](https://ast-grep.github.io/reference/yaml/transformation.html)
  * Replace the matched node with [`fix`](https://ast-grep.github.io/reference/yaml/fix.html), which can use the transformed meta-variables.

## Limitation of the Current Workflow

However, this workflow has a limitation: it can only replace one node at a time, which means that we cannot handle complex transformations that involve multiple nodes or lists of nodes.

For example, suppose we want to rewrite barrel imports to single imports. A [barrel import](https://adrianfaciu.dev/posts/barrel-files/) is a way to consolidate the exports of multiple modules into a single convenient module that can be imported using a single import statement. For instance:

```js
import {a, b, c} from './barrel';
```

This imports three modules (`a`, `b`, and `c`) from a single barrel file (`barrel.js`) that re-exports them.

Rewriting this to single imports has [some](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js) [benefits](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/), such as reducing [bundle size](https://dev.to/tassiofront/barrel-files-and-why-you-should-stop-using-them-now-bc4) or avoiding [conflicting names](https://flaming.codes/posts/barrel-files-in-javascript/).

```js
import a from './barrel/a';
import b from './barrel/b';
import c from './barrel/c';
```

This imports each module directly from its own file, without going through the barrel file.

With the simple "Find and Patch" workflow, we cannot achieve this transformation easily. We either have to rewrite the whole import statement or rewrite each identifier one by one. We cannot replace the whole import statement because we cannot process the multiple identifiers, which requires processing a list of nodes at one time.
 Can we rewrite the identifiers one by one? This also fails because we cannot replace the whole import statement, so there will be unwanted import statement text surrounding the identifiers.

```javascript
// we cannot rewrite the whole import statements
// because we don't know how to rewrite a, b, c as a list
import ??? from './barrel';
// we cannot rewrite each identifier
// because the replaced text is inside the import statement
import { ??, ??, ?? } from './barrel';
```

We need a better way to rewrite code that involves multiple nodes or lists of nodes. And here comes **Find & Patch**.


## Extend the Concept of `Find` and `Patch`

Let's reflect: what limits us from rewriting the code above?

Our old workflow does not allow us to apply a rule to multiple sub-nodes of a node. (This is like not being able to write for loops.)

Nor does it allow us to generate different text for different sub-nodes in a rule. (This is like not being able to write if/switch statements.)

I initially thought of adding [list comprehension](https://github.com/ast-grep/ast-grep/issues/723#issuecomment-1890362116) to transform to overcome these limitations. However, list comprehension will introduce more concepts like loops, filters and probably nested loops. I prefer having [Occam's razor](https://www.wikiwand.com/en/Occam%27s_razor) to shave off unnecessary constructs.

Luckily, [Mosenkis](https://github.com/emosenkis) proposed the [refreshing idea](https://github.com/ast-grep/ast-grep/issues/723#issuecomment-1883526774) that we can apply sub-rules, called `rewriters`, to specific nodes during matching. It can elegantly solve the issue of processing multiple nodes with multiple different rules!

The idea is simple: we will add three new, but similar, steps in the rewriting step.

1. _Find_ a list of different sub-nodes under a meta-variable that match different rewriters.
2. _Generate_ a different fix for each sub-node based on the matched rewriter sub-rule.
3. _Join_ the fixes together and store the string in a new metavariable for later use.

The new steps are similar to the existing **"Find and Patch"** workflow. It is like recursively applying the old workflow to matched nodes!

We can, taking the previous barrel import as an example, first match the import statement and then apply the rewriter sub-rule to each identifier.

## Intriguing Example

The idea above is implemented by a new [`rewriters`](https://ast-grep.github.io/reference/yaml/rewriter.html) field and a new [`rewrite`](https://ast-grep.github.io/reference/yaml/transformation.html#rewrite) transformation.

**Our first step is to write a rule to capture the import statement.**

```yaml
rule:
  pattern: import {$$$IDENTS} from './barrel'
```

This will capture the imported identifiers `a, b, c` in `$$$IDENTS`.

**Next, we need to transform `$$$IDENTS` to individual imports.**

The idea is that we can find the identifier nodes in the `$$$IDENT` and rewrite them to individual imports.

To do this, we register a rewriter that acts as a separate rewriter rule for each identifier.

```yaml
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  fix: import $IDENT from './barrel/$IDENT'
```

The `rewrite-identifier` above will:

1. First, find each `identifier` AST node and capture it as `$IDENT`.
2. Rewrite the identifier to a new import statement.

For example, the rewriter will change identifier `a` to  `import a from './barrel/a'`.

**We can now apply the rewriter to the matched variable `$$$IDENTS`.**

The counterpart of `rewriter` is the `rewrite` transformation, which applies the rewriter to a matched variable and generates a new string.

The yaml fragment below uses `rewrite` to find identifiers in `$$$IDENTS`, as specified in `rewrite-identifier`'s rule,
and rewrites it to single import statement.

```yaml
transform:
  IMPORTS:
    rewrite:
      rewriters: [rewrite-identifer]
      source: $$$IDENTS
      joinBy: "\n"
```

Note the `joinBy` field in the transform section. It specifies how to join the rewritten import statements with a newline character. This means that each identifier will generate a separate import statement, followed by a newline.

**Finally, we can use the transformed `IMPORTS` in the `fix` field to replace the original import statement.**

The final rule will be like this. See the [online playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBpbXBvcnQgeyQkJElERU5UU30gZnJvbSAnLi9iYXJyZWwnXG5yZXdyaXRlcnM6XG4tIGlkOiByZXdyaXRlLWlkZW50aWZlclxuICBydWxlOlxuICAgIHBhdHRlcm46ICRJREVOVFxuICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgZml4OiBpbXBvcnQgJElERU5UIGZyb20gJy4vYmFycmVsLyRJREVOVCdcbnRyYW5zZm9ybTpcbiAgSU1QT1JUUzpcbiAgICByZXdyaXRlOlxuICAgICAgcmV3cml0ZXJzOiBbcmV3cml0ZS1pZGVudGlmZXJdXG4gICAgICBzb3VyY2U6ICQkJElERU5UU1xuICAgICAgam9pbkJ5OiBcIlxcblwiXG5maXg6ICRJTVBPUlRTIiwic291cmNlIjoiaW1wb3J0IHsgYSwgYiwgYyB9IGZyb20gJy4vYmFycmVsJzsifQ==).

```yaml
rule:
  pattern: import {$$$IDENTS} from './barrel'
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  fix: import $IDENT from './barrel/$IDENT'
transform:
  IMPORTS:
    rewrite:
      rewriters: [rewrite-identifer]
      source: $$$IDENTS
      joinBy: "\n"
fix: $IMPORTS
```

## Similarity to Functional Programming

Find & Patch is a scheme that allows us to manipulate the syntax tree of the code in a declarative way.

It reminds me of Rust declarative macro since both Find & Patch and Rust declarative macro can:

- Match a list of nodes/tokens based on patterns: ast-grep's rule vs. Rust macro pattern matcher.
- Break nodes/tokens into sub parts: ast-grep's metavariable vs. Rust macro variable.
- Recursively use subparts to call other rewrite/macros.

The idea can be further compared to functional programming! We can use different rules to match and transform different sub-nodes of the tree, just like using [pattern matching](https://www.wikiwand.com/en/Pattern_matching) in functional languages. We can also apply rules to multiple sub-nodes at once, just like using for-comprehension or map/filter/reduce. Moreover, we can break down a large syntax tree into smaller sub-trees by using meta-variables, just like using destructuring or [elimination rules](https://blog.jez.io/intro-elim/) in functional languages. But all of these can be boiled down to two simple idea: **Finding** nodes and **Patching** nodes!

Find & Patch is a simple and elegant scheme that is tailored for AST manipulation, but it can achieve similar transformations as a general-purpose functional programming language doing rewrites!

We can think of Find & Patch as a form of "Functional Programming" over the AST! <small>And they both have the same acronym btw.</small>

---

Hope you find this scheme useful and interesting, and I sincerely invite you to try it out with ast-grep. Thank you for reading~