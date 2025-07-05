# Performance Tip for napi usage

Using `napi` to parse code and search for nodes [isn't always faster](https://medium.com/@hchan_nvim/benchmark-typescript-parsers-demystify-rust-tooling-performance-025ebfd391a3) than pure JavaScript implementations.

There are a lot of tricks to improve performance when using `napi`. The mantra is to _reduce FFI (Foreign Function Interface) calls between Rust and JavaScript_, and to _take advantage of parallel computing_.

## Prefer `parseAsync` over `parse`

`parseAsync` can take advantage of NodeJs' libuv thread pool to parse code in parallel threads. This can be faster than the sync version `parse` when handling a lot of code.

```ts
import { js } from '@ast-grep/napi'
// only one thread parsing
const root = js.parse('console.log("hello world")')
// better, can use multiple threads
const root = await js.parseAsync('console.log("hello world")')
```

This is especially useful when you are using ast-grep in bundlers where the main thread is busy with other CPU intensive tasks.

## Prefer `findAll` over manual traversal

One way to find all nodes that match a rule is to traverse the syntax tree manually and check each node against the rule. This is slow because it requires a lot of FFI calls between Rust and JavaScript during the traversal.

For example, the following code snippet finds all `member_expression` nodes in the syntax tree. Unfortunately, there are as many FFI calls as the tree node number in the recursion.

```ts
const root = sgroot.root()
function findMemberExpression(node: SgNode): SgNode[] {
  let ret: SgNode[] = []
  // `node.kind()` is a FFI call
  if (node.kind() === 'member_expression') {
    ret.push(node)
  }
  // `node.children()` is a FFI call
  for (let child of node.children()) {
    // recursion makes more FFI calls
    ret = ret.concat(findMemberExpression(child))
  }
  return ret
}
const nodes = findMemberExpression(root)
```

The equivalent code using `findAll` is much faster:

```ts
const root = sgroot.root()
// only call FFI `findAll` once
const nodes = root.findAll({ kind: 'member_expression' })
```

> _One [success](https://x.com/hd_nvim/status/1767971906786128316) [story](https://x.com/sonofmagic95/status/1768433654404104555) on Twitter, as an example._

## Prefer `findInFiles` when possible

If you have a lot of files to parse and want to maximize your programs' performance, ast-grep's language object provides a `findInFiles` function that parses multiple files and searches relevant nodes in parallel Rust threads.

APIs we showed above all require parsing code in Rust and pass the `SgRoot` back to JavaScript.
This incurs foreign function communication overhead and only utilizes the single main JavaScript thread.
By avoiding Rust-JS communication overhead and utilizing multiple core computing,
`findInFiles` is much faster than finding files in JavaScript and then passing them to Rust as string.

The function signature of `findInFiles` is as follows:

```ts
export function findInFiles(
  /** specify the file path and matcher */
  config: FindConfig,
  /** callback function for found nodes in a file */
  callback: (err: null | Error, result: SgNode[]) => void,
): Promise<number>
```

`findInFiles` accepts a `FindConfig` object and a callback function.

`FindConfig` specifies both what file path to _parse_ and what nodes to _search_.

`findInFiles` will parse all files matching paths and will call back the function with nodes matching the `matcher` found in the files as arguments.

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

### Callback Function and Termination

The `callback` function is called for every file that have nodes that match the rule. The callback function is a standard node-style callback with the first argument as `Error` and second argument as an array of `SgNode` objects that match the rule.

The return value of `findInFiles` is a `Promise` object. The promise resolves to the number of files that have nodes that match the rule.

:::danger
`findInFiles` can return before all file callbacks are called due to NodeJS limitation.
See https://github.com/ast-grep/ast-grep/issues/206.
:::

If you have a lot of files and `findInFiles` prematurely returns, you can use the total files returned by `findInFiles` as a check point. Maintain a counter outside of `findInFiles` and increment it in callback. If the counter equals the total number, we can conclude all files are processed. The following code is an example, with core logic highlighted.

```ts:line-numbers {11,16-18}
type Callback = (t: any, cb: any) => Promise<number>
function countedPromise<F extends Callback>(func: F) {
  type P = Parameters<F>
  return async (t: P[0], cb: P[1]) => {
    let i = 0
    let fileCount: number | undefined = undefined
    // resolve will be called after all files are processed
    let resolve = () => {}
    function wrapped(...args: any[]) {
      let ret = cb(...args)
      if (++i === fileCount) resolve()
      return ret
    }
    fileCount = await func(t, wrapped as P[1])
    // not all files are processed, await `resolve` to be called
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
    rule: { kind: 'member_expression' },
  },
}, (err, n) => {
  t.is(err, null)
  t.assert(n.length > 0)
  t.assert(n[0].text().includes('.'))
})
```
