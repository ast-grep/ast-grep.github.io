## No `await` in `Promise.all` array <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoiaWQ6IG5vLWF3YWl0LWluLXByb21pc2UtYWxsXG5zZXZlcml0eTogZXJyb3Jcbmxhbmd1YWdlOiBKYXZhU2NyaXB0XG5tZXNzYWdlOiBObyBhd2FpdCBpbiBQcm9taXNlLmFsbFxucnVsZTpcbiAgcGF0dGVybjogYXdhaXQgJEFcbiAgaW5zaWRlOlxuICAgIHBhdHRlcm46IFByb21pc2UuYWxsKCRfKVxuICAgIHN0b3BCeTpcbiAgICAgIG5vdDogeyBhbnk6IFt7a2luZDogYXJyYXl9LCB7a2luZDogYXJndW1lbnRzfV0gfVxuZml4OiAkQSIsInNvdXJjZSI6ImNvbnN0IFtmb28sIGJhcl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gIGF3YWl0IGdldEZvbygpLFxuICBnZXRCYXIoKSxcbiAgKGFzeW5jICgpID0+IHsgYXdhaXQgZ2V0QmF6KCl9KSgpLFxuXSkifQ==)

### Description

Using `await` inside an inline `Promise.all` array is usually a mistake, as it defeats the purpose of running the promises in parallel. Instead, the promises should be created without `await` and passed to `Promise.all`, which can then be awaited.

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: no-await-in-promise-all
language: typescript
rule:
  pattern: await $A
  inside:
    pattern: Promise.all($_)
    stopBy:
      not: { any: [{ kind: array }, { kind: arguments }] }
fix: $A
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```ts {2}
const [foo, bar] = await Promise.all([
  await getFoo(),
  getBar(),
  (async () => {
    await getBaz()
  })(),
])
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```ts
const [foo, bar] = await Promise.all([
  await getFoo(), // [!code --]
  getFoo(), // [!code ++]
  getBar(),
  (async () => {
    await getBaz()
  })(),
])
```

### Contributed by

Inspired by [Alvar Lagerlöf](https://twitter.com/alvarlagerlof)
