---
outline: [2, 3]
---

# `sg test`

Test ast-grep rule.

## Usage

```shell
sg test [OPTIONS]
```

## Options

### `-c, --config <CONFIG>`

Path to the root ast-grep config YAML

### `-t, --test-dir <TEST_DIR>`

the directories to search test YAML files

### `--snapshot-dir <SNAPSHOT_DIR>`

Specify the directory name storing snapshots. Default to __snapshots__

### `--skip-snapshot-tests`

Only check if the test code is valid, without checking rule output. Turn it on when you want to ignore the output of rules. Conflicts with --update-all

### `-U, --update-all`

Update the content of all snapshots that have changed in test. Conflicts with --skip-snapshot-tests

### `-i, --interactive`

Start an interactive review to update snapshots selectively

### `-f, --filter <FILTER>`

Filter rule test cases to execute using a glob pattern

### `-h, --help`

Print help