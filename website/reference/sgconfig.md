# `sgconfig.yml` reference

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
* type: `Object` of `TestConfig`
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

A list of string instructing where to discover ast-grep's global utility rules.
