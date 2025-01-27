# Lint Rule

A lint rule is a configuration file that specifies how to find, report and fix issues in the codebase.

Lint rule in ast-grep is natural extension of the core [rule object](/guide/rule-config.html).
There are several additional fields to enable even more powerful code analysis and transformation.


## Rule Example
A typical ast-grep rule file looks like this. It reports error when using `await` inside a loop since the loop can proceed _only after_ the awaited Promise resolves first. See the [eslint rule](https://eslint.org/docs/latest/rules/no-await-in-loop).

```yaml
id: no-await-in-loop
language: TypeScript
rule:
  pattern: await $_
  inside:
    any:
    - kind: for_in_statement
    - kind: while_statement

# Other linting related fields
message: Don't use await inside of loops
severity: warning
note: |
  Performing an await as part of each operation is an indication that
  the program is not taking full advantage of the parallelization benefits of async/await.
```

The _TypeScript_ rule, `no-await-in-loop`, will report a warning when it finds `await` **inside** a `for-in` or `while` loop.

The linter rule file is a YAML file. It has fields identical to the [rule essentials](/guide/rule-config.html) plus some linter specific fields. `id`, `language`  and `rule` are the same as in the rule essentials.

`message`, `severity` and `note` are self-descriptive linter fields. They correspond to the similar concept `Diagnostic` in the [language server protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic) specification.

## Basic Workflow

A full configured ast-grep rule may look like daunting and complex. But the basic workflow of ast-grep rule is simple.

1. _Find_: search the nodes in the AST that match the rewriter rules (hence the name ast-grep).
2. _Rewrite_: generate a new string based on the matched meta-variables.
3. _Patch_: optionally, replace the node text with the generated fix.

The workflow above is called [_Find and Patch_](/advanced/find-n-patch.html), which is embodied in the lint rule fields:

* **Find**
  * Find a target node based on the [`rule`](/reference/rule.html)
  * Filter the matched nodes based on [`constraints`](/guide/project/lint-rule.html#constraints)
* **Patch**
  * Rewrite the matched meta-variable based on [`transform`](/guide/project/lint-rule.html#transform)
  * Replace the matched node with [`fix`](/guide/project/lint-rule.html#fix), which can use the transformed meta-variables.

## Core Rule Fields

### `rule`

`rule` is exactly the same as the [rule object](/guide/rule-config.html) in the core ast-grep configuration.

### `constraints`
We can constrain what kind of meta variables we should match.

```yaml
rule:
  pattern: console.log($GREET)
constraints:
  GREET:
    kind: identifier
```

The above rule will constraint the [`kind`](/guide/rule-config/atomic-rule.html#kind) of matched nodes to be only `identifier`.

So `console.log(name)` will match the above rule, but `console.log('Rem')` will not because the matched variable `GREET` is string.

See [playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIHBhdHRlcm46IGNvbnNvbGUubG9nKCRHUkVFVClcbmNvbnN0cmFpbnRzOlxuICBHUkVFVDpcbiAgICBraW5kOiBpZGVudGlmaWVyIiwic291cmNlIjoiY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJylcbmNvbnNvbGUubG9nKGdyZWV0aW5nKVxuIn0=) in action.

:::warning
Note, constraints only applies to the single meta variable like `$ARG`, not multiple meta variable like `$$$ARGS`.
:::

:::details `constraints` is applied after `rule` and does not work inside `not`
`constraints` is a filter to further refine the matched nodes and is applied after the `rule` is matched.
So the `constraints` field cannot be used inside `not`, for example
```yml
rule:
  pattern: console.log($GREET)
  not: { pattern: console.log($STR) }
constraints:
  STR: { kind: string}
```
The intent of the above rule is to match all `console.log` call except the one with string argument.
But it will match nothing because `console.log($STR)` is exactly the same as `console.log($GREET)` before the `constraints` is applied.
The `not` and `pattern` will conflict with each other.
:::

### `transform`

`transform` is an advanced feature that allows you to transform the matched AST nodes into another string.

It is useful when you combine `transform` and `fix` to rewrite the codebase.
For example, you may want to capitalize the matched variable name, or extract a substring from the matched node.

See the [transform](/guide/rewrite/transform.html) section in rewriting guide for more details.

### `fix`
ast-grep can perform automatic rewriting to the codebase. The `fix` field in the rule configuration specifies how to rewrite the code. We can also use meta variables specified in the `rule` in `fix`. ast-grep will replace the meta-variables with the content of actual matched AST nodes.

Example:

```yaml
rule:
  pattern: console.log($GREET)
fix: console.log('Hello ' + $GREET)
```

will rewrite `console.log('World')` to `console.log('Hello ' + 'World')`.

:::warning `fix` is textual
The `fix` field is a template string and is not parsed by tree-sitter parsers.
Meta variables in `fix` will be replaced as long as they follow the meta variable syntax.
:::

An example will be like this. The meta variable `$GREET` will be replaced both in the fix `alert($GREET)` and in the fix `nonMeta$GREET`, even though the latter cannot be parsed into valid code.


## Other Linting Fields

* `message` is a concise description when the issue is reported.
* `severity` is the issue's severity. See more in [severity](/guide/project/severity.html).
* `note` is a detailed message to elaborate the message and preferably to provide actionable fix to end users.


### `files`/`ignores`

Rules can be applied to only certain files in a codebase with `files`. `files` supports a list of glob patterns:

```yaml
files:
- "tests/**"
- "integration_tests/test.py"
```

Similarly, you can use `ignores` to ignore applying a rule to certain files. `ignores` supports a list of glob patterns:

```yaml
ignores:
- "tests/config/**"
```

:::tip They work together!
`ignores` and `files` can be used together.
:::

:::warning Don't add `./`

Be sure to remove `./` to the beginning of your rules. ast-grep will not recognize the paths if you add `./`.

:::

## Ignore Linting Error

It is possible to ignore a single line of code in ast-grep's scanning. A developer can suppress ast-grep's error by adding `ast-grep-ignore` comment. For example, in JavaScript:

```javascript
// ast-grep-ignore
// ast-grep-ignore: <rule-id>, <more-rule-id>
```

The first comment will suppress the following line's diagnostic. The second comment will suppress one or more specific rules.
There are more options to configure ast-grep's linting behavior, please see [severity](/guide/project/severity.html) for more deep dive.

## Test and Debug Rules

After you have written your rule, you can test it with ast-grep's builtin `test` command.
Let's see it in [next section](/guide/test-rule).

:::tip Pro Tip
You can write a standalone [rule file](/reference/rule.html) and the command `ast-grep scan -r rule.yml` to perform an [ad-hoc search](/guide/tooling-overview.html#run-one-single-query-or-one-single-rule).
:::