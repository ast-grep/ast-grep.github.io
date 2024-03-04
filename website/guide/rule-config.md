# Rule Essentials

Now you have learnt the basic of ast-grep's pattern syntax and searching.
Pattern is a handy feature for simple search. But it is not expressive enough for more complicated cases.

ast-grep provides a more sophisticated way to find your code: Rule.

## A Minimal Example

A minimal ast-grep rule looks like this. It reports error when using `await` inside a `Promise.all` since the `Promise.all` will be called _only after_ the awaited Promise resolves first. See [the repo](https://github.com/hugo-vrijswijk/eslint-plugin-no-await-in-promise/) for more [context](https://twitter.com/hd_nvim/status/1560108625460355073).

```yaml
id: no-await-in-promise-all
language: TypeScript
rule:
  pattern: Promise.all($A)
  has:
    pattern: await $_
    stopBy: end
```

Let's walk through the main fields in this configuration.

* `id` is a unique short string for the rule.

* `language` is the programming language that the rule is intended to check. It specifies what files will be checked against this rule, based on the file extensions. See the list of [supported languages](/reference/languages.html).

* `rule` is the most interesting part of ast-grep's configuration. It accpets a [rule object](/reference/rule.html) and defines how the rule behaves and what code will be matched. You can learn how to write rule in the [detailed guide](/guide/rule-config/atomic-rule).

## Run the Rule

There are several ways to run the rule. We will illustrate several ast-grep features here.

### `ast-grep scan --rule`

The `scan` subcommand of ast-grep CLI can run one rule at a time.

To do so, you need to save the rule above in a file on the disk, say `no-await-in-promise-all.yml`. Then you can run the following command to scan your codebase. In the example below, we are scanning a `test.ts` file.

::: code-group

```bash
ast-grep scan --rule no-await-in-promise-all.yml test.ts
```

```typescript
await Promise.all([
  await foo(),
])
```

:::

### `ast-grep scan --inline-rules`

You can also run the rule directly from the command line without saving the rule to a file. The `--inline-rules` option is useful for ad-hoc search or calling ast-grpe from another program.

:::details The full inline-rules command
```bash
ast-grep scan --inline-rules '
id: no-await-in-promise-all
language: TypeScript
rule:
  pattern: Promise.all($A)
  has:
    pattern: await $_
    stopBy: end
' test.ts
```
:::

### Online Playground

ast-grep provides an online [playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IlByb21pc2UuYWxsKCRBKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogbm8tYXdhaXQtaW4tcHJvbWlzZS1hbGxcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBwYXR0ZXJuOiBQcm9taXNlLmFsbCgkQSlcbiAgaGFzOlxuICAgIHBhdHRlcm46IGF3YWl0ICRfXG4gICAgc3RvcEJ5OiBlbmQiLCJzb3VyY2UiOiJQcm9taXNlLmFsbChbXG4gIGF3YWl0IFByb21pc2UucmVzb2x2ZSgxMjMpXG5dKSJ9) to test your rule.

You can paste the rule configuration into the playground and see the matched code. The playground also has a share button that generates a link to share the rule with others.


## Rule Object

<!-- TODO: add rule object definition -->

In ast-grep, we have three categories of rules:

* Atomic rule
* Relational rule
* Composite rule

These three rules can be composed together to create more complex rules.

## Target Node

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

:::tip
Learn more about how to write a rule in our [detailed guide](/guide/rule-config/atomic-rule).
:::


## `language` specifies `rule` interpretation

The `language` field in the rule configuration will specify how the rule is interpreted.
For example, with `language: TypeScript`, the rule pattern `'hello world'` is parsed as TypeScript string literal.
However, the rule will have a parsing error in languages like C/Java/Rust because single quote is used for character literal and double quote should be used for string.