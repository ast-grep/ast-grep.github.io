## Find loops that can range over an integer

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLXJhbmdlLW92ZXItaW50XG5sYW5ndWFnZTogR29cbnNldmVyaXR5OiBoaW50XG5tZXNzYWdlOiBDb25zaWRlciByYW5naW5nIG92ZXIgdGhlIGludGVnZXIgYWZ0ZXIgdmVyaWZ5aW5nIHRoZSBib3VuZCBhbmQgY291bnRlciBzdGF5IHN0YWJsZS5cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogfC1cbiAgICAgIGZvciAkSU5ERVggOj0gMDsgJElOREVYIDwgJEJPVU5EOyAkSU5ERVgrKyB7XG4gICAgICAgICQkJEJPRFlcbiAgICAgIH1cbiAgICBzdHJpY3RuZXNzOiBhc3RcbmNvbnN0cmFpbnRzOlxuICBCT1VORDpcbiAgICBhbnk6XG4gICAgICAtIGtpbmQ6IGludF9saXRlcmFsXG4gICAgICAtIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgIC0gcGF0dGVybjogbGVuKCRDT0xMRUNUSU9OKSIsInNvdXJjZSI6InBhY2thZ2UgYmF0Y2hcblxuZnVuYyB2aXNpdChpdGVtcyBbXXN0cmluZykge1xuICBmb3IgaSA6PSAwOyBpIDwgbGVuKGl0ZW1zKTsgaSsrIHtcbiAgICBwcm9jZXNzKGl0ZW1zW2ldKVxuICB9XG59XG5cbmZ1bmMgdmlzaXRGcm9tT25lKGl0ZW1zIFtdc3RyaW5nKSB7XG4gIGZvciBpIDo9IDE7IGkgPCBsZW4oaXRlbXMpOyBpKysge1xuICAgIHByb2Nlc3MoaXRlbXNbaV0pXG4gIH1cbn1cblxuZnVuYyB2aXNpdFBhaXJzKGl0ZW1zIFtdc3RyaW5nKSB7XG4gIGZvciBpIDo9IDA7IGkgPCBsZW4oaXRlbXMpOyBpICs9IDIge1xuICAgIHByb2Nlc3MoaXRlbXNbaV0pXG4gIH1cbn0ifQ==)

### Description

Go 1.22 can range directly over an integer, producing values from zero through `n-1`. This rule finds the equivalent zero-based loop with a unit increment and an identifier, integer literal, or `len` bound.

No automatic fix is offered because the traditional loop reevaluates its bound on every iteration, while a range expression evaluates it once. The loop body can also modify the counter. Use this suggestion only when the project targets Go 1.22 or newer and both the bound and counter remain stable.

### YAML

```yaml
id: use-range-over-int
language: Go
severity: hint
message: Consider ranging over the integer after verifying the bound and counter stay stable.
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

### Credits

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
