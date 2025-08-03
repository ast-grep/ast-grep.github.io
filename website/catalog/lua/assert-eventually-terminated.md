## Ensure eventual assertions are terminated

* [Playground Link](/playground.html#eyJjb2RlIjoiYXNzZXJ0LmV2ZW50dWFsbHkoZnVuY3Rpb24oKSBlbmQpIiwiY29uZmlnIjp7InJ1bGUiOnsiYWxsIjpbeyJraW5kIjoiZnVuY3Rpb25fY2FsbCIsInBhdHRlcm4iOiIkJCQuZXZlbnR1YWxseSgkJCQpIn0seyJoYXMiOnsia2luZCI6ImRvdF9pbmRleF9leHByZXNzaW9uIiwiYW55IjpbeyJwYXR0ZXJuIjoiYXNzZXJ0LiQkJCJ9LHsicGF0dGVybiI6Imx1YXNzZXJ0LiQkJCJ9XSwic3RvcEJ5IjoiZW5kIn19LHsibm90Ijp7Imluc2lkZSI6eyJraW5kIjoiZnVuY3Rpb25fY2FsbCIsImFueSI6W3sicGF0dGVybiI6IiQkJC5pc190cnV0aHkoJCQkKSJ9LHsicGF0dGVybiI6IiQkJC5pc19mYWxzeSgkJCQpIn0seyJwYXR0ZXJuIjoiJCQkLmhhc19lcnJvcigkJCQpIn0seyJwYXR0ZXJuIjoiJCQkLmhhc19ub19lcnJvcigkJCQpIn1dLCJzdG9wQnkiOiJlbmQifX19XX0sImxhbmd1YWdlIjoibHVhIn0sInNlYXJjaCI6ImFzc2VydC5ldmVudHVhbGx5KGZ1bmN0aW9uKCkgZW5kKSJ9)

### Description

Detects unterminated `assert.eventually()` calls in Lua test files. The eventually assertion must be followed by a terminator method like `is_truthy()`, `is_falsy()`, `has_error()`, or `has_no_error()` to actually perform the assertion.

### YAML

```yaml
id: assert-eventually-terminated
language: lua
message: Unterminated eventual assertion
severity: error
note: |
  `assert.eventually()` does not perform any assertion unless followed
  by one of its terminator methods:
    * `is_truthy(message)`
    * `is_falsy(message)`
    * `has_error(message)`
    * `has_no_error(message)`

files:
  - '**/*_spec.lua'

rule:
  all:
    - kind: function_call
      pattern: $$$.eventually($$$)

    - has:
        kind: dot_index_expression
        any:
          - pattern: assert.$$$
          - pattern: luassert.$$$
        stopBy: end

    - not:
        inside:
          kind: function_call
          any:
            - pattern: $$$.is_truthy($$$)
            - pattern: $$$.is_falsy($$$)
            - pattern: $$$.has_error($$$)
            - pattern: $$$.has_no_error($$$)
          stopBy: end
```

### Example

```lua {1,3,5}
assert.eventually(function() end)

assert.with_timeout(1).eventually(function() end)

luassert.eventually(function() end).with_timeout(1)
```

### Contributed by

[flrgh from Kong](https://github.com/Kong/kong/pull/14364)