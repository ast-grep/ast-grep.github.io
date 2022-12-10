# Composite rule

Composite rule can accept another rule or a list of rules recursively.
It provides a way to compose atomic rules into a bigger rule for more complex matching.
Here are some composite rule operators you can use in ast-grep.

## `all`

`all` accepts a list of rules and will match AST nodes that satisfy all the rules.

Example:

```yaml
rule:
  all:
    - pattern: console.log('Hello World');
    - kind: expression_statement
```

The above rule will only match a single line statement with content `console.log('Hello World');`.
But not `var ret = console.log('Hello World');` because the `console.log` call is not a statement.

We can read the rule as "matches code that is both an expression statement and has content `console.log('Hello World')`".

## `any`

`any` accepts a list of rules and will match AST nodes as long as they satisfy any one of the rules.

```yaml
rule:
  any:
    - pattern: var a = $
    - pattern: const a = $
    - pattern: let a = $
```

The above rule will match any variable declaration statement, like `var a = 1`, `const a = 1` and `let a = 1`.

## `not`

`not` accepts a single rule and will match AST nodes that do not satisfy the rule.
Combining `not` rule and `all` can help us to filter out some unwanted matches.

```yaml
rule:
  all:
    - pattern: console.log($GREETING)
    - not:
        pattern: console.log('Hello World')
```

The above rule will match any `console.log` call but not `console.log('Hello World')`.

## Relational rules

Relational rules are powerful operators that can filter the target nodes based on their surrounding nodes.
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
