## Speed up Barrel Import <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBpbXBvcnQgeyQkJElERU5UU30gZnJvbSAnLi9iYXJyZWwnXG5yZXdyaXRlcnM6XG4tIGlkOiByZXdyaXRlLWlkZW50aWZlclxuICBydWxlOlxuICAgIHBhdHRlcm46ICRJREVOVFxuICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgZml4OiBpbXBvcnQgJElERU5UIGZyb20gJy4vYmFycmVsLyRJREVOVCdcbnRyYW5zZm9ybTpcbiAgSU1QT1JUUzpcbiAgICByZXdyaXRlOlxuICAgICAgcmV3cml0ZXJzOiBbcmV3cml0ZS1pZGVudGlmZXJdXG4gICAgICBzb3VyY2U6ICQkJElERU5UU1xuICAgICAgam9pbkJ5OiBcIlxcblwiXG5maXg6ICRJTVBPUlRTIiwic291cmNlIjoiaW1wb3J0IHsgYSwgYiwgYyB9IGZyb20gJy4vYmFycmVsJzsifQ==)

### Description

A [barrel import](https://adrianfaciu.dev/posts/barrel-files/) is a way to consolidate the exports of multiple modules into a single convenient module that can be imported using a single import statement. For instance, `import {a, b, c} from './barrel'`.

It has [some](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js) [benefits](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/) to import each module directly from its own file without going through the barrel file.
Such as reducing [bundle size](https://dev.to/tassiofront/barrel-files-and-why-you-should-stop-using-them-now-bc4), improving building time or avoiding [conflicting names](https://flaming.codes/posts/barrel-files-in-javascript/).

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: speed-up-barrel-import
language: typescript
# find the barrel import statement
rule:
  pattern: import {$$$IDENTS} from './barrel'
# rewrite imported identifiers to direct imports
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  fix: import $IDENT from './barrel/$IDENT'
# apply the rewriter to the import statement
transform:
  IMPORTS:
    rewrite:
      rewriters: [rewrite-identifer]
      # $$$IDENTS contains imported identifiers
      source: $$$IDENTS
      # join the rewritten imports by newline
      joinBy: "\n"
fix: $IMPORTS
```

### Example

```ts {1}
import { a, b, c } from './barrel'
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```ts
import { a, b, c } from './barrel' // [!code --]
import a from './barrel/a' // [!code ++]
import b from './barrel/b' // [!code ++]
import c from './barrel/c' // [!code ++]
```

### Contributed by

[Herrington Darkholme](https://x.com/hd_nvim)
