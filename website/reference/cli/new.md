---
outline: [2, 3]
---

# `sg new`

## Usage

```shell
sg new [COMMAND] [OPTIONS] [NAME]
```

## Commands

### project

Create an new project by scaffolding.

By default, this command will create a root config file `sgconfig.yml`,
a rule folder `rules`, a test case folder `rule-tests` and a utility rule folder `utils`.
You can customize the folder names during the creation.


### rule

Create a new rule.

This command will create a new rule in one of the `rule_dirs`.
You need to provide `name` and `language` either by interactive input or via command line arguments.
ast-grep will ask you which `rule_dir` to use if multiple ones are configured in the `sgconfig.yml`.
If `-y, --yes` flag is true, ast-grep will choose the first `rule_dir` to create the new rule.

### test

Create a new test case.

This command will create a new test in one of the `test_dirs`.
You need to provide `name` either by interactive input or via command line arguments.
ast-grep will ask you which `test_dir` to use if multiple ones are configured in the `sgconfig.yml`.
If `-y, --yes` flag is true, ast-grep will choose the first `test_dir` to create the new test.

### util
Create a new global utility rule.

This command will create a new global utility rule in one of the `utils` folders.
You need to provide `name` and `language` either by interactive input or via command line arguments.
ast-grep will ask you which `util_dir` to use if multiple ones are configured in the `sgconfig.yml`.
If `-y, --yes` flag is true, ast-grep will choose the first `util_dir` to create the new item.

### help

Print this message or the help of the given subcommand(s)

## Arguments

`[NAME]`

The id of the item to create

## Options

### `-l, --lang <LANG>`

The language of the item to create.

This option is only available when creating rule and util.

### `-y, --yes`
Accept all default options without interactive input during creation.

You need to provide all required arguments via command line if this flag is true. Please see the command description for the what arguments are required.

### `-b, --base-dir <BASE_DIR>`
Create new project/items in the folder specified by this argument

[default: .]

### `-h, --help`
Print help (see a summary with '-h')