## Append formatted bytes with `fmt.Appendf` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHVzZS1mbXQtYXBwZW5kZlxubGFuZ3VhZ2U6IEdvXG5zZXZlcml0eTogaGludFxubWVzc2FnZTogQXBwZW5kIGZvcm1hdHRlZCBieXRlcyBkaXJlY3RseSB3aXRoIGZtdC5BcHBlbmRmLlxucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiBmdW5jIGYoKSB7ICRCVUZGRVIgPSBhcHBlbmQoJEJVRkZFUiwgW11ieXRlKGZtdC5TcHJpbnRmKCQkJEFSR1MpKS4uLikgfVxuICAgIHNlbGVjdG9yOiBhc3NpZ25tZW50X3N0YXRlbWVudFxuY29uc3RyYWludHM6XG4gIEJVRkZFUjpcbiAgICBraW5kOiBpZGVudGlmaWVyXG5maXg6ICRCVUZGRVIgPSBmbXQuQXBwZW5kZigkQlVGRkVSLCAkJCRBUkdTKSIsInNvdXJjZSI6InBhY2thZ2UgbWFpblxuXG5pbXBvcnQgXCJmbXRcIlxuXG5mdW5jIGFwcGVuZENvdW50KGJ1ZiBbXWJ5dGUsIGNvdW50IGludCkgW11ieXRlIHtcbiAgYnVmID0gYXBwZW5kKGJ1ZiwgW11ieXRlKGZtdC5TcHJpbnRmKFwiY291bnQ9JWRcIiwgY291bnQpKS4uLilcbiAgcmV0dXJuIGJ1ZlxufSJ9)

### Description

Since Go 1.19, `fmt.Appendf` can format directly into a byte slice. It avoids creating an intermediate `string` with `fmt.Sprintf` and then converting that string to `[]byte`. This rule matches only the exact nested append shape and keeps the buffer to a plain identifier.

It assumes `fmt` names the standard-library package and does not add the import.

### YAML

```yaml
id: use-fmt-appendf
language: Go
severity: hint
message: Append formatted bytes directly with fmt.Appendf.
rule:
  pattern:
    context: func f() { $BUFFER = append($BUFFER, []byte(fmt.Sprintf($$$ARGS))...) }
    selector: assignment_statement
constraints:
  BUFFER:
    kind: identifier
fix: $BUFFER = fmt.Appendf($BUFFER, $$$ARGS)
```

### Example

```go {6}
package main

import "fmt"

func appendCount(buf []byte, count int) []byte {
  buf = append(buf, []byte(fmt.Sprintf("count=%d", count))...)
  return buf
}
```

### Diff

```go
buf = append(buf, []byte(fmt.Sprintf("count=%d", count))...) // [!code --]
buf = fmt.Appendf(buf, "count=%d", count) // [!code ++]
```

### Contributed by

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
