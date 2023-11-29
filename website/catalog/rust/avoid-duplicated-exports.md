## Avoid Duplicated Exports

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1c3QiLCJxdWVyeSI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIGFsbDpcbiAgICAgLSBwYXR0ZXJuOiBwdWIgdXNlICRCOjokQztcbiAgICAgLSBpbnNpZGU6XG4gICAgICAgIGtpbmQ6IHNvdXJjZV9maWxlXG4gICAgICAgIGhhczpcbiAgICAgICAgICBwYXR0ZXJuOiBwdWIgbW9kICRBO1xuICAgICAtIGhhczpcbiAgICAgICAgcGF0dGVybjogJEFcbiAgICAgICAgc3RvcEJ5OiBlbmQiLCJzb3VyY2UiOiJwdWIgbW9kIGZvbztcbnB1YiB1c2UgZm9vOjpGb287XG5wdWIgdXNlIGZvbzo6QTo6QjtcblxuXG5wdWIgdXNlIGFhYTo6QTtcbnB1YiB1c2Ugd29vOjpXb287In0=)

### Description

Generally, we don't encourage the use of re-exports.

However, sometimes, to keep the interface exposed by a lib crate tidy, we use re-exports to shorten the path to specific items.
When doing so, a pitfall is to export a single item under two different names.

Consider:
```rs
pub mod foo;
pub use foo::Foo;
```

The issue with this code, is that `Foo` is now exposed under two different paths: `Foo`, `foo::Foo`.

This unnecessarily increases the surface of your API.
It can also cause issues on the client side. For example, it makes the usage of auto-complete in the IDE more involved.

Instead, ensure you export only once with `pub`.

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
id: avoid-duplicate-export
language: rust
rule:
  all:
     - pattern: pub use $B::$C;
     - inside:
        kind: source_file
        has:
          pattern: pub mod $A;
     - has:
        pattern: $A
        stopBy: end
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```rs {2,3}
pub mod foo;
pub use foo::Foo;
pub use foo::A::B;


pub use aaa::A;
pub use woo::Woo;
```

### Contributed by

Julius Lungys([voidpumpkin](https://github.com/voidpumpkin))