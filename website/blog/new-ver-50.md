---
author:
  - name: Herrington Darkholme
search: false
date: 2026-10-09
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: 'ast-grep 0.50.0: Safer Custom Languages, Built-in Zig Support, and Better Outlines'
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/new-ver-50
  - - meta
    - property: og:description
      content: 'ast-grep 0.50.0 adds built-in Zig support, expands Java and C/C++ outlines, and makes native custom-language loading opt-in.'
---

# ast-grep 0.50.0: Safer Custom Languages, Built-in Zig Support, and Better Outlines

We are excited to announce [ast-grep 0.50.0](https://github.com/ast-grep/ast-grep/releases/tag/0.50.0)!

This release introduces built-in Zig support, significantly expands Java and C/C++ outlines, and changes how native custom-language libraries are loaded. The custom-language change is important—and breaking—so let's start there.

## Breaking Change: Custom-Language Loading Now Requires Opt-In

Native custom-language libraries are now ignored by default; use `allow` for one run or `trust` to remember a project you have reviewed.

### Why Was Automatic Loading Dangerous?

Before 0.50.0, ast-grep automatically loaded native libraries listed in `sgconfig.yml`. For example, an untrusted repository could contain this configuration and a malicious native library:

```yaml
customLanguages:
  my-language:
    libraryPath: ./malicious.so # can run anything!
    extensions: [myext]
```

A custom parser is a native dynamic library—such as a `.so`, `.dll`, or `.dylib` file—loaded directly into the ast-grep process, so it can execute arbitrary code with the same permissions.

Simply cloning that repository and running `ast-grep scan` could therefore allow the library to read credentials, modify files, or run other commands. Explicit opt-in prevents a routine scan from silently crossing that trust boundary.

### Allow a Custom Language Once

Use `allow` when you want to load the configured libraries for a single invocation:

```bash
ast-grep scan --custom-languages allow
```

This is also the recommended option for trusted CI and other non-interactive environments:

```bash
ast-grep scan --custom-languages allow
```

Only enable it for repositories and native libraries you trust.

### Trust a Project

`trust` is interactive and requires a human to review and approve the project. After reviewing its configuration and native libraries, run:

```bash
ast-grep scan --custom-languages trust
```

ast-grep will ask for confirmation, load the custom languages, and remember the project for future commands.

::: warning Trust Is Path-Based
Trust is associated with the canonical path of the project configuration—not its contents. If the configuration or referenced library changes later, the project remains trusted.
:::

Please review those changes as carefully as you would any executable dependency.

### Ignore or Revoke Trust

You can temporarily skip custom languages, including in a trusted project:

```bash
ast-grep scan --custom-languages ignore
```

To remove previously granted trust:

```bash
ast-grep scan --custom-languages revoke
```

This policy change only affects custom-language loading in the ast-grep CLI. JavaScript and Python API usage is not affected because dynamic languages already require explicit registration in application code, such as [`registerDynamicLanguage`](/guide/api-usage/js-api#use-other-language) in the JavaScript API. Built-in languages also continue to work without additional configuration.

You can find the implementation details in [#2960](https://github.com/ast-grep/ast-grep/pull/2960), [#2971](https://github.com/ast-grep/ast-grep/pull/2971), and [#2972](https://github.com/ast-grep/ast-grep/pull/2972).

## Built-in Zig Support

Zig is now a built-in ast-grep language. You no longer need to compile and register a custom Tree-sitter library to search Zig projects.

For example:

```bash
ast-grep run \
  --lang zig \
  --pattern 'const $A = @import($B);' \
  .
```

Zig support includes:

- The `zig` language name
- Automatic detection of `.zig` files
- Structural pattern matching and rewriting
- Metavariable support
- A generated Zig rule schema for YAML rules

Patterns work with Zig constructs such as imports, functions, calls, struct literals, error handling, `switch`, `catch`, and `try`.

```bash
ast-grep run \
  --lang zig \
  --pattern 'pub fn $NAME($$$ARGS) $RET { $$$BODY }' \
  .
```

See [#2942](https://github.com/ast-grep/ast-grep/pull/2942) for the full implementation and compatibility notes.

## Richer Java Outlines

The `ast-grep outline` command can now describe more of a modern Java codebase.

Version 0.50.0 adds outline support for:

- Records and compact constructors
- Java modules
- Wildcard imports
- Enum constants
- Annotation types
- Annotation elements
- Private and protected fields

For example, annotation declarations such as this now appear in an outline with their elements:

```java
public @interface Route {
    String path();
    String method() default "GET";
}
```

Records are also represented with their methods, fields, regular constructors, and compact constructors.

These improvements make outlines more useful for quickly understanding unfamiliar Java projects and for tools that consume ast-grep's structural summaries.

Relevant changes include [#2945](https://github.com/ast-grep/ast-grep/pull/2945), [#2948](https://github.com/ast-grep/ast-grep/pull/2948), [#2950](https://github.com/ast-grep/ast-grep/pull/2950), [#2954](https://github.com/ast-grep/ast-grep/pull/2954), [#2955](https://github.com/ast-grep/ast-grep/pull/2955), and [#2956](https://github.com/ast-grep/ast-grep/pull/2956).

## Better C and C++ Outlines

C and C++ declarations can contain deeply nested declarators, which previously made it difficult for the outline extractor to identify the correct symbol name.

Version 0.50.0 improves identifier extraction for declarations and fields, producing more accurate names for complex C and C++ code. See [#2946](https://github.com/ast-grep/ast-grep/pull/2946).

## Upgrading

Install or upgrade ast-grep with your preferred package manager:

```bash
npm install --global @ast-grep/cli@0.50.0
```

```bash
pip install --upgrade ast-grep-cli==0.50.0
```

```bash
cargo install ast-grep --version 0.50.0 --locked
```

If your project uses `customLanguages`, update local workflows and CI commands to pass the appropriate `--custom-languages` policy.

Thank you to everyone who contributed code, reported issues, reviewed changes, and helped test this release. For the complete list of changes, see the [ast-grep 0.50.0 release notes](https://github.com/ast-grep/ast-grep/releases/tag/0.50.0).

Happy grepping!
