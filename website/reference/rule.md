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

All of these keys are optional. However, at least one of them must be present and positive.

A rule is called **positive** if it only matches nodes with specific kinds. For example, a `kind` rule is positive because it only matches nodes with the kind specified by itself. A `pattern` rule is positive because the pattern itself has a kind and the matching node must have the same kind. A `regex` rule is not positive though because it matches any node as long as its text satisfies the regex.

## `pattern`
* type: `String` or `Object`

## `kind`
* type: `String`

## `regex`
* type: `String`

## `inside`
* type: `Object`

## `has`
* type: `Object`

## `precedes`
* type: `Object`

## `follows`
* type: `Object`

## `all`
* type: `Array<Object>`

## `any`
* type: `Array<Object>`

## `not`
* type: `Object`
