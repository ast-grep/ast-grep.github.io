## Match Function Call in Golang

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiJhd2FpdCAkQSIsInJld3JpdGUiOiJ0cnkge1xuICAgIGF3YWl0ICRBXG59IGNhdGNoKGUpIHtcbiAgICAvLyB0b2RvXG59IiwiY29uZmlnIjoicnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiAnZnVuYyB0KCkgeyBmbXQuUHJpbnRsbigkJCRBKSB9J1xuICAgIHNlbGVjdG9yOiBjYWxsX2V4cHJlc3Npb25cbiIsInNvdXJjZSI6ImZ1bmMgbWFpbigpIHtcbiAgICBmbXQuUHJpbnRsbihcIk9LXCIpXG59In0=)

### Description

One of the common questions of ast-grep is to match function calls in Golang.

A plain pattern like `fmt.Println($A)` will not work. This is because Golang syntax also allows type conversions, e.g. `int(3.14)`, that look like function calls. Tree-sitter, ast-grep's parser, will prefer parsing `func_call(arg)` as a type conversion instead of a call expression.

To avoid this ambiguity, ast-grep lets us write a [contextual pattern](/guide/rule-config/atomic-rule.html#pattern), which is a pattern inside a larger code snippet.
We can use `context` to write a pattern like this: `func t() { fmt.Println($A) }`. Then, we can use the selector `call_expression` to match only function calls.

Please also read the [deep dive](/advanced/pattern-parse.html) on [ambiguous pattern](/advanced/pattern-parse.html#ambiguous-pattern-code).

### YAML

```yaml
id: match-function-call
language: go
rule:
  pattern:
    context: 'func t() { fmt.Println($A) }'
    selector: call_expression
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```go{2}
func main() {
    fmt.Println("OK")
}
```

### Contributed by

Inspired by [QuantumGhost](https://github.com/QuantumGhost) from [ast-grep/ast-grep#646](https://github.com/ast-grep/ast-grep/issues/646)
