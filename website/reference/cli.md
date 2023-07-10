# Command Line Reference

You can always see up-to-date command line options using `sg --help`.
ast-grep has five subcommands as listed below.

## run
Run one time search or rewrite in command line. This is the default command when you run `sg` so `sg -p 'foo()'` is equivalent to `sg run -p 'foo()'`.

### Usage

```shell
sg run [OPTIONS] --pattern <PATTERN> [PATHS]...
```

### Arguments

`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
| -p| --pattern `<PATTERN>` |  AST pattern to match. |
| -r| --rewrite `<REWRITE>` |  String to replace the matched AST node. |
|   | --debug-query         |  Print query pattern's tree-sitter AST. Requires lang be set explicitly. |
| -l| --lang `<LANG>`       |  The language of the pattern query. ast-grep will infer the language based on file extension if this option is omitted. |
| -i| --interactive         |  Start interactive edit session. Code rewrite only happens inside a session. |
| -A|  --accept-all         |  Apply all rewrite without confirmation if true. |
|   |  --json               |  Output matches in structured JSON text useful for tools like `jq`. Conflicts with interactive|
|   |  --heading `<HEADING>` | Print file names before each file's matches. Default is auto: print heading for tty but not for piped output [default: auto] [possible values: always, never, auto] |
|   |  --color `<COLOR>`     | Controls output color [default: auto] |
|   |  --no-ignore `<NO_IGNORE>`  | Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.). You can suppress multiple ignore files by passing `no-ignore` multiple times [possible values: hidden, dot, exclude, global, parent, vcs] |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview.html#enable-stdin-mode) |
|-h | --help                | Print help |

## scan
Scan and rewrite code by configuration.

### Usage

```shell
sg scan [OPTIONS] [PATHS]...
```

### Arguments
`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c | --config `<CONFIG>`| Path to ast-grep root config, default is `sgconfig.yml` |
| -r | --rule `<RULE>`| Scan the codebase with one specified rule, without project config setup.|
| -i | --interactive|Start interactive edit session. Code rewrite only happens inside a session.|
| | --color `<COLOR>`|Controls output color [default: auto]|
| | --report-style `<REPORT_STYLE>` | [default: rich] [possible values: rich, medium, short]
| | --json |Output matches in structured JSON text. This is useful for tools like jq. Conflicts with color and report-style.|
| -A | --accept-all | Apply all rewrite without confirmation |
| | --no-ignore `<NO_IGNORE>` | Do not respect ignore files. You can suppress multiple ignore files by passing `no-ignore` multiple times [possible values: hidden, dot, exclude, global, parent, vcs] |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview.html#enable-stdin-mode) |
| -h| --help|Print help|

##   test
Test ast-grep rules. See [testing guide](/guide/test-rule.html) for more details.

### Usage

```shell
sg test [OPTIONS]
```

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c| --config `<CONFIG>`             |Path to the root ast-grep config YAML.|
| -t| --test-dir `<TEST_DIR>`         |the directories to search test YAML files.|
|   | --snapshot-dir `<SNAPSHOT_DIR>` |Specify the directory name storing snapshots. Default to `__snapshots__`.|
|   | --skip-snapshot-tests           |Only check if the test code is valid, without checking rule output. Turn it on when you want to ignore the output of rules|
| -u| --update-snapshots              |Update the content of all snapshots that have changed in test.|
| -i| --interactive                   |start an interactive review to update snapshots selectively.|
| -h| --help                          |Print help.|

##   lsp

Start a language server. This is useful for editor integration. See [editor integration](/guide/editor-integration.html) for more details.

### Usage

```shell
sg lsp
```

##   help
Print help message or the help of the given subcommand(s).
