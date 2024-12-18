# Improve Napi Typing

What's type safety? Why?

https://github.com/ast-grep/ast-grep/issues/1669
https://github.com/ast-grep/ast-grep/issues/48

Writing AST manipulation code is hard. Even if we have a lot of helpful interactive tool, it's still hard to handle all edge cases.

AST types are good guiderail to write comprehensive AST manipulation code. It guides one to write comprehensive AST manipulation code (in case people forget to handle some cases). Using exhaustive checking, one can ensure that all cases are handled.

While ast-grep napi is a convenient tool to programmatically process AST , but it lacks the type information to guide user to write robust logic to handle all potential code. Thank to Mohebifar from codemod, ast-grep napi now can provide type information via nodejs API.

The solution to solve the problem is generating types from the static information provided by AST parser library, and using several TypeScript tricks to provide a good typing API.

## What are good TypeScript types?

before we talk about how we achieve the goal, let's talk about what are good TypeScript types.

Designing a good library in the modern JavaScript world is not only about providing good API naming, documentation and examples, but also about providing good TypeScript types. A good API type should be:

* Correct: reject invalid code and accept valid code
* Concise: easy to read, especially in hover and completion
* Robust: easy to spot the compile error when you make a mistake. it should not report a huge error that doesn't fit a screen
* Performant: fast to compile. complex types can slow down the compiler


It is really hard to provide a type system that is both Sound and Complete. This is similar to provide a good typing API.

https://logan.tw/posts/2014/11/12/soundness-and-completeness-of-the-type-system/#:~:text=A%20type%2Dsystem%20is%20sound,any%20false%20positive%20%5B2%5D.

TS libs nowaday probably pay too much attention to correctness IMHO.
Having a type to check your path parameter in your routing is cool, but what's the cost?

Designing a good TypeScript type is essentially a trade-off of these four aspects.

# TreeSitter's types

Let's come back to ast-grep's problem. ast-grep is based on Tree-Sitter.

Tree-Sitter's official API is untyped. It provies a uniform API to access the syntax tree across different languages. A node in Tree-Sitter has several methods like `kind`, `field`, `parent`, `children`, `range`, `text`, etc.

However, a specific language's syntax tree has a specific structure. For example, a function declaration in JavaScript has a `function` keyword, a name, a list of parameters, and a body. Other AST parser libraries encode this structure in their AST object types. For example, a `function_declaration` has fields like `parameters` and `body`.

Fortunately tree-sitter provides static node types in json.
There are several challenges to generate TypeScript types from tree-sitter's static node types.

1. json is hosted by parser library repo
We needs type generation (it is like layman's type provider)
2. json contains a lot unnamed kinds
You are writing a compiler plugin, not elementary school math homework
3. json has alias type


## Design Type

1. lenient type check if no information
2. more strict checking if refined


## Define Type

### Prune unnamed kinds
For example `+`/`-`/`*`/`/` is too noisy for a general AST library

### `ResolveType<M, T>`

Use type script to resolve type alias

### `Kinds<M>`

1. string literal completion with `LowPriorityString`
2. lenient

Problem? open-ended union is not well supported in TypeScript

https://github.com/microsoft/TypeScript/issues/33471
https://github.com/microsoft/TypeScript/issues/26277


### Distinguish general `string`ly kinds and specific kinds

Note `SgNode<'expression' | 'type'>` is different from `SgNode<'expression'> | SgNode<'type'>`

ast-grep uses a trick via the type `RefineNode<>` to let you switch between the two


## Refine Type

### Refine Node, Manually

1.via `sgNode.find<"KIND">`
2.via `sgNode.is<"KIND">`, One time type narrowing

Using the intersting overloading feature of TypeScript

```typescript
interface NodeMethod<K> {
  (): SgNode
  <T extends K>(): SgNode<T>
}
```

### Refine Node, Automatically

`sgNode.field("kind")` will


### Exhaustive Checking via `sgNode.kindToRefine`

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

## Confine Types

### Typed Rule!

```typescript
sgNode.find({
  rule: {
    // kind: 'invalid_kind', // error!
    kind: 'function_declaration', // typed!
  }
})
```


### Opt-in refinement for better compile time performance

## Ending

I'm very thrilled to see the future of AST manipulation in TypeScript.
This feature enables users to switch freely between untyped AST and typed AST.

it is like biome / rowan

https://x.com/hd_nvim/status/1868453729940500924
There are very few devs that understands Rust deeply enough and compiler deeply enough that also care about TypeScript in web dev enough to build something for web devs in Rust