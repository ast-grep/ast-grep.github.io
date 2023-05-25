# Deep Dive in Pattern

## What is TreeSitter

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
