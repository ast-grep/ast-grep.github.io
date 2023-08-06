---
outline: [2, 3]
---

# `sgconfig.yml` Reference

## Overview

To scan a project with multiple rules, you need to specify the root of a project by maintaining a `sgconfig.yml` file.
The file is similar to `tsconfig.json` in TypeScript or `.eslintrc.js` in eslint.
You can also create the `sgconfig.yml` and related file scaffoldings by the `sg new` command.


`sgconfig.yml` has these three options.

## `ruleDirs`
* type: `String`
* required: Yes

A list of string instructing where to discover ast-grep's YAML rules.

Example:
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

* type: `List` of `String`
* required: Yes

The file extensions for this language.


### `expandoChar`

* type: `String`
* required: No

An optional char to replace $ in your pattern.