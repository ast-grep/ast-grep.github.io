## Avoid string concatenation in ngx.log()

* [Playground Link](/playground.html#eyJjb2RlIjoibmd4LmxvZyhuZ3guRVJSLCBcIlNUUklORzogXCIgLi4gbXlfdmFyKSIsImNvbmZpZyI6eyJydWxlIjp7ImFsbCI6W3sibWF0Y2hlcyI6InN0cmluZy1jb25jYXQiLCJpbnNpZGUiOnsia2luZCI6ImFyZ3VtZW50cyIsImluc2lkZSI6eyJtYXRjaGVzIjoibmd4LWxvZy1jYWxsIn19fSx7Im5vdCI6eyJtYXRjaGVzIjoic3RyaW5nLWxpdGVyYWwtY29uY2F0In19XX0sInV0aWxzIjp7Im5neC1sb2ctY2FsbCI6eyJhbnkiOlt7InBhdHRlcm4iOiJuZ3gubG9nKCRfTEVWRUwsICQkJCkifSx7InBhdHRlcm4iOiIkSURFTlQoJF9MRVZFTCwgJCQkKSIsImluc2lkZSI6eyJraW5kIjoiY2h1bmsiLCJzdG9wQnkiOiJlbmQiLCJoYXMiOnsicGF0dGVybiI6IiRJREVOVCA9IG5neC5sb2ciLCJzdG9wQnkiOiJlbmQifX19XX0sInN0cmluZy1jb25jYXQiOnsia2luZCI6ImJpbmFyeV9leHByZXNzaW9uIiwicGF0dGVybiI6IiRMSFMgLi4gJFJIUyJ9LCJzdHJpbmctbGl0ZXJhbC1jb25jYXQiOnsia2luZCI6ImJpbmFyeV9leHByZXNzaW9uIiwiYWxsIjpbeyJoYXMiOnsibloiaINoaWxkIjoxLCJhbnkiOlt7ImtpbmQiOiJzdHJpbmcifSx7Im1hdGNoZXMiOiJzdHJpbmctbGl0ZXJhbC1jb25jYXQifV19fSx7ImhhcyI6eyJudGhDaGlsZCI6MiwiYW55IjpbeyJraW5kIjoic3RyaW5nIn0seyJtYXRjaGVzIjoic3RyaW5nLWxpdGVyYWwtY29uY2F0In1dfX1dfX0sImxhbmd1YWdlIjoibHVhIn0sInNlYXJjaCI6Im5neC5sb2cobmd4LkVSUiwgXCJTVFJJTkc6IFwiIC4uIG15X3ZhcikifQ%3D%3D)

### Description

Detects unsafe string concatenation in `ngx.log()` calls. When passing variables to OpenResty's logging function, use comma-separated arguments instead of string concatenation to avoid runtime errors when variables are nil.

### YAML

```yaml
id: ngx-log-string-concat
language: lua
message: Using string concatenation to build arguments for ngx.log()
severity: error
note: |
  When invoking `ngx.log()` with some variable as input, prefer vararg-style
  calls rather than using the string concatenation operator (`..`):

  ## bad
  ```lua
  ngx.log(ngx.DEBUG, "if `my_var` is nil, this code throws an exception: " .. my_var)
  ```

  ## good
  ```lua
  ngx.log(ngx.DEBUG, "if `my_var` is nil, this code is fine: ", my_var)
  ```

files:
  - kong/**
  - test*.lua

rule:
  all:
    - matches: string-concat
      inside:
        kind: arguments
        inside:
          matches: ngx-log-call
    - not:
        matches: string-literal-concat

utils:
  ngx-log-call:
    any:
      # direct invocation of `_G.ngx.log()`
      - pattern: ngx.log($_LEVEL, $$$)

      # track local var assignments of `_G.ngx.log`
      - pattern: $IDENT($_LEVEL, $$$)
        inside:
          kind: chunk
          stopBy: end
          has:
            pattern: $IDENT = ngx.log
            stopBy: end

  string-concat:
    kind: binary_expression
    pattern: $LHS .. $RHS

  string-literal-concat:
    kind: binary_expression
    all:
      - has:
          nthChild: 1
          any:
            - kind: string
            - matches: string-literal-concat

      - has:
          nthChild: 2
          any:
            - kind: string
            - matches: string-literal-concat
```

### Example

```lua {1,3,5}
ngx.log(ngx.ERR, "STRING: " .. my_var)

ngx.log(ngx.INFO, my_var .. ": STRING")

local log = ngx.log
log(ngx.DEBUG, "Error: " .. error_msg)
```

### Contributed by

[flrgh from Kong](https://github.com/Kong/kong/pull/14364)