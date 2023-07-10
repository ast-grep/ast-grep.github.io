---
language: JavaScript # please fully spell the language
playgroundLink: '[TODO]'
command:  'sg -p [TODO] -r [TODO]'
hasFix: true
ruleType: 'pattern' # 'pattern' or 'yaml'
---

## Your Rule Name

### Description

Some Description for your rule!


<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

```js
var i = 123
```

<!-- Optional Fix. Delete this section if no fix available -->
### Fix

```js
let i = 123
```


<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
```

### Example

```js
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
