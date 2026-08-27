## Prefer `reflect.TypeFor` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogcmVmbGVjdC10eXBlLWZvclxubGFuZ3VhZ2U6IEdvXG5ydWxlOlxuICBwYXR0ZXJuOiByZWZsZWN0LlR5cGVPZigoKiRUWVBFKShuaWwpKS5FbGVtKClcbmZpeDogcmVmbGVjdC5UeXBlRm9yWyRUWVBFXSgpXG4iLCJzb3VyY2UiOiJwYWNrYWdlIGV4YW1wbGVcblxuaW1wb3J0IFwicmVmbGVjdFwiXG5cbmZ1bmMgdHlwZU9mW1QgYW55XSgpIHJlZmxlY3QuVHlwZSB7XG5cdHJldHVybiByZWZsZWN0LlR5cGVPZigoKlQpKG5pbCkpLkVsZW0oKVxufVxuIn0=)

### Description

Go 1.22 added `reflect.TypeFor[T]()`, a direct way to obtain the `reflect.Type` for a type argument. It replaces the less readable nil-pointer expression `reflect.TypeOf((*T)(nil)).Elem()`.

This is a syntactic rule: it assumes `reflect` names the standard-library package. Use it only when the module targets Go 1.22 or newer.

### YAML

```yaml
id: reflect-type-for
language: Go
rule:
  pattern: reflect.TypeOf((*$TYPE)(nil)).Elem()
fix: reflect.TypeFor[$TYPE]()
```

### Example

```go{6}
package example

import "reflect"

func typeOf[T any]() reflect.Type {
	return reflect.TypeOf((*T)(nil)).Elem()
}
```

### Diff

```go
typ := reflect.TypeOf((*T)(nil)).Elem() // [!code --]
typ := reflect.TypeFor[T]() // [!code ++]
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
