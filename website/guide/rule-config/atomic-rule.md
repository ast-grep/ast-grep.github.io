# Atomic Rule

ast-grep has three categories of rules. Let's start with the most basic one: atomic rule.

Atomic rule defines the most basic matching rule that determines whether one syntax node matches the rule or not. There are five kinds of atomic rule: `pattern`, `kind`, `regex`, `nthChild` and `range`.

## `pattern`

Pattern will match one single syntax node according to the [pattern syntax](/guide/pattern-syntax).

```yaml
rule:
  pattern: console.log($GREETING)
```

The above rule will match code like `console.log('Hello World')`.

By default, a _string_ `pattern` is parsed and matched as a whole.


### Pattern Object

It is not always possible to select certain code with a simple string pattern. A pattern code can be invalid, incomplete or ambiguous for the parser since it lacks context.

For example, to select class field in JavaScript, writing `$FIELD = $INIT` will not work because it will be parsed as `assignment_expression`. See [playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiJEZJRUxEID0gJElOSVQiLCJyZXdyaXRlIjoiRGVidWcuYXNzZXJ0IiwiY29uZmlnIjoicnVsZTpcbiAgcGF0dGVybjogXG4gICAgY29udGV4dDogJ3sgJE06ICgkJCRBKSA9PiAkTUFUQ0ggfSdcbiAgICBzZWxlY3RvcjogcGFpclxuIiwic291cmNlIjoiYSA9IDEyM1xuY2xhc3MgQSB7XG4gIGEgPSAxMjNcbn0ifQ==).

----

We can also use an _object_ to specify a sub-syntax node to match within a larger context. It consists of an object with three properties: `context`, `selector` and `strictness`.

* `context` (required): defines the surrounding code that helps to resolve any ambiguity in the syntax.
* `selector` (optional):  defines the sub-syntax node kind that is the actual matcher of the pattern.
* `strictness` (optional): defines how strictly pattern will match against nodes.

Let's see how pattern object can solve the ambiguity in the class field example above.

The pattern object below instructs ast-grep to select the `field_definition` node as the pattern target.

```yaml
pattern:
  selector: field_definition
  context: class A { $FIELD = $INIT }
```

ast-grep works like this:
1. First, the code in `context`, `class A { $FIELD = $INIT }`, is parsed as a class declaration.
2. Then, it looks for the `field_definition` node, specified by `selector`, in the parsed tree.
3. The selected `$FIELD = $INIT` is matched against code as the pattern.

In this way, the pattern is parsed as `field_definition` instead of  `assignment_expression`. See [playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiRGSUVMRCA9ICRJTklUIiwicmV3cml0ZSI6IkRlYnVnLmFzc2VydCIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46XG4gICAgc2VsZWN0b3I6IGZpZWxkX2RlZmluaXRpb25cbiAgICBjb250ZXh0OiBjbGFzcyBBIHsgJEZJRUxEID0gJElOSVQgfVxuIiwic291cmNlIjoiYSA9IDEyM1xuY2xhc3MgQSB7XG4gIGEgPSAxMjNcbn0ifQ==) in action.

