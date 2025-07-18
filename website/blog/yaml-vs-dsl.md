---
author:
  - name: Herrington Darkholme
search: false
date: 2025-07-07
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: 'YAML vs DSL: comparison is subjective'
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/yaml-vs-dsl.html
  - - meta
    - property: og:description
      content: YAML and DSL are two different approaches to configure rule in structural search. The question "which is better" is largely subjective.
---

# YAML vs DSL: comparison is subjective

As stated in the [tool comparison](/advanced/tool-comparison.html#gritql), YAML configuration and DSL (Domain Specific Language) are two different approaches to configure rules in structural search. The question "which is better" is largely subjective.

However, recently I have received some feedback that YAML is **objectively** not as good as DSL, and I would like to clarify some points.

The original argument is quoted as follows:

> While I see you're trying to dismiss it as a preference, I see it as a fundamental blocker. ast-grep has effectively built a DSL inside YAML. This becomes pretty apparent from your documentation, where you have to extensively explain how pattern syntax works, how metavariables work, etc.. You have to see that arguments such as "it's just YAML, no new syntax to learn" aren't entirely true either. Now IMO, if you're creating a DSL anyway, you're better off doing it properly than to go halfway. With GritQL we get syntax highlighting for all the aspects of the DSL, which I think is a significant boost. I think GritQL queries are significantly easier to read than ast-grep's mix of DSL of YAML.

## Direct rebuttal to the argument

### Abstraction does not necessitate DSL

> effectively built a DSL inside YAML

This is a misunderstanding of DSL and abstraction. To model Abstract Syntax Tree (AST) manipulation, you will have to have some form of concepts, such as pattern, metavariable, etc. This is true for both DSL and YAML. You cannot cut more concepts out of the tool even if you have [Occam's razor](https://en.wikipedia.org/wiki/Occam%27s_razor).

ast-grep does support pattern. It is a concept to match a strcture that contains multiple AST nodes, which makes it easier to write a rule. You can use `kind`/`has`/`all` to simulate pattern matching. But it does not mean that ast-grep should cut the concept of pattern since it looks like a DSL. In fact, ast-grep's pattern is just one of its [atomic rules](/guide/rule-config/atomic-rule.html). It does not meant to be a special embedded DSL.

### Pattern has its limitations

> your documentation, where you have to extensively explain how pattern syntax works, how pattern syntax works, how metavariables work

As stated before, pattern makes ast-grep users' life easier. Explaining how pattern works is necessary to help users understand how to write rules. This is not a sign of a DSL being necessary, but rather a sign of the limitation of pattern: it is not general enough to cover all cases, and you have to communicate to your users how pattern works in your system. For example, see this [tweet](https://x.com/hd_nvim/status/1941876968363798766) about how to write a pattern to match `function` declation in JavaScript. Another brain teaser, how to tell if `$a = $b` is an `assignment_expression` or `field_initializer`?

(an [ad-hominen](https://en.wikipedia.org/wiki/Ad_hominem) note: it is ironic to see this argument from a tool without proper documentation. I cannot suspend my suspect whether the author has used pattern to write non-trivial rules at all.)

### Slippery slope fallacy

> if you're creating a DSL anyway, you're better off doing it properly than to go halfway

This argument is a [slippery slope fallacy](https://en.wikipedia.org/wiki/Slippery_slope). Using pattern syntax does not mean that other rules should also be written in DSL. Again, pattern is just one of ast-grep's rules. ast-grep compose smaller rules to form more complex rules. ast-grep's rule system is not DSL based, but rather using YAML's key-value pair to represent rules. Using syntax in one rule does not imply that all rules should be combined in DSL.

Using one concept in your library, framework or tool does not imply that you have to design a whole new syntax for it. The similar comparison will be frontend frameworks. Some frameworks like React and Vue use [hook](https://react.dev/reference/react/hooks) or [signals](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob) to represent state changes. But using these building blocks does not grant the verdict to design a new language for your frontend framework. Even the most avant-garde company only introduces [new syntax](https://flow.org/en/docs/react/hook-syntax/) in JavaScript, not inventing a new language.

### Subjective opinion is not objective fact

> I think GritQL queries are significantly easier to read than ast-grep's mix of DSL of YAML.

This is a subjective opinion, instead of an fundamental blocker. The author failed to capture the difference between _"pattern syntax"_ and _"rule system"_. ast-grep's rule system is YAML based, so it is easier to write a [well-formed](https://en.wikipedia.org/wiki/Well-formedness) rule. Instead, DSL based rule system using their own syntax and can be more difficult to write a valid rule, especially for beginners.

We can also see using DSL is not subjectively better than YAML as well.

## Subjective Comparison of DSL

Let's review the DSL mentioned above.

### Mix of several different paradigms

Biome's DSL is a mix of several different paradigms: declarative, logic, and imperative. Let's see one example:

```JavaScript
`$method($message)` where {
  $method <: `console.log`,
  if ($message <: r"Hello, .*!") {
    $linter = "hello world"
  } else {
    $linter = "not hello"
  },
  register_diagnostic(
    span = $method,
    message = $linter
  )
}
```

- `$method('$message')` is a declarative pattern matching syntax.
- `where` and `<:` are related to [logic programming](https://en.wikipedia.org/wiki/Logic_programming#:~:text=Logic%20programming%20is%20a%20programming,solve%20problems%20in%20the%20domain.) paradigm, say, [Prolog](https://en.wikipedia.org/wiki/Prolog) or SQL.
- `if` is a typical imperative programming paradigm

The mixture of paradigms does not blend well. At least, in the eye of a programming language veteran, it is too messy for a DSL for linting or structural search. We are not designing a next-era programming language.

### Easy to miss comma

Did you notice there is two trailing commas in `$method <: console.log` and if block?

```JavaScript{2,7}
`$method($message)` where {
  $method <: `console.log`, // [!code focus]
  if ($message <: r"Hello, .*!") {
    $linter = "hello world"
  } else {
    $linter = "not hello"
  }, // [!code focus]
  register_diagnostic(
    span = $method,
    message = $linter
  )
}
```

Without them you will get a syntax error. This is a common problem for beginners to miss commas, a typical pitfall only in DSL. Alas, I can still remeber the old day when C compiler complained about missing semicolon.

### Similar basic patterns have distinct syntax appearance

There are several different basic patterns in the DSL. Though they are at the similar level of abstraction, their appearance is totally different.

```JavaScript
`console.log($foo)` // pattern
augmented_assignment_expression(operator = $op, left = $x, right = $v) // syntax node
r"Hello, (.*)"($name)  // regex
```

These patterns are corresponding to `pattern`, `kind` and `regex` in ast-grep. However, they look totally different. You need more learning to pick up these distinct syntax.

### Similar syntax appearance have different meaning

One common pitfall to design DSL is that similar syntax have different meaning.

```JavaScript
// this is a syntax node call
augmented_assignment_expression(operator = $op)
pattern console_method_to_info($method) {
  `console.$method($message)` => `console.info($message)`
}
// this is a pattern call
console_method_to_info(method = `log`)
predicate program_contains_logger() {
  $program <: contains `logger`
}
// this is a predicate call
program_contains_logger()

// define a lines function
function lines($string) {
    return split($string, separator=`\n`)
}
// this is a function call
lines(string = $message)
```

They all look like function calls, but they are not. See explanation below for the differences.

### Confusing Concepts of `pattern`, `predicate` and `function`

These three concepts are very similar, but they have slightly different usage in the DSL.

- `pattern` is used in `<:` or somewhere else, I dunno, the doc does not explain it well.
- `predicate` is used in `where` condition.
- `function` is used in `assignment`, `insertion` or `rewrite`.

Example:

```JavaScript
`console.log` => `logger.info` where {
  $program <: contains_logger(), // pattern
  program_contains_logger(), // equivalent predicate
  $program => replace_logger(), // function
}
```

### Confusing Concepts of `condition`, `clause` and `modifier`

The DSL also has three similar concepts: `condition`, `clause` and `modifier`.
Introduced in different places, [here](https://docs.grit.io/language/conditions) and [here](https://docs.grit.io/language/modifiers), without clear definition.

### Similar patterns but applied in different places

Tell the difference between [and](https://docs.grit.io/language/modifiers#and-clause), [any](https://docs.grit.io/language/modifiers#any-clause), [some](https://docs.grit.io/language/modifiers#some-clause) and [every](https://docs.grit.io/language/modifiers#every-clause).
Confusing? You should learn the difference between meta var in [list pattern](https://docs.grit.io/language/modifiers#list-patterns) and plain meta var. Also, don't confuse list meta var with [spread meta var](https://docs.grit.io/language/patterns#metavariables)

### One more thing, variable scope.

If you still have patience, you need one last thing to learn: variable scope.

I have no better explanation for it since I don't understand it well, so I will quote the [official documentation](https://docs.grit.io/language/bubble):

> Once a metavariable is bound to a value, it retains this value throughout the target code. Therefore, the scope of the metavariable spans the entire target file.

To fully understand it, you also need to know `bubble`, `bubble($argument)` and pattern auto wrap.

## What can go even more wrong?

Integrating a custom linting rule from another parser ecosystem to your own has several more decisions to make. Making bad decisions can lead to even more confusion.

- Your pattern syntax includes non standard syntax, like `$...`. You need to [change your parser](https://github.com/biomejs/biome/blob/31e439674493da76e0ce213e5660be3d903efbef/crates/biome_js_parser/src/syntax/jsx/mod.rs#L321) to support it.
- You need to make a decision if you want to support existing pattern libraries. But these patterns are built upon [tree-sitter](https://tree-sitter.github.io/tree-sitter/). So you have to [map tree-sitter AST to your own](https://github.com/biomejs/biome/blob/7bf9a608e1592fd595f658f5f800e12d51835d34/crates/biome_grit_patterns/src/grit_target_language/js_target_language.rs#L42-L55)
- Even worse, if you chose to support existing pattern libraries, you also need to work on a general algorithm to handle incompatibility between different ASTs. For example, different AST structures, different node names, different node properties, etc.
- If you only supports part of it, how can you teach your users what is supported and what is not, without [reading the source](https://github.com/biomejs/biome/blob/7bf9a608e1592fd595f658f5f800e12d51835d34/crates/biome_grit_patterns/src/grit_target_language/js_target_language.rs#L48-L50)?
- You also need to update your playground or editor plugins to support mapping between tree-sitter AST and your own AST. And teach users to use it.

## Conclusion

If you also feel confused, you are not alone. Again, the preference of DSL over YAMl is largely subjective.

If you think DSL is better, you are right. [You are absolutely right](https://www.reddit.com/r/ClaudeAI/comments/152b51r/you_are_absolutely_right/). In fact, you are [not even wrong](https://en.wikipedia.org/wiki/Not_even_wrong). Since this is a subjective opinion, not an objective fact.

If you are a library or framework author, you can make decision based on your own preference. However, mistakenly thinking your preference is objective will lead to confusion and misunderstanding. It may even reflect inferior tech taste and judgement.

Consider these points when you want to have objective comparison:

- Documentation?
- User Education? Howe you teach users to write your DSL?
- Tooling support like [playground](/playground.html).
- Editor support beyong syntax highlighting. Say LSP.
- Integration with API, how you bring type-safe DSL into your general purpose programming language, like [graphql](https://github.com/Quramy/ts-graphql-plugin) and [styled component](https://github.com/styled-components/typescript-styled-plugin).
- Broader ecosystem support, such as GitHub language detection, AI support, etc.

If you are going to use native tooling in your JavaScript/TypeScript project, I recommend you to use [oxlint](https://oxc.rs/) and, if you need simple custom rules, [ast-grep](https://ast-grep.github.io/).
