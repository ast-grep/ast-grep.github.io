# Performance Tip for napi usage

## `findInFiles`

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
  callback: (err: null | Error, result: SgNode[]) => void
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
    rule: {kind: 'member_expression'}
  },
}, (err, n) => {
  t.is(err, null)
  t.assert(n.length > 0)
  t.assert(n[0].text().includes('.'))
})
```
