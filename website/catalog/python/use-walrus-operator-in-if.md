## Use Walrus Operator in `if` statement<Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yXG5sYW5ndWFnZTogcHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOiAkVkFSXG4gIGtpbmQ6IGlkZW50aWZpZXJcbiAgaW5zaWRlOlxuICAgIGtpbmQ6IGlmX3N0YXRlbWVudFxuICAgIGZpZWxkOiBjb25kaXRpb25cbiAgICBmb2xsb3dzOlxuICAgICAgcGF0dGVybjpcbiAgICAgICAgY29udGV4dDogJFZBUiA9ICRFWFBSXG4gICAgICAgIHNlbGVjdG9yOiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgICAgc3RvcEJ5OiBuZWlnaGJvclxuY29uc3RyYWludHM6XG4gIFZBUjpcbiAgICBraW5kOiBpZGVudGlmaWVyXG4gIEVYUFI6XG4gICAgbm90OlxuICAgICAga2luZDogYXNzaWdubWVudFxuZml4OiAkVkFSIDo9ICgkRVhQUilcbi0tLVxuaWQ6IHJlbW92ZS1kZWNsYXJhdGlvblxubGFuZ3VhZ2U6IHB5dGhvblxucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiAkVkFSID0gJEVYUFJcbiAgICBzZWxlY3RvcjogZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgcHJlY2VkZXM6XG4gICAga2luZDogaWZfc3RhdGVtZW50XG4gICAgaGFzOlxuICAgICAgZmllbGQ6IGNvbmRpdGlvblxuICAgICAgcGF0dGVybjogJFZBUlxuICAgICAga2luZDogaWRlbnRpZmllclxuICAgIHN0b3BCeTogbmVpZ2hib3JcbmNvbnN0cmFpbnRzOlxuICBWQVI6XG4gICAga2luZDogaWRlbnRpZmllclxuICBFWFBSOlxuICAgIG5vdDpcbiAgICAgIGtpbmQ6IGFzc2lnbm1lbnRcbmZpeDogJyciLCJzb3VyY2UiOiJhID0gZm9vKClcbmlmIGE6XG4gICAgZG9fYmFyKCkifQ==)

### Description

The walrus operator (`:=`, Python 3.8+) merges an assignment into an expression. This rule merges an assignment to a simple name with the immediately following `if` that tests it. Apply both rules in one scan of the original code: one rewrites only the condition, preserving the body and any `elif` or `else` branches, and the other removes the assignment.

Apply only when all hold: a single assignment to a simple name (such as `title`), assignment immediately before the `if` (adjacent), RHS (right-hand side) is pure (no side effects), test is a bare truth check.
Otherwise skip - see non-cases below. The rules do not check for side effects; review the RHS before applying them.

### YAML

```yaml
id: use-walrus-operator
language: python
rule:
  pattern: $VAR
  kind: identifier
  inside:
    kind: if_statement
    field: condition
    follows:
      pattern:
        context: $VAR = $EXPR
        selector: expression_statement
      stopBy: neighbor
constraints:
  VAR:
    kind: identifier
  EXPR:
    not:
      kind: assignment
fix: $VAR := ($EXPR)
---
id: remove-declaration
language: python
rule:
  pattern:
    context: $VAR = $EXPR
    selector: expression_statement
  precedes:
    kind: if_statement
    has:
      field: condition
      pattern: $VAR
      kind: identifier
    stopBy: neighbor
constraints:
  VAR:
    kind: identifier
  EXPR:
    not:
      kind: assignment
fix: ''
```

The constraints restrict `$VAR` to a simple name and exclude chained assignments such as `a = b = value`. Both rules use the same constraints. Parenthesizing `$EXPR` preserves tuple expressions such as `a = 1, 2`.

