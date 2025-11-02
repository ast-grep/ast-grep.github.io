## Rewrite SQLAlchemy with Type Annotations <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiYShudWxsYWJsZT1UcnVlKSIsInJld3JpdGUiOiIxMjMiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6ImtleXdvcmRfYXJndW1lbnQiLCJjb25maWciOiJpZDogcmVtb3ZlLW51bGxhYmxlLWFyZ1xubGFuZ3VhZ2U6IHB5dGhvblxucnVsZTpcbiAgcGF0dGVybjogJFggPSBtYXBwZWRfY29sdW1uKCQkJEFSR1MpXG4gIGFueTpcbiAgICAtIHBhdHRlcm46ICRYID0gbWFwcGVkX2NvbHVtbigkJCRCRUZPUkUsIFN0cmluZywgJCQkTUlELCBudWxsYWJsZT1UcnVlLCAkJCRBRlRFUilcbiAgICAtIHBhdHRlcm46ICRYID0gbWFwcGVkX2NvbHVtbigkJCRCRUZPUkUsIFN0cmluZywgJCQkTUlELCBudWxsYWJsZT1UcnVlKVxucmV3cml0ZXJzOlxuLSBpZDogZmlsdGVyLXN0cmluZy1udWxsYWJsZVxuICBydWxlOlxuICAgIHBhdHRlcm46ICRBUkdcbiAgICBpbnNpZGU6XG4gICAgICBraW5kOiBhcmd1bWVudF9saXN0XG4gICAgYWxsOlxuICAgIC0gbm90OiBcbiAgICAgICAgcGF0dGVybjogU3RyaW5nXG4gICAgLSBub3Q6XG4gICAgICAgIHBhdHRlcm46XG4gICAgICAgICAgY29udGV4dDogYShudWxsYWJsZT1UcnVlKVxuICAgICAgICAgIHNlbGVjdG9yOiBrZXl3b3JkX2FyZ3VtZW50XG4gIGZpeDogJEFSR1xuXG50cmFuc2Zvcm06XG4gIE5FV0FSR1M6XG4gICAgcmV3cml0ZTpcbiAgICAgIHJld3JpdGVyczogW2ZpbHRlci1zdHJpbmctbnVsbGFibGVdXG4gICAgICBzb3VyY2U6ICQkJEFSR1NcbiAgICAgIGpvaW5CeTogJywgJ1xuZml4OiB8LVxuICAkWDogTWFwcGVkW3N0ciB8IE5vbmVdID0gbWFwcGVkX2NvbHVtbigkTkVXQVJHUykiLCJzb3VyY2UiOiJtZXNzYWdlID0gbWFwcGVkX2NvbHVtbihTdHJpbmcsIGRlZmF1bHQ9XCJoZWxsb1wiLCBudWxsYWJsZT1UcnVlKVxuXG5tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihTdHJpbmcsIG51bGxhYmxlPVRydWUpXG5cbl9tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihcIm1lc3NhZ2VcIiwgU3RyaW5nLCBudWxsYWJsZT1UcnVlKVxuXG5tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihTdHJpbmcsIG51bGxhYmxlPVRydWUsIHVuaXF1ZT1UcnVlKVxuXG5tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihcbiAgU3RyaW5nLCBpbmRleD1UcnVlLCBudWxsYWJsZT1UcnVlLCB1bmlxdWU9VHJ1ZSlcblxuIyBTaG91bGQgbm90IGJlIHRyYW5zZm9ybWVkXG5tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihTdHJpbmcsIGRlZmF1bHQ9XCJoZWxsb1wiKVxuXG5tZXNzYWdlID0gbWFwcGVkX2NvbHVtbihTdHJpbmcsIGRlZmF1bHQ9XCJoZWxsb1wiLCBudWxsYWJsZT1GYWxzZSlcblxubWVzc2FnZSA9IG1hcHBlZF9jb2x1bW4oSW50ZWdlciwgZGVmYXVsdD1cImhlbGxvXCIpIn0=)

### Description

[SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html) recommends using type annotations with `Mapped` type for modern declarative mapping. The `mapped_column()` construct can derive its configuration from [PEP 484](https://peps.python.org/pep-0484/) type annotations.

This rule helps migrate legacy SQLAlchemy code that explicitly uses `String` type and `nullable=True` to the modern type annotation approach using `Mapped[str | None]`.

The key technique demonstrated here is using **rewriters** to selectively filter arguments. The rewriter:
1. Matches each argument inside the `argument_list`
2. Excludes the `String` type argument
3. Excludes the `nullable=True` keyword argument
4. Keeps all other arguments

### YAML
```yaml
id: remove-nullable-arg
language: python
rule:
  pattern: $X = mapped_column($$$ARGS)
  any:
    - pattern: $X = mapped_column($$$BEFORE, String, $$$MID, nullable=True, $$$AFTER)
    - pattern: $X = mapped_column($$$BEFORE, String, $$$MID, nullable=True)
rewriters:
- id: filter-string-nullable
  rule:
    pattern: $ARG
    inside:
      kind: argument_list
    all:
    - not:
        pattern: String
    - not:
        pattern:
          context: a(nullable=True)
          selector: keyword_argument
  fix: $ARG

transform:
  NEWARGS:
    rewrite:
      rewriters: [filter-string-nullable]
      source: $$$ARGS
      joinBy: ', '
fix: |-
  $X: Mapped[str | None] = mapped_column($NEWARGS)
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```python {1,3,5,7-8}
message = mapped_column(String, default="hello", nullable=True)

message = mapped_column(String, nullable=True)

_message = mapped_column("message", String, nullable=True)

message = mapped_column(String, nullable=True, unique=True)

message = mapped_column(
  String, index=True, nullable=True, unique=True)

# Should not be transformed
message = mapped_column(String, default="hello")

message = mapped_column(String, default="hello", nullable=False)

message = mapped_column(Integer, default="hello")
```

### Diff
<!-- use # [!code --] and # [!code ++] to annotate diff -->
```python
message = mapped_column(String, default="hello", nullable=True) # [!code --]
message: Mapped[str | None] = mapped_column(default="hello") # [!code ++]

message = mapped_column(String, nullable=True) # [!code --]
message: Mapped[str | None] = mapped_column() # [!code ++]

_message = mapped_column("message", String, nullable=True) # [!code --]
_message: Mapped[str | None] = mapped_column("message") # [!code ++]

message = mapped_column(String, nullable=True, unique=True) # [!code --]
message: Mapped[str | None] = mapped_column(unique=True) # [!code ++]

message = mapped_column( # [!code --]
  String, index=True, nullable=True, unique=True) # [!code --]
message: Mapped[str | None] = mapped_column( # [!code ++]
  index=True, unique=True) # [!code ++]
```

### Contributed by
Inspired by [discussion #2319](https://github.com/ast-grep/ast-grep/discussions/2319)
