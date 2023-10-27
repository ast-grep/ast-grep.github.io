<!-- Remove Badge if it does not have fix-->
## Rewrite MobX Component Style <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoicnVsZTpcbiAgcGF0dGVybjogZXhwb3J0IGNvbnN0ICRDT01QID0gb2JzZXJ2ZXIoJEZVTkMpXG5maXg6IHwtXG4gIGNvbnN0IEJhc2UkQ09NUCA9ICRGVU5DXG4gIGV4cG9ydCBjb25zdCAkQ09NUCA9IG9ic2VydmVyKEJhc2UkQ09NUCkiLCJzb3VyY2UiOiJleHBvcnQgY29uc3QgRXhhbXBsZSA9IG9ic2VydmVyKCgpID0+IHtcbiAgcmV0dXJuIDxkaXY+SGVsbG8gV29ybGQ8L2Rpdj5cbn0pIn0=)

### Description

React and MobX are libraries that help us build user interfaces with JavaScript.

[React hooks](https://react.dev/reference/react) allow us to use state and lifecycle methods in functional components. But we need follow some hook rules, or React may break. [MobX](https://mobx.js.org/react-integration.html) has an `observer` function that makes a component update when data changes.

When we use the `observer` function like this:

```JavaScript
export const Example = observer(() => {…})
```

ESLint, the tool that checks hooks, thinks that `Example` is not a React component, but just a regular function. So it does not check the hooks inside it, and we may miss some wrong usages.

To fix this, we need to change our component style to this:

```JavaScript
const BaseExample = () => {…}
const Example = observer(BaseExample)
```

Now ESLint can see that `BaseExample` is a React component, and it can check the hooks inside it.

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
rule:
  pattern: export const $COMP = observer($FUNC)
fix: |-
  const Base$COMP = $FUNC
  export const $COMP = observer(Base$COMP)
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```js {1-3}
export const Example = observer(() => {
  return <div>Hello World</div>
})
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```js
export const Example = observer(() => { // [!code --]
  return <div>Hello World</div>         // [!code --]
})                                      // [!code --]
const BaseExample = () => {             // [!code ++]
  return <div>Hello World</div>         // [!code ++]
}                                       // [!code ++]
export const Example = observer(BaseExample) // [!code ++]
```

### Contributed by
[Bryan Lee](https://twitter.com/meetliby/status/1698601672568901723)
