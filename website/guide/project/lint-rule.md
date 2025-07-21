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

The linter rule file is a YAML file. It has fields identical to the [rule essentials](/guide/rule-config.html) plus some linter specific fields. `id`, `language` and `rule` are the same as in the rule essentials.

`message`, `severity` and `note` are self-descriptive linter fields. They correspond to the similar concept `Diagnostic` in the [language server protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic) specification.

## Basic Workflow

A full configured ast-grep rule may look like daunting and complex. But the basic workflow of ast-grep rule is simple.

1. _Find_: search the nodes in the AST that match the rewriter rules (hence the name ast-grep).
2. _Rewrite_: generate a new string based on the matched meta-variables.
3. _Patch_: optionally, replace the node text with the generated fix.

The workflow above is called [_Find and Patch_](/advanced/find-n-patch.html), which is embodied in the lint rule fields:

- **Find**
  - Find a target node based on the [`rule`](/reference/rule.html)
  - Filter the matched nodes based on [`constraints`](/guide/project/lint-rule.html#constraints)
- **Patch**
  - Rewrite the matched meta-variable based on [`transform`](/guide/project/lint-rule.html#transform)
  - Replace the matched node with [`fix`](/guide/project/lint-rule.html#fix), which can use the transformed meta-variables.

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

- `message` is a concise description when the issue is reported.
- `severity` is the issue's severity. See more in [severity](/guide/project/severity.html).
- `note` is a detailed message to elaborate the message and preferably to provide actionable fix to end users.
- `labels` is a dictionary of labels to customize error reporting's code highlighting.

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

`ignores` and `files` can be used together. `ignores` will be tested before `files`. See [reference](/reference/yaml.html#ignores) for more details.

:::warning Don't add `./`

Be sure to remove `./` to the beginning of your rules. ast-grep will not recognize the paths if you add `./`.

:::

## Customize Code Highlighting

ast-grep will report linting issues with highlighted code span called label. A label describes an underlined region of code associated with an issue. _By default, the matched target code and its surrounding code captured by [relational rules](/guide/rule-config/relational-rule.html)_.

ast-grep further allows you to customize the highlighting style with the configuration `labels` in the rule to provide more context to the developer. **`labels` is a dictionary of which the keys are the meta-variable name without `$` and the values ares label config objects.**

The label config object contains two fields: the required `style` and the optional `message`.

- `style` specifies the category of the label. Available choices are `primary` and `secondary`.
  - `primary` describe the primary cause of an issue.
  - `secondary` provides additional context for a diagnostic.
- `message` specifies the message to be displayed along with the label.

Note, a `label` meta-variable must have a corresponding AST node in the matched code because highlighting requires a range in the code for label. That is, the **label meta-variables must be defined in `rule` or `constraints`**. Meta-variables in `transform` cannot be used in `labels` as they are not part of the matched AST node.

---

Let's see an example. Suppose we have a [rule](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46XG4gICAgY29udGV4dDogJ2NsYXNzIEggeyAkTUVUSE9EKCkgeyAkJCQgfSB9J1xuICAgIHNlbGVjdG9yOiBtZXRob2RfZGVmaW5pdGlvblxuICBpbnNpZGU6XG4gICAgcGF0dGVybjogY2xhc3MgJENMQVNTIHsgJCQkIH1cbiAgICBzdG9wQnk6IGVuZCIsInNvdXJjZSI6ImNsYXNzIE5vdENvbXBvbmVudCB7XG4gICAgbmdPbkluaXQoKSB7fVxufSJ9) that matches method declaration in a class.

```yaml
rule:
  pattern:
    context: 'class H { $METHOD() { $$$ } }'
    selector: method_definition
  inside:
    pattern: class $CLASS { $$$ }
    stopBy: end
```

Without label customization, ast-grep will highlight the method declaration (target), and the whole class declaration, captured by relational rule. We can customize the highlighting with `labels`:

```yaml
labels:
  METHOD:
    style: primary
    message: the method name
  CLASS:
    style: secondary
    message: The class name
```

Instead of highlighting the whole method declaration and class declaration, we are just highlighting the method name and class name. The `style` field specifies the highlighting style. The `message` field specifies the message to be displayed in the editor extension. See this post for a [demo](https://x.com/hd_nvim/status/1924120276939256154) and [the example](/catalog/typescript/missing-component-decorator.html) in catalog.

:::tip VSCode Extension respects `labels`
ast-grep's LSP diagnostic reporting also respects the labels configuration. Labels with messages are displayed in the editor extension as [diagnostic related information](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnosticRelatedInformation). Users can jump to the label by clicking the message in the editor.
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
