# Rewrite Code

One of the powers of ast-grep is that it can not only find code patterns, but also transform them into new code.

For example, you may want to rename a variable, change a function call, or add a comment. ast-grep provides two ways to do this: using the `--rewrite` flag or using the `fix` key in YAML rules.

## Using `ast-grep run -p 'pat' --rewrite`

The simplest way to rewrite code is to use the `--rewrite` flag with the `ast-grep run` command. This flag takes a string argument that specifies the new code to replace the matched pattern.
For example, if you want to change all occurrences of identifier `foo` to `bar`, you can run:

```bash
ast-grep run --pattern 'foo' --rewrite 'bar' --lang python
```

This will show you a diff of the changes that will be made. If you are using interactive mode by the `--interactive` flag, ast-grep ask you if you want to apply them.

:::tip
You can also use the `--update-all` or `-U` flag to automatically accept the changes without confirmation.
:::

## Using `fix` in YAML Rule

Another way to rewrite code is to use the `fix` option in a YAML rule file. This option allows you to specify more complex and flexible rewrite rules, such as using transformations and regular expressions.

Let's look at a simple example of using `fix` in a YAML rule ([playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmIGZvbygkWCk6XG4gICRTIiwicmV3cml0ZSI6ImxvZ2dlci5sb2coJE1BVENIKSIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiaWQ6IGNoYW5nZV9uYW1lXG5sYW5ndWFnZTogUHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOiB8XG4gICAgZGVmIGZvbygkWCk6XG4gICAgICAkJCRTXG5maXg6IHwtXG4gIGRlZiBiYXooJFgpOlxuICAgICQkJFNcbi0tLVxuaWQ6IGNoYW5nZV9wYXJhbVxucnVsZTpcbiAgcGF0dGVybjogZm9vKCRYKVxuZml4OiBiYXooJFgpIiwic291cmNlIjoiZGVmIGZvbyh4KTpcbiAgICByZXR1cm4geCArIDFcblxueSA9IGZvbygyKVxucHJpbnQoeSkifQ==)).
Suppose we have a Python file named `test.py` with the following content:

```python
def foo(x):
    return x + 1

y = foo(2)
print(y)
```

We want to only change the name of the function `foo` to `baz`, but not variable/method/class. We can write a YAML rule file named `change_func.yml` with the following content:

```yaml{7-9,16}
id: change_def
language: Python
rule:
  pattern: |
    def foo($X):
      $$$S
fix: |-
  def baz($X):
    $$$S

--- # this is YAML doc separator to have multiple rules in one file

id: change_param
rule:
  pattern: foo($X)
fix: baz($X)
```

