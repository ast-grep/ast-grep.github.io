# Rewrite Code

One of the powers of ast-grep is that it can not only find code patterns, but also transform them into new code.

For example, you may want to rename a variable, change a function call, or add a comment. ast-grep provides two ways to do this: using the `--rewrite` flag or using the `fix` key in YAML rules.

## Using `sg run -p 'pat' --rewrite`

The simplest way to rewrite code is to use the `--rewrite` flag with the `sg run` command. This flag takes a string argument that specifies the new code to replace the matched pattern.
For example, if you want to change all occurrences of identifier `foo` to `bar`, you can run:

```bash
sg run --pattern 'foo' --rewrite 'bar' --lang python
```

This will show you a diff of the changes that will be made. If you are using interactive mode by the `--interactive` flag, ast-grep ask you if you want to apply them.

:::tip
You can also use the `--update-all` or `-U` flag to automatically accept the changes without confirmation.
:::

## Using `fix` in YAML Rule

Another way to rewrite code is to use the `fix` option in a YAML rule file. This option allows you to specify more complex and flexible rewrite rules, such as using transformations and regular expressions.

Let's look at a simple example of using `fix` in a YAML rule ([playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmIGZvbygkWCk6XG4gICRTIiwicmV3cml0ZSI6ImxvZ2dlci5sb2coJE1BVENIKSIsImNvbmZpZyI6ImlkOiBjaGFuZ2VfbmFtZVxubGFuZ3VhZ2U6IFB5dGhvblxucnVsZTpcbiAgcGF0dGVybjogfFxuICAgIGRlZiBmb28oJFgpOlxuICAgICAgJCQkU1xuZml4OiB8LVxuICBkZWYgYmF6KCRYKTpcbiAgICAkJCRTXG4tLS1cbmlkOiBjaGFuZ2VfcGFyYW1cbnJ1bGU6XG4gIHBhdHRlcm46IGZvbygkWClcbmZpeDogYmF6KG4pIiwic291cmNlIjoiZGVmIGZvbyh4KTpcbiAgICByZXR1cm4geCArIDFcblxueSA9IGZvbygyKVxucHJpbnQoeSkifQ==)).
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
sg scan -r change_func.yml test.py
```

This will show us the following diff:

```python
def foo(x): # [!code --]
def baz(n): # [!code ++]
    return n + 1

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

:::warning
non-matched meta-variable will be replaced by empty string in the `fix`.
:::

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

### Rewrite is Indentation Sensitive

ast-grep's rewrite is indentation sensitive. That is, the indentation level of a meta-variable in the fix string is preserved in the rewritten code.

For example, if we have a rule like this:

```yaml
id: lambda-to-def
language: Python
rule:
  pattern: '$B = lambda: $R'
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


## Use `transform` in Rewrite

Sometimes, we may want to apply some transformations to the meta variables in the fix part of a YAML rule. For example, we may want to change the case, add or remove prefixes or suffixes. ast-grep provides a `transform` key that allows us to specify such transformations.

`transform` accepts a **dictionary** of which:
* the _key_ is the **new variable name** to be introduced and
* the _value_ is a **transformation object** that specifies which meta-variable is transformed and how.

A transformation object has a key indicating which string operation will be performed on the meta variable, and the value of that key is another object (usually with the source key). Different string operation keys expect different object values.

[Converting generator expression](https://github.com/ast-grep/ast-grep/discussions/430) to list comprehension in Python is a good example to illustrate `transform`.

More concretely, we want to achieve diffs like below:

```python
"".join(i for i in iterable) # [!code --]
"".join([i for i in iterable]) # [!code ++]
```

This rule will convert the generator inside `join` to a list.

```yaml{5-11}
id: convert_generator
rule:
  kind: generator_expression
  pattern: $GEN
transform:            # 1. the transform option
  LIST:               # 2. New variable name
    substring:        # 3. the transform operation name
      source: $GEN    # 4.1 transformation source
      startChar: 1    # 4.2 transformation argument
      endChar: -1
