# API Usage

ast-grep's API design is still in flux, but the following is a rough sketch of how it will work.

## napi

First, install ast-grep's napi package.
```bash
npm install --save @ast-grep/napi
```

Then, import the language object from the napi package. Every language object has similar APIs.

`parse` transforms string to a `SgRoot`. Example:

```js
import { js } from '@ast-grep/napi';

const source = `console.log("hello world")`
const ast = js.parse(source)
const node = ast.root().find('console.log'))
```

The `SgRoot` object has a `root` method that returns the root `SgNode` of the AST.
The `find` method returns the first node that matches the given selector. In this case, the selector is a string that matches the `console.log` expression.


## `SgNode`
`SgNode` has following jQuery like methods to inspect and traverse the AST:

```ts
export class SgNode {
  range(): Range
  isLeaf(): boolean
  kind(): string
  text(): string
  matches(m: string): boolean
  inside(m: string): boolean
  has(m: string): boolean
  precedes(m: string): boolean
  follows(m: string): boolean
  getMatch(m: string): SgNode | null
  getMultipleMatches(m: string): Array<SgNode>
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

## Matcher

For the `find` method and `findAll` method, the argument is a matcher which can be a string, a number, or a `NapiConfig` object.

* `string` is parsed as [pattern](/guide/pattern-syntax). e.g. `'console.log($A)'`

* `number` is a u16 number that represents a node's kind. You can convert the kind name like `function` to a numeric representation by calling the `kind` function on the language object. e.g. `js.kind('function')`.

* A `NapiConfig` has the same type of [rule object](/reference/rule).

## `findInFiles`

If you have a lot of files to parse and want to maximize your programs' performance, ast-grep's language object provides a `findInFiles` function that parses multiple files in parallel Rust threads.

By avoiding Rust-JS communication overhead and utilizing multiple core computing,
it is much faster than finding files in JavaScript and then passing them to Rust as string.

The function signature of `findInFiles` is as follows:

```ts
export function findInFiles(
  /** specify the file path and matcher */
  config: FindConfig,
  /** callback function for found nodes in a file */
  callback: (err: null | Error, result: SgNode[]) => void
): Promise<number>
```

`findInFiles` accepts a `FindConfig` object and a callback function.

### `FindConfig`

The `FindConfig` object specifies which paths to search code and what rule to match node against.

The `FindConfig` object has the following type:

```ts
export interface FindConfig {
  paths: Array<string>
  matcher: NapiConfig
}
```

The `path` field is an array of strings. You can specify multiple paths to search code. Every path in the array can be a file path or a directory path. For a directory path, ast-grep will recursively find all files matching the language.

The `matcher` is the same as `NapiConfig` stated above.

### callback function and termination

The `callback` function is called for every file that have nodes that match the rule. The callback function is a standard node-style callback with the first argment as `Error` and second argument as an array of `SgNode` objects that match the rule.

The return value of `findInFiles` is a `Promise` object. The promise resolves to the number of files that have nodes that match the rule.

:::danger
`findInFiles` can return before all file callbacks are called due to NodeJS limitation.
See https://github.com/ast-grep/ast-grep/issues/206.
:::

If you have a lot of files and `findInFiles` prematurely returns, you can use the total files returned by `findInFiles` as a check point. Maintain a counter outside of `findInFiles` and increment it in callback. If the counter equals the total number, we can conclude all files are processed. The following code is an example.

```ts
function countedPromise<F extends (t: any, cb: any) => Promise<number>>(func: F) {
  type P = Parameters<F>
  return async (t: P[0], cb: P[1]) => {
    let i = 0
    let fileCount: number | undefined = undefined
    let resolve = () => {} // will be called after all files are processed
    function wrapped(...args: any[]) {
      let ret = cb(...args)
      if (++i === fileCount) resolve()
      return ret
    }
    fileCount = await func(t, wrapped as P[1])
    // all files are not processed, wait the resolve function to be called
    if (fileCount > i) {
      await new Promise<void>(r => resolve = r)
    }
    return fileCount
  }
}
```

### Example
Example of using `findInFiles`

```ts
let fileCount = await js.findInFiles({
  paths: ['relative/path/to/code'],
  matcher: {
    rule: {kind: 'member_expression'}
  },
}, (err, n) => {
  t.is(err, null)
  t.assert(n.length > 0)
  t.assert(n[0].text().includes('.'))
})
```
