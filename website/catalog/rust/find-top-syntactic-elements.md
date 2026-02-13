# Find All Syntactic Elements

A collection of ast-grep rules for matching common Rust syntactic constructs: impl block methods, struct declarations, attribute items, trait declarations, trait method signatures, trait method definitions, type aliases, enum items, union items, the `tests` mod, free/top-level functions, and all impl blocks.

---

## Impl Block Methods

### Description

Matches `function_item` nodes (methods) that live inside an `impl_item` block, and captures the method name as an `identifier`. Useful for auditing or analyzing the methods of a concrete type implementation.

### YAML

```yaml
id: find-impl-block-methods
language: rust
rule:
  all:
    - kind: function_item
      pattern: $METHOD_BODY
    - inside:
        kind: impl_item
        pattern: $METHOD_IMPL_BODY
        stopBy: end
    - has:
        kind: identifier
        field: name
        pattern: $METHOD_NAME
```

### Captures

- `$METHOD_BODY` — each matched `function_item` node inside the impl
- `$METHOD_IMPL_BODY` — the matched `impl_item` node (the whole impl block)
- `$METHOD_NAME` — the `identifier` node for the method's name

### Example

```rs {2}
impl MyType {
    fn inherent_method(&self) {}
}
```

---

## Struct Declarations

### Description

Matches any `struct_item` node and captures both the full struct declaration and its name. Matches all struct forms: unit structs (`struct Foo;`), tuple structs (`struct Foo(u32);`), and named-field structs (`struct Foo { ... }`).

### YAML

```yaml
id: find-struct-declarations
language: rust
rule:
  all:
    - kind: struct_item
      pattern: $STRUCT_BODY
    - has:
        field: name
        pattern: $STRUCT_NAME
```

### Captures

- `$STRUCT_BODY` — the entire `struct_item` node (the declaration + body)
- `$STRUCT_NAME` — the `identifier` node that holds the struct's name

### Example

```rs {1}
struct MyType{}
struct Wrapper<T>(T){}
struct Array<T, const N: usize>([T; N]){}
```

---

## Attribute Items

### Description

Matches attribute nodes such as `#[derive(...)]`, `#![no_std]`, or any inner/outer attributes. Captures the entire `attribute_item` node.

### YAML

```yaml
id: find-attribute-items
language: rust
rule:
  all:
    - kind: attribute_item
      pattern: $ATTRIBUTES
```

### Captures

- `$ATTRIBUTES` — the `attribute_item` node(s)

### Example

```rs {1}
#[derive(Copy, Clone)]
```

---

## Trait Declaration

### Description

Matches a `trait_item` node and captures the whole trait declaration and its name. Useful for listing all traits in a codebase, or for enforcing naming or documentation conventions at the trait level.

### YAML

```yaml
id: find-trait-declarations
language: rust
rule:
  all:
    - kind: trait_item
      pattern: $TRAIT_BODY
    - has:
        field: name
        kind: type_identifier
        pattern: $TRAIT_NAME
```

### Captures

- `$TRAIT_BODY` — the whole trait declaration node
- `$TRAIT_NAME` — the name of the trait (a `type_identifier`)

### Example

```rs {1}
trait SomeTrait<T> {
    fn my_function(){};
}
```

---

## Trait Method Signatures (No Body)

### Description

Matches `function_signature_item` nodes inside a trait — method declarations with no body (required methods that implementors must define). Also captures the enclosing trait name so you can correlate each signature with its trait.

### YAML

```yaml
id: find-trait-method-signatures
language: rust
rule:
  all:
    - kind: function_signature_item
      pattern: $TRAIT_METHOD_SIGNATURE
    - has:
        field: name
        kind: identifier
        pattern: $TRAIT_METHOD_SIGNATURE_NAME
    - inside:
        stopBy: end
        kind: trait_item
        pattern: $TRAIT_BODY_WITH_METHOD_SIGNATURE
        has:
          field: name
          kind: type_identifier
          pattern: $TRAIT_NAME_METHOD_SIGNATURE
```

### Captures

- `$TRAIT_METHOD_SIGNATURE` — the `function_signature_item` node (the signature, no body)
- `$TRAIT_METHOD_SIGNATURE_NAME` — the `identifier` node for the function name inside the signature
- `$TRAIT_BODY_WITH_METHOD_SIGNATURE` — the enclosing `trait_item` node
- `$TRAIT_NAME_METHOD_SIGNATURE` — the trait's `type_identifier`

