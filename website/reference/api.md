# API Reference

ast-grep currently has an experimental API for [Node.js](https://nodejs.org/).

You can see [API usage guide](/guide/api-usage.html) for more details.

[[toc]]

## NAPI

Please see the link for up-to-date type declaration.

https://github.com/ast-grep/ast-grep/blob/main/crates/napi/index.d.ts

### Supported Languages

`@ast-grep/napi` supports JS ecosystem languages by default.
More custom languages can be loaded via [`registerDynamicLanguage`](https://github.com/search?q=repo%3Aast-grep%2Flangs%20registerDynamicLanguage&type=code).

#### Type

```ts
export const enum Lang {
  Html = 'Html',
  JavaScript = 'JavaScript',
  Tsx = 'Tsx',
  Css = 'Css',
  TypeScript = 'TypeScript',
}

// More custom languages can be loaded
// see https://github.com/ast-grep/langs
type CustomLang = string & {}
```

`CustomLang` is not widely used now. If you have use case and needs support, please file an issue in the [@ast-grep/langs](https://github.com/ast-grep/langs?tab=readme-ov-file#packages) repository.

### Main functions

You can use `parse` to transform a string to ast-grep's main object `SgRoot`.
ast-grep also provides other utility for parse kind string and construct pattern.

```ts
/** Parse a string to an ast-grep instance */
export function parse(lang: Lang, src: string): SgRoot
/** Get the `kind` number from its string name. */
export function kind(lang: Lang, kindName: string): number
/** Compile a string to ast-grep Pattern. */
export function pattern(lang: Lang, pattern: string): NapiConfig
```

#### Example

```ts
import { Lang, parse } from '@ast-grep/napi'

const ast = parse(Lang.JavaScript, source)
const root = ast.root()
root.find('console.log')
```

### SgRoot

You will get an `SgRoot` instance when you `parse(lang, string)`.

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
   * Returns `"anonymous"` if the instance is created by `parse(lang, source)`.
   */
  filename(): string
}
```

#### Example

```ts
import { Lang, parse } from '@ast-grep/napi'

const ast = parse(Lang.JavaScript, source)
const root = ast.root()
root.find('console.log')
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
  // check if node has kind
  is(kind: string): boolean
  // for TypeScript type narrow
  kindToRefine: string
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
  // Edit
  replace(text: string): Edit
  commitEdits(edits: Edit[]): string
}
```

Some methods have more sophisticated type signatures for the ease of use. See the [source code](https://github.com/ast-grep/ast-grep/blob/0999cdb542ff4431e3734dad38fcd648de972e6a/crates/napi/types/sgnode.d.ts#L38-L41) and our [tech blog](/blog/typed-napi.html)

### NapiConfig

`NapiConfig` is used in `find` or `findAll`.

#### Type

`NapiConfig` has similar fields as the [rule config](/reference/yaml.html).

```ts
interface NapiConfig {
  rule: object
  constraints?: object
  language?: FrontEndLanguage
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

### Edit

`Edit` is used in `replace` and `commitEdits`.

```ts
interface Edit {
  startPos: number
  endPos: number
  insertedText: string
}
```

### Useful Examples

- [Test Case Source](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/__test__/index.spec.ts) for `@ast-grep/napi`
- ast-grep usage in [vue-vine](https://github.com/vue-vine/vue-vine/blob/b661fd2dfb54f2945e7bf5f3691443e05a1ab8f8/packages/compiler/src/analyze.ts#L32)

### Language Object (deprecated) <Badge type="danger" text="Deprecated" />

:::details language objects are deprecated

`ast-grep/napi` also has special language objects for `html`, `js` and `css`. They are deprecated and will be removed in the next version.

A language object has following methods.

```ts
/**
 * @deprecated language specific objects are deprecated
 * use the equivalent functions like `parse` in @ast-grep/napi
 */
export declare namespace js {
  /** @deprecated use `parse(Lang.JavaScript, src)` instead */
  export function parse(src: string): SgRoot
  /** @deprecated use `parseAsync(Lang.JavaScript, src)` instead */
  export function parseAsync(src: string): Promise<SgRoot>
  /** @deprecated use `kind(Lang.JavaScript, kindName)` instead */
  export function kind(kindName: string): number
  /** @deprecated use `pattern(Lang.JavaScript, p)` instead */
  export function pattern(pattern: string): NapiConfig
  /** @deprecated use `findInFiles(Lang.JavaScript, config, callback)` instead */
  export function findInFiles(
    config: FindConfig,
    callback: (err: null | Error, result: SgNode[]) => void,
  ): Promise<number>
}
```

#### Example

```ts
import { js } from '@ast-grep/napi'

const source = `console.log("hello world")`
const ast = js.parse(source)
```

:::

## Python API

### SgRoot

The entry point object of ast-grep. You can use SgRoot to parse a string into a syntax tree.

```python
class SgRoot:
    def __init__(self, src: str, language: str) -> None: ...
    def root(self) -> SgNode: ...
```

### SgNode

Most methods are self-explanatory. Please submit a new [issue](https://github.com/ast-grep/ast-grep/issues/new/choose) if you find something confusing.

```python
class SgNode:
    # Node Inspection
    def range(self) -> Range: ...
    def is_leaf(self) -> bool: ...
    def is_named(self) -> bool: ...
    def is_named_leaf(self) -> bool: ...
    def kind(self) -> str: ...
    def text(self) -> str: ...

    # Refinement
    def matches(self, **rule: Unpack[Rule]) -> bool: ...
    def inside(self, **rule: Unpack[Rule]) -> bool: ...
    def has(self, **rule: Unpack[Rule]) -> bool: ...
    def precedes(self, **rule: Unpack[Rule]) -> bool: ...
    def follows(self, **rule: Unpack[Rule]) -> bool: ...
    def get_match(self, meta_var: str) -> Optional[SgNode]: ...
    def get_multiple_matches(self, meta_var: str) -> List[SgNode]: ...
    def get_transformed(self, meta_var: str) -> Optional[str]: ...
    def __getitem__(self, meta_var: str) -> SgNode: ...

    # Search
    @overload
    def find(self, config: Config) -> Optional[SgNode]: ...
    @overload
    def find(self, **kwargs: Unpack[Rule]) -> Optional[SgNode]: ...
    @overload
    def find_all(self, config: Config) -> List[SgNode]: ...
    @overload
    def find_all(self, **kwargs: Unpack[Rule]) -> List[SgNode]: ...

    # Tree Traversal
    def get_root(self) -> SgRoot: ...
    def field(self, name: str) -> Optional[SgNode]: ...
    def parent(self) -> Optional[SgNode]: ...
    def child(self, nth: int) -> Optional[SgNode]: ...
    def children(self) -> List[SgNode]: ...
    def ancestors(self) -> List[SgNode]: ...
    def next(self) -> Optional[SgNode]: ...
    def next_all(self) -> List[SgNode]: ...
    def prev(self) -> Optional[SgNode]: ...
    def prev_all(self) -> List[SgNode]: ...

    # Edit
    def replace(self, new_text: str) -> Edit: ...
    def commit_edits(self, edits: List[Edit]) -> str: ...
```

### Rule

The `Rule` object is a Python representation of the [YAML rule object](/guide/rule-config/atomic-rule.html) in the CLI. See the [reference](/reference/rule.html).

```python
class Pattern(TypedDict):
    selector: str
    context: str

class Rule(TypedDict, total=False):
    # atomic rule
    pattern: str | Pattern
    kind: str
    regex: str

    # relational rule
    inside: Relation
    has: Relation
    precedes: Relation
    follows: Relation

    # composite rule
    all: List[Rule]
    any: List[Rule]
    # pseudo code below for demo.
    "not": Rule # Python does not allow "not" keyword as attribute
    matches: str

# Relational Rule Related
StopBy = Union[Literal["neighbor"], Literal["end"], Rule]
class Relation(Rule, total=False):
    stopBy: StopBy
    field: str
```

### Config

The Config object is similar to the [YAML rule config](/guide/rule-config.html) in the CLI. See the [reference](/reference/yaml.html).

```python
class Config(TypedDict, total=False):
    rule: Rule
    constraints: Dict[str, Mapping]
    utils: Dict[str, Rule]
    transform: Dict[str, Mapping]
```

### Edit

`Edit` is used in `replace` and `commitEdits`.

```python
class Edit:
    # The start position of the edit
    start_pos: int
    # The end position of the edit
    end_pos: int
    # The text to be inserted
    inserted_text: str
```

## Rust API

Rust API is not stable yet. The following link is only for those who are interested in modifying ast-grep's source.

https://docs.rs/ast-grep-core/latest/ast_grep_core/
