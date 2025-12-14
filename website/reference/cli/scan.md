---
outline: [2, 3]
---
# `ast-grep scan`

Scan and rewrite code by configuration.

## Usage

```shell
ast-grep scan [OPTIONS] [PATHS]...
```

## Arguments

`[PATHS]...`

The paths to search. You can provide multiple paths separated by spaces

[default: .]

## Scan Specific Options

### `-c, --config <CONFIG_FILE>`
Path to ast-grep root config, default is sgconfig.yml

### `-r, --rule <RULE_FILE>`
Scan the codebase with the single rule located at the path RULE_FILE.

This flags conflicts with --config. It is useful to run single rule without project setup.


### `--inline-rules <RULE_TEXT>`
Scan the codebase with a rule defined by the provided RULE_TEXT.

Use this argument if you want to test a rule without creating a YAML file on disk. You can run multiple rules by separating them with `---` in the RULE_TEXT. --inline-rules is incompatible with --rule.

### `--filter <REGEX>`
Scan the codebase with rules with ids matching REGEX.

This flags conflicts with --rule. It is useful to scan with a subset of rules from a large set of rule definitions within a project.

### `--include-metadata`

Include rule [metadata](/reference/yaml.html#metadata) in the json output.

This flags requires --json mode. Default is false.

## Input Options

### `--no-ignore <FILE_TYPE>`
Do not respect hidden file system or ignore files (.gitignore, .ignore, etc.).

You can suppress multiple ignore files by passing `no-ignore` multiple times.

Possible values:
- hidden:  Search hidden files and directories. By default, hidden files and directories are skipped
- dot:     Don't respect .ignore files. This does *not* affect whether ast-grep will ignore files and directories whose names begin with a dot. For that, use --no-ignore hidden
- exclude: Don't respect ignore files that are manually configured for the repository such as git's '.git/info/exclude'
- global:  Don't respect ignore files that come from "global" sources such as git's `core.excludesFile` configuration option (which defaults to `$HOME/.config/git/ignore`)
- parent:  Don't respect ignore files (.gitignore, .ignore, etc.) in parent directories
- vcs:     Don't respect version control ignore files (.gitignore, etc.). This implies --no-ignore parent for VCS files. Note that .ignore files will continue to be respected

### `--stdin`

Enable search code from StdIn.

Use this if you need to take code stream from standard input.

### `--follow`

Follow symbolic links.

This flag instructs ast-grep to follow symbolic links while traversing directories. This behavior is disabled by default. Note that ast-grep will check for symbolic link loops and report errors if it finds one. ast-grep will also report errors for broken links.

### `--globs <GLOBS>`

Include or exclude file paths.

Include or exclude files and directories for searching that match the given glob. This always overrides any other ignore logic. Multiple glob flags may be used. Globbing rules match .gitignore globs. Precede a glob with a `!` to exclude it. If multiple globs match a file or directory, the glob given later in the command line takes precedence.

## Output Options

### `-i, --interactive`
Start interactive edit session.

You can confirm the code change and apply it to files selectively, or you can open text editor to tweak the matched code. Note that code rewrite only happens inside a session.

### `-j, --threads <NUM>`

Set the approximate number of threads to use.

This flag sets the approximate number of threads to use. A value of 0 (which is the default) causes ast-grep to choose the thread count using heuristics.

[default: 0]

### `-U, --update-all`
Apply all rewrite without confirmation if true

### `--json[=<STYLE>]`

Output matches in structured JSON .

If this flag is set, ast-grep will output matches in JSON format. You can pass optional value to this flag by using `--json=<STYLE>` syntax to further control how JSON object is formatted and printed. ast-grep will `pretty`-print JSON if no value is passed. Note, the json flag must use `=` to specify its value. It conflicts with interactive.

Possible values:
- pretty:  Prints the matches as a pretty-printed JSON array, with indentation and line breaks. This is useful for human readability, but not for parsing by other programs. This is the default value for the `--json` option
- stream:  Prints each match as a separate JSON object, followed by a newline character. This is useful for streaming the output to other programs that can read one object per line
- compact: Prints the matches as a single-line JSON array, without any whitespace. This is useful for saving space and minimizing the output size

### `--inspect <GRANULARITY>`
Inspect information for file/rule discovery and scanning.

This flag helps user to observe ast-grep's internal filtering of files and rules. Inspection will output how many and why files and rules are scanned and skipped. Inspection outputs to stderr and does not affect the result of the search.

The format of the output is informally defined as follows:

```
sg: <GRANULARITY>|<ENTITY_TYPE>|<ENTITY_IDENTIFIERS_SEPARATED_BY_COMMA>: KEY=VAL
```

The [Extended Backus–Naur form](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) notation is specified in the [issue](https://github.com/ast-grep/ast-grep/issues/1574).

[default: nothing]

Possible values:
- **nothing**: Do not show any tracing information
- **summary**: Show summary about how many files are scanned and skipped
- **entity**:  Show per-file/per-rule tracing information

### `--format <FORMAT>`
Output warning/error messages in different formats.

Supported formats: GitHub Action, [SARIF](https://sarifweb.azurewebsites.net/) (Static Analysis Results Interchange Format).

[possible values: github, sarif]

## Context Options

### `-A, --after <NUM>`
Show NUM lines after each match.

It conflicts with both the -C/--context flag.

[default: 0]

### `-B, --before <NUM>`
Show NUM lines before each match.

It conflicts with both the -C/--context flag.

[default: 0]

### `-C, --context <NUM>`
Show NUM lines around each match.

This is equivalent to providing both the -B/--before and -A/--after flags with the same value. It conflicts with both the -B/--before and -A/--after flags.

[default: 0]

## Style Options

### `--color <WHEN>`
Controls output color.

This flag controls when to use colors. The default setting is 'auto', which means ast-grep will try to guess when to use colors. If ast-grep is printing to a terminal, then it will use colors, but if it is redirected to a file or a pipe, then it will suppress color output. ast-grep will also suppress color output in some other circumstances. For example, no color will be used if the TERM environment variable is not set or set to 'dumb'.

[default: auto]

Possible values:
- auto:   Try to use colors, but don't force the issue. If the output is piped to another program, or the console isn't available on Windows, or if TERM=dumb, or if `NO_COLOR` is defined, for example, then don't use colors
- always: Try very hard to emit colors. This includes emitting ANSI colors on Windows if the console API is unavailable (not implemented yet)
- ansi:   Ansi is like Always, except it never tries to use anything other than emitting ANSI color codes
- never:  Never emit colors

### `--report-style <REPORT_STYLE>`
[default: rich]

Possible values:
- rich:   Output a richly formatted diagnostic, with source code previews
- medium: Output a condensed diagnostic, with a line number, severity, message and notes (if any)
- short:  Output a short diagnostic, with a line number, severity, and message

## Rule Options

These rule option flags set the specified RULE_ID's severity to a specific level. You can specify multiple rules by using the flag multiple times, e.g., `--error=RULE_1 --error=RULE_2`. If no RULE_ID is provided, all rules will be set to the specified level, e.g., `--error`. Note, these flags must use `=` to specify its value.

### `--error[=<RULE_ID>...]`
Set rule severity to error

This flag sets the specified RULE_ID's severity to error. You can specify multiple rules by using the flag multiple times. If no RULE_ID is provided, all rules will be set to error. Note, this flag must use `=` to specify its value.

### `--warning[=<RULE_ID>...]`
Set rule severity to warning

This flag sets the specified RULE_ID's severity to warning. You can specify multiple rules by using the flag multiple times. If no RULE_ID is provided, all rules will be set to warning. Note, this flag must use `=` to specify its value.

### `--info[=<RULE_ID>...]`
Set rule severity to info

This flag sets the specified RULE_ID's severity to info. You can specify multiple rules by using the flag multiple times. If no RULE_ID is provided, all rules will be set to info. Note, this flag must use `=` to specify its value.

### `--hint[=<RULE_ID>...]`
Set rule severity to hint

This flag sets the specified RULE_ID's severity to hint. You can specify multiple rules by using the flag multiple times. If no RULE_ID is provided, all rules will be set to hint. Note, this flag must use `=` to specify its value.

### `--off[=<RULE_ID>...]`
Turn off rule

This flag turns off the specified RULE_ID. You can disable multiple rules by using the flag multiple times. If no RULE_ID is provided, all rules will be turned off. Note, this flag must use `=` to specify its value.

### `-h, --help`
  Print help (see a summary with '-h')

## Exit codes

The program exits with status code:
- **1**: if at least one rule matches
- **0**: if no rules match