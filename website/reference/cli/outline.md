---
outline: [2, 3]
---

# `ast-grep outline`

Explore code structure for symbols, imports, exports, and members.

Use `outline` to inspect file structure, imports, exports, and direct members
before opening full source files.

For the item/member concepts behind this output, see
[How Outline Entries Work](/reference/outline-rules.html#how-outline-entries-work).

## Usage

```shell
ast-grep outline [OPTIONS] [PATHS]...
```

## Arguments

`[PATHS]...`

The paths to search. You can provide multiple paths separated by spaces.

[default: `.`]

When no path is provided and `--stdin` is not used, `outline` searches the
current directory.

## Outline Options

### `--items <ITEMS>`

Select top-level items before `--match` and `--type` filtering.

[default: `auto`]

Possible values:

* `auto`: use the file, directory, or stdin default.
* `structure`: include top-level structure where `isImport` is false.
* `exports`: include top-level items where `isExported` is true.
* `imports`: include top-level items where `isImport` is true.
* `all`: include all top-level items, including imports and explicit export edges.

### `--view <VIEW>`

Control text presentation.

[default: `auto`]

Possible values:

* `auto`: use `names` for directory input and `digest` for file or stdin input.
* `names`: group top-level item names by symbol type.
* `signatures`: show one source/signature line per top-level item.
* `digest`: show signatures plus compact direct member name digests.
* `expanded`: show one source/signature line per top-level item and direct member.

### `--match <REGEX>`

Filter top-level items with a Rust regular expression.

The regex is applied to useful top-level item fields: name, signature, and first
source line. It is case-sensitive by default. Invalid regexes are CLI errors.

`--match` does not filter members directly.

### `--type <TYPE[,TYPE...]>`

Filter top-level items by symbol type.

Use lower camel case symbol type names such as `class`, `function`, `struct`,
`enumMember`, and `typeParameter`. Multiple values are comma-separated and work
as an OR filter.

Examples:

```shell
ast-grep outline crates --type struct,enum,interface
ast-grep outline src/parser.ts --match Parser --type class
```

`--type` filters top-level items only. It does not select class methods or
fields unless those symbols are extracted as top-level items in the source.

### `--pub-members`

Show only public or externally usable members in `digest` and `expanded` views.

If an extractor omits member publicness, `outline` treats the member as public.

### `--outline-rules <FILE>`

Load additional outline extractor definitions.

Each file is a stream of YAML documents. These rules are loaded in addition to
bundled extractor definitions and any outline rules configured on custom
languages in `sgconfig.yml`.

See [outline extraction rule reference](/reference/outline-rules.html).

### `--no-default-outline-rules`

Disable bundled extractor definitions.

Use this with `--outline-rules` when you want a project-specific extractor
catalog to replace the built-in one.

## Input Options

### `-l, --lang <LANG>`

Specify the input language.

For path input, ast-grep parses only files of this language. For stdin, this
flag is required because ast-grep cannot infer a language from standard input.

### `-c, --config <CONFIG_FILE>`

Path to ast-grep root config.

[default: `sgconfig.yml`]

`outline` uses project config for custom language registration and for
`customLanguages.<name>.outlineRules`.

### `--stdin`

Read source from standard input.

Use this with `--lang`:

```shell
cat src/parser.ts | ast-grep outline --stdin --lang ts
```

### `--globs <GLOBS>`

Include or exclude file paths.

Globbing rules match `.gitignore` globs. Prefix a glob with `!` to exclude it.
Multiple `--globs` flags may be used.

### `--follow`

Follow symbolic links while traversing directories.

### `--no-ignore <FILE_TYPE>`

Do not respect hidden file system or ignore files.

Possible values:

* `hidden`
* `dot`
* `exclude`
* `global`
* `parent`
* `vcs`

### `-j, --threads <NUM>`

Set the approximate number of threads to use.

The default value `0` lets ast-grep choose a thread count using heuristics.

[default: `0`]

## Output Options

### `--json[=<STYLE>]`

Output selected outline entries as JSON.

Possible values:

* `pretty`: pretty-printed JSON. This is the default when `--json` is passed
  without a value.
* `compact`: compact single-line JSON.
* `stream`: newline-delimited file objects.

The JSON shape is grouped by file. `--json=stream` emits the same file object
shape once per line.

### `--color <WHEN>`

Control ANSI color in text output.

[default: `auto`]

Possible values:

* `auto`
* `always`
* `ansi`
* `never`

## Text Output

Text output depends on `--view`:

::: code-group

```text [names]
src/parser.ts
class: Parser
function: parseRule, parsePattern
```

```text [signatures]
src/parser.ts
12: export function parseRule(...)
40: export class Parser
```

```text [digest]
src/parser.ts
12: export function parseRule(...)
40: export class Parser
    methods: parse, recover
```

```text [expanded]
src/parser.ts
12: export function parseRule(...)
40: export class Parser
44:   parse(...)
73:   recover(...)
```

:::

For direct file and stdin input, an empty result prints an explicit file block:

```text
src/empty.ts
nothing found
```

Directory walks suppress files with no selected items. If a directory or
mixed-input command selects nothing overall, `outline` prints one command-level
`nothing found` message.

## JSON Output

JSON output contains file objects. `--json` and `--json=compact` emit an array
of file objects. `--json=stream` emits one file object per line.

One file object looks like this:

```json
{
  "path": "src/parser.ts",
  "language": "TypeScript",
  "items": [
    {
      "name": "Parser",
      "symbolType": "class",
      "role": "item",
      "isImport": false,
      "isExported": true,
      "range": {
        "byteOffset": { "start": 1200, "end": 2500 },
        "start": { "line": 39, "column": 0 },
        "end": { "line": 97, "column": 1 }
      },
      "signature": "export class Parser",
      "astKind": "class_declaration",
      "members": [
        {
          "name": "parse",
          "symbolType": "method",
          "role": "member",
          "isPublic": true,
          "range": {
            "byteOffset": { "start": 1300, "end": 1900 },
            "start": { "line": 43, "column": 2 },
            "end": { "line": 71, "column": 3 }
          },
          "signature": "parse(...)",
          "astKind": "method_definition"
        }
      ]
    }
  ]
}
```

The output shape is:

```ts
/** `--json` and `--json=compact` emit this array shape. */
type OutlineJsonOutput = OutlineFile[]

interface OutlineFile {
  path: string
  language: string
  items: OutlineItem[]
}

/** Shared fields for top-level items and direct members. */
interface OutlineEntry {
  /** Lower camel case name compatible with LSP SymbolKind. */
  symbolType: string
  name: string
  /** Zero-based line/column positions plus byte offsets. */
  range: OutlineRange
  signature: string
  astKind: string
}

interface OutlineItem extends OutlineEntry {
  role: 'item'
  isImport: boolean
  isExported: boolean
  /** Direct syntactic children selected by the current view. */
  members?: OutlineMember[]
}

interface OutlineMember extends OutlineEntry {
  role: 'member'
  isPublic: boolean
}

interface OutlineRange {
  byteOffset: {
    start: number
    end: number
  }
  start: OutlinePosition
  end: OutlinePosition
}

interface OutlinePosition {
  line: number
  column: number
}
```

For `--json=stream`, parse each line as `OutlineFile` instead of parsing the
whole output as `OutlineJsonOutput`.

## Default Behavior

`outline` chooses defaults based on the input:

| Input | Equivalent default |
| --- | --- |
| Stdin | `--items structure --view digest` |
| Explicit files only | `--items structure --view digest` |
| Any directory input | `--items exports --view names` |

When files and directories are mixed, the directory default is used for the
whole command.

## Exit Codes

The program exits with status code:

* `0`: command completed, including an empty outline.
* `2`: fatal read, parse, or configuration error.

Invalid CLI arguments are reported by clap.
