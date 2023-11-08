<!-- Remove Badge if it does not have fix-->
## Rewrite Method to Function Call <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImMiLCJxdWVyeSI6IiRDT1VOVCA9ICRcbiIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogbWV0aG9kX3JlY2VpdmVyXG5ydWxlOlxuICBwYXR0ZXJuOiAkUi4kTUVUSE9EKCQkJEFSR1MpXG50cmFuc2Zvcm06XG4gIE1BWUJFX0NPTU1BOlxuICAgIHJlcGxhY2U6XG4gICAgICBzb3VyY2U6ICQkJEFSR1NcbiAgICAgIHJlcGxhY2U6ICdeLisnXG4gICAgICBieTogJywgJ1xuZml4OlxuICAkTUVUSE9EKCYkUiRNQVlCRV9DT01NQSQkJEFSR1MpXG4iLCJzb3VyY2UiOiJ2b2lkIHRlc3RfZnVuYygpIHtcbiAgICBzb21lX3N0cnVjdC0+ZmllbGQubWV0aG9kKCk7XG4gICAgc29tZV9zdHJ1Y3QtPmZpZWxkLm90aGVyX21ldGhvZCgxLCAyLCAzKTtcbn0ifQ==)

### Description
In C, there is no built-in support for object-oriented programming, but some programmers use structs and function pointers to simulate classes and methods. However, this style can have some drawbacks, such as:

* extra memory allocation and deallocation for the struct and the function pointer.
* indirection overhead when calling the function pointer.

A possible alternative is to use a plain function call with the struct pointer as the first argument.

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
id: method_receiver
rule:
  pattern: $R.$METHOD($$$ARGS)
transform:
  MAYBE_COMMA:
    replace:
      source: $$$ARGS
      replace: '^.+'
      by: ', '
fix:
  $METHOD(&$R$MAYBE_COMMA$$$ARGS)
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```c {2-3}
void test_func() {
    some_struct->field.method();
    some_struct->field.other_method(1, 2, 3);
}
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```c
void test_func() {
    some_struct->field.method(); // [!code --]
    method(&some_struct->field); // [!code ++]
    some_struct->field.other_method(1, 2, 3); // [!code --]
    other_method(&some_struct->field, 1, 2, 3); // [!code ++]
}
```

### Contributed by
[Surma](https://twitter.com/DasSurma), adapted from the [original tweet](https://twitter.com/DasSurma/status/1706086320051794217)