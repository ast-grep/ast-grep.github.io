---
outline: [2, 3]
---

# `sgconfig.yml` Reference

## Overview

To scan a project with multiple rules, you need to specify the root of a project by maintaining a `sgconfig.yml` file.
The file is similar to `tsconfig.json` in TypeScript or `.eslintrc.js` in eslint.
You can also create the `sgconfig.yml` and related file scaffoldings by the `sg new` command.

::: tip sgconfig.yml is not `rule.yml`
ast-grep has several kinds of yaml files. `sgconfig.yml` is for configuring ast-grep, like how to find rule directories or to register custom languages.
While `rule.yml` is to specify one single rule logic to find problematic code.
:::

`sgconfig.yml` has these options.

## `ruleDirs`
* type: `String`
* required: Yes

A list of string instructing where to discover ast-grep's YAML rules.

**Example:**

```yaml
ruleDirs:
- rules
- anotherRuleDir
```

Note, all items under `ruleDirs` are resolved relative to the location of `sgconfig.yml`.

## `testConfigs`
* type: `List` of `TestConfig`
* required: No

A list of object to configure ast-grep's test cases.
Each object can have two fields.

### `testDir`
* type: `String`
* required: Yes

A string specifies where to discover test cases for ast-grep.

### `snapshotDir`
* type: `String`
* required: No

A string path relative to `testDir` that specifies where to store test snapshots for ast-grep.
You can think it like `__snapshots___` in popular test framework like jest.
If this option is not specified, ast-grep will store the snapshot under the `__snapshots__` folder undert the `testDir`.

Example:

```yaml
testConfigs:
- testDir: test
  snapshotDir: __snapshots__
- testDir: anotherTestDir
```

## `utilDirs`
* type: `String`
* required: No

A list of string instructing where to discover ast-grep's [global utility rules](/guide/rule-config/utility-rule.html#global-utility-rules).

## `languageGlobs`
* type: `HashMap<String, Array<String>>`
* required: No

A mapping to associate a language to files that have non-standard extensions or syntaxes.

ast-grep uses file extensions to discover and parse files in certain languages. You can use this option to support files if their extensions are not in the default mapping.

The key of this option is the language name. The values are a list of [glob patterns](https://www.wikiwand.com/en/Glob_(programming)) that match the files you want to process.

**Example:**

The following configuration tells ast-grep to treat the files with `.vue`, `.svelte`, and `.astro` extensions as HTML files, and the extension-less file `.eslintrc` as JSON files.

```yml
languageGlobs:
  html: ['*.vue', '*.svelte', '*.astro']
  json: ['.eslintrc']
```

## `customLanguages` <Badge type="warning" text="Experimental" />

* type: `HashMap<String, CustomLang>`
* required: No
* status: **Experimental**

A dictionary of custom languages in the project. This is an experimental feature.

The key of the dictionary is the custom language name. The value of the dictionary is the custom language configuration object.

Please see the [guide](/advanced/custom-language.html) for detailed instructions.

A custom language configuration object has the following options.

### `libraryPath`
* type: `String`
* required: Yes

The path to the tree-sitter dynamic library of the language.

### `extensions`

* type: `Array<String>`
* required: Yes

The file extensions for this language.


### `expandoChar`

* type: `String`
* required: No

An optional char to replace $ in your pattern.

### `languageSymbol`

* type: `String`
* required: No

The dylib symbol to load ts-language, default is `tree_sitter_{name}`, e.g. `tree_sitter_mojo`.


**Example:**

```yaml
customLanguages:
  mojo:
      libraryPath: mojo.so     # path to dynamic library
      extensions: [mojo, 🔥]   # file extensions for this language
      expandoChar: _           # optional char to replace $ in your pattern
```

## `languageInjections` <Badge type="warning" text="Experimental" />
* type: `List<LanguageInjection>`
* required: No
* status: **Experimental**

A list of language injections to support embedded languages in the project like JS/CSS in HTML.
This is an experimental feature.

Please see the [guide](/advanced/language-injection.html) for detailed instructions.

A language injection object has the following options.

### `hostLanguage`
* type: `String`
* required: Yes

The host language name, e.g. `html`. This is the language of documents that contains the embedded language code.

### `rule`
* type: `Rule` object
* required: Yes

Defines the ast-grep rule to identify the injected language region within the host language documents.

### `injected`
* type: `String` or `List<String>`
* required: Yes

The injected language name, e.g. `js`. This is the language of the embedded code.

It can be a static string or a list of strings. If it is a list, ast-grep will use the `$LANG` meta variable captured in the rule to dynamically determine the injected language. The list of strings is the candidate language names to match the `$LANG` meta variable.

**Example:**

This is a configuration to support styled-components in JS files with static `injected` language.

```yaml
languageInjections:
- hostLanguage: js
  rule:
    pattern: styled.$TAG`$CONTENT`
  injected: css
```

This is a configuration to support CSS in JS style in JS files with dynamic `injected` language.

```yaml
languageInjections:
- hostLanguage: js
  rule:
    pattern: styled.$LANG`$CONTENT`
  injected: [css, scss, less]
```