# Frequently Asked Questions

## My pattern does not work, why?

1. **Use the Playground**: Test your pattern in the [ast-grep playground](https://ast-grep.github.io/playground.html).
2. **Check for Valid Code**: Make sure your pattern is valid code that tree-sitter can parse.
3. **Ensure Correctness**: Use a [pattern object](/guide/rule-config/atomic-rule.html#pattern) to ensure your code is correct and unambiguous.
4. **Explore Examples**: See ast-grep's [catalog](https://ast-grep.github.io/catalog/) for more examples.


The most common scenario is that you only want to match a sub-expression or one specific AST node in a whole syntax tree.
However, the code fragment corresponding to the sub-expression may not be valid code.
To make the code can be parsed by tree-sitter, you probably need more context instead of providing just code fragment.

For example, if you want to match key-value pair in JSON, writing `"key": "$VAL"` will not work because it is not a legal JSON.

Instead, you can provide context via the pattern object. See [playground code](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6Impzb24iLCJxdWVyeSI6ImZvbygkJCRBLCBiLCAkJCRDKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBcbiAgICBjb250ZXh0OiAne1widmVyc2lvblwiOiBcIiRWRVJcIiB9J1xuICAgIHNlbGVjdG9yOiBwYWlyIiwic291cmNlIjoie1xuICAgIFwidmVyc2lvblwiOiBcInZlclwiXG59In0=).

```YAML
rule:
  pattern:
    context: '{"key": "$VAL"}'
    selector: pair
```

The idea is that you can write full an valid code in the `context` field and use `selector` to select the sub-AST node.

This trick can be used in other languages as well, like [C](https://ast-grep.github.io/catalog/c/#match-function-call) and [Go](https://ast-grep.github.io/catalog/go/#match-function-call-in-golang).

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