---
outline: [2, 3]
---

# ESQuery Style Kind

ast-grep supports limited ESQuery style selector in the `kind` rule.

The selector is still written in the `kind` field. ast-grep will parse the selector and convert it to the corresponding rule object internally.

```yaml
rule:
  kind: call_expression > identifier
```

The example above will match the `identifier` node that is a direct child of `call_expression`.

## Basic Selector

A single node kind is the same as a normal `kind` rule.

```yaml
kind: identifier
```

is equivalent to

```yaml
kind: identifier
```

## Relationship Selectors

### Child Selector

The `>` selector matches a direct child node.

```yaml
kind: call_expression > identifier
```

is equivalent to

```yaml
kind: identifier
inside:
  kind: call_expression
```

### Descendant Selector

A space selector matches a descendant node.

```yaml
kind: call_expression identifier
```

is equivalent to

```yaml
kind: identifier
inside:
  kind: call_expression
  stopBy: end
```

### Adjacent Sibling Selector

The `+` selector matches the next sibling node.

```yaml
kind: decorator + method_definition
```

is equivalent to

```yaml
kind: method_definition
follows:
  kind: decorator
```

### Following Sibling Selector

The `~` selector matches a following sibling node.

```yaml
kind: decorator ~ method_definition
```

is equivalent to

```yaml
kind: method_definition
follows:
  kind: decorator
  stopBy: end
```

## Comma Selector

Comma separated selectors are converted to `any`.

```yaml
kind: identifier, number
```

is equivalent to

```yaml
any:
  - kind: identifier
  - kind: number
```

## Pseudo-classes

### `:has`

`:has` matches a node if the node has a descendant matching the inner selector.

```yaml
kind: function_declaration:has(return_statement)
```

is equivalent to

```yaml
kind: function_declaration
has:
  kind: return_statement
  stopBy: end
```

You can use `>` in `:has` to match a direct child.

```yaml
kind: expression_statement:has(> call_expression)
```

is equivalent to

```yaml
kind: expression_statement
has:
  kind: call_expression
```

### `:not`

`:not` negates the inner selector.

```yaml
kind: identifier:not(number)
```

is equivalent to

```yaml
kind: identifier
not:
  kind: number
```

### `:is`

`:is` accepts comma separated selectors and is converted to `any`.

```yaml
kind: :is(identifier, number)
```

is equivalent to

```yaml
any:
  - kind: identifier
  - kind: number
```

It can be combined with relationship selectors.

```yaml
kind: call_expression > :is(identifier, number)
```

is equivalent to

```yaml
all:
  - any:
      - kind: identifier
      - kind: number
  - inside:
      kind: call_expression
```

### `:nth-child`

`:nth-child` maps to ast-grep's [`nthChild`](/reference/rule.html#nthchild) rule.

```yaml
kind: array > number:nth-child(2n+1)
```

is equivalent to

```yaml
all:
  - kind: number
  - nthChild: 2n+1
  - inside:
      kind: array
```

`:nth-child` also supports `of` syntax.

```yaml
kind: array > :nth-child(1 of number)
```

is equivalent to

```yaml
all:
  - nthChild:
      position: 1
      ofRule:
        kind: number
  - inside:
      kind: array
```

```yaml
kind: array > :nth-child(2n+1 of number)
```

is equivalent to

```yaml
all:
  - nthChild:
      position: 2n+1
      ofRule:
        kind: number
  - inside:
      kind: array
```

### `:nth-last-child`

`:nth-last-child` is equivalent to `nthChild` with `reverse: true`.

```yaml
kind: array > number:nth-last-child(1)
```

is equivalent to

```yaml
all:
  - kind: number
  - nthChild:
      position: 1
      reverse: true
  - inside:
      kind: array
```

## Compound Selector

Compound selectors are combined with `all`.

```yaml
kind: function_declaration:has(return_statement):not(generator_function)
```

is equivalent to

```yaml
all:
  - kind: function_declaration
  - has:
      kind: return_statement
      stopBy: end
  - not:
      kind: generator_function
```

## Current Limitations

The ESQuery style `kind` only supports part of ESQuery syntax:

* Class selectors like `.body` are tokenized but rejected as unsupported.
* Supported pseudo-classes are only `has`, `not`, `is`, `nth-child` and `nth-last-child`.
* `:has(...)`, `:not(...)` and `of ...` parse a single complex selector, not a comma selector list.
* `:is(...)` is the one pseudo-class that accepts comma separated selector lists.
* Identifiers can include letters, digits, `_` and `-`, but cannot start with a digit.
