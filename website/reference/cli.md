# Command Line Reference

You can always see up-to-date command line options using `ast-grep --help`.
ast-grep has several subcommands as listed below.

## Global Options

These options are available on every subcommand, before or after the subcommand
name. Put them before the `--` separator, if one is used.

### `-c, --config <CONFIG_FILE>`

Select the project configuration file. When omitted, ast-grep searches for
`sgconfig.yml` in the current directory and its parents. This also applies to
`run`, including the implicit `ast-grep -p` form.

See [project discovery](/guide/project/project-config#project-discovery).

### `--custom-languages <CUSTOM_LANGUAGES>`

Control loading of native parsers registered under `customLanguages`.
Since 0.50.0, the default is to skip them unless the configuration is already
trusted.

| Value | Behavior |
|-------|----------|
| `allow` | Load for this invocation without saving trust. |
| `ignore` | Skip loading, even for a trusted configuration. Preserve saved trust. |
| `trust` | Confirm interactively, save trust for the configuration path, and load. |
| `revoke` | Remove saved trust and skip loading. |

Skipping custom languages also skips their configured `outlineRules`. Custom
parsers execute native code; saved trust follows the canonical configuration
path, not its contents.

See the [custom language loading guide](/advanced/custom-language#enable-custom-language-loading)
for setup, CI usage, and trust management.

## `ast-grep run`
Run one time search or rewrite in command line. This is the default command when you run the CLI, so `ast-grep -p 'foo()'` is equivalent to `ast-grep run -p 'foo()'`. [View detailed reference.](/reference/cli/run)

### Usage

```shell
ast-grep run [OPTIONS] <--pattern <PATTERN>|--kind <KIND>> [PATHS]...
```

### Arguments

`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
| -p| --pattern `<PATTERN>` |  AST pattern to match. |
|   | --selector `<KIND>`   |  AST kind to extract sub-part of pattern to match. |
| -k| --kind `<KIND>`       |  AST kind to match. Accepts ESQuery-style selectors. See [ESQuery Style Kind](/reference/rule/esquery). |
| -r| --rewrite `<REWRITE>` |  String to replace the matched AST node. |
| -l| --lang `<LANG>`       |  The language of the pattern query. ast-grep will infer the language based on file extension if this option is omitted. |
| -c| --config `<CONFIG_FILE>` | Path to the project configuration file. Defaults to `sgconfig.yml` discovery. |
|   | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
|   | --debug-query`[=<format>]` |  Print query pattern's tree-sitter AST. Requires lang be set explicitly. |
|   | --strictness `<STRICTNESS>`   |  The strictness of the pattern [possible values: cst, smart, ast, relaxed, signature, template] |
|   | --follow   |  Follow symbolic links |
|   |  --no-ignore `<NO_IGNORE>`  | Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.). Inherits [`noIgnore`](/reference/sgconfig#noignore) from project configuration. |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview#enable-stdin-mode) |
|   | --globs `<GLOBS>`   | Include or exclude file paths
| -j| --threads `<NUM>`     | Set the approximate number of threads to use [default: heuristic]
| -i| --interactive         |  Start interactive edit session. Code rewrite only happens inside a session. |
| -U|  --update-all         |  Apply all rewrite without confirmation if true. |
|   | --json`[=<STYLE>]`    | Output matches in structured JSON  [possible values: pretty, stream, compact] |
|   |  --color `<WHEN>`     | Controls output color [default: auto] |
|   |  --inspect `<GRANULARITY>`  | Inspect information for file/rule discovery and scanning [default: nothing] [possible values: nothing, summary, entity]|
|   | --heading `<WHEN>`    | Controls whether to print the file name as heading [default: auto] [possible values: auto, always, never] |
| -A| --after `<NUM>`      | Show NUM lines after each match [default: 0] |
| -B| --before `<NUM>`     | Show NUM lines before each match [default: 0] |
| -C| --context `<NUM>`    | Show NUM lines around each match [default: 0] |
|-h | --help                | Print help |

## `ast-grep outline`
Explore code structure for symbols, imports, exports, and members. [View detailed reference.](/reference/cli/outline)

### Usage

```shell
ast-grep outline [OPTIONS] [PATHS]...
```

### Arguments

`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
|   | --items `<ITEMS>` | Select top-level items [possible values: auto, structure, exports, imports, all] |
|   | --view `<VIEW>` | Control text presentation [possible values: auto, names, signatures, digest, expanded] |
|   | --match `<REGEX>` | Filter top-level items by regular expression. |
|   | --type `<TYPE[,TYPE...]>` | Filter top-level items by symbol type. |
|   | --pub-members | Display only public members in member views. |
| -l| --lang `<LANG>` | Specify the input language. For path input, ast-grep parses only files of this language. Required with `--stdin`. |
| -c| --config `<CONFIG_FILE>` | Path to ast-grep root config, default is `sgconfig.yml` |
|   | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
|   | --stdin | Read source from StdIn. |
|   | --outline-rules `<FILE>` | Load additional outline extractor definitions. These are added after custom language `outlineRules` from config. |
|   | --no-default-outline-rules | Disable bundled extractor definitions. |
|   | --globs `<GLOBS>` | Include or exclude file paths. |
|   | --follow | Follow symbolic links. |
|   | --no-ignore `<NO_IGNORE>` | Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.). Inherits [`noIgnore`](/reference/sgconfig#noignore) from project configuration. |
| -j| --threads `<NUM>` | Set the approximate number of threads to use [default: 0] |
|   | --json`[=<STYLE>]` | Output outline entries in structured JSON [possible values: pretty, stream, compact] |
|   | --color `<WHEN>` | Controls output color [default: auto] |
|-h | --help | Print help |

## `ast-grep scan`
Scan and rewrite code by configuration. [View detailed reference.](/reference/cli/scan)

### Usage

```shell
ast-grep scan [OPTIONS] [PATHS]...
```

### Arguments
`[PATHS]...`  The paths to search. You can provide multiple paths separated by spaces [default: .]

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c | --config `<CONFIG_FILE>`| Path to ast-grep root config, default is `sgconfig.yml` |
|    | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
| -r | --rule `<RULE_FILE>`| Scan the codebase with the single rule located at the path `RULE_FILE`.|
|    | --inline-rules `<RULE_TEXT>` | Scan the codebase with a rule defined by the provided `RULE_TEXT` |
|    | --filter `<REGEX>` |Scan the codebase with rules with ids matching `REGEX` |
|    | --include-metadata | Include rule metadata in the json output |
| -j | --threads `<NUM>`   | Set the approximate number of threads to use [default: heuristic]
| -i | --interactive|Start interactive edit session.|
| | --color `<WHEN>`|Controls output color [default: auto] [possible values: auto, always, ansi, never]|
| | --report-style `<REPORT_STYLE>` | [default: rich] [possible values: rich, medium, short]
|   | --follow   |  Follow symbolic links |
| | --json`[=<STYLE>]` | Output matches in structured JSON  [possible values: pretty, stream, compact] |
| | --format `<FORMAT>` |  Output warning/error messages in different formats [possible values: github, sarif] |
| -U | --update-all | Apply all rewrite without confirmation |
|   | --no-ignore `<NO_IGNORE>` | Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.). Inherits [`noIgnore`](/reference/sgconfig#noignore) from project configuration. |
|   |  --stdin           | Enable search code from StdIn. See [link](/guide/tooling-overview#enable-stdin-mode) |
|   | --globs `<GLOBS>`   | Include or exclude file paths
|   |  --inspect `<GRANULARITY>`  | Inspect information for file/rule discovery and scanning [default: nothing] [possible values: nothing, summary, entity]|
|   | --error`[=<RULE_ID>...]`| Set rule severity to error
|   | --warning`[=<RULE_ID>...]`| Set rule severity to warning
|   | --info`[=<RULE_ID>...]`| Set rule severity to info
|   | --hint`[=<RULE_ID>...]`| Set rule severity to hint
|   | --off`[=<RULE_ID>...]`| Turn off the rule
|   | --after `<NUM>`      | Show NUM lines after each match [default: 0] |
|   | --before `<NUM>`     | Show NUM lines before each match [default: 0] |
|   | --context `<NUM>`    | Show NUM lines around each match [default: 0] |
| -A| --after `<NUM>`      | Show NUM lines after each match [default: 0] |
| -B| --before `<NUM>`     | Show NUM lines before each match [default: 0] |
| -C| --context `<NUM>`    | Show NUM lines around each match [default: 0] |
| -h| --help|Print help|

## `ast-grep test`
Test ast-grep rules. See [testing guide](/guide/test-rule) for more details. [View detailed reference.](/reference/cli/test)

### Usage

```shell
ast-grep test [OPTIONS]
```

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c| --config `<CONFIG>`             |Path to the root ast-grep config YAML.|
|   | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
| -t| --test-dir `<TEST_DIR>`         |the directories to search test YAML files.|
|   | --snapshot-dir `<SNAPSHOT_DIR>` |Specify the directory name storing snapshots. Default to `__snapshots__`.|
|   | --skip-snapshot-tests           |Only check if the test code is valid, without checking rule output. Turn it on when you want to ignore the output of rules|
| -U| --update-all                   |Update the content of all snapshots that have changed in test.|
| -f| --filter                        |Filter rule test cases to execute using a glob pattern.|
|   | --include-off                   | Include `severity:off` rules in test
| -i| --interactive                   |start an interactive review to update snapshots selectively.|
|   | --color `<WHEN>`                |Controls output color [default: auto] [possible values: auto, always, ansi, never]|
| -h| --help                          |Print help.|

## `ast-grep new`

Create new ast-grep project or items like rules/tests. [View detailed reference.](/reference/cli/new)


### Usage

```shell
ast-grep new [COMMAND] [OPTIONS] [NAME]
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
| -c| --config `<CONFIG_FILE>` | Path to the project configuration file. Defaults to `sgconfig.yml` discovery. |
|   | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
| -h| `--help`                | Print help (see more with '--help') |

## `ast-grep lsp`

Start a language server to [report diagnostics](/guide/scan-project) in your project. This is useful for editor integration. See [editor integration](/guide/tools/editors) for more details.

### Usage

```shell
ast-grep lsp
```

### Options

| Short | Long | Description |
|-------|------|-------------|
| -c | --config `<CONFIG_FILE>`| Path to ast-grep root config, default is `sgconfig.yml` |
|    | --custom-languages `<CUSTOM_LANGUAGES>` | [Native custom language loading policy](#global-options): allow, ignore, trust, revoke. |
| -h| `--help`                | Print help (see more with '--help') |

## `ast-grep completions`

Generate shell completion script.

### Usage

```shell
ast-grep completions [SHELL]
```

### Arguments

`[SHELL]`

Output the completion file for given shell.
If not provided, shell flavor will be inferred from environment.

[possible values: bash, elvish, fish, powershell, zsh]

## `ast-grep help`
Print help message or the help of the given subcommand(s).
