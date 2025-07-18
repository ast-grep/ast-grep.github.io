## Remove `async` function <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiYXdhaXQgJCQkQ0FMTCIsInJld3JpdGUiOiIkJCRDQUxMICIsImNvbmZpZyI6ImlkOiByZW1vdmUtYXN5bmMtZGVmXG5sYW5ndWFnZTogcHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOlxuICAgIGNvbnRleHQ6ICdhc3luYyBkZWYgJEZVTkMoJCQkQVJHUyk6ICQkJEJPRFknXG4gICAgc2VsZWN0b3I6IGZ1bmN0aW9uX2RlZmluaXRpb25cbnRyYW5zZm9ybTpcbiAgUkVNT1ZFRF9CT0RZOlxuICAgIHJld3JpdGU6XG4gICAgICByZXdyaXRlcnM6IFtyZW1vdmUtYXdhaXQtY2FsbF1cbiAgICAgIHNvdXJjZTogJCQkQk9EWVxuZml4OiB8LVxuICBkZWYgJEZVTkMoJCQkQVJHUyk6XG4gICAgJFJFTU9WRURfQk9EWVxucmV3cml0ZXJzOlxuLSBpZDogcmVtb3ZlLWF3YWl0LWNhbGxcbiAgcnVsZTpcbiAgICBwYXR0ZXJuOiAnYXdhaXQgJCQkQ0FMTCdcbiAgZml4OiAkJCRDQUxMXG4iLCJzb3VyY2UiOiJhc3luYyBkZWYgbWFpbjMoKTpcbiAgYXdhaXQgc29tZWNhbGwoMSwgNSkifQ==)

### Description

The `async` keyword in Python is used to define asynchronous functions that can be `await`ed.

In this example, we want to remove the `async` keyword from a function definition and replace it with a synchronous version of the function. We also need to remove the `await` keyword from the function body.

By default, ast-grep will not apply overlapping replacements. This means `await` keywords will not be modified because they are inside the async function body.

However, we can use the [`rewriter`](https://ast-grep.github.io/reference/yaml/rewriter.html) to apply changes inside the matched function body.

### YAML

```yaml
id: remove-async-def
language: python
rule:
  # match async function definition
  pattern:
    context: "async def $FUNC($$$ARGS): $$$BODY"
    selector: function_definition
rewriters:
  # define a rewriter to remove the await keyword
  remove-await-call:
    pattern: "await $$$CALL"
    fix: $$$CALL # remove await keyword
# apply the rewriter to the function body
transform:
  REMOVED_BODY:
    rewrite:
      rewriters: [remove-await-call]
      source: $$$BODY
fix: |-
  def $FUNC($$$ARGS):
    $REMOVED_BODY
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```python
async def main3():
  await somecall(1, 5)
```

### Diff

<!-- use # [!code --] and # [!code ++] to annotate diff -->

```python
async def main3(): # [!code --]
  await somecall(1, 5) # [!code --]
def main3(): # [!code ++]
  somecall(1, 5) # [!code ++]
```

### Contributed by

Inspired by the ast-grep issue [#1185](https://github.com/ast-grep/ast-grep/issues/1185)
