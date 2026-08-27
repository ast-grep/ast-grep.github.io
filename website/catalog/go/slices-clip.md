## Prefer `slices.Clip` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogc2xpY2VzLWNsaXBcbmxhbmd1YWdlOiBHb1xucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiBmdW5jIGYoKSB7ICRTTElDRSA9ICRTTElDRVs6bGVuKCRTTElDRSk6bGVuKCRTTElDRSldIH1cbiAgICBzZWxlY3RvcjogYXNzaWdubWVudF9zdGF0ZW1lbnRcbmNvbnN0cmFpbnRzOlxuICBTTElDRTpcbiAgICBraW5kOiBpZGVudGlmaWVyXG5maXg6ICRTTElDRSA9IHNsaWNlcy5DbGlwKCRTTElDRSkiLCJzb3VyY2UiOiJpbXBvcnQgXCJzbGljZXNcIlxuXG5mdW5jIHJlbGVhc2VDYXBhY2l0eShpdGVtcyBbXXN0cmluZykge1xuXHRpdGVtcyA9IGl0ZW1zWzpsZW4oaXRlbXMpOmxlbihpdGVtcyldXG5cdHVzZShpdGVtcylcbn0ifQ==)

### Description

`slices.Clip` limits a slice's capacity to its length. It is the readable standard-library equivalent of the full slice expression `s[:len(s):len(s)]`.

This helper requires Go 1.21 or newer. The fix assumes the standard-library `slices` package is available under its usual name; add the import if needed.

### YAML

```yaml
id: slices-clip
language: Go
rule:
  pattern:
    context: func f() { $SLICE = $SLICE[:len($SLICE):len($SLICE)] }
    selector: assignment_statement
constraints:
  SLICE:
    kind: identifier
fix: $SLICE = slices.Clip($SLICE)
```

### Example

```go{4}
import "slices"

func releaseCapacity(items []string) {
	items = items[:len(items):len(items)]
	use(items)
}
```

### Diff

```go
import "slices"

func releaseCapacity(items []string) {
	items = items[:len(items):len(items)] // [!code --]
	items = slices.Clip(items) // [!code ++]
	use(items)
}
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
