## Find map copy loops that may use `maps.Copy`

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHVzZS1tYXBzLWNvcHlcbmxhbmd1YWdlOiBHb1xuc2V2ZXJpdHk6IGhpbnRcbm1lc3NhZ2U6IENvbnNpZGVyIG1hcHMuQ29weSBhZnRlciB2ZXJpZnlpbmcgY29tcGF0aWJsZSBtYXAgdHlwZXMuXG5ydWxlOlxuICBwYXR0ZXJuOlxuICAgIGNvbnRleHQ6IHxcbiAgICAgIGZvciAkS0VZLCAkVkFMVUUgOj0gcmFuZ2UgJFNPVVJDRSB7XG4gICAgICAgICRERVNUSU5BVElPTlskS0VZXSA9ICRWQUxVRVxuICAgICAgfVxuICAgIHNlbGVjdG9yOiBmb3Jfc3RhdGVtZW50XG4gICAgc3RyaWN0bmVzczogY3N0XG5jb25zdHJhaW50czpcbiAgREVTVElOQVRJT046XG4gICAga2luZDogaWRlbnRpZmllciIsInNvdXJjZSI6ImZ1bmMgbWVyZ2UoZHN0LCBzcmMgbWFwW3N0cmluZ11pbnQpIHtcbiAgZm9yIGtleSwgdmFsdWUgOj0gcmFuZ2Ugc3JjIHtcbiAgICBkc3Rba2V5XSA9IHZhbHVlXG4gIH1cbn0ifQ==)

### Description

Since Go 1.21, `maps.Copy(dst, src)` clearly expresses a shallow copy that overwrites matching destination keys. This rule finds loops whose body is exactly `dst[k] = v` and keeps the destination to a plain identifier.

No automatic fix is offered because ast-grep does not resolve Go types. Assignment permits cases such as copying `map[string]string` into `map[any]any`, while `maps.Copy` requires compatible key and value types. Verify the types before converting the loop, and add `import "maps"` when needed.

### YAML

```yaml
id: use-maps-copy
language: Go
severity: hint
message: Consider maps.Copy after verifying compatible map types.
rule:
  pattern:
    context: |
      for $KEY, $VALUE := range $SOURCE {
        $DESTINATION[$KEY] = $VALUE
      }
    selector: for_statement
    strictness: cst
constraints:
  DESTINATION:
    kind: identifier
```

### Example

```go {2-4}
func merge(dst, src map[string]int) {
  for key, value := range src {
    dst[key] = value
  }
}
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
