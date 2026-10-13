## Use Walrus Operator in `if` statement<Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZm4gbWFpbigpIHsgXG4gICAgJCQkO1xuICAgIGlmKCRBKXskJCRCfSBcbiAgICBpZigkQSl7JCQkQ30gXG4gICAgJCQkRlxufSIsInJld3JpdGUiOiJmbiBtYWluKCkgeyAkJCRFOyBpZigkQSl7JCQkQiAkJCRDfSAkJCRGfSIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yXG5ydWxlOlxuICBmb2xsb3dzOlxuICAgIHBhdHRlcm46XG4gICAgICBjb250ZXh0OiAkVkFSID0gJCQkRVhQUlxuICAgICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gIHBhdHRlcm46IFwiaWYgJFZBUjogJCQkQlwiXG5maXg6IHwtXG4gIGlmICRWQVIgOj0gJCQkRVhQUjpcbiAgICAkJCRCXG4tLS1cbmlkOiByZW1vdmUtZGVjbGFyYXRpb25cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogJFZBUiA9ICQkJEVYUFJcbiAgICBzZWxlY3RvcjogZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgcHJlY2VkZXM6XG4gICAgcGF0dGVybjogXCJpZiAkVkFSOiAkJCRCXCJcbmZpeDogJyciLCJzb3VyY2UiOiJhID0gZm9vKClcblxuaWYgYTpcbiAgICBkb19iYXIoKSJ9)

## Description

The walrus operator (`:=`, Python 3.8+) merges an assignment into an expression. This rule merges a variable assigned on the line directly above an `if` that tests it. Both directions are required: the first rule rewrites the `if`, the second deletes the now-redundant assignment.

Apply only when all hold: assignment directly above the `if` (adjacent), RHS [^1] is pure (no side effects), test is a bare truth check.
Otherwise skip - see non-cases below.

## Rules

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

## Negated tests (separate rule)

`if not X` needs parentheses. The rules above never match it; hand-applying their shape flips the branch. Example:

```python
# before
title = (data.get('title') or '').strip()
if not title:
    return fallback
...check...
return title

# wrong — branch inverted, check below is dead code
if title := (data.get('title') or '').strip():
    return fallback
    ...check...
```

Correct form is `if not (title := ...):` (rule above).

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
```

## Example

```python
a = foo()

if a:
    do_bar()
```

## Diff

```python
# before
a = foo()
if a:
    do_bar()

# after
if a := foo():
    do_bar()
```

## Do not apply when

- Code sits between assignment and `if` (reordered or skipped).
- RHS has side effects: it runs in a changed order, or twice if the original line is kept.
- Test needs cleaning first (e.g. external data): true does not mean usable. Filter first, then test.

[^1]: You don't need to know, it's just common right hand side

[^1]: You dont need to know, it's just right hand side
