# Add New Language to ast-grep

Thank you for your interest in adding a new language to ast-grep!
We appreciate your contribution to this project. Adding new languages will make the tool more useful and accessible to a wider range of users.

However, there are some requirements and constraints that you need to consider before you start. This guide will help you understand the process and the standards of adding a new language to ast-grep.

## Requirements and Constraints

To keep ast-grep lightweight and fast, we have several factors to consider when adding a new language.
As a rule of thumb, we want to limit the binary size of ast-grep under 10MB after zip compression.

* **Popularity of the language**. While the popularity of a language does not necessarily reflect its merits, our limited size budget allows us to only support languages that are widely used and have a large user base. Online sources like [TIOBE index](https://www.tiobe.com/tiobe-index/) or [GitHub Octoverse](https://octoverse.github.com/2022/top-programming-languages) can help one to check the popularity of the language.

- **Quality of the Tree-sitter grammar**.  ast-grep relies on [Tree-sitter](https://tree-sitter.github.io/tree-sitter/), a parser generator tool and a parsing library, to support different languages. The Tree-sitter grammar for the new language should be _well-written_, _up-to-date_, and _regularly maintained_. You can search [Tree-sitter on GitHub](https://github.com/search?q=tree-sitter&type=repositories) or on [crates.io](https://crates.io/search?q=tree%20sitter).

- **Size of the grammar**. The new language's grammar should not be too complicated. Otherwise it may take too much space from other languages. You can also check the current size of ast-grep in the [releases page](https://github.com/ast-grep/ast-grep/releases).

- **Availability of the grammar on crates.io**. To ease the maintenance burden, we prefer to use grammars that are published on crates.io, Rust's package registry. If your grammar is not on crates.io, you need to publish it yourself or ask the author to do so.

---

Don't worry if your language is not supported by ast-grep. You can try ast-grep's [custom language support](/advanced/custom-language.html) and register your own Tree-sitter parser!

If your language satisfies the requirements above, congratulations! Let's see how to add it to ast-grep.

## Add to ast-grep Core

ast-grep has several distinct use cases: [CLI tool](https://crates.io/crates/ast-grep), [n-api lib](https://www.npmjs.com/package/@ast-grep/napi) and [web playground](https://ast-grep.github.io/playground.html).

Adding a language includes two steps. The first step is to add the language to ast-grep core.
The core repository is multi-crate workspace hosted at [GitHub](https://github.com/ast-grep/ast-grep). The relevant crate is [language](https://github.com/ast-grep/ast-grep/tree/main/crates/language), which defines the supported languages and their tree-sitter grammars.

We will use Ruby as an example to show how to add a new language to ast-grep core. You can see [the commit](https://github.com/ast-grep/ast-grep/commit/ffe14ceb8773c5d2b85559ff7455070e2a1a9388#diff-3590708789e9cdf7fa0421ecba544a69e9bbe8dd0915f0d9ff8344a9c899adfd) as a reference.


### Add Dependencies

1. Add `tree-sitter-[lang]` crate as `dependencies` to the [Cargo.toml](https://github.com/ast-grep/ast-grep/blob/main/crates/language/Cargo.toml#L13) in the `language` crate.

```toml
# Cargo.toml
[dependencies]
...
tree-sitter-ruby = {version = "0.20.0", optional = true } // [!code ++]
...
```

*Note the  `optional` attribute is required here.*

2. Add the `tree-sitter-[lang]` dependency in [`builtin-parser`](https://github.com/ast-grep/ast-grep/blob/e494500fc5d6994c20fe0102aa4b93d2108827bb/crates/language/Cargo.toml#L40) list.

```toml
# Cargo.toml
[features]
builtin-parser = [
  ...
  "tree-sitter-ruby",  // [!code ++]
  ...
]
```

The `builtin-parser` feature is used for command line tool. Web playground is not using the builtin parser so the dependency must be optional.

### Implement Parser

3. Add the parser function in [parsers.rs](https://github.com/ast-grep/ast-grep/blob/main/crates/language/src/parsers.rs), where tree-sitter grammars are imported.

```rust
#[cfg(feature = "builtin-parser")]
mod parser_implmentation {
  ...
  pub fn language_ruby() -> TSLanguage { // [!code ++]
    tree_sitter_ruby::language().into()  // [!code ++]
  }                                      // [!code ++]
  ...
}

#[cfg(not(feature = "builtin-parser"))]
mod parser_implmentation {
  impl_parsers!(
    ...
    language_ruby, // [!code ++]
    ...
  );
}
```
Note there are two places to add, one for `#[cfg(feature = "builtin-parser")]` and the other for `#[cfg(not(feature = "builtin-parser"))]`.

4. Implement `language` trait by using macro in [lib.rs](https://github.com/ast-grep/ast-grep/commit/ffe14ceb8773c5d2b85559ff7455070e2a1a9388#diff-1f2939360f8f95434ed23b53406eac0aa8b2f404171b63c6466bbdfda728c82d)

```rust
// lib.rs
impl_lang_expando!(Ruby, language_ruby, 'µ'); // [!code ++]
```

There are two macros, `impl_lang_expando` or `impl_lang`, to generate necessary methods required by ast-grep [`Language`](https://github.com/ast-grep/ast-grep/blob/e494500fc5d6994c20fe0102aa4b93d2108827bb/crates/core/src/language.rs#L12) trait.

You need to choose one of them to use for the new language. If the language does not allow `$` as valid identifier character and you need to customize the expando_char, use `impl_lang_expando`.

You can reference the comment [here](https://github.com/ast-grep/ast-grep/blob/e494500fc5d6994c20fe0102aa4b93d2108827bb/crates/language/src/lib.rs#L1-L8) for more information.

### Register the New Language
6. Add new lang in [`SupportLang`](https://github.com/ast-grep/ast-grep/blob/e494500fc5d6994c20fe0102aa4b93d2108827bb/crates/language/src/lib.rs#L119) enum.

```rust
// lib.rs
pub enum SupportLang {
  ...
  Ruby, // [!code ++]
  ...
}
```
7. Add new lang in [`execute_lang_method`](https://github.com/ast-grep/ast-grep/blob/e494500fc5d6994c20fe0102aa4b93d2108827bb/crates/language/src/lib.rs#L229C14-L229C33)
```rust
// lib.rs
macro_rules! execute_lang_method {
  ($me: path, $method: ident, $($pname:tt),*) => {
    use SupportLang as S;
    match $me {
      ...
      S::Ruby => Ruby.$method($($pname,)*), // [!code ++]
    }
  }
}
```
7. Add new lang in [`all_langs`](https://github.com/ast-grep/ast-grep/blob/be10ff97d6d5adad4b524961d82e40ca76ab4259/crates/language/src/lib.rs#L143), [`alias`](https://github.com/ast-grep/ast-grep/blob/be10ff97d6d5adad4b524961d82e40ca76ab4259/crates/language/src/lib.rs#L188), [`extension`](https://github.com/ast-grep/ast-grep/blob/be10ff97d6d5adad4b524961d82e40ca76ab4259/crates/language/src/lib.rs#L281) and [`file_types`](https://github.com/ast-grep/ast-grep/blob/be10ff97d6d5adad4b524961d82e40ca76ab4259/crates/language/src/lib.rs#L331)

See this [commit](https://github.com/ast-grep/ast-grep/commit/ffe14ceb8773c5d2b85559ff7455070e2a1a9388#diff-1f2939360f8f95434ed23b53406eac0aa8b2f404171b63c6466bbdfda728c82d) for the detailed code change.

:::tip Find existing languages as reference
The rule of thumb to add a new language is to find a reference language that is already included in the language crate.
Then add your new language by searching and following the existing language.
:::

## Add to ast-grep Playground