The first rule matches the definition of the function `foo`, and replaces it with `baz`. The second rule matches the calls of the function `foo`, and replaces them with `baz`. Note that we use `$X` and `$$$S` as [meta](/guide/pattern-syntax.html#meta-variable) [variables](/guide/pattern-syntax.html#multi-meta-variable), which can match any expression and any statement, respectively. We can run:

```bash
ast-grep scan -r change_func.yml test.py
```

This will show us the following diff:

```python
def foo(x): # [!code --]
def baz(x): # [!code ++]
    return x + 1

y = foo(2) # [!code --]
y = baz(2) # [!code ++]
print(y)
```

We can see that the function name and parameter name are changed as we expected.

:::tip Pro Tip
You can have multiple rules in one YAML file by using the YAML document separator `---`.
This allows you to group related rules together!
:::

## Use Meta Variable in Rewrite

As we saw in the previous example, we can use [meta variables](/guide/pattern-syntax.html#meta-variable-capturing) in both the pattern and the fix parts of a YAML rule. They are like regular expression [capture groups](https://regexone.com/lesson/capturing_groups). Meta variables are identifiers that start with `$`, and they can match any syntactic element in the code, such as expressions, statements, types, etc. When we use a meta variable in the fix part of a rule, it will be replaced by whatever it matched in the pattern part.

For example, if we have a [rule](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmIGZvbygkWCk6XG4gICRTIiwicmV3cml0ZSI6ImxvZ2dlci5sb2coJE1BVENIKSIsImNvbmZpZyI6ImlkOiBzd2FwXG5sYW5ndWFnZTogUHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOiAkWCA9ICRZXG5maXg6ICRZID0gJFgiLCJzb3VyY2UiOiJhID0gYlxuYyA9IGQgKyBlXG5mID0gZyAqIGgifQ==) like this:

```yaml
id: swap
language: Python
rule:
  pattern: $X = $Y
fix: $Y = $X
```

This rule will swap the left-hand side and right-hand side of any assignment statement. For example, if we have a code like this:

```python
a = b
c = d + e
f = g * h
```

The rule will rewrite it as:

```python
b = a
d + e = c
g * h = f
```

[Playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmIGZvbygkWCk6XG4gICRTIiwicmV3cml0ZSI6ImxvZ2dlci5sb2coJE1BVENIKSIsImNvbmZpZyI6ImlkOiBzd2FwXG5sYW5ndWFnZTogUHl0aG9uXG5ydWxlOlxuICBwYXR0ZXJuOiAkWCA9ICRZXG5maXg6ICRZID0gJFgiLCJzb3VyY2UiOiJhID0gYlxuYyA9IGQgKyBlXG5mID0gZyAqIGgifQ==)

Note that this may **not** be a valid or sensible code transformation, but it illustrates how meta variables work.

:::warning Append Uppercase String to Meta Variable
It will not work if you want to append a string starting with uppercase letters to a meta variable because it will be parsed as an undefined meta variable.
:::

Suppose we want to append `Name` to the meta variable `$VAR`, the fix string `$VARName` will be parsed as `$VARN` + `ame` instead. You can instead use [replace transformation](/guide/rewrite/transform.html#rewrite-with-regex-capture-groups) to create a new variable whose content is `$VAR` plus `Name`.

:::danger Non-matched meta-variable
non-matched meta-variable will be replaced by empty string in the `fix`.
:::

### Rewrite is Indentation Sensitive

ast-grep's rewrite is indentation sensitive. That is, the indentation level of a meta-variable in the fix string is preserved in the rewritten code.

For example, if we have a rule like this:

```yaml
id: lambda-to-def
language: Python
rule:
  pattern: "$B = lambda: $R"
fix: |-
  def $B():
    return $R
```

This rule will convert a lambda function to a standard `def` function. For example, if we have a code like this:

```python
b = lambda: 123
```

The rule will rewrite it as:

```python
def b():
  return 123
```

Note that the indentation level of `return $R` is preserved as two spaces in the rewritten code, even if the replacement `123` in the original code does not have indentation at all.

`fix` string's indentation is preserved relative to their position in the source code. For example, if the `lambda` appears within `if` statement, the diff will be like:

```python
if True:
    c = lambda: 456 # [!code --]
    def c():     # [!code ++]
      return 456 # [!code ++]
```

Note that the `return 456` line has an indentation of four spaces.
This is because it has two spaces indentation as a part of the fix string, and two additional spaces because the fix string as a whole is inside the `if` statement in the original code.

## Expand the Matching Range

**ast-grep rule can only fix one target node at one time by replacing the target node text with a new string.**

Using `fix` string alone is not enough to handle complex cases where we need to delete surrounding nodes like a comma, or to change surrounding brackets. We may leave redundant text in the fixed code because we cannot delete the surrounding trivials around the matched node.

To accommodate these scenarios, ast-grep's `fix` also accepts an advanced object configuration that specifies how to fix the matched AST node: `FixConfig`. It allows you to expand the matched AST node range via two additional rules.

It has one required field `template` and two optional fields `expandStart` and `expandEnd`.

`template` is the same as the string fix. Both `expandStart` and `expandEnd` accept a [rule](/guide/rule-config.html) object to specify the expansion.

`expandStart` will expand the fixing range's start until the rule is not met, while `expandEnd` will expand the fixing range's end until the rule is not met.

### Example of deleting a key-value pair in a JavaScript object

Suppose we have a JavaScript object like this:

```JavaScript
const obj = {
  Remove: 'value1',
}
const obj2 = {
  Remove: 'value1',
  Kept: 'value2',
}
```

We want to remove the key-value pair with the key `Remove` completely. Just removing the `pair` AST node is [not enough](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IkVSUk9SIiwiY29uZmlnIjoicnVsZTpcbiAga2luZDogcGFpclxuICBoYXM6XG4gICAgZmllbGQ6IGtleVxuICAgIHJlZ2V4OiBSZW1vdmVcbmZpeDogJyciLCJzb3VyY2UiOiJjb25zdCBvYmogPSB7XG4gIFJlbW92ZTogJ3ZhbHVlMSdcbn1cbmNvbnN0IG9iajIgPSB7XG4gIFJlbW92ZTogJ3ZhbHVlMScsXG4gIEtlcHQ6ICd2YWx1ZTInLFxufVxuIn0=) in `obj2` because we also need to remove the trailing comma.

We can write [a rule in playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IkVSUk9SIiwiY29uZmlnIjoibGFuZ3VhZ2U6IGphdmFzY3JpcHRcbnJ1bGU6XG4gIGtpbmQ6IHBhaXJcbiAgaGFzOlxuICAgIGZpZWxkOiBrZXlcbiAgICByZWdleDogUmVtb3ZlXG4jIHJlbW92ZSB0aGUga2V5LXZhbHVlIHBhaXIgYW5kIGl0cyBjb21tYVxuZml4OlxuICB0ZW1wbGF0ZTogJydcbiAgZXhwYW5kRW5kOiB7IHJlZ2V4OiAnLCcgfSAjIGV4cGFuZCB0aGUgcmFuZ2UgdG8gdGhlIGNvbW1hXG4iLCJzb3VyY2UiOiJjb25zdCBvYmogPSB7XG4gIFJlbW92ZTogJ3ZhbHVlMSdcbn1cbmNvbnN0IG9iajIgPSB7XG4gIFJlbW92ZTogJ3ZhbHVlMScsXG4gIEtlcHQ6ICd2YWx1ZTInLFxufVxuIn0=) like this:

```yaml
language: javascript
rule:
  kind: pair
  has:
    field: key
    regex: Remove
# remove the key-value pair and its comma
fix:
  template: ""
  expandEnd: { regex: "," } # expand the range to the comma
```

The idea is to remove the `pair` node and expand the fixing range to the comma. The `template` is an empty string, which means we will remove the matched node completely. The `expandEnd` rule will expand the fixing range to the comma. So the eventual matched range will be `Remove: 'value1',`, comma included.

## More Advanced Rewrite

The examples above illustrate the basic usage of rewriting code with ast-grep.

ast-grep also provides more advanced features for rewriting code, such as using [transformations](/guide/rewrite/transform.html) and [rewriter rules](/guide/rewrite/rewriter.html).

These features allow you to change the matched code to desired code, like replace string using regex, slice the string, or convert the case of the string.

We will cover these advanced features in more detail in the transform doc page.

## See More in Example Catalog

If you want to see more examples of using ast-grep to rewrite code, you can check out our [example catalog](/catalog/). There you can find various use cases and scenarios where ast-grep can help you refactor and improve your code. You can also contribute your own examples and share them with other users.
