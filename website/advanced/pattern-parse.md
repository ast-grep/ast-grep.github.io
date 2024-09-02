# Deep Dive into ast-grep's Pattern Syntax

ast-grep's pattern is easy to learn but hard to master. While it's easy to get started with, mastering its nuances can greatly enhance your code searching capabilities.

This article aims to provide you with a deep understanding of how ast-grep's patterns are parsed, created, and effectively used in code matching.

## Steps to Create a Pattern

Parsing a pattern in ast-grep involves these keys steps:

1. Preprocess the pattern text, e.g, replacing `$` with [expando_char](/advanced/custom-language.html#register-language-in-sgconfig-yml).
2. Parse the preprocessed pattern text into AST.
3. Extract effective AST nodes based on builtin heuristics or user provided [selector](/reference/rule.html#pattern).
4. Detect AST with wildcard text and convert them into [meta variables](/guide/pattern-syntax.html#meta-variable).

Let's dive deep into each of these steps.

## Pattern is AST based

_**First and foremost, pattern is AST based**._

ast-grep's pattern code will be converted into the Abstract Syntax Tree (AST) format, which is a tree structure that represents the code snippet you want to match.

Therefore pattern cannot be arbitrary text, but a valid code with meta variables as placeholders.
If the pattern cannot be parsed by the underlying parser tree-sitter, ast-grep won't be able to find valid matching for it.

There are several common pitfalls to avoid when creating patterns.

### Invalid Pattern Code

ast-grep pattern must be parsable valid code. While this may seem obvious, newcomers sometimes make mistakes when creating patterns with meta-variables.

_**Meta-variable is usually parsed as identifier in most language.**_

When using meta-variables, make sure they are placed in a valid context and not used as a keyword or an operator.
For example, you may want to use `$OP` to match binary expressions like `a + b`.
The pattern below will not work because parsers see it as three consecutive identifiers separated by spaces.

```
$LEFT $OP $RIGHT
```

You can instead use [atomic rule](/guide/rule-config/atomic-rule.html#kind) `kind: binary_expression` to [match binary expressions](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIGtpbmQ6IGJpbmFyeV9leHByZXNzaW9uIiwic291cmNlIjoiYSArIGIgXHJcbmEgLSBiXHJcbmEgPT0gYiAifQ==).

Similarly, in JavaScript you may want to match [object accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#method_definitions) like `{ get foo() {}, set bar() { } }`.
The pattern below will not work because meta-variable is not parsed as the keywords `get` and `set`.

```js
obj = { $KIND foo() { } }
```

Again [rule](/guide/rule-config.html) is more suitable for [this scenario](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIGtpbmQ6IG1ldGhvZF9kZWZpbml0aW9uXG4gIHJlZ2V4OiAnXmdldHxzZXRcXHMnIiwic291cmNlIjoidmFyIGEgPSB7XHJcbiAgICBmb28oKSB7fVxyXG4gICAgZ2V0IGZvbygpIHt9LFxyXG4gICAgc2V0IGJhcigpIHt9LFxyXG59In0=).

```yaml
rule:
  kind: method_definition
  regex: '^get|set\s'
```

### Incomplete Pattern Code

It is very common and even attempting to write incomplete code snippet in patterns. However, incomplete code does not _always_ work.

Consider the following JSON code snippet as pattern:

```json
"a": 123
```

While the intention here is clearly to match a key-value pair, tree-sitter does not treat it as valid JSON code because it is missing the enclosing `{}`. Consequently ast-grep will not be able to parse it.

The solution here is to use [pattern object](/guide/rule-config/atomic-rule.html#pattern-object) to provide complete code snippet.

```yaml
pattern:
  context: '{ "a": 123 }'
  selector: pair
```

You can use both ast-grep playground's [pattern tab](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoianNvbiIsInF1ZXJ5IjoieyBcImFcIjogMTIzIH0iLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiJwYWlyIiwiY29uZmlnIjoicnVsZTpcbiAga2luZDogbWV0aG9kX2RlZmluaXRpb25cbiAgcmVnZXg6ICdeZ2V0fHNldFxccyciLCJzb3VyY2UiOiJ7IFwiYVwiOiAxMjMgfSAifQ==) or [rule tab](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6Impzb24iLCJxdWVyeSI6InsgXCJhXCI6IDEyMyB9IiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoicGFpciIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46IFxuICAgIGNvbnRleHQ6ICd7XCJhXCI6IDEyM30nXG4gICAgc2VsZWN0b3I6IHBhaXIiLCJzb3VyY2UiOiJ7IFwiYVwiOiAxMjMgfSAifQ==) to verify it.


_**Incomplete pattern code sometimes works fine due to error-tolerance.**_

For better _user experience_, ast-grep parse pattern code as lenient as possible. ast-grep parsers will try recovering parsing errors and ignoring missing language constructs.

For example, the pattern `foo(bar)` in Java cannot be parsed as valid code. However, ast-grep recover the parsing error, ignoring missing semicolon and treat it as a method call. So the pattern [still works](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YSIsInF1ZXJ5IjoiZm9vKGJhcikiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAne1wiYVwiOiAxMjN9J1xuICAgIHNlbGVjdG9yOiBwYWlyIiwic291cmNlIjoiY2xhc3MgQSB7XG4gICAgZm9vKCkge1xuICAgICAgICBmb28oYmFyKTtcbiAgICB9XG59In0=).

### Ambiguous Pattern Code

Pattern code can be Ambiguous or Incomplete.

In JavaScript, the following code can be parsed as a variable assignment or a class field initialization.

```js
a = 123
```

The difference is the context.
```
// variable assignment
if (someCondition) {
  a = 123
}
// class field initialization
class A {
  a = 123
}
```


### How to handle code snippet?

ast-grep uses best efforts to parse pattern code for best user experience.

* replace `$` with expando_char
* ignore missing nodes or errors
* if all above fails, users should provide more code via pattern object

:::warning Pattern Error Recovery is useful, but not guaranteed
:::

## Extract Effective AST for Pattern

### Heuristics
By default, at-grep finds the innermost node with more than one child or the leaf node

### Selector
You can explictly specify the node to extract.


## Meta Variable Deep Dive

### Meta Variable Detection in Pattern

-  working $A, $A.$B, $A.method($B)
-  non working $A$B, "$A$B", $A

### Named Match and Unnamed Match

### How Multi Meta Variables Match Code

## Use ast-grep playground to debug pattern

## Conclusion

In next article, we will explain how ast-grep's pattern is used to match code, the pattern matching algorithm.