# Find & Patch: A Functional Programming like Code Rewrite Scheme

## Introduction

In this post I am going to introduce a novel way to transform code based on AST, Find & Patch.
It can help you rewrite sophisticated code using a declarative DSL.

Conceptually, it is like doing functional programming on the tree of syntax nodes.

## What's ast-grep?

ast-grep is a tool to search and rewrite code based on AST. It is like `grep` for code, but with the power of AST.

More specifically, ast-grep can find code pattern using its rule system. It can also rewrite the matched code, using meta-variable, based on the rule.

ast-grep's rewriting can be seen as two steps: finding target nodes and patching them with new text.

## Find and Patch: how ast-grep works now

The basic workflow of ast-grep is "Find and Patch":

1. Find: search the nodes in the AST that match the rewriter rules (so the name ast-grep)
2. Rewrite: generate a new string based on the matched meta-variables
3. Patch: replace the node text with the generated fix.

Let's see a simple example: replace console.log to logger.log

```yaml
rule:
  pattern: console.log($MSG)
fix: logger.log($MSG)
```

The rule above is quite straightforward. It matches the `console.log` call, by using pattern, and replaces it with `logger.log` call. The argument of `console.log` is captured by the meta-variable `$MSG` and used in the fix.

The idea of *Find & Patch* maps naturally to core fields in ast-grep's rule.

* Find a target node based on `rule`
* Filter the matched nodes based on `constraints`
* Rewrite matched meta-variable based on `transform`
* Replace the matched node with `fix`, which can use the transformed meta-variables.

## Limitation of the current workflow

However, this workflow can only replace one node at a time.

For example, if we want to rewrite barrel import to single imports, we need to write a rule for each imported identifier.

```js
import {a, b, c} from './barrel';
// ideally we want to rewrite it to
import a from './barrel/a';
import b from './barrel/b';
import c from './barrel/c';
```

With the simple "Find and Patch" workflow, we either can rewrite the whole import statement or rewrite each identifier one by one. We cannot replace the whole import because we cannot process the multiple identifiers, which requires a list of nodes at a time.
Alternatively we can rewrite the identifiers one by one, but we cannot replace the whole import statement so there will be unwanted import statement text surrounding the identifiers.

```javascript
// we cannot rewrite whole import statement, because we don't know how to rewrite a,b,c as a list
import ??? from './barrel';
// we cannot rewrite each identifier, because replaced text is inside the import statement
import { ??, ??, ?? } from './barrel';
```

## Extend the concept of `find` and `patch`

Let's reflect. Our old workflow does not allow us to apply a rule to multiple sub-nodes of a node. (This is like not being able to write for loops.)

Nor does it allow us to generate different text for different sub-nodes in a rule. (This is like not being able to write if/switch statements.)

To overcome these limitations, I initially thought of adding list comprehension to transform.

But [Mosenkis](https://github.com/emosenkis) proposed a refreshing idea that we can apply sub-rules, called rewriters, to specific nodes during matching. It can elegantly solve the issue of processing multiple nodes with multiple different rules!

we will add three new steps in step 2:

1. Find a list of different sub-nodes under a meta-variable that match different rewriters.
1. Generate a different fix for each sub-node based on the matched rewriter sub-rule.
1. Join the fixes together and store the string in a new metavariable for later use.

The new steps are similar to the existing "Find and Patch" workflow, but with more granularity and control.

## Intriguing Example

The idea above is implemented by a new `rewriters` field and a new `rewrite` transformation.

Let's see how it works with the barrel import example.

**Our first step is to write a rule to capture the import statement.**

```yaml
rule:
  pattern: import {$$$IDENTS} from './barrel'
```

This will capture the imported identifiers `a, b, c` in `$$$IDENTS`.

**Next, we need to transform `$$$IDENTS` to individual imports.**

The idea is that we can find the identifier nodes in the `$$$IDENT` and rewrite them to individual imports.

So we register a rewriter to do this, as if write a separate rule for each identifier.

```yaml
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  fix: import $IDENT from './barrel/$IDENT'
```

The `rewrite-identifier` above will rewrite the identifier node to individual imports. To illustrate, the rewriter will change identifier `a` to  `import a from './barrel/a'`.

**We can now apply the rewriter to the matched variable `$$$IDENTS`.**

The dual of `rewriter` is the `rewrite` transformation.
It applies the rewriter to the matched variable and generates a new string.

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

Note the `joinBy` field in the `transform` section. It is used to join the rewritten import statements with a newline character.

**Finally, we can use the `IMPORTS` in the `fix` field to replace the original import statement.**

The final rule will be like this.

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

This is like doing syntax tree oriented programming.
We can apply different rules to different sub-nodes, just like using pattern matching.
We can apply rules to multiple sub-nodes, just like using loops.
We can decompose a larger AST into smaller sub ASTs nodes by meta-variables, just like destructuring ( or elimination rules).
https://blog.jez.io/intro-elim/

"Find and Patch" is kind of a specialized "Functional Programming" over the AST!