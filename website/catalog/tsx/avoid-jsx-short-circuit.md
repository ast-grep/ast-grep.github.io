## Avoid `&&` short circuit in JSX <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InRzeCIsInF1ZXJ5IjoiY29uc29sZS5sb2coJE1BVENIKSIsInJld3JpdGUiOiJsb2dnZXIubG9nKCRNQVRDSCkiLCJjb25maWciOiJpZDogZG8td2hhdC1icm9vb29vb2tseW4tc2FpZFxubGFuZ3VhZ2U6IFRzeFxuc2V2ZXJpdHk6IGVycm9yXG5ydWxlOlxuICBraW5kOiBqc3hfZXhwcmVzc2lvblxuICBoYXM6XG4gICAgcGF0dGVybjogJEEgJiYgJEJcbiAgbm90OlxuICAgIGluc2lkZTpcbiAgICAgIGtpbmQ6IGpzeF9hdHRyaWJ1dGVcbmZpeDogXCJ7JEEgPyAkQiA6IG51bGx9XCIiLCJzb3VyY2UiOiI8ZGl2PntcbiAgbnVtICYmIDxkaXYvPlxufTwvZGl2PiJ9)

### Description

In [React](https://react.dev/learn/conditional-rendering), you can conditionally render JSX using JavaScript syntax like `if` statements, `&&`, and `? :` operators.
However, you should almost never put numbers on the left side of `&&`. This is because React will render the number `0`, instead of the JSX element on the right side. A concrete example will be conditionally rendering a list when the list is not empty.

This rule will find and fix any short-circuit rendering in JSX and rewrite it to a ternary operator.


### YAML

```yaml
id: do-what-brooooooklyn-said
language: Tsx
rule:
  kind: jsx_expression
  has:
    pattern: $A && $B
  not:
    inside:
      kind: jsx_attribute
fix: "{$A ? $B : null}"
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```tsx {1}
<div>{ list.length && list.map(i => <p/>) }</div>
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```tsx
<div>{ list.length && list.map(i => <p/>) }</div> // [!code --]
<div>{ list.length ?  list.map(i => <p/>) : null }</div> // [!code ++]
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim), inspired by [@Brooooook_lyn](https://twitter.com/Brooooook_lyn/status/1666637274757595141)