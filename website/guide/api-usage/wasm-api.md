# WebAssembly API

`@ast-grep/wasm` brings ast-grep's JavaScript API to browsers, Deno, edge
runtimes, and other environments that support WebAssembly. Its API follows
`@ast-grep/napi`, but it does not bundle language parsers. Register each
tree-sitter WASM parser before using it.

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

Your application must serve the `tree-sitter.wasm` runtime and a WASM parser
for every language it registers. For example, Vite applications can copy
`node_modules/web-tree-sitter/tree-sitter.wasm` into `public` during
installation. See the
[`web-tree-sitter` setup guide](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web#setup)
for other environments.

## Parse Code

Initialize tree-sitter once, register the language parsers you need, and then
parse source code:

```js
import {
  initializeTreeSitter,
  parse,
  registerDynamicLanguage,
} from '@ast-grep/wasm'

await initializeTreeSitter()

await registerDynamicLanguage({
  javascript: {
    libraryPath: '/parsers/tree-sitter-javascript.wasm',
  },
})

const root = parse('javascript', 'console.log("hello")').root()
const call = root.find('console.log($ARG)')
call.getMatch('ARG').text() // "hello"
```

`registerDynamicLanguage` can register several languages in one call and can
be called again to add or update registrations. Languages where `$` is valid
syntax can also provide an `expandoChar`.

## Traverse Named Children

`children()` returns every direct concrete-syntax-tree child, including
unnamed operators and punctuation. `namedChildren()` returns only named AST
nodes:

```js
const root = parse('javascript', 'a + b').root()
const sum = root.find('$A + $B')

sum.children().map(node => node.text()) // ['a', '+', 'b']
sum.namedChildren().map(node => node.text()) // ['a', 'b']
```

`namedChildren()` is available in `@ast-grep/wasm` 0.45.2 and later.

For the complete package API, including searching, relational matching, and
rewriting, see the
[`@ast-grep/wasm` API reference](https://github.com/ast-grep/ast-grep/tree/main/crates/wasm#api-reference).
