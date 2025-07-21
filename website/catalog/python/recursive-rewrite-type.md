## Recursive Rewrite Type <Badge type="tip" text="Has Fix" />


* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicmV3cml0ZXJzOlxyXG4tIGlkOiBvcHRpb25hbFxyXG4gIGxhbmd1YWdlOiBQeXRob25cclxuICBydWxlOlxyXG4gICAgYW55OlxyXG4gICAgLSBwYXR0ZXJuOlxyXG4gICAgICAgIGNvbnRleHQ6ICdhcmc6IE9wdGlvbmFsWyRUWVBFXSdcclxuICAgICAgICBzZWxlY3RvcjogZ2VuZXJpY190eXBlXHJcbiAgICAtIHBhdHRlcm46IE9wdGlvbmFsWyRUWVBFXVxyXG4gIHRyYW5zZm9ybTpcclxuICAgIE5UOlxyXG4gICAgICByZXdyaXRlOiBcclxuICAgICAgICByZXdyaXRlcnM6IFtvcHRpb25hbCwgdW5pb25zXVxyXG4gICAgICAgIHNvdXJjZTogJFRZUEVcclxuICBmaXg6ICROVCB8IE5vbmVcclxuLSBpZDogdW5pb25zXHJcbiAgbGFuZ3VhZ2U6IFB5dGhvblxyXG4gIHJ1bGU6XHJcbiAgICBwYXR0ZXJuOlxyXG4gICAgICBjb250ZXh0OiAnYTogVW5pb25bJCQkVFlQRVNdJ1xyXG4gICAgICBzZWxlY3RvcjogZ2VuZXJpY190eXBlXHJcbiAgdHJhbnNmb3JtOlxyXG4gICAgVU5JT05TOlxyXG4gICAgICByZXdyaXRlOlxyXG4gICAgICAgIHJld3JpdGVyczpcclxuICAgICAgICAgIC0gcmV3cml0ZS11bmlvbnNcclxuICAgICAgICBzb3VyY2U6ICQkJFRZUEVTXHJcbiAgICAgICAgam9pbkJ5OiBcIiB8IFwiXHJcbiAgZml4OiAkVU5JT05TXHJcbi0gaWQ6IHJld3JpdGUtdW5pb25zXHJcbiAgcnVsZTpcclxuICAgIHBhdHRlcm46ICRUWVBFXHJcbiAgICBraW5kOiB0eXBlXHJcbiAgdHJhbnNmb3JtOlxyXG4gICAgTlQ6XHJcbiAgICAgIHJld3JpdGU6IFxyXG4gICAgICAgIHJld3JpdGVyczogW29wdGlvbmFsLCB1bmlvbnNdXHJcbiAgICAgICAgc291cmNlOiAkVFlQRVxyXG4gIGZpeDogJE5UXHJcbnJ1bGU6XHJcbiAga2luZDogdHlwZVxyXG4gIHBhdHRlcm46ICRUUEVcclxudHJhbnNmb3JtOlxyXG4gIE5FV19UWVBFOlxyXG4gICAgcmV3cml0ZTogXHJcbiAgICAgIHJld3JpdGVyczogW29wdGlvbmFsLCB1bmlvbnNdXHJcbiAgICAgIHNvdXJjZTogJFRQRVxyXG5maXg6ICRORVdfVFlQRSIsInNvdXJjZSI6InJlc3VsdHM6ICBPcHRpb25hbFtVbmlvbltMaXN0W1VuaW9uW3N0ciwgZGljdF1dLCBzdHJdXVxuIn0=)

### Description

Suppose we want to transform Python's `Union[T1, T2]` to `T1 | T2` and `Optional[T]` to `T | None`.

By default, ast-grep will only fix the outermost node that matches a pattern and will not rewrite the inner AST nodes inside a match. This avoids unexpected rewriting or infinite rewriting loop.

So if you are using non-recursive rewriter like [this](https://github.com/ast-grep/ast-grep/discussions/1566#discussion-7401382), `Optional[Union[int, str]]` will only be converted to `Union[int, str] | None`. Note the inner `Union[int, str]` is not enabled. This is because the rewriter `optional` matches `Optional[$TYPE]` and rewrite it to `$TYPE | None`. The inner `$TYPE` is not processed.

However, we can apply `rewriters` to inner types recursively. Take the `optional` rewriter as an example, we need to apply rewriters, `optional` and `unions`, **recursively** to `$TYPE` and get a new variable `$NT`.

### YAML
```yml
id: recursive-rewrite-types
language: python
rewriters:
# rewrite Optional[T] to T | None
- id: optional
  rule:
    any:
    - pattern:
        context: 'arg: Optional[$TYPE]'
        selector: generic_type
    - pattern: Optional[$TYPE]
  # recursively apply rewriters to $TYPE
  transform:
    NT:
      rewrite:
        rewriters: [optional, unions]
        source: $TYPE
  # use the new variable $NT
  fix: $NT | None

# similar to Optional, rewrite Union[T1, T2] to T1 | T2
- id: unions
  language: Python
  rule:
    pattern:
      context: 'a: Union[$$$TYPES]'
      selector: generic_type
  transform:
    UNIONS:
      # rewrite all types inside $$$TYPES
      rewrite:
        rewriters: [ rewrite-unions ]
        source: $$$TYPES
        joinBy: " | "
  fix: $UNIONS
- id: rewrite-unions
  rule:
    pattern: $TYPE
    kind: type
  # recursive part
  transform:
    NT:
      rewrite:
        rewriters: [optional, unions]
        source: $TYPE
  fix: $NT

# find all types
rule:
  kind: type
  pattern: $TPE
# apply the recursive rewriters
transform:
  NEW_TYPE:
    rewrite:
      rewriters: [optional, unions]
      source: $TPE
# output
fix: $NEW_TYPE
```


### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```python
results:  Optional[Union[List[Union[str, dict]], str]]
```

### Diff
<!-- use # [!code --] and # [!code ++] to annotate diff -->
```python
results:  Optional[Union[List[Union[str, dict]], str]] # [!code --]
results:  List[str | dict] | str | None #[!code ++]
```

### Contributed by
Inspired by [steinuil](https://github.com/ast-grep/ast-grep/discussions/1566)
