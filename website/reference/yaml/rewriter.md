# Rewriter

Rewriter is a powerful, and experimental, feature that allows you to manipulate the code in a more complex way.

ast-grep rule has a `rewriters` field which is a list of rewriter objects that can be used to transform code of specific nodes matched by meta-variables.

A rewriter rule is similar to ordinary ast-grep rule, except that:

* It only has `id`, `rule`, `constraints`, `transform`, `utils`, and `fix` fields.
* `id`, `rule` and `fix` are required in rewriter.
* `rewriters` can only be used in [`rewrite`](/reference/yaml/transformation.html#rewrite) transformation.
* Meta-variables defined in one `rewriter` are not accessible in other `rewriter` or the original rule.
* `utils` and `transform` are independent similar to meta-variables. That is, these two fields can only be used by the defining rewriter.
* You can use other rewriters in a rewriter rule's `transform` section if they are defined in the same `rewriter` list.

:::warning Consider ast-grep API
Rewriters are an advanced feature and should be used with caution, and it is experimental at the moment. If possible, you can use ast-grep's [API](/guide/api-usage.html) as an alternative.
:::

Please ask questions in [GitHub Discussions](https://github.com/ast-grep/ast-grep/discussions) or [discord](https://discord.com/invite/4YZjf6htSQ) for help.

## `id`
* type: `String`
* required: true

## `rule`
* type: `Rule`
* required: true

The object specify the method to find matching AST nodes. See details in [rule object reference](/reference/rule.html).

## `fix`
* type: `String` or `FixConfig`
* required: true

A pattern or a `FixConfig` object to auto fix the issue. See details in [fix object reference](/reference/yaml/fix.html).

## `constraints`
* type: `HashMap<String, Rule>`
* required: false

Additional meta variables pattern to filter matches. The key is matched meta variable name without `$`. The value is a [rule object](/reference/rule.html).

## `transform`
* type: `HashMap<String, Transformation>`
* required: false

A dictionary to manipulate meta-variables. The dictionary key is the new variable name.
The dictionary value is a transformation object that specifies how meta var is processed.

**Note: variables defined `transform` are only available in the `rewriter` itself.**

## `utils`
* type: `HashMap<String, Rule>`
* required: false

A dictionary of utility rules that can be used in `matches` locally.
The dictionary key is the utility rule id and the value is the rule object.
See [utility rule guide](/guide/rule-config/utility-rule).

**Note: util rules defined `transform` are only available in the `rewriter` itself.**

## Example

Suppose we want to rewrite a [barrel](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js) [import](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/) to individual imports in JavaScript. For example,

```JavaScript
import { A, B, C } from './module';
// rewrite the above to
import A from './module/a';
import B from './module/b';
import C from './module/c';
```

It is impossible to do this in ast-grep YAML without rewriters because ast-grep can only replace one node at a time with a string. We cannot process multiple imported identifiers like `A, B, C`.

However, rewriter rules can be applied to captured meta-variables' descendant nodes, which can achieve the _multiple node processing_.

**Our first step is to write a rule to capture the import statement.**

```yaml
rule:
  pattern: import {$$$IDENTS} from './module'
```

This will capture the imported identifiers `A, B, C` in `$$$IDENTS`.


**Next, we need to transform `$$$IDENTS` to individual imports.**

The idea is that we can find the identifier nodes in the `$$$IDENT` and rewrite them to individual imports.

```yaml
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  fix: import $IDENT from './module/$IDENT'
```

The `rewrite-identifier` above will rewrite the identifier node to individual imports. To illustrate, the rewriter will change identifier `A` to  `import A from './module/A'`.

Note the library path has the uppercase letter `A` same as the identifier at the end, but we want it to be a lowercase letter in the import statement.
The [`convert`](/reference/yaml/transformation.html#convert) operation in `transform` can be helpful in the rewriter rule as well.

```yaml
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  transform:
    LIB: { convert: { source: $IDENT, toCase: lowerCase } }
  fix: import $IDENT from './module/$LIB'
```

**We can now apply the rewriter to the matched variable `$$$IDENTS`.**

The `rewrite` will find identifiers in `$$$IDENTS`, as specified in `rewrite-identifier`'s rule,
and rewrite it to single import statement.

```yaml
transform:
  IMPORTS:
    rewrite:
      rewriters: [rewrite-identifer]
      source: $$$IDENTS
      joinBy: "\n"
```

Note the `joinBy` field in the `transform` section. It is used to join the rewritten import statements with a newline character.

**Finally, we can use the `IMPORTS` in the `fix` field to replace the original import statement.**

The final rule will be like this.

```yaml
id: barrel-to-single
language: JavaScript
rule:
  pattern: import {$$$IDENTS} from './module'
rewriters:
- id: rewrite-identifer
  rule:
    pattern: $IDENT
    kind: identifier
  transform:
    LIB: { convert: { source: $IDENT, toCase: lowerCase } }
  fix: import $IDENT from './module/$LIB'
transform:
  IMPORTS:
    rewrite:
      rewriters: [rewrite-identifer]
      source: $$$IDENTS
      joinBy: "\n"
fix: $IMPORTS
```

See the [playground link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJjb25maWciOiJydWxlOlxuICBwYXR0ZXJuOiBpbXBvcnQgeyQkJElERU5UU30gZnJvbSAnLi9tb2R1bGUnXG5yZXdyaXRlcnM6XG4tIGlkOiByZXdyaXRlLWlkZW50aWZlclxuICBydWxlOlxuICAgIHBhdHRlcm46ICRJREVOVFxuICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgdHJhbnNmb3JtOlxuICAgIExJQjogeyBjb252ZXJ0OiB7IHNvdXJjZTogJElERU5ULCB0b0Nhc2U6IGxvd2VyQ2FzZSB9IH1cbiAgZml4OiBpbXBvcnQgJElERU5UIGZyb20gJy4vbW9kdWxlLyRMSUInXG50cmFuc2Zvcm06XG4gIElNUE9SVFM6XG4gICAgcmV3cml0ZTpcbiAgICAgIHJld3JpdGVyczogW3Jld3JpdGUtaWRlbnRpZmVyXVxuICAgICAgc291cmNlOiAkJCRJREVOVFNcbiAgICAgIGpvaW5CeTogXCJcXG5cIlxuZml4OiAkSU1QT1JUUyIsInNvdXJjZSI6ImltcG9ydCB7IEEsIEIsIEMgfSBmcm9tICcuL21vZHVsZSc7In0=) for the complete example.
