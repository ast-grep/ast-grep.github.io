<!--
---
language: TypeScript
playgroundLink: '[TODO]'
command:  'sg -p [TODO] -r [TODO]'
hasFix: true
ruleType: 'pattern' # 'pattern' or 'yaml'
---
-->

## No `console` except in `catch` block <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImlmICRBLmhhc19mZWF0dXJlP1xuICAgICQkJEJcbmVsc2UgXG4gICAgJCQkQyBcbmVuZCAiLCJyZXdyaXRlIjoiJCQkQiIsImNvbmZpZyI6InJ1bGU6XG4gIGFueTpcbiAgICAtIHBhdHRlcm46IGNvbnNvbGUuZXJyb3IoJCQkKVxuICAgICAgbm90OlxuICAgICAgICBpbnNpZGU6XG4gICAgICAgICAga2luZDogY2F0Y2hfY2xhdXNlXG4gICAgICAgICAgc3RvcEJ5OiBlbmRcbiAgICAtIHBhdHRlcm46IGNvbnNvbGUuJE1FVEhPRCgkJCQpXG5jb25zdHJhaW50czpcbiAgTUVUSE9EOlxuICAgIHJlZ2V4OiAnbG9nfGRlYnVnfHdhcm4nXG5maXg6ICcnIiwic291cmNlIjoiY29uc29sZS5kZWJ1ZygnJylcbnRyeSB7XG4gICAgY29uc29sZS5sb2coJ2hlbGxvJylcbn0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpXG59In0=)

### Description

Using `console` methods is usually for debugging purposes and therefore not suitable to ship to the client.
`console` can expose sensitive information, clutter the output, or affect the performance.

The only exception is using `console.error` to log errors in the catch block, which can be useful for debugging production.

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
rule:
  any:
    - pattern: console.error($$$)
      not:
        inside:
          kind: catch_clause
          stopBy: end
    - pattern: console.$METHOD($$$)
constraints:
  METHOD:
    regex: 'log|debug|warn'
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```ts {1,3}
console.debug('')
try {
    console.log('hello')
} catch (e) {
    console.error(e) // OK
}
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```ts
console.debug('') // [!code --]
try {
    console.log('hello') // [!code --]
} catch (e) {
    console.error(e) // OK
}
```

### Contributed by
Inspired by [Jerry Mouse](https://github.com/WWK563388548)
