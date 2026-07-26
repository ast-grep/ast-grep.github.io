## Find Dart Calls by Callee Name

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImRhcnQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogZmluZC1kYXJ0LWNhbGxzLWJ5LW5hbWVcbm1lc3NhZ2U6IENhbGwgdG8gdGFyZ2V0Rm5cbnNldmVyaXR5OiBoaW50XG5sYW5ndWFnZTogZGFydFxucnVsZTpcbiAgYW55OlxuICAgICMgT3JkaW5hcnksIG1lbWJlciwgbnVsbC1hd2FyZSwgZ2VuZXJpYywgbmVzdGVkLCBwYXJlbnRoZXNpemVkLCBhbmRcbiAgICAjIG51bGwtYXNzZXJ0ZWQgY2FsbHMuXG4gICAgLSBhbGw6XG4gICAgICAgIC0ga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgIC0gaGFzOlxuICAgICAgICAgICAgZmllbGQ6IGZ1bmN0aW9uXG4gICAgICAgICAgICBzdG9wQnk6IG5laWdoYm9yXG4gICAgICAgICAgICBhbGw6XG4gICAgICAgICAgICAgIC0gcmVnZXg6ICcoP3MpXig/Oi4qXFwuKT8oPzpcXHN8XFwofC9cXCouKj9cXCovfC8vW15cXG5dKig/OlxcbnwkKSkqdGFyZ2V0Rm4oPzpcXHN8L1xcKi4qP1xcKi98Ly9bXlxcbl0qKD86XFxufCQpKSooPzo8Lio+KT8oPzpcXHN8XFwpfCEpKiQnXG4gICAgICAgICAgICAgIC0gbm90OlxuICAgICAgICAgICAgICAgICAga2luZDogZnVuY3Rpb25fZXhwcmVzc2lvblxuICAgICAgICAgICAgICAtIG5vdDpcbiAgICAgICAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAgICAgICAga2luZDogZnVuY3Rpb25fZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICBzdG9wQnk6IGVuZFxuICAgICMgdHJlZS1zaXR0ZXItZGFydCByZXByZXNlbnRzIGEgZGlyZWN0IGFycm93LWJvZHkgY2FsbCBhcyBhIGNhbGxfZXhwcmVzc2lvblxuICAgICMgd2hvc2UgZnVuY3Rpb24gZmllbGQgY29udGFpbnMgdGhlIGVuY2xvc2luZyBmdW5jdGlvbiBleHByZXNzaW9uLlxuICAgIC0gYWxsOlxuICAgICAgICAtIGtpbmQ6IGNhbGxfZXhwcmVzc2lvblxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBmdW5jdGlvblxuICAgICAgICAgICAgc3RvcEJ5OiBuZWlnaGJvclxuICAgICAgICAgICAgYWxsOlxuICAgICAgICAgICAgICAtIHJlZ2V4OiAnKD9zKV4uKj0+KD86XFxzfFxcKHwvXFwqLio/XFwqL3wvL1teXFxuXSooPzpcXG58JCl8YXdhaXRcXGIpKig/Oi4qXFwuKT90YXJnZXRGbig/Olxcc3wvXFwqLio/XFwqL3wvL1teXFxuXSooPzpcXG58JCkpKig/OjwuKj4pPyg/Olxcc3xcXCl8ISkqJCdcbiAgICAgICAgICAgICAgLSBhbnk6XG4gICAgICAgICAgICAgICAgICAtIGFsbDpcbiAgICAgICAgICAgICAgICAgICAgICAtIGtpbmQ6IGZ1bmN0aW9uX2V4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAtIG5vdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGZ1bmN0aW9uX2V4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9wQnk6IGVuZFxuICAgICAgICAgICAgICAgICAgLSBhbGw6XG4gICAgICAgICAgICAgICAgICAgICAgLSBhbnk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC0ga2luZDogbWVtYmVyX2V4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLSBraW5kOiBudWxsX2F3YXJlX21lbWJlcl9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC0ga2luZDogaW5zdGFudGlhdGlvbl9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC0ga2luZDogbnVsbF9hc3NlcnRpb25fZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgIC0gaGFzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBmdW5jdGlvbl9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BCeTogZW5kXG4gICAgIyBvYmouLnRhcmdldEZuKC4uLikgYW5kIG9iaj8uLnRhcmdldEZuKC4uLilcbiAgICAtIGFsbDpcbiAgICAgICAgLSBraW5kOiBjYXNjYWRlX2NhbGxfZXhwcmVzc2lvblxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBwcm9wZXJ0eVxuICAgICAgICAgICAgc3RvcEJ5OiBuZWlnaGJvclxuICAgICAgICAgICAgcmVnZXg6ICdedGFyZ2V0Rm4kJyIsInNvdXJjZSI6InZvaWQgZXhhbXBsZShTZXJ2aWNlIHNlcnZpY2UsIFNlcnZpY2U/IG1heWJlU2VydmljZSkge1xuICB0YXJnZXRGbignZGlyZWN0Jyk7XG4gIHNlcnZpY2UudGFyZ2V0Rm4oJ21lbWJlcicpO1xuICBtYXliZVNlcnZpY2U/LnRhcmdldEZuKCdudWxsLWF3YXJlJyk7XG4gIHNlcnZpY2UuLnRhcmdldEZuKCdjYXNjYWRlJyk7XG4gIHRhcmdldEZuPGludD4oMSk7XG4gIGZpbmFsIGNhbGxiYWNrID0gKCkgPT4gdGFyZ2V0Rm4oJ2Fycm93IGJvZHknKTtcblxuICBmaW5hbCB0ZWFyT2ZmID0gdGFyZ2V0Rm47XG4gIHNlcnZpY2UudGFyZ2V0Rm4udG9TdHJpbmcoKTtcbiAgY29uc3QgdGV4dCA9ICd0YXJnZXRGbihcIm5vdCBjb2RlXCIpJztcbn0iLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiJ9)

