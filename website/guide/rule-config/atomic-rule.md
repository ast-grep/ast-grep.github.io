# Atomic rule

Atomic rule defines the most basic matching rule that determines whether one AST node matches the rule or not.

## `pattern`

Pattern will match one single AST node according to [pattern syntax](/guide/pattern-syntax).

```yaml
rule:
  pattern: console.log($GREETING)
```

The above rule will match code like `console.log('Hellow World')`.

## `kind`

Sometimes it is not easy to write a pattern because it is hard to construct one.

For example, if we want to match class property declaration in JavaScript like `class A { a = 1 }`,
writing `a = 1` will not match the property because it is parsed as assigning to a variable.

Instead, we can use `kind` to specify the AST node type defined in [tree-sitter parser](https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes).

`kind` rule accepts the tree-sitter node's name, like `if_statement` and `expression`.
You can refer to [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground) for relevant `kind` names.

Back to our example, we can look up class property's kind from tree-sitter playground.

```yaml
rule:
  kind: public_field_definition
```

It will match the following code successfully ([playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImEgPSAxMjMiLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIGtpbmQ6IHB1YmxpY19maWVsZF9kZWZpbml0aW9uIiwic291cmNlIjoiY2xhc3MgVGVzdCB7XG4gIGEgPSAxMjNcbn0ifQ==)).

```js
class Test {
  a = 123 // match this line
}
```

Here are some situations that you can use `kind`:
1. Pattern code is ambiguous to parse, e.g. `{}` in JavaScript can be either object or code block.
2. It is too hard to enumerate all patterns of an AST kind node, e.g. matching all Java/TypeScript class declaration will need including all modifiers, generics, `extends` and `implements`.
3. Patterns only appear within specific context, e.g. the class property defition.
