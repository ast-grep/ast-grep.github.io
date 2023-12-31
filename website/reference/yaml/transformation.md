---
outline: [2, 3]
---

# Transformation Object

A transformation object is used to manipulate meta variables. It is a dictionary with the following structure:

* a **key** that specifies which string operation will be applied to the meta variable, and
* a **value** that is another object with the details of how to perform the operation.

Different string operation keys expect different object values.


## `replace`

Use a regular expression to replace the text in a meta-variable with a new text.

`replace` transformation expects an object value with the following properties:

### `replace`

* type: `String`
* required: true

A Rust regular expression to match the text to be replaced.

### `by`

* type: `String`
* required: true

A string to replace the matched text.

### `source`

* type: `String`
* required: true

A meta-variable name to be replaced.

_The meta-variable name must be prefixed with `$`._

**Example**:
```yaml
transform:
  NEW_VAR:
    replace:
      replace: regex
      by: replacement
      source: $VAR
```

## `substring`

Create a new string by cutting off leading and trailing characters.

`substring` transformation expects an object value with the following properties:

### `startChar`
* type: `Integer`
* required: false

The starting character index of the new string, **inclusively**.<br/>
If omitted, the new string starts from the beginning of the source string.<br/>
The index can be negative, in which case the index is counted from the end of the string.

### `endChar`
* type: `Integer`
* required: false

The ending character index of the new string, **exclusively**.<br/>
If omitted, the new string ends at the end of the source string.<br/>
The index can be negative, in which case the index is counted from the end of the string.

### `source`
* type: `String`
* required: true

A meta-variable name to be truncated.

_The meta-variable name must be prefixed with `$`._

**Example**:
```yaml
transform:
  NEW_VAR:
    substring:
      startChar: 1
      endChar: -1
      source: $VAR
```

:::tip Pro Tip
`substring` works like [Python's string slicing](https://www.digitalocean.com/community/tutorials/python-slice-string).
They both have inclusive start, exclusive end and support negative index.

`substring`'s index is based on unicode character count, instead of byte.
:::

## `convert`

Change the string case of a meta-variable, such as from `camelCase` to `underscore_case`.

This transformation is inspired by TypeScript's [intrinsic string manipulation type](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#intrinsic-string-manipulation-types).

Ideally, the source string should be an identifier in the rule language.

`convert` transformation expects an object value with the following properties:

### `toCase`
* type: `StringCase`
* required: true

The target case to convert to.

Some string cases will first split the source string into words, then convert each word's case, and finally join the words back together. You can fine-tune the behavior of these separator-sensitive string cases by the `separatedBy` option.

ast-grep supports the following cases:

#### `StringCase`

|Name|Example input|Example output|Separator sensitive?|
|---|---:|---:|--:|
|`lowerCase`| astGrep| astgrep| No|
|`upperCase`| astGrep| ASTGREP| No|
|`capitalize`| astGrep| AstGrep| No|
|`camelCase`| ast_grep| astGrep| Yes|
|`snakeCase`| astGrep| ast_grep| Yes|
|`kebabCase`| astGrep| ast-grep| Yes|
|`pascalCase`| astGrep| AstGrep| Yes|

### `separatedBy`

* type: `List` of `Separator`
* required: false
* default: all separators

A list of separators to be used to separate words in the source string.

ast-grep supports the following separators:

#### `Separator`

|Name|Separator character |Example input|Example output|
|---|:---:|:---:|:---:|
|`Dash`|`-`| ast-grep| [ast, grep]|
|`Dot`|`.`| ast.grep| [ast, grep]|
|`Space`|` `| ast grep| [ast, grep]|
|`Slash`|`/`| ast/grep| [ast, grep]|
|`Underscore`|`_`| ast_grep| [ast, grep]|
|`CaseChange`|Described below| astGrep| [ast, grep]|

`CaseChange` separator is a special separator that splits the string when two consecutive characters' case changed.
More specifically, it splits the string in the following two scenarios.

* At the position between a lowercase letter and an uppercase letter, e.g. `astGrep` -> `[ast, Grep]`
* Before an uppercase letter that is not the first character and is followed by a lowercase letter, e.g. `ASTGrep` -> `[AST, Grep]`

More examples are shown below. You can also inspect [the equivalent regular expression examples](https://regexr.com/7prq5) to see how `CaseChange` works in action

```
RegExp -> [Reg, Exp]
XMLHttpRequest -> [XML, Http, Request]
regExp -> [reg, Exp]
writeHTML -> [write, HTML]
```


### `source`

* type: `String`
* required: true

A meta-variable name to be truncated.

_The meta-variable name must be prefixed with `$`._


**Example**:
```yaml
transform:
  NEW_VAR:
    convert:
      toCase: kebabCase
      separatedBy: [underscore]
      source: $VAR
```

Suppose we have a string `ast_Grep` as the input `$VAR`, The example above will convert the string as following:
* split the string by `_` into `[ast, Grep]`
* convert the words to lowercase words `[ast, grep]`
* join the words by `-` into the target string `ast-grep`

Thank [Aarni Koskela](https://github.com/akx) for proposing and implementing the first version of this feature!