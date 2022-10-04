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
