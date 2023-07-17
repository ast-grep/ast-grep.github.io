<!--
---
language: TypeScript
playgroundLink: '[TODO]'
command:  'sg -p [TODO] -r [TODO]'
hasFix: true
ruleType: 'pattern' # 'pattern' or 'yaml'
---
-->

## Unnecessary `useState` Type

### Description

React's [`useState`](https://react.dev/reference/react/useState) is a Hook that lets you add a state variable to your component. The type annotation of `useState`'s generic type argument, for example `useState<number>(123)`, is unnecessary if TypeScript can infer the type of the state variable from the initial value.

We can usually skip annotating if the generic type argument is a single primitive type like `number`, `string` or `boolean`.

<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

::: code-group
```ts [number]
useState<number>($A)
```

```ts [string]
useState<string>($A)
```

```ts [boolean]
useState<boolean>($A)
```
:::

<!-- Optional Fix. Delete this section if no fix available -->
### Fix

```ts
useState($A)
```

### Example

```ts
function Component() {
  const [name, setName] = useState<string>('Dan')
}
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```ts
function Component() {
  const [name, setName] = useState<string>('Dan') // [!code --]
  const [name, setName] = useState('Dan') // [!code ++]
}
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim)
