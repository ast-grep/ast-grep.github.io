## Unnecessary `useState` Type <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoidHlwZXNjcmlwdCIsInF1ZXJ5IjoidXNlU3RhdGU8c3RyaW5nPigkQSkiLCJyZXdyaXRlIjoidXNlU3RhdGUoJEEpIiwiY29uZmlnIjoiIyBZQU1MIFJ1bGUgaXMgbW9yZSBwb3dlcmZ1bCFcbiMgaHR0cHM6Ly9hc3QtZ3JlcC5naXRodWIuaW8vZ3VpZGUvcnVsZS1jb25maWcuaHRtbCNydWxlXG5ydWxlOlxuICBhbnk6XG4gICAgLSBwYXR0ZXJuOiBjb25zb2xlLmxvZygkQSlcbiAgICAtIHBhdHRlcm46IGNvbnNvbGUuZGVidWcoJEEpXG5maXg6XG4gIGxvZ2dlci5sb2coJEEpIiwic291cmNlIjoiZnVuY3Rpb24gQ29tcG9uZW50KCkge1xuICBjb25zdCBbbmFtZSwgc2V0TmFtZV0gPSB1c2VTdGF0ZTxzdHJpbmc+KCdSZWFjdCcpXG59In0=)

### Description

React's [`useState`](https://react.dev/reference/react/useState) is a Hook that lets you add a state variable to your component. The type annotation of `useState`'s generic type argument, for example `useState<number>(123)`, is unnecessary if TypeScript can infer the type of the state variable from the initial value.

We can usually skip annotating if the generic type argument is a single primitive type like `number`, `string` or `boolean`.

<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

::: code-group
```bash [number]
sg -p 'useState<number>($A)' -r 'useState($A)' -l ts
```

```bash [string]
sg -p 'useState<string>($A)' -r 'useState($A)'
```

```bash [boolean]
sg -p 'useState<boolean>($A)' -r 'useState($A)'
```
:::

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```ts {2}
function Component() {
  const [name, setName] = useState<string>('React')
}
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```ts
function Component() {
  const [name, setName] = useState<string>('React') // [!code --]
  const [name, setName] = useState('React') // [!code ++]
}
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim)