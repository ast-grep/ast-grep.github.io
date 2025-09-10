---
description: Learn how to install ast-grep and use it to quickly find and refactor code in your codebase. This powerful tool can help you save time and improve the quality of your code.
head:
  - - meta
    - name: keywords
      content: code refactoring, code search, code linting, guide, ast-grep quick start, structural search, pattern matching
---

# Quick Start

You can unleash `ast-grep`'s power at your fingertips in a few keystrokes on the command line!

Let's see it in action by rewriting code in a moderately large codebase: [TypeScript](https://github.com/microsoft/TypeScript/).

Our task is to rewrite old defensive code that checks nullable nested method calls to use the shiny new [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) `?.`.

## Installation
First, install `ast-grep`. It is distributed by [npm](https://www.npmjs.com/package/@ast-grep/cli), [cargo](https://crates.io/crates/ast-grep), [homebrew](https://formulae.brew.sh/formula/ast-grep) and [macports](https://ports.macports.org/port/ast-grep/). You can also build it [from source](https://github.com/ast-grep/ast-grep#installation).

::: code-group

```shell [homebrew]
# install via homebrew
brew install ast-grep
```

```shell [macports]
# install via MacPorts
sudo port install ast-grep
```

```shell [nix-shell]
# try ast-grep in nix-shell
nix-shell -p ast-grep
```

```shell [cargo]
# install via cargo
cargo install ast-grep --locked
```

```shell [npm]
# install via npm
npm i @ast-grep/cli -g
```

```shell [pip]
# install via pip
pip install ast-grep-cli
```
:::

The binary command, `ast-grep` or `sg`, should be available now. Let's try it with `--help`.

```shell
ast-grep --help
# if you are not on Linux
sg --help
```

:::danger Use `sg` on Linux
Linux has a default command `sg` for `setgroups`. You can use the full command name `ast-grep` instead of `sg`.
You can also use shorter alias if you want by `alias sg=ast-grep`.
We will use `ast-grep` in the guide below.
:::


Optionally, you can grab TypeScript source code if you want to follow the tutorial. Or you can apply the magic to your own code.

```shell
git clone git@github.com:microsoft/TypeScript.git --depth 1
```

## Pattern
Let's search for instances of calling a method on a nested property. `ast-grep` uses **patterns** to find similar code.
Think of patterns like those in our old friend `grep`, but instead of text, they match AST nodes.
We can write patterns like we write ordinary code, and it will match all code that has the same syntactical structure.

For example, the following pattern code

```javascript
obj.val && obj.val()
```

will match all the following code, regardless of white spaces or new lines.

```javascript
obj.val && obj.val() // verbatim match, of course
obj.val    &&     obj.val() // this matches, too

// this matches as well!
const result = obj.val &&
   obj.val()
```

Exact AST matching is already powerful, but we can go further with **metavariables** for more flexibility.
Use a **metavariable** to match any single AST node. Metavariables begin with `$` and are typically uppercase (e.g., `$PROP`).
Think of it like the regex dot `.`, except it matches syntax nodes, not text.

We can use the following pattern to find all property checking code.

```javascript
$PROP && $PROP()
```

This is a valid `ast-grep` pattern you can run from the command line. The `--pattern` argument specifies the target.
Optionally, use `--lang` to specify the target language.

:::code-group
```shell [Full Command]
ast-grep --pattern '$PROP && $PROP()' --lang ts TypeScript/src
```
```shell [Short Form]
ast-grep -p '$PROP && $PROP()' -l ts TypeScript/src
```
```shell [Without Lang]
# ast-grep will infer languages based on file extensions
ast-grep -p '$PROP && $PROP()' TypeScript/src
```
:::

:::tip Pro Tip
The pattern must be enclosed in single quotes `'` to prevent the shell from interpreting the `$` sign.
`ast-grep -p '$PROP && $PROP()'` is okay.

With double quotes, `ast-grep -p "$PROP && $PROP()"` would be interpreted as `ast-grep -p " && ()"` after shell expansion.
:::

## Rewrite

Cool? Now we can use this pattern to refactor the TypeScript source!

```shell
# pattern and language argument support short form
ast-grep -p '$PROP && $PROP()' \
   --rewrite '$PROP?.()' \
   --interactive \
   -l ts \
   TypeScript/src
```

`ast-grep` will start an interactive session to let you choose if you want to apply the patch.
Press `y` to accept the change!


That's it! You have refactored the TypeScript source in minutes. Congratulations!

We hope you enjoy the power of AST editing with plain programming-language patterns. Next, learn more about writing patterns.

:::tip Pattern does not work?
See our FAQ for more [guidance](/advanced/faq.html) on writing patterns.
:::

<!--

## More Complicate Example

Links to catalog pages...

-->
