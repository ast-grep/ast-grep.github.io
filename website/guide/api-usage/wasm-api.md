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

:::warning WASM setup
The WASM package does not include predefined languages. Your application must
serve the `tree-sitter.wasm` runtime and a tree-sitter WASM parser for every
language it registers.
:::

For example, a Vite application can copy the tree-sitter runtime into `public`
with a `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/web-tree-sitter/tree-sitter.wasm public"
  }
}
```

See the
[`web-tree-sitter` setup guide](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web#setup)
for other environments.

## Main Functions

The package exports these top-level functions:

```ts
interface WasmLangInfo {
  libraryPath: string
  expandoChar?: string
}

function initializeTreeSitter(): Promise<void>
function registerDynamicLanguage(
  languages: Record<string, WasmLangInfo>,
): Promise<void>
function parse(lang: string, source: string): SgRoot
function kind(lang: string, kindName: string): number
function pattern(lang: string, pattern: string): object
function dumpPattern(
  lang: string,
  pattern: string,
  selector?: string,
  strictness?: string,
): PatternTree

type PatternKind = 'terminal' | 'metaVar' | 'internal'

interface PatternTree {
  kind: string
  pattern?: PatternKind
  isNamed: boolean
  text?: string
  children: Array<PatternTree>
  start: { line: number, column: number }
  end: { line: number, column: number }
}
```

`initializeTreeSitter` initializes the shared runtime.
`registerDynamicLanguage` loads language parsers. The remaining functions can
be used after their language has been registered. Registration can be called
again to add or update languages. The
[`expandoChar`](/advanced/custom-language#register-language-in-sgconfig-yml)
option defaults to `$`; set another character for languages where `$` is valid
syntax.

## Core Concepts

The core concepts in the WebAssembly API are:

* `SgRoot`: a class representing the whole syntax tree
* `SgNode`: a node in the syntax tree

A common workflow is:

1. Initialize the tree-sitter WASM runtime once.
2. Register each language's tree-sitter WASM parser.
3. Parse source code and get its root `SgNode`.
4. Search for nodes and inspect the results.

```js
import {
  initializeTreeSitter,
  parse,
  registerDynamicLanguage,
} from '@ast-grep/wasm'

await initializeTreeSitter()

await registerDynamicLanguage({
  javascript: {
    libraryPath: '/path/to/tree-sitter-javascript.wasm',
  },
})

const ast = parse('javascript', 'console.log("hello world")')
const root = ast.root()
const node = root.find('console.log($ARG)')
node.getMatch('ARG').text() // "hello world"
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

For pattern debugging, `dumpPattern` returns the parsed pattern tree:

```ts
function dumpPattern(
  lang: string,
  pattern: string,
  selector?: string,
  strictness?: 'cst' | 'smart' | 'ast' | 'relaxed' | 'signature' | 'template',
): PatternTree
```

The `PatternTree` shape is listed with the other
[main functions](#main-functions).

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

For a live example, see the
[rust-beautifier repository](https://github.com/HerringtonDarkholme/rust-beautifier),
try the [live demo](https://rust-beautifier.vercel.app), or inspect its
[WASM-powered Rust transformer](https://github.com/HerringtonDarkholme/rust-beautifier/blob/main/app/lib/rust-transformer.ts).

For the implementation and package-level reference, see the
[`@ast-grep/wasm` source](https://github.com/ast-grep/ast-grep/tree/main/crates/wasm).
