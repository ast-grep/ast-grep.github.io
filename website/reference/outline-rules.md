---
outline: [2, 3]
---

# Outline Extraction Rule Reference

Outline extraction rules tell `ast-grep outline` how to turn parsed source code
into outline entries.

Most users do not need to write these rules. ast-grep ships bundled extractors
for supported languages. Write custom outline rules when:

* a supported language misses syntax your project uses;
* you use a custom language registered in `sgconfig.yml`;
* you want a project-specific outline shape.

For a custom language registered in `sgconfig.yml`, attach its outline rule file
with `outlineRules`:

```yaml
customLanguages:
  mylang:
      libraryPath: parsers/mylang.so
      extensions: [mylang]
      outlineRules: outline/mylang.yml
```

`outlineRules` is resolved relative to `sgconfig.yml`. `ast-grep outline` loads
these configured custom language rules automatically.

For one-off or extra extractor files, pass `--outline-rules`:

```shell
ast-grep outline src --outline-rules project-outline.yml
```

Rules configured in `customLanguages` are loaded before command-line
`--outline-rules` files.

Replace bundled rules completely with:

```shell
ast-grep outline src \
  --no-default-outline-rules \
  --outline-rules project-outline.yml
```

## Rule File Format

An outline rule file is a stream of YAML documents. Each document defines one
extractor.

```yaml
id: rust-struct
language: Rust
role: item
symbolType: struct
rule:
  pattern: $VIS struct $NAME { $$$BODY }
name: $NAME
isExported:
  has:
    regex: '^pub\b'
---
id: rust-field
language: Rust
role: member
parentRuleIds: [rust-struct]
symbolType: field
rule:
  pattern: $VIS $NAME: $TYPE
name: $NAME
signature: $VIS $NAME: $TYPE
isPublic:
  has:
    regex: '^pub\b'
```

`rule`, `constraints`, `utils`, and `transform` use the same ast-grep YAML
fields as normal rules. Outline rules add metadata for output placement, symbol
type, names, signatures, and visibility flags.

If a top-level item extractor omits `isImport`, it defaults to `false`. If it
omits `isExported`, it defaults to `true`. If a member extractor omits
`isPublic`, it defaults to `true`. Set these fields explicitly when the default
would make `--items imports`, `--items exports`, or `--pub-members` misleading.

## Extractor Fields

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

### `rule`

* type: `Rule`
* required: true

The ast-grep rule object that selects the syntax node to turn into an outline
entry.

```yaml
rule:
  pattern: function $NAME($$$PARAMS) { $$$BODY }
```

See [rule object reference](/reference/rule.html) for supported rule syntax.

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

See [transformation reference](/reference/yaml/transformation.html).

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

## Boolean Fields

`isImport`, `isExported`, and `isPublic` can be literal booleans or rule
predicates.

```yaml
isImport: true
isExported: false
isPublic:
  has:
    regex: '^pub\b'
```

When the value is a rule predicate, it is evaluated against the matched
candidate node. Normal ast-grep relational rules such as `has` and `inside`
keep their usual meaning relative to that candidate.

Prefer one extractor with boolean derivation over duplicated extractors.

```yaml
# Prefer this.
id: rust-struct
language: Rust
role: item
symbolType: struct
rule:
  pattern: $VIS struct $NAME { $$$BODY }
name: $NAME
isExported:
  has:
    regex: '^pub\b'
```

This handles both:

```rust
struct Foo {}
pub struct Bar {}
```

## Member Attachment

Member extraction is syntactic.

For each member candidate, `outline` finds the nearest containing item whose
extractor id is listed in `parentRuleIds`. The member is attached only when it
is a direct structural child of that item.

This means:

* class methods can attach to classes;
* enum variants can attach to enums;
* declarations inside modules can attach to modules;
* Rust `impl` blocks remain top-level items unless a rule extracts members
  inside the `impl`;
* Go receiver methods remain top-level items because Go does not nest methods
  inside type declarations.

`outline` does not infer membership from names, receiver types, implemented
traits, references, imports, or type resolution.

## Examples

### TypeScript Function

```yaml
id: ts-function
language: TypeScript
role: item
symbolType: function
rule:
  pattern: function $NAME($$$PARAMS) { $$$BODY }
name: $NAME
signature: function $NAME($$$PARAMS)
```

### TypeScript Class

```yaml
id: ts-class
language: TypeScript
role: item
symbolType: class
rule:
  any:
    - pattern: class $NAME { $$$BODY }
    - pattern: export class $NAME { $$$BODY }
name: $NAME
isExported:
  any:
    - regex: '^export\b'
    - inside:
        kind: export_statement
```

### TypeScript Method

```yaml
id: ts-method
language: TypeScript
role: member
parentRuleIds: [ts-class]
symbolType: method
rule:
  pattern: $NAME($$$PARAMS) { $$$BODY }
name: $NAME
signature: $NAME($$$PARAMS)
```

### Rust Import And Re-export

```yaml
id: rust-use
language: Rust
role: item
symbolType: module
rule:
  pattern: $VIS use $TARGET;
transform:
  NAME:
    replace:
      source: $TARGET
      replace: '^.*::'
      by: ''
name: $NAME
isImport: true
isExported:
  has:
    regex: '^pub\b'
```

This can represent both ordinary imports and public re-exports:

```rust
use crate::parser::Parser;
pub use internal_mod as api;
```

The re-export is one item with both `isImport: true` and `isExported: true`.

## Custom Languages

For custom languages:

1. Register the parser in `sgconfig.yml` with ast-grep's `customLanguages`.
2. Write outline extractor documents with `language: <custom-language-name>`.
3. Add the extractor file path to the custom language's `outlineRules` field.
4. Run `ast-grep outline`.

Conceptual example:

```yaml
# sgconfig.yml
customLanguages:
  mylang:
      libraryPath: parsers/mylang.so
      extensions: [mylang]
      outlineRules: outline/mylang.yml
```

```yaml
# outline/mylang.yml
id: mylang-function
language: mylang
role: item
symbolType: function
rule:
  pattern: def $NAME($$$ARGS) $$$BODY
name: $NAME
signature: def $NAME($$$ARGS)
```

```shell
ast-grep outline src -l mylang
```

Unsupported languages return an empty outline and a successful exit status.

## What Rules Should Not Do

Outline extraction should stay focused on local file structure. Do not use
outline rules to promise semantic facts such as:

* where a symbol is referenced;
* which implementation dispatch will call;
* full transitive public APIs;
* call graphs or data-flow edges;
* normalized relationship fields such as `extends`, `implements`, or
  `implementedFor`;
* arbitrary metadata fields such as `async`, `override`, `static`, or
  decorators.

For those questions, use normal ast-grep rules, language-specific tools, or an
LSP after `outline` has helped you find the relevant source.
