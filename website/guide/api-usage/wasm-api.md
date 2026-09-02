# WebAssembly API

`@ast-grep/wasm` brings ast-grep's JavaScript API to browsers, Deno, edge
runtimes, and other environments that support WebAssembly. Its API follows
`@ast-grep/napi`, but uses `web-tree-sitter` and dynamically loaded WASM
parsers.

## Installation

Install the package and its `web-tree-sitter` peer dependency:

::: code-group

```bash [npm]
npm install @ast-grep/wasm web-tree-sitter
```

```bash [pnpm]
pnpm add @ast-grep/wasm web-tree-sitter
```

:::

## WASM Setup

Unlike `@ast-grep/napi`, the WASM package does not include predefined language
parsers. Before parsing code, your application must make the tree-sitter WASM
runtime available, initialize it, and register the parser for each language it
uses.

### Serve the WASM files

Your application must serve two kinds of WASM files:

* `tree-sitter.wasm`, the shared tree-sitter runtime
* A tree-sitter parser such as `tree-sitter-javascript.wasm` for each language

For example, a Vite application can copy the shared runtime into its `public`
directory with a `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/web-tree-sitter/tree-sitter.wasm public"
  }
}
```

See the
[`web-tree-sitter` setup guide](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web#setup)
for setup instructions in other environments. Each language parser also needs
a URL that your application can pass to `registerDynamicLanguage` as its
`libraryPath`.

### Initialize tree-sitter

Call `initializeTreeSitter` once before using the rest of the API. It
initializes the shared tree-sitter WASM runtime:

```js
import { initializeTreeSitter } from '@ast-grep/wasm'

await initializeTreeSitter()
```

### Register languages

Next, register every language your application needs and wait for its parser to
load. The name used as the key is also the name passed to functions such as
`parse` and `kind`:

```js
import { registerDynamicLanguage } from '@ast-grep/wasm'

await registerDynamicLanguage({
  javascript: {
    libraryPath: '/path/to/tree-sitter-javascript.wasm',
  },
  python: {
    libraryPath: '/path/to/tree-sitter-python.wasm',
    // Use another expando character because $VAR is not valid Python syntax.
    expandoChar: 'µ',
  },
})
```

`registerDynamicLanguage` accepts multiple languages at once and can be called
again to add or update languages. The
[`expandoChar`](/advanced/custom-language#register-language-in-sgconfig-yml)
option defaults to `$`; use another character when `$VAR` is not valid syntax
in the language.

## Core Concepts

The core concepts in the WebAssembly API are:

* `SgRoot`: a class representing the whole syntax tree
* `SgNode`: a node in the syntax tree

A common workflow after [setting up WASM](#wasm-setup) is:

1. Parse source code and get an `SgRoot`.
2. Get the root `SgNode` by calling `ast.root()`.
3. Find relevant nodes with patterns or rules.
4. Collect information from the matched nodes.

```js
import { parse } from '@ast-grep/wasm'

const ast = parse('javascript', 'console.log("hello world")') // 1. parse
const root = ast.root()                                       // 2. get root
const node = root.find('console.log($ARG)')                   // 3. find
node.getMatch('ARG').text()                                   // 4. collect
// "hello world"
```

### `SgRoot`

`SgRoot` represents the syntax tree of a source string.

```ts
class SgRoot {
  root(): SgNode
  getInnerTree(): Tree
}
```

`root()` returns the root `SgNode`. The WASM-specific `getInnerTree()` method
exposes the underlying `web-tree-sitter` `Tree` for low-level inspection.

### `SgNode`

`SgNode` is the main interface for searching, inspecting, traversing, and
rewriting the syntax tree.

```js
const log = root.find('console.log($A)')
const arg = log.getMatch('A')
arg.text() // "hello world"
```

## Search

Use `find` and `findAll` to search for nodes in a syntax tree:

```ts
class SgNode {
  find(matcher: Matcher): SgNode | undefined
  findAll(matcher: Matcher): Array<SgNode>
}
```

`find` returns the first matching node or `undefined`. `findAll` returns every
matching node, or an empty array when there are no matches.

```js
const first = root.find('console.log($A)')
const all = root.findAll('console.log($A)')
```

### Matcher

A matcher can be a pattern string, a numeric kind ID, or a rule config object.

```ts
type Matcher = string | number | {
  rule: object
  constraints?: object
  language?: string
  transform?: object
  utils?: object
}
```

Use `kind` to look up a numeric kind ID, or `pattern` to build a pattern config:

```js
import { kind, pattern } from '@ast-grep/wasm'

root.find('console.log($A)')
root.find(kind('javascript', 'string'))
root.find(pattern('javascript', 'console.log($A)'))

root.find({
  rule: { pattern: 'console.log($A)' },
  constraints: {
    A: { kind: 'string' },
  },
})
```

## Match

Use these methods to read metavariables and transformed values from a match:

```ts
class SgNode {
  getMatch(name: string): SgNode | undefined
  getMultipleMatches(name: string): Array<SgNode>
  getTransformed(name: string): string | undefined
}
```

```js
const source = `
console.log('hello')
logger('hello', 'world')
`
const root = parse('javascript', source).root()

const log = root.find('console.log($A)')
log.getMatch('A').text() // 'hello'

const logger = root.find('logger($$$ARGS)')
logger.getMultipleMatches('ARGS').map(node => node.text())
// ["'hello'", ",", "'world'"]
```

## Inspection

The following methods inspect a node:

```ts
class SgNode {
  id(): number
  range(): Range
  isLeaf(): boolean
  isNamed(): boolean
  isNamedLeaf(): boolean
  kind(): string
  is(kind: string): boolean
  text(): string
}

interface Range {
  start: Pos
  end: Pos
}

interface Pos {
  line: number
  column: number
  index: number
}
```

Position values are zero-indexed. In the WASM API, `index` is a character
offset.

## Refinement

Use refinement methods to test a node's relationship to a matcher:

```ts
class SgNode {
  matches(matcher: Matcher): boolean
  inside(matcher: Matcher): boolean
  has(matcher: Matcher): boolean
  precedes(matcher: Matcher): boolean
  follows(matcher: Matcher): boolean
}
```

```js
const node = root.find('console.log($A)')
node.matches('console.$METHOD($B)') // true
```

## Traversal

Use the following methods to traverse the syntax tree:

```ts
class SgNode {
  children(): Array<SgNode>
  namedChildren(): Array<SgNode>
  field(name: string): SgNode | undefined
  fieldChildren(name: string): Array<SgNode>
  parent(): SgNode | undefined
  child(nth: number): SgNode | undefined
  ancestors(): Array<SgNode>
  next(): SgNode | undefined
  nextAll(): Array<SgNode>
  prev(): SgNode | undefined
  prevAll(): Array<SgNode>
}
```

`children()` includes unnamed concrete-syntax-tree nodes such as operators and
punctuation. `namedChildren()` returns only named AST nodes. `fieldChildren()`
returns all children assigned to a named tree-sitter field.

## Fix code

`SgNode` is immutable. Use `replace` to create an edit and `commitEdits` to
apply edits and generate new source code:

```ts
interface WasmEdit {
  start_pos: number
  end_pos: number
  inserted_text: string
}

class SgNode {
  replace(text: string): WasmEdit
  commitEdits(edits: Array<WasmEdit>): string
}
```

```js
const root = parse('javascript', "console.log('hello world')").root()
const node = root.find('console.log($A)')
const edit = node.replace("console.error('bye world')")
const newSource = root.commitEdits([edit])
// "console.error('bye world')"
```

## Live Example

For a live example, see this
[parody](https://x.com/hd_nvim/status/2094255500653134271?s=20)
[repo](https://github.com/HerringtonDarkholme/rust-beautifier), try the
[live demo](https://rust-beautifier.vercel.app), and inspect its
[WASM-powered Rust transformer](https://github.com/HerringtonDarkholme/rust-beautifier/blob/main/app/lib/rust-transformer.ts).

For the implementation and package-level reference, see the
[`@ast-grep/wasm` source](https://github.com/ast-grep/ast-grep/tree/main/crates/wasm).
