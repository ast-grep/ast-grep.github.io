## Replace map copy loops with `maps.Copy` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHVzZS1tYXBzLWNvcHlcbmxhbmd1YWdlOiBHb1xuc2V2ZXJpdHk6IGhpbnRcbm1lc3NhZ2U6IFJlcGxhY2UgYSBjb3B5LW9ubHkgbWFwIGxvb3Agd2l0aCBtYXBzLkNvcHkuXG5ydWxlOlxuICBwYXR0ZXJuOlxuICAgIGNvbnRleHQ6IHxcbiAgICAgIGZvciAkS0VZLCAkVkFMVUUgOj0gcmFuZ2UgJFNPVVJDRSB7XG4gICAgICAgICRERVNUSU5BVElPTlskS0VZXSA9ICRWQUxVRVxuICAgICAgfVxuICAgIHNlbGVjdG9yOiBmb3Jfc3RhdGVtZW50XG4gICAgc3RyaWN0bmVzczogY3N0XG5jb25zdHJhaW50czpcbiAgREVTVElOQVRJT046XG4gICAga2luZDogaWRlbnRpZmllclxuZml4OiBtYXBzLkNvcHkoJERFU1RJTkFUSU9OLCAkU09VUkNFKSIsInNvdXJjZSI6InBhY2thZ2UgbWFpblxuXG5pbXBvcnQgXCJtYXBzXCJcblxuZnVuYyBtZXJnZShkc3QsIHNyYyBtYXBbc3RyaW5nXWludCkge1xuICBmb3Iga2V5LCB2YWx1ZSA6PSByYW5nZSBzcmMge1xuICAgIGRzdFtrZXldID0gdmFsdWVcbiAgfVxufSJ9)

### Description

Since Go 1.21, `maps.Copy(dst, src)` clearly expresses a shallow copy that overwrites matching destination keys. This rule only replaces loops whose body is exactly `dst[k] = v`; it also keeps the destination to a plain identifier so the fix does not change evaluation behavior.

The rule assumes `maps` names the standard-library package. It does not add imports, so add `import "maps"` when needed.

### YAML

```yaml
id: use-maps-copy
language: Go
severity: hint
message: Replace a copy-only map loop with maps.Copy.
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
fix: maps.Copy($DESTINATION, $SOURCE)
```

### Example

```go {6-8}
package main

import "maps"

func merge(dst, src map[string]int) {
  for key, value := range src {
    dst[key] = value
  }
}
```

### Diff

```go
func merge(dst, src map[string]int) {
  for key, value := range src { // [!code --]
    dst[key] = value // [!code --]
  } // [!code --]
  maps.Copy(dst, src) // [!code ++]
}
```

### Contributed by

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
