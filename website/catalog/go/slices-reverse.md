## Prefer `slices.Reverse` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogc2xpY2VzLXJldmVyc2Vcbmxhbmd1YWdlOiBHb1xucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiB8XG4gICAgICBmb3IgJEksICRKIDo9IDAsIGxlbigkU0xJQ0UpLTE7ICRJIDwgJEo7ICRJLCAkSiA9ICRJKzEsICRKLTEge1xuICAgICAgICAkU0xJQ0VbJEldLCAkU0xJQ0VbJEpdID0gJFNMSUNFWyRKXSwgJFNMSUNFWyRJXVxuICAgICAgfVxuICAgIHNlbGVjdG9yOiBmb3Jfc3RhdGVtZW50XG4gICAgc3RyaWN0bmVzczogY3N0XG5jb25zdHJhaW50czpcbiAgSTpcbiAgICBraW5kOiBpZGVudGlmaWVyXG4gIEo6XG4gICAga2luZDogaWRlbnRpZmllclxuICBTTElDRTpcbiAgICBraW5kOiBpZGVudGlmaWVyXG5maXg6IHNsaWNlcy5SZXZlcnNlKCRTTElDRSkiLCJzb3VyY2UiOiJpbXBvcnQgXCJzbGljZXNcIlxuXG5mdW5jIHJldmVyc2UoaXRlbXMgW11zdHJpbmcpIHtcblx0Zm9yIGksIGogOj0gMCwgbGVuKGl0ZW1zKS0xOyBpIDwgajsgaSwgaiA9IGkrMSwgai0xIHtcblx0XHRpdGVtc1tpXSwgaXRlbXNbal0gPSBpdGVtc1tqXSwgaXRlbXNbaV1cblx0fVxufSJ9)

### Description

`slices.Reverse` clearly expresses an in-place reversal and avoids hand-written index arithmetic. The rule uses CST strictness and identifier constraints so it fixes only the exact two-index swap loop shown below.

This helper requires Go 1.21 or newer. The fix assumes the standard-library `slices` package is available under its usual name; add the import if needed.

### YAML

```yaml
id: slices-reverse
language: Go
rule:
  pattern:
    context: |
      for $I, $J := 0, len($SLICE)-1; $I < $J; $I, $J = $I+1, $J-1 {
        $SLICE[$I], $SLICE[$J] = $SLICE[$J], $SLICE[$I]
      }
    selector: for_statement
    strictness: cst
constraints:
  I:
    kind: identifier
  J:
    kind: identifier
  SLICE:
    kind: identifier
fix: slices.Reverse($SLICE)
```

### Example

```go{4-6}
import "slices"

func reverse(items []string) {
	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 {
		items[i], items[j] = items[j], items[i]
	}
}
```

### Diff

```go
import "slices"

func reverse(items []string) {
	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 { // [!code --]
		items[i], items[j] = items[j], items[i] // [!code --]
	} // [!code --]
	slices.Reverse(items) // [!code ++]
}
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
