## Match Function Call in C

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImMiLCJxdWVyeSI6InRlc3QoJCQkKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAkTSgkJCQpO1xuICAgIHNlbGVjdG9yOiBjYWxsX2V4cHJlc3Npb24iLCJzb3VyY2UiOiIjZGVmaW5lIHRlc3QoeCkgKDIqeClcbmludCBhID0gdGVzdCgyKTtcbmludCBtYWluKCl7XG4gICAgaW50IGIgPSB0ZXN0KDIpO1xufSJ9)

### Description

One of the common questions of ast-grep is to match function calls in C.

A plain pattern like `test($A)` will not work. This is because [tree-sitter-c](https://github.com/tree-sitter/tree-sitter-c)
parse the code snippet into `macro_type_specifier`, see the [pattern output](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiYyIsInF1ZXJ5IjoidGVzdCgkJCQpIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46IFxuICAgIGNvbnRleHQ6ICRNKCQkJCk7XG4gICAgc2VsZWN0b3I6IGNhbGxfZXhwcmVzc2lvbiIsInNvdXJjZSI6IiNkZWZpbmUgdGVzdCh4KSAoMip4KVxuaW50IGEgPSB0ZXN0KDIpO1xuaW50IG1haW4oKXtcbiAgICBpbnQgYiA9IHRlc3QoMik7XG59In0=).

To avoid this ambiguity, ast-grep lets us write a [contextual pattern](/guide/rule-config/atomic-rule.html#pattern), which is a pattern inside a larger code snippet.
We can use `context` to write a pattern like this: `test($A);`. Then, we can use the selector `call_expression` to match only function calls.

### YAML

```yaml
id: match-function-call
language: c
rule:
  pattern:
    context: $M($$$);
    selector: call_expression
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```c{2,4}
#define test(x) (2*x)
int a = test(2);
int main(){
    int b = test(2);
}
```

### Caveat

Note, tree-sitter-c parses code differently when it receives code fragment. For example,

- `test(a)` is parsed as `macro_type_specifier`
- `test(a);` is parsed as `expression_statement -> call_expression`
- `int b = test(a)` is parsed as `declaration -> init_declarator -> call_expression`

The behavior is controlled by how the tree-sitter parser is written. And tree-sitter-c behaves differently from [tree-sitter-cpp](https://github.com/tree-sitter/tree-sitter-cpp).

Please file issues on tree-sitter-c repo if you want to change the behavior. ast-grep will respect changes and decision from upstream authors.
