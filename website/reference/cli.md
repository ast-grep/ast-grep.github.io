# Command Line Reference

You can always see up-to-date command line options using `sg --help`.
ast-grep has several subcommands as listed below.

## `sg run`
Run one time search or rewrite in command line. This is the default command when you run `sg` so `sg -p 'foo()'` is equivalent to `sg run -p 'foo()'`. [View detailed reference.](/reference/cli/run.html)

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
|   | --selector `<KIND>`   |  AST kind to extract sub-part of pattern to match. |
| -r| --rewrite `<REWRITE>` |  String to replace the matched AST node. |
| -l| --lang `<LANG>`       |  The language of the pattern query. ast-grep will infer the language based on file extension if this option is omitted. |
|   | --debug-query`[=<format>]` |  Print query pattern's tree-sitter AST. Requires lang be set explicitly. |
|   | --strictness `<STRICTNESS>`   |  The strictness of the pattern [possible values: cst, smart, ast, relaxed, signature] |
|   | --follow   |  Follow symbolic links |
|   |  --no-ignore `<NO_IGNORE>`  | Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.) [possible values: hidden, dot, exclude, global, parent, vcs] |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview.html#enable-stdin-mode) |
|   | --globs `<GLOBS>`   | Include or exclude file paths
| -j| --threads <NUM>     | Set the approximate number of threads to use [default: heuristic]
| -i| --interactive         |  Start interactive edit session. Code rewrite only happens inside a session. |
| -U|  --update-all         |  Apply all rewrite without confirmation if true. |
|   | --json`[=<style>]`    | Output matches in structured JSON  [possible values: pretty, stream, compact] |
|   |  --color `<WHEN>`     | Controls output color [default: auto] |
|   |  --tracing `<LEVEL>`  | Show tracing information for file/rule discovery and scanning [default: nothing] [possible values: nothing, summary]
|   | --heading `<WHEN>`    | Controls whether to print the file name as heading [default: auto] [possible values: auto, always, never] |
| -A| --after `<NUM>`      | Show NUM lines after each match [default: 0] |
| -B| --before `<NUM>`     | Show NUM lines before each match [default: 0] |
| -C| --context `<NUM>`    | Show NUM lines around each match [default: 0] |
|-h | --help                | Print help |

## `sg scan`
Scan and rewrite code by configuration. [View detailed reference.](/reference/cli/scan.html)

### Usage

```shell
sg scan [OPTIONS] [PATHS]...
```

### Arguments
`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c | --config `<CONFIG_FILE>`| Path to ast-grep root config, default is `sgconfig.yml` |
| -r | --rule `<RULE_FILE>`| Scan the codebase with the single rule located at the path `RULE_FILE`.|
|    | --inline-rules `<RULE_TEXT>` | Scan the codebase with a rule defined by the provided `RULE_TEXT` |
|    | --filter `<REGEX>` |Scan the codebase with rules with ids matching `REGEX` |
| -j| --threads <NUM>     | Set the approximate number of threads to use [default: heuristic]
| -i | --interactive|Start interactive edit session.|
| | --color `<WHEN>`|Controls output color [default: auto] [possible values: auto, always, ansi, never]|
| | --report-style `<REPORT_STYLE>` | [default: rich] [possible values: rich, medium, short]
|   | --follow   |  Follow symbolic links |
| | --json`[=<style>]` | Output matches in structured JSON  [possible values: pretty, stream, compact] |
| | --format `<FORMAT>` | Output warning/error messages in GitHub Action format [possible values: github] |
| -U | --update-all | Apply all rewrite without confirmation |
| | --no-ignore `<NO_IGNORE>` | Do not respect ignore files. (.gitignore, .ignore, etc.) [possible values: hidden, dot, exclude, global, parent, vcs] |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview.html#enable-stdin-mode) |
|   | --globs `<GLOBS>`   | Include or exclude file paths
|   |  --tracing `<LEVEL>`  | Show tracing information for file/rule discovery and scanning [default: nothing] [possible values: nothing, summary]
| -h| --help|Print help|

## `sg test`
Test ast-grep rules. See [testing guide](/guide/test-rule.html) for more details. [View detailed reference.](/reference/cli/test.html)

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
| -U| --update-all                   |Update the content of all snapshots that have changed in test.|
| -f| --filter                        |Filter rule test cases to execute using a glob pattern.|
| -i| --interactive                   |start an interactive review to update snapshots selectively.|
| -h| --help                          |Print help.|

## `sg new`

Create new ast-grep project or items like rules/tests. [View detailed reference.](/reference/cli/new.html)


### Usage

```shell
sg new [COMMAND] [OPTIONS] [NAME]
```

### Commands
|Sub Command| Description|
|--|--|
| project | Create an new project by scaffolding. |
| rule    | Create a new rule. |
| test    | Create a new test case. |
| util    | Create a new global utility rule. |
| help    | Print this message or the help of the given subcommand(s). |

### Arguments

`[NAME]`  The id of the item to create.

### Options

| Short | Long | Description |
|-------|------|-------------|
| -l| `--lang <LANG>`         | The language of the item to create. |
| -y| `--yes`                 | Accept all default options without interactive input during creation. |
| -b| `--base-dir <BASE_DIR>` | Create new project/items in the folder specified by this argument `[default: .]` |
| -h| `--help`                | Print help (see more with '--help') |

## `sg lsp`

Start a language server to [report diagnostics](/guide/scan-project.html) in your project. This is useful for editor integration. See [editor integration](/guide/tools/editors.html) for more details.

### Usage

```shell
sg lsp
```

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c | --config `<CONFIG_FILE>`| Path to ast-grep root config, default is `sgconfig.yml` |
| -h| `--help`                | Print help (see more with '--help') |

## `sg completions`

Generate shell completion script.

### Usage

```shell
sg completions [SHELL]
```

### Arguments

`[SHELL]`

Output the completion file for given shell.
If not provided, shell flavor will be inferred from environment.

[possible values: bash, elvish, fish, powershell, zsh]

## `sg help`
Print help message or the help of the given subcommand(s).