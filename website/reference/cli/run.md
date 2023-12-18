---
outline: [2, 3]
---

# `sg run`

Run one time search or rewrite in command line.
This is the default command when you run `sg` so `sg -p 'foo()'` is equivalent to `sg run -p 'foo()'`.

## Usage

```shell
sg run [OPTIONS] --pattern <PATTERN> [PATHS]...
```

## Arguments

`[PATHS]...`

The paths to search. You can provide multiple paths separated by spaces

[default: .]


## Run Specific Options

### `-p, --pattern <PATTERN>`

AST pattern to match

### `-r, --rewrite <FIX>`

String to replace the matched AST node

### `-l, --lang <LANG>`

The language of the pattern. For full language list, visit https://ast-grep.github.io/reference/languages.html

### `--debug-query`

Print query pattern's tree-sitter AST. Requires lang be set explicitly

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

## Output Options

### `-i, --interactive`

Start interactive edit session.

You can confirm the code change and apply it to files selectively, or you can open text editor to tweak the matched code. Note that code rewrite only happens inside a session.

### `-U, --update-all`

Apply all rewrite without confirmation if true

### `--json[=<style>]`
Output matches in structured JSON .

If this flag is set, ast-grep will output matches in JSON format. You can pass optional value to this flag by using `--json=<style>` syntax to further control how JSON object is formatted and printed. ast-grep will `pretty`-print JSON if no value is passed. Note, the json flag must use `=` to specify its value. It conflicts with interactive.

Possible values:
- pretty:  Prints the matches as a pretty-printed JSON array, with indentation and line breaks. This is useful for human readability, but not for parsing by other programs. This is the default value for the `--json` option
- stream:  Prints each match as a separate JSON object, followed by a newline character. This is useful for streaming the output to other programs that can read one object per line
- compact: Prints the matches as a single-line JSON array, without any whitespace. This is useful for saving space and minimizing the output size

### `--color <WHEN>`
Controls output color.

This flag controls when to use colors. The default setting is 'auto', which means ast-grep will try to guess when to use colors. If ast-grep is printing to a terminal, then it will use colors, but if it is redirected to a file or a pipe, then it will suppress color output. ast-grep will also suppress color output in some other circumstances. For example, no color will be used if the TERM environment variable is not set or set to 'dumb'.

[default: auto]

Possible values:
- auto:   Try to use colors, but don't force the issue. If the output is piped to another program, or the console isn't available on Windows, or if TERM=dumb, or if `NO_COLOR` is defined, for example, then don't use colors
- always: Try very hard to emit colors. This includes emitting ANSI colors on Windows if the console API is unavailable (not implemented yet)
- ansi:   Ansi is like Always, except it never tries to use anything other than emitting ANSI color codes
- never:  Never emit colors

### `--heading <WHEN>`

Controls whether to print the file name as heading.

If heading is used, the file name will be printed as heading before all matches of that file. If heading is not used, ast-grep will print the file path before each match as prefix. The default value `auto` is to use heading when printing to a terminal and to disable heading when piping to another program or redirected to files.

[default: auto]

Possible values:
- auto:   Print heading for terminal tty but not for piped output
- always: Always print heading regardless of output type
- never:  Never print heading regardless of output type

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

### `-h, --help`
Print help (see a summary with '-h')