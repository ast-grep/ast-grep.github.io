# Composite Rule

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
    - pattern: var a = $A
    - pattern: const a = $A
    - pattern: let a = $A
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

## `matches`

`matches` is a special composite rule that takes a rule-id string. The rule-id can refer to a local utility rule defined in the same configuration file or to a global utility rule defined in the global utility rule files under separate directory. The rule will match the same nodes that the utility rule matches.

`matches` rule enable us to reuse rules and even unlock the possibility of recursive rule. It is the most powerful rule in ast-grep and deserves a separate page to explain it. Please see the [dedicated page](/guide/rule-config/utility-rule) for `matches`.

## Combine Different Rules as Fields
Sometimes it is necessary to match node nested within other desired nodes. We can use composite rule `all` and relational `inside` to find them, but the result rule is highly nested.

For example, we want to find the usage of `this.foo` in a class getter, we can write the following rule:

```yaml
rule:
  all:
    - pattern: this.foo                              # the root node
    - inside:                                        # inside another node
        all:
          - pattern:
              context: class A { get $_() { $$$ } }  # a class getter inside
              selector: method_definition
          - inside:                                  # class body
              kind: class_body
        stopBy:                                      # but not inside nested
          any:
            - kind: object                           # either object
            - kind: class_body                       # or class
```

See the [playground link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNsYXNzIEEge1xuICAgIGdldCB0ZXN0KCkge31cbn0iLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIGFsbDpcbiAgICAtIHBhdHRlcm46IHRoaXMuZm9vXG4gICAgLSBpbnNpZGU6XG4gICAgICAgIGFsbDpcbiAgICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNsYXNzIEEgeyBnZXQgJEdFVFRFUigpIHsgJCQkIH0gfVxuICAgICAgICAgICAgICBzZWxlY3RvcjogbWV0aG9kX2RlZmluaXRpb25cbiAgICAgICAgICAtIGluc2lkZTpcbiAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXG4gICAgICAgICAgICAgIGtpbmQ6IGNsYXNzX2JvZHlcbiAgICAgICAgc3RvcEJ5OlxuICAgICAgICAgIGFueTpcbiAgICAgICAgICAgIC0ga2luZDogb2JqZWN0XG4gICAgICAgICAgICAtIGtpbmQ6IGNsYXNzX2JvZHkiLCJzb3VyY2UiOiJjbGFzcyBBIHtcbiAgZ2V0IHRlc3QoKSB7XG4gICAgdGhpcy5mb29cbiAgICBsZXQgbm90VGhpcyA9IHtcbiAgICAgIGdldCB0ZXN0KCkge1xuICAgICAgICB0aGlzLmZvb1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBub3RUaGlzKCkge1xuICAgIHRoaXMuZm9vXG4gIH1cbn1cbmNvbnN0IG5vdFRoaXMgPSB7XG4gIGdldCB0ZXN0KCkge1xuICAgIHRoaXMuZm9vXG4gIH1cbn0ifQ==).

To avoid such nesting-hell code (remember [callback hell](http://callbackhell.com/)?), we can use combine different rules as fields into one rule object. A rule object can have all the atomic/relational/composite rule fields because they have different names. A node will match the rule object if and only if all the rules in its fields match the node. Put in another way, they are equivalent to having an `all` rule with sub rules mentioned in fields.

For example, consider this rule.

```yaml
pattern: this.foo
inside:
  kind: class_body
```

It is equivalent to the `all` rule.

```yaml
all:
  - pattern: this.foo
  - inside:
      kind: class_body
```

Back to our `this.foo` in getter example, we can rewrite the rule as below.

```yaml
rule:
  pattern: this.foo
  inside:
    pattern:
      context: class A { get $GETTER() { $$$ } }
      selector: method_definition
    inside:
        kind: class_body
    stopBy:
      any:
        - kind: object
        - kind: class_body
```

It has less indentation than before. See the rewritten rule [in action](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNsYXNzIEEge1xuICAgIGdldCB0ZXN0KCkge31cbn0iLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIHBhdHRlcm46IHRoaXMuZm9vXG4gIGluc2lkZTpcbiAgICBwYXR0ZXJuOlxuICAgICAgY29udGV4dDogY2xhc3MgQSB7IGdldCAkR0VUVEVSKCkgeyAkJCQgfSB9XG4gICAgICBzZWxlY3RvcjogbWV0aG9kX2RlZmluaXRpb25cbiAgICBpbnNpZGU6XG4gICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxuICAgICAgICBraW5kOiBjbGFzc19ib2R5XG4gICAgc3RvcEJ5OlxuICAgICAgYW55OlxuICAgICAgICAtIGtpbmQ6IG9iamVjdFxuICAgICAgICAtIGtpbmQ6IGNsYXNzX2JvZHkiLCJzb3VyY2UiOiJjbGFzcyBBIHtcbiAgZ2V0IHRlc3QoKSB7XG4gICAgdGhpcy5mb29cbiAgICBsZXQgbm90VGhpcyA9IHtcbiAgICAgIGdldCB0ZXN0KCkge1xuICAgICAgICB0aGlzLmZvb1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBub3RUaGlzKCkge1xuICAgIHRoaXMuZm9vXG4gIH1cbn1cbmNvbnN0IG5vdFRoaXMgPSB7XG4gIGdldCB0ZXN0KCkge1xuICAgIHRoaXMuZm9vXG4gIH1cbn0ifQ==).

:::danger Rule object does not guarantee rule matching order
Rule object does not guarantee the order of rule matching. It is possible that the `inside` rule matches before the `pattern` rule in the example above.
:::

Rule order is not important if rules are independent. However, matching metavaraible in patterns depends on the result of previous pattern matching. If you use pattern with metavaraibles, make sure to use `all` array to guarantee rule execution order.
