## Reverse React Compiler™ <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InRzeCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJyZWxheGVkIiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogcmV3cml0ZS1jYWNoZSBcbmxhbmd1YWdlOiB0c3hcbnJ1bGU6XG4gIGFueTpcbiAgLSBwYXR0ZXJuOiB1c2VDYWxsYmFjaygkRk4sICQkJClcbiAgLSBwYXR0ZXJuOiBtZW1vKCRGTiwgJCQkKVxuZml4OiAkRk5cblxuLS0tXG5cbmlkOiByZXdyaXRlLXVzZS1tZW1vXG5sYW5ndWFnZTogdHN4XG5ydWxlOiB7IHBhdHRlcm46ICd1c2VNZW1vKCRGTiwgJCQkKScgfVxuZml4OiAoJEZOKSgpIiwic291cmNlIjoiY29uc3QgQ29tcG9uZW50ID0gKCkgPT4ge1xuICBjb25zdCBbY291bnQsIHNldENvdW50XSA9IHVzZVN0YXRlKDApXG4gIGNvbnN0IGluY3JlbWVudCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRDb3VudCgocHJldkNvdW50KSA9PiBwcmV2Q291bnQgKyAxKVxuICB9LCBbXSlcbiAgY29uc3QgZXhwZW5zaXZlQ2FsY3VsYXRpb24gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAvLyBtb2NrIEV4cGVuc2l2ZSBjYWxjdWxhdGlvblxuICAgIHJldHVybiBjb3VudCAqIDJcbiAgfSwgW2NvdW50XSlcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8cD5FeHBlbnNpdmUgUmVzdWx0OiB7ZXhwZW5zaXZlQ2FsY3VsYXRpb259PC9wPlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtpbmNyZW1lbnR9Pntjb3VudH08L2J1dHRvbj5cbiAgICA8Lz5cbiAgKVxufSJ9)

### Description

React Compiler is a build-time only tool that automatically optimizes your React app, working with plain JavaScript and understanding the Rules of React without requiring a rewrite. It optimizes apps by automatically memoizing code, similar to `useMemo`, `useCallback`, and `React.memo`, reducing unnecessary recomputation due to incorrect or forgotten memoization.

Reverse React Compiler™ is a [parody tweet](https://x.com/aidenybai/status/1881397529369034997) that works in the opposite direction. It takes React code and removes memoization, guaranteed to make your code slower. ([not](https://x.com/kentcdodds/status/1881404373646880997) [necessarily](https://dev.to/prathamisonline/are-you-over-using-usememo-and-usecallback-hooks-in-react-5lp))

It is originally written in Babel and this is an [ast-grep version](https://x.com/hd_nvim/status/1881402678493970620) of it.

:::details The Original Babel Implementation
For comparison purposes only. Note the original code [does not correctly rewrite](https://x.com/hd_nvim/status/1881404893136896415) `useMemo`.

```js
const ReverseReactCompiler = ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      const callee = path.node.callee
      if (
        t.isIdentifier(callee, { name: 'useMemo' }) ||
        t.isIdentifier(callee, { name: 'useCallback' }) ||
        t.isIdentifier(callee, { name: 'memo' })
      ) {
        path.replaceWith(args[0])
      }
    },
  },
})
```

:::

### YAML

```yaml
id: rewrite-cache
language: tsx
rule:
  any:
  - pattern: useCallback($FN, $$$)
  - pattern: memo($FN, $$$)
fix: $FN
---
id: rewrite-use-memo
language: tsx
rule: { pattern: 'useMemo($FN, $$$)' }
fix: ($FN)()   # need IIFE to wrap memo function
```

### Example

```tsx {3-5,6-9}
const Component = () => {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => {
    setCount((prevCount) => prevCount + 1)
  }, [])
  const expensiveCalculation = useMemo(() => {
    // mock Expensive calculation
    return count * 2
  }, [count])

  return (
    <>
      <p>Expensive Result: {expensiveCalculation}</p>
      <button onClick={increment}>{count}</button>
    </>
  )
}
```

### Diff

```tsx
const Component = () => {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => { // [!code --]
    setCount((prevCount) => prevCount + 1) // [!code --]
  }, []) // [!code --]
  const increment = () => { // [!code ++]
    setCount((prevCount) => prevCount + 1) // [!code ++]
  } // [!code ++]
  const expensiveCalculation = useMemo(() => { // [!code --]
    // mock Expensive calculation             // [!code --]
    return count * 2 // [!code --]
  }, [count]) // [!code --]
  const expensiveCalculation = (() => { // [!code ++]
    // mock Expensive calculation      // [!code ++]
    return count * 2 // [!code ++]
  })() // [!code ++]
  return (
    <>
      <p>Expensive Result: {expensiveCalculation}</p>
      <button onClick={increment}>{count}</button>
    </>
  )
}
```

### Contributed by

Inspired by [Aiden Bai](https://twitter.com/aidenybai)