### Example

```rs {2}
trait SomeTrait<T> {
    fn my_function();
}
```

---

## Trait Method Definitions (With Body)

### Description

Matches `function_item` nodes inside a trait — method definitions that include a body (provided/default methods). Also captures the enclosing trait name.

### YAML

```yaml
id: find-trait-method-definitions
language: rust
rule:
  all:
    - kind: function_item
      pattern: $TRAIT_METHOD_BODY
    - has:
        field: name
        kind: identifier
        pattern: $TRAIT_METHOD_NAME
    - inside:
        stopBy: end
        kind: trait_item
        pattern: $TRAIT_BODY_WITH_METHOD
        has:
          field: name
          kind: type_identifier
          pattern: $TRAIT_NAME_WITH_METHOD
```

### Captures

- `$TRAIT_METHOD_BODY` — the `function_item` node (a method definition with a body)
- `$TRAIT_METHOD_NAME` — the `identifier` node for the function name of the method
- `$TRAIT_BODY_WITH_METHOD` — the enclosing `trait_item` node
- `$TRAIT_NAME_WITH_METHOD` — the trait's `type_identifier`

### Example

```rs {2}
trait SomeTrait {
    fn trait_function(t: T) -> Self { Wrapper(t) }
}
```

---

## Type Alias

### Description

Matches `type_item` nodes (e.g. `type Foo = ...;`) and captures both the full alias declaration and its name.

### YAML

```yaml
id: find-type-aliases
language: rust
rule:
  all:
    - kind: type_item
      pattern: $TYPE_ALIAS_BODY
    - has:
        kind: type_identifier
        field: name
        pattern: $TYPE_ALIAS_NAME
```

### Captures

- `$TYPE_ALIAS_BODY` — the whole `type_item` node
- `$TYPE_ALIAS_NAME` — the `type_identifier` node for the alias name

### Example

```rs {1}
type Id = u32;
```

---

## Enum Item

### Description

Matches `enum_item` nodes and captures the entire enum declaration and its name. Works with simple enums, generic enums, and enums with `where` clauses.

### YAML

```yaml
id: find-enum-items
language: rust
rule:
  all:
    - kind: enum_item
      pattern: $ENUM_BODY
    - has:
        kind: type_identifier
        pattern: $ENUM_NAME
```

### Captures

- `$ENUM_BODY` — the entire enum declaration node
- `$ENUM_NAME` — the `type_identifier` containing the enum's name

### Example

```rs {1}
enum Result<T, E>
where
    E: std::error::Error,
{
    Ok(T),
    Err(E),
}
```

---

## Union Item

### Description

Matches `union_item` nodes and captures the entire union declaration and its name.

### YAML

```yaml
id: find-union-items
language: rust
rule:
  all:
    - kind: union_item
      pattern: $UNION_BODY
    - has:
        kind: type_identifier
        field: name
        pattern: $UNION_NAME
```

### Captures

- `$UNION_BODY` — the entire union declaration node
- `$UNION_NAME` — the `type_identifier` containing the union's name

### Example

```rs {2}
pub union IntOrFloat {
    pub i: u32,
    pub f: f32,
}
```

---

## Mod Item Named `tests`

### Description

Matches a `mod_item` whose name is exactly `"tests"` (matched via regex). This is the conventional name for Rust's inline test module, typically annotated with `#[cfg(test)]`.

### YAML

```yaml
id: find-tests-mod
language: rust
rule:
  all:
    - kind: mod_item
      pattern: $TESTS_MOD
    - has:
        kind: identifier
        field: name
        regex: ^tests$
```

### Captures

- `$TESTS_MOD` — the entire `mod_item` node

### Example

```rs {2}
mod tests {
    #[test]
    fn test_() {
        use super::*;
    }
}
```

---

## Free / Top-Level Functions

### Description

Matches any `function_item` node that has an `identifier` for its name. This covers free functions at module scope as well as associated functions (e.g. `fn new() -> Self`). Note that `function_item` also appears inside `impl` and `trait` blocks — use an additional `not: inside:` constraint if you need to exclude those.

### YAML

