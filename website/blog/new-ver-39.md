---
author:
  - name: Herrington Darkholme
search: false
date: 2025-08-03
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep new release 0.39
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/new-ver-39.html
  - - meta
    - property: og:description
      content: 'ast-grep 0.39 includes new languages support, better file config and Esquery style kind.'
---

# ast-grep 0.39 is Here

ast-grep 0.39 is out! This release includes new languages support, better file config and esquery style.

## Esquery Style Kind

ast-grep now supports [ESQuery style](https://github.com/estools/esquery) kind in the `kind` field of the rule configuration. This allows you to write more concise rule in ast-grep. Under the hood, it is equivalent to [relational rules](/guide/rule-config/relational-rule.html) like `has`.

ESQuery is a library for querying the AST using a [CSS style selector](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) system.

For example, you can write a rule to match all `identifier` nodes that are direct children of `call_expression` nodes like this:

```yaml
kind: call_expression > identifier
```

This is equivalent to the following relational rule:

```yaml
kind: identifier
inside:
  kind: call_expression
```

Currently, ast-grep's ESQuery style `kind` only supports the following selectors:

* node kind: `identifier`
* `>`: direct child selectors
* ` `: descendant selector
* `+`: next sibling selector
* `~`: following sibling selector

The corresponding relational rules are:

:::code-group

```yaml [direct child]
kind: call_expression > identifier
# is equivalent to
kind: identifier
inside:
  kind: call_expression
```

```yaml [direct child]
kind: call_expression identifier
# is equivalent to
kind: identifier
inside:
  kind: call_expression
  stopBy: end  # note the stopBy
```

```yaml [next sibling]
kind: decorator + method_definition
# is equivalent to
kind: method_definition
follows:
  kind: decorator
```

```yaml [next sibling]
kind: decorator ~ method_definition
# is equivalent to
kind: method_definition
follows:
  kind: decorator
  stopBy: end  # note the stopBy
```

:::

If you want to use more ESQuery selectors, please file your use cases in [this ast-grep issue](https://github.com/ast-grep/ast-grep/issues/2127).



## New Languages Support

ast-grep 0.39 adds support for the following languages:

* [Nix](https://nix.dev/tutorials/nix-language.html) a domain-specific, purely functional, lazily evaluated, dynamically typed programming languages for Nixpkgs and NixOS.
* [Solidity](https://soliditylang.org/) A statically-typed curly-braces programming language designed for developing smart contracts that run on Ethereum. ($ETH bull run incoming? 🐂)

## `file`  in rule config is relative to the project config file

Previously, the files section appears to be treated as relative to the current working directory from which ast-grep was invoked rather than the dir containing the [sgconfig.yml](/reference/sgconfig.html) file.

This has been changed in 0.39, so now the `files` section is relative to the project config file.

## NAPI-RS version bump!

NAPI-RS recently released its [version 3](https://napi.rs/blog/announce-v3). ast-grep [followed the release](https://github.com/ast-grep/ast-grep/pull/2108) and the result is amazing. `ThreadSafeFunction`'s implementation complexity is greatly reduced.

Though this does not impact ast-grep-napi users' experience or code. This section is a tribute to NAPI-RS and its creator, [Brooklyn](https://github.com/Brooooooklyn).

## Next Steps

Thanks for reading! If you are interested in the new features, please try them out and let us know your feedback.