# Frequently Asked Questions

## My pattern does not work, why?

1. **Use the Playground**: Test your pattern in the [ast-grep playground](/playground.html).
2. **Check for Valid Code**: Make sure your pattern is valid code that tree-sitter can parse.
3. **Ensure Correctness**: Use a [pattern object](/guide/rule-config/atomic-rule.html#pattern) to ensure your code is correct and unambiguous.
4. **Explore Examples**: See ast-grep's [catalog](/catalog/) for more examples.


The most common scenario is that you only want to match a sub-expression or one specific AST node in a whole syntax tree.
However, the code fragment corresponding to the sub-expression may not be valid code.
To make the code can be parsed by tree-sitter, you probably need more context instead of providing just code fragment.

For example, if you want to match key-value pair in JSON, writing `"key": "$VAL"` will not work because it is not a legal JSON.

Instead, you can provide context via the pattern object. See [playground code](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6Impzb24iLCJxdWVyeSI6ImZvbygkJCRBLCBiLCAkJCRDKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAne1widmVyc2lvblwiOiBcIiRWRVJcIiB9J1xuICAgIHNlbGVjdG9yOiBwYWlyIiwic291cmNlIjoie1xuICAgIFwidmVyc2lvblwiOiBcInZlclwiXG59In0=).

```YAML
rule:
  pattern:
    context: '{"key": "$VAL"}'
    selector: pair
```

The idea is that you can write full an valid code in the `context` field and use `selector` to select the sub-AST node.

This trick can be used in other languages as well, like [C](/catalog/c/#match-function-call) and [Go](/catalog/go/#match-function-call-in-golang). That said, pattern is not always the best choice for code search. [Rule](/guide/rule-config.html) can be more expressive and powerful.

## My Rule does not work, why?
Here are some tips to debug your rule:
* Use the [ast-grep playground](/playground.html) to test your rule.
* Simplify your rule to the minimal possible code that reproduces the issue.
* Confirm pattern's matched AST nodes are expected. e.g. statement and expression are [different matches](/advanced/pattern-parse.html#extract-effective-ast-for-pattern). This usually happens when you use `follows` or `precedes` in the rule.
* Check the [rule order](/advanced/faq.html#why-is-rule-matching-order-sensitive). The order of rules matters in ast-grep especially when using meta variables with relational rules.

## CLI and Playground produce different results, why?

There are two main reasons why the results may differ:

* **Parser Version**: The CLI may use a different version of the tree-sitter parser than the Playground.
Playground parsers are updated less frequently than the CLI, so there may be differences in the results.
* **Text Encoding**: The CLI and Playground use different text encodings. CLI uses utf-8, while the Playground uses utf-16.
The encoding difference may cause different fallback parsing during [error recovery](https://github.com/tree-sitter/tree-sitter/issues/224).

To debug the issue, you can use the [`--debug-query`](/reference/cli/run.html#debug-query-format) in the CLI to see the parsed AST nodes and meta variables.

```sh
ast-grep run -p <PATTERN> --debug-query ast
```

The debug output will show the parsed AST nodes and you can compare them with the [Playground](/playground.html). You can also use different debug formats like `cst` or `pattern`.

Different results are usually caused by incomplete or wrong code snippet in the pattern. A common fix is to provide a complete context code via the [pattern object](/reference/rule.html#atomic-rules).

```yaml
rule:
  pattern:
    context: 'int main() { return 0; }'
    selector: function
```

See [Pattern Deep Dive](/advanced/pattern-parse.html) for more context. Alternatively, you can try [rule](/guide/rule-config.html) instead.

Note `--debug-query` is not only for pattern, you can pass source code as `pattern` to see the parsed AST.

:::details Text encoding impacts tree-sitter error recovery.
Tree-sitter is a robust parser that can recover from syntax errors and continue parsing the rest of the code.
The exact strategy for error recovery is implementation-defined and uses a heuristic to determine the best recovery strategy.
See [tree-sitter issue](https://github.com/tree-sitter/tree-sitter/issues/224) for more details.

Text-encoding will affect the error recovery because it changed the cost of different recovery strategies.
:::

If you find the inconsistency between CLI and Playground, try confirming the playground version by hovering over the language label in playground, and the CLI version by [this file](https://github.com/ast-grep/ast-grep/blob/main/crates/language/Cargo.toml).

![Playground Version](/image/playground-parser-version.png)

:::tip Found inconsistency?
You can also [open an issue in the Playground repository](https://github.com/ast-grep/ast-grep.github.io/issues) if you find outdated parsers. Contribution to update the Playground parser is warmly welcome!
:::


## MetaVariable does not work, why?

1. **Correct Naming**: Start meta variables with the `$` sign, followed by uppercase letters (A-Z), underscores (`_`), or digits (1-9).
2. **Single AST Node**: A meta variable should be a single AST node. Avoid mixing meta variables with other text in one AST node. For example, `mix$OTHER_VAR` or `use$HOOK` will not work.
3. **Named AST Nodes**: By default, a meta variable matches only named AST nodes. Use double dollar signs like `$$UNNAMED` to match unnamed nodes.

## Multiple MetaVariable does not work

Multiple meta variables in ast-grep, such as `$$$MULTI`, are lazy. They stop matching nodes if the first node after them can match.

For example, `foo($$$A, b, $$$C)` matches `foo(a, c, b, b, c)`. `$$$A` stops before the first `b` and only matches `a, c`.

This design follows TypeScript's template literal types (`${infer VAR}Literal`) to ensure multiple meta variables always produce a match or non-match in linear time.

## Pattern cannot match my use case, how?

Patterns are a quick and easy way to match code in ast-grep, but they might not handle complex code. YAML rules are much more expressive and make it easier to specify complex code.

## I want to pattern match function call starts with some prefix string, how can I do that?

It is common to find function name or variable name following some naming convention like a function must starts with specific prefix.

For example, [React Hook](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use) in JavaScript requires function names start with `use`. Another example will be using `io_uring` in [Linux asynchronous programming](https://unixism.net/loti/genindex.html).

You may start with pattern like `use$HOOK` or `io_uring_$FUNC`. However, they are not valid meta variable names since the AST node text does not start with the dollar sign.

The workaround is using [`constraints`](https://ast-grep.github.io/guide/project/lint-rule.html#constraints) in [YAML rule](https://ast-grep.github.io/guide/project/lint-rule.html) and [`regex`](https://ast-grep.github.io/guide/rule-config/atomic-rule.html#regex) rule.

```yaml
rule:
  pattern: $HOOK($$$ARGS)
constraints:
  HOOK: { regex: '^use' }
```

[Example usage](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImZvbygkJCRBLCBiLCAkJCRDKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiAkSE9PSygkJCRBUkdTKVxuY29uc3RyYWludHM6XG4gIEhPT0s6IHsgcmVnZXg6IF51c2UgfSIsInNvdXJjZSI6ImZ1bmN0aW9uIFJlYWN0Q29tcG9uZW50KCkge1xuICAgIGNvbnN0IGRhdGEgPSBub3RIb28oKVxuICAgIGNvbnN0IFtmb28sIHNldEZvb10gPSB1c2VTdGF0ZSgnJylcbn0ifQ==).


:::danger MetaVariable must be one single AST node
Meta variables cannot be mixed with prefix/suffix string . `use$HOOK` and `io_uring_$FUNC` are not valid meta variables. They are parsed as one AST node as whole, and
ast-grep will not treat them as valid meta variable name.
:::

## How to reuse rule for similar languages like TS/JS or C/C++?

ast-grep does not support multiple languages in one rule because:

1. **Different ASTs**: Similar languages still have different ASTs. For instance, [JS](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJyZWxheGVkIiwic2VsZWN0b3IiOiIiLCJjb25maWciOiIiLCJzb3VyY2UiOiJmdW5jdGlvbiB0ZXN0KGEpIHt9In0=) and [TS](#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoidHlwZXNjcmlwdCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJyZWxheGVkIiwic2VsZWN0b3IiOiIiLCJjb25maWciOiIiLCJzb3VyY2UiOiJmdW5jdGlvbiB0ZXN0KGEpIHt9In0=) have different parsing trees for the same function declaration code.
2. **Different Kinds**: Similar languages may have different AST node kinds. Since ast-grep reports non-existing kinds as errors, there is no straightforward way to report error for kind only existing in one language.
3. **Debugging Experience**: Mixing languages in one rule requires users to test the rule in both languages. This can be confusing and error-prone, especially when unexpected results occur.

Supporting multi-lang rule is a challenging task for both tool developers and users. Instead, we recommend two approaches:
* **Always use the superset language**: Rule reusing usually happens when one language is a superset of another, e.g., TS and JS. In this case, you can use [`languageGlobs`](/reference/sgconfig.html#languageglobs) to parse files in the superset language. This is more suitable if you don't need to distinguish between the two languages.
* **Write Separate Rules**: Generate separate rules for each language. This approach is suitable when you do need to handle the differences between the languages.

If you have a better, clearer and easier proposal to support multi-lang rule, please leave a comment under [this issue](https://github.com/ast-grep/ast-grep/issues/525).


## Why is rule matching order sensitive?

ast-grep's rule matching is a step-by-step process. It matches one atomic rule at a time, stores the matched meta-variable, and proceeds to the next rule until all rules are matched.

**Rule matching is ordered** because previous rules' matched meta-variables can affect later rules. Only the first rule can specify what a `$META_VAR` matches, and later rules can only match the content captured by the first rule without modifying it.

Let's see an example. Suppose we want to find a recursive function in JavaScript. [This rule](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImZvbygkJCRBLCBiLCAkJCRDKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogcmVjdXJzaXZlLWNhbGxcbmxhbmd1YWdlOiBKYXZhU2NyaXB0XG5ydWxlOlxuICBhbGw6XG4gIC0gcGF0dGVybjogZnVuY3Rpb24gJEYoKSB7ICQkJCB9XG4gIC0gaGFzOlxuICAgICAgcGF0dGVybjogJEYoKVxuICAgICAgc3RvcEJ5OiBlbmRcbiIsInNvdXJjZSI6ImZ1bmN0aW9uIHJlY3Vyc2UoKSB7XG4gICAgZm9vKClcbiAgICByZWN1cnNlKClcbn0ifQ==) can do the trick.

:::code-group

```yml [rule.yml]
id: recursive-call
language: JavaScript
rule:
  all:
  - pattern: function $F() { $$$ }
  - has:
      pattern: $F()
      stopBy: end
```

```js [match.js]
function recurse() {
  foo()
  recurse()
}
```
:::

The rule works because the pattern `function $F() { $$$ }` matches first, capturing `$F` as `recurse`. The later `has` rule then looks for a `recurse()` call based on the matched `$F`.

If we [swap the order of rules](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImZvbygkJCRBLCBiLCAkJCRDKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogcmVjdXJzaXZlLWNhbGxcbmxhbmd1YWdlOiBKYXZhU2NyaXB0XG5ydWxlOlxuICBhbGw6XG4gIC0gaGFzOlxuICAgICAgcGF0dGVybjogJEYoKVxuICAgICAgc3RvcEJ5OiBlbmRcbiAgLSBwYXR0ZXJuOiBmdW5jdGlvbiAkRigpIHsgJCQkIH1cbiIsInNvdXJjZSI6ImZ1bmN0aW9uIHJlY3Vyc2UoKSB7XG4gICAgZm9vKClcbiAgICByZWN1cnNlKClcbn0ifQ==), it will produce no match.

```yml [rule.yml]
id: recursive-call
language: JavaScript
rule:
  all:
  - has:  # N.B. has is the first rule
      pattern: $F()
      stopBy: end
  - pattern: function $F() { $$$ }
```

In this case, the `has` rule matches first and captures `$F` as `foo` since `foo()` is the first function call matching the pattern `$F()`. The later rule `function $F() { $$$ }` will only find the `foo` declaration instead of `recurse`.

:::tip
Using `all` to specify the order of rule matching can be helpful when debugging YAML rules.
:::

## What does unordered rule object imply?

A rule object in ast-grep is an unordered dictionary. The order of rule application is implementation-defined. Currently, ast-grep applies atomic rules first, then composite rules, and finally relational rules.

If your rule depends on using meta variables in later rules, the best way is to use the `all` rule to specify the order of rules.

## `kind` and `pattern` rules are not working together, why?

The most common scneario is that your pattern is parsed as a different AST node than you expected. And you may use `kind` rule to filter out the AST node you want to match. This does not work in ast-grep for two reasons:
1. tree-sitter, the underlying parser library, does not offer a way to parse a string of a specific kind. So `kind` rule cannot be used to change the parsing outcome of a `pattern`.
2. ast-grep rules are mostly independent of each other, except sharing meta-variables during a match. `pattern` will behave the same regardless of another `kind` rule.

To specify the `kind` of a `pattern`, you need to use [pattern](/guide/rule-config/atomic-rule.html#pattern-object) [object](/advanced/pattern-parse.html#incomplete-pattern-code).

For example, to match class field in JavaScript, a kind + pattern rule [will not work](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46IGEgPSAxMjNcbiAga2luZDogZmllbGRfZGVmaW5pdGlvbiIsInNvdXJjZSI6ImNsYXNzIEEge1xuICAgIGEgPSAxMjNcbn0ifQ==):

```yaml
# these are two separate rules
pattern: a = 123          # rule 1
kind: field_definition    # rule 2
```

This is because pattern `a = 123` is parsed as [`assignment_expression`](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiYSA9IDEyMyIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6IiIsInNvdXJjZSI6IiJ9). Pattern and kind are two separate rules. And using them together will match nothing because no AST will have both `assignment_expression` and `field_definition` kind at once.

Instead, you need to use pattern object to provide enough context code for the parser to parse the code snippet as `field_definition`:

```yaml
# this is one single pattern rule!
pattern:
  context: 'class A { a = 123 }' # provide full context code
  selector: field_definition     # select the effective pattern
```

Note the rule above is one single pattern rule, instead of two. The `context` field provides the full unambiguous code snippet of `class`. So the `a = 123` will be parsed as `field_definition`. The `selector` field then selects the `field_definition` node as the [effective pattern](/advanced/pattern-parse.html#steps-to-create-a-pattern) matcher.

## Does ast-grep support some advanced static analysis?

Short answer: **NO**.

Long answer: ast-grep at the moment does not support the following information:
* [scope analysis](https://eslint.org/docs/latest/extend/scope-manager-interface)
* [type information](https://semgrep.dev/docs/writing-rules/pattern-syntax#typed-metavariables)
* [control flow analysis](https://en.wikipedia.org/wiki/Control-flow_analysis)
* [data flow analysis](https://en.wikipedia.org/wiki/Data-flow_analysis)
* [taint analysis](https://semgrep.dev/docs/writing-rules/data-flow/taint-mode)
* [constant propagation](https://semgrep.dev/docs/writing-rules/data-flow/constant-propagation)

More concretely, it is not easy, or even possible, to achieve the following tasks in ast-grep:

* Find variables that are not defined/used in the current scope.
* Find variables of a specific type.
* Find code that is unreachable.
* Find code that is always executed.
* Identify the flow of user input.

Also see [tool comparison](/advanced/tool-comparison.html) for more information.

## I don't want to read the docs / I don't understand the docs / The docs are too long / I have an urgent request

[Open Source Software](https://antfu.me/posts/why-reproductions-are-required) is served "as-is" by volunteers. We appreciate your interest in ast-grep, but we also have limited time and resources to address every request.

We appreciate constructive feedback and are always looking for ways to improve the documentation and the tool itself. There are several ways you can help us or yourself:

* Ask [Copilot](https://copilot.microsoft.com/) or other AI assistants to help you understand the docs.
* Provide feedbacks or pull requests on the [documentation](https://github.com/ast-grep/ast-grep.github.io).
* Browse [Discord](https://discord.com/invite/4YZjf6htSQ), [StackOverflow](https://stackoverflow.com/questions/tagged/ast-grep) or [Reddit](https://www.reddit.com/r/astgrep/).

~~If you just want an answer without effort, let the author [write a rule for you](https://github.com/sponsors/HerringtonDarkholme).~~