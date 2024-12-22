---
sidebar: false
---

# Improve Napi Typing

> _Design, Define, Refine, and Confine: Crafting Balanced TypeScript Types_

We're thrilled to introduce typed AST in [@ast-grep/napi], addressing a [long-requested feature](https://github.com/ast-grep/ast-grep/issues/48) for AST manipulation from the early days of this project.

In this blog post, we will delve into the challenges addressed by this feature and explore [the design](https://github.com/ast-grep/ast-grep/issues/1669) that shaped its implementation. _We also believe this post can serve as a general guide to crafting balanced TypeScript types._

## Why Type Safety Matters in AST

Working with Abstract Syntax Trees (ASTs) is complex. Even with AST [excellent](https://astexplorer.net/) [AST](https://ast-grep.github.io/playground.html) [tools](https://github.com/sxzz/ast-kit), handling all edge cases remains challenging.

Type information serves as a crucial safety net when writing AST manipulation code. It guides developers toward handling all possible cases and enables exhaustive checking to ensure complete coverage.

While `ast-grep/napi` has been a handy tool for programmatic AST processing, it previously lacked type information to help users write robust code. Thank to [Mohebifar](https://github.com/mohebifar) from [codemod](https://codemod.com/), we've now bridged this gap. Our solution generates types from parsers' metadata and employs TypeScript tricks to create an idiomatic API.

## Qualities of Good TypeScript Types

Before diving into our implementation, let's explore what makes TypeScript definitions truly effective. In today's JavaScript ecosystem, creating a great library involves more than just intuitive APIs and thorough documentation – it requires thoughtful type definitions that enhance developer experience.

A well-designed type system should balance four key qualities:

* **Correct**: Types should act as reliable guardrails, rejecting invalid code while allowing all valid use cases.
* **Concise**: Types should be easy to understand, whether in IDE hovers or code completions. Clear, readable types help developers quickly grasp your API.
* **Robust**: In case type inference fails, the compiler should either graciously tolerate untyped code, or gracefully provide clear error messages. Cryptic type errors that span multiple screens is daunting and unhelpful.
* **Performant**: Both type checking and runtime code should be fast. Complex types can significantly slow down compilation while unnecessary API calls just conforming to type safety can hurt runtime performance.

Balancing these qualities is demanding job because they often compete with each other, just like creating a type system that is both [sound and complete](https://logan.tw/posts/2014/11/12/soundness-and-completeness-of-the-type-system/#:~:text=A%20type%2Dsystem%20is%20sound,any%20false%20positive%20%5B2%5D.). Many TS libraries lean heavily toward strict correctness – for instance, implementing elaborate types to validate routing parameters. While powerful, [type gymnastics](https://www.octomind.dev/blog/navigating-the-typescript-gymnastics-on-developer-dogma-2) can come with significant trade-offs in complexity and compile-time performance. Sometimes, being slightly less strict can lead to a dramatically better developer experience.

We will explore how ast-grep balances these qualities through _Design, Define, Refine, and Confine_.

## Design Types

Let's return to ast-grep's challenge and learn some background knowledge on how Tree-sitter, our underlying parser library, handles types.

### TreeSitter's Core API

At its heart, Tree-sitter provides a language-agnostic API for traversing syntax trees. Its base API is intentionally untyped, offering a consistent interface across all programming languages:

```typescript
class Node {
  kind(): string     // Get the type of node, e.g., 'function_declaration'
  field(name: string): Node  // Get a specific child by its field name
  parent(): Node             // Navigate to the parent node
  children(): Node[]         // Get all child nodes
  text(): string             // Get the actual source code text
}
```

This API is elegantly simple, but its generality comes at the cost of type safety.

In contrast, traditional language-specific parsers bake AST structures directly into their types. Consider [estree](https://github.com/estree/estree/blob/0362bbd130e926fed6293f04da57347a8b1e2325/es5.md). It encodes rich structural information about each node type in JavaScript. For instance, a `function_declaration` is a specific structure with the function's `name`, `parameters` list, and `body` fields.

Fortunately, Tree-sitter hasn't left us entirely without type information. It provides detailed static type information in JSON format and leaves us an opportunity to enchant the flexible runtime API with the type safe magic.

### Tree-sitter's `TypeMap`

Tree-sitter provides [static node types](https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types) for library authors to consume. The type information has the following form, in TypeScript interface:

```typescript
interface TypeMap {
  [kind: string]: {
    type: string
    named: boolean
    fields?: {
      [field: string]: {
        types: { type: string, named: boolean }[]
      }
    }
    children?: { name: string, type: string }[]
    subtypes?: { type: string, named: boolean }[]
  }
}
```

`TypeMap` is a comprehensive catalog of all possible node types in a language's syntax tree. Let's break this down with a concrete example from TypeScript:

```typescript
type TypeScript = {
  // AST node type definition
  function_declaration: {
    type: "function_declaration", // kind
    named: true,                  // is named
    fields: {
      body: {
        types: [ { type: "statement_block", named: true } ]
      },
    }
  },
  ...
}
```

The structure contains the information about the node's kind, whether it is named, and its' fields and children.
`fields` is a map from field name to the type of the field, which encodes the AST structure like traditional parsers.

Tree-sitter also has a special type called `subtypes`, an alias of a list of other kinds.

```typescript
type TypeScript = {
  // node type alias
  declaration: {
    type: "declaration",
    subtypes: [
      { type: "class_declaration", named: true },
      { type: "function_declaration", named: true },
    ]
  },
  ...
}
```

In this example, `declaration` is an alias of `function_declaration`, `class_declaration` and other kinds. The alias type is used to reduce the redundancy in the static type JSON and will NOT be a node's actual kind.

Thanks to Tree-Sitter's design, we can leverage this rich type information to build our typed APIs!

### Design Principles of ast-grep/napi

Our new API follows a progressive enhancement approach to type safety:

**Preserve untyped AST access**

The existing untyped API remains available by default, ensuring backward compatibility

**Optional type safety on demand**

Users can opt into typed AST nodes either manually or automatically for enhanced type checking and autocompletion

However, it is a bumpy ride to transition to a new typed API via the path of Tree-sitter's static type.

First, type information JSON is hosted by Parser Library Repository. ast-grep/napi uses [a dedicated script](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/scripts/generateTypes.ts) to fetch the JSON and generates the type. A [F# like type provider](https://learn.microsoft.com/en-us/dotnet/fsharp/tutorials/type-providers/) is on my TypeScript wishlist.

Second, the JSON contains a lot of unnamed kinds, which are not useful to users. Including them in the union type is too noisy. We will address this in the next section.

Finally, as mentioned earlier, the JSON contains alias types. We need to resolve the alias type to its concrete type, which is also covered in the next section.

## Define Type

### Give `SgNode` its type

We add two type parameters to `SgNode` to represent the language type map and the node's kind.
`SgNode<M, K>` is the main type in the new API. It is a generic type that represents a node with kind `K` of language type map `M`. By default, it is a union of all possible kinds of nodes.

```typescript
class SgNode<M extends TypesMap, K extends keyof M = Kinds<M>> {
  kind: K
  fields: M[K]['fields'] // demo definition, real one is more complex
}
```

It provides a **correct** interface for an AST node in a specific language. While it is still **robust** enough to not trigger compiler error when no type information is available.


### `ResolveType<M, T>`

TreeSitter's type alias is helpful to reduce the generated JSON file size but it is not useful to users because the alias is never directly used as a node's kind nor is used as `kind` in ast-grep rule. For example, `declaration` mentioned above can never be used as `kind` in ast-grep rule.

We need to use a type alias to **correctly** resolve the alias type to its concrete type.

```typescript
type ResolveType<M, T extends keyof M> =
  M[T] extends {subtypes: infer S extends {type: string}[] }
    ? ResolveType<M, S[number]['type']>
    : T
```

### `Kinds<M>`

Having a collection of possible AST node kinds is awesome, but it is sometime too clumsy to use a big string literal union type.
Using a type alias to **concisely** represent all possible kinds of nodes is a huge UX improvement.

Also, TreeSitter's static type contains a lot of unnamed kinds, which are not useful to users. Including them in the union type is too noisy. We need to allow users to opt-in to use the kind, and fallback to a plain `string` type, creating a more **robust** API.

```typescript
type Kinds<M> = keyof M & LowPriorityString
type LowPriorityString = string & {}
```

The above type is a linient string type that is compatible with any string type. But it also uses a well-known trick to take advantage of TypeScript's type priority to prefer the `keyof M` type in completion over the `string & {}` type. To make it more self-explanatory, the `stirng & {}` type is aliased to `LowPriorityString`.

Problem? open-ended union is not [well](https://github.com/microsoft/TypeScript/issues/33471) [supported](https://github.com/microsoft/TypeScript/issues/26277) in TypeScript.

We need other tricks to make it work better. Introducing `RefineNode` type.

###  Bridging general nodes and specific nodes via `RefineNode`

There are two categories of nodes:
* general `string`ly typed SgNode
* precisely typed SgNode

general node is like the untyped old API (but with better completion)
precisely typed node is a union type of all possible kinds of nodes

The previous general node is typed as `SgNode<M, Kinds<M>>`, the later is typed as `SgNode<M, 'specific_kind'>`.

when it comes to a node that can have several specific kinds, it is better to use a union type of all possible kinds of nodes.

Which kind of union should we use?

Note `SgNode<'expression' | 'type'>` is different from `SgNode<'expression'> | SgNode<'type'>`
TypeScript has difficulty in narrowing the previous type, because it not safe to assume the former is equivalent to the later.

```typescript
let single: SgNode<'expression' | 'type'>
if (single.kind === 'expression') {
  single // Still SgNode<'expression' | 'type'>, not narrowed
}
let union: SgNode<'expression'> | SgNode<'type'>
if (union.kind === 'expression') {
  union // SgNode<'expression'>, narrowed
}
```

However, `SgNode` is covariant in the kind parameter and this means it is okay.
it is general okay to distribute the type constructor over union type if the parameter is covariant.
but TypeScript does not support this feature.

So ast-grep uses a trick via the type `RefineNode<M, K>` to let you refine the former one to  the later one.

If we don't have confidence to narrow the type, that is, the union type `K` contains a constituent of `string` type, it is equivalent to `SgNode<M, Kinds<M>>`.
Otherwise, we can refine the node to a union type of all possible kinds of nodes.

```typescript
type RefineNode<M, K> = string extends K ? SgNode<M, K> :
  K extends keyof M ? SgNode<M, K> : never // this conditional type unpack the string union to Node union
```
it is like biome / rowan's API where you can refine the node to a specific kind.

https://github.com/biomejs/biome/blob/09a04af727b3cdba33ac35837d112adb55726add/crates/biome_rowan/src/ast/mod.rs#L108-L120

Again, having both untyped and typed API is a good trade-off between **correct** and **robust** type checking. You want the compiler to infer as much as possible if a clue of the node type is given, but you also want to allow writing code without type.


## Refine Type

Now let's talk about how to refine the general node to a specific node in ast-grep/napi.

Both manual and automatic refinement are **concise** and idiomatic in TypeScript.

### Refine Node, Manually

You can  do runtime checking via `sgNode.is("kind")`
```typescript
class SgNode<M, K> {
  is<T extends K>(kind: T): this is SgNode<M, T>
}
```

It can offer one time type narrowing

```typescript
if (sgNode.is("function_declaration")) {
  sgNode.kind // narrow to 'function_declaration'
}
```

Another way is to provide an optional type parameter to the traversal method to refine the node to a specific kind, in case you are confident that the node is always of a specific kind and want to skip runtime check.

This is like the `document.querySelector<T>` method in the [DOM API](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html#the-queryselector-and-queryselectorall-methods). It returns a general `Element` type, but you can refine it to a specific type like `HTMLDivElement` by providing generic argument.

For example `sgNode.parent<"program">()`. This will refine the node to a specific kind `SgNode<TS, "program">`.

This uses the interesting overloading feature of TypeScript

```typescript
interface NodeMethod<M, K> {
  (): SgNode
  <T extends K>(): RefineNode<M, T>
}
```
If no type is provided, it returns a general node, `SgNode<M>`.
If a type is provided, it returns a specific node, `SgNode<M, K>`.

The reason why we use two overloading signatures here is to distinguish the two cases. If we use a single generic signature, TypeScript will always return the single version `SgNode<M, K1|K2>` or always returns a union of different `SgNode`s.


:::tip When to use type parameter and when `is`?

If you cannot guarantee the node kind and want to do runtime check, use `is` method.

If you are 100% sure about the node kind and want to avoid the runtime check overhead, use type parameter.
Note this option can break type safety if misused. This command can help you to audit.

```bash
ast-grep -p '$NODE.$METHOD<$K>($$$)'
```
:::

### Refine Node, Automatically

The key feature of the new API is to automatically refine the node to a specific kind when the user gives more type information.

This is done by using the `field` method

`sgNode.field("kind")` will automatically check the field name and its corresponding types in the static type, and refine the node to the specific kind.
```typescript
let exportStmt: SgNode<'export_statement'>
exportStmt.field('declaration') // refine to SgNde<'function_declaration'> | SgNode<'variable_declaration'> ...
```

You don't need to explicitly spell out the kind! It is both **concise** and **correct**.


### Exhaustive Check via `sgNode.kindToRefine`

ast-grep/napi also introduced a new property `kindToRefine` to refine the node to a specific kind.

Why do we need the `kindToRefine` property given that we already have a `kind()` method?

First, `kind` is a method in the existing API and we prefer not to have a breaking change.

Secondly, TypeScript cannot narrow type via a method call. It can only narrow type via a property access.

In terms of implementation, `kindToRefine` is a getter under the hood powered by napi. It is less efficient thant JavaScript's object property access.
Actually, it will call Rust function from JavaScript, which is as expensive as the `kind()` method.

To bring user's awareness to this **performance** implication and to make a backward compatible API change, we introduce the `kindToRefine` property.

It is mostly useful for a union type of nodes with specific kinds, guiding you to write a **correct** AST program. You can use it in tandem with the union type returned by `RefinedNode` to exhaustively check all possible kinds of nodes.

```typescript
const func: SgNode<'function_declaration'> | SgNode<'arrow_function'>

switch (func.kindToRefine) {
  case 'function_declaration':
    func.kindToRefine // narrow to 'function_declaration'
    break
  case 'arrow_function':
    func.kindToRefine // narrow to 'arrow_function'
    break
  // ....
  default:
    func satisfies never // exhaustiveness, checked!
}
```

## Confine Types

Be austere of type level programming. Too much type level programming can make the compiler explode, as well as users' brain.

### Prune unnamed kinds
Tree-sitter's static type contains a lot of unnamed kinds, which are not useful to users.

For example `+`/`-`/`*`/`/` is too noisy for an AST library.

This is also the reason why we need to include `string` in the `Kinds`.

In the type generation step, ast-grep filters out these unnamed kinds to make the type more **concise**.

### Opt-in refinement for better compile time performance

The new API is designed to provide a better type checking and completion experience to the user. But it comes with a cost of **performance**.
One type map for a single language can be several thousand lines of code with hundreds of kinds.
The more type information the user provides, the slower the compile time.


So you need to explicitly opt in type information by passing type parameters to `parse` method.
```typescript
import { parse } from '@ast-grep/napi'
import TS from '@ast-grep/napi/lang/TypeScript'
const untyped = parse(Lang.TypeScript, code)
const typed = parse<TS>(Lang.TypeScript, code)
```

### Typed Rule!

The last feature worth mentioning is the typed rule! You can even type the `kind` in rule JSON!


```typescript
interface Rule<M extends TypeMaps> {
    kind: Kinds<M>
    ... // other rules
}
```

Of course this is not to _confine_ the type, but let the type creep into the rule greatly improving the UX and rule **correctness**.

You can look up the available kinds in the static type via the completion popup in your editor. (btw I use nvim)
```typescript
sgNode.find({
  rule: {
    // kind: 'invalid_kind', // error!
    kind: 'function_declaration', // typed!
  }
})
```

## Ending

I'm very thrilled to see the future of AST manipulation in TypeScript.
This feature enables users to switch freely between untyped AST and typed AST.

To use a quote from [Theo's video](https://www.youtube.com/clip/Ugkxn2oomDuyQjtaKXhYP1MU9TLEShf5m1nf):

> There are very few devs that understands Rust deeply enough and compiler deeply enough that also care about TypeScript in web dev enough to build something for web devs in Rust

ast-grep will strive to be the one that bridges the gap between Rust and TypeScript.