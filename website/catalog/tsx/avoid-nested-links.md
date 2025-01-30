## Avoid nested links
* [Playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InRzeCIsInF1ZXJ5IjoiaWYgKCRBKSB7ICQkJEIgfSIsInJld3JpdGUiOiJpZiAoISgkQSkpIHtcbiAgICByZXR1cm47XG59XG4kJCRCIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbm8tbmVzdGVkLWxpbmtzXG5sYW5ndWFnZTogdHN4XG5zZXZlcml0eTogZXJyb3JcbnJ1bGU6XG4gIHBhdHRlcm46IDxhICQkJD4kJCRBPC9hPlxuICBoYXM6XG4gICAgcGF0dGVybjogPGEgJCQkPiQkJDwvYT5cbiAgICBzdG9wQnk6IGVuZCIsInNvdXJjZSI6ImZ1bmN0aW9uIENvbXBvbmVudCgpIHtcbiAgcmV0dXJuIDxhIGhyZWY9Jy9kZXN0aW5hdGlvbic+XG4gICAgPGEgaHJlZj0nL2Fub3RoZXJkZXN0aW5hdGlvbic+TmVzdGVkIGxpbmshPC9hPlxuICA8L2E+O1xufVxuZnVuY3Rpb24gT2theUNvbXBvbmVudCgpIHtcbiAgcmV0dXJuIDxhIGhyZWY9Jy9kZXN0aW5hdGlvbic+XG4gICAgSSBhbSBqdXN0IGEgbGluay5cbiAgPC9hPjtcbn0ifQ==)

### Description

React will produce a warning message if you nest a link element inside of another link element. This rule will catch this mistake!


### YAML

```yaml
id: no-nested-links
language: tsx
severity: error
rule:
  pattern: <a $$$>$$$A</a>
  has:
    pattern: <a $$$>$$$</a>
    stopBy: end
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```tsx {1-5}
function Component() {
  return <a href='/destination'>
    <a href='/anotherdestination'>Nested link!</a>
  </a>;
}
function OkayComponent() {
  return <a href='/destination'>
    I am just a link.
  </a>;
}
```

### Contributed by
[Tom MacWright](https://macwright.com/)