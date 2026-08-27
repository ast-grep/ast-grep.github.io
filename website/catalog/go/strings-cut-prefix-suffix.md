## Combine checks and trims with `CutPrefix` or `CutSuffix` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHVzZS1zdHJpbmdzLWN1dC1wcmVmaXgtc3VmZml4XG5sYW5ndWFnZTogR29cbnNldmVyaXR5OiBoaW50XG5tZXNzYWdlOiBDb21iaW5lIGFuIGFmZml4IGNoZWNrIGFuZCB0cmltIHdpdGggc3RyaW5ncy5DdXRQcmVmaXggb3Igc3RyaW5ncy5DdXRTdWZmaXguXG5ydWxlOlxuICBhbGw6XG4gICAgLSBwYXR0ZXJuOlxuICAgICAgICBjb250ZXh0OiB8XG4gICAgICAgICAgZnVuYyBmKCkge1xuICAgICAgICAgICAgaWYgJF9DSEVDSygkJCRDSEVDS19BUkdTKSB7XG4gICAgICAgICAgICAgICRSRVNUIDo9ICRUUklNX0NBTExcbiAgICAgICAgICAgICAgJCQkQk9EWVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3I6IGlmX3N0YXRlbWVudFxuICAgIC0gYW55OlxuICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICBjb250ZXh0OiB8XG4gICAgICAgICAgICAgIGZ1bmMgZigpIHtcbiAgICAgICAgICAgICAgICBpZiBzdHJpbmdzLkhhc1ByZWZpeCgkVkFMVUUsICRBRkZJWCkge1xuICAgICAgICAgICAgICAgICAgJFJFU1QgOj0gc3RyaW5ncy5UcmltUHJlZml4KCRWQUxVRSwgJEFGRklYKVxuICAgICAgICAgICAgICAgICAgJCQkQk9EWVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3I6IGlmX3N0YXRlbWVudFxuICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICBjb250ZXh0OiB8XG4gICAgICAgICAgICAgIGZ1bmMgZigpIHtcbiAgICAgICAgICAgICAgICBpZiBzdHJpbmdzLkhhc1N1ZmZpeCgkVkFMVUUsICRBRkZJWCkge1xuICAgICAgICAgICAgICAgICAgJFJFU1QgOj0gc3RyaW5ncy5UcmltU3VmZml4KCRWQUxVRSwgJEFGRklYKVxuICAgICAgICAgICAgICAgICAgJCQkQk9EWVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3I6IGlmX3N0YXRlbWVudFxuICAgIC0gbm90OlxuICAgICAgICByZWdleDogJ1xcYm9rXFxiJ1xuY29uc3RyYWludHM6XG4gIFZBTFVFOlxuICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgQUZGSVg6XG4gICAgYW55OlxuICAgICAgLSBraW5kOiBpZGVudGlmaWVyXG4gICAgICAtIGtpbmQ6IGludGVycHJldGVkX3N0cmluZ19saXRlcmFsXG4gICAgICAtIGtpbmQ6IHJhd19zdHJpbmdfbGl0ZXJhbFxudHJhbnNmb3JtOlxuICBDVVRfQ0FMTDpcbiAgICByZXBsYWNlOlxuICAgICAgc291cmNlOiAkVFJJTV9DQUxMXG4gICAgICByZXBsYWNlOiAnXnN0cmluZ3NcXC5UcmltJ1xuICAgICAgYnk6IHN0cmluZ3MuQ3V0XG5maXg6IHwtXG4gIGlmICRSRVNULCBvayA6PSAkQ1VUX0NBTEw7IG9rIHtcbiAgICAkJCRCT0RZXG4gIH0iLCJzb3VyY2UiOiJpbXBvcnQgXCJzdHJpbmdzXCJcblxuZnVuYyBpbnNwZWN0KG5hbWUgc3RyaW5nKSB7XG4gIGlmIHN0cmluZ3MuSGFzUHJlZml4KG5hbWUsIFwibG9nOlwiKSB7XG4gICAgdmFsdWUgOj0gc3RyaW5ncy5UcmltUHJlZml4KG5hbWUsIFwibG9nOlwiKVxuICAgIHVzZSh2YWx1ZSlcbiAgfVxuICBpZiBzdHJpbmdzLkhhc1N1ZmZpeChuYW1lLCBcIi50bXBcIikge1xuICAgIHZhbHVlIDo9IHN0cmluZ3MuVHJpbVN1ZmZpeChuYW1lLCBcIi50bXBcIilcbiAgICB1c2UodmFsdWUpXG4gIH1cbn0ifQ==)

### Description

Since Go 1.20, `strings.CutPrefix` and `strings.CutSuffix` return both the remaining string and whether the affix matched. This rule replaces an adjacent check and trim only when they use the same simple value and affix. It also skips bodies containing `ok`, because the fix introduces that name in the `if` initializer.

The rule assumes `strings` is the standard-library package imported under its canonical name and does not add the import.

### YAML

```yaml
id: use-strings-cut-prefix-suffix
language: Go
severity: hint
message: Combine an affix check and trim with strings.CutPrefix or strings.CutSuffix.
rule:
  all:
    - pattern:
        context: |
          func f() {
            if $_CHECK($$$CHECK_ARGS) {
              $REST := $TRIM_CALL
              $$$BODY
            }
          }
        selector: if_statement
    - any:
        - pattern:
            context: |
              func f() {
                if strings.HasPrefix($VALUE, $AFFIX) {
                  $REST := strings.TrimPrefix($VALUE, $AFFIX)
                  $$$BODY
                }
              }
            selector: if_statement
        - pattern:
            context: |
              func f() {
                if strings.HasSuffix($VALUE, $AFFIX) {
                  $REST := strings.TrimSuffix($VALUE, $AFFIX)
                  $$$BODY
                }
              }
            selector: if_statement
    - not:
        regex: '\bok\b'
constraints:
  VALUE:
    kind: identifier
  AFFIX:
    any:
      - kind: identifier
      - kind: interpreted_string_literal
      - kind: raw_string_literal
transform:
  CUT_CALL:
    replace:
      source: $TRIM_CALL
      replace: '^strings\.Trim'
      by: strings.Cut
fix: |-
  if $REST, ok := $CUT_CALL; ok {
    $$$BODY
  }
```

### Example

```go {4-7,8-11}
import "strings"

func inspect(name string) {
  if strings.HasPrefix(name, "log:") {
    value := strings.TrimPrefix(name, "log:")
    use(value)
  }
  if strings.HasSuffix(name, ".tmp") {
    value := strings.TrimSuffix(name, ".tmp")
    use(value)
  }
}
```

### Diff

```go
import "strings"

func inspect(name string) {
  if strings.HasPrefix(name, "log:") { // [!code --]
    value := strings.TrimPrefix(name, "log:") // [!code --]
  if value, ok := strings.CutPrefix(name, "log:"); ok { // [!code ++]
    use(value)
  }
  if strings.HasSuffix(name, ".tmp") { // [!code --]
    value := strings.TrimSuffix(name, ".tmp") // [!code --]
  if value, ok := strings.CutSuffix(name, ".tmp"); ok { // [!code ++]
    use(value)
  }
}
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
