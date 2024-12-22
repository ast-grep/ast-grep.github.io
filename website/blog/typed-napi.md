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

A standout feature of our new API is automatic type refinement based on contextual information. This happens seamlessly through the `field` method.

When you access a node's field using `field("name")`, the system automatically examines the static type information and refines the node type accordingly:

```typescript
let exportStmt: SgNode<'export_statement'>
exportStmt.field('declaration') // Automatically refines to union:
                               // SgNode<'function_declaration'> |
                               // SgNode<'variable_declaration'> | ...
```

The magic here is that you never need to specify the possible types explicitly - the system infers them automatically. This approach is both **concise** in usage and **correct** in type inference.

### Exhaustive Pattern Matching with kindToRefine

We've also introduced a new `kindToRefine` property for comprehensive type checking. You might wonder: why add this when we already have a `kind()` method?

There are two key reasons:
1. Preserving backward compatibility with the existing `kind()` method
2. Enabling TypeScript's type narrowing, which works with properties but not method calls

While `kindToRefine` is implemented as a getter that calls into Rust code (making it as computationally expensive as the `kind()` method), it enables powerful type checking capabilities. To ensure developers are aware of this **performance** characteristic, we deliberately chose a _distinct and longer_ property name.

This property really shines when working in tandem union types returned by `RefineNode`, helping you write **correct** AST transformations through exhaustive pattern matching:

```typescript
const func: SgNode<'function_declaration'> | SgNode<'arrow_function'>

switch (func.kindToRefine) {
  case 'function_declaration':
    func.kindToRefine // Narrowed to function_declaration
    break
  case 'arrow_function':
    func.kindToRefine // Narrowed to arrow_function
    break
  default:
    func satisfies never // TypeScript ensures we handled all cases
}
```

The combination of automatic type refinement and exhaustive pattern matching makes it easier to write **correct** AST transformations while catching potential errors at compile time.

## Confine Types

Always bear in mind this mantra: _Be austere with type level programming._

Overdoing type level programming can overload the compiler as well as overwhelm users.
It is a good practice to confine the API type to a reasonable complexity level.

### Prune unnamed kinds

Tree-sitter's static type includes many unnamed kinds, which are not user-friendly.

For instance, operators like `+`/`-`/`*`/`/` are too verbose for an AST library. We're building a compiler plugin, not solving elementary school math problems, right?

This is why we exclude the unnamed kinds and include `string` in the `Kinds`.

In the type generation step, ast-grep filters out these unnamed kinds to make the type more **concise**.

### Opt-in refinement for better compile time performance

The new API is designed to provide a better type checking and autocompletion experience for users.
However, this improvement comes at the cost of **performance**. A single type map for one language can span several thousand lines of code with hundreds of kinds. The more type information the user provides, the slower the compile time.

To manage this, you need to explicitly opt into type information by passing type parameters to the `parse` method.

```typescript
import { parse } from '@ast-grep/napi'
import TS from '@ast-grep/napi/lang/TypeScript' // import this can be slow
const untyped = parse(Lang.TypeScript, code)
const typed = parse<TS>(Lang.TypeScript, code)
```

### Typed Rule!

The last notable feature is the typed rule. You can even type the `kind` in rule JSON!

```typescript
interface Rule<M extends TypeMaps> {
    kind: Kinds<M>
    ... // other rules
}
```

Of course, this isn't about _confining_ the type but allowing type information to enhance rules, significantly improving UX and rule **correctness**.

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

I'm incredibly excited about the future of AST manipulation in TypeScript.

This feature empowers users to seamlessly switch between untyped and typed AST, offering flexibility and enhanced capabilities, an innovation that has not been seen in other AST libraries, especially not in native language based ones.

As Theo aptly puts it in [his video](https://www.youtube.com/clip/Ugkxn2oomDuyQjtaKXhYP1MU9TLEShf5m1nf):

> There are very few devs that understands Rust deeply enough and compiler deeply enough that also care about TypeScript in web dev enough to build something for web devs in Rust

ast-grep is determined to bridge that gap between Rust and TypeScript!
