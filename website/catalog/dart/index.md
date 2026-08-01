# Dart

This page curates example ast-grep rules for Dart code.

## Why does a Dart call pattern return no matches?

Dart does not allow expressions at the top level. As a result, a standalone
pattern such as `debugPrint($$$ARGS)` can be parsed as a `function_signature`
instead of a `call_expression`. You can confirm the parsed node with
[`--debug-query`](/reference/cli/run#debug-query-format):

```sh
ast-grep run -p 'debugPrint($$$ARGS)' -l dart --debug-query=pattern
```

For a direct call whose callee is an identifier, provide a valid enclosing
function and select the call expression to remove the ambiguity:

```sh
ast-grep run \
  -p 'void _() { debugPrint($$$ARGS); }' \
  --selector call_expression \
  -l dart
```

The equivalent YAML rule uses a [pattern object](/guide/rule-config/atomic-rule#pattern-object):

```yaml
id: find-direct-debug-print
language: dart
rule:
  pattern:
    context: 'void _() { debugPrint($$$ARGS); }'
    selector: call_expression
```

This example intentionally matches only direct `debugPrint(...)` calls. For a
copy-ready rule that also covers member, null-aware, generic, parenthesized,
null-asserted, common single-level arrow-body, and direct cascade calls, see
[Find Dart Calls by Callee Name](#find-dart-calls-by-callee-name). That catalog
entry includes an exact CLI command, a live Dart playground, and the rule's
tested boundaries.

<!--@include: ./find-calls-by-callee-name.md-->
