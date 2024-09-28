# Composite Rule

Composite rule can accept another rule or a list of rules recursively.
It provides a way to compose atomic rules into a bigger rule for more complex matching.

Below are the four composite rule operators available in ast-grep:

`all`, `any`, `not`, and `matches`.

## `all`

`all` accepts a list of rules and will match AST nodes that satisfy all the rules.

Example([playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoiaWQ6IG5vLWF3YWl0LWluLWxvb3Bcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBhbGw6XG4gICAgLSBwYXR0ZXJuOiBjb25zb2xlLmxvZygnSGVsbG8gV29ybGQnKTtcbiAgICAtIGtpbmQ6IGV4cHJlc3Npb25fc3RhdGVtZW50Iiwic291cmNlIjoiY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJyk7IC8vIG1hdGNoXG52YXIgcmV0ID0gY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJyk7IC8vIG5vIG1hdGNoIn0=)):

```yaml
rule:
  all:
    - pattern: console.log('Hello World');
    - kind: expression_statement
```

The above rule will only match a single line statement with content `console.log('Hello World');`.
But not `var ret = console.log('Hello World');` because the `console.log` call is not a statement.

We can read the rule as "matches code that is both an expression statement and has content `console.log('Hello World')`".

:::tip Pro Tip
`all` rule guarantees the order of rule matching. If you use pattern with [meta variables](/guide/pattern-syntax.html#meta-variable-capturing), make sure to use `all` array to guarantee rule execution order.
:::

## `any`

`any` accepts a list of rules and will match AST nodes as long as they satisfy any one of the rules.


Example([playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoibGFuZ3VhZ2U6IFR5cGVTY3JpcHRcbnJ1bGU6XG4gIGFueTpcbiAgICAtIHBhdHRlcm46IHZhciBhID0gJEFcbiAgICAtIHBhdHRlcm46IGNvbnN0IGEgPSAkQVxuICAgIC0gcGF0dGVybjogbGV0IGEgPSAkQSIsInNvdXJjZSI6InZhciBhID0gMVxuY29uc3QgYSA9IDEgXG5sZXQgYSA9IDFcblxuIn0=)):

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

Example([playground](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiRDOiAkVCA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwicmV3cml0ZSI6IiRDOiBMaXN0WyRUXSA9IHJlbGF0aW9uc2hpcCgkJCRBLCB1c2VsaXN0PVRydWUsICQkJEIpIiwiY29uZmlnIjoibGFuZ3VhZ2U6IFR5cGVTY3JpcHRcbnJ1bGU6XG4gIHBhdHRlcm46IGNvbnNvbGUubG9nKCRHUkVFVElORylcbiAgbm90OlxuICAgIHBhdHRlcm46IGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCcpIiwic291cmNlIjoiY29uc29sZS5sb2coJ2hpJylcbmNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCcpIn0=)):

```yaml
rule:
  pattern: console.log($GREETING)
  not:
    pattern: console.log('Hello World')
```

The above rule will match any `console.log` call but not `console.log('Hello World')`.

## `matches`

`matches` is a special composite rule that takes a rule-id string. The rule-id can refer to a local utility rule defined in the same configuration file or to a global utility rule defined in the global utility rule files under separate directory. The rule will match the same nodes that the utility rule matches.

`matches` rule enable us to reuse rules and even unlock the possibility of recursive rule. It is the most powerful rule in ast-grep and deserves a separate page to explain it. Please see the [dedicated page](/guide/rule-config/utility-rule) for `matches`.

## `all` and `any` Refers to Rules, Not Nodes
`all` mean that a node should **satisfy all the rules**. `any` means that a node should **satisfy any one of the rules**.
It does not mean `all` or `any` nodes matching the rules.

For example, the rule `all: [kind: number, kind: string]` will never match any node because a node cannot be both a number and a string at the same time. New ast-grep users may think this rule should all nodes that are either a number or a string, but it is not the case.
The correct rule should be `any: [kind: number, kind: string]`.

Another example is to match a node that has both `number` child and `string` child. It is extremely easy to [write a rule](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImE6IExpc3RbJEJdIiwicmV3cml0ZSI6Imxpc3RbJEJdIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiJnZW5lcmljX3R5cGUiLCJjb25maWciOiJydWxlOlxuICBraW5kOiBhcmd1bWVudHNcbiAgaGFzOlxuICAgIGFsbDogW3traW5kOiBudW1iZXJ9LCB7IGtpbmQ6IHN0cmluZ31dIiwic291cmNlIjoibG9nKCdzdHInLCAxMjMpIn0=) like below

```yaml
has:
  all: [kind: number, kind: string]
```

It is very tempting to think that this rule will work. However, `all` rule works independently and does not rely on its containing rule `has`. Since the `all` rule matches no node, the `has` rule will also match no node.

**An ast-grep rule tests one node at a time, independently.** A rule can never test multiple nodes at once.
So the rule above means _"match a node has a child that is both a number and a string at the same time"_, which is impossible.
Instead we should search _"a node that has a number child and has a string child"_.

Here is [the correct rule](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImE6IExpc3RbJEJdIiwicmV3cml0ZSI6Imxpc3RbJEJdIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiJnZW5lcmljX3R5cGUiLCJjb25maWciOiJydWxlOlxuICBraW5kOiBhcmd1bWVudHNcbiAgYWxsOlxuICAtIGhhczogeyBraW5kOiBudW1iZXIgfVxuICAtIGhhczogeyBraW5kOiBzdHJpbmcgfSIsInNvdXJjZSI6ImxvZygnc3RyJywgMTIzKSJ9). Note `all` is used before `has`.
```yaml
all:
- has: {kind: number}
- has: {kind: string}
```

Composite rule is inspired by logical operator `and`/`or` and related list method like [`all`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.all)/[`any`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.any). It tests whether a node matches all/any of the rules in the list.


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

It is equivalent to the `all` rule, regardless of the rule order.

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

Rule order is not important if rules are independent. However, matching metavaraible in patterns depends on the result of previous pattern matching. If you use pattern with [meta variables](/guide/pattern-syntax.html#meta-variable-capturing), make sure to use `all` array to guarantee rule execution order.
