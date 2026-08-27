## Replace delete-all loops with `clear` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLWNsZWFyXG5sYW5ndWFnZTogR29cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogfC1cbiAgICAgIGZvciAkS0VZIDo9IHJhbmdlICRNQVAge1xuICAgICAgICBkZWxldGUoJE1BUCwgJEtFWSlcbiAgICAgIH1cbiAgICBzdHJpY3RuZXNzOiBjc3RcbmZpeDogY2xlYXIoJE1BUCkiLCJzb3VyY2UiOiJwYWNrYWdlIGNhY2hlXG5cbmZ1bmMgcmVzZXQoZW50cmllcyBtYXBbc3RyaW5nXWludCkge1xuICBmb3Iga2V5IDo9IHJhbmdlIGVudHJpZXMge1xuICAgIGRlbGV0ZShlbnRyaWVzLCBrZXkpXG4gIH1cbn1cblxuZnVuYyByZXNldEFuZENvdW50KGVudHJpZXMgbWFwW3N0cmluZ11pbnQpIGludCB7XG4gIGNvdW50IDo9IDBcbiAgZm9yIGtleSA6PSByYW5nZSBlbnRyaWVzIHtcbiAgICBkZWxldGUoZW50cmllcywga2V5KVxuICAgIGNvdW50KytcbiAgfVxuICByZXR1cm4gY291bnRcbn0ifQ==)

### Description

The `clear` built-in expresses removing every entry from a map without a handwritten loop. Concrete-syntax strictness ensures the fix is offered only when the loop body is exactly the matching `delete` call, without comments that the rewrite could discard.

Use this rule only when the project targets Go 1.21 or newer.

### YAML

```yaml
id: use-clear
language: Go
rule:
  pattern:
    context: |-
      for $KEY := range $MAP {
        delete($MAP, $KEY)
      }
    strictness: cst
fix: clear($MAP)
```

### Example

```go {4-6}
package cache

func reset(entries map[string]int) {
  for key := range entries {
    delete(entries, key)
  }
}

func resetAndCount(entries map[string]int) int {
  count := 0
  for key := range entries {
    delete(entries, key)
    count++
  }
  return count
}
```

The second loop is not matched because it also updates `count`.

### Diff

```go
func reset(entries map[string]int) {
  for key := range entries { // [!code --]
    delete(entries, key) // [!code --]
  } // [!code --]
  clear(entries) // [!code ++]
}
```

### Contributed by

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
