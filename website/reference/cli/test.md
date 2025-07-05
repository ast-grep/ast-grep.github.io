---
outline: [2, 3]
---

# `ast-grep test`

Test ast-grep rules.

## Usage

```shell
ast-grep test [OPTIONS]
```

## Options

### `-c, --config <CONFIG>`

Path to ast-grep root config, default is sgconfig.yml

### `-t, --test-dir <TEST_DIR>`

the directories to search test YAML files

### `--snapshot-dir <SNAPSHOT_DIR>`

Specify the directory name storing snapshots. Default to **snapshots**

### `--skip-snapshot-tests`

Only check if the test code is valid, without checking rule output. Turn it on when you want to ignore the output of rules. Conflicts with --update-all

### `-U, --update-all`

Update the content of all snapshots that have changed in test. Conflicts with --skip-snapshot-tests

### `-i, --interactive`

Start an interactive review to update snapshots selectively

### `-f, --filter <FILTER>`

Filter rule test cases to execute using a glob pattern

### `--include-off`

Include `severity:off` rules in test

ast-grep will not run rules with `severity: off` by default. This option will include those rules in the test.

### `-h, --help`

Print help
