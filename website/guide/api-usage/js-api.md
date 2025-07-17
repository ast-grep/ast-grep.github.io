# JavaScript API

Powered by [napi.rs](https://napi.rs/), ast-grep's JavaScript API enables you to write JavaScript to programmatically inspect and change syntax trees.

ast-grep's JavaScript API design is pretty stable now. No major breaking changes are expected in the future.

To try out the JavaScript API, you can use the [code sandbox](https://codesandbox.io/p/sandbox/ast-grep-napi-hhx3tj) here.

## Installation

First, install ast-grep's napi package.

::: code-group

```bash[npm]
npm install --save @ast-grep/napi
```

```bash[pnpm]
pnpm add @ast-grep/napi
```

:::

Now let's explore ast-grep's API!

## Core Concepts

The core concepts in ast-grep's JavaScript API are:

- `SgRoot`: a class representing the whole syntax tree
- `SgNode`: a node in the syntax tree

:::tip Make AST like a DOM tree!
Using ast-grep's API is like using [jQuery](https://jquery.com/). You can use `SgNode` to traverse the syntax tree and collect information from the nodes.

Remember your old time web programming?
:::

A common workflow to use ast-grep's JavaScript API is:

1. Get a syntax tree object `SgRoot` from string by calling a language's `parse` method
2. Get the root node of the syntax tree by calling `ast.root()`
3. `find` relevant nodes by using patterns or rules
4. Collect information from the nodes

**Example:**

```js{4-7}
import { parse, Lang } from '@ast-grep/napi';

let source = `console.log("hello world")`
const ast = parse(Lang.JavaScript, source)  // 1. parse the source
const root = ast.root()                     // 2. get the root
const node = root.find('console.log($A)')   // 3. find the node
node.getMatch('A').text()                   // 4. collect the info
// "hello world"
```

### `SgRoot`

`SgRoot` represents the syntax tree of a source string.

We can import the `Lang` enum from the `@ast-grep/napi` package and call the `parse` function to transform string.

```js{4}
import { Lang, parse } from '@ast-grep/napi';

const source = `console.log("hello world")`
const ast = parse(Lang.JavaScript, source)
```

The `SgRoot` object has a `root` method that returns the root `SgNode` of the AST.

```js
const root = ast.root() // root is an instance of SgNode
```

### `SgNode`

`SgNode` is the main interface to view and manipulate the syntax tree.

It has several jQuery like methods for us to search, filter and inspect the AST nodes we are interested in.

```js
const log = root.find('console.log($A)') // search node
const arg = log.getMatch('A') // get matched variable
arg.text() // "hello world"
```

Let's see its details in the following sections!

## Search

You can use `find` and `findAll` to search for nodes in the syntax tree.

- `find` returns the first node that matches the pattern or rule.
- `findAll` returns an array of nodes that match the pattern or rule.

```ts
// search
class SgNode {
  find(matcher: string): SgNode | null
  find(matcher: number): SgNode | null
  find(matcher: NapiConfig): SgNode | null
  findAll(matcher: string): Array<SgNode>
  findAll(matcher: number): Array<SgNode>
  findAll(matcher: NapiConfig): Array<SgNode>
}
```

Both `find` and `findAll` are overloaded functions. They can accept either string, number or a config object.
The argument is called `Matcher` in ast-grep JS.

### Matcher

A `Matcher` can be one of the three types: `string`, `number` or `object`.

- `string` is parsed as a [pattern](/guide/pattern-syntax.html). e.g. `'console.log($A)'`

- `number` is interpreted as the node's kind. In tree-sitter, an AST node's type is represented by a number called kind id. Different syntax node has different kind ids. You can convert a kind name like `function` to the numeric representation by calling the `kind` function. e.g. `kind('function', Lang.JavaScript)`.

- A `NapiConfig` has a similar type of [config object](/reference/yaml.html). See details below.

```ts
// basic find example
root.find('console.log($A)') // returns SgNode of call_expression
let l = Lang.JavaScript // calling kind function requires Lang
const kind = kind(l, 'string') // convert kind name to kind id number
root.find(kind) // returns SgNode of string
root.find('notExist') // returns null if not found

// basic find all example
const nodes = root.findAll('function $A($$$) {$$$}')
Array.isArray(nodes) // true, findAll returns SgNode
nodes.map(n => n.text()) // string array of function source
const empty = root.findAll('not exist') // returns []
empty.length === 0 // true

// find i.e. `console.log("hello world")` using a NapiConfig
const node = root.find({
  rule: {
    pattern: 'console.log($A)',
  },
  constraints: {
    A: { regex: 'hello' },
  },
})
```

Note, `find` returns `null` if no node is found. `findAll` returns an empty array if nothing matches.

## Match

Once we find a node, we can use the following methods to get meta variables from the search.

The `getMatch` method returns the single node that matches the [single meta variable](/guide/pattern-syntax.html#meta-variable).

And the `getMultipleMatches` returns an array of nodes that match the [multi meta variable](/guide/pattern-syntax.html#multi-meta-variable).

```ts
// search
export class SgNode {
  getMatch(m: string): SgNode | null
  getMultipleMatches(m: string): Array<SgNode>
}
```

**Example:**

```ts{7,11,15,16}
const src = `
console.log('hello')
logger('hello', 'world', '!')
`
const root = parse(Lang.JavaScript, src).root()
const node = root.find('console.log($A)')
const arg = node.getMatch("A") // returns SgNode('hello')
arg !== null // true, node is found
arg.text() // returns 'hello'
// returns [] because $A and $$$A are different
node.getMultipleMatches('A')

const logs = root.find('logger($$$ARGS)')
// returns [SgNode('hello'), SgNode(','), SgNode('world'), SgNode(','), SgNode('!')]
logs.getMultipleMatches("ARGS")
logs.getMatch("A") // returns null
```

## Inspection

The following methods are used to inspect the node.

```ts
// node inspection
export class SgNode {
  range(): Range
  isLeaf(): boolean
  kind(): string
  text(): string
}
```

**Example:**

```ts{3}
const ast = parse(Lang.JavaScript, "console.log('hello world')")
root = ast.root()
root.text() // will return "console.log('hello world')"
```

Another important method is `range`, which returns two `Pos` object representing the start and end of the node.

One `Pos` contains the line, column, and offset of that position. All of them are 0-indexed.

You can use the range information to locate the source and modify the source code.

```ts{1}
const rng = node.range()
const pos = rng.start // or rng.end, both are `Pos` objects
pos.line // 0, line starts with 0
pos.column // 0, column starts with 0
rng.end.index // 17, index starts with 0
```

## Refinement

You can also filter nodes after matching by using the following methods.

This is dubbed as "refinement" in the documentation. Note these refinement methods only support using `pattern` at the moment.

```ts
export class SgNode {
  matches(m: string): boolean
  inside(m: string): boolean
  has(m: string): boolean
  precedes(m: string): boolean
  follows(m: string): boolean
}
```

**Example:**

```ts
const node = root.find('console.log($A)')
node.matches('console.$METHOD($B)') // true
```

## Traversal

You can traverse the tree using the following methods, like using jQuery.

```ts
export class SgNode {
  children(): Array<SgNode>
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

## Fix code

`SgNode` is immutable so it is impossible to change the code directly.

However, `SgNode` has a `replace` method to generate an `Edit` object. You can then use the `commitEdits` method to apply the changes and generate new source string.

```ts
interface Edit {
  /** The start position of the edit */
  startPos: number
  /** The end position of the edit */
  endPos: number
  /** The text to be inserted */
  insertedText: string
}

class SgNode {
  replace(text: string): Edit
  commitEdits(edits: Edit[]): string
}
```

**Example**

```ts{3,4}
const root = parse(Lang.JavaScript, "console.log('hello world')").root()
const node = root.find('console.log($A)')
const edit = node.replace("console.error('bye world')")
const newSource = node.commitEdits([edit])
// "console.error('bye world')"
```

Note, `console.error($A)` will not generate `console.error('hello world')` in JavaScript API unlike the CLI. This is because using the host language to generate the replacement string is more flexible.

:::warning
Metavariable will not be replaced in the `replace` method. You need to create a string using `getMatch(var_name)` by using JavaScript.
:::

See also [ast-grep#1172](https://github.com/ast-grep/ast-grep/issues/1172)

## Use Other Language

To access other languages, you will need to use `registerDynamicLanguage` function and probably `@ast-grep/lang-*` package.
This is an experimental feature and the doc is not ready yet. Please refer to the [repo](https://github.com/ast-grep/langs) for more information.

If you are interested in using other languages, please let us know by creating an issue.
