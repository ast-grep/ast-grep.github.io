## Use Walrus Operator in `if` statement<Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yXG5sYW5ndWFnZTogcHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOiBcImlmICRWQVI6ICQkJEJcIlxuICBmb2xsb3dzOlxuICAgIHBhdHRlcm46XG4gICAgICBjb250ZXh0OiAkVkFSID0gJCQkRVhQUlxuICAgICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgc3RvcEJ5OiBuZWlnaGJvclxuZml4OiB8LVxuICBpZiAkVkFSIDo9ICQkJEVYUFI6XG4gICAgJCQkQlxuLS0tXG5pZDogcmVtb3ZlLWRlY2xhcmF0aW9uXG5sYW5ndWFnZTogcHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOlxuICAgIGNvbnRleHQ6ICRWQVIgPSAkJCRFWFBSXG4gICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gIHByZWNlZGVzOlxuICAgIHBhdHRlcm46IFwiaWYgJFZBUjogJCQkQlwiXG4gICAgc3RvcEJ5OiBuZWlnaGJvclxuZml4OiAnJyIsInNvdXJjZSI6ImEgPSBmb28oKVxuaWYgYTpcbiAgICBkb19iYXIoKSJ9)

### Description

The walrus operator (`:=`, Python 3.8+) merges an assignment into an expression. This rule merges a variable assigned on the line directly above an `if` that tests it. Both directions are required: the first rule rewrites the `if`, the second deletes the now-redundant assignment.

Apply only when all hold: assignment directly above the `if` (adjacent), RHS (right-hand side) is pure (no side effects), test is a bare truth check.
Otherwise skip - see non-cases below. The rules do not check for side effects; review the RHS before applying them.

### YAML

```yaml
id: use-walrus-operator
language: python
rule:
  pattern: "if $VAR: $$$B"
  follows:
    pattern:
      context: $VAR = $$$EXPR
      selector: expression_statement
    stopBy: neighbor
fix: |-
  if $VAR := $$$EXPR:
    $$$B
---
id: remove-declaration
language: python
rule:
  pattern:
    context: $VAR = $$$EXPR
    selector: expression_statement
  precedes:
    pattern: "if $VAR: $$$B"
    stopBy: neighbor
fix: ''
```

### Negated tests (separate rule)

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yLW5vdFxubGFuZ3VhZ2U6IHB5dGhvblxucnVsZTpcbiAgcGF0dGVybjogJ2lmIG5vdCAkVkFSOiAkJCRCJ1xuICBmb2xsb3dzOlxuICAgIHBhdHRlcm46XG4gICAgICBjb250ZXh0OiAkVkFSID0gJCQkRVhQUlxuICAgICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgc3RvcEJ5OiBuZWlnaGJvclxuZml4OiB8LVxuICBpZiBub3QgKCRWQVIgOj0gJCQkRVhQUik6XG4gICAgJCQkQlxuLS0tXG5pZDogcmVtb3ZlLWRlY2xhcmF0aW9uLW5vdFxubGFuZ3VhZ2U6IHB5dGhvblxucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiAkVkFSID0gJCQkRVhQUlxuICAgIHNlbGVjdG9yOiBleHByZXNzaW9uX3N0YXRlbWVudFxuICBwcmVjZWRlczpcbiAgICBwYXR0ZXJuOiAnaWYgbm90ICRWQVI6ICQkJEInXG4gICAgc3RvcEJ5OiBuZWlnaGJvclxuZml4OiAnJyIsInNvdXJjZSI6ImEgPSBmb28oKVxuaWYgbm90IGE6XG4gICAgZG9fYmFyKCkifQ==)

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
  pattern: 'if not $VAR: $$$B'
  follows:
    pattern:
      context: $VAR = $$$EXPR
      selector: expression_statement
    stopBy: neighbor
fix: |-
  if not ($VAR := $$$EXPR):
    $$$B
---
id: remove-declaration-not
language: python
rule:
  pattern:
    context: $VAR = $$$EXPR
    selector: expression_statement
  precedes:
    pattern: 'if not $VAR: $$$B'
    stopBy: neighbor
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
if a := foo(): # [!code ++]
    do_bar()
```

### Do not apply when

- Code sits between assignment and `if` (reordered or skipped).
- RHS has side effects: it runs in a changed order, or twice if the original line is kept.
- Test needs cleaning first (e.g. external data): true does not mean usable. Filter first, then test.

### Contributed by

Inspired by reddit user [/u/jackerhack](https://www.reddit.com/r/rust/comments/13eg738/comment/kagdklw/?)
