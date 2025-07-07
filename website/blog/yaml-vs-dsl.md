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

However, recently I have received some feedback that YAML is __objectively__ not as good as DSL, and I would like to clarify some points.


The original argument is quoted as follows:

> While I see you're trying to dismiss it as a preference, I see it as a fundamental blocker. ast-grep has effectively built a DSL inside YAML. This becomes pretty apparent from your documentation, where you have to extensively explain how pattern syntax works, how metavariables work, etc.. You have to see that arguments such as "it's just YAML, no new syntax to learn" aren't entirely true either. Now IMO, if you're creating a DSL anyway, you're better off doing it properly than to go halfway. With GritQL we get syntax highlighting for all the aspects of the DSL, which I think is a significant boost. I think GritQL queries are significantly easier to read than ast-grep's mix of DSL of YAML.

## Direct rebuttal to the argument

> effectively built a DSL inside YAML

This is a misunderstanding of DSL and abstraction. To model Abstract Syntax Tree (AST) manipulation, you will have to have some form of concepts, such as pattern, metavariable, etc. This is true for both DSL and YAML. You cannot cut more concepts out of the tool even if you have [Occam's razor](https://en.wikipedia.org/wiki/Occam%27s_razor).

ast-grep does support pattern. It is a concept to match a strcture that contains multiple AST nodes, which makes it easier to write a rule. You can use `kind`/`has`/`all` to simulate pattern matching. But it does not mean that ast-grep should cut the concept of pattern since it looks like a DSL. In fact, ast-grep's pattern is just one of its [atomic rules](/guide/rule-config/atomic-rule.html). It does not meant to be a special embedded DSL.

> your documentation, where you have to extensively explain how pattern syntax works, how pattern syntax works, how metavariables work

As stated before, pattern makes ast-grep users' life easier. Explaining how pattern works is necessary to help users understand how to write rules. This is not a sign of a DSL being necessary, but rather a sign of the limitation of pattern: it is not general enough to cover all cases, and you have to communicate to your users how pattern works in your system. For example, see this [tweet](https://x.com/hd_nvim/status/1941876968363798766) about how to write a pattern to match `functtion` declation in JavaScript.

(an [ad-hominen](https://en.wikipedia.org/wiki/Ad_hominem) note: it is ironic to see this argument from a tool without proper documentation. I cannot suspend my suspect whether the author has used pattern to write non-trivial rules at all.)


> if you're creating a DSL anyway, you're better off doing it properly than to go halfway

This argument is a [slippery slope fallacy](https://en.wikipedia.org/wiki/Slippery_slope). Using pattern syntax does not mean that other rules should also be written in DSL. Again, pattern is just one of ast-grep's rules. ast-grep compose smaller rules to form more complex rules. ast-grep's rule system is not DSL based, but rather using YAML's key-value pair to represent rules. Using syntax in one rule does not imply that all rules should be combined in DSL.

Using one concept in your library, framework or tool does not imply that you have to design a whole new syntax for it. The similar comparison will be frontend frameworks. Some frameworks like React and Vue use [hook](https://react.dev/reference/react/hooks) or [signals](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob) to represent state changes. But using these building blocks does not grant the verdict to design a new language for your frontend framework. Even the most avant-garde company only introduces [new syntax](https://flow.org/en/docs/react/hook-syntax/) in JavaScript, not inventing a new language.


> I think GritQL queries are significantly easier to read than ast-grep's mix of DSL of YAML.

This is a subjective opinion, instead of an fundamental blocker. The author failed to capture the difference between _"pattern syntax"_ and _"rule system"_. ast-grep's rule system is YAML based, so it is easier to write a [well-formed](https://en.wikipedia.org/wiki/Well-formedness) rule. Instead, DSL based rule system using their own syntax and can be more difficult to write a valid rule, especially for beginners.

We can also see using DSL is not subjectively better than YAML as well.

## Subjective Comparison of DSL