fix: '([$LIST])'      # 5. use the new variable in fix
```

Let's discuss the API step by step:

1. The `transform` key is used to define one or more transformations that we want to apply to the meta variables in the pattern part of the rule.
2. The `LIST` key is the new variable name that we can use in `fix` or later transformation. We can choose any name as long as it does not conflict with any existing meta variable names. **Note, the new variable name does not start with `$`.**
3. The `substring` key is the transform operation name that we want to use. This operation will extract a substring from the source string based on the given start and end characters.
4. `substring` accepts an object
    1. The `source` key specifies which meta variable we want to transform. **It should have `$` prefix.** In this case, it is `$GEN` that which matches the generator expression in the code.
    2. The `startChar` and `endChar` keys specify the indices of the start and end characters of the substring that we want to extract. In this case, we want to extract everything except the wrapping parentheses, which are the first and last characters: `(` and `)`.
5. The `fix` key specifies the new code that we want to replace the matched pattern with. We use the new variable `$LIST` in the fix part, and wrap it with `[` and `]` to make it a list comprehension.

## Supported `transformation`
We have several different transformations available now. Please check out [transformation reference](/reference/yaml/transformation.html) for more details.

* `replace`: Use a regular expression to replace the text in a meta-variable with a new text.
* `substring`: Create a new string by cutting off leading and trailing characters.
* `convert`: Change the string case of a meta-variable, such as from `camelCase` to `underscore_case`.

## Add conditional text

Occasionally we may want to add extra text, such as punctuations and newlines, to our fixer string. But whether we should add the new text depends on the presence of absence of other syntax nodes.

A typical scenario is adding a comma between two arguments or list items. We only want to add a comma when the item we are adding is not the last one in the argument list.

We can use `replace` transformation to create a new meta-variable that only contains text when another meta-variable matches something.

For example, suppose we want to add a new argument to existing function call. We need to add a comma `,` after the new argument only when the existing call already has some arguments.


```yaml
id: add-leading-argument
language: python
rule:
  pattern: $FUNC($$$ARGS)
transform:
  MAYBE_COMMA:
    replace:
      source: $$$ARGS
      replace: '^.+'
      by: ', '
fix:
  $FUNC(new_argument$MAYBE_COMMA$$$ARGS)
```

In the above example, if `$$$ARGS` matches nothing, it will be an empty string and the `replace` transformation will take no effect. The final fix string will be instantiated to `$FUNC(new_argument)`.

If `$$$ARGS` does match nodes, then the replacement regular expression will replace the text with `,`, so the final fix string will be
`$FUNC(new_argument, $$$ARGS)`


:::tip DasSurma Trick
This method is invented by [Surma](https://surma.dev/) in a [tweet](https://twitter.com/DasSurma/status/1706086320051794217), so the useful trick is named after him.
:::

## Rewrite with Regex Capture Groups
The `replace` transformation allows us to use Rust regex capture groups like `(?<NAME>.*)` to capture meta-variables and reference them in the `by` field.  For example, to replace `debug` with `release` in a function name, we can use the following transformation:

```yaml
id: debug-to-release
language: js
rule: {pattern: $OLD_FN($$$ARGS)}   # Capture OLD_FN
constraints: {FN: {regex: ^debug}}  # Only match if it starts with 'debug'
transform:
  NEW_FN:
    replace:
      source: $OLD_FN
      replace: debug(?<REG>.*)      # Capture everything following 'debug' as REG
      by: release$REG               # Refer to REG just like a meta-variable
fix: $NEW_FN($$$ARGS)
```
which will result in the following change:
```js
debugFoo(arg1, arg2)  // [!code --]
releaseFoo(arg1, arg2)  // [!code ++]
```
Alternatively, replacing `fooDebug` with `fooRelease`, is difficult because you can't concatenate a meta-variable with a capitalized string literal. `release$REG` is fine, but `$REGRelease` will be interpreted as a single meta-variable and not a concatenation. One workaround is to use multiple sequential transformations, as shown below.

:::warning Limitation
You can only extract regex capture groups in the `replace` field of the `replace` transformation and you can only reference them in the `by` field of the same transformation. The regular `regex` rule does not support capture groups.
:::

##  Multiple Sequential Transformations

Each transformation outputs a meta-variable that can be used as the input to later transformations. Chaining transformations like this allows us to build up complex behaviors.

Here we can see an example that transforms `fooDebug` into `fooRelease` by using `convert`, `replace`, and `convert` transformations.

```yaml
rule: {pattern: $OLD_FN($$$ARGS)}      # Capture OLD_FN
constraints: {OLD_FN: {regex: Debug$}} # Only match if it ends with 'Debug'
transform:
  KEBABED:                             # 1. Convert to 'foo-debug'
    convert:
      source: $OLD_FN
      toCase: kebabCase
  RELEASED:                            # 2. Replace with 'foo-release'
    replace:
      source: $KEBABED
      replace: (?<ROOT>)-debug
      by: $ROOT-release
  UNKEBABED:                           # 3. Convert to 'fooRelease'
    convert:
      source: $RELEASED
      toCase: camelCase
fix: $UNKEBABED($$$ARGS)
```

## See More in Example Catalog

If you want to see more examples of using ast-grep to rewrite code, you can check out our [example catalog](/catalog/). There you can find various use cases and scenarios where ast-grep can help you refactor and improve your code. You can also contribute your own examples and share them with other users.