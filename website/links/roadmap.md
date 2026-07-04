# TODO:

## Core
- [x] Add replace
- [x] Add find_all
- [x] Add metavar char customization
- [x] Add per-language customization
- [x] Add support for vec/sequence matcher
- [x] View node in context
- [x] implement iterative DFS mode
- [ ] Investigate perf heuristic (e.g. match fixed-string)
- [x] Group matching rules based on root pattern kind id
- [ ] Remove unwrap usage and implement error handling

## Metavariable Matcher
- [x] Regex
- [x] Pattern
- [x] Kind
- [ ] Use CoW to optimize MetaVarEnv

## Operators/Combinators
- [x] every / all
- [x] either / any
- [x] inside
- [x] has
- [x] follows
- [x] precedes

## CLI
- [x] match against files in directory recursively
- [x] interactive mode
- [x] as dry run mode (listing all rewrite)
- [x] inplace edit mode
- [x] no-color mode
- [x] JSON output
- [ ] execute remote rules

## Outline Docs
- [x] Remove "Read Code In Stages" from the outline guide.
- [x] Add a section about prompting AI agents to use ast-grep, including a skill for `ast-grep outline`.
- [x] Add a text output style demo and explain how the style represents imported/exported items and public/private members.
- [x] Add a TypeScript interface definition for JSON output.
- [ ] Start the outline extraction rule reference with the ast-grep outline data model.
- [ ] Explain that the outline data model is deliberately simple: a reduced common ground across programming languages.
- [ ] Link the Basic Usage data model explanation in the outline guide to the fuller data model explanation.

## Config
- [x] support YAML config rule
- [x] Add support for severity
- [x] Add support for error message
- [x] Add support for error labels
- [x] Add support for fix

## Binding
- [ ] NAPI binding
- [x] WASM binding
- [ ] Python binding

## Playground
- [x] build a playground based on WASM binding
- [x] build YAML config for WASM playground
- [x] URL sharing
- [x] add fix/rewrite

## LSP
- [x] Add LSP command
- [ ] implement LSP incremental
- [ ] add code action

## Builtin Ruleset
- [ ] Migrate some ESLint rule (or RSLint rule)
