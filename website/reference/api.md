# API Reference

ast-grep currently has an experimental API for [Node.js](https://nodejs.org/).

You can see [API usage guide](/guide/api-usage.html) for more details.

[[toc]]

## NAPI

Please see the link for up-to-date type declaration.

https://github.com/ast-grep/ast-grep/blob/main/crates/napi/index.d.ts

### Supported Languages

`@ast-grep/napi` supports `html`, `js`, `jsx`, `ts` and `tsx`.

#### Type

A language object has following methods.

```ts
export namespace js {
  /** Parse a string to an ast-grep instance */
  export function parse(src: string): SgRoot
  /** Get the `kind` number from its string name. */
  export function kind(kindName: string): number
  /** Compile a string to ast-grep Pattern. */
  export function pattern(pattern: string): NapiConfig
  /**
   * Discover and parse multiple files in Rust.
   * `config` specifies the file path and matcher.
   * `callback` will receive matching nodes found in a file.
   * returns the number of matched files.
   */
  export function findInFiles(
    config: FindConfig,
    callback: (err: null | Error, result: SgNode[]) => void
  ): Promise<number>
}
```

#### Example

```ts
import { js } from '@ast-grep/napi'

const source = `console.log("hello world")`
const ast = js.parse(source)
```

### SgRoot

You will get an `SgRoot` instance when you `lang.parse(string)`.

`SgRoot` can also be accessed in `lang.findInFiles`'s callback by calling `node.getRoot()`.

In the latter case, `sgRoot.filename()` will return the path of the matched file.

#### Type

```ts
/** Represents the parsed tree of code. */
class SgRoot {
  /** Returns the root SgNode of the ast-grep instance. */
  root(): SgNode
  /**
   * Returns the path of the file if it is discovered by ast-grep's `findInFiles`.
   * Returns `"anonymous"` if the instance is created by `lang.parse(source)`.
   */
  filename(): string
}
```

#### Example

```ts
const ast = js.parse(source)
const root = ast.root()
root.find("console.log")
```

### SgNode

The main interface to traverse the AST.

#### Type
Most methods are self-explanatory. Please submit a new [issue](https://github.com/ast-grep/ast-grep/issues/new/choose) if you find something confusing.

```ts
class SgNode {
  // Read node's information
  range(): Range
  isLeaf(): boolean
  isNamed(): boolean
  isNamedLeaf(): boolean
  kind(): string
  text(): string
  // Check if node meets certain patterns
  matches(m: string): boolean
  inside(m: string): boolean
  has(m: string): boolean
  precedes(m: string): boolean
  follows(m: string): boolean
  // Get nodes' matched meta variables
  getMatch(m: string): SgNode | null
  getMultipleMatches(m: string): Array<SgNode>
  // Get node's SgRoot
  getRoot(): SgRoot
  // Traverse node tree
  children(): Array<SgNode>
  find(matcher: string | number | NapiConfig): SgNode | null
  findAll(matcher: string | number | NapiConfig): Array<SgNode>
  field(name: string): SgNode | null
  parent(): SgNode | null
  child(nth: number): SgNode | null
  ancestors(): Array<SgNode>
  next(): SgNode | null
  nextAll(): Array<SgNode>
  prev(): SgNode | null
  prevAll(): Array<SgNode>
}
```

### NapiConfig

`NapiConfig` is used in `find` or `findAll`.

#### Type

`NapiConfig` has similar fields as the [rule config](/reference/yaml.html).

```ts
interface NapiConfig {
  rule: object
  constraints?: object
  language?: FrontEndLanguage
  // @experimental
  transform?: object
  utils?: object
}
```

### FindConfig
`FindConfig` is used in `findInFiles`.

#### Type

```ts
interface FindConfig {
  // You can search multiple paths
  // ast-grep will recursively find all files under the paths.
  paths: Array<string>
  // Specify what nodes will be matched
  matcher: NapiConfig
}
```

### Useful Examples
* [Test Case Source](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/__test__/index.spec.ts) for `@ast-grep/napi`
* ast-grep usage in [vue-vine](https://github.com/vue-vine/vue-vine/blob/b661fd2dfb54f2945e7bf5f3691443e05a1ab8f8/packages/compiler/src/analyze.ts#L32)

## Rust API

Rust API is not stable yet. The following link is only for those who are interested in modifying ast-grep's source.

https://docs.rs/ast-grep-core/latest/ast_grep_core/
