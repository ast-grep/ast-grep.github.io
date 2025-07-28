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

**Example:**
```yaml
id: no-console-log
```

### `language`

* type: `String`
* required: true

Specify the language to parse and the file extension to include in matching.

Valid values are: `C`, `Cpp`, `CSharp`, `Css`, `Go`, `Html`, `Java`, `JavaScript`, `Kotlin`, `Lua`, `Python`, `Rust`, `Scala`, `Swift`, `Thrift`, `Tsx`, `TypeScript`

**Example:**
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

**Note, constraints only applies to the single meta variable like `$ARG`,** not multiple meta variable like `$$$ARGS`.
So the key name must only refer to a single meta variable.

**Example:**

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

**Example:**

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
The dictionary value is a transformation object or transformation string that specifies how meta var is processed.

Please also see [transformation reference](/reference/yaml/transformation) for details.

**Example:**
```yaml
transform:
  NEW_VAR_NAME:      # new variable name
    replace:         # transform operation
      source: $ARGS
      replace: '^.+'
      by: ', '

# string style for ast-grep 0.38.3+
transform:
  NEW_VAR_NAME: replace($ARGS, replace='^.+', by=', ')
```

### `fix`

* type: `String` or `FixConfig`
* required: false

A pattern or a `FixConfig` object to auto fix the issue. See details in [fix object reference](/reference/yaml/fix.html).

It can reference meta variables that appeared in the rule.

**Example:**

```yaml
fix: logger.log($$$ARGS)

# you can also use empty string to delete match
fix: ""
```

### `rewriters`
* type: `Array<Rewriter>`
* required: false

A list of rewriter rules that can be used in [`rewrite` transformation](/reference/yaml/transformation.html#rewrite).

A rewriter rule is similar to ordinary YAML rule, but it ony contains _finding_ fields, _patching_ fields and `id`.

Please also see [rewriter reference](/reference/yaml/rewriter.html) for details.

**Example:**
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

**Example:**
```yaml
severity: warning
```

### `message`

* type: `String`
* required: false

Main message highlighting why this rule fired. It should be single line and concise,
but specific enough to be understood without additional context.

It can reference meta-variables that appeared in the rule.

**Example:**
```yaml
message: "console.log should not be used in production code"
```

### `note`

* type: `String`
* required: false

Additional notes to elaborate the message and provide potential fix to the issue.

`note` can contains markdown syntax, but it _cannot_ reference meta-variables.

**Example:**
```yaml
note: "Use a logger instead"
```

### `labels`

* type: `HashMap<String, LabelConfig>`
* required: false

A dictionary of labels to customize highlighting. The dictionary key is the meta-variable name without `$`, defined in `rules` or `constraints`. The value is a label config object containing the following fields:
* `style`: (required) the style of the label. Available choice: `primary`, `secondary`.
* `message`: (optional) the message to be displayed in the editor extension.

**Example:**
```yaml
labels:
  ARG:
    style: primary
    message: "This is the argument"
  FUNC:
    style: secondary
    message: "This is the function"
```

Please also see [label guide](/guide/project/lint-rule.html#customize-code-highlighting) for details.

## Globbing

### `files`
* type: `Array<String>`
* required: false

Glob patterns to specify that the rule only applies to matching files. It is tested if `ignores` does not exist or a file does not match any `ignores` glob.

**Example:**

```yaml
files:
  - src/**/*.js
  - src/**/*.ts
```

:::warning Don't add `./`
Be sure to remove `./` to the beginning of your rules. ast-grep will not recognize the paths if you add `./`.
:::

Paths in `files` are relative to the project root directory, that is, `sgconfig.yml`'s directory.


### `ignores`
* type: `Array<String>`
* required: false

**Example:**
```yaml
ignores:
  - test/**/*.js
  - test/**/*.ts
```

Glob patterns that exclude rules from applying to files. A file is tested against `ignores` list before matching `files`.

A typical globing process works as follows:

1. If `ignores` is configured, a file will be skipped if it matches any of the glob in the list(`files` will not be tested).
2. If `files` is configured, a file will be included if and only if it matches one of the glob in the list.
3. If neither `ignores`/`files` is configured, a file is included by default.

:::warning `ignores` in YAML is different from `--no-ignore` in CLI
ast-grep respects common ignore files like `.gitignore` and hidden files by default.
To disable this behavior, use [`--no-ignore`](/reference/cli.html#scan) in CLI.
`ignores` is a rule-wise configuration that only filters files that are not ignored by the CLI.
:::

Paths in `ignores` are relative to the project root directory, that is, `sgconfig.yml`'s directory.

## Other

### `url`

* type: `String`
* required: false

Documentation link to this rule. It will be displayed in editor extension if supported.

**Example:**

```yaml
url: 'https://ast-grep.github.io/catalog/python/#migrate-openai-sdk'
```

### `metadata`
* type: `HashMap<String, String>`
* required: false

Extra information for the rule. This section can include custom data for external program to consume. For example, CVE/OWASP information can be added here for security research.

ast-grep will output `metadata` with matches in [`--json`](/reference/cli/scan.html#json-style) mode if [`--include-metadata`](/reference/cli/scan.html#include-metadata) is on.

**Example:**

```yaml
metadata:
  extraField: 'Extra information for other usages'
  complexData:
    key: value
```