### Negated tests (separate rule)

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yLW5vdFxubGFuZ3VhZ2U6IHB5dGhvblxucnVsZTpcbiAgcGF0dGVybjogbm90ICRWQVJcbiAgaW5zaWRlOlxuICAgIGtpbmQ6IGlmX3N0YXRlbWVudFxuICAgIGZpZWxkOiBjb25kaXRpb25cbiAgICBmb2xsb3dzOlxuICAgICAgcGF0dGVybjpcbiAgICAgICAgY29udGV4dDogJFZBUiA9ICRFWFBSXG4gICAgICAgIHNlbGVjdG9yOiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgICAgc3RvcEJ5OiBuZWlnaGJvclxuY29uc3RyYWludHM6XG4gIFZBUjpcbiAgICBraW5kOiBpZGVudGlmaWVyXG4gIEVYUFI6XG4gICAgbm90OlxuICAgICAga2luZDogYXNzaWdubWVudFxuZml4OiBub3QgKCRWQVIgOj0gKCRFWFBSKSlcbi0tLVxuaWQ6IHJlbW92ZS1kZWNsYXJhdGlvbi1ub3Rcbmxhbmd1YWdlOiBweXRob25cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogJFZBUiA9ICRFWFBSXG4gICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gIHByZWNlZGVzOlxuICAgIGtpbmQ6IGlmX3N0YXRlbWVudFxuICAgIGhhczpcbiAgICAgIGZpZWxkOiBjb25kaXRpb25cbiAgICAgIHBhdHRlcm46IG5vdCAkVkFSXG4gICAgc3RvcEJ5OiBuZWlnaGJvclxuY29uc3RyYWludHM6XG4gIFZBUjpcbiAgICBraW5kOiBpZGVudGlmaWVyXG4gIEVYUFI6XG4gICAgbm90OlxuICAgICAga2luZDogYXNzaWdubWVudFxuZml4OiAnJyIsInNvdXJjZSI6ImEgPSBmb28oKVxuaWYgbm90IGE6XG4gICAgZG9fYmFyKCkifQ==)

`if not X` needs parentheses. The rules above never match it; hand-applying their shape flips the branch. Example:

```python
# before
def get_title(data):
    title = (data.get('title') or '').strip()
    if not title:
        return fallback
    validate(title)
    return title

# wrong — branch inverted
def get_title(data):
    if title := (data.get('title') or '').strip():
        return fallback
    validate(title)
    return title
```

Correct form is `if not (title := ...):`. Apply both rules below together so the RHS is evaluated only once.

```yaml
id: use-walrus-operator-not
language: python
rule:
  pattern: not $VAR
  inside:
    kind: if_statement
    field: condition
    follows:
      pattern:
        context: $VAR = $EXPR
        selector: expression_statement
      stopBy: neighbor
constraints:
  VAR:
    kind: identifier
  EXPR:
    not:
      kind: assignment
fix: not ($VAR := ($EXPR))
---
id: remove-declaration-not
language: python
rule:
  pattern:
    context: $VAR = $EXPR
    selector: expression_statement
  precedes:
    kind: if_statement
    has:
      field: condition
      pattern: not $VAR
    stopBy: neighbor
constraints:
  VAR:
    kind: identifier
  EXPR:
    not:
      kind: assignment
fix: ''
```

### Example

```python {1,2}
a = foo()
if a:
    do_bar()
```

### Diff

```python
a = foo() # [!code --]
if a: # [!code --]
if a := (foo()): # [!code ++]
    do_bar()
```

### Do not apply when

- The target is an attribute, subscript, or unpacking pattern (for example, `obj.title`, `items[0]`, or `a, b`). Walrus targets must be simple names.
- The assignment is chained (for example, `a = b = value`) or annotated (for example, `a: str = value`). These rules skip both.
- Code sits between assignment and `if` (reordered or skipped).
- RHS has side effects; this example assumes a pure expression and does not verify purity.
- The test needs input validation first (for example, external data): truthy does not mean usable. This rewrite preserves the truth test and does not add validation.

### Contributed by

Inspired by reddit user [/u/jackerhack](https://www.reddit.com/r/rust/comments/13eg738/comment/kagdklw/?)
