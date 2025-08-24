## Find Java field declarations of type String

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmEiLCJxdWVyeSI6ImAkVEFHYCIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIGtpbmQ6IGZpZWxkX2RlY2xhcmF0aW9uXG4gIGhhczpcbiAgICBmaWVsZDogdHlwZVxuICAgIHJlZ2V4OiBeU3RyaW5nJCIsInNvdXJjZSI6IkBDb21wb25lbnRcbmNsYXNzIEFCQyBleHRlbmRzIE9iamVjdHtcbiAgICBAUmVzb3VyY2VcbiAgICBwcml2YXRlIGZpbmFsIFN0cmluZyB3aXRoX2Fubm87XG5cbiAgICBwcml2YXRlIGZpbmFsIFN0cmluZyB3aXRoX211bHRpX21vZDtcblxuICAgIHB1YmxpYyBTdHJpbmcgc2ltcGxlO1xufSJ9)

### Description

To extract all Java field names of type `String` is not as straightforward as one might think. A simple pattern like `String $F;` would only match fields declared without any modifiers or annotations. However, a pattern like `$MOD String $F;` cannot be correctly parsed by tree-sitter.

:::details Use playground pattern debugger to explore the AST

You can use the [playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YSIsInF1ZXJ5IjoiY2xhc3MgQUJDe1xuICAgJE1PRCBTdHJpbmcgdGVzdDtcbn0iLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6ImFzdCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicnVsZTpcbiAga2luZDogZmllbGRfZGVjbGFyYXRpb25cbiAgaGFzOlxuICAgIGZpZWxkOiB0eXBlXG4gICAgcmVnZXg6IF5TdHJpbmckIiwic291cmNlIjoiQENvbXBvbmVudFxuY2xhc3MgQUJDIGV4dGVuZHMgT2JqZWN0e1xuICAgIEBSZXNvdXJjZVxuICAgIHByaXZhdGUgZmluYWwgU3RyaW5nIHdpdGhfYW5ubztcblxuICAgIHByaXZhdGUgZmluYWwgU3RyaW5nIHdpdGhfbXVsdGlfbW9kO1xuXG4gICAgcHVibGljIFN0cmluZyBzaW1wbGU7XG59In0=)'s pattern tab to visualize the AST of `class A { $MOD String $F; }`.

```
field_declaration
  $MOD
  variable_declarator
    identifier: String
  ERROR
    identifier: $F
```

Tree-sitter does not think `$MOD` is a valid modifier, so it produces an `ERROR`.

While the valid AST for code like `private String field;` produces different AST structures:

```
field_declaration
  modifiers
  type_identifier
  variable_declarator
    identifier: field
```

:::

A more robust approach is to use a structural rule that targets `field_declaration` nodes and applies a `has` constraint on the `type` child node to match the type `String`. This method effectively captures fields regardless of their modifiers or annotations.

### YAML

```yaml
id: find-field-with-type
language: java
rule:
  kind: field_declaration
  has:
    field: type
    regex: ^String$
```

### Example

```java {3-4,6,8}
@Component
class ABC extends Object{
    @Resource
    private final String with_anno;

    private final String with_multi_mod;

    public String simple;
}
```

### Contributed by
Inspired by the post [discussion](https://github.com/ast-grep/ast-grep/discussions/2195)
