## Replace delete-all loops with `clear` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLWNsZWFyXG5sYW5ndWFnZTogR29cbnJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogfC1cbiAgICAgIGZvciAkS0VZIDo9IHJhbmdlICRNQVAge1xuICAgICAgICBkZWxldGUoJE1BUCwgJEtFWSlcbiAgICAgIH1cbiAgICBzdHJpY3RuZXNzOiBjc3RcbmZpeDogY2xlYXIoJE1BUCkiLCJzb3VyY2UiOiJmdW5jIHJlc2V0KGVudHJpZXMgbWFwW3N0cmluZ11pbnQpIHtcbiAgZm9yIGtleSA6PSByYW5nZSBlbnRyaWVzIHtcbiAgICBkZWxldGUoZW50cmllcywga2V5KVxuICB9XG59In0=)

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

```go {2-4}
func reset(entries map[string]int) {
  for key := range entries {
    delete(entries, key)
  }
}
```

### Diff

```go
func reset(entries map[string]int) {
  for key := range entries { // [!code --]
    delete(entries, key) // [!code --]
  } // [!code --]
  clear(entries) // [!code ++]
}
```

### Credits

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
