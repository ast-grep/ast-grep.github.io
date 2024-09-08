# JSON Mode

Composability is a key perk of command line tooling. ast-grep is no exception.

`--json` will output results in JSON format. This is useful to pipe the results to other tools.

**Example:**

```bash
sg run -p 'Some($A)' -r 'None' --json
```

## Output Data Structure

The format of the JSON output is an array of match objects. Below is an example of a match object generated from the command above.

```json
[
  {
    "text": "Some(matched)",
    "range": {
      "byteOffset": { "start": 10828, "end": 10841 },
      "start": { "line": 303, "column": 2 },
      "end": { "line": 303, "column": 15 }
    },
    "file": "./crates/config/src/rule/mod.rs",
    "lines": "  Some(matched)",
    "replacement": "None",
    "replacementOffsets": { "start": 10828, "end": 10841 },
    "language": "Rust",
    "metaVariables": {
      "single": {
        "A": {
          "text": "matched",
          "range": {
            "byteOffset": { "start": 10833, "end": 10840 },
            "start": { "line": 303, "column": 7 },
            "end": { "line": 303, "column": 14 }
          }
        }
      },
      "multi": {},
      "transformed": {}
    }
  }
]
```

### Match Object Type

Below is the equivalent TypeScript type definition of the match object.

```typescript
interface Match {
  text: string
  range: Range
  file: string // relative path to the file
  // the surrounding lines of the match.
  // It can be more than one line if the match spans multiple ones.
  lines: string
  // optional replacement if the match has a replacement
  replacement?: string
  replacementOffsets?: ByteOffset
  metaVariables?: MetaVariables // optional metavars generated in the match
}

interface Range {
  byteOffset: ByteOffset
  start: Position
  end: Position
}
// UTF-8 encoded byte offset
interface ByteOffset {
  start: number // start is inclusive
  end: number   // end is exclusive
}
interface Position {
  line: number   // zero-based line number
  column: number // zero-based column number
}

// See Pattern doc
interface MetaVariables {
  single: Record<String, MetaVar>
  multi: Record<String, MetaVar[]>
  transformed: Record<String, String> // See Rewrite doc
}
interface MetaVar {
  text: string
  range: Range
}
```

For more information about `MetaVariables` and `transformed` fields, see the [Pattern](/guide/pattern-syntax.html#meta-variable) and [Rewrite](/guide/rewrite/transform.html) documentation.

If you are using [lint rule](/guide/project/lint-rule.html) to find matches, the generated match objects will have several more fields.

```typescript
interface RuleMatch extends Match {
  ruleId: string
  severity: Severity
  note?: string
  message: string
}

enum Severity {
  Error = "error",
  Warning = "warning",
  Info = "info",
  Hint = "hint",
}
```

:::tip line, column, and byte offset are zero-based
The `line`, `column`, and `byteOffset` fields are zero-based. This means that the first line, column, and byte offset are 0, not 1.
The design is consistent with the [LSP](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#position) and [tree-sitter](https://tree-sitter.github.io/tree-sitter/using-parsers#syntax-nodes) specifications.

If you need 1-based numbers, you can use `jq` to transform the output.
:::

## Consuming JSON output

ast-grep embraces the Unix philosophy of composability. The `--json` flag is designed to make it easy to pipe the results to other tools.

For example, you can use [jq](https://stedolan.github.io/jq/) to extract information from the results and render it in [jless](https://jless.io/).
```bash
sg run -p 'Some($A)' -r 'None' --json | jq '.[].replacement' | jless
```

You can also see [an example](https://github.com/ast-grep/ast-grep/issues/1232#issuecomment-2181747911) of using `--json` flag in Vim's QuickFix window.

## Output Format

By default, ast-grep prints the matches in a JSON array that is formatted with indentation and line breaks.
`--json` is equivalent to `--json=pretty`. This makes it easy to read the output by humans.
However, this might not be suitable for other programs that need to process the output from ast-grep. For example, if there are too many matches, the JSON array might be [too large to fit in memory](https://www.wikiwand.com/en/Out_of_memory).

To avoid this problem, you can use the `--json=stream` option when running ast-grep. This option will make ast-grep print each match as a separate JSON object, followed by a newline character. This way, you can stream the output to other programs that can read one object per line and parse it accordingly.

The output of `--json=stream` looks like below:

```
$ sg -p pattern --json=stream
{"text":"Some(matched)", ... }
{"text":"Some(matched)", ... }
{"text":"Some(matched)", ... }
```

You can read the output line by line and process it accordingly.

`--json` accepts one of the following values: `pretty`, `stream`, or `compact`.

:::danger `--json=stream` requires the equal sign
You have to use `--json=<STYLE>` syntax when passing value to the json flag.
A common gotcha is missing the equal sign.
`--json stream` is parsed as `--json=pretty stream` and `stream` is parsed as a directory.
Only `--json=stream` will work as a key-value pair.
:::