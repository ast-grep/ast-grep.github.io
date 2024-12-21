---
sidebar: false
---

# Improve Napi Typing

I'm thrilled to announce that [@ast-grep/napi] now supports typed, solving a [long standing issue](https://github.com/ast-grep/ast-grep/issues/48) in our feature request.

In this blog post, we will walk through the problem and the [design](https://github.com/ast-grep/ast-grep/issues/1669) of the new feature. It will also be a valuable resource to write a good TypeScript type in general.

## What's type safety? Why?

Writing AST manipulation code is hard. Even if we have a lot of [helpful](https://astexplorer.net/) [interactive](https://ast-grep.github.io/playground.html) [tool](https://github.com/sxzz/ast-kit), it's still hard to handle all edge cases.

AST types are good guide-rail to write comprehensive AST manipulation code. It guides one to write comprehensive AST manipulation code (in case people forget to handle some cases). Using exhaustive checking, one can ensure that all cases are handled.

While ast-grep napi is a convenient tool to programmatically process AST , but it lacks the type information to guide user to write robust logic to handle all potential code. Thank to [Mohebifar](https://github.com/mohebifar) from [codemod](https://codemod.com/), `ast-grep/napi` now can provide type information via nodejs API.

The solution to solve the problem is generating types from the static information provided by AST parser library, and using several TypeScript tricks to provide a good typing API.

## What are good TypeScript types?

before we talk about how we achieve the goal, let's talk about what are good TypeScript types.

Designing a good library in the modern JavaScript world is not only about providing good API naming, documentation and examples, but also about providing good TypeScript types. A good API type should be:

* **Correct**: reject invalid code and accept valid code
* **Concise**: easy to read, especially in hover and completion
* **Robust**: if compiler fails to infer your type, it should either graciously grant you the permission to be wild, or gracefully give you a easy to understand error message. it should not report a huge error that doesn't fit a screen
* **Performant**: fast to compile. complex types can slow down the compiler

It is really hard to provide a type system that is both [Sound and Complete](https://logan.tw/posts/2014/11/12/soundness-and-completeness-of-the-type-system/#:~:text=A%20type%2Dsystem%20is%20sound,any%20false%20positive%20%5B2%5D.). This is similar to provide a good typing API.


TS libs nowaday probably pay too much attention to correctness IMHO.
Having a type to check your path parameter in your routing is cool, but what's the cost?

Designing a good TypeScript type is essentially a trade-off of these four aspects.


## Design Type

Let's come back to ast-grep's problem.

The design principle of the new API is to progressively provide a more strict code checking and completion when the user gives more type information.

1. **Allow untyped AST access if no type information is provided**

Existing untyped API is still available and it is the default behavior.
The new feature should not break the existing code.

2. **Allow user to type AST node and enjoy more type safety**

The user can give types to AST nodes either manually or automatically.
Both approaches should refine the general untyped AST nodes to typed AST nodes and bring type check and intelligent completion to the user.

### TreeSitter's types

ast-grep is based on Tree-Sitter. Tree-Sitter's official API is untyped. It provies a uniform API to access the syntax tree across different languages. A node in Tree-Sitter has several common methods to access its node type, children, parent, and text content.

```TypeScript
class Node {
  kind(): string // get the node type
  field(name: string): Node // get a child node by field name
  parent(): Node
  children(): Node[]
  text(): string
}
```
The API is simple and easy to use, but it lacks type information.

In contrast, a specific language's syntax tree, like [estree](https://github.com/estree/estree/blob/0362bbd130e926fed6293f04da57347a8b1e2325/es5.md), has a more specific structure. For example, a function declaration in JavaScript has a `function` keyword, a name, a list of parameters, and a body. Other AST parser libraries encode this structure in their AST object types. For example, a `function_declaration` has fields like `parameters` and `body`.

Fortunately tree-sitter provides static node types in json.
There are several challenges to generate TypeScript types from tree-sitter's static node types.

1. json is hosted by parser library repo
We needs type generation (it is like F-sharp's type provider)
2. json contains a lot unnamed kinds
You are writing a compiler plugin, not elementary school math homework
3. json has alias type
For example, `declaration` is an alias of `function_declaration`, `class_declaration` and other declaration kinds.

### TreeSitter's `TypeMap`
The new typed API will consume TreeSitte's [static node types](https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types) like below:

```typescript
interface TypeMpa {
  [kind: string]: {
    type: string
    named: boolean
    fields?: {
      [field: string]: {
        types: { type: string, named: boolean }[]
      }
    }
    subtypes?: { type: string, named: boolean }[]
  }
}
```
What is `TypeMaps`? It is a type that contains all static node types. It is a map from kind to the static type of the kind.
Here is a simplified example of the TypeScript static type.

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
      ...
    }
  },
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

The type information is encoded in a JSON object. Syntax node's static type contains the kind, whether it is named, and the fields of the node.
`fields` is a map from field name to the type of the field, which encodes the structure of the AST like other parser libraries.

Tree-sitter also provides alias types where a kind is an alias of a list of other kinds. For example, `declaration` is an alias of `function_declaration`, `class_declaration` and other kinds. The alias type is used to reduce the number of kinds in the static type.

We want to both type a node's kind and its fields.


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