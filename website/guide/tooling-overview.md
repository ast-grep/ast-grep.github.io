# Command Line Tooling Overview

## Overview

ast-grep's tooling supports multiple stages of your development. Here is a list of the tools and their purpose:

* To run an ad-hoc query and apply rewrite: `sg run`.
* Routinely check your codebase: `sg scan`.
* Develop new ast-grep rules and test them: `sg test`.

We will walk through some important features that are common to these commands.

## Interactive Mode

ast-grep by default will output the results of your query at once in your terminal which is useful to have a quick glance at the result. But sometimes you will need to scrutinize every result one by one to refine you pattern query or to avoid bad cases for edge-case code.

You can use the `--interactive` flag to open an interactive mode. This will allow you to select which results you want to apply the rewrite to. This mode is inspired by [fast-mod](https://github.com/facebookincubator/fastmod).

Screenshot of interactive mode.
![interactive](/image/interactive.jpeg)

Pressing `y` will accept the rewrite, `n` will skip it, `e` will open the file in your editor, and `q` will quit the interactive mode.

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

## Colorful Output

The output of ast-grep is exuberant and beautiful! But it is not always desired for colorful output.
You can use `--color never` to disable ANSI color in the command line output.
