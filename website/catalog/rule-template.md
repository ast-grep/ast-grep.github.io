---
language: JavaScript # please fully spell the language
playgroundLink: '[TODO]'
command:  'sg -p [TODO] -r [TODO]'
hasFix: true
ruleType: 'pattern' # 'pattern' or 'yaml'
---

## Your Rule Name

* [Playground Link](/playground.html#)

### Description

Some Description for your rule!

<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

```shell
sg -p pattern -r rewrite -l js
# or without fixer
sg -p pattern -l js
```

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```js {1}
var a = 123
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```js
var a = 123 // [!code --]
let a = 123 // [!code ++]
```

### Contributed by
[Author Name](https://your-social.link)
