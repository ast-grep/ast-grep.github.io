# Fix

ast-grep has two kinds of fixes: `string` and `FixConfig`.

## String Fix

- type: `String`

A string fix is a string that will be used to replace the matched AST node.

You can use meta variables in the string fix to reference the matched AST node.

N.B. Fix string is not parsed by tree-sitter. So meta variables can appear anywhere in the string.

Example:

```yaml
rule:
  pattern: console.log($$$ARGS)
fix: logger.log($$$ARGS)
```

## `FixConfig`

- type: `Object`

A `FixConfig` is an advanced object configuration that specifies how to fix the matched AST node.

ast-grep rule can only fix one target node at one time by replacing the target node text with a new string.
This works fine for function statement/calls but it has always been problematic for list-item like items in an array, key-value pairs in a dictionary. We cannot delete an item completely because we also need to delete the surrounding comma.

`FixConfig` is designed to solve this problem. It allows you to specify a template string and two additional rules to expand the matched AST node to the start and end of the matched AST node.

It has the following fields:

### `template`

- type: `String`

This is the same as the string fix.

### `expandStart`

- type: `Rule`

A rule object, which is a rule object with one additional field `stopBy`.

The fixing range's start will be expanded until the rule is not met.

### `expandEnd`

- type: `Rule`

A rule object, which is a rule object with one additional field `stopBy`.

The fixing range' end start will be expanded until the rule is not met.

Example:

```yaml
rule:
  kind: pair
  has:
    field: key
    regex: Remove
# remove the key-value pair and its comma
fix:
  template: ''
  expandEnd: { regex: ',' } # expand the range to the comma
```
