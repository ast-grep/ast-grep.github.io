## Range over an integer <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLXJhbmdlLW92ZXItaW50XG5sYW5ndWFnZTogR29cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogfC1cbiAgICAgIGZvciAkSU5ERVggOj0gMDsgJElOREVYIDwgJEJPVU5EOyAkSU5ERVgrKyB7XG4gICAgICAgICQkJEJPRFlcbiAgICAgIH1cbiAgICBzdHJpY3RuZXNzOiBhc3RcbmNvbnN0cmFpbnRzOlxuICBCT1VORDpcbiAgICBhbnk6XG4gICAgICAtIGtpbmQ6IGludF9saXRlcmFsXG4gICAgICAtIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgIC0gcGF0dGVybjogbGVuKCRDT0xMRUNUSU9OKVxuZml4OiB8LVxuICBmb3IgJElOREVYIDo9IHJhbmdlICRCT1VORCB7XG4gICAgJCQkQk9EWVxuICB9Iiwic291cmNlIjoicGFja2FnZSBiYXRjaFxuXG5mdW5jIHZpc2l0KGl0ZW1zIFtdc3RyaW5nKSB7XG4gIGZvciBpIDo9IDA7IGkgPCBsZW4oaXRlbXMpOyBpKysge1xuICAgIHByb2Nlc3MoaXRlbXNbaV0pXG4gIH1cbn1cblxuZnVuYyB2aXNpdEZyb21PbmUoaXRlbXMgW11zdHJpbmcpIHtcbiAgZm9yIGkgOj0gMTsgaSA8IGxlbihpdGVtcyk7IGkrKyB7XG4gICAgcHJvY2VzcyhpdGVtc1tpXSlcbiAgfVxufVxuXG5mdW5jIHZpc2l0UGFpcnMoaXRlbXMgW11zdHJpbmcpIHtcbiAgZm9yIGkgOj0gMDsgaSA8IGxlbihpdGVtcyk7IGkgKz0gMiB7XG4gICAgcHJvY2VzcyhpdGVtc1tpXSlcbiAgfVxufSJ9)

### Description

Go 1.22 can range directly over an integer, producing values from zero through `n-1`. This rule recognizes the equivalent zero-based loop with a unit increment and an identifier, integer literal, or `len` bound.

Use this rule only when the project targets Go 1.22 or newer. Keep the traditional loop when the bound can change during iteration because a range expression is evaluated once.

### YAML

```yaml
id: use-range-over-int
language: Go
rule:
  pattern:
    context: |-
      for $INDEX := 0; $INDEX < $BOUND; $INDEX++ {
        $$$BODY
      }
    strictness: ast
constraints:
  BOUND:
    any:
      - kind: int_literal
      - kind: identifier
      - pattern: len($COLLECTION)
fix: |-
  for $INDEX := range $BOUND {
    $$$BODY
  }
```

### Example

```go {4-6}
package batch

func visit(items []string) {
  for i := 0; i < len(items); i++ {
    process(items[i])
  }
}

func visitFromOne(items []string) {
  for i := 1; i < len(items); i++ {
    process(items[i])
  }
}

func visitPairs(items []string) {
  for i := 0; i < len(items); i += 2 {
    process(items[i])
  }
}
```

The non-zero start and custom-step loops are intentionally not matched.

### Diff

```go
func visit(items []string) {
  for i := 0; i < len(items); i++ { // [!code --]
  for i := range len(items) { // [!code ++]
    process(items[i])
  }
}
```

### Contributed by

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
