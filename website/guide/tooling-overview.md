# Command Line Tooling Overview

## Overview

ast-grep's tooling supports multiple stages of your development. Here is a list of the tools and their purpose:

* To run an ad-hoc query and apply rewrite: `sg run`.
* Routinely check your codebase: `sg scan`.
* Generate ast-grep's scaffolding files: `sg new`.
* Develop new ast-grep rules and test them: `sg test`.

We will walk through some important features that are common to these commands.

## Interactive Mode

ast-grep by default will output the results of your query at once in your terminal which is useful to have a quick glance at the result. But sometimes you will need to scrutinize every result one by one to refine you pattern query or to avoid bad cases for edge-case code.

You can use the `--interactive` flag to open an interactive mode. This will allow you to select which results you want to apply the rewrite to. This mode is inspired by [fast-mod](https://github.com/facebookincubator/fastmod).

Screenshot of interactive mode.
![interactive](/image/interactive.jpeg)

Pressing `y` will accept the rewrite, `n` will skip it, `e` will open the file in your editor, and `q` will quit the interactive mode.

Example:

```bash
sg scan --interactive
```

## JSON Mode

Composability is a key perk of command line tooling. ast-grep is no exception.

`--json` will output results in JSON format. This is useful to pipe the results to other tools. For example, you can use [jq](https://stedolan.github.io/jq/) to extract information from the results and render it in [jless](https://jless.io/).

```bash
sg run -p 'Some($A)' -r 'None' --json | jq '.[].replacement' | jless
```

The format of the JSON output is an array of match objects.

```json
[
  {
    "text": "import",
    "range": {
      "byteOffset": {
        "start": 66,
        "end": 72
      },
      "start": {
        "line": 3,
        "column": 2
      },
      "end": {
        "line": 3,
        "column": 8
      }
    },
    "file": "./website/src/vite-env.d.ts",
    "replacement": "require",
    "language": "TypeScript"
  }
]
```

## Run one single query or one single rule

You can also use ast-grep to explore a proper pattern for your query. There are two ways to try your pattern or rule.
For testing one pattern, you can use `sg run` command.

```bash
sg run -p 'YOUR_PATTERN' --debug-query
```

The `--debug-query` option will output the tree-sitter ast of the query.

To test one single rule, you can use `sg scan -r`.

```bash
sg scan -r path/to/your/rule.yml
```
It is useful to test one rule in isolation.

## Parse Code from StdIn

ast-grep's `run` and `scan` commands also support searching and replacing code from standard input (StdIn).
You can use bash's [pipe operator](https://linuxhint.com/bash_pipe_tutorial/) `|` to instruct ast-grep to read from StdIn.

### Example: Simple Web Crawler

Let's see an example in action. Combining with `curl`, `ast-grep` and `jq`, we can build a [simple web crawler](https://twitter.com/trevmanz/status/1671572111582978049) on command line. The command below uses `curl` to fetch the HTML source of SciPy conference website, and then uses `sg` to parse and extract relevant information as JSON from source, and finally uses `jq` to transform our matching results.

```bash
curl -s https://schedule2021.scipy.org/2022/conference/  |
  sg --pattern '<div $$$> $$$ <i>$AUTHORS</i> </div>' --lang html --json |
  jq '
    .[]
    | .metaVariables
    | .single.AUTHORS.text'
```

The command above will produce a list of authors from the SciPy 2022 conference website.

```json
"Ben Blaiszik"
"Qiming Sun"
"Max Jones"
"Thomas J. Fan"
"Sebastian Bichelmaier"
"Cliff Kerr"
...
```

With this feature, even if your preferred language does not have native bindings for ast-grep, you can still parse code from standard input (StdIn) to use ast-grep programmatically from the command line.

You can invoke sg, the command-line interface for ast-grep, as a subprocess to search and replace code.

### Caveats

**StdIn mode has several restrictions**, though:

* It conflicts with `--interactive` mode, which reads user responses from StdIn.
* For the `run` command, you must specify the language of the StdIn code with `--lang` or `-l` flag. For example: `echo "print('Hello world')" | sg run --lang python`. This is because ast-grep cannot infer code language without file extension.
* Similarly, you can only `scan` StdIn code against _one single rule_, specified by `--rule` or `-r` flag. The rule must match the language of the StdIn code. For example: `echo "print('Hello world')" | sg scan --rule "python-rule.yml"`

### Disable StdIn Mode

Sometimes ast-grep is launched from another process, but you still need it to search files instead of parsing from StdIn.

You can use ast-grep's command line argument `--no-stdin` to disable StdIn mode.
The environment variable `AST_GREP_NO_STDIN` will also disable StdIn mode.


For example, this shell script will start a live ast-grep session via fzf. Note `--no-stdin` is used here to prevernt ast-grep from searching standard input from fzf.

```bash
SG_PREFIX="sg run --color=always --no-stdin -p "
INITIAL_QUERY="${*:-}"
: | fzf --ansi --disabled --query "$INITIAL_QUERY" \
    --bind "start:reload:$SG_PREFIX {q}" \
    --bind "change:reload:sleep 0.1; $SG_PREFIX {q} || true" \
    --delimiter : \
    --preview 'bat --color=always {1} --highlight-line {2}' \
    --preview-window 'up,60%,border-bottom,+{2}+3/3,~3' \
    --bind 'enter:become(vim {1} +{2})'
```

## Colorful Output

The output of ast-grep is exuberant and beautiful! But it is not always desired for colorful output.
You can use `--color never` to disable ANSI color in the command line output.
