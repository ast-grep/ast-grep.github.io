## Use Walrus Operator in `if` statement<Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZm4gbWFpbigpIHsgXG4gICAgJCQkO1xuICAgIGlmKCRBKXskJCRCfSBcbiAgICBpZigkQSl7JCQkQ30gXG4gICAgJCQkRlxufSIsInJld3JpdGUiOiJmbiBtYWluKCkgeyAkJCRFOyBpZigkQSl7JCQkQiAkJCRDfSAkJCRGfSIsImNvbmZpZyI6ImlkOiB1c2Utd2FscnVzLW9wZXJhdG9yXG5ydWxlOlxuICBmb2xsb3dzOlxuICAgIHBhdHRlcm46XG4gICAgICBjb250ZXh0OiAkVkFSID0gJCQkRVhQUlxcblxuICAgICAgc2VsZWN0b3I6IGV4cHJlc3Npb25fc3RhdGVtZW50XG4gIHBhdHRlcm46IFwiaWYgJFZBUjogJCQkQlwiXG5maXg6IHwtXG4gIGlmICRWQVIgOj0gJCQkRVhQUjpcbiAgICAkJCRCXG4tLS1cbmlkOiByZW1vdmUtZGVjbGFyYXRpb25cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogJFZBUiA9ICQkJEVYUFJcbiAgICBzZWxlY3RvcjogZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgcHJlY2VkZXM6XG4gICAgcGF0dGVybjogXCJpZiAkVkFSOiAkJCRCXCJcbmZpeDogJyciLCJzb3VyY2UiOiJhID0gZm9vKClcblxuaWYgYTpcbiAgICBkb19iYXIoKSJ9)

### Description

The walrus operator (`:=`) introduced in Python 3.8 allows you to assign values to variables as part of an expression. This rule aims to simplify code by using the walrus operator in `if` statements.

This first part of the rule identifies cases where a variable is assigned a value and then immediately used in an `if` statement to control flow.

```yaml
id: use-walrus-operator
language: python
rule:
  pattern: "if $VAR: $$$B"
  follows:
    pattern:
      context: $VAR = $$$EXPR
      selector: expression_statement
fix: |-
  if $VAR := $$$EXPR:
    $$$B
```

The `pattern` clause finds an `if` statement that checks the truthiness of `$VAR`.
If this pattern `follows` an expression statement where `$VAR` is assigned `$$$EXPR`, the `fix` clause changes the `if` statements to use the walrus operator.

The second part of the rule:

```yaml
id: remove-declaration
rule:
  pattern:
    context: $VAR = $$$EXPR
    selector: expression_statement
  precedes:
    pattern: "if $VAR: $$$B"
fix: ''
```

This rule removes the standalone variable assignment when it directly precedes an `if` statement that uses the walrus operator. Since the assignment is now part of the `if` statement, the separate declaration is no longer needed.

By applying these rules, you can refactor your Python code to be more concise and readable, taking advantage of the walrus operator's ability to combine an assignment with an expression.

### YAML

```yaml
id: use-walrus-operator
language: python
rule:
  follows:
    pattern:
      context: $VAR = $$$EXPR\n
      selector: expression_statement
  pattern: "if $VAR: $$$B"
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
fix: ''
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```python
a = foo()

if a:
    do_bar()
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```python
a = foo() // [!code --]

if a: // [!code --]
if a := foo(): // [!code ++]
    do_bar()
```

### Contributed by
Inspired by reddit user [/u/jackerhack](https://www.reddit.com/r/rust/comments/13eg738/comment/kagdklw/?)