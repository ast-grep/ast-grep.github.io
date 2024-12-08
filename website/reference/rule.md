---
outline: [2, 3]
---

# Rule Object Reference

A rule object can have these keys grouped in three categories:

[[toc]]

Atomic rules are the most basic rules to match AST nodes. Relational rules filter matched target according to their position relative to other nodes. Composite rules use logic operation all/any/not to compose the above rules to larger rules.

All of these keys are optional. However, at least one of them must be present and **positive**.

A rule is called **positive** if it only matches nodes with specific kinds. For example, a `kind` rule is positive because it only matches nodes with the kind specified by itself. A `pattern` rule is positive because the pattern itself has a kind and the matching node must have the same kind. A `regex` rule is not positive though because it matches any node as long as its text satisfies the regex.

## Atomic Rules

### `pattern`
* type: `String` or `Object`

A `String` pattern will match one single AST node according to [pattern syntax](/guide/pattern-syntax).

Example:

```yml
pattern: console.log($ARG)
```

`pattern` also accepts an `Object` with `context`,`selector` and optionally `strictness`.

By default `pattern` parses code as a standalone file. You can use the `selector` field  to pull out the specific part to match.

**Example**:

We can select class field in JavaScript by this pattern.

```yml
pattern:
  selector: field_definition
  context: class { $F }
```

---

You can also use `strictness` to change the matching algorithm of pattern. See the [deep div doc](/advanced/match-algorithm.html) for more detailed explanation for strictness.

**Example**:

```yml
pattern:
  context: foo($BAR)
  strictness: relaxed
```

`strictness` accepts these options: `cst`, `smart`, `ast`, `relaxed` and `signature`.


### `kind`
* type: `String`

The kind name of the node to match. You can look up code's kind names in [playground](/playground).

Example:

```yml
kind: call_expression
```

### `regex`
* type: `String`

A [Rust regular expression](https://docs.rs/regex/latest/regex/) to match the node's text. The regex must match the whole text of the node.

>  Its syntax is similar to Perl-style regular expressions, but lacks a few features like look around and backreferences.

Example:

::: code-group
```yml [Literal]
regex: console
```

```yml [Character Class]
regex: ^[a-z]+$
```

```yml [Flag]
regex: (?i)a(?-i)b+
```
:::

### `nthChild`
* type: `number | string | Object`

`nthChild` finds nodes based on their indexes in the parent node's children list.

It can accept either a number, a string or an object:

* number: match the exact nth child
* string: `An+B` style string to match position based on formula
* object: nthChild object has several options to tweak the behavior of the rule
  * `position`: a number or an An+B style string
  * `reverse`: boolean indicating if count index from the end of sibling list
  * `ofRule`: object to filter the sibling node list based on rule

**Example:**

```yaml
# a number to match the exact nth child
nthChild: 3

# An+B style string to match position based on formula
nthChild: 2n+1

# object style nthChild rule
nthChild:
  # accepts number or An+B style string
  position: 2n+1
  # optional, count index from the end of sibling list
  reverse: true # default is false
  # optional, filter the sibling node list based on rule
  ofRule:
    kind: function_declaration # accepts ast-grep rule
```

**Note:**

* nthChild is inspired the [nth-child CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child).
* nthChild's index is 1-based, not 0-based, as in the CSS selector.
* nthChild's node list only includes named nodes, not unnamed nodes.


### `range`
* type: `RangeObject`

A `RangeObject` is an object with two fields `start` and `end`, each of which is an object with two fields `line` and `column`.

Both `line` and `column` are 0-based and character-based. `start` is inclusive and `end` is exclusive.

**Example:**

```yml
range:
  start:
    line: 0
    column: 0
  end:
    line: 0
    column: 3
```

The above example will match an AST node having the first three characters of the first line like `foo` in `foo.bar()`.

## Relational Rules

### `inside`
* type: `Object`

A relational rule object, which is a `Rule` object with two additional fields `stopBy` and `field`.

The target node must appear inside of another node matching the `inside` sub-rule.

Example:
```yaml
inside:
  pattern: class $TEST { $$$ } # a sub rule object
  stopBy: end                  # stopBy accepts 'end', 'neighbor' or another rule object.
  field: body                  # specify the sub-node in the target
```

Please refer to [relational rule guide](/guide/rule-config/relational-rule) for detailed explanation of `stopBy` and `field`.

### `has`
* type: `Object`

A relational rule object, which is a `Rule` object with two additional fields `stopBy` and `field`.

The target node must has a descendant node matching the `has` sub-rule.

Example:
```yaml
has:
  kind: property_identifier    # a sub rule object
  stopBy: end                  # stopBy accepts 'end', 'neighbor' or another rule object.
  field: name                  # specify the sub-node in the target
```

Please refer to [relational rule guide](/guide/rule-config/relational-rule) for detailed explanation of `stopBy` and `field`.

### `precedes`
* type: `Object`

A relational rule object, which is a `Rule` object with one additional field `stopBy`.

The target node must appear before another node matching the `precedes` sub-rule.

Note `precedes` does not have `field` option.

Example:
```yml
precedes:
  kind: function_declaration   # a sub rule object
  stopBy: end                  # stopBy accepts 'end', 'neighbor' or another rule object.
```

### `follows`
* type: `Object`

A relational rule object, which is a `Rule` object with one additional field `stopBy`.

The target node must appear after another node matching the `follows` sub-rule.

Note `follows` does not have `field` option.

Example:
```yml
follows:
  kind: function_declaration   # a sub rule object
  stopBy: end                  # stopBy accepts 'end', 'neighbor' or another rule object.
```

-----

There are two additional fields in relational rules:

#### `stopBy`
* type: `"neighbor"` or `"end"` or `Rule` object
* default: `"neighbor"`

`stopBy` is an option to control how the search should stop when looking for the target node.

It can have three types of value:

* `"neighbor"`: stop when the target node's immediate surrounding node does not match the relational rule. This is the default behavior.
* `"end"`: search all the way to the end of the search direction. i.e. to the root node for `inside`, to the leaf node for `has`, to the first sibling for `follows`, and to the last sibling for `precedes`.
* `Rule` object: stop when the target node's surrounding node does match the rule. `stopBy` is inclusive. If the matching surrounding node also match the relational rule, the target node is still considered as matched.

#### `field`
* type: `String`
* required: No
* Only available in `inside` and `has` relational rules

`field` is an option to specify the sub-node in the target node to match the relational rule.

Note `field` and `kind` are two different concepts.

:::tip
Only relational rules have `stopBy` and `field` options.
:::

## Composite Rules

### `all`
* type: `Array<Rule>`

`all` takes a list of sub rules and matches a node if all of sub rules match.
The meta variables of the matched node contain all variables from the sub rules.

Example:
```yml
all:
  - kind: call_expression
  - pattern: console.log($ARG)
```

### `any`
* type: `Array<Rule>`

`any` takes a list of sub rules and matches a node if any of sub rules match.
The meta variables of the matched node only contain those of the matched sub rule.

Example:
```yml
any:
  - pattern: console.log($ARG)
  - pattern: console.warn($ARG)
  - pattern: console.error($ARG)
```

:::warning all/any refers to rules, not nodes
`all` will match a node only if all sub rules must match.

It will never match multiple nodes at once. Use it with other rules like `has`/`inside` will not alter this behavior.
See the [composite rule guide](/guide/rule-config/composite-rule.html#all-and-any-refers-to-rules-not-nodes) for more details and examples.
:::

### `not`
* type: `Object`

`not` takes a single sub rule and matches a node if the sub rule does not match.

Example:
```yml
not:
  pattern: console.log($ARG)
```

### `matches`
* type: `String`

`matches` takes a utility rule id and matches a node if the utility rule matches. See [utility rule guide](/guide/rule-config/utility-rule) for more details.

Example:

```yml
utils:
  isFunction:
    any:
      - kind: function_declaration
      - kind: function
rule:
  matches: isFunction
```