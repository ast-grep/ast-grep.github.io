# Relational rules

Relational rules are powerful operators that can filter the _target_ nodes based on their _surrounding_ nodes.

## Relational Rule Example

Suppose we have an `await` expression inside a for loop, it is usually a bad idea because every iteration will have to wait for the previous promise to resolve.
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

Since relational rules accept other ast-grep rules, we can compose more complex examples by recursively using operators.

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

The above rule will match different kind of loops, like `for`, `for-in`, `while` and `do-while`.

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
