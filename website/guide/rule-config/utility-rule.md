# Reusing Rule as Utility

ast-grep chooses to use YAML for rule representation. While this decision makes writing rule easier, it does impose some limitation on the rule authoring.
One of the limitation is that rule object cannot be reused. Let's see an example.

Suppose we want to match all literal values in JavaScript. We will need to match these kinds:

```yaml
any:
  - kind: 'false'
  - kind: undefined
  - kind: 'null'
  - kind: 'true'
  - kind: regex
  - kind: number
  - kind: string
```

If we want to match functions in different places using only the plain YAML file, we will have copy and paste the rule above for several times. Say, we want to match either literal values or an array of literal values:

```yaml
rule:
  any:
    - kind: 'false'
    - kind: undefined
    # more literal kinds omitted
    # ...
    - kind: array
      has:
        any:
          - kind: 'false'
          - kind: undefined
          # more literal kinds omitted
          # ...
```

ast-grep provides a mechanism to reuse common rules: `utils`. A utility rule is a rule defined in the `utils` section of the config file, or defined in a separate global rule file. It can be referenced in other rules using the composite rule `matches`. So the above example can be rewritten to:

```yaml
# define util rules using utils field
utils:
  # it accepts a string-keyed dictionary of rule object
  is-literal:               # rule-id
    any:                    # actual rule object
      - kind: 'false'
      - kind: undefined
      - kind: 'null'
      - kind: 'true'
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

## Local Rule Registration

TODO

## Global Rule Registration

TODO

## Using Rule with `matches`

TODO

## Recursive Rule Trick
TODO
