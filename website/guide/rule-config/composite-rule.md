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

## Embedded rules
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
              immediate: true
              kind: class_body
        until:                                       # but not inside nested
          any:
            - kind: object                           # either object
            - kind: class_body                       # or class
```

See the [playground link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNsYXNzIEEge1xuICAgIGdldCB0ZXN0KCkge31cbn0iLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIGFsbDpcbiAgICAtIHBhdHRlcm46IHRoaXMuZm9vXG4gICAgLSBpbnNpZGU6XG4gICAgICAgIGFsbDpcbiAgICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNsYXNzIEEgeyBnZXQgJEdFVFRFUigpIHsgJCQkIH0gfVxuICAgICAgICAgICAgICBzZWxlY3RvcjogbWV0aG9kX2RlZmluaXRpb25cbiAgICAgICAgICAtIGluc2lkZTpcbiAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXG4gICAgICAgICAgICAgIGtpbmQ6IGNsYXNzX2JvZHlcbiAgICAgICAgdW50aWw6XG4gICAgICAgICAgYW55OlxuICAgICAgICAgICAgLSBraW5kOiBvYmplY3RcbiAgICAgICAgICAgIC0ga2luZDogY2xhc3NfYm9keSIsInNvdXJjZSI6ImNsYXNzIEEge1xuICBnZXQgdGVzdCgpIHtcbiAgICB0aGlzLmZvb1xuICAgIGxldCBub3RUaGlzID0ge1xuICAgICAgZ2V0IHRlc3QoKSB7XG4gICAgICAgIHRoaXMuZm9vXG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5vdFRoaXMoKSB7XG4gICAgdGhpcy5mb29cbiAgfVxufVxuY29uc3Qgbm90VGhpcyA9IHtcbiAgZ2V0IHRlc3QoKSB7XG4gICAgdGhpcy5mb29cbiAgfVxufSJ9).


To avoid such nesting-hell code (remember [callback hell](http://callbackhell.com/)?), we can use extra field in the atomic rule to filter out certain nodes. An atomic rule can have `inside`, `has`, `follows` and `precedes` fields. Nodes that will be matched it must be surrounded by corresponding nodes specified by the relation. Put in another way, they are equivalent to having an `all` rule with two sub rules: one is the atomic rule and the other is the relational rule.

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

We call the original atomic rule is augmented by an embedded relational rule.

Back to our `this.foo` in getter example, we can rewrite the rule as below.

```yaml
rule:
  pattern: this.foo
  inside:
    pattern:
      context: class A { get $GETTER() { $$$ } }
      selector: method_definition
    inside:
        immediate: true
        kind: class_body
    until:
      any:
        - kind: object
        - kind: class_body
```

It has less indentation than before. See the rewritten rule [in action](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNsYXNzIEEge1xuICAgIGdldCB0ZXN0KCkge31cbn0iLCJjb25maWciOiIjIENvbmZpZ3VyZSBSdWxlIGluIFlBTUxcbnJ1bGU6XG4gIHBhdHRlcm46IHRoaXMuZm9vXG4gIGluc2lkZTpcbiAgICBwYXR0ZXJuOlxuICAgICAgY29udGV4dDogY2xhc3MgQSB7IGdldCAkR0VUVEVSKCkgeyAkJCQgfSB9XG4gICAgICBzZWxlY3RvcjogbWV0aG9kX2RlZmluaXRpb25cbiAgICBpbnNpZGU6XG4gICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxuICAgICAgICBraW5kOiBjbGFzc19ib2R5XG4gICAgdW50aWw6XG4gICAgICBhbnk6XG4gICAgICAgIC0ga2luZDogb2JqZWN0XG4gICAgICAgIC0ga2luZDogY2xhc3NfYm9keSIsInNvdXJjZSI6ImNsYXNzIEEge1xuICBnZXQgdGVzdCgpIHtcbiAgICB0aGlzLmZvb1xuICAgIGxldCBub3RUaGlzID0ge1xuICAgICAgZ2V0IHRlc3QoKSB7XG4gICAgICAgIHRoaXMuZm9vXG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5vdFRoaXMoKSB7XG4gICAgdGhpcy5mb29cbiAgfVxufVxuY29uc3Qgbm90VGhpcyA9IHtcbiAgZ2V0IHRlc3QoKSB7XG4gICAgdGhpcy5mb29cbiAgfVxufSJ9).
