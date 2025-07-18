# Reusing Rule as Utility

ast-grep chooses to use YAML for rule representation. While this decision makes writing rules easier, it does impose some limitations on the rule authoring.
One of the limitations is that rule objects cannot be reused. Let's see an example.

Suppose we want to match all literal values in JavaScript. We will need to match these kinds:

```yaml
any:
  - kind: "false"
  - kind: undefined
  - kind: "null"
  - kind: "true"
  - kind: regex
  - kind: number
  - kind: string
```

If we want to match functions in different places using only the plain YAML file, we will have to copy and paste the rule above several times. Say, we want to match either literal values or an array of literal values:

```yaml
rule:
  any:
    - kind: "false"
    - kind: undefined
    # more literal kinds omitted
    # ...
    - kind: array
      has:
        any:
          - kind: "false"
          - kind: undefined
          # more literal kinds omitted
          # ...
```

ast-grep provides a mechanism to reuse common rules: `utils`. A utility rule is a rule defined in the `utils` section of the config file, or in a separate global rule file. It can be referenced in other rules using the composite rule `matches`. So, the above example can be rewritten as:

```yaml
# define util rules using utils field
utils:
  # it accepts a string-keyed dictionary of rule object
  is-literal: # rule-id
    any: # actual rule object
      - kind: "false"
      - kind: undefined
      - kind: "null"
      - kind: "true"
      - kind: regex
      - kind: number
      - kind: string
rule:
  any:
    - matches: is-literal # reference the util!
    - kind: array
      has:
        matches: is-literal # reference it again!
```

There are two ways to define utility rules in ast-grep: _Local utility rules_ and _Global Utility Rules_. They are both used in the `matches` composite rules by their ids.

## Local Utility Rules

Local utility rules are defined in the `utils` field of the config file. `utils` is a string-keyed dictionary.

The keys of the dictionary is utility rules' identifiers, which will be later used in `matches`.
Note that local utility rule identifier cannot have the same name of another local utility rule. But a local utility rule
can have the same name of another global utility rule and override the global one.

The value of the dictionary is the rule object. You can define a local utility rule using the same syntax as the `rule` field.

**Local utility rules are only available in the config file where they are defined.**

For example, the following config file defines a local utility rule `is-literal`:

```yaml
utils:
  is-literal:
    any:
      - kind: "false"
      - kind: undefined
      - kind: "null"
      - kind: "true"
      - kind: regex
      - kind: number
      - kind: string
rule:
  matches: is-literal
```

The `matches` in `rule` will run the matcher rule `is-literal` against AST nodes.

Local rules must have the same language as their rule configuration file where utilities are defined. Local rules cannot have their separate `constraints` as well.

## Global Utility Rules

Global utility rules are defined in a separate file. But they are available across all rule configurations in the project.

To create global utility rules, you first need a proper ast-grep project setup like below.

```yml
my-awesome-project   # project root
  |- rules           # rule directory
  | |- my-rule.yml
  |- utils           # utils directory
  | |- is-literal.yml
  |- sgconfig.yml    # project configuration
```

Note the `utils` directory where all global utility rules will be stored. We also need to specify which directory is utility rules so that ast-grep can pick up.

In `sgconfig.yml`:

```yml
ruleDirs:
  - rules
utilDirs:
  - utils
```

Now we can define our global utility rule in the `is-literal.yml` file. A global utility rule looks like a regular rule file, but it can only have limited fields: `id`, `language`, `rule`, `constraints` and their own local rules `utils`.

```yaml
# is-literal.yml
id: is-literal
language: TypeScript
rule:
  any:
    - kind: "false"
    - kind: undefined
    - kind: "null"
    - kind: "true"
    - kind: regex
    - kind: number
    - kind: string
```

Contrary to local utility rule, you must define `id` and `language` in the global utility rule. The `id` is not defined as a dictionary key.

Global utility rule have their own local utility rules and these local rules can only be accessed in their defining global rule file. Similarly, global utility rules can have their own `constraints` as well.

Finally, a rule file, whether it is a utility rule or not, can have local utility rules with the same name of another global utility rule. Global utility rules are superseded by the local homonymous rule.

## Recursive Rule Trick

You can use a utility rule inside another utility. Besides rule reusing, this also opens the possibility of recursive rule.

For example, if we want to match all expressions that evaluate to number literal in JavaScript. We can use `kind: number` to match `123` or `1.23`. But how to match expressions in parenthesis like `(((123)))`?

Using `matches` and utility rule can solve this.

```yml
utils:
  is-number:
    any:
      - kind: number
      - kind: parenthesized_expression
        has:
          matches: is-number
rule:
  matches: is-number
```

If we matches `(123)` with this rule, we will first match the `kind: parenthesized_expression` with a direct child that also matches `is-number` rule. This will make us match `123` with `is-number` which will succeed because `kind: number` matches the number literal.

Using `matches` and recursive utility rule can unlock a lot of sophisticated usage of rule. But there is one thing you need to bear in mind:

:::danger Dependency Cycle is not allowed
Rule cannot have a cyclic dependency when using `matches`. That is, a rule cannot transitively reference itself in its composite components.
:::

A dependency cycle in rule will cause infinite recursion and make ast-grep stuck in one AST node without any progression.

However, you can use self-referencing rule in relational components like `inside` or `has`. A curious reader can try to answer why this is okay.
