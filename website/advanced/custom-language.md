# Custom Language Support

In this guide, we will show you how to use a custom language that is not built into ast-grep.

We will use [Mojo 🔥](https://www.modular.com/mojo) as an example!

-----

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) is a popular parser generator library that ast-grep uses to support many languages.
However, not all Tree-sitter compatible languages are shipped with ast-grep command line tool.

If you want to use a custom language that is not built into ast-grep, you can compile it as a dynamic library first and load it via custom language registration.

There are four steps:

1. Install tree-sitter CLI and prepare the grammar file.
2. Compile the custom language as a dynamic library.
3. Register the custom language in ast-grep project config.
4. Explicitly enable loading the native parser library.

:::warning Changed in 0.50.0
Registering a parser in `sgconfig.yml` no longer enables it automatically in
the CLI. Custom parsers are native code and run with your permissions. Review
the configuration and libraries, then use `--custom-languages allow` for one
invocation or `--custom-languages trust` to approve the project interactively.
Built-in languages do not need this opt-in.
:::

:::tip Pro Tip
You can also reuse the dynamic library compiled by neovim. See [this link](https://github.com/nvim-treesitter/nvim-treesitter/#changing-the-parser-install-directory) to find where the parsers are.
:::

## Prepare Tree-sitter Tool and Parser

Before you can compile a custom language as a dynamic library, you need to install the Tree-sitter CLI tool and get the Tree-sitter grammar for your custom language.

The recommended way to install the Tree-sitter CLI tool is via [npm](https://www.npmjs.com/package/tree-sitter-cli):

```bash
npm install -g tree-sitter-cli
```
Alternative installation methods are also available in the [official doc](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation).


For the Tree-sitter grammar, you can either [write your own](https://tree-sitter.github.io/tree-sitter/creating-parsers#writing-the-grammar) or find one from the Tree-sitter grammars [repository](https://github.com/tree-sitter).

Since **Mojo** is a new language, we cannot find an existing repo for it. But I have created a mock [grammar for Mojo](https://github.com/HerringtonDarkholme/tree-sitter-mojo).

You can clone it for the tutorial sake. It is forked from Python and barely contains Mojo syntax(just `struct`/`fn` keywords).

```bash
git clone https://github.com/HerringtonDarkholme/tree-sitter-mojo.git
```

## Compile the Parser as Dynamic Library

Once we have prepared the tool and the grammar, we can compile the parser as dynamic library.
_`tree-sitter-cli` is the preferred way to compile dynamic library._

The [official way](https://tree-sitter.github.io/tree-sitter/cli/build.html) to compile a parser as a dynamic library is to use the `tree-sitter build` command.

```sh
tree-sitter build --output mojo.so
```

The build command compiles your parser into a dynamically-loadable library as a shared object (.so, .dylib, or .dll).


Another way is to use the following [commands](https://github.com/tree-sitter/tree-sitter/blob/a62bac5370dc5c76c75935834ef083457a6dd0e1/cli/loader/src/lib.rs#L380-L410) to compile the parser manually:

```shell
gcc -shared -fPIC -fno-exceptions -g -I {header_path} -o {lib_path} -O2 {scanner_path} -xc {parser_path} {other_flags}
```

where `{header_path}` is the path to the folder of header file of your custom language parser (usually `src`) and `{lib_path}` is the path where you want to store the dynamic library (in this case `mojo.so`). `{scanner_path}` and `{parser_path}` are the `c` or `cc` files of your parser. You also need to include other gcc flags if needed.

For example, in mojo's case, the full command will be:

```shell
gcc -shared -fPIC -fno-exceptions -g -I 'src' -o mojo.so -O2 src/scanner.cc -xc src/parser.c -lstdc++
```

:::details Old tree-sitter does not have build command

[Previously](https://github.com/tree-sitter/tree-sitter/pull/3174) there are no official instructions on how to do this on the internet, but we can get some hints from Tree-sitter's [source code](https://github.com/tree-sitter/tree-sitter/blob/a62bac5370dc5c76c75935834ef083457a6dd0e1/cli/loader/src/lib.rs#L111).

One way is to set an environment variable called `TREE_SITTER_LIBDIR` to the path where you want to store the dynamic library, and then run `tree-sitter test` in the directory of your custom language parser.

This will generate a dynamic library at the `TREE_SITTER_LIBDIR` path.

For example:

```sh
cd path/to/mojo/parser
export TREE_SITTER_LIBDIR=path/to/your/dir
tree-sitter test
```
:::

## Register Language in `sgconfig.yml`

Once you have compiled the dynamic library for your custom language, you need to register it in the `sgconfig.yml` file.
You can use the command [`ast-grep new`](/guide/scan-project#create-scaffolding) to create a project and find the configuration file in the project root.

You need to add a new entry under the `customLanguages` key with the name of your custom language and some properties:

```yaml
# sgconfig.yml
ruleDirs: ["./rules"]
customLanguages:
  mojo:
      libraryPath: mojo.so     # path to dynamic library
      extensions: [mojo, 🔥]   # file extensions for this language
      outlineRules: outline/mojo.yml # optional outline extraction rules
      expandoChar: _           # optional char to replace $ in your pattern
```

The `libraryPath` property specifies the path to the dynamic library relative to the `sgconfig.yml` file or an absolute path. The `extensions` property specifies a list of file extensions for this language.
The `expandoChar` property is optional and specifies a character that can be used instead of `$` for meta-variables in your pattern.
The `outlineRules` property is optional and specifies an outline extraction rule file relative to `sgconfig.yml`. When custom language loading is enabled, `ast-grep outline` loads the file for this custom language. You can still pass extra outline rules with `--outline-rules`; configured custom language rules load first.



:::tip What's expandoChar?
ast-grep requires pattern to be a valid syntactical construct, but `$VAR` might not be a valid expression in some language.
`expandoChar` will replace `$` in the pattern so it can be parsed successfully by Tree-sitter.
:::

For example, `$VAR` is not valid in ~~[Python](https://github.com/ast-grep/ast-grep/blob/1b999b249110c157ae5026e546a3112cd64344f7/crates/language/src/python.rs#L15)~~ Mojo. So we need to replace it with `_VAR`.
You can check the `expandoChar` of ast-grep's built-in languages [here](https://github.com/ast-grep/ast-grep/tree/main/crates/language/src).

## Enable Custom Language Loading

Since 0.50.0, the CLI skips native custom language libraries in untrusted
projects by default. Merely adding `customLanguages` to `sgconfig.yml` is not
enough. Choose a policy with the global `--custom-languages` option, which works
with `run`, `scan`, `test`, `outline`, `new`, and `lsp`.

### Allow One Invocation

After reviewing the parser library and project configuration, enable the parser
for one command:

```bash
ast-grep run -p 'print' -l mojo --custom-languages allow
```

`allow` does not save trust. Use it explicitly in trusted CI jobs and other
non-interactive workflows, including scans and rule tests:

```bash
ast-grep scan --custom-languages allow
ast-grep test --custom-languages allow
```

### Remember a Reviewed Project

To enable the parser for future commands, run this in an interactive terminal:

```bash
ast-grep run -p 'print' -l mojo --custom-languages trust
```

ast-grep asks for confirmation before saving trust and loading the libraries.
Both stdin and stderr must be terminals; `trust` fails in non-interactive
environments. Use `allow` for automation. Once approved, subsequent commands
using the same configuration can omit the option.

:::warning Trust is tied to the configuration path
ast-grep remembers the canonical path of the configuration file. It does not
track the contents of the configuration or parser libraries. Changing either
does not invalidate saved trust. Review updates to trusted parsers as you would
updates to any executable dependency.
:::

### Skip Loading or Remove Trust

Use `ignore` to skip custom parsers for one invocation, even in a trusted
project. This preserves saved trust:

```bash
ast-grep scan --custom-languages ignore
```

Use `revoke` to remove saved trust and skip custom parsers for the current
invocation:

```bash
ast-grep scan --custom-languages revoke
```

Both policies also skip `outlineRules` registered under `customLanguages`.
Skipping the libraries produces a warning, but rules, injections, and `--lang`
values that depend on a skipped parser can still cause an error. To scan only
built-in languages, select rules that do not require the custom parser.

All policies use the configuration discovered from the current directory or
selected with the global `-c`/`--config` option:

```bash
ast-grep scan --config path/to/sgconfig.yml --custom-languages revoke
```

This loading policy applies to the CLI only. JavaScript and Python APIs
continue to use explicit language registration in application code, such as
[`registerDynamicLanguage`](/guide/api-usage/js-api#use-other-language) in
JavaScript.

Trust is stored locally in the user's ast-grep configuration directory. Set
`AST_GREP_TRUST_DIR` to use a different directory for the trust store; this does
not change project configuration discovery. See
[CLI global options](/reference/cli#global-options) for the policy reference.

## Add Outline Support

To make `ast-grep outline` show symbols for your custom language, add an
`outlineRules` file to the custom language registration.

```yaml
# sgconfig.yml
customLanguages:
  mojo:
      libraryPath: mojo.so
      extensions: [mojo, 🔥]
      outlineRules: outline/mojo.yml
```

The outline rule file is a stream of YAML extractor documents:

```yaml
# outline/mojo.yml
id: mojo-function
language: mojo
role: item
symbolType: function
rule:
  pattern: fn $NAME($$$ARGS) { $$$BODY }
name: $NAME
signature: fn $NAME($$$ARGS)
```

Now `outline` can load the extractor from project configuration:

```shell
ast-grep outline src -l mojo --custom-languages allow
```

See [outline rule fields reference](/reference/outline-rule-fields) for all
supported fields.

## Use It!

Now you are ready to use your custom language with ast-grep! You can use it as any other supported language with the `-l` flag or the `language` property in your rule.

For example, to search for all occurrences of `print` in mojo files, you can run:

```bash
ast-grep -p 'print' -l mojo --custom-languages allow
```

Or you can write a rule in yaml like this:

```yaml
id: my-first-mojo-rule
language: mojo  # the name we register before!
severity: hint
rule:
  pattern: print
```

Run the rule with `ast-grep scan --custom-languages allow`, or omit the policy
if you have already trusted this configuration.

And that's it! You have successfully used a custom language with ast-grep!

## Inspect Parser Output

Due to limited bandwidth, ast-grep does not support pretty print Concrete Syntax Trees.

However, you can use [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/tree/master/cli#commands) to dump the AST tree for your file.

```bash
tree-sitter parse [file_path]
```

:::warning Quiz Time
Can you support parse `main.ʕ◔ϖ◔ʔ` as [Golang](https://github.com/golang/go/issues/59968)?

[Answer](https://twitter.com/hd_nvim/status/1655085184855969797).
:::
