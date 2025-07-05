# `transform` Code in Rewrite

Sometimes, we may want to apply some transformations to the meta variables in the fix part of a YAML rule. For example, we may want to change the case, add or remove prefixes or suffixes. ast-grep provides a `transform` key that allows us to specify such transformations.

## Use `transform` in Rewrite

`transform` accepts a **dictionary** of which:

- the _key_ is the **new variable name** to be introduced and
- the _value_ is a **transformation object** that specifies which meta-variable is transformed and how.

A transformation object has a key indicating which string operation will be performed on the meta variable, and the value of that key is another object (usually with the source key). Different string operation keys expect different object values.

The following is an example illustrating the syntax of a transformation object:

```yaml
transform:
  NEW_VAR:
    replace:
      source: $VAR_NAME
      replace: regex
      by: replacement
  ANOTHER_NEW_VAR:
    substring:
      source: $NEW_VAR
      startChar: 1
      endChar: -1
```

ast-grep 0.38.3+ supports string style transformations to simplify rule writing.
The above example can be simplified to one-line style like:

```yaml
transfrom:
  NEW_VAR: replace($VAR_NAME, replace=regex, by=replacement)
  ANOTHER_NEW_VAR: substring($NEW_VAR, startChar=1, endChar=-1)
```

## Example of Converting Generator in Python

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

:::tip Pro Tips
Later transformations can use the variables that were transformed before. This allows you to stack string operations and achieve complex transformations.
:::

## Supported `transformation`

We have several different transformations available now. Please check out [transformation reference](/reference/yaml/transformation.html) for more details.

- `replace`: Use a regular expression to replace the text in a meta-variable with a new text.
- `substring`: Create a new string by cutting off leading and trailing characters.
- `convert`: Change the string case of a meta-variable, such as from `camelCase` to `underscore_case`.
- `rewrite`: Apply rewriter rules to a meta-variable AST and generate a new string. It is like rewriting a sub node recursively.

## Rewrite with Regex Capture Groups

The `replace` transformation allows us to use Rust regex capture groups like `(?<NAME>.*)` to capture meta-variables and reference them in the `by` field. For example, to replace `debug` with `release` in a function name, we can use the following transformation:

```yaml
id: debug-to-release
language: js
rule: {pattern: $OLD_FN($$$ARGS)}   # Capture OLD_FN
constraints: {OLD_FN: {regex: ^debug}}  # Only match if it starts with 'debug'
transform:
  NEW_FN:
    replace:
      source: $OLD_FN
      replace: debug(?<REG>.*)      # Capture everything following 'debug' as REG
      by: release$REG               # Refer to REG just like a meta-variable
fix: $NEW_FN($$$ARGS)
```

which will result in [the following change](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IkVSUk9SIiwiY29uZmlnIjoiaWQ6IGRlYnVnLXRvLXJlbGVhc2Vcbmxhbmd1YWdlOiBqc1xucnVsZToge3BhdHRlcm46ICRPTERfRk4oJCQkQVJHUyl9ICAgIyBDYXB0dXJlIE9MRF9GTlxuY29uc3RyYWludHM6IHtPTERfRk46IHtyZWdleDogXmRlYnVnfX0gICMgT25seSBtYXRjaCBpZiBpdCBzdGFydHMgd2l0aCAnZGVidWcnXG50cmFuc2Zvcm06XG4gIE5FV19GTjpcbiAgICByZXBsYWNlOlxuICAgICAgc291cmNlOiAkT0xEX0ZOXG4gICAgICByZXBsYWNlOiBkZWJ1Zyg/PFJFRz4uKikgICAgICAjIENhcHR1cmUgZXZlcnl0aGluZyBmb2xsb3dpbmcgJ2RlYnVnJyBhcyBSRUdcbiAgICAgIGJ5OiByZWxlYXNlJFJFRyAgICAgICAgICAgICAgICMgUmVmZXIgdG8gUkVHIGp1c3QgbGlrZSBhIG1ldGEtdmFyaWFibGVcbmZpeDogJE5FV19GTigkJCRBUkdTKSIsInNvdXJjZSI6ImRlYnVnRm9vKGFyZzEsIGFyZzIpICAifQ==):

```js
debugFoo(arg1, arg2) // [!code --]
releaseFoo(arg1, arg2) // [!code ++]
```

Alternatively, replacing `fooDebug` with `fooRelease`, is difficult because you can't concatenate a meta-variable with a capitalized string literal. `release$REG` is fine, but `$REGRelease` will be interpreted as a single meta-variable and not a concatenation. One workaround is to use multiple sequential transformations, as shown below.

:::warning Limitation
You can only extract regex capture groups in the `replace` field of the `replace` transformation and you can only reference them in the `by` field of the same transformation. The regular `regex` rule does not support capture groups.
:::

## Multiple Sequential Transformations

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

## String Style Transformations

To simplify the syntax of transformations, ast-grep 0.38.3+ supports a new string style transformation syntax. This allows us to write transformations in a more concise and readable way.

The string style transformation syntax is similar to the CSS function call syntax

```yaml
# illustration of string style transformation syntax
NEW_VAR: transform($SOURCE_VAR, option1=value1, option2=value2)
```

The transformation name is followed by parentheses containing the arguments. The first argument is always the source meta-variable, and the rest are the transformation options in the form of key-value pairs.

For example, the transformation examples above can be written as:

```yaml
transform:
  LIST: substring($GEN, startChar=1, endChar=-1)
  KEBABED: convert($OLD_FN, toCase=kebabCase)
  MAYBE_COMMA: replace($$$ARGS, replace='^.+', by=', ')
```

:::warning
The string style transformation syntax is only available in ast-grep 0.38.3 and later versions. If you are using an older version, please use the original object style syntax.
:::

## Even More Advanced Transformations

We can use rewriters in the [`rewrite`](/guide/rewrite/rewriter.html) transformation to apply dynamic transformations to the AST. We will cover it in next section.
