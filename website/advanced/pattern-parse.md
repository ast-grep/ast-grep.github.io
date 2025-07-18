# Deep Dive into ast-grep's Pattern Syntax

ast-grep's pattern is easy to learn but hard to master. While it's easy to get started with, mastering its nuances can greatly enhance your code searching capabilities.

This article aims to provide you with a deep understanding of how ast-grep's patterns are parsed, created, and effectively used in code matching.

## Steps to Create a Pattern

Parsing a pattern in ast-grep involves these keys steps:

1. Preprocess the pattern text, e.g, replacing `$` with [expando_char](/advanced/custom-language.html#register-language-in-sgconfig-yml).
2. Parse the preprocessed pattern text into AST.
3. Extract effective AST nodes based on builtin heuristics or user provided [selector](/reference/rule.html#pattern).
4. Detect AST with wildcard text and convert them into [meta variables](/guide/pattern-syntax.html#meta-variable).

![image](/image/parse-pattern.jpg)

Let's dive deep into each of these steps.

## Pattern is AST based

_**First and foremost, pattern is AST based**._

ast-grep's pattern code will be converted into the Abstract Syntax Tree (AST) format, which is a tree structure that represents the code snippet you want to match.

Therefore pattern cannot be arbitrary text, but a valid code with meta variables as placeholders.
If the pattern cannot be parsed by the underlying parser tree-sitter, ast-grep won't be able to find valid matching for it.

There are several common pitfalls to avoid when creating patterns.

### Invalid Pattern Code

ast-grep pattern must be parsable valid code. While this may seem obvious, newcomers sometimes make mistakes when creating patterns with meta-variables.

_**Meta-variable is usually parsed as identifier in most languages.**_

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

Just as programming languages have ambiguous grammar, so ast-grep patterns can be ambiguous.

Let's consider the JavaScript code snippet below:

```js
a: 123
```

It can be interpreted as an object key-value pair or a labeled statement.

Without other hints, ast-grep will parse it as labeled statement by default. To match object key-value pair, we need to provide more context by [using pattern object](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoieyBhOiAxMjMgfSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6InBhaXIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAne1wiYVwiOiAxMjN9J1xuICAgIHNlbGVjdG9yOiBwYWlyIiwic291cmNlIjoiYSA9IHsgYTogIDEyMyB9In0=).

```yaml
pattern:
  context: "{ a: 123 }"
  selector: pair
```

Other examples of ambiguous patterns include:

- Match function call in [Golang](/catalog/go/#match-function-call-in-golang) and [C](/catalog/c/#match-function-call)
- Match [class field](/guide/rule-config/atomic-rule.html#pattern-object) in JavaScript

### How ast-grep Handles Pattern Code?

ast-grep uses best efforts to parse pattern code for best user experience.

Here are some strategies ast-grep uses to handle code snippet:

- **Replace `$` with expando_char**:
  some languages use `$` as a special character, so ast-grep replace it with [expando_char](/advanced/custom-language.html#register-language-in-sgconfig-yml) in order to make the pattern code parsable.

- **Ignore missing nodes**: ast-grep will ignore missing nodes in pattern like trailing semicolon in Java/C/C++.

- **Treat root error as normal node**: if the parser error has no siblings, ast-grep will treat it as a normal node.

- If all above fails, users should provide more code via pattern object

:::warning Pattern Error Recovery is useful, but not guaranteed

ast-grep's recovery mechanism heavily depends on tree-sitter's behavior. We cannot guarantee invalid patterns will be parsed consistently between different versions. So using invalid pattern may lead to unexpected results after upgrading ast-grep.

When in doubt, always use valid code snippets with pattern object.
:::

## Extract Effective AST for Pattern

After parsing the pattern code, ast-grep needs to extract AST nodes to make the actual pattern.

Normally, a code snippet generated by tree-sitter will be a full AST tree. Yet it is unlikely that the entire tree will be used as a pattern. The code `123` will produce a tree like `program -> expression_statement -> number` in many languages. But we want to match a number literal in the code, not a program containing just a number.

ast-grep uses two strategies to extract **effective AST nodes** that will be used to match code.

### Builtin Heuristic

_**By default, at-grep extracts the leaf node or the innermost node with more than one child.**_

This heuristic extracts the most specific node while still keeping all structural information in the pattern.
If a node has only one child, it is atomic and cannot be further decomposed. We can safely assume the node contains no structural information for matching. In contrast, a node with more than one child contains a structure that we want to search.

Examples:

- `123` will be extracted as `number` because it is the leaf node.

```yaml
program
expression_statement
number              <--- effective node
```

See [Playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiMTIzIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiIiwic291cmNlIjoiIn0=).

- `foo(bar)` will be extracted as `call_expression` because it is the innermost node that has more than one child.

```yaml
program
expression_statement
call_expression       <--- effective node
identifier
arguments
identifier
```

See [Playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiZm9vKGJhcikiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiJjYWxsX2V4cHJlc3Npb24iLCJjb25maWciOiIiLCJzb3VyY2UiOiIifQ==).

### User Defined Selector

Sometimes the effective node extracted by the builtin heuristic may not be what you want.
You can explicitly specify the node to extract using the [selector](/reference/rule.html#pattern) field in the rule configuration.

For example, you may want to match the whole `console.log` statement in JavaScript code. The effective node extracted by the builtin heuristic is `call_expression`, but you want to match the whole `expression_statement`.

Using `console.log($$$)` directly will not include the trailing `;` in the pattern, see [Playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiY29uc29sZS5sb2coJCQkKSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic2lnbmF0dXJlIiwic2VsZWN0b3IiOiJjYWxsX2V4cHJlc3Npb24iLCJjb25maWciOiIiLCJzb3VyY2UiOiJjb25zb2xlLmxvZyhmb28pXG5jb25zb2xlLmxvZyhiYXIpOyJ9).

```js
console.log('Hello')
console.log('World')
```

You can use pattern object to explicitly specify the effective node to be `expression_statement`. [Playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCQkJCkiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNpZ25hdHVyZSIsInNlbGVjdG9yIjoiY2FsbF9leHByZXNzaW9uIiwiY29uZmlnIjoicnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiBjb25zb2xlLmxvZygkJCQpXG4gICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG5maXg6ICcnIiwic291cmNlIjoiY29uc29sZS5sb2coZm9vKVxuY29uc29sZS5sb2coYmFyKTsifQ==)

```yaml
pattern:
  context: console.log($$$)
  selector: expression_statement
```

Using `selector` is especially helpful when you are also using relational rules like `follows` and `precedes`.
You want to match the statement instead of the default inner expression node, and [match other statements around it](https://github.com/ast-grep/ast-grep/issues/1427).

:::tip
When in doubt, try pattern object first.
:::

## Meta Variable Deep Dive

ast-grep's meta variables are also AST based and are detected in the effective nodes extracted from the pattern code.

### Meta Variable Detection in Pattern

Not all `$` prefixed strings will be detected as meta variables.

Only AST nodes that match meta variable syntax will be detected.
If meta variable text is not the only text in the node or it spans multiple nodes, it will not be detected as a meta variable.

**Working meta variable examples:**

- `$A` works
  - `$A` is one single `identifier`
- `$A.$B` works
  - `$A` is `identifier` inside `member_expression`
  - `$B` is the `property_identifier`.
- `$A.method($B)` works
  - `$A` is `identifier` inside `member_expression`
  - `$B` is `identifier` inside `arguments`

**Non working meta variable examples:**

- `obj.on$EVENT` does not work
  - `on$EVENT` is `property_identifier` but `$EVENT` is not the only text
- `"Hello $WORLD"` does not work
  - `$WORLD` is inside `string_content` and is not the only text
- `a $OP b` does not work
  - the whole pattern does not parse
- `$jq` does not work
  - meta variable does not accept lower case letters

See all examples in [Playground](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzaWduYXR1cmUiLCJzZWxlY3RvciI6ImNhbGxfZXhwcmVzc2lvbiIsImNvbmZpZyI6IiIsInNvdXJjZSI6Ii8vIHdvcmtpbmdcbiRBXG4kQS4kQlxuJEEubWV0aG9kKCRCKVxuXG4vLyBub24gd29ya2luZ1xub2JqLm9uJEVWRU5UXG5cIkhlbGxvICRXT1JMRFwiXG5hICRPUCBiIn0=).

### Matching Unnamed Nodes

A meta variable pattern `$META` will capture [named nodes](/advanced/core-concepts.html#named-vs-unnamed) by default.
To capture [unnamed nodes](/advanced/core-concepts.html#named-vs-unnamed), you can use double dollar sign `$$VAR`.

Let's go back to the binary expression example. It is impossible to match arbitrary binary expression in one single pattern. But we can combine `kind` and `has` to match the operator in binary expressions.

Note, `$OP` cannot match the operator because operator is not a named node. We need to use `$$OP` instead.

```yaml
rule:
  kind: binary_expression
  has:
    field: operator
    pattern: $$OP
    # pattern: $OP
```

See the above rule to match all arithmetic expressions in [action](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCQkJCkiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNpZ25hdHVyZSIsInNlbGVjdG9yIjoiY2FsbF9leHByZXNzaW9uIiwiY29uZmlnIjoicnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiBjb25zb2xlLmxvZygkJCQpXG4gICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG5maXg6ICcnIiwic291cmNlIjoiY29uc29sZS5sb2coZm9vKVxuY29uc29sZS5sb2coYmFyKTsifQ==).

### How Multi Meta Variables Match Code

Multiple meta variables like `$$$ARGS` has special matching behavior. It will match multiple nodes in the AST.

`$$$ARGS` will match multiple nodes in source code when the meta variable starts to match. It will match as many nodes as possible until the first AST node after the meta var in pattern is matched.

The behavior is like [non-greedy](https://stackoverflow.com/questions/11898998/how-can-i-write-a-regex-which-matches-non-greedy) matching in regex and template string literal `infer` in [TypeScript](https://github.com/microsoft/TypeScript/pull/40336).

## Use ast-grep playground to debug pattern

ast-grep playground is a great tool to debug pattern code. The pattern tab and pattern panel can help you visualize the AST tree, effective nodes and meta variables.

![playground](/image/pattern-debugger.jpg)

In next article, we will explain how ast-grep's pattern is used to match code, the pattern matching algorithm.
