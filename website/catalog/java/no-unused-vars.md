## No Unused Vars in Java

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmEiLCJxdWVyeSI6ImlmKHRydWUpeyQkJEJPRFl9IiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbm8tdW51c2VkLXZhcnNcbnJ1bGU6XG4gICAga2luZDogbG9jYWxfdmFyaWFibGVfZGVjbGFyYXRpb25cbiAgICBhbGw6XG4gICAgICAgIC0gaGFzOlxuICAgICAgICAgICAgaGFzOlxuICAgICAgICAgICAgICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiAkSURFTlRcbiAgICAgICAgLSBub3Q6XG4gICAgICAgICAgICBwcmVjZWRlczpcbiAgICAgICAgICAgICAgICBzdG9wQnk6IGVuZFxuICAgICAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAgICAgICAgc3RvcEJ5OiBlbmRcbiAgICAgICAgICAgICAgICAgICAgYW55OlxuICAgICAgICAgICAgICAgICAgICAgICAgLSB7IGtpbmQ6IGlkZW50aWZpZXIsIHBhdHRlcm46ICRJREVOVCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAtIHsgaGFzOiB7a2luZDogaWRlbnRpZmllciwgcGF0dGVybjogJElERU5ULCBzdG9wQnk6IGVuZH19XG5maXg6ICcnXG4iLCJzb3VyY2UiOiJTdHJpbmcgdW51c2VkID0gXCJ1bnVzZWRcIjtcbk1hcDxTdHJpbmcsIFN0cmluZz4gZGVjbGFyZWRCdXROb3RJbnN0YW50aWF0ZWQ7XG5cblN0cmluZyB1c2VkMSA9IFwidXNlZFwiO1xuaW50IHVzZWQyID0gMztcbmJvb2xlYW4gdXNlZDMgPSBmYWxzZTtcbmludCB1c2VkNCA9IDQ7XG5TdHJpbmcgdXNlZDUgPSBcIjVcIjtcblxuXG5cbnVzZWQxO1xuU3lzdGVtLm91dC5wcmludGxuKHVzZWQyKTtcbmlmKHVzZWQzKXtcbiAgICBTeXN0ZW0ub3V0LnByaW50bG4oXCJzb21lIHZhcnMgYXJlIHVudXNlZFwiKTtcbiAgICBNYXA8U3RyaW5nLCBTdHJpbmc+IHVudXNlZE1hcCA9IG5ldyBIYXNoTWFwPD4oKSB7e1xuICAgICAgICBwdXQodXNlZDUsIFwidXNlZDVcIik7XG4gICAgfX07XG5cbiAgICAvLyBFdmVuIHRob3VnaCB3ZSBkb24ndCByZWFsbHkgZG8gYW55dGhpbmcgd2l0aCB0aGlzIG1hcCwgc2VwYXJhdGluZyB0aGUgZGVjbGFyYXRpb24gYW5kIGluc3RhbnRpYXRpb24gbWFrZXMgaXQgY291bnQgYXMgYmVpbmcgdXNlZFxuICAgIGRlY2xhcmVkQnV0Tm90SW5zdGFudGlhdGVkID0gbmV3IEhhc2hNYXA8PigpO1xuXG4gICAgcmV0dXJuIHVzZWQ0O1xufSJ9)

### Description

Identifying unused variables is a common task in code refactoring. You should rely on a Java linter or IDE for this task rather than writing a custom rule in ast-grep, but for educational purposes, this rule demonstrates how to find unused variables in Java.

This approach makes some simplifying assumptions. We only consider local variable declarations and ignore the other many ways variables can be declared: Method Parameters, Fields, Class Variables, Constructor Parameters, Loop Variables, Exception Handler Parameters, Lambda Parameters, Annotation Parameters, Enum Constants, and Record Components. Now you may see why it is recommended to use a rule from an established linter or IDE rather than writing your own.

### YAML

```yaml
id: no-unused-vars
rule:
  kind: local_variable_declaration
  all:
    - has:
        has:
          kind: identifier
          pattern: $IDENT
    - not:
        precedes:
          stopBy: end
          has:
            stopBy: end
            any:
              - { kind: identifier, pattern: $IDENT }
              - { has: { kind: identifier, pattern: $IDENT, stopBy: end } }
fix: ""
```

First, we identify the local variable declaration and capture the pattern of the identifier inside of it. Then we use `not` and `precedes` to only match the local variable declaration if the identifier we captured does not appear later in the code.

It is important to note that we use `all` here to force the ordering of the `has` rule to be before the `not` rule. This guarantees that the meta-variable `$IDENT` is captured by looking inside of the local variable declaration.

Additionally, when looking ahead in the code, we can't just look for the identifier directly, but for any node that may contain the identifier.

### Example

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```java
String unused = "unused"; // [!code --]
String used = "used";
System.out.println(used);
```
