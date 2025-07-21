## Find function declarations with names of certain pattern

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiJyJ15bQS1aYS16MC05Xy1dKyciLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHRlc3QtZnVuY3Rpb25zXG5sYW5ndWFnZTogZ29cbnJ1bGU6XG4gIGtpbmQ6IGZ1bmN0aW9uX2RlY2xhcmF0aW9uXG4gIGhhczpcbiAgICBmaWVsZDogbmFtZVxuICAgIHJlZ2V4OiBUZXN0LipcbiIsInNvdXJjZSI6InBhY2thZ2UgYWJzXG5pbXBvcnQgXCJ0ZXN0aW5nXCJcbmZ1bmMgVGVzdEFicyh0ICp0ZXN0aW5nLlQpIHtcbiAgICBnb3QgOj0gQWJzKC0xKVxuICAgIGlmIGdvdCAhPSAxIHtcbiAgICAgICAgdC5FcnJvcmYoXCJBYnMoLTEpID0gJWQ7IHdhbnQgMVwiLCBnb3QpXG4gICAgfVxufVxuIn0=)

### Description

ast-grep can find function declarations by their names. But not all names can be matched by a meta variable pattern. For instance, you cannot use a meta variable pattern to find function declarations whose names start with a specific prefix, e.g. `TestAbs` with the prefix `Test`. Attempting `Test$_` will fail because it is not a valid syntax.

Instead, you can use a [YAML rule](/reference/rule.html) to use the [`regex`](/guide/rule-config/atomic-rule.html#regex) atomic rule.

### YAML

```yaml
id: test-functions
language: go
rule:
  kind: function_declaration
  has:
    field: name
    regex: Test.*
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```go{3-8}
package abs
import "testing"
func TestAbs(t *testing.T) {
    got := Abs(-1)
    if got != 1 {
        t.Errorf("Abs(-1) = %d; want 1", got)
    }
}
```

### Contributed by
[kevinkjt2000](https://twitter.com/kevinkjt2000) on [Discord](https://discord.com/invite/4YZjf6htSQ).