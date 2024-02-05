# Find & Patch: A Functional Programming like Code Rewrite Scheme


## Introduction
In this post I am going to introduce a novel way to transform code based on AST, Find & Patch.

Conceptually, it is like doing functional programming on the tree of syntax nodes.

## What's ast-grep?

ast-grep is a tool to search and rewrite code based on AST. It is like `grep` for code, but with the power of AST.

More specifically, ast-grep can

ast-grep's rewriting can be seen as two steps: finding and patching.

* The finding step is to find the nodes in the AST that match the rewriter rules.
* The patching step is to rewrite the matched nodes to the `fix` string/object in the matched rule.

## Find and Patch: how ast-grep works now

The basic workflow of ast-grep is "Find and Patch":

1. Find a target node based on rule/pattern.
2. Generate a new string based on the matched node and replace the node text with the generated fix.

Example: replace console.log to logger.log

The idea maps naturally to core fields in ast-grep's rule.

* Find a target node based on `rule`
* Filter the matched nodes based on `constraints`
* Rewrite matched meta-variable based on `transform`
* Replace the matched node with `fix`, which can refer to the meta-variables and transformed text.

## Extend the concept of `find` and `patch`

However, this workflow does not allow us to generate different text for different sub-nodes in a rule. (This is like not being able to write if statements.)

Nor does it allow us to apply a rule to multiple sub-nodes of a node. (This is like not being able to write for loops.)

To overcome these limitations, we will add three new steps between step 1 and step 2:

1. Find a list of different sub-nodes that match different sub-rules.
1. Generate a different fix for each sub-node based on the matched sub-rule.
1. Join the fixes together and store the string in a new metavariable for later use.

The new steps are similar to the existing "Find and Patch" workflow, but with more granularity and control.

## Similarity to Functional Programming

This is like doing syntax tree oriented programming.
We can apply different rules to different sub-nodes, just like using pattern matching.
We can apply rules to multiple sub-nodes, just like using loops.
We can decompose a larger AST into smaller sub ASTs nodes by meta-variables, just like destructuring ( or elimination rules).
https://blog.jez.io/intro-elim/

"Find and Patch" is kind of a specialized "Functional Programming" over the AST!

## Intriguing Example

TODO