Other examples are [function call in Go](https://github.com/ast-grep/ast-grep/issues/646) and [function parameter in Rust](https://github.com/ast-grep/ast-grep/issues/648).

### `strictness`

You can also use pattern object to control the matching strategy with `strictness` field.

By default, ast-grep uses a smart strategy to match pattern against the AST node. All nodes in the pattern must be matched, but it will skip unnamed nodes in target code.

For the definition of __*named*__ and __*unnamed*__ nodes, please refer to the [core concepts](/advanced/core-concepts.html) doc.

For example, the following pattern `function $A() {}` will match both plain function and async function in JavaScript. See [playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiZnVuY3Rpb24gJEEoKSB7fSIsInJld3JpdGUiOiJEZWJ1Zy5hc3NlcnQiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAneyAkTTogKCQkJEEpID0+ICRNQVRDSCB9J1xuICAgIHNlbGVjdG9yOiBwYWlyXG4iLCJzb3VyY2UiOiJmdW5jdGlvbiBhKCkge31cbmFzeW5jIGZ1bmN0aW9uIGEoKSB7fSJ9)

```js
// function $A() {}
function foo() {}    // matched
async function bar() {} // matched
```

This is because the keyword `async` is an unnamed node in the AST, so the `async` in the code to search is skipped. As long as `function`, `$A` and `{}` are matched, the pattern is considered matched.

However, this is not always the desired behavior. ast-grep provides `strictness` to control the matching strategy. At the moment, it provides these options, ordered from the most strict to the least strict:

* `cst`: All nodes in the pattern and target code must be matched. No node is skipped.
* `smart`: All nodes in the pattern must be matched, but it will skip unnamed nodes in target code. This is the default behavior.
* `ast`: Only named AST nodes in both pattern and target code are matched. All unnamed nodes are skipped.
* `relaxed`: Named AST nodes in both pattern and target code are matched. Comments and unnamed nodes are ignored.
* `signature`: Only named AST nodes' kinds are matched. Comments, unnamed nodes and text are ignored.

:::tip Deep Dive and More Examples

`strictness` is an advanced feature that you may not need in most cases.

If you are interested in more examples and details, please refer to the [deep dive](/advanced/match-algorithm.html) doc on ast-grep's match algorithm.

:::

## `kind`

Sometimes it is not easy to write a pattern because it is hard to construct the valid syntax.

For example, if we want to match class property declaration in JavaScript like `class A { a = 1 }`,
writing `a = 1` will not match the property because it is parsed as assigning to a variable.

Instead, we can use `kind` to specify the AST node type defined in [tree-sitter parser](https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes).

`kind` rule accepts the tree-sitter node's name, like `if_statement` and `expression`.
You can refer to [ast-grep playground](/playground) for relevant `kind` names.

Back to our example, we can look up class property's kind from the playground.

```yaml
rule:
  kind: field_definition
```

It will match the following code successfully ([playground link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImEgPSAxMjMiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoiIyBDb25maWd1cmUgUnVsZSBpbiBZQU1MXG5ydWxlOlxuICBraW5kOiBmaWVsZF9kZWZpbml0aW9uIiwic291cmNlIjoiY2xhc3MgVGVzdCB7XG4gIGEgPSAxMjNcbn0ifQ==)).

```js
class Test {
  a = 123 // match this line
}
```

Here are some situations that you can effectively use `kind`:
1. Pattern code is ambiguous to parse, e.g. `{}` in JavaScript can be either object or code block.
2. It is too hard to enumerate all patterns of an AST kind node, e.g. matching all Java/TypeScript class declaration will need including all modifiers, generics, `extends` and `implements`.
3. Patterns only appear within specific context, e.g. the class property definition.


:::warning `kind` + `pattern` is different from pattern object
You may want to use `kind` to change how `pattern` is parsed. However, ast-grep rules are independent of each other.

To change the parsing behavior of `pattern`, you should use pattern object with `context` and `selector` field.
See [this FAQ](/advanced/faq.html#kind-and-pattern-rules-are-not-working-together-why).
:::

### ESQuery style `kind` <Badge type="warning" text="Experimental" />

From ast-grep v0.39.1, you can also use ESQuery style selector in `kind` to match AST nodes. This is an experimental feature and may change in the future.

```yaml
rule:
  kind: call_expression > identifier
```
This will match the `identifier` node that is a child of `call_expression` node. Internally, it will be converted to a [relational rule](/guide/rule-config/relational-rule.html) `has`.

Currently, the ESQuery style `kind` only supports the following selectors:
* node kind: `identifier`
* `>`: direct child selectors
* `+`: next sibling selector
* `~`: following sibling selector
* ` `: descendant selector

If you want more selectors, please respond to [this issue on GitHub](https://github.com/ast-grep/ast-grep/issues/2127).


## `regex`

The `regex` atomic rule will match the AST node by its text against a Rust regular expression.

```yaml
rule:
  regex: "\w+"
```

:::tip
The regular expression is written in [Rust syntax](https://docs.rs/regex/latest/regex/), not the popular [PCRE like syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
So some features are not available like arbitrary look-ahead and back references.
:::

You should almost always combine `regex` with other atomic rules to make sure the regular expression is applied to the correct AST node. Regex matching is quite expensive and cannot be optimized based on AST node kinds. While `kind` and `pattern` rules can be only applied to nodes with specific `kind_id` for optimized performance.

## `nthChild`

`nthChild` is a rule to find nodes based on their indexes in the parent node's children list. In other words, it selects nodes based on their position among all sibling nodes within a parent node. It is very helpful in finding nodes without children or nodes appearing in specific positions.

`nthChild` is heavily inspired by CSS's [`nth-child` pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child), and it accepts similar forms of arguments.

```yaml
# a number to match the exact nth child
nthChild: 3

# An+B style string to match position based on formula
nthChild: 2n+1

# object style nthChild rule
nthChild:
  # accepts number or An+B style string
  position: 2n+1
  # optional, count index from the end of sibling list
  reverse: true # default is false
  # optional, filter the sibling node list based on rule
  ofRule:
    kind: function_declaration # accepts ast-grep rule
```

:::tip
* `nthChild`'s index is 1-based, not 0-based, as in the CSS selector.
* `nthChild`'s node list only includes named nodes, not unnamed nodes.
:::

**Example**

The [following rule](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiRGSUVMRCA9ICRJTklUIiwicmV3cml0ZSI6IkRlYnVnLmFzc2VydCIsImNvbmZpZyI6InJ1bGU6XG4gIGtpbmQ6IG51bWJlclxuICBudGhDaGlsZDogMiIsInNvdXJjZSI6IlsxLDIsM10ifQ==) will match the second number in the JavaScript array.

```yaml
rule:
  kind: number
  nthChild: 2
```

It will match the following code:

```js
const arr = [ 1, 2, 3, ]
            //   |- match this number
```

## `range`

`range` is a rule to match nodes based on their position in the source code. It is useful when you want to integrate external tools like compilers or type checkers with ast-grep. External tools can provide the range information of the interested node, and ast-grep can use it to rewrite the code.

`range` rule accepts a range object with `start` and `end` fields. Each field is an object with `line` and `column` fields.

```yaml
rule:
  range:
    start:
      line: 0
      column: 0
    end:
      line: 1
      column: 5
```

The above example will match an AST node having the first three characters of the first line like `foo` in `foo.bar()`.

`line` and `column` are 0-based and character-wise, and the `start` is inclusive while the `end` is exclusive.


## Tips for Writing Rules

Since one rule will have *only one* AST node in one match, it is recommended to first write the atomic rule that matches the desired node.

Suppose we want to write a rule which finds functions without a return type.
For example, this code would trigger an error:

```ts
const foo = () => {
	return 1;
}
```
The first step to compose a rule is to find the target. In this case, we can first use kind: `arrow_function` to find function node. Then we can use other rules to filter candidate nodes that does have return type.

Another trick to write cleaner rule is to use sub-rules as fields.
Please refer to [composite rule](/guide/rule-config/composite-rule.html#combine-different-rules-as-fields) for more details.
