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

**Preserve untyped AST access**. The existing untyped API remains available by default, ensuring backward compatibility

**Optional type safety on demand**. Users can opt into typed AST nodes either manually or automatically for enhanced type checking and autocompletion

However, it is a bumpy ride to transition to a new typed API via the path of Tree-sitter's static type.

First, type information JSON is hosted by Parser Library Repository. ast-grep/napi uses [a dedicated script](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/scripts/generateTypes.ts) to fetch the JSON and generates the type. A [F# like type provider](https://learn.microsoft.com/en-us/dotnet/fsharp/tutorials/type-providers/) is on my TypeScript wishlist.

Second, the JSON contains a lot of unnamed kinds, which are not useful to users. Including them in the union type is too noisy. We will address this in the next section.

Finally, as mentioned earlier, the JSON contains alias types. We need to resolve the alias type to its concrete type, which is also covered in the next section.

## Define Types

New API's core involves several key new types and extensions to existing types.

### Let `SgNode` Have Type

`SgNode` class, the cornerstone of our new API, now accepts two new optional type parameters.

```typescript
class SgNode<M extends TypesMap, K extends Kinds<M> = Kinds<M>> {
  kind: K
  fields: M[K]['fields'] // demo definition, real one is more complex
}
```

It represents a node in a language with type map `M` that has a specific kind `K`. e.g. `SgNode<TypeScript, "function_declaration">` means a function declaration node in TypeScript. When used without a specific kind parameter, `SgNode` defaults to accepting any valid node kind in the language.

`SgNode` provides a **correct** AST interface in a specific language. While at the same time, it is still **robust** enough to not trigger compiler error when no type information is available.


### `ResolveType<M, T>`

While Tree-sitter's type aliases help keep the JSON type definitions compact, they present a challenge: these aliases never appear as actual node kinds in ast-grep rules.

To handle this, we created `ResolveType` to **correctly** map aliases to their concrete kinds:

```typescript
type ResolveType<M, T extends keyof M> =
  M[T] extends {subtypes: infer S extends {type: string}[] }
    ? ResolveType<M, S[number]['type']>
    : T
```

This type recursively resolves aliases until it reaches actual node types that developers work with.

### `Kinds<M>`

Having access to all possible AST node types is powerful, but it is unwieldy to work with large string literal union types. It can be a huge UX improvement to use a type alias to **concisely** represent all possible kinds of nodes.

Additionally, Tree-sitter's static type contains a bunch of noisy unnamed kinds. But excluding them from the union type can lead to a incomplete type signature. ast-grep instead bundle them into a plain `string` type, creating a more **robust** API.

```typescript
type Kinds<M> = ResolveType<M, keyof M> & LowPriorityString
type LowPriorityString = string & {}
```

The above type is a linient string type that is compatible with any string type. But it also uses a [well-known trick](https://stackoverflow.com/a/61048124/2198656) to take advantage of TypeScript's type priority to prefer the `ResolveType` in completion over the `string & {}` type.


We alias `string & {}` to `LowPriorityString` to make the code's intent clearer. This approach creates a more intuitive developer experience, though it does run into [some limitations](https://github.com/microsoft/TypeScript/issues/33471) with TypeScript's handling of [open-ended unions](https://github.com/microsoft/TypeScript/issues/26277).

We need other tricks to address these limitations. Introducing `RefineNode` type.

###  Bridging general nodes and specific nodes via `RefineNode`

A key challenge in our type system was handling two distinct categories of nodes:

1. **General Nodes**: String-based typing (like our original API, but with enhanced completion), `SgNode<M, Kinds<M>>`.
2. **Specific Nodes**: Precisely typed nodes with known kinds, `SgNode<M, 'specific_kind'>`.

When dealing with nodes that could be several specific kinds, we faced an interesting type system challenge. Consider these two approaches:

```typescript
// Approach 1: Union in the type parameter
let single: SgNode<'expression' | 'type'>

// Approach 2: Union of specific nodes
let union: SgNode<'expression'> | SgNode<'type'>
```

These approaches behave differently in TypeScript, for a [good reason](https://x.com/hd_nvim/status/1868706176281854151):

```typescript
let single: SgNode<'expression' | 'type'>
if (single.kind === 'expression') {
  single // Remains SgNode<'expression' | 'type'> - not narrowed!
}

let union: SgNode<'expression'> | SgNode<'type'>
if (union.kind === 'expression') {
  union // Successfully narrowed to SgNode<'expression'>
}
```

`SgNode` is technically covariant in its kind parameter, meaning it's safe to distribute the type constructor over unions. However TypeScript doesn't support this automatically. (We will not go down the rabbit hole of type constructor variance here. But interested readers can check out [this wiki](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)).)

To bridge this gap, we introduced the `RefineNode` type:

```typescript
type RefineNode<M, K extends Kinds<M>> =
type RefineNode<M, K> = string extends K ? SgNode<M, K> : // one SgNode
  K extends keyof M ? SgNode<M, K> : never  // distribute over union
```

This utility type provides two key behaviors:
1. When `K` includes a string type, it preserves the general node behavior
2. Otherwise, it refines the node into a union of specific types, using TypeScripts' [distributive conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types).

This approach, inspired by [Biome's Rowan API](https://github.com/biomejs/biome/blob/09a04af727b3cdba33ac35837d112adb55726add/crates/biome_rowan/src/ast/mod.rs#L108-L120), achieves our dual goals: it remains **correct** by preserving proper type relationships and stays **robust** by gracefully handling both typed and untyped usage.

This hybrid approach gives developers the best of both worlds: strict type checking when types are known, with the flexibility to fall back to string-based typing when needed.

## Refine Type

Now let's talk about how to refine the general node to a specific node in ast-grep/napi.
We've implemented two concise and idiomatic approaches in TypeScript: manual and automatic refinement.

### Refine Node, Manually

#### Runtime Type Checking

The first manual approach uses runtime verification through the `is` method:

```typescript
class SgNode<M, K> {
  is<T extends K>(kind: T): this is SgNode<M, T>
}
```

This enables straightforward type narrowing:

```typescript
if (sgNode.is("function_declaration")) {
  sgNode.kind // narrow to 'function_declaration'
}
```

#### Type Parameter Specification

Another manual approach lets you explicitly specify node types through type parameters. This is particularly useful when you're certain about a node's kind and want to skip runtime checks for better performance.

This pattern may feel familiar if you've worked with the [DOM API](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html#the-queryselector-and-queryselectorall-methods)'s `querySelector<T>`. Just as `querySelector` can be refined from a general `Element` to a specific `HTMLDivElement`, we can refine our nodes:

```typescript
sgNode.parent<"program">() // Returns SgNode<TS, "program">
```


The type parameter approach uses an interesting overloading signature

```typescript
interface NodeMethod<M, K> {
  (): SgNode<M>                     // Untyped version
  <T extends K>(): RefineNode<M, T> // Typed version
}
```

If no type is provided, it returns a general node, `SgNode<M>`. If a type is provided, it returns a specific node, `SgNode<M, K>`.

This dual-signature typing avoids the limitations of a single generic signature, which would either always return `SgNode<M, K1|K2>` or always produce a union of `SgNode`s.

#### Choosing the Right Type

When should you use each manual refinement method? Here are some guidelines:

✓ Use `is()` when:
* You need runtime type check
* Node types might vary
* Type safety is crucial

✓ Use type parameters when:

* You're completely certain of the node type
* Performance is critical
* The node type is fixed

:::tip Safety Tip

Be cautious with type parameters as they bypass runtime checks. It can break type safety if misused.
You can audit their usage with the command:

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