## Rewrite `Optional[Type]` to `Type | None` <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzaWduYXR1cmUiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46IFxuICAgIGNvbnRleHQ6ICdhOiBPcHRpb25hbFskVF0nXG4gICAgc2VsZWN0b3I6IGdlbmVyaWNfdHlwZVxuZml4OiAkVCB8IE5vbmUiLCJzb3VyY2UiOiJkZWYgYShhcmc6IE9wdGlvbmFsW0ludF0pOiBwYXNzIn0=)

### Description

[PEP 604](https://peps.python.org/pep-0604/) recommends that `Type | None` is preferred over `Optional[Type]` for Python 3.10+.

This rule performs such rewriting. Note `Optional[$T]` alone is interpreted as subscripting expression instead of generic type, we need to use [pattern object](/guide/rule-config/atomic-rule.html#pattern-object) to disambiguate it with more context code.

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: optional-to-none-union
language: python
rule:
  pattern:
    context: "a: Optional[$T]"
    selector: generic_type
fix: $T | None
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```py {1}
def a(arg: Optional[int]): pass
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```py
def a(arg: Optional[int]): pass # [!code --]
def a(arg: int | None): pass # [!code ++]
```

### Contributed by

[Bede Carroll](https://github.com/ast-grep/ast-grep/discussions/1492)
