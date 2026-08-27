## Prefer `time.Since` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLXRpbWUtc2luY2Vcbmxhbmd1YWdlOiBHb1xucnVsZTpcbiAgcGF0dGVybjogdGltZS5Ob3coKS5TdWIoJFNUQVJUKVxuZml4OiB0aW1lLlNpbmNlKCRTVEFSVCkiLCJzb3VyY2UiOiJwYWNrYWdlIG1ldHJpY3NcblxuaW1wb3J0IFwidGltZVwiXG5cbmZ1bmMgZWxhcHNlZChzdGFydCB0aW1lLlRpbWUpIHRpbWUuRHVyYXRpb24ge1xuICByZXR1cm4gdGltZS5Ob3coKS5TdWIoc3RhcnQpXG59XG5cbmZ1bmMgZWxhcHNlZFdpdGgoY2xvY2sgQ2xvY2ssIHN0YXJ0IHRpbWUuVGltZSkgdGltZS5EdXJhdGlvbiB7XG4gIHJldHVybiBjbG9jay5Ob3coKS5TdWIoc3RhcnQpXG59In0=)

### Description

`time.Since(start)` states the intent directly and is equivalent to `time.Now().Sub(start)`.

This syntactic rule assumes `time` is the unaliased standard-library package. It does not add or change imports. `time.Since` is available in Go 1.0 and newer.

### YAML

```yaml
id: use-time-since
language: Go
rule:
  pattern: time.Now().Sub($START)
fix: time.Since($START)
```

### Example

```go {6}
package metrics

import "time"

func elapsed(start time.Time) time.Duration {
  return time.Now().Sub(start)
}

func elapsedWith(clock Clock, start time.Time) time.Duration {
  return clock.Now().Sub(start)
}
```

The call through `clock` is not matched because it is not syntactically the `time` package.

### Diff

```go
func elapsed(start time.Time) time.Duration {
  return time.Now().Sub(start) // [!code --]
  return time.Since(start) // [!code ++]
}
```

### Credits

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
