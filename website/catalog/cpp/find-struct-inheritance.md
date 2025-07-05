## Find Struct Inheritance

- [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiY3BwIiwicXVlcnkiOiJzdHJ1Y3QgJFNPTUVUSElORzogICRJTkhFUklUU19GUk9NIHsgJCQkQk9EWTsgfSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6IiIsInNvdXJjZSI6InN0cnVjdCBGb286IEJhciB7fTtcblxuc3RydWN0IEJhcjogQmF6IHtcbiAgaW50IGEsIGI7XG59In0=)

### Description

ast-grep's pattern is AST based. A code snippet like `struct $SOMETHING:  $INHERITS` will not work because it does not have a correct AST structure. The correct pattern should spell out the full syntax like `struct $SOMETHING: $INHERITS { $$$BODY; }`.

Compare the ast structure below to see the difference, especially the `ERROR` node. You can also use the playground's pattern panel to debug.

:::code-group

```shell [Wrong Pattern]
ERROR
  $SOMETHING
  base_class_clause
    $INHERITS
```

```shell [Correct Pattern]
struct_specifier
  $SOMETHING
  base_class_clause
    $INHERITS
  field_declaration_list
    field_declaration
      $$$BODY
```

:::

If it is not possible to write a full pattern, [YAML rule](/guide/rule-config.html) is a better choice.

### Pattern

```shell
ast-grep --lang cpp --pattern '
struct $SOMETHING: $INHERITS { $$$BODY; }'
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```cpp {1-3}
struct Bar: Baz {
  int a, b;
}
```

### Contributed by

Inspired by this [tweet](https://x.com/techno_bog/status/1885421768384331871)
