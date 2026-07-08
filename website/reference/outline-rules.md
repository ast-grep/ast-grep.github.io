---
outline: [2, 3]
---

# Outline Extraction Rules

Outline extraction rules tell `ast-grep outline` how to turn parsed source code
into outline entries.

## How Outline Entries Work

`ast-grep outline` turns source code into outline entries. Each file contains
top-level **items**, and each item can contain direct **members**.

Items are the main entries someone would scan first: imports, functions,
classes, structs, interfaces, modules, or enums. Members are the direct children
under an item: class methods, fields, constructors, enum variants, or module
children.

An outline entry has:

* a `role`, either `item` or `member`;
* a `symbolType`, such as `function`, `class`, `struct`, `field`, or `method`;
* a `name`;
* a source `range`;
* a source-like `signature`;
* an `astKind` from the underlying tree-sitter node;
* visibility flags, such as `isImport`, `isExported`, or `isPublic`.

Items represent top-level file or module structure. Members represent direct
syntactic children of an item. For example, a class method is a member of the
class, and an enum variant is a member of the enum.

This structure is deliberately simple. It is a reduced common ground across
programming languages: broad enough to describe common local structure, but
small enough to stay predictable in text and JSON output.

The model is also intentionally local. It does not resolve references, infer
types, follow re-export chains, attach methods by receiver type, or build
inheritance relationships. If a relationship cannot be derived from local syntax
containment, it should usually stay out of `outline`.

## How Rules Are Loaded

When `ast-grep outline` runs, it builds a catalog of extraction rules, parses
the input files, then applies the rules for each file's language. Matching
`item` rules create top-level entries. Matching `member` rules create candidate
members, which are attached to the nearest containing item allowed by
`parentRuleIds`.

Rules can come from three places:

* **Default rules**: bundled extractors shipped with ast-grep for supported
  languages.
* **Custom language rules**: rule files registered with
  `customLanguages.<name>.outlineRules` in `sgconfig.yml`.
* **Command-line rules**: extra rule files passed with `--outline-rules`.

By default, all applicable sources are combined. Custom language rules are
loaded before command-line rules. Use `--no-default-outline-rules` when you want
the command-line rule set to replace the bundled default extractors.

## Load Custom Rules

Most users do not need custom rules. ast-grep ships bundled extractors for
supported languages. Add custom rules when a supported language misses syntax
your project uses, when you register a custom language, or when you want a
project-specific outline shape.

### Custom Languages

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

Rules configured in `customLanguages` are loaded before command-line
`--outline-rules` files.

### Command Line

Use `--outline-rules` for one-off extractor files or extra project-specific
rules:

```shell
ast-grep outline src --outline-rules project-outline.yml
```

Replace bundled rules completely with:

```shell
ast-grep outline src \
  --no-default-outline-rules \
  --outline-rules project-outline.yml
```

## Rule File Format

An outline rule file is a stream of YAML documents. Each document defines one
extractor. Separate documents with `---`.

For every supported field, see the
[Outline Rule Fields Reference](/reference/outline-rule-fields).

```yaml
id: rust-struct
language: Rust
role: item
symbolType: struct
rule:
  kind: struct_item
  has:
    field: name
    pattern: $NAME
name: $NAME
isExported: true
---
id: rust-field
language: Rust
role: member
parentRuleIds: [rust-struct]
symbolType: field
rule:
  kind: field_declaration
  has:
    field: name
    pattern: $NAME
name: $NAME
isPublic: true
```

`rule`, `constraints`, `utils`, and `transform` use the same ast-grep YAML
fields as normal rules. Outline rules add metadata for output placement, symbol
type, names, signatures, and visibility flags.

