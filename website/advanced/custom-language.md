# Custom Language Support

:::danger Experimental Feature
Custom language in ast-grep is an experimental option. Use it with caution!
:::

In this guide, we will show you how to use a custom language that is not built into ast-grep.

We will use [Mojo 🔥](https://www.modular.com/mojo) as an example!

-----

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) is a popular parser generator library that ast-grep uses to support many languages.
However, not all Tree-sitter compatible languages are shipped with ast-grep command line tool.

If you want to use a custom language that is not built into ast-grep, you can compile it as a dynamic library first and load it via custom language registration.

There will be three steps to achieve this:

1. Install tree-sitter CLI and prepare the grammar file.
2. Compile the custom language as a dynamic library.
3. Register the custom language in ast-grep project config.

## Prepare Tree-sitter tool and parser.

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

## Compile the parser as dynamic library.

Once we have prepared the tool and the grammar, we can compile the parser as dynamic library.

There are no official instructions on how to do this on the internet, but we can get some hints from Tree-sitter's [source code](https://github.com/tree-sitter/tree-sitter/blob/a62bac5370dc5c76c75935834ef083457a6dd0e1/cli/loader/src/lib.rs#L111).

One way is to set an environment variable called `TREE_SITTER_LIBDIR` to the path where you want to store the dynamic library, and then run `tree-sitter test` in the directory of your custom language parser.

This will generate a dynamic library at the `TREE_SITTER_LIBDIR` path.

For example:

```sh
cd path/to/mojo/parser
export TREE_SITTER_LIBDIR=path/to/your/dir
tree-sitter test
```

Another way is to use the following [commands](https://github.com/tree-sitter/tree-sitter/blob/a62bac5370dc5c76c75935834ef083457a6dd0e1/cli/loader/src/lib.rs#L380-L410) to compile the parser manually:

```shell
gcc -shared -fPIC -fno-exceptions -g -I {header_path} -o {lib_path} -O2 {scanner_path} -xc {parser_path} {other_flags}
```

where `{header_path}` is the path to the folder of header file of your custom language parser (usually `src`) and `{lib_path}` is the path where you want to store the dynamic library (in this case `mojo.so`). `{scanner_path}` and `{parser_path}` are the `c` or `cc` files of your parser. You also need to include other gcc flags if needed.

For example, in mojo's case, the full command will be:

```shell
gcc -shared -fPIC -fno-exceptions -g -I 'src' -o mojo.so -O2 src/scanner.cc -xc src/parser.c -lstdc++
```

:::warning
`tree-sitter-cli` is the preferred way to compile dynamic library.
:::

## Register the language in sgconfig.yml

Once you have compiled the dynamic library for your custom language, you need to register it in the `sgconfig.yml` file.
You can use the command [`sg new`](/guide/scan-project.html#create-scaffolding) to create a project and find the configuration file in the project root.

You need to add a new entry under the `customLanguages` key with the name of your custom language and some properties:

```yaml
# sgconfig.yml
ruleDirs: ["./rules"]
customLanguages:
  mojo:
      libraryPath: mojo.so     # path to dynamic library
      extensions: [mojo, 🔥]   # file extensions for this language
      expandoChar: _           # optional char to replace $ in your pattern
```

The `libraryPath` property specifies the path to the dynamic library relative to the `sgconfig.yml` file or an absolute path. The `extensions` property specifies a list of file extensions for this language.
The `expandoChar` property is optional and specifies a character that can be used instead of `$` for meta-variables in your pattern.



:::tip What's expandoChar?
ast-grep requires pattern to be a valid syntactical construct, but `$VAR` might not be a valid expression in some language.
`expandoChar` will replace `$` in the pattern so it can be parsed successfully by Tree-sitter.
:::

For example, `$VAR` is not valid in ~~[Python](https://github.com/ast-grep/ast-grep/blob/1b999b249110c157ae5026e546a3112cd64344f7/crates/language/src/python.rs#L15)~~ Mojo. So we need to replace it with `_VAR`.
You can check the `expandoChar` of ast-grep's built-in languages [here](https://github.com/ast-grep/ast-grep/tree/main/crates/language/src).

## Use it!

Now you are ready to use your custom language with ast-grep! You can use it as any other supported language with the `-l` flag or the `language` property in your rule.

For example, to search for all occurrences of `print` in mojo files, you can run:

```bash
sg -p "print" -l mojo
```

Or you can write a rule in yaml like this:

```yaml
id: my-first-mojo-rule
language: mojo  # the name we register before!
severity: hint
rule:
  pattern: print
```

And that's it! You have successfully used a custom language with ast-grep!

:::warning Quiz Time
Can you support parse `main.ʕ◔ϖ◔ʔ` as [Golang](https://github.com/golang/go/issues/59968)?

[Answer](https://twitter.com/hd_nvim/status/1655085184855969797).
:::
