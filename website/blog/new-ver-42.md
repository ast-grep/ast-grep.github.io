---
author:
  - name: Herrington Darkholme
search: false
date: 2026-03-15
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep 0.42 - The Answer to Code Searching
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/new-ver-42.html
  - - meta
    - property: og:description
      content: 'ast-grep 0.42: parameterized utilities, ESQuery-style selectors, and improved LSP diagnostics for injected languages.'
---

# ast-grep 0.42: The Answer to Code Searching

After a long journey through the galaxy of AST manipulation, ast-grep has arrived at **version 0.42** — the answer to the ultimate question of code searching, linting, and rewriting.

If [Douglas Adams](https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy) taught us anything, it's that the answer to life, the universe, and everything is **42**. We'd like to think ast-grep 0.42 lives up to its number: this release packs powerful new features that answer some of the most requested questions from our community.

Don't panic — let's dive in.

## Parameterized Utilities (Experimental)

::: danger EXPERIMENTAL FEATURE
Parameterized utilities are **experimental**. The current implementation is hacky, dirty, and quick — a prototype to gather real-world feedback. The API, behavior, and semantics **may change, break, or even be removed entirely** in future releases. That said, we encourage adventurous users to try it out! Please report bugs and share your feedback at [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep).
:::

The biggest feature in this release has landed: [parameterized utilities](https://github.com/ast-grep/ast-grep/issues/1298). [Global utility rules](/guide/rule-config/utility-rule.html#global-utility-rules) in ast-grep let you define reusable rule components shared across your project, but previously they were static — you couldn't customize them for different contexts. Now, global utilities can accept arguments, making them far more flexible and reducing duplication in your rule configurations.

### The Problem

Global utilities are reusable across files, but they couldn't be customized — you'd copy-paste the same structure over and over, changing only a name or a pattern.

Say you want to audit logging calls that pass a string literal as an argument. One rule bans `console.log` with string literals in production code, another flags `logger.error` with hardcoded messages. They have different severities and messages, so they must be separate rules — but without parameterization, each duplicates the entire rule structure:

```yaml{11,26}
# rules/audit-logging.yml
id: no-console-string
language: TypeScript
rule:
  pattern: $OBJ.$METHOD($$$ARGS)
  all:
    - has:
        kind: member_expression
        has:
          field: object
          regex: ^console$     # <--- console
    - has:
        field: arguments
        has:
          kind: string
-----
id: no-hardcoded-logger
language: TypeScript
rule:
  pattern: $OBJ.$METHOD($$$ARGS)
  all:
    - has:
        kind: member_expression
        has:
          field: object
          regex: ^logger$      # <--- logger
    - has:
        field: arguments
        has:
          kind: string
# the entire rule body is identical — only this one line differs!
```

On top of that, there was no way to export matched meta-variables from a global utility back to its caller. This caused inability to share captured meta-variables across files ([#1297](https://github.com/ast-grep/ast-grep/issues/1297)), parse errors when using global util variables in `fix` ([#1766](https://github.com/ast-grep/ast-grep/issues/1766)), and confusion about why global utils couldn't provide variables like local ones could ([#1994](https://github.com/ast-grep/ast-grep/issues/1994)).

Parameterized utilities solve both problems: they eliminate duplication and provide a well-defined interface for passing rules in and getting meta-variables back.

### The Solution

Think of parameterized utilities as **functions for your rules**. You declare parameters in the utility name, and then pass arguments when you call it with `matches`:

Define a parameterized [global utility](/guide/rule-config/utility-rule.html#global-utility-rules) in a file under your `utils/` directory:

```yaml{3,12}
# utils/audit-log-call.yml
id: audit-log-call
arguments: [logger-rule]          # declare parameters
language: TypeScript
rule:
  pattern: $OBJ.$METHOD($$$ARGS)
  all:
    - has:
        kind: member_expression
        has:
          field: object
          matches: logger-rule    # use the parameter as a rule
    - has:
        field: arguments
        has:
          kind: string
```

Then call it from any rule by passing arguments via `matches`. Each argument is itself a **rule**, not just a string — so you can pass patterns, regex, or any composite rule:

```yaml{7,14}
# rules/audit-logging.yml
id: no-console-string
language: TypeScript
rule:
  matches:
    audit-log-call:
      logger-rule: { regex: ^console$ } # pass rule as arg
-----
id: no-hardcoded-logger
language: TypeScript
rule:
  matches:
    audit-log-call:
      logger-rule: { regex: ^logger$ } # pass rule as arg
```

The entire deep rule structure is defined once in the utility. Each rule only specifies what differs — the logger object name.

Crucially, meta-variables captured inside argument rules are **exported back to the caller**. This solves the long-standing problem of global utilities not being able to provide meta-variables for `fix`.

Here's an example: the `named-import` utility matches an import statement and delegates source validation to an argument rule. The `ban-lodash` rule uses it to find lodash imports and rewrite them to `lodash-es`.

The highlighted lines show where arguments are declared and where they are used as `matches` targets inside the utility body:

```yaml{3,12,16}
# utils/named-import.yml — reusable utility for matching named imports
id: named-import
arguments: [source-rule, binding-rule]   # declare two param rule
language: TypeScript
rule:
  pattern: import { $BINDING } from "$SOURCE"
  all:
    - has:
        field: source
        has:
          kind: string_fragment
          matches: source-rule           # filter source with param
    - has:
        stopBy: end
        kind: identifier
        matches: binding-rule            # export $BINDING
```

The highlighted lines below show the caller passing concrete rules as arguments. Meta-variable `$IMPORT_NAME` defined here is exported back and usable in `fix`:

```yaml{7-8}
# rules/ban-lodash.yml — rewrites lodash imports to lodash-es
id: ban-lodash
language: TypeScript
rule:
  matches:
    named-import:
      source-rule: { regex: ^lodash$ }         # only match lodash import
      binding-rule: { pattern: $IMPORT_NAME }  # capture import in metavar
fix: import { $IMPORT_NAME } from "lodash-es"
```

When matching `import { map } from "lodash"`, the utility's pattern captures `$BINDING = map` and `$SOURCE = lodash` internally, in a separate environment. Note that `matches: binding-rule` is called on the AST node corresponding to `$BINDING` (the identifier `map`), so the caller's argument `pattern: $IMPORT_NAME` matches that same node and captures `$IMPORT_NAME = map` — effectively exporting `$BINDING` under a new name.

The utility's own meta-variables stay **isolated**. Only meta-variables from **argument rules** are exported to the caller:

| Meta-variable | Captured by | Visible in `ban-lodash`? |
|---|---|---|
| `$IMPORT_NAME` | argument rule (`binding-rule`) | **Yes** — available in `fix`, `constraints`, etc. |
| `$BINDING` | utility's internal pattern | **No** — isolated inside the utility |
| `$SOURCE` | utility's internal pattern | **No** — isolated inside the utility |

`$IMPORT_NAME` is available in `fix` because it was captured by a caller-supplied argument rule. Without parameterized utilities, there was no mechanism to get any meta-variables out of a global utility at all.

::: tip MetaVar Scoping Rule
The rule of thumb here is that a meta-variable like `$IMPORT_NAME` is only available if it appears **in the same YAML file** where you define it. Meta-variables defined in a different file (like `$BINDING`) are never visible to the caller.

If you can't see the `$` definition in your rule file, you can't use it.
:::

### Key Usage Rules

- **Only [global utility rules](/guide/rule-config/utility-rule.html#global-utility-rules)** (separate YAML files in the `utils/` directory with `id`, `language`, and `rule`) can declare parameters. Local `utils:` entries in rule config files remain zero-argument helpers.
- **All declared arguments must be provided** at the call site — no optional parameters.
- **Arguments are rules**, not strings. Each argument value is a full ast-grep rule object.
- **Meta-variable isolation**: argument rules match in their own isolated scope. They don't read or write the caller's meta-variables during matching — exports happen only after the entire parameterized rule matches successfully.


### Advanced: How It Works Under the Hood

<details>
<summary>Implementation details for the curious</summary>

Parameterized utilities are implemented with **runtime binding frames** rather than template expansion. The binding frames are stored in a thread-local variable and use `unsafe` code internally — the implementation is pragmatic rather than polished, which is part of why this feature is marked experimental. Performance may be suboptimal, especially with deeply nested parameterized calls. When a parameterized rule is called:

1. The `matches` reference pushes `name -> rule` bindings into a thread-local frame.
2. The stored rule body is matched directly against the target code.
3. When a bare `matches: PARAM` is encountered inside the body, it looks up the binding frame and matches the bound rule.

**Name resolution** for bare `matches: NAME` follows lexical scoping:

1. Current parameter binding (innermost scope)
2. Local utility
3. Global zero-argument rule

A parameter name shadows any same-named local or global utility.

**Meta-variable isolation** is a deliberate design choice. Argument rules match in a temporary, isolated `MetaVarEnv`. Any meta-variables they define are accumulated and exported back to the caller *only after the entire parameterized rule matches*. If exporting conflicts with the caller's existing bindings (e.g., the caller already bound `$A` to a different value), the whole parameterized call fails. Importantly, this failure does **not** trigger backtracking inside the parameterized rule — an `any` branch won't be retried just because a late export failed.

**Kind inference** is conservative. Internally, ast-grep computes a set of `potential_kinds` for each rule as a performance optimization — if a rule can only ever match `call_expression` nodes, ast-grep skips all other node kinds entirely. However, when kind inference reaches a `matches: PARAM` reference, it cannot know what kinds the caller will pass, so it returns `None` (meaning "any kind is possible"). This disables kind-based pruning for that rule. If you need precise pruning, add an explicit `kind` guard in the utility body or at the call site.

**Cycle detection** remains syntactic. ast-grep detects circular dependencies between utility rules at parse time — if rule A `matches` rule B and rule B `matches` rule A, ast-grep will report an error before any scanning happens, helping you catch buggy rules early. For parameterized utilities, parameter names are excluded from dependency edges during topological sorting. A utility cannot call itself through its argument rules, either directly or transitively.

</details>

## More ESQuery-Style Selectors

In ast-grep 0.39, we introduced ESQuery-style `kind` selectors with combinators like `>`, `+`, and `~`. In 0.42, we're expanding this with **new pseudo-selectors** that bring even more expressive power to your queries. See the [tracking issue](https://github.com/ast-grep/ast-grep/issues/2127) for the full ESQuery roadmap.

### `:has(selector)`

Select nodes that contain descendants matching a given selector. `:has` also supports the `>` combinator to match only direct children.

:::code-group

```yaml [:has - descendant]
kind: 'function_declaration:has(return_statement)'
# is equivalent to
kind: function_declaration
has:
  kind: return_statement
  stopBy: end
```

```yaml [:has(>) - direct child]
kind: 'call_expression:has(> identifier)'
# is equivalent to
kind: call_expression
has:
  kind: identifier
```

:::

### `:not(selector)`

Exclude nodes matching a selector. Perfect for filtering out unwanted matches.

:::code-group

```yaml [:not]
kind: 'expression_statement:not(call_expression)'
# is equivalent to
kind: expression_statement
not:
  kind: call_expression
```

:::

### `:is(selector, moreSelector, ...)`

Match nodes against any one of several selectors — a concise way to express "or" logic. Previously, the comma operator (e.g. `function_declaration, arrow_function`) could only be used at the top level of a selector. `:is` lifts that restriction: you can now express "or" anywhere inside a compound selector.

:::code-group

```yaml [:is]
# match top-level function declarations or expression statements
kind: 'program > :is(function_declaration, expression_statement)'
# is equivalent to
kind: program
has:
  any:
    - kind: function_declaration
    - kind: expression_statement
```

:::

### `:nth-child(An+B)` and `:nth-child(An+B of selector)`

Select nodes by their position among siblings, using the familiar `An+B` syntax. You can even combine it with an `of selector` clause to filter which siblings count. Both `An+B` and `An+B of selector` are supported.

These are equivalent to ast-grep's [`nthChild` rule](/reference/rule.html#nthchild):

:::code-group

```yaml [:nth-child]
# match odd-positioned numbers: [①, 2, ③, 4, ⑤]
kind: 'array > number:nth-child(2n+1)'
# is equivalent to
kind: number
nthChild: 2n+1
inside:
  kind: array
```

```yaml [:nth-child of selector]
# match the first number, skipping non-numbers: [a, ①, 2, 3]
kind: 'array > :nth-child(1 of number)'
# is equivalent to
nthChild:
  position: 1
  ofRule:
    kind: number
inside:
  kind: array
```

:::

These pseudo-selectors compose naturally with the existing combinators. Together, they bring ast-grep's ESQuery support much closer to a full selector system, making complex structural queries concise and readable.

## LSP: Diagnostics for Injected Languages

A subtle but important fix: the ast-grep Language Server now correctly [scans injected languages for diagnostics](https://github.com/ast-grep/ast-grep/issues/2522).

Injected languages are code embedded within other code — for example, Sassdoc comments inside SCSS files, or SQL within template strings. The ast-grep CLI has supported scanning these injected sections for a while, but the LSP wasn't reporting diagnostics for them. This created a frustrating inconsistency: rules that worked perfectly on the command line would show no results in your editor.

With this fix, your editor integration (VSCode, Zed, Neovim, etc.) now surfaces diagnostics for injected language rules, just like the CLI does. No more switching to the terminal to catch violations in embedded code.

## Next Steps

As the Hitchhiker's Guide reminds us, the hard part was never finding the answer — it was knowing the right question to ask. We hope ast-grep 0.42 helps you ask better questions about your code.

Thanks for reading! If you are interested in the new features, please try them out and let us know your feedback.

Happy Grepping, and don't forget your towel! 🚀