`isImport`, `isExported`, and `isPublic` can be simple booleans or predicate
rules. The [Boolean Fields](#boolean-fields) section explains when to use each
form.

## Names And Signatures

`name` is the short label for an outline entry. It is usually captured from a
named child node:

```yaml
rule:
  all:
    - kind: struct_item
    - has:
        field: name
        pattern: $NAME
name: $NAME
```

`signature` is the source-like text shown after the name. It is optional: when
omitted, `outline` still emits the entry name and range. Add a signature when
the extra text helps users or agents choose what to read next, such as a
function parameter list, class header, or field type.

Use [`transform`](/guide/rewrite/transform) when the matched node is
larger than the text you want to print. The same transformation syntax can also
use [`rewriters`](/guide/rewrite/rewriter) for more advanced AST-based
text generation. For example, a Rust struct match includes the body, but the
outline signature usually only needs the declaration header:

```yaml
rule:
  all:
    - kind: struct_item
    - pattern: $DECL
transform:
  SIG:
    replace:
      source: $DECL
      replace: '\s*\{[\s\S]*$|;\s*$'
      by: ''
signature: '$SIG'
```

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

If a top-level item extractor omits `isImport`, it defaults to `false`. If it
omits `isExported`, it defaults to `true`. If a member extractor omits
`isPublic`, it defaults to `true`. Set these fields explicitly when the default
would make `--items imports`, `--items exports`, or `--pub-members` misleading.

When the value is a rule predicate, it is evaluated against the primary node
matched by the extractor's `rule`. Normal ast-grep relational rules such as
`has` and `inside` keep their usual meaning relative to that node.

Prefer one extractor with boolean derivation over duplicated extractors.

```yaml
# Prefer this.
id: rust-struct
language: Rust
role: item
symbolType: struct
rule:
  kind: struct_item
  has:
    field: name
    pattern: $NAME
name: $NAME
isExported:
  has:
    kind: visibility_modifier
    regex: '^pub'
```

The main `rule` matches every Rust struct item and captures its name. The
`isExported` predicate checks whether the matched struct has a Rust visibility
modifier. That lets one extractor produce different visibility values:

```rust
struct Foo {}
pub struct Bar {}
```

For `struct Foo {}`, `isExported` is `false`. For `pub struct Bar {}`,
`isExported` is `true`.

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

:::: code-group

```yaml [outline.yml]
id: ts-function
language: TypeScript
role: item
symbolType: function
rule:
  pattern: function $NAME($$$PARAMS) { $$$BODY }
name: $NAME
signature: function $NAME($$$PARAMS)
isExported:
  inside:
    kind: export_statement
```

```ts [source.ts]
export function parseRule(source: string) { // item: function parseRule, exported
  return source
}
```

::::

### TypeScript Class

:::: code-group

```yaml [outline.yml]
id: ts-class
language: TypeScript
role: item
symbolType: class
rule:
  pattern: class $NAME { $$$BODY }
name: $NAME
signature: class $NAME
isExported:
  inside:
    kind: export_statement
```

```ts [source.ts]
export class Parser { // item: class Parser, exported
  parse(source: string) {
    return source
  }
}
```

::::

### TypeScript Method

This member extractor attaches to items produced by the `ts-class` extractor
above.

:::: code-group

```yaml [outline.yml]
id: ts-method
language: TypeScript
role: member
parentRuleIds: [ts-class]
symbolType: method
rule:
  kind: method_definition
  all:
    - has:
        field: name
        pattern: $NAME
    - has:
        field: parameters
        pattern: $PARAMS
name: $NAME
signature: $NAME$PARAMS
isPublic:
  not:
    has:
      kind: accessibility_modifier
      regex: '^private$'
```

```ts [source.ts]
export class Parser {
  parse(source: string) { // member: method parse, public
    return source
  }

  private recover() { // member: method recover, private
    return null
  }
}
```

::::

### Rust Import And Re-export

:::: code-group

```yaml [outline.yml]
id: rust-use
language: Rust
role: item
symbolType: module
rule:
  any:
    - pattern: use $TARGET;
    - pattern: pub use $TARGET;
transform:
  NAME:
    replace:
      source: $TARGET
      replace: '^.*::|^.*\s+as\s+'
      by: ''
name: $NAME
isImport: true
isExported:
  has:
    kind: visibility_modifier
    regex: '^pub\b'
```

```rust [source.rs]
use crate::parser::Parser; // item: module Parser, imported
pub use internal_mod as api; // item: module api, imported and exported
```

::::

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
