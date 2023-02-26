# Rule Object Reference

A rule object can have these keys grouped in three categories:

* Atomic Rule Keys:
  * `pattern`
  * `kind`
  * `regex`
* Relational Rule Keys:
  * `inside`
  * `has`
  * `precedes`
  * `follows`
* Composite Rule Keys:
  * `all`
  * `any`
  * `not`

Atomic rule is the most basic rule to match AST. Relational rules filter matched target according to their position relative to other nodes. Composite rules use logic operation all/any/not to compose the above rules to larger rules.

All of these keys are optional. However, at least one of them must be present and positive.

A rule is called **positive** if it only matches nodes with specific kinds. For example, a `kind` rule is positive because it only matches nodes with the kind specified by itself. A `pattern` rule is positive because the pattern itself has a kind and the matching node must have the same kind. A `regex` rule is not positive though because it matches any node as long as its text satisfies the regex.

## `pattern`
* type: `String` or `Object`

A `String` pattern will match one single AST node according to [pattern syntax](/guide/pattern-syntax).

`pattern` also accepts an `Object` with `context` and `selector`. Such object-style pattern is used to match sub AST node specified by user in contextual pattern. For example, we can select class field in JavaScript by this pattern.

```yaml
pattern:
  kind: field_definition
  context: class { $F }
```

## `kind`
* type: `String`

The kind name of the node to match. You can look up code's kind names in [playground](/playground).

## `regex`
* type: `String`

A [Rust regular expression](https://docs.rs/regex/latest/regex/) to match the node's text. The regex must match the whole text of the node.

>  Its syntax is similar to Perl-style regular expressions, but lacks a few features like look around and backreferences.

## `inside`
* type: `Object`

A relational rule.

## `has`
* type: `Object`

A relational rule.

## `precedes`
* type: `Object`

A relational rule.

## `follows`
* type: `Object`

A relational rule.

## `all`
* type: `Array<Rule>`

`all` takes a list of sub rules and matches a node if all of sub rules match.
The meta variables of the matched node contain all variables from the sub rules.

## `any`
* type: `Array<Rule>`

`any` takes a list of sub rules and matches a node if any of sub rules match.
The meta variables of the matched node only contain those of the matched sub rule.

## `not`
* type: `Object`

`not` takes a single sub rule and matches a node if the sub rule does not match.
