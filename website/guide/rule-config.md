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

`id` is a unique short string for the rule.

`language` is the programming language that the rule is intended to check. It specifies what files will be checked against this rule, based on the file extensions.

`rule` is the most interesting part of ast-grep's configuration.

It accpets a [rule object](/reference/rule.html) and defines how the rule behaves and what code will be matched. You can learn how to write rule in the [detailed guide](/guide/rule-config/atomic-rule).

<!-- ## Run the Rule -->

<!-- TODO -->

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