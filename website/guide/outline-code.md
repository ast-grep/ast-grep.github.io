---
description: Learn how to use ast-grep outline as an agentic coding tool for inspecting source structure before reading full files.
head:
  - - meta
    - name: keywords
      content: ast-grep outline, code outline, code navigation, source structure, coding agents, imports, exports
---

<script setup>
import OutlineStaticOutput from '../src/components/OutlineStaticOutput.vue'
import OutlineTextStyleDemo from '../src/components/OutlineTextStyleDemo.vue'
</script>

# Outline Code <Badge type="warning" text="Experimental" />

`ast-grep outline` gives coding agents a cheap first pass over source code. Use
it when an agent needs to decide which file, symbol, or source range to read
next without opening every candidate file in full.

Common agentic coding uses include:

* see what is inside a file before editing it;
* find the public functions, types, and classes in a folder;
* list what a file imports before following dependencies;
* show the methods, fields, or enum variants under one symbol.

Humans can also use the same output as a compact table of contents for
unfamiliar code. ast-grep prints a stylish, readable command-line view while
still keeping the output compact enough for tools that need precise, low-token
navigation context.

`outline` is syntax-aware, but intentionally local. It parses the files you ask
about with ast-grep and tree-sitter. It does not build an index, resolve types,
follow references, or construct a call graph.

:::tip Alpha preview
`ast-grep outline` is introduced as an alpha preview in ast-grep 0.44.0. The
command is intended for real use, but language coverage and custom extraction
rules may still change based on feedback.
:::

## Basic Usage

`outline` organizes source code into two levels:

* **Items** are top-level things in a file, such as imports, functions,
  classes, structs, interfaces, modules, or enums. An item can be marked as
  _imported_, _exported_, or both.
* **Members** are direct children of items, such as methods, fields,
  constructors, or enum variants. A member can be _public_ or _private_ when the
  language exposes that syntax.

The command prints items first. Depending on the view, it can also print compact
member names or expanded member signatures under each item. The
[outline entry concepts](/reference/outline-rules.html#how-outline-entries-work)
explain the same structure in more detail. For all options and JSON output, see
the [`outline` CLI reference](/reference/cli/outline.html).

Inspect one file:

```shell
ast-grep outline src/parser.ts
```

Example output:

<OutlineStaticOutput variant="file" />

Inspect a directory:

```shell
ast-grep outline src
```

Directory outlines show exported items by default, so the output is a quick map
of the public surface:

<OutlineStaticOutput variant="directory" />

## Prompt AI Agents

`outline` works best when an agent knows to use it before broad file reads. The
command has a small interface, so you can teach the habit with a short,
low-token instruction in `AGENTS.md`, `CLAUDE.md`, or the equivalent file your
coding agent reads.

```md
## Code Navigation

Use `ast-grep outline` before reading full source files when exploring code.

- Use `ast-grep outline <file>` to inspect a candidate file.
- Use `ast-grep outline <dir> --items exports` to find public entry points.

After finding candidate files, use `ast-grep outline` to decide which source
range to read. If your agent supports skills, use the `ast-grep-outline`
skill for more detailed guidance.
```

`ast-grep outline` also has a more detailed
[agent skill](https://github.com/ast-grep/agent-skill) for advanced usage and
CLI argument tweaking.

:::details `SKILL.md`

````md
---
name: ast-grep-outline
description: Use when exploring or modifying a codebase and you need a cheap structural map of files, directories, imports, exports, or direct members before reading full source.
---

# Use ast-grep outline

`ast-grep outline` prints a compact structural map of source code with line
numbers: top-level **items** (imports, functions, classes, structs,
interfaces, modules, enums) and their direct **members** (fields, methods,
constructors, enum variants). It is a local, syntax-only view — cheap enough
to run before any full file read.

Start with structure: find candidate files with search or file names, outline
them, then open only the source range the outline points to. Defaults adapt to
input: a file shows its local structure with member digests; a directory shows
only its exported surface as grouped names.

## When To Use It

**Understand a file before editing.** Get a table of contents, dependencies,
and public entry points before reading implementation details:

```shell
ast-grep outline <file>
ast-grep outline <file> --items imports
ast-grep outline <file> --items exports
```

**Map an unfamiliar directory.** Scan the public surface of a subtree, then
narrow by symbol type when you know what you are looking for:

```shell
ast-grep outline <dir> --items exports
ast-grep outline <dir> --type struct,enum,function
```

**Zoom into a known symbol.** After search finds a likely name, list its
members with line numbers instead of reading the whole body:

```shell
ast-grep outline <file> --match <symbol> --type class --view expanded
```

**Trace dependency direction.** Find which files import a package or module to
decide where a change belongs:

```shell
ast-grep outline <dir> --items imports --view signatures
```

**Review changed files after editing.** Git tells you what changed; outline
summarizes the resulting structure and public surface:

```shell
ast-grep outline $(git diff --name-only HEAD) --items exports
```

## Argument Guide

- `--items <KIND>` selects top-level items: `structure` for local declarations
  (file default), `exports` for public API (directory default), `imports` for
  dependencies, `all` when import/export edges matter together.
- `--view <VIEW>` controls detail, from least to most: `names` for directory
  scans, `signatures` for one line per item, `digest` for signatures plus
  member names, `expanded` for one line per member with its line number.
- `--match <REGEX>` filters top-level items by name or signature. Rust regex,
  case-sensitive; it never matches members.
- `--type <TYPE[,TYPE...]>` keeps only some top-level symbol types, such as
  `--type class,function`. Member types like `method,field` never match
  top-level items.
- `--pub-members` hides private members when the view prints members.
- `--json=stream` emits one JSON object per file with precise ranges. Use it
  only to pipe or post-process entries; prefer text for navigation.

## Limits

`outline` shows local syntax structure. It does not resolve references, infer
types, follow re-export chains, or build a call graph. Use `ast-grep run`,
`rg`, or compiler-backed tools for those questions, then outline the candidate
files they surface.
````

:::

## Control The Output

### Choose What To Show

Use `--items` to choose which top-level entries to include.

```shell
# Local declarations, excluding imports.
ast-grep outline src/parser.ts --items structure

# Public or exported surface.
ast-grep outline src --items exports

# Dependencies imported by a file or subtree.
ast-grep outline src/parser.ts --items imports

# Everything, including imports and explicit export edges.
ast-grep outline src/parser.ts --items all
```

`--items exports` is syntax-only. It recognizes export syntax such as
`export`, `pub`, `pub use`, or language-specific public names when the bundled
extractor for that language supports them. It does not follow re-export chains
across files.

### Choose A View

Use `--view` to control how much text is printed.

```shell
# Group top-level names by symbol type.
ast-grep outline src --view names

# Show one signature line per top-level item.
ast-grep outline src/parser.ts --view signatures

# Show signatures plus compact direct member names.
ast-grep outline src/parser.ts --view digest

# Show signatures for top-level items and direct members.
ast-grep outline src/parser.ts --view expanded
```

The views are optimized for different reading tasks:

| View | Output style |
| --- | --- |
| `names` | Compact grouped names, best for directories. |
| `signatures` | Source line and signature for each top-level item. |
| `digest` | Signatures plus grouped direct member names, best for files. |
| `expanded` | One line per top-level item and direct member. |

Members are direct syntactic children. For example, class methods are members of
the class, enum variants are members of the enum, and declarations inside a
module can be members of the module. Flat source stays flat: Rust `impl` blocks
and Go receiver methods are shown where they appear in the file.

### Defaults

When `--items` and `--view` are not set, the default changes by input type:

| Input | Default items | Default view | Use case |
| --- | --- | --- | --- |
| File | `structure` | `digest` | Inspect a file's local structure. |
| Directory | `exports` | `names` | Scan a subtree's public surface. |
| Stdin | `structure` | `digest` | Outline code from another command. |

If a command mixes files and directories, `outline` uses the directory default
for the whole command.

## Outline In Action

Let's see how `outline` changes the same file summary with different command
arguments. The examples below use this file:

```ts
import { Scanner } from "./scanner"

function normalize(source: string) {}

export function parseRule(source: string) {}

export class Parser {
  source: string
  parse() {}
  recover() {}
}
```

Use `--items` when you want a different slice of the same file:

::: code-group

```console [imports]
$ ast-grep outline src/parser.ts --items imports
src/parser.ts
1: import { Scanner } from "./scanner"
```

```console [exports]
$ ast-grep outline src/parser.ts --items exports
src/parser.ts
5: export function parseRule(source: string)
7: export class Parser
```

```console [structure]
$ ast-grep outline src/parser.ts --items structure
src/parser.ts
3: function normalize(source: string)
5: export function parseRule(source: string)
7: export class Parser
    fields: source
    methods: parse, recover
```

:::

Use `--view` when you want more or less detail for the selected entries:

::: code-group

```console [names]
$ ast-grep outline src/parser.ts --view names
src/parser.ts
class: Parser
function: normalize, parseRule
```

```console [signatures]
$ ast-grep outline src/parser.ts --view signatures
src/parser.ts
3: function normalize(source: string)
5: export function parseRule(source: string)
7: export class Parser
```

```console [digest]
$ ast-grep outline src/parser.ts --view digest
src/parser.ts
3: function normalize(source: string)
5: export function parseRule(source: string)
7: export class Parser
    fields: source
    methods: parse, recover
```

```console [expanded]
$ ast-grep outline src/parser.ts --view expanded
src/parser.ts
3: function normalize(source: string)
5: export function parseRule(source: string)
7: export class Parser
8:   source: string
9:   parse()
10:   recover()
```

:::

### Text Output Style

Text output uses styling to keep structural facts visible while staying compact.
Select a style below to see which lines it affects.

<OutlineTextStyleDemo />

## Common Tasks

### Narrow The Outline

Use `--match` to filter top-level items by a regular expression:

```shell
ast-grep outline src/parser.ts --match Parser
```

Use `--type` to keep only certain top-level symbol types:

```shell
ast-grep outline crates --type struct,enum,interface
```

Use both when a name is ambiguous:

```shell
ast-grep outline src/parser.ts --match Parser --type class --view expanded
```

`--match` and `--type` apply only to top-level items. Once a top-level item is
kept, member display is controlled by `--view`.

Use `--pub-members` when you only want public or externally usable members:

```shell
ast-grep outline src/parser.ts --match Parser --view expanded --pub-members
```

Member publicness is also syntax-only. If an extractor cannot determine member
visibility, the member is treated as public.

### Inspect Imports

`outline` can answer dependency-direction questions without reading every
candidate file:

```shell
# What does this file depend on?
ast-grep outline src/parser.ts --items imports

# Which files import a package or module?
ast-grep outline src --items imports --match ast-grep-core --view signatures
```

Example output:

```text
src/parser.ts
6: import { parseAst } from "ast-grep-core"
src/checker.ts
11: import { Rule } from "ast-grep-core"
```

This is a local syntax view. It does not resolve the imported module or prove
which file will be loaded at runtime.

### Use JSON Output

Text output is best for interactive reading. Use JSON when you need to pipe,
filter, or programmatically compare outline entries.

```shell
ast-grep outline src/parser.ts --json
ast-grep outline src --json=compact
ast-grep outline src --json=stream
```

`--json=stream` prints one JSON object per file, which is convenient for large
directories:

```shell
ast-grep outline src --json=stream |
  jq '.items[] | select(.symbolType == "function") | .name'
```

JSON includes file paths, languages, symbol names, symbol types, ranges,
signatures, AST kinds, import/export flags, and nested direct members when the
selected view includes them. Ranges use the same zero-based line and column
convention as ast-grep's other JSON output. See the
[CLI reference](/reference/cli/outline.html#json-output) for the TypeScript
interface.

## Custom Extraction Rules

Built-in language support is based on bundled outline extraction rules. If your
syntax is not covered, you can load extra extractor definitions:

```shell
ast-grep outline src --outline-rules project-outline.yml
```

For a custom language registered in `sgconfig.yml`, prefer registering the
outline rule file with the language itself:

```yaml
customLanguages:
  mylang:
      libraryPath: parsers/mylang.so
      extensions: [mylang]
      outlineRules: outline/mylang.yml
```

`outlineRules` is resolved relative to `sgconfig.yml` and is loaded
automatically by `ast-grep outline`. Command-line `--outline-rules` files are
loaded in addition to configured custom language outline rules.

To replace the bundled rules completely:

```shell
ast-grep outline src \
  --no-default-outline-rules \
  --outline-rules project-outline.yml
```

See the [outline extraction rule reference](/reference/outline-rules.html) for
the YAML format.

## Limits

`outline` returns local structural facts. It does not answer semantic questions:

* where a symbol is referenced;
* which overload or implementation is called;
* what type an expression has;
* what a module re-exports transitively;
* what code is "related" to a symbol.

Use `ast-grep run`, `rg`, your editor, an LSP, or compiler-backed tools after
`outline` points you to the right part of the code.
