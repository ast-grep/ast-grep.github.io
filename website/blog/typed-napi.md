Improve Napi Typing

What's type safety? Why?

https://github.com/ast-grep/ast-grep/issues/1669
https://github.com/ast-grep/ast-grep/issues/48

It guides one to write comprehensive AST code (in case people forget to handle some cases)

# What are good TypeScript types?

* Correct: reject invalid code and accept valid code
* Concise: easy to read, especially in hover and completion
* Robust: easy to refactor
* Performant: fast to compile

# TreeSitter's types

Tree-Sitter's official API is untyped. However it provides static node types in json

1. json hosted by parser library repo
needs type generation(layman's type provider)
2. contains a lot unnamed kinds
You are writing a compiler plugin, not elementary school math homework
3. has alias type


# Big Idea

1. lenient type check if no information
2. more strict checking if refined


# APIs

## Prune unnamed kinds
For example `+`/`-`/`*`/`/` is too noisy for a general AST library

## `ResolveType<M, T>`

Use type script to resolve type alias

## `Kinds<M>`

1. string literal completion with `LowPriorityString`
2. lenient

Problem?

https://github.com/microsoft/TypeScript/issues/33471
https://github.com/microsoft/TypeScript/issues/26277

## Distinguish general `string`ly kinds and specific kinds

Note `SgNode<'expression' | 'type'>` is different from `SgNode<'expression'> | SgNode<'type'>`

ast-grep uses a trick via the type `RefineNode<>` to let you switch between the two


## Refine Node, Manually

1.via `sgNode.find<"KIND">`
2.via `sgNode.is<"KIND">`, One time type narrowing

Using the intersting overloading feature of TypeScript

```typescript
interface NodeMethod<K> {
  (): SgNode
  <T extends K>(): SgNode<T>
}
```

## Refine Node, Automatically

`sgNode.field("kind")` will


## Exhaustive Checking via `sgNode.kindToRefine`

Only available for node with specific kinds

```typescript
const func: SgNode<'function_declaration'> | SgNode<'arrow_function'>

switch (func.kindToRefine) {
  case 'function_declaration':
    func.kindToRefine // narrow to 'function_declaration'
    break
  case 'arrow_function':
    func.kindToRefine // narrow to 'arrow_function'
    break
  default:
    func satisfies never // exhaustive check!
}
```

## Typed Rule!

```typescript
sgNode.find({
  rule: {
    // kind: 'invalid_kind', // error!
    kind: 'function_declaration', // typed!
  }
})
```

## Opt-in refinement for better compile time performance

# Ending

https://x.com/hd_nvim/status/1868453729940500924
There are very few devs that understands Rust deeply enough and compiler deeply enough that also care about TypeScript in web dev enough to build something for web devs in Rust