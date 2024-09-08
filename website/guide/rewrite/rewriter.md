# Rewriter in Fix

`rewriters` allow you to apply rules to specific parts of the matching AST nodes.

ast-grep's `fix` will only replace the matched nodes, one node at a time.
But it is common to replace multiple nodes with different fixes at once. The `rewriters` field allows you to do this.

The basic workflow of `rewriters` is as follows:

1. Find a list of sub-nodes under a meta-variable that match different rewriters.
2. Generate a distinct fix for each sub-node based on the matched rewriter sub-rule.
3. Join the fixes together and store the string in a new metavariable for later use.

## Key Steps to Use Rewriters
To use rewriters, you have three steps.

**1. Define `rewriters` field in the Yaml rule root.**

```yaml
id: rewriter-demo
language: Python
rewriters:
- id: sub-rule
  rule: # some rule
  fix: # some fix
```

**2. Apply the defined rewriters to a metavariable via `transform`.**

```yaml
transform:
  NEW_VAR:
    rewrite:
    - rewriters: [sub-rule]
      source: $OLD_VAR
```

**3. Use other ast-grep fields to wire them together.**

```yaml
rule: { pattern: a = $OLD_VAR }
# ... rewriters and transform
fix: a = $NEW_VAR
```


## Rewriter Example

Let's see a contrived example: converting `dict` function call to dictionary literal in Python.

### General Idea

In Python, you can create a dictionary using the `dict` function or the `{}` literal.

```python
# dict function call
d = dict(a=1, b=2)
# dictionary literal
d = {'a': 1, 'b': 2}
```

We will use the `rewriters` field to convert the `dict` function call to a dictionary literal.

The recipe is to first find the `dict` function call. Then, extract the keyword arguments like `a=1` and transform them into a dictionary key-value pair `'a': 1`. Finally, we will replace the `dict` function call by combining these transformed pairs and wrapping them in a bracket.

The key step is extraction and transformation, which is done by the `rewriters` field.

### Define a Rewriter

Our goal is to find keyword arguments in the `dict` function call and transform them into dictionary key-value pairs.

So let's first define a rule to match the keyword arguments in the `dict` function call.

```yaml
rule:
  kind: keyword_argument
  all:
  - has:
      field: name
      pattern: $KEY
  - has:
      field: value
      pattern: $VAL
```

This rule can match the keyword arguments in the `dict` function call and extract key and value in the argument to meta-variables `$KEY` and `$VAL` respectively. [For example](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoic3RhcnRfdGFnIiwiY29uZmlnIjoicnVsZTpcbiAga2luZDoga2V5d29yZF9hcmd1bWVudFxuICBhbGw6XG4gIC0gaGFzOlxuICAgICAgZmllbGQ6IG5hbWVcbiAgICAgIHBhdHRlcm46ICRLRVlcbiAgLSBoYXM6XG4gICAgICBmaWVsZDogdmFsdWVcbiAgICAgIHBhdHRlcm46ICRWQUwiLCJzb3VyY2UiOiJkID0gZGljdChhPTEsIGI9MikifQ==), `dict(a=1)` will extract `a` to `$KEY` and `1` to `$VAL`.

Then, we define the rule as a rewriter and add fix field to transform the keyword argument to a dictionary key-value pair.

```yaml
rewriters:
- id: dict-rewrite
  rule:
    kind: keyword_argument
    all:
    - has:
        field: name
        pattern: $KEY
    - has:
        field: value
        pattern: $VAL
  fix: "'$KEY': $VAL"
```

You can see the `rewriters` field accepts a list of regular ast-grep rules. Rewriter rule must have an `id` field to identify the rewriter, a rule to specify the node to match, and a `fix` field to transform the matched node.

Applying the rule above alone will transform `a=1` to `'a': 1`. But it is not enough to replace the `dict` function call. We need to combine these pairs and wrap them in a bracket. We need to apply this rewriter to all keyword arguments and join them.

### Apply Rewriter

Now, we apply the rewriter to the `dict` function call. This is done by the `transform` field.

First, we match the `dict` function call with the pattern `dict($$$ARGS)`. The `$$$ARGS` is a special metavariable that matches all arguments of the function call. Then, we apply the rewriter `dict-rewrite` to the `$$$ARGS` and store the result in a new metavariable `LITERAL`.

```yaml
rule:
  pattern: dict($$$ARGS)        # match dict function call, capture $$$ARGS
transform:
  LITERAL:                      # the transformed code
    rewrite:
      rewriters: [dict-rewrite] # specify the rewriter defined above
      source: $$$ARGS           # apply rewriters to $$$ARGS arguments
```

ast-grep will first try match the `dict-rewrite` rule to each sub node inside `$$$ARGS`. If the node has a matching rule, ast-grep will extract the node specified by the meta-variables in the `dict-rewrite` rewriter rule. It will then generate a new string using the `fix`.
Finally, the generated strings replace the matched sub-nodes in the `$$$ARGS` and the new code is stored in the `LITERAL` metavariable.

For example, `dict(a=1, b=2)` will match the `$$$ARGS` as `a=1, b=2`. The rewriter will transform `a=1` to `'a': 1` and `b=2` to `'b': 2`. The final value of `LITERAL` will be `'a': 1, 'b': 2`.

### Combine and Replace

Finally, we combine the transformed keyword arguments and replace the `dict` function call.

```yaml
# define rewriters
rewriters:
- id: dict-rewrite
  rule:
    kind: keyword_argument
    all:
    - has:
        field: name
        pattern: $KEY
    - has:
        field: value
        pattern: $VAL
  fix: "'$KEY': $VAL"
# find the target node
rule:
  pattern: dict($$$ARGS)
# apply rewriters to sub node
transform:
  LITERAL:
    rewrite:
    - rewriters: [dict-rewrite]
      source: $$$ARGS
# combine and replace
fix: '{ $LITERAL }'
```
See the final result in [action](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGljdCgkJCRBUkdTKSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6IiMgZGVmaW5lIHJld3JpdGVyc1xucmV3cml0ZXJzOlxuLSBpZDogZGljdC1yZXdyaXRlXG4gIHJ1bGU6XG4gICAga2luZDoga2V5d29yZF9hcmd1bWVudFxuICAgIGFsbDpcbiAgICAtIGhhczpcbiAgICAgICAgZmllbGQ6IG5hbWVcbiAgICAgICAgcGF0dGVybjogJEtFWVxuICAgIC0gaGFzOlxuICAgICAgICBmaWVsZDogdmFsdWVcbiAgICAgICAgcGF0dGVybjogJFZBTFxuICBmaXg6IFwiJyRLRVknOiAkVkFMXCJcbiMgZmluZCB0aGUgdGFyZ2V0IG5vZGVcbnJ1bGU6XG4gIHBhdHRlcm46IGRpY3QoJCQkQVJHUylcbiMgYXBwbHkgcmV3cml0ZXJzIHRvIHN1YiBub2RlXG50cmFuc2Zvcm06XG4gIExJVEVSQUw6XG4gICAgcmV3cml0ZTpcbiAgICAgIHJld3JpdGVyczogW2RpY3QtcmV3cml0ZV1cbiAgICAgIHNvdXJjZTogJCQkQVJHU1xuIyBjb21iaW5lIGFuZCByZXBsYWNlXG5maXg6ICd7ICRMSVRFUkFMIH0nIiwic291cmNlIjoiZCA9IGRpY3QoYT0xLCBiPTIpIn0=).

## `rewriters` is Top Level

Every ast-grep rule can have one `rewriters` at top level. The `rewriters` accepts a list of rewriter rules.

Every rewriter rule is like a regular ast-grep rule with `fix`. These are required fields for a rewriter rule.

* `id`: A unique identifier for the rewriter to be referenced in the `rewrite` transformation field.
* `rule`: A rule object to match the sub node.
* `fix`: A string to replace the matched sub node.

Rewriter rule can also have other fields like `transform` and `constraints`. However, fields like `severity` and `message` are not available in rewriter rules. Generally, only [Finding](/reference/yaml.html#finding) and [Patching](/reference/yaml.html#patching) fields are allowed in rewriter rules.

## Apply Multiple Rewriters

Note that the `rewrite` transformation field can accept multiple rewriters. This allows you to apply multiple rewriters to different sub nodes.

If the `source` meta variable contains multiple sub nodes, each sub node will be transformed by the corresponding rewriter that matches the sub node.

Suppose we have two rewriters to rewrite numbers and strings.

```yaml
rewriters:
- id: rewrite-int
  rule: {kind: integer}
  fix: integer
- id: rewrite-str
  rule: {kind: string}
  fix: string
```

We can apply both rewriters to the same source meta-variable.

```yaml
rule: {pattern: '[$$$LIST]' }
transform:
  NEW_VAR:
    rewrite:
      rewriters: [rewrite-num, rewrite-str]
      source: $$$LIST
```

In this case, the `rewrite-num` rewriter will be applied to the integer nodes in `$$$LIST`, and the `rewrite-str` rewriter will be applied to the string nodes in `$$$LIST`.

The produced `NEW_VAR` will contain the transformed nodes from both rewriters. [For example](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGljdCgkJCRBUkdTKSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InJld3JpdGVyczpcbi0gaWQ6IHJld3JpdGUtaW50XG4gIHJ1bGU6IHtraW5kOiBpbnRlZ2VyfVxuICBmaXg6IGludGVnZXJcbi0gaWQ6IHJld3JpdGUtc3RyXG4gIHJ1bGU6IHtraW5kOiBzdHJpbmd9XG4gIGZpeDogc3RyaW5nXG5ydWxlOiB7cGF0dGVybjogJ1skJCRMSVNUXScgfVxudHJhbnNmb3JtOlxuICBORVdfVkFSOlxuICAgIHJld3JpdGU6XG4gICAgICByZXdyaXRlcnM6IFtyZXdyaXRlLWludCwgcmV3cml0ZS1zdHJdXG4gICAgICBzb3VyY2U6ICQkJExJU1RcbmZpeDogJE5FV19WQVIiLCJzb3VyY2UiOiJbMSwgJ2EnXSJ9), `[1, 'a']` will be transformed to `integer, string`.

:::tip Pro Tip
Using multiple rewriters can make you dynamically apply different rewriting logic to different sub nodes, based on the matching rules.
:::

In case multiple rewriters match the same sub node, the rewriter that appears first in the `rewriters` list will be applied first. Therefore, _**the order of rewriters in the `rewriters` list matters.**_

## Use Alternative Joiner

By default, ast-grep will generate the new rewritten string by replacing the text in the matched sub nodes. But you can also specify an alternative joiner to join the transformed sub nodes via `joinBy` field.

```yaml
transform:
  NEW_VAR:
    rewrite:
      rewriters: [rewrite-num, rewrite-str]
      source: $$$LIST
      joinBy: ' + '
```

This will transform `1, 2, 3` to `integer + integer + integer`.

## Philosophy behind Rewriters

You can see a more detailed design philosophy, _Find and Patch_, behind rewriters in [this page](/advanced/find-n-patch.html).