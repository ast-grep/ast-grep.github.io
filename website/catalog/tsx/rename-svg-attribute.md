## Rename SVG Attribute <Badge type="tip" text="Has Fix" />


* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InRzeCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJyZWxheGVkIiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogcmV3cml0ZS1zdmctYXR0cmlidXRlXG5sYW5ndWFnZTogdHN4XG5ydWxlOlxuICBwYXR0ZXJuOiAkUFJPUFxuICByZWdleDogKFthLXpdKyktKFthLXpdKVxuICBraW5kOiBwcm9wZXJ0eV9pZGVudGlmaWVyXG4gIGluc2lkZTpcbiAgICBraW5kOiBqc3hfYXR0cmlidXRlXG50cmFuc2Zvcm06XG4gIE5FV19QUk9QOlxuICAgIGNvbnZlcnQ6XG4gICAgICBzb3VyY2U6ICRQUk9QXG4gICAgICB0b0Nhc2U6IGNhbWVsQ2FzZVxuZml4OiAkTkVXX1BST1AiLCJzb3VyY2UiOiJjb25zdCBlbGVtZW50ID0gKFxuICA8c3ZnIHdpZHRoPVwiMTAwXCIgaGVpZ2h0PVwiMTAwXCIgdmlld0JveD1cIjAgMCAxMDAgMTAwXCI+XG4gICAgPHBhdGggZD1cIk0xMCAyMCBMMzAgNDBcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgZmlsbC1vcGFjaXR5PVwiMC41XCIgLz5cbiAgPC9zdmc+XG4pIn0=)

### Description

[SVG](https://en.wikipedia.org/wiki/SVG)(Scalable Vector Graphics)s' hyphenated names are not compatible with JSX syntax in React. JSX requires [camelCase naming](https://react.dev/learn/writing-markup-with-jsx#3-camelcase-salls-most-of-the-things) for attributes.
For example, an SVG attribute like `stroke-linecap` needs to be renamed to `strokeLinecap` to work correctly in React.

### YAML
```yaml
id: rewrite-svg-attribute
language: tsx
rule:
  pattern: $PROP            # capture in metavar
  regex: ([a-z]+)-([a-z])   # hyphenated name
  kind: property_identifier
  inside:
    kind: jsx_attribute     # in JSX attribute
transform:
  NEW_PROP:                 # new property name
    convert:                # use ast-grep's convert
      source: $PROP
      toCase: camelCase     # to camelCase naming
fix: $NEW_PROP
```

### Example
```tsx {3}
const element = (
  <svg width="100" height="100" viewBox="0 0 100 100">
    <path d="M10 20 L30 40" stroke-linecap="round" fill-opacity="0.5" />
  </svg>
)
```

### Diff
```ts
const element = (
  <svg width="100" height="100" viewBox="0 0 100 100">
    <path d="M10 20 L30 40" stroke-linecap="round" fill-opacity="0.5" /> // [!code --]
    <path d="M10 20 L30 40" strokeLinecap="round" fillOpacity="0.5" />   // [!code ++]
  </svg>
)
```

### Contributed by
Inspired by [SVG Renamer](https://admondtamang.medium.com/introducing-svg-renamer-your-solution-for-react-svg-attributes-26503382d5a8)