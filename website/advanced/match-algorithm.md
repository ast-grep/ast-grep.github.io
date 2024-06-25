# Deep Dive into ast-grep's Match Algorithm


By default, ast-grep uses a smart strategy to match pattern against the AST node. All nodes in the pattern must be matched, but it will skip unnamed nodes in target code.

For the definition of __*named*__ and __*unnamed*__ nodes, please refer to the [core concepts](/advanced/core-concepts.html) doc.

* `cst`: All nodes in the pattern and target code must be matched. No node is skipped.
* `smart`: All nodes in the pattern must be matched, but it will skip unnamed nodes in target code. This is the default behavior.
* `ast`: Only named AST nodes in both pattern and target code are matched. All unnamed nodes are skipped.
* `relaxed`: Named AST nodes in both pattern and target code are matched. Comments and unnamed nodes are ignored.
* `signature`: Only named AST nodes' kinds are matched. Comments, unnamed nodes and text are ignored.

Currently ast-grep only supports Smart.