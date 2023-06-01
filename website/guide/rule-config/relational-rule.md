# Relational rules

Relational rules are powerful operators that can filter the _target_ nodes based on their _surrounding_ nodes.

## Relational Rule Example

Suppose we have an `await` expression inside a for loop. It is usually a bad idea because every iteration will have to wait for the previous promise to resolve.
In this case, we can use the relational rule `inside` to filter out the `await` expression.


```yaml
rule:
  all:
    - pattern: await $PROMISE
    - inside:
        kind: for_in_statement
```
The relational rule `inside` accepts a rule and will match any node that is inside another node that satisfies the inside rule.
For example, the above rule can be read as "matches a node that is `await` expression and is inside a for loop".

Since relational rules accept another ast-grep rule, we can compose more complex examples by using operators recursively.

```yaml
rule:
  all:
    - pattern: await $PROMISE
    - inside:
        any:
          - kind: for_in_statement
          - kind: for_statement
          - kind: while_statement
          - kind: do_statement
```

The above rule will match different kinds of loops, like `for`, `for-in`, `while` and `do-while`.

So all the code below matches:

```js
while (foo) {
  await bar()
}
for (let i = 0; i < 10; i++) {
  await bar()
}
for (let key in obj) {
  await bar()
}
do {
  await bar()
} while (condition)
```

## Embedded rules

Relational rule can be embedded in atomic rule to simulate a composite rule.
Please see [embedded rule](/guide/rule-config/composite-rule.html#embedded-rules) for more details.

## Relational Rule Mnemonics

ast-grep now supports four kinds of relational rules:

* `inside`: the target node must be inside a node that matches the sub rule.
* `has`: the target node must have a child node specified by the sub rule.
* `follows`: the target node must follow a node specified by the sub rule. (target after surrounding)
* `precedes`: the target node must precede a node specified by the sub rule. (target before surrounding).

It is sometimes confusing to remember whether the rule matches target node or surrounding node. Here is the mnemonics to help you read the rule.

:::tip
 All relational rule takes the form of `target` `relates` to `surrounding`.
:::

First, relational rule usually has a parent rule like `all` or an augmented atomic rule.

That parent rule will match the target node.

The relational rule like `inside` or `follows` will match the surrounding node.

Together, the rule specifies that the target node will `be inside` or `follows` the surrounding node.

For example, the rule below will match **`hello`(target)** greeting that **follows(relation)** a **`world`(surrounding)** greeting.

```yaml
all:
  - pattern: console.log('hello');
  - follows:
      pattern: console.log('world');
```

Consider the [input source code](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOlxuICBhbGw6XG4gICAgLSBwYXR0ZXJuOiBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAtIGZvbGxvd3M6XG4gICAgICAgIHBhdHRlcm46IGNvbnNvbGUubG9nKCd3b3JsZCcpOyIsInNvdXJjZSI6ImNvbnNvbGUubG9nKCdoZWxsbycpOyAvLyBkb2VzIG5vdCBtYXRjaFxuY29uc29sZS5sb2coJ3dvcmxkJyk7XG5jb25zb2xlLmxvZygnaGVsbG8nKTsgLy8gbWF0Y2hlcyEhIn0=). Only the second `console.log('hello')` will match the rule.
```javascript
console.log('hello'); // does not match
console.log('world');
console.log('hello'); // matches!!
```

## Fine tuning relational rule

Relational rule has several options to let you find nodes more precisely.

### `stopBy`
By default, relational rule will only match nodes one level further. For example, ast-grep will only match the direct children of the target node for the `has` rule.

You can change the behavior by using the `stopBy` field. It accepts three kinds of values: string `'end'`, string `'neighbor'` (the default option), and a rule object.

`stopBy: end` will make ast-grep search surrounding nodes until it reaches the end. For example, it stops when the rule hits root node, leaf node or the first/last sibling node.

```yaml
has:
  stopBy: end
  pattern: $MY_PATTERN
```

`stopBy` can also accept a custom rule object, so the searching will only stop when the rule matches the surrounding node.

```yaml
# find if a node is inside a function called test. It stops whenever the ancestor node is a function.
inside:
  stopBy:
    kind: function
  pattern: function test($$$) { $$$ }
```

Note the `stopBy` rule is inclusive. So when both `stopBy` rule and relational rule hit a node, the node is considered as a match.

### `field`
Sometimes it is useful to specify the node by its field. Suppose we want to find a JavaScript object property with the key `prototype`, an outdated practice that we should avoid.

```yaml
kind: pair # key-value pair in JS
has:
  field: key # note here
  regex: 'prototype'
```

This rule will match the following code
```js
var a = {
  prototype: anotherObject
}
```
but will not match this code
```js
var a = {
  normalKey: prototype
}
```
Though `pair` has a child with text `prototype` in the second example, its relative field is not `key`. That is, `prototype` is not used as `key` but instead used as value. So it does not match the rule.
