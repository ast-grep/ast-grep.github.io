# Rule Configuration

## Root Configuration File

ast-grep supports using [YAML](https://yaml.org/) to configure its linting rules to scan your code repository.
We need a root configuration file `sgconfig.yml` to specify directories where `sg` can find all rules.

In your project root, add `sgconfig.yml` with content as below.

```yaml
ruleDirs:
  - rules
```

This instructs ast-grep to use all files _recursively_ inside the `rules` folder as rule files.

For example, suppose we have the following file structures.

```
my-awesome-project
  |- rules
  | |- no-var.yml
  | |- no-bit-operation.yml
  | |- my_custom_rules
  |   |- custom-rule.yml
  |   |- fancy-rule.yml
  |- sgconfig.yml
  |- not-a-rule.yml
```

All the YAML files under `rules` folder will be treated as rule files by `sg`, while`not-a-rule.yml` is ignored by ast-grep.


**Note, the [`sg scan`](/reference/cli.html#scan) command requires you have an `sgconfig.yml` in your project root.**

:::tip Pro tip
We can also use directories in `node_modules` to reuse preconfigured rules published on npm!

More broadly speaking, any git hosted projects can be imported as rule sets by using [`git submodule`](https://www.git-scm.com/book/en/v2/Git-Tools-Submodules).
:::

## Rule File

A typical ast-grep rule file looks like this. It reports error when using `await` inside a `Promise.all` since the `Promise.all` will be called _only after_ the awaited Promise resolves first. See [the repo](https://github.com/hugo-vrijswijk/eslint-plugin-no-await-in-promise/) for more [context](https://twitter.com/hd_nvim/status/1560108625460355073).

```yaml
id: no-await-in-loop
message: Don't use await inside of loops
severity: warning
language: TypeScript
rule:
  all:
    - inside:
        any:
          - kind: for_in_statement
          - kind: while_statement
    - pattern: await $_
note: |
  Performing an await as part of each operation is an indication that
  the program is not taking full advantage of the parallelization benefits of async/await.
```

Let's walk through the main fields in this configuration.

First we will explain some self-descriptive fields. Most of them correspond to the similar concept `Diagnostic` in the [language server protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic) specification.

`id` is a unique short string for the rule. `message` is a concise description when the issue is reported.
`severity` is the issue's severity. `note` is a detailed message to elaborate the message and preferably to provide actionable fix to end users.

`language` is the programming language that the rule is intended to check. It specifies what files will be checked against this rule, based on the file extensions.

`language` also specifies how `rule` is interpreted. More details below.

## `rule`

Rule is the most interesting part of ast-grep's configuration. It defines how the rule
behaves and what code will be reported as issues.

The `language` field in the rule configuration will specify how the rule is interpreted.
For example, with `language: TypeScript`, the rule pattern `'hello world'` is parsed as TypeScript string literal.
However, the rule will have a parsing error in languages like C/Java/Rust because single quote is used for character literal and double quote should be used for string.

Every rule configuration will have one single root `rule`. The root rule will have *only one* AST node in one match. The matched node is called target node.
During scanning and rewriting, ast-grep will produce multiple matches to report all AST nodes that satisfies the `rule` condition as matched instances.
Though one rule match only have one AST node as matched, we can have more auxiliary nodes to display context or to perform rewrite. We will cover how rules work in details in the next page.

But for a quick primer, a rule can have a pattern and we can extract meta variables from the matched node.

For example, the rule below will match the `console.log('Hello World')`.

```yaml
rule:
  pattern: console.log($GREET)
```
And we can get `$GREET` set to `'Hello World'`.

## `files`/`ignores`

Rules can be applied to only certain files in a codebase with `files`. `files` supports a list of glob patterns:

```yaml
files:
- "./tests/**"
- "./integration_tests/test.py"
```

Similarly, you can use `ignores` to ignore applying a rule to certain files. `ignores` supports a list of glob patterns:

```yaml
ignores:
- "./tests/config/**"
```

:::tip They work together!
`ignores` and `files` can be used together.
:::

:::warning Don't forget `./`

Be sure to add `./` to the beginning of your rules. ast-grep will not recognize the paths if you omit `./`.

:::

## `fix`
ast-grep can perform automatic rewriting to the codebase. The `fix` field in the rule configuration specifies how to rewrite the code. We can also use meta variables specified in the `rule` in `fix`. ast-grep will replace the meta-varialbes with the content of actual matched AST nodes.

Example:

```yaml
rule:
  pattern: console.log($GREET)
fix: console.log('Hello ' + $GREET)
```

will rewrite `console.log('World')` to `console.log('Hello ' + 'World')`.

:::warning `fix` is AST-aware

The `fix` field is also parsed by tree-sitter in the same way as pattern.
Only terminal AST nodes (nodes without children) are rewritten as meta variables.
:::

An example will be like this. The meta variable `$GREET` will be replaced in the fix `alert($GREET)`, but not in the fix `nonMeta$GREET`.
Since the latter pattern `$GREET` is not parsed as a meta variable.

## `constraints`
We can constrain what kind of meta variables we should match.

```yaml
rule:
  pattern: console.log($GREET)
constraints:
  $GREET:
    kind: identifier
```

The above rule will constraint the [`kind`](/guide/rule-config/atomic-rule.html#kind) of matched nodes to be only `identifier`.

So `console.log(name)` will match the above rule, but `console.log('Rem')` will not because the matched variable `GREET` is string.

See [playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIHBhdHRlcm46IGNvbnNvbGUubG9nKCRHUkVFVClcbmNvbnN0cmFpbnRzOlxuICBHUkVFVDpcbiAgICBraW5kOiBpZGVudGlmaWVyIiwic291cmNlIjoiY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJylcbmNvbnNvbGUubG9nKGdyZWV0aW5nKVxuIn0=) in action.

After you have written your rule, you can test it with ast-grep's builtin `test` command.
Let's see it in [next section](/guide/test-rule).
