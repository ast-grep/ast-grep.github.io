## Extract i18n Keys <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6Imh0bWwiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoicmVsYXhlZCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicnVsZTpcbiAga2luZDogdGV4dFxuICBwYXR0ZXJuOiAkVFxuICBub3Q6XG4gICAgcmVnZXg6ICdcXHtcXHsuKlxcfVxcfSdcbmZpeDogXCJ7eyAkKCckVCcpIH19XCIiLCJzb3VyY2UiOiI8dGVtcGxhdGU+XG4gIDxzcGFuPkhlbGxvPC9zcGFuPlxuICA8c3Bhbj57eyB0ZXh0IH19PC9zcGFuPlxuPC90ZW1wbGF0ZT4ifQ==)

### Description

It is tedious to manually find and replace all the text in the template with i18n keys. This rule helps to extract static text into i18n keys. Dynamic text, e.g. mustache syntax, will be skipped.

In practice, you may want to map the extracted text to a key in a dictionary file. While this rule only demonstrates the extraction part, further mapping process can be done via a script reading the output of ast-grep's [`--json`](/guide/tools/json.html) mode, or using [`@ast-grep/napi`](/guide/api-usage/js-api.html).

### YAML

```yaml
id: extract-i18n-key
language: html
rule:
  kind: text
  pattern: $T
  # skip dynamic text in mustache syntax
  not: { regex: '\{\{.*\}\}' }
fix: "{{ $('$T') }}"
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```html {2}
<template>
  <span>Hello</span>
  <span>{{ text }}</span>
</template>
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```html
<template>
  <span>Hello</span> // [!code --]
  <span>{{ $('Hello') }}</span> // [!code ++]
  <span>{{ text }}</span>
</template>
```

### Contributed by

Inspired by [Vue.js RFC](https://github.com/vuejs/rfcs/discussions/705#discussion-7255672)
