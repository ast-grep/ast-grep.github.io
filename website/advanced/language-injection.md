# Search Multi-language Documents in ast-grep

## Introduction

<!-- [**ast-grep**](https://github.com/ast-grep/ast-grep) is a powerful structural code search tool that leverages syntax trees to find patterns in source code. This makes it more accurate and flexible than traditional text-based search tools. -->

ast-grep works well searching files of one single language, but it is hard to extract a sub language embedded inside a document.

However, in modern development, it's common to encounter **multi-language documents**. These are source files containing code written in multiple different languages. Notable examples include:

- **HTML files**: These can contain JavaScript inside `<script>` tags and CSS inside `<style>` tags.
- **JavaScript files**: These often contain regular expression, CSS style and query languages like graphql.
- **Ruby files**: These can contain snippets of code inside heredoc literals, where the heredoc delimiter often indicates the language.

These multi-language documents can be modeled in terms of a parent syntax tree with one or more _injected syntax trees_ residing _inside_ certain nodes of the parent tree.

ast-grep now supports a feature to handle **language injection**, allowing you to search for code written in one language within documents of another language.

This concept and terminology come from [tree-sitter's language injection](https://tree-sitter.github.io/tree-sitter/syntax-highlighting#language-injection), which implies you can _inject_ another language into a language document. (BTW, [neovim](https://github.com/nvim-treesitter/nvim-treesitter?tab=readme-ov-file#adding-queries) also embraces this terminology.)

## Example: Search JS/CSS in the CLI

Let's start with a simple example of searching for JavaScript and CSS within HTML files using ast-grep's command-line interface (CLI).
ast-grep has builtin support to search JavaScript and CSS inside HTML files.


### **Using `ast-grep run`**: find patterns of CSS in an HTML file

Suppose we have an HTML file like below:

```html
<style>
  h1 { color: red; }
</style>
<h1>
  Hello World!
</h1>
<script>
  alert('hello world!')
</script>
```

Running this ast-grep command will extract the matching CSS style code out of the HTML file!

```sh
ast-grep run -p 'color: $COLOR'
```

ast-grep outputs this beautiful CLI report.
```shell
test.html
2│  h1 { color: red; }
```

ast-grep works well even if just providing the pattern without specifying the pattern language!


### **Using `ast-grep scan`**: find JavaScript in HTML with rule files

You can also use ast-grep's [rule file](https://ast-grep.github.io/guide/rule-config.html) to search injected languages.

For example, we can warn the use of `alert` in JavaScript, even if it is inside the HTML file.

```yml
id: no-alert
language: JavaScript
severity: warning
rule:
  pattern: alert($MSG)
message: Prefer use appropriate custom UI instead of obtrusive alert call.
```

The rule above will detect usage of `alert` in JavaScript. Running the rule via `ast-grep scan`.

```sh
ast-grep scan --rule no-alert.yml
```

The command leverages built-in behaviors in ast-grep to handle language injection seamlessly. It will produce the following warning message for the HTML file above.

```sh
warning[no-alert]: Prefer use appropriate custom UI instead of obtrusive alert call.
  ┌─ test.html:8:3
  │
8 │   alert('hello world!')
  │   ^^^^^^^^^^^^^^^^^^^^^
```

## How language injections work?

ast-grep employs a multi-step process to handle language injections effectively. Here's a detailed breakdown of the workflow:

1. **File Discovery**: The CLI first discovers files on the disk via the venerable [ignore](https://crates.io/crates/ignore) crate, the same library under [ripgrep](https://github.com/BurntSushi/ripgrep)'s hood.

2. **Language Inference**: ast-grep infers the language of each discovered file based on file extensions.

3. **Injection Extraction**: For documents that contain code written in multiple languages (e.g., HTML with embedded JS), ast-grep extracts the injected language sub-regions. _At the moment, ast-grep handles HTML/JS/CSS natively_.

4. **Code Matching**: ast-grep matches the specified patterns or rules against these regions. Pattern code will be interpreted according to the injected language (e.g. JS/CSS), instead of the parent document language (e.g. HTML).

## Customize Language Injection: styled-components in JavaScript

You can customize language injection via the `sgconfig.yml` [configuration file](https://ast-grep.github.io/reference/sgconfig.html). This allows you to specify how ast-grep handles multi-language documents based on your specific needs, without modifying ast-grep's built-in behaviors.


Let's see an example of searching CSS code in JavaScript. [styled-components](https://styled-components.com/) is a library for styling React applications using [CSS-in-JS](https://bootcamp.uxdesign.cc/css-in-js-libraries-for-styling-react-components-a-comprehensive-comparison-56600605a5a1). It allows you to write CSS directly within your JavaScript via [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), creating styled elements as React components.

The example will configure ast-grep to detect styled-components' CSS.

### Injection Configuration

You can add the `languageInjections` section in the project configuration file `sgconfig.yml`.

```yaml
languageInjections:
- hostLanguage: js
  rule:
    pattern: styled.$TAG`$CONTENT`
  injected: css
```

Let's break the configuration down.


1. `hostLanguage`: Specifies the main language of the document. In this example, it is set to `js` (JavaScript).

2. `rule`: Defines the ast-grep rule to identify the injected language region within the host language.

    * `pattern`: The pattern matches styled components syntax where `styled` is followed by a tag (e.g., `button`, `div`) and a template literal containing CSS.
    * the rule should have a meta variable `$CONTENT` to specify the subregion of injected language. In this case, it is the content inside the template string.

3. `injected`: Specifies the injected language within the identified regions. In this case, it is `css`.

### Example Match

Consider a JSX file using styled components:

```js
import styled from 'styled-components';

const Button = styled.button`
  background: red;
  color: white;
  padding: 10px 20px;
  border-radius: 3px;
`

exporrt default function App() {
  return <Button>Click Me</Button>
}
```

With the above `languageInjections` configuration, ast-grep will:

1. Identify the `styled.button` block as a CSS region.
2. Extract the CSS code inside the template literal.
3. Apply any CSS-specific pattern searches within this extracted region.

You can search the CSS inside JavaScript in the project configuration folder using this command:

```sh
ast-grep -p 'background: $COLOR' -C 2
```

It will produce the match result:

```shell
styled.js
2│
3│const Button = styled.button`
4│  background: red;
5│  color: white;
6│  padding: 10px 20px;
```

## Using Custom Language with Injection

Finally, let's look at an example of searching for GraphQL within JavaScript files.
This demonstrates ast-grep's flexibility in handling custom language injections.

### Define graphql custom language in `sgconfig.yml`.

First, we need to register graphql as a custom language in ast-grep. See [custom language reference](https://ast-grep.github.io/advanced/custom-language.html) for more details.

```yaml
customLanguages:
  graphql:
    libraryPath: graphql.so # the graphql tree-sitter parser dynamic library
    extensions: [graphql]   # graphql file extension
    expandoChar: $          # see reference above for explanation
```

### Define graphql injection in `sgconfig.yml`.

Next, we need to customize what region should be parsed as graphql string in JavaScript. This is similar to styled-components example above.

```yaml
languageInjections:
- hostLanguage: js
  rule:
    pattern: graphql`$CONTENT`
  injected: graphql
```

### Search GraphQL in JavaScript

Suppose we have this JavaScript file from [Relay](https://relay.dev/), a GraphQL client framework.

```js
import React from "react"
import { graphql } from "react-relay"

const artistsQuery = graphql`
  query ArtistQuery($artistID: String!) {
    artist(id: $artistID) {
      name
      ...ArtistDescription_artist
    }
  }
`
```

We can search the GraphQL fragment via this `--inline-rules` scan.

```sh
ast-grep scan --inline-rules="{id: test, language: graphql, rule: {kind: fragment_spread}}"
```

Output

```sh
help[test]:
  ┌─ relay.js:8:7
  │
8 │       ...ArtistDescription_artist
  │       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## More Possibility to be Unlocked...

By following these steps, you can effectively use ast-grep to search and analyze code across multiple languages within the same document, enhancing your ability to manage and understand complex codebases.

This feature extends to various frameworks like [Vue](https://vuejs.org/) and [Svelte](https://svelte.dev/), enables searching for [SQL in React server actions](https://x.com/peer_rich/status/1717609270475194466), and supports new patterns like [Vue-Vine](https://x.com/hd_nvim/status/1815300932793663658).

Hope you enjoy the feature! Happy ast-grepping!