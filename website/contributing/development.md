# Development Guide

## Environment Setup


ast-grep is written in [Rust](https://www.rust-lang.org/) and hosted by [git](https://git-scm.com/).

You need to have rust environment installed to build ast-grep.
The recommended way to install rust is via [rustup](https://rustup.rs/).
Once you have rustup installed, you can install rust by running:

```bash
rustup install stable
```

You also need  [prek](https://github.com/j178/prek) to setup git hooks for type checking, formatting and clippy.

Run prek install to set up the git hook scripts.

```bash
prek install
```

Optionally, you can also install [nodejs](https://github.com/Schniz/fnm) and [yarn](https://yarnpkg.com/) for napi binding development.

That's it! You have setup the environment for ast-grep!

## Common Commands

The below are some cargo commands common to any Rust project.

```bash
cargo test     # Run test
cargo check    # Run checking
cargo clippy   # Run clippy
cargo fmt      # Run formatting
```


Below are some ast-grep specific commands.

## N-API Development

[@ast-grep/napi](https://www.npmjs.com/package/@ast-grep/napi) is the [nodejs binding](https://napi.rs/) for ast-grep.

The source code of napi binding is under the `crates/napi` folder. You can refer to the [package.json](https://github.com/ast-grep/ast-grep/blob/main/crates/napi/package.json) for available commands.

```bash
cd crates/napi
yarn   # Install dependencies
yarn build # Build the binding
yarn test # Run test
```

## Commit Conventions

ast-grep loosely follows the [commit conventions](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

To quote the conventional commits doc:

> The commit contains the following structural elements, to communicate intent to the consumers of your library:
>
> * `fix:` a commit of the type fix patches a bug in your codebase.
> * `feat:` a commit of the type feat introduces a new feature to the codebase.
> * types other than `fix:` and `feat:` are allowed, for example, `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, and `test:`.
> * `BREAKING CHANGE`: a commit that has a footer `BREAKING CHANGE:` introduces a breaking API change. A `BREAKING CHANGE` can be part of commits of any type.
> * footers other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to git trailer format.

:::tip
`BREAKING CHANGE` will be picked up and written in `CHANGELOG` by [`cargo xtask`](https://github.com/ast-grep/ast-grep/blob/86afc5865b42285106f232f01c0eb45708d134c3/xtask/src/main.rs#L162-L171).
:::


## Run Benchmark
ast-grep's Benchmark is not included in the default cargo test. You need to run the benchmark command in `benches` folder.

```bash
cd benches
cargo bench
```

ast-grep's benchmarking suite is not well developed yet. The result may fluctuate too much.

## Release New Version

The command below will bump version and create a git tag for ast-grep.
Once pushed to GitHub, the tag will trigger [GitHub actions](https://github.com/ast-grep/ast-grep/blob/main/.github/workflows/coverage.yml) to build and publish the new version to [crates.io](https://github.com/ast-grep/ast-grep/blob/main/.github/workflows/pypi.yml), [npm](https://github.com/ast-grep/ast-grep/blob/main/.github/workflows/napi.yml) and [PyPi](https://github.com/ast-grep/ast-grep/blob/main/.github/workflows/pypi.yml).

```bash
cargo xtask [version-number]
```

See [xtask](https://github.com/ast-grep/ast-grep/blob/main/xtask/src/main.rs) file for more details.