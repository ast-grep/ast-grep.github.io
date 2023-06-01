# Atomic rule

In ast-grep, we have three kinds of rules:

* Atomic rule
* Relational rule
* Composite rule

These three rules can be composed together to create more complex rules. Let's start with the most basic one: atomic rule.

Atomic rule defines the most basic matching rule that determines whether one syntax node matches the rule or not. There are three kinds of atomic rule: `pattern`, `kind` and `regex`.

## `pattern`

Pattern will match one single syntax node according to the [pattern syntax](/guide/pattern-syntax).

```yaml
rule:
  pattern: console.log($GREETING)
```

The above rule will match code like `console.log('Hello World')`.

`pattern` also accepts an `Object` with `context` and `selector`. Such object-style pattern is used to match sub syntax node specified by user in contextual pattern. For example, we can select class field in JavaScript by this pattern.

```yaml
pattern:
  kind: field_definition
  context: class { $F }
```

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

It will match the following code successfully ([playground link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImEgPSAxMjMiLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIGtpbmQ6IHB1YmxpY19maWVsZF9kZWZpbml0aW9uIiwic291cmNlIjoiY2xhc3MgVGVzdCB7XG4gIGEgPSAxMjNcbn0ifQ==)).

```js
class Test {
  a = 123 // match this line
}
```

Here are some situations that you can effectively use `kind`:
1. Pattern code is ambiguous to parse, e.g. `{}` in JavaScript can be either object or code block.
2. It is too hard to enumerate all patterns of an AST kind node, e.g. matching all Java/TypeScript class declaration will need including all modifiers, generics, `extends` and `implements`.
3. Patterns only appear within specific context, e.g. the class property definition.


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

## Tips for writing rules

Since one rule will have *only one* AST node in one match, it is recommended to first write the atomic rule that matches the desired node.

Suppose we want to write a rule which finds functions without a return type.
For example, this code would trigger an error:

```ts
const foo = () => {
	return 1;
}
```
The first step to compose a rule is to find the target. In this case, we can first use kind: `arrow_function` to find function node. Then we can use other rules to filter candidate nodes that does have return type.

Another trick to write cleaner rule is to use embedded rule to augment atomic rule.
Please refer to [embedded rule](/guide/rule-config/composite-rule.html#embedded-rules) for more details.