### Description

A standalone Dart pattern such as `targetFn($$$ARGS)` can be parsed as a
function signature instead of a call expression. This rule avoids that
ambiguity and finds common call forms whose syntactic callee is the exact
identifier `targetFn`.

It covers direct, member, null-aware, generic, nested, parenthesized,
null-asserted, common single-level sync or async arrow-body, and direct cascade
calls. It does not match tear-offs, comments, strings, explicit `new` or
`const` constructor expressions, operators, or indirect invocations whose
callee is not syntactically named `targetFn`.

Copy the YAML into `find-dart-calls-by-name.yml`, replace every occurrence of
`targetFn` with the simple Dart identifier you need, and run:

```sh
ast-grep scan --rule find-dart-calls-by-name.yml lib test
```

### YAML

```yaml
id: find-dart-calls-by-name
message: Call to targetFn
severity: hint
language: dart
rule:
  any:
    # Ordinary, member, null-aware, generic, nested, parenthesized, and
    # null-asserted calls.
    - all:
        - kind: call_expression
        - has:
            field: function
            stopBy: neighbor
            all:
              - regex: '(?s)^(?:.*\.)?(?:\s|\(|/\*.*?\*/|//[^\n]*(?:\n|$))*targetFn(?:\s|/\*.*?\*/|//[^\n]*(?:\n|$))*(?:<.*>)?(?:\s|\)|!)*$'
              - not:
                  kind: function_expression
              - not:
                  has:
                    kind: function_expression
                    stopBy: end
    # tree-sitter-dart represents a direct arrow-body call as a call_expression
    # whose function field contains the enclosing function expression.
    - all:
        - kind: call_expression
        - has:
            field: function
            stopBy: neighbor
            all:
              - regex: '(?s)^.*=>(?:\s|\(|/\*.*?\*/|//[^\n]*(?:\n|$)|await\b)*(?:.*\.)?targetFn(?:\s|/\*.*?\*/|//[^\n]*(?:\n|$))*(?:<.*>)?(?:\s|\)|!)*$'
              - any:
                  - all:
                      - kind: function_expression
                      - not:
                          has:
                            kind: function_expression
                            stopBy: end
                  - all:
                      - any:
                          - kind: member_expression
                          - kind: null_aware_member_expression
                          - kind: instantiation_expression
                          - kind: null_assertion_expression
                      - has:
                          kind: function_expression
                          stopBy: end
    # obj..targetFn(...) and obj?..targetFn(...)
    - all:
        - kind: cascade_call_expression
        - has:
            field: property
            stopBy: neighbor
            regex: '^targetFn$'
```

### Example

```dart {2-7}
void example(Service service, Service? maybeService) {
  targetFn('direct');
  service.targetFn('member');
  maybeService?.targetFn('null-aware');
  service..targetFn('cascade');
  targetFn<int>(1);
  final callback = () => targetFn('arrow body');

  final tearOff = targetFn;
  service.targetFn.toString();
  const text = 'targetFn("not code")';
}
```

For an arrow-body call, the reported match can include the whole closure
because that is the range exposed by the current Dart grammar.

This is a syntax rule, not type resolution. Dart can omit `new` and `const`, so
`Type.targetFn()` can be either a static method call or a named constructor and
is included. Chained cascade sections such as `service..child.targetFn()` and
nested arrow bodies such as `() => () => targetFn()` are outside this rule's
current scope.

### Contributed by
[Vijay Muthukumaran](https://github.com/vijay17muthukumaran-git)
