---
outline: [2, 3]
---

# Outline Rule Fields Reference

This page documents the fields in each outline extractor document. For the
concepts behind items, members, rule loading, and custom rule files, see
[Outline Extraction Rules](/reference/outline-rules).

An outline rule file is a stream of YAML documents. Each document defines one
extractor. Separate documents with `---`.

## Common Fields

These fields are shared by item and member extractors. They describe the outline
entry that will be produced.

### `id`

* type: `String`
* required: true

Stable extractor id used in diagnostics and `parentRuleIds`.

```yaml
id: ts-class
```

### `language`

* type: `String`
* required: true

The language this extractor applies to. Use a built-in ast-grep language name or
a custom language registered in `sgconfig.yml`.

```yaml
language: TypeScript
```

### `role`

* type: `item | member`
* required: true

Controls where the extracted entry appears.

* `item`: top-level file or module structure, including declarations, imports,
  and explicit exports.
* `member`: direct child structure under an item, such as fields, methods,
  constructors, enum variants, or module children.

```yaml
role: item
```

### `symbolType`

* type: `String`
* required: true

The outline category for the entry. Values use lower camel case names compatible
with LSP `SymbolKind`.

Common values:

| Source construct | `symbolType` |
| --- | --- |
| File-level source unit | `file` |
| Import or module dependency | `module` |
| Module declaration | `module` |
| Namespace declaration | `namespace` |
| Package declaration | `package` |
| Class declaration | `class` |
| Method declaration | `method` |
| Object or class property | `property` |
| Struct or class field | `field` |
| Constructor | `constructor` |
| Enum declaration | `enum` |
| Interface, trait, or protocol | `interface` |
| Free function | `function` |
| Variable | `variable` |
| Constant | `constant` |
| Object or map key | `key` |
| Enum variant or member | `enumMember` |
| Struct declaration | `struct` |
| Operator overload | `operator` |
| Type or generic parameter | `typeParameter` |

Do not create custom symbol types for imports or exports. Use `symbolType`
together with `isImport` and `isExported`.

### `name`

* type: `String`
* required: true

Template used to compute the displayed entry name. It can reference captured or
transformed metavariables.

```yaml
name: $NAME
```

Text fields use ast-grep-style template replacement:

* `$NAME`: captured metavariable text.
* `$CLEAN_NAME`: transformed metavariable text.
* literal text mixed with metavariables.

### `signature`

* type: `String`
* required: false

Template used to compute the displayed signature.

```yaml
signature: function $NAME($$$PARAMS)
```

If omitted, `outline` uses the first non-empty line of the matched node as the
signature. This fallback is predictable, but multiline declarations may be more
readable with an explicit `signature`.

## Item-Only Fields

These fields only apply when `role: item`.

### `isImport`

* type: `Boolean | Rule`
* required: false, defaults to `false`
* applies to: `role: item`

Marks a top-level item as an import or dependency edge.

```yaml
isImport: true
```

### `isExported`

* type: `Boolean | Rule`
* required: false, defaults to `true`
* applies to: `role: item`

Marks a top-level item as part of the local public or exported surface.

```yaml
isExported:
  has:
    regex: '^export\b'
```

This is syntax-only. It does not follow re-export chains or resolve module
visibility across files.

## Member-Only Fields

These fields only apply when `role: member`.

### `parentRuleIds`

* type: `String[]`
* required: true for `role: member`

Lists item extractor ids that can contain this member.

```yaml
parentRuleIds: [ts-class, ts-interface]
```

`parentRuleIds` references extractor ids, not symbol names or symbol types.
Actual member attachment is based on syntax containment. `outline` does not
attach members by matching names, receiver types, imports, traits, or references.

### `isPublic`

* type: `Boolean | Rule`
* required: false, defaults to `true`
* applies to: `role: member`

Marks a member as public or externally usable.

```yaml
isPublic:
  has:
    regex: '^pub\b'
```

If a member extractor omits `isPublic`, `outline` treats the member as public.

## Fields Shared with Scan Rules

These fields use the same syntax as normal ast-grep scan and lint rules.

### `rule`

* type: `Rule`
* required: true

The ast-grep rule object that selects the syntax node to turn into an outline
entry.

```yaml
rule:
  pattern: function $NAME($$$PARAMS) { $$$BODY }
```

See [rule object reference](/reference/rule) for supported rule syntax.

### `constraints`

* type: `HashMap<String, Rule>`
* required: false

Additional filters for metavariables, using normal ast-grep constraints.

```yaml
constraints:
  NAME:
    regex: '^[A-Z]'
```

### `utils`

* type: `HashMap<String, Rule>`
* required: false

Local utility rules that can be referenced with `matches`.

### `transform`

* type: `HashMap<String, Transformation>`
* required: false

Transform metavariables before using them in `name` or `signature`.

```yaml
transform:
  NAME:
    replace:
      source: $RAW_NAME
      replace: '^r#'
      by: ''
name: $NAME
```

See [transformation reference](/reference/yaml/transformation).
