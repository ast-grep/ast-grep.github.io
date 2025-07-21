# Deep Dive into ast-grep's Match Algorithm

By default, ast-grep uses a smart strategy to match pattern against the AST node. All nodes in the pattern must be matched, but it will skip unnamed nodes in target code.

For background and the definition of __*named*__ and __*unnamed*__ nodes, please refer to the [core concepts](/advanced/core-concepts.html) doc.

## How ast-grep's Smart Matching Works

Let's see an example in action.

The following pattern `function $A() {}` will match both plain function and async function in JavaScript. See [playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiZnVuY3Rpb24gJEEoKSB7fSIsInJld3JpdGUiOiJEZWJ1Zy5hc3NlcnQiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAneyAkTTogKCQkJEEpID0+ICRNQVRDSCB9J1xuICAgIHNlbGVjdG9yOiBwYWlyXG4iLCJzb3VyY2UiOiJmdW5jdGlvbiBhKCkge31cbmFzeW5jIGZ1bmN0aW9uIGEoKSB7fSJ9)

```js
// function $A() {}
function foo() {}    // matched
async function bar() {} // matched
```

This is because the keyword `async` is an unnamed node in the syntax tree, so the `async` in the code to search is skipped. As long as `function`, `$A` and `{}` are matched, the pattern is considered matched.

However, if the `async` keyword appears in the pattern code, it will [not be skipped](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiYXN5bmMgZnVuY3Rpb24gJEEoKSB7fSIsInJld3JpdGUiOiJ1c2luZyBuYW1lc3BhY2UgZm9vOjokQTsiLCJjb25maWciOiJcbmlkOiB0ZXN0YmFzZV9pbml0aWFsaXplclxubGFuZ3VhZ2U6IENQUFxucnVsZTpcbiAgcGF0dGVybjpcbiAgICBzZWxlY3RvcjogY29tcG91bmRfc3RhdGVtZW50XG4gICAgY29udGV4dDogXCJ7ICQkJEIgfVwiXG5maXg6IHwtXG4gIHtcbiAgICBmKCk7XG4gICAgJCQkQlxuICB9Iiwic291cmNlIjoiLy8gYXN5bmMgZnVuY3Rpb24gJEEoKSB7fVxuZnVuY3Rpb24gZm9vKCkge30gICAgLy8gbm90IG1hdGNoZWRcbmFzeW5jIGZ1bmN0aW9uIGJhcigpIHt9IC8vIG1hdGNoZWRcbiJ9) and is required to match node in the code.

```js
// async function $A() {}
function foo() {}    // not matched
async function bar() {} // matched
```

The design principle here is that the less a pattern specifies, the more code it can match. Every nodes the pattern author spells out will be respected by ast-grep's matching algorithm by default.

## Smart is Sometimes Dumb

The smart algorithm does not always behave as desired. There are cases where we need more flexibility in the matching algorithm. We may want to ignore all CST trivia nodes. Or even we want to ignore comment AST nodes.

Suppose we want to write a pattern to match import statement in JavaScript. The pattern `import $A from 'lib'` will match only `import A from 'lib'`, but not `import A from "lib"`. This is because the import string has different quotation marks. We do want to ignore the trivial unnamed nodes here.

To this end, ast-grep implements different pattern matching algorithms to provide more flexibility to the users, and every pattern can have their own matching algorithm to fine-tune the matching behavior.

## Matching Algorithm Strictness

Different matching algorithm is controlled by **pattern strictness**.

:::tip Strictness
Strictness is defined in terms of what nodes can be *skipped* during matching.

A *stricter* matching algorithm will *skip fewer nodes* and accordingly *produce fewer matches*.
:::


Currently, ast-grep has these strictness levels.

* `cst`: All nodes in the pattern and target code must be matched. No node is skipped.
* `smart`: All nodes in the pattern must be matched, but it will skip unnamed nodes in target code. This is the default behavior.
* `ast`: Only named AST nodes in both pattern and target code are matched. All unnamed nodes are skipped.
* `relaxed`: Named AST nodes in both pattern and target code are matched. Comments and unnamed nodes are ignored.
* `signature`: Only named AST nodes' kinds are matched. Comments, unnamed nodes and text are ignored.

## Strictness Examples

Let's see how strictness `ast` will impact matching. In our previous import lib example, the pattern `import $A from 'lib'` will match both two statements.

```js
import $A from 'lib' // pattern
import A1 from 'lib' // match, quotation is ignored
import A2 from "lib" // match, quotation is ignored
import A3 from "not" // no match, string_fragment is checked
```

First, the pattern and code will be parsed as the tree below. Named

The unnamed nodes are skipped during the matching. Nodes' namedness is annotated beside them.

```
import_statement    // named
  import            // unnamed
  import_clause     // named
    identifier      // named
  from              // unnamed
  string            // named
    "               // unnamed
    string_fragment // named
    "               // unnamed
```

Under the strictness of `ast`, the full syntax tree will be reduced to an Abstract Syntax Tree where only named nodes are kept.

```
import_statement
  import_clause
    identifier      // $A
  string
    string_fragment // lib
```

As long as the tree structure matches and the meta-variable `$A` and string_fragment `lib` are matched, the pattern and code are counted as a match.

---

Another example will be matching the pattern `foo(bar)` across different strictness levels:

```ts
// exact match in all levels
foo(bar)
// match in all levels except cst due to the trailing comma in code
foo(bar,)
// match in relaxed and signature because comment is skipped
foo(/* comment */ bar)
// match in signature because text content is ignored
bar(baz)
```

## Strictness Table

Strictness considers both nodes' namedness and their locations, i.e,
_is the node named_ and _is the node in pattern or code_

The table below summarize how nodes are skipped during matching.

|Strictness|Named Node in Pattern|Named Node in Code to Search|Unnamed Node in Pattern| Unnamed Node in Code to Search|
|---|----|---|---|---|
|`cst`| Keep | Keep| Keep | Keep |
|`smart`| Keep| Keep | Keep | Skip |
|`ast`| Keep| Keep | Skip| Skip |
|`relaxed`| Skip comment | Skip comment | Skip | Skip |
|`signature`| Skip comment. Ignore text | Skip comment. Ignore text | Skip | Skip |


## Configure Strictness

ast-grep has two ways to configure pattern strictness.

1. Using `--strictness` in `ast-grep run`

You can use the `--strictness` flag in [`ast-grep run`](/reference/cli/run.html)

```bash
ast-grep run -p '$FOO($BAR)' --strictness ast
```

2. Using `strictness` in Pattern Object

[Pattern object](/reference/rule.html#pattern) in YAML has an optional `strictness` field.

```
id: test-pattern-strictness
language: JavaScript
rule:
  pattern:
    context: $FOO($BAR)
    strictness: ast
```