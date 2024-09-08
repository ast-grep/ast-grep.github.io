---
outline: [2, 3]
---

# Configuration Reference

ast-grep's rules are written in YAML files.

One YAML file can contain multiple rules, separated by `---`.

An ast-grep rule is a YAML object with the following keys:

[[toc]]

## Basic Information

### `id`

* type: `String`
* required: true

Unique, descriptive identifier, e.g., `no-unused-variable`.

Example:
```yaml
id: no-console-log
```

### `language`

* type: `String`
* required: true

Specify the language to parse and the file extension to includ in matching.

Valid values are: `C`, `Cpp`, `CSharp`, `Css`, `Dart`, `Go`, `Html`, `Java`, `JavaScript`, `Kotlin`, `Lua`, `Python`, `Rust`, `Scala`, `Swift`, `Thrift`, `Tsx`, `TypeScript`

Example:
```yaml
language: JavaScript
```

## _Finding_

### `rule`

* type: `Rule`
* required: true

The object specify the method to find matching AST nodes. See details in [rule object reference](/reference/rule.html).

```yaml
rule:
  pattern: console.log($$$ARGS)
```

### `constraints`

* type: `HashMap<String, Rule>`
* required: false

Additional meta variables pattern to filter matches. The key is matched meta variable name without `$`. The value is a [rule object](/reference/rule.html).

Example:

```yaml
rule:
  pattern: console.log($ARG)
constraints:
  ARG:
    kind: number
    # pattern: $A + $B
    # regex: '[a-zA-Z]+'
```

:::tip `constraints` is applied after `rule`
ast-grep will first match the `rule` while ignoring `constraints`, and then apply `constraints` to filter the matched nodes.

Constrained meta-variables usually do not work inside `not`.
:::

### `utils`

* type: `HashMap<String, Rule>`
* required: false

A dictionary of utility rules that can be used in `matches` locally.
The dictionary key is the utility rule id and the value is the rule object.
See [utility rule guide](/guide/rule-config/utility-rule).

Example:

```yaml
utils:
  match-function:
    any:
      - kind: function
      - kind: function_declaration
      - kind: arrow_function
```

## _Patching_

### `transform`

* type: `HashMap<String, Transformation>`
* required: false

A dictionary to manipulate meta-variables. The dictionary key is the new variable name.
The dictionary value is a transformation object that specifies how meta var is processed.

Please also see [transformation reference](/reference/yaml/transformation) for details.

Example:
```yaml
transform:
  NEW_VAR_NAME:      # new variable name
    replace:         # transform operation
      source: $ARGS
      replace: '^.+'
      by: ', '
```

### `fix`

* type: `String` or `FixConfig`
* required: false

A pattern or a `FixConfig` object to auto fix the issue. See details in [fix object reference](/reference/yaml/fix.html).

It can reference meta variables that appeared in the rule.

Example:
```yaml
fix: logger.log($$$ARGS)

# you can also use empty string to delete match
fix: ""
```

### `rewriters` <Badge type="warning" text="Experimental" />
* type: `Array<Rewriter>`
* required: false

A list of rewriter rules that can be used in [`rewrite` transformation](/reference/yaml/transformation.html#rewrite).

A rewriter rule is similar to ordinary YAML rule, but it ony contains _finding_ fields, _patching_ fields and `id`.

Please also see [rewriter reference](/reference/yaml/rewriter.html) for details.

Example:
```yaml
rewriters:
- id: stringify
  rule: { pattern: "'' + $A" }
  fix: "String($A)"
  # you can also use these fields
  # transform, utils, constraints
```

## Linting

### `severity`

* type: `String`
* required: false

Specify the level of matched result. Available choice: `hint`, `info`, `warning`, `error` or `off`.

When `severity` is `off`, ast-grep will disable the rule in scanning.

Example:
```yaml
severity: warning
```

### `message`

* type: `String`
* required: false

Main message highlighting why this rule fired. It should be single line and concise,
but specific enough to be understood without additional context.

It can reference meta-variables that appeared in the rule.

Example:
```yaml
message: "console.log should not be used in production code"
```

### `note`

* type: `String`
* required: false

Additional notes to elaborate the message and provide potential fix to the issue.

Example:
```yaml
note: "Use a logger instead"
```

## Globbing

### `files`
* type: `Array<String>`
* required: false

Glob patterns to specify that the rule only applies to matching files. It takes priority over `ignores`.

Example:
```yaml
files:
  - ./src/**/*.js
  - ./src/**/*.ts
```

### `ignores`
* type: `Array<String>`
* required: false

```yaml
ignores:
  - ./test/**/*.js
  - ./test/**/*.ts
```

Glob patterns that exclude rules from applying to files. It is superseded by `files` if both are specified.

:::warning `ignores` in YAML is different from `--no-ignore` in CLI
ast-grep respects common ignore files like `.gitignore` and hidden files by default.
To disable this behavior, use [`--no-ignore`](/reference/cli.html#scan) in CLI.
`ignores` is a rule-wise configuration that only filters files that are not ignored by the CLI.
:::

## Other

### `url`

* type: `String`
* required: false

Documentation link to this rule. It will be displayed in editor extension if supported.

Example:

```yaml
url: 'https://ast-grep.github.io/catalog/python/#migrate-openai-sdk'
```

### `metadata`
* type: `HashMap<String, String>`
* required: false

Extra information for the rule.

Example:

```yaml
metadata:
  extraField: 'Extra information for other usages'
```