# Project Configuration

## Root Configuration File

ast-grep supports using [YAML](https://yaml.org/) to configure its linting rules to scan your code repository.
We need a root configuration file `sgconfig.yml` to specify directories where `ast-grep` can find all rules.

In your project root, add `sgconfig.yml` with content as below.

```yaml
ruleDirs:
  - rules
```

This instructs ast-grep to use all files _recursively_ inside the `rules` folder as rule files.

For example, suppose we have the following file structures.

```
my-awesome-project
  |- rules
  | |- no-var.yml
  | |- no-bit-operation.yml
  | |- my_custom_rules
  |   |- custom-rule.yml
  |   |- fancy-rule.yml
  |- sgconfig.yml
  |- not-a-rule.yml
```

All the YAML files under `rules` folder will be treated as rule files by `ast-grep`, while`not-a-rule.yml` is ignored.


**Note, the [`ast-grep scan`](/reference/cli.html#scan) command requires you have an `sgconfig.yml` in your project root.**

:::tip Pro tip
We can also use directories in `node_modules` to reuse preconfigured rules published on npm!

More broadly speaking, any git hosted projects can be imported as rule sets by using [`git submodule`](https://www.git-scm.com/book/en/v2/Git-Tools-Submodules).
:::

## Project Discovery

ast-grep will try to find the `sgconfig.yml` file in the current working directory. If it is not found, it will traverse up the directory tree until it finds one. You can also specify the path to the configuration file using the `--config` option.

```bash
ast-grep scan --config path/to/config.yml
```

:::tip Global Configuration
You can put an `sgconfig.yml` in your home directory to set global configurations for `ast-grep`. XDG configuration directory is **NOT** supported yet.
:::

Project file discovery and `--config` option are also effective in the `ast-grep run` command. So you can use configurations like [custom languages](/reference/sgconfig.html#customlanguages) and [language globs](/reference/sgconfig.html#languageglobs). Note that `run` command does not require a `sgconfig.yml` file and will stil search code without it, but `scan` command will report an error if project config is not found.

## Project Inspection

You can use the [`--inspect summary`](/reference/cli/scan.html#inspect-granularity) flag to see the project directory ast-grep is using.

```bash
ast-grep scan --inspect summary
```

It will print the project directory and the configuration file path.

```bash
sg: summary|project: isProject=true,projectDir=/path/to/project
```

Output format can be found in the [GitHub issue](https://github.com/ast-grep/ast-grep/issues/1574).