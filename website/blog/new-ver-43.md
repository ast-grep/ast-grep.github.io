---
author:
  - name: Herrington Darkholme
search: false
date: 2026-05-25
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep 0.43 - Search Code and Markdown with Structure
  - - meta
    - property: og:url
      content: https://astgrep.com/blog/new-ver-43.html
  - - meta
    - property: og:description
      content: 'ast-grep 0.43 adds Markdown support and brings ESQuery-style selectors to the run command for fast structural queries from the CLI.'
---

# ast-grep 0.43: Search Code and Markdown with Structure

ast-grep 0.43 is here with two practical upgrades for everyday structural search:

- `ast-grep run --kind` now accepts ESQuery-style selectors.
- Markdown is now supported as a first-class language.

Together, they help ast-grep extract the useful structure from code, docs, prompts, READMEs, changelogs, and agent memory files.

## ESQuery-Style Selectors in `ast-grep run`

ast-grep already supports ESQuery-style selectors in `kind` rules. In 0.43, the same selector syntax is available directly from `ast-grep run -k` and `ast-grep run --kind`.

CLI `kind` is no longer limited to a single tree-sitter node kind like `function_declaration`. It can describe structure:

```bash
ast-grep run -k 'call_expression > identifier' -l js
```

This finds identifiers that are direct children of call expressions, such as `foo` in `foo(123)`, without also matching unrelated identifiers elsewhere in the file.

### Extract Program Information for Agents

This is useful for AI programming workflows. Before handing code to an agent, you can extract program information without sending the whole source file:

- What does this file export?
- What top-level declarations exist?
- Which functions call a certain API?
- Which classes define methods?
- Where are the important syntax nodes, without dumping the whole file?

ESQuery-style selectors keep those queries short, readable, and language-aware.

### Example File

```ts
import { readFile } from "node:fs/promises";

export const model = "gpt";

export async function summarize(path: string) {
  const text = await readFile(path, "utf8");
  return text.slice(0, 120);
}

class Planner {
  next() {
    return "inspect";
  }
}

export default Planner;
```

### Find the File Outline

A useful first query is the top-level shape of the file.

```bash
ast-grep run -k 'program > :is(import_statement, export_statement, function_declaration, class_declaration)' -l ts
```

This returns top-level imports, exports, functions, and classes: a compact outline that is often more useful than the full source file.

### Find All Exports

To inspect a module boundary, query top-level export statements:

```bash
ast-grep run -k 'program > export_statement' -l ts
```

This finds:

```ts
export const model = "gpt";

export async function summarize(path: string) {
  // ...
}

export default Planner;
```

This helps an agent understand what a file exposes before editing it.

### Find Exported Functions Only

Narrow the query further:

```bash
ast-grep run -k 'export_statement > function_declaration' -l ts
```

This finds exported function declarations:

```ts
export async function summarize(path: string) {
  // ...
}
```

### Find Class Methods

Use a descendant selector for targets nested deeper:

```bash
ast-grep run -k 'class_declaration method_definition' -l ts
```

This finds methods inside classes, even when they are not direct children of the class node.

### Selector Syntax

Supported forms include:

```bash
ast-grep run -k 'A > B'              # B is a direct child of A
ast-grep run -k 'A B'                # B is a descendant of A
ast-grep run -k 'A + B'              # B immediately follows A
ast-grep run -k 'A ~ B'              # B follows A later
ast-grep run -k 'A, B'               # A or B
ast-grep run -k 'A:has(B)'           # A has descendant B
ast-grep run -k 'A:has(> B)'         # A has direct child B
ast-grep run -k 'A:not(B)'           # A but not B
ast-grep run -k ':is(A, B)'          # A or B
ast-grep run -k 'A:nth-child(2n+1)'  # CSS-like nth-child
```

The same selector syntax also works in YAML rule `kind`:

```yaml
id: exported-function
language: TypeScript
rule:
  kind: export_statement > function_declaration
```

All supported query syntax is documented in [ESQuery Style Kind](/reference/rule/esquery.html).

### A Small Caveat

This is ESQuery-style, not full ESQuery. It supports structural selectors around tree-sitter node kinds, but not every ESQuery feature. Class selectors, attribute selectors, and wildcard selectors are not supported yet.

This is also separate from `--selector` in pattern mode. `--selector` still chooses a node inside a contextual pattern. ESQuery-style syntax applies to `-k`/`--kind` and YAML `kind`.

## Markdown Support

Program source is not the only place where structured information lives. In agentic AI workflows, Markdown is often the primary storage and conveyance format: task plans, repo summaries, tool outputs, instructions, scratchpads, eval reports, and long-lived project context are commonly written as `.md` files.

That makes Markdown worth querying with the same `--kind` workflow.

In ast-grep 0.43, Markdown files expose tree-sitter-backed syntax nodes:

```bash
ast-grep run --kind 'atx_heading' --lang md
```

This finds ATX headings such as:

```md
# ast-grep

## Installation

### Use with npm
```

This is a simple way to extract a digest of a large Markdown file before sending context to an agent. Instead of dumping a full README, design doc, or memory file, first ask ast-grep for the section outline:

```bash
ast-grep run -k 'atx_heading' -l md
```

You can also query for other common Markdown structures:

```bash
# Find fenced code blocks in docs
ast-grep run -k 'fenced_code_block' -l md

# Find list items in project notes
ast-grep run -k 'list_item' -l md

# Find headings and code blocks together
ast-grep run -k 'atx_heading, fenced_code_block' -l md
```

For example, given this Markdown:

````md
# Agent Handoff

## Current Goal

- Update the parser docs.
- Add examples for Markdown search.

## Relevant Commands

```bash
ast-grep run -k 'atx_heading' -l md
```
````

This command extracts the outline:

```bash
ast-grep run -k 'atx_heading' -l md
```

And this command finds the executable examples:

```bash
ast-grep run -k 'fenced_code_block' -l md
```

### A Caveat on Markdown Parsing

Markdown support is powered by `tree-sitter-md`. Markdown is flexible, and the parser still has quite a few known parsing bugs and edge cases.

Use Markdown support cautiously. It is useful for inspection, indexing, outline extraction, and lightweight automation, but validate results before relying on it for critical rewrites or strict document analysis.

## Next Steps

Try `ast-grep run -k` selectors on your source tree before opening a large file in an editor or sending it to an agent. Try Markdown support on docs and agent handoff files.

If you find useful selector patterns or Markdown parsing edge cases, please share them with us at [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep).
