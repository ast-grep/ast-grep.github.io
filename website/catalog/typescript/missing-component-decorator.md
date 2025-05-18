## Missing Component Decorator

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImltcG9ydCAkQSBmcm9tICdhbmltZWpzJyIsInJld3JpdGUiOiJpbXBvcnQgeyBhbmltZSBhcyAkQSB9IGZyb20gJ2FuaW1lJyIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiaWQ6IG1pc3NpbmctY29tcG9uZW50LWRlY29yYXRvclxubWVzc2FnZTogWW91J3JlIHVzaW5nIGFuIEFuZ3VsYXIgbGlmZWN5Y2xlIG1ldGhvZCwgYnV0IG1pc3NpbmcgYW4gQW5ndWxhciBAQ29tcG9uZW50KCkgZGVjb3JhdG9yLlxubGFuZ3VhZ2U6IFR5cGVTY3JpcHRcbnNldmVyaXR5OiB3YXJuaW5nXG5ydWxlOlxuICBwYXR0ZXJuOlxuICAgIGNvbnRleHQ6ICdjbGFzcyBIaSB7ICRNRVRIT0QoKSB7ICQkJF99IH0nXG4gICAgc2VsZWN0b3I6IG1ldGhvZF9kZWZpbml0aW9uXG4gIGluc2lkZTpcbiAgICBwYXR0ZXJuOiAnY2xhc3MgJEtMQVNTICQkJF8geyAkJCRfIH0nXG4gICAgc3RvcEJ5OiBlbmRcbiAgICBub3Q6XG4gICAgICBoYXM6XG4gICAgICAgIHBhdHRlcm46ICdAQ29tcG9uZW50KCQkJF8pJ1xuY29uc3RyYWludHM6XG4gIE1FVEhPRDpcbiAgICByZWdleDogbmdPbkluaXR8bmdPbkRlc3Ryb3lcbmxhYmVsczpcbiAgS0xBU1M6XG4gICAgc3R5bGU6IHByaW1hcnlcbiAgICBtZXNzYWdlOiBcIlRoaXMgY2xhc3MgaXMgbWlzc2luZyB0aGUgZGVjb3JhdG9yLlwiXG4gIE1FVEhPRDpcbiAgICBzdHlsZTogc2Vjb25kYXJ5XG4gICAgbWVzc2FnZTogXCJUaGlzIGlzIGFuIEFuZ3VsYXIgbGlmZWN5Y2xlIG1ldGhvZC5cIlxubWV0YWRhdGE6XG4gIGNvbnRyaWJ1dGVkQnk6IHNhbXdpZ2h0dCIsInNvdXJjZSI6ImNsYXNzIE5vdENvbXBvbmVudCB7XG4gICAgbmdPbkluaXQoKSB7fVxufVxuXG5AQ29tcG9uZW50KClcbmNsYXNzIEtsYXNzIHtcbiAgICBuZ09uSW5pdCgpIHt9XG59In0=)

### Description

Angular lifecycle methods are a set of methods that allow you to hook into the lifecycle of an Angular component or directive.
They must be used within a class that is decorated with the `@Component()` decorator.

### YAML

This rule illustrates how to use custom labels to highlight specific parts of the code.


```yaml
id: missing-component-decorator
message: You're using an Angular lifecycle method, but missing an Angular @Component() decorator.
language: TypeScript
severity: warning
rule:
  pattern:
    context: 'class Hi { $METHOD() { $$$_} }'
    selector: method_definition
  inside:
    pattern: 'class $KLASS $$$_ { $$$_ }'
    stopBy: end
    not:
      has:
        pattern: '@Component($$$_)'
constraints:
  METHOD:
    regex: ngOnInit|ngOnDestroy
labels:
  KLASS:
    style: primary
    message: "This class is missing the decorator."
  METHOD:
    style: secondary
    message: "This is an Angular lifecycle method."
metadata:
  contributedBy: samwightt
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```ts {2}
class NotComponent {
    ngOnInit() {}
}

@Component()
class Klass {
    ngOnInit() {}
}
```

### Contributed by
[Sam Wight](https://github.com/samwightt).
