<!-- Remove Badge if it does not have fix-->

## Rewrite Check to Yoda Condition <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImMiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoiaWQ6IG1heS10aGUtZm9yY2UtYmUtd2l0aC15b3Vcbmxhbmd1YWdlOiBjXG5ydWxlOlxuICBwYXR0ZXJuOiAkQSA9PSAkQiBcbiAgaW5zaWRlOlxuICAgIGtpbmQ6IHBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvblxuICAgIGluc2lkZToge2tpbmQ6IGlmX3N0YXRlbWVudH1cbmNvbnN0cmFpbnRzOlxuICBCOiB7IGtpbmQ6IG51bWJlcl9saXRlcmFsIH1cbmZpeDogJEIgPT0gJEEiLCJzb3VyY2UiOiJpZiAobXlOdW1iZXIgPT0gNDIpIHsgLyogLi4uICovfVxuaWYgKG5vdE1hdGNoID09IGFub3RoZXIpIHt9XG5pZiAobm90TWF0Y2gpIHt9In0=)

### Description

In programming jargon, a [Yoda condition](https://en.wikipedia.org/wiki/Yoda_conditions) is a style that places the constant portion of the expression on the left side of the conditional statement. It is used to prevent assignment errors that may occur in languages like C.

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: may-the-force-be-with-you
language: c
rule:
  pattern: $A == $B                 # Find equality comparison
  inside:                           # inside an if_statement
    kind: parenthesized_expression
    inside: {kind: if_statement}
constraints:                        # with the constraint that
  B: { kind: number_literal }       # right side is a number
fix: $B == $A
```

The rule targets an equality comparison, denoted by the [pattern](/guide/pattern-syntax.html) `$A == $B`. This comparison must occur [inside](/reference/rule.html#inside) an `if_statement`. Additionally, there’s a [constraint](/reference/yaml.html#constraints) that the right side of the comparison, `$B`, must be a number_literal like `42`.

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```c {1}
if (myNumber == 42) { /* ... */}
if (notMatch == another) { /* ... */}
if (notMatch) { /* ... */}
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```c
if (myNumber == 42) { /* ... */} // [!code --]
if (42 == myNumber) { /* ... */} // [!code ++]
if (notMatch == another) { /* ... */}
if (notMatch) { /* ... */}
```

### Contributed by

Inspired by this [thread](https://x.com/cocoa1han/status/1763020689303581141)
