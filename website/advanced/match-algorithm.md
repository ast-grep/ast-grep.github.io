# Deep Dive into ast-grep's Match Algorithm

In descending order of strict-ness

* CST: all nodes are matched
* Smart: all nodes except source trivial nodes are matched.
* Significant: only significant nodes are matched
* AST: only ast nodes are matched
* Lenient: ast-nodes excluding comments are matched

Currently ast-grep only supports Smart.