```yaml
id: find-free-functions
language: rust
rule:
  all:
    - kind: function_item
      pattern: $FUNCTION_BODY
    - has:
        kind: identifier
        field: name
        pattern: $FUNCTION_NAME
```

### Captures

- `$FUNCTION_BODY` — the whole `function_item` node
- `$FUNCTION_NAME` — the `identifier` node for the function's name

### Example

```rs {1}
fn make_iter() -> impl Iterator<Item = u8> {
    std::iter::once(1u8)
}
```

---

## All Impl Blocks

### Description

Matches every `impl_item` node in the file, regardless of what it implements or whether it has any methods. Useful for a broad scan of all implementations in a codebase.

### YAML

```yaml
id: find-all-impl-blocks
language: rust
rule:
  all:
    - kind: impl_item
      pattern: $IMPL_BODY
```

### Captures

- `$IMPL_BODY` — the whole `impl_item` node

### Example

```rs {1}
impl<T> SomeTrait for Wrapper<T> {
    type Assoc = Wrapper<T>;
}
```

### All rules in one file

```yaml
id: find-all-syntactic-elements
language: rust
rule:
  any:
    # ------------------------------------------------------------
    # IMPL BLOCK (contains methods with identifiers)
    # ------------------------------------------------------------
    # Matches an `impl_item` that contains one or more `function_item` nodes
    # (i.e., methods). Each matched function_item must contain an `identifier`
    # node for the method name.
    #
    # Captures:
    # - $METHOD_BODY     : each matched function_item node inside the impl
    # - $METHOD_IMPL_BODY: the matched impl_item node (the whole impl block)
    # - $METHOD_NAME     : the identifier node for the method's name
    # ------------------------------------------------------------
    - all:
        - kind: function_item
          pattern: $METHOD_BODY
        - inside:
            kind: impl_item
            pattern: $METHOD_IMPL_BODY
            stopBy: end
        - has:
            kind: identifier
            field: name
            pattern: $METHOD_NAME

    # ------------------------------------------------------------
    # STRUCT (with captured name)
    # ------------------------------------------------------------
    # Matches a `struct_item` and captures:
    # - $STRUCT_BODY     : the entire struct_item node (the declaration + body)
    # - $STRUCT_NAME     : the identifier node that holds the struct's name
    # ------------------------------------------------------------
    - all:
        - kind: struct_item
          pattern: $STRUCT_BODY
        - has:
            field: name
            pattern: $STRUCT_NAME

    # ------------------------------------------------------------
    # ATTRIBUTE ITEMS
    # ------------------------------------------------------------
    # Matches attribute nodes such as `#[derive(...)]`, `#![no_std]`, or inner
    # attributes. Captures:
    # - $ATTRIBUTES      : the attribute_item node(s)
    # ------------------------------------------------------------
    - all:
        - kind: attribute_item
          pattern: $ATTRIBUTES

    # ------------------------------------------------------------
    # TRAIT DECLARATION (capture the trait itself)
    # ------------------------------------------------------------
    # Matches a `trait_item` and captures:
    # - $TRAIT_BODY      : the whole trait declaration node
    # - $TRAIT_NAME      : the name of the trait (a type_identifier)
    # ------------------------------------------------------------
    - all:
        - kind: trait_item
          pattern: $TRAIT_BODY
        - has:
            field: name
            kind: type_identifier
            pattern: $TRAIT_NAME

    # ------------------------------------------------------------
    # METHOD SIGNATURES INSIDE TRAITS (no body)
    # ------------------------------------------------------------
    # Matches `function_signature_item` nodes (method signatures inside traits — declaration only).
    # Captures:
    # - $TRAIT_METHOD_SIGNATURE            : the function_signature_item node (the signature, no body)
    # - $TRAIT_METHOD_SIGNATURE_NAME       : the identifier node for the function name inside the signature
    # - $TRAIT_BODY_WITH_METHOD_SIGNATURE  : the enclosing trait_item node (the trait that contains the signature)
    # - $TRAIT_NAME_METHOD_SIGNATURE       : the trait's identifier (type_identifier)
    # ------------------------------------------------------------
    - all:
        - kind: function_signature_item
          pattern: $TRAIT_METHOD_SIGNATURE
        - has:
            field: name
            kind: identifier
            pattern: $TRAIT_METHOD_SIGNATURE_NAME
        - inside:
            stopBy: end
            kind: trait_item
            pattern: $TRAIT_BODY_WITH_METHOD_SIGNATURE
            has:
              field: name
              kind: type_identifier
              pattern: $TRAIT_NAME_METHOD_SIGNATURE

    # ------------------------------------------------------------
    # METHOD DEFINITIONS INSIDE TRAITS (with body)
    # ------------------------------------------------------------
    # Matches `function_item` nodes (method definitions inside traits — include body).
    # Captures:
    # - $TRAIT_METHOD_BODY            : the function_item node (a method definition with a body)
    # - $TRAIT_METHOD_NAME            : the identifier node for the function name of the method
    # - $TRAIT_BODY_WITH_METHOD       : the enclosing trait_item node (the trait that contains the method)
    # - $TRAIT_NAME_WITH_METHOD       : the trait's identifier (type_identifier)
    # ------------------------------------------------------------
    - all:
        - kind: function_item
          pattern: $TRAIT_METHOD_BODY
        - has:
            field: name
            kind: identifier
            pattern: $TRAIT_METHOD_NAME
        - inside:
            stopBy: end
            kind: trait_item
            pattern: $TRAIT_BODY_WITH_METHOD
            has:
              field: name
              kind: type_identifier
              pattern: $TRAIT_NAME_WITH_METHOD

    # ------------------------------------------------------------
    # TYPE ALIAS (type_item with its identifier)
    # ------------------------------------------------------------
    # Matches `type_item` (e.g. `type Foo = ...;`) and captures:
    # - $TYPE_ALIAS_BODY : the whole type_item node
    # - $TYPE_ALIAS_NAME : the identifier node (type_identifier) for the alias name
    # ------------------------------------------------------------
    - all:
        - kind: type_item
          pattern: $TYPE_ALIAS_BODY
        - has:
            kind: type_identifier
            field: name
            pattern: $TYPE_ALIAS_NAME

    # ------------------------------------------------------------
    # ENUM ITEM (capture the enum and its name)
    # ------------------------------------------------------------
    # Matches an `enum_item` node and captures:
    # - $ENUM_BODY       : the entire enum declaration node (the whole `enum ... { ... }`)
    # - $ENUM_NAME       : the identifier node containing the enum's name
    # ------------------------------------------------------------
    - all:
      - kind: enum_item
        pattern: $ENUM_BODY
      - has:
          kind: type_identifier
          pattern: $ENUM_NAME

    # ------------------------------------------------------------
    # UNION ITEM (capture the union and its name)
    # ------------------------------------------------------------
    # Matches a `union_item` node and captures:
    # - $UNION_BODY      : the entire union declaration node
    # - $UNION_NAME      : the identifier node containing the union's name
    # ------------------------------------------------------------
    - all:
      - kind: union_item
        pattern: $UNION_BODY
      - has:
          kind: type_identifier
          field: name
          pattern: $UNION_NAME

    # ------------------------------------------------------------
    # MOD ITEM with identifier "tests"
    # ------------------------------------------------------------
    # Matches a `mod_item` where the module name is exactly "tests"
    # Captures:
    # - $TESTS_MOD       : the entire mod_item node
    # ------------------------------------------------------------
    - all:
        - kind: mod_item
          pattern: $TESTS_MOD
        - has:
            kind: identifier
            field: name
            regex: ^tests$

    # ------------------------------------------------------------
    # FREE / TOP-LEVEL FUNCTION (function_item)
    # ------------------------------------------------------------
    # Matches any `function_item` (free function or associated function)
    # that has an `identifier` for the function name.
    #
    # Captures:
    # - $FUNCTION_BODY   : the whole function_item node
    # - $FUNCTION_NAME   : the identifier node for the function's name
    # ------------------------------------------------------------
    - all:
        - kind: function_item
          pattern: $FUNCTION_BODY
        - has:
            kind: identifier
            field: name
            pattern: $FUNCTION_NAME

    # ------------------------------------------------------------
    # ALL IMPL BLOCKS
    # ------------------------------------------------------------
    # Matches every `impl_item`. Captures:
    # - $IMPL_BODY : the whole impl_item node
    # ------------------------------------------------------------
    - all:
        - kind: impl_item
          pattern: $IMPL_BODY
```

### Contributed by

[pramatias](https://github.com/pramatias)
