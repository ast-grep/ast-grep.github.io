## Prefer `any` over `interface{}` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdXNlLWFueVxubGFuZ3VhZ2U6IEdvXG5ydWxlOlxuICBwYXR0ZXJuOiBpbnRlcmZhY2V7fVxuZml4OiBhbnkiLCJzb3VyY2UiOiJwYWNrYWdlIGRlY29kZVxuXG5mdW5jIERlY29kZSh2IGludGVyZmFjZXt9KSBlcnJvciB7IHJldHVybiBuaWwgfVxuXG50eXBlIFN0cmluZ2VyIGludGVyZmFjZSB7XG4gIFN0cmluZygpIHN0cmluZ1xufSJ9)

### Description

Go 1.18 introduced `any` as an alias for `interface{}`. The shorter name makes unconstrained values and type parameters easier to recognize.

Use this rule only when the project targets Go 1.18 or newer, and review code that declares its own identifier named `any`.

### YAML

```yaml
id: use-any
language: Go
rule:
  pattern: interface{}
fix: any
```

### Example

```go {3}
package decode

func Decode(v interface{}) error { return nil }

type Stringer interface {
  String() string
}
```

The non-empty `Stringer` interface is not matched.

### Diff

```go
func Decode(v interface{}) error { return nil } // [!code --]
func Decode(v any) error { return nil } // [!code ++]
```

### Contributed by

Inspired by [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
