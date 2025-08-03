# List of Languages with Built-in Support

The table below lists all languages that are supported by ast-grep.

**Alias** is the name you can use as an argument in `ast-grep run --lang [alias]` or as a value in YAML rule with `language: [alias]`.

**Extension** specifies the file extensions that ast-grep will look for when scanning the file system. By default, ast-grep uses the file extensions to determine the language.

----

| Language Name | Alias | File Extension |
|---|---|---|
|Bash | `bash` | `bash`, `bats`, `cgi`, `command`, `env`, `fcgi`, `ksh`, `sh`, `sh.in`, `tmux`, `tool`, `zsh` |
|C | `c` | `c`,`h`|
|Cpp | `cc`, `c++`, `cpp`, `cxx` | `cc`, `hpp`, `cpp`, `c++`, `hh`, `cxx`, `cu`, `ino`|
|CSharp | `cs`, `csharp` | `cs`|
|Css | `css` | `css`|
|Elixir | `ex`, `elixir` | `ex`, `exs`|
|Go | `go`, `golang` | `go`|
|Haskell | `hs`, `haskell` | `hs`|
|Html | `html` | `html`, `htm`, `xhtml`|
|Java | `java` | `java`|
|JavaScript | `javascript`, `js`, `jsx` | `cjs`, `js`, `mjs`, `jsx`|
|Json | `json` | `json` |
|Kotlin | `kotlin`, `kt` | `kt`, `ktm`, `kts`|
|Lua | `lua` | `lua`|
|Nix | `nix` | `nix`|
|Php | `php` | `php` |
|Python | `py`, `python` | `py`, `py3`, `pyi`, `bzl`|
|Ruby | `rb`, `ruby` | `rb`, `rbw`, `gemspec`|
|Rust | `rs`, `rust` | `rs`|
|Scala | `scala` | `scala`, `sc`, `sbt`|
|Solidity | `solidity`, `sol` | `sol`|
|Swift | `swift` | `swift`|
|TypeScript | `ts`, `typescript` | `ts`, `cts`, `mts`|
|Tsx | `tsx` | `tsx`|
|Yaml | `yml` | `yml`, `yaml`|

----

:::tip Pro Tips
You can use [`languageGlobs`](/reference/sgconfig.html#languageglobs) to customize languages' extension mapping.
:::