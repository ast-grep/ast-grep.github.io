# Rule Essentials

Now you have learnt the basic of ast-grep's pattern syntax and searching.
Pattern is a handy feature for simple search. But it is not expressive enough for more complicated cases.

ast-grep provides a more sophisticated way to find your code: Rule.

Rules are like [CSS selectors](https://www.w3schools.com/cssref/css_selectors.php) that can compose together to filter AST nodes based on certain criteria.

## A Minimal Example

A minimal ast-grep rule looks like this.


```yaml
id: no-await-in-promise-all
language: TypeScript
rule:
  pattern: Promise.all($A)
  has:
    pattern: await $_
    stopBy: end
```

The _TypeScript_ rule, _no-await-in-promise-all_, will find `Promise.all` that **has** `await` expression in it.

It is [suboptimal](https://github.com/hugo-vrijswijk/eslint-plugin-no-await-in-promise/) because `Promise.all` will be called [only after](https://twitter.com/hd_nvim/status/1560108625460355073) the awaited Promise resolves first.

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

You can also run the rule directly from the command line without saving the rule to a file. The `--inline-rules` option is useful for ad-hoc search or calling ast-grep from another program.

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

_Rule object is the core concept of ast-grep's rule system and every other features are built on top of it._

Below is the full list of fields in a rule object. Every rule field is optional and can be omitted but at least one field should be present in a rule. A node will match a rule if and only if it satisfies all fields in the rule object.

The equivalent rule object interface in TypeScript is also provided for reference.

:::code-group

```yaml [Full Rule Object]
rule:
  # atomic rule
  pattern: 'search.pattern'
  kind: 'tree_sitter_node_kind'
  regex: 'rust|regex'
  # relational rule
  inside: { pattern: 'sub.rule' }
  has: { kind: 'sub_rule' }
  follows: { regex: 'can|use|any' }
  precedes: { kind: 'multi_keys', pattern: 'in.sub' }
  # composite rule
  all: [ {pattern: 'match.all'}, {kind: 'match_all'} ]
  any: [ {pattern: 'match.any'}, {kind: 'match_any'} ]
  not: { pattern: 'not.this' }
  matches: 'utility-rule'
```

```typescript [TS Interface]
interface RuleObject {
  // atomic rule
  pattern?: string | Pattern
  kind?: string
  regex?: string
  // relational rule
  inside?: RuleObject & Relation
  has?: RuleObject & Relation
  follows?: RuleObject & Relation
  precedes?: RuleObject & Relation
  // composite rule
  all?: RuleObject[]
  any?: RuleObject[]
  not?: RuleObject
  matches?: string
}

// See Atomic rule for explanation
interface Pattern {
  context: string
  selector: string
  strictness?: Strictness
}

// See https://ast-grep.github.io/advanced/match-algorithm.html
type Strictness =
  | 'cst'
  | 'smart'
  | 'ast'
  | 'relaxed'
  | 'signature'

// See Relation rule for explanation
interface Relation {
  stopBy?: 'neighbor' | 'end' | RuleObject
  field?: string
}
```
:::

A node must **satisfies all fields** in the rule object to be considered as a match. So the rule object can be seen as an abbreviated and **unordered** `all` rule.

:::warning Rule object is unordered!!

Unordered rule object means that certain rules may be applied before others, even if they appear later in the YAML.
Whether a node matches or not may depend on the order of rule being applied, especially when using `has`/`inside` rules.

If a rule object does not work, you can try using `all` rule to specify the order of rules. See [FAQ](/advanced/faq.html#why-is-rule-matching-order-sensitive) for more details.
:::

## Three Rule Categories

To summarize the rule object fields above, we have three categories of rules:

* **Atomic Rule**: the most basic rule that checks if AST nodes matches.
* **Relational Rule**: rules that check if a node is surrounded by another node.
* **Composite Rule**: rules that combine sub-rules together using logical operators.

These three categories of rules can be composed together to create more complex rules.

The _rule object is inspired by the CSS selectors_ but with more composability and expressiveness. Think about how selectors in CSS works can help you understand the rule object!

:::tip
Don't be daunted! Learn more about how to write a rule in our [detailed guide](/guide/rule-config/atomic-rule).
:::

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


## `language` specifies `rule` interpretation

The `language` field in the rule configuration will specify how the rule is interpreted.
For example, with `language: TypeScript`, the rule pattern `'hello world'` is parsed as TypeScript string literal.
However, the rule will have a parsing error in languages like C/Java/Rust because single quote is used for character literal and double quote should be used for string.
