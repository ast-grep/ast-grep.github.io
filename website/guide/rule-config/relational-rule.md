# Relational Rules

Atomic rule can only match the target node directly. But sometimes we want to match a node based on its surrounding nodes. For example, we want to find `await` expression inside a `for` loop.

Relational rules are powerful operators that can filter the _target_ nodes based on their _surrounding_ nodes.

ast-grep now supports four kinds of relational rules:

`inside`, `has`, `follows`, and `precedes`.

All four relational rules accept a sub rule object as their value. The sub rule will match the surrounding node while the relational rule itself will match the target node.

## Relational Rule Example

Having an `await` expression inside a for loop is usually a bad idea because every iteration will have to wait for the previous promise to resolve.

We can use the relational rule `inside` to filter out the `await` expression.

```yaml
rule:
  pattern: await $PROMISE
  inside:
    kind: for_in_statement
    stopBy: end
```

The rule reads as "matches an `await` expression that is `inside` a `for_in_statement`".
See [Playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoiaWQ6IG5vLWF3YWl0LWluLWxvb3Bcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBwYXR0ZXJuOiBhd2FpdCAkUFJPTUlTRVxuICBpbnNpZGU6XG4gICAga2luZDogZm9yX2luX3N0YXRlbWVudFxuICAgIHN0b3BCeTogZW5kIiwic291cmNlIjoiZm9yIChsZXQgaSBvZiBbMSwgMiwzXSkge1xuICAgIGF3YWl0IFByb21pc2UucmVzb2x2ZShpKVxufSJ9).

The relational rule `inside` accepts a rule and will match any node that is inside another node that satisfies the inside rule. The `inside` rule itself matches `await` and its sub rule `kind` matches the surrounding loop.

## Relational Rule's Sub Rule

Since relational rules accept another ast-grep rule, we can compose more complex examples by using operators recursively.

```yaml
rule:
  pattern: await $PROMISE
  inside:
    any:
      - kind: for_in_statement
      - kind: for_statement
      - kind: while_statement
      - kind: do_statement
    stopBy: end
```

The above rule will match different kinds of loops, like `for`, `for-in`, `while` and `do-while`.

So all the code below matches the rule:

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

See in [playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoiaWQ6IG5vLWF3YWl0LWluLWxvb3Bcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBwYXR0ZXJuOiBhd2FpdCAkUFJPTUlTRVxuICBpbnNpZGU6XG4gICAgYW55OlxuICAgICAgLSBraW5kOiBmb3JfaW5fc3RhdGVtZW50XG4gICAgICAtIGtpbmQ6IGZvcl9zdGF0ZW1lbnRcbiAgICAgIC0ga2luZDogd2hpbGVfc3RhdGVtZW50XG4gICAgICAtIGtpbmQ6IGRvX3N0YXRlbWVudFxuICAgIHN0b3BCeTogZW5kIiwic291cmNlIjoid2hpbGUgKGZvbykge1xuICBhd2FpdCBiYXIoKVxufVxuZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gIGF3YWl0IGJhcigpXG59XG5mb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gIGF3YWl0IGJhcigpXG59XG5kbyB7XG4gIGF3YWl0IGJhcigpXG59IHdoaWxlIChjb25kaXRpb24pIn0=).

:::tip Pro Tip
You can also use `pattern` in relational rule! The metavariable matched in relational rule can also be used in `fix`.
This will effectively let you extract a child node from a match.
:::

## Relational Rule Mnemonics

The four relational rules can read as:

- `inside`: the _target_ node must be **inside** a node that matches the sub rule.
- `has`: the _target_ node must **have** a child node specified by the sub rule.
- `follows`: the _target_ node must **follow** a node specified by the sub rule. (target after surrounding)
- `precedes`: the _target_ node must **precede** a node specified by the sub rule. (target before surrounding).

It is sometimes confusing to remember whether the rule matches target node or surrounding node. Here is the mnemonics to help you read the rule.

First, relational rule is usually used along with another rule.

Second, the other rule will match the target node.

Finally, the relational rule's sub rule will match the surrounding node.

Together, the rule specifies that the target node will `be inside` or `follows` the surrounding node.

:::tip
All relational rule takes the form of `target` `relates` to `surrounding`.
:::

For example, the rule below will match **`hello`(target)** greeting that **follows(relation)** a **`world`(surrounding)** greeting.

```yaml
pattern: console.log('hello');
follows:
  pattern: console.log('world');
```

Consider the [input source code](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJjb25maWciOiJydWxlOlxuICBhbGw6XG4gICAgLSBwYXR0ZXJuOiBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAtIGZvbGxvd3M6XG4gICAgICAgIHBhdHRlcm46IGNvbnNvbGUubG9nKCd3b3JsZCcpOyIsInNvdXJjZSI6ImNvbnNvbGUubG9nKCdoZWxsbycpOyAvLyBkb2VzIG5vdCBtYXRjaFxuY29uc29sZS5sb2coJ3dvcmxkJyk7XG5jb25zb2xlLmxvZygnaGVsbG8nKTsgLy8gbWF0Y2hlcyEhIn0=). Only the second `console.log('hello')` will match the rule.

```javascript
console.log('hello') // does not match
console.log('world')
console.log('hello') // matches!!
```

## Fine Tuning Relational Rule

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
  regex: "prototype"
```

This rule will match the following code

```js
var a = {
  prototype: anotherObject,
}
```

but will not match this code

```js
var a = {
  normalKey: prototype,
}
```

Though `pair` has a child with text `prototype` in the second example, its relative field is not `key`. That is, `prototype` is not used as `key` but instead used as value. So it does not match the rule.
