## Prefer Generator Expressions <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiWyQkJEFdIiwicmV3cml0ZSI6IiRBPy4oKSIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46ICRGVU5DKCRMSVNUKVxuY29uc3RyYWludHM6XG4gIExJU1Q6IHsga2luZDogbGlzdF9jb21wcmVoZW5zaW9uIH1cbiAgRlVOQzpcbiAgICBhbnk6XG4gICAgICAtIHBhdHRlcm46IGFueVxuICAgICAgLSBwYXR0ZXJuOiBhbGxcbiAgICAgIC0gcGF0dGVybjogc3VtXG4gICAgICAjIC4uLlxudHJhbnNmb3JtOlxuICBJTk5FUjpcbiAgICBzdWJzdHJpbmc6IHtzb3VyY2U6ICRMSVNULCBzdGFydENoYXI6IDEsIGVuZENoYXI6IC0xIH1cbmZpeDogJEZVTkMoJElOTkVSKSIsInNvdXJjZSI6ImFsbChbeCBmb3IgeCBpbiB5XSlcblt4IGZvciB4IGluIHldIn0=)

### Description

List comprehensions like `[x for x in range(10)]` are a concise way to create lists in Python. However, we can achieve better memory efficiency by using generator expressions like `(x for x in range(10))` instead. List comprehensions create the entire list in memory, while generator expressions generate each element one at a time. We can make the change by replacing the square brackets with parentheses.

### YAML

```yaml
id: prefer-generator-expressions
language: python
rule:
  pattern: $LIST
  kind: list_comprehension
transform:
  INNER:
    substring: { source: $LIST, startChar: 1, endChar: -1 }
fix: ($INNER)
```

This rule converts every list comprehension to a generator expression. However, **not every list comprehension can be replaced with a generator expression.** If the list is used multiple times, is modified, is sliced, or is indexed, a generator is not a suitable replacement.

Some common functions like `any`, `all`, and `sum` take an `iterable` as an argument. A generator function counts as an `iterable`, so it is safe to change a list comprehension to a generator expression in this context.

```yaml
id: prefer-generator-expressions
language: python
rule:
  pattern: $FUNC($LIST)
constraints:
  LIST: { kind: list_comprehension }
  FUNC:
    any:
      - pattern: any
      - pattern: all
      - pattern: sum
      # ...
transform:
  INNER:
    substring: { source: $LIST, startChar: 1, endChar: -1 }
fix: $FUNC($INNER)
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```python
any([x for x in range(10)])
```

### Diff

<!-- use # [!code --] and # [!code ++] to annotate diff -->

```python
any([x for x in range(10)]) # [!code --]
any(x for x in range(10)) # [!code ++]
```

### Contributed by

[Steven Love](https://github.com/StevenLove)
