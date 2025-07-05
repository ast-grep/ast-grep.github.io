# Handle Error Reports

## Severity Levels

ast-grep supports these severity levels for rules:

- `error`: The rule will report an error and fails a scan.
- `warning`: The rule will report a warning.
- `info`: The rule will report an informational message.
- `hint`: The rule will report a hint. This is the default severity level.
- `off`: The rule will disable the rule at all.

If an `error` rule is triggered, `ast-grep scan` will exit with a non-zero status code. This is useful for CI/CD pipelines to fail the build when a rule is violated.

You can configure the severity level of a rule in the rule file:

```yaml
id: rule-id
severity: error
# ... more fields
```

## Override Severity on CLI

You can override the severity level of a rule on the command line. This is useful when you want to change the severity level of a rule for a specific scan.

```bash
ast-grep scan --error rule-id --warning other-rule-id
```

You can use multiple `--error`, `--warning`, `--info`, `--hint`, and `--off` flags to override multiple rules.

## Ignore Linting Error

It is possible to ignore a single line of code in ast-grep's scanning. A developer can suppress ast-grep's error by adding `ast-grep-ignore` above the line that triggers the issue, or on the same line.

The suppression comment has the following format, in JavaScript for example:

```javascript {1,7}
console.log('hello') // match
// ast-grep-ignore
console.log('suppressed') // suppressed
// ast-grep-ignore: no-console
console.log('suppressed') // suppressed
// ast-grep-ignore: other-rule
console.log('world') // match

// Same line suppression
console.log('suppressed') // ast-grep-ignore
console.log('suppressed') // ast-grep-ignore: no-console
```

See the [playground](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiRDQUxMRVIgOj0gJmZvb3t9IiwicmV3cml0ZSI6IiIsImNvbmZpZyI6ImlkOiBuby1jb25zb2xlXG5sYW5ndWFnZTogSmF2YVNjcmlwdFxucnVsZTpcbiAgcGF0dGVybjogY29uc29sZS5sb2coJEEpIiwic291cmNlIjoiY29uc29sZS5sb2coJ2hlbGxvJykgIC8vIG1hdGNoXG4vLyBhc3QtZ3JlcC1pZ25vcmVcbmNvbnNvbGUubG9nKCdzdXBwcmVzc2VkJykgLy8gc3VwcHJlc3NlZFxuLy8gYXN0LWdyZXAtaWdub3JlOiBuby1jb25zb2xlXG5jb25zb2xlLmxvZygnc3VwcHJlc3NlZCcpIC8vIHN1cHByZXNzZWRcbi8vIGFzdC1ncmVwLWlnbm9yZTogb3RoZXItcnVsZVxuY29uc29sZS5sb2coJ3dvcmxkJykgLy8gbWF0Y2hcbiJ9) in action.

These are the rules for suppression comments:

- A comment with the content `ast-grep-ignore` will suppress the following line/the same line's diagnostic.
- The magic word `ast-grep-ignore` alone will suppress _all_ kinds of diagnostics.
- `ast-grep-ignore: <rule-id>` can turn off specific rules.
- You can turn off multiple rules by providing a comma-separated list in the comment. e.g. `ast-grep-ignore: rule-1, rule-2`
- Suppression comments will suppress the next line diagnostic if and only if there is no preceding ASTs on the same line.

## File Level Suppression

You can also suppress all diagnostics in a file by adding a suppression comment at the top of the file followed by an empty line. This is useful when you want to ignore all diagnostics in a file.

For example, in JavaScript:

:::code-group

```javascript [Disable all rules]
// ast-grep-ignore

// This file will not be scanned by ast-grep
// note the empty line after the suppression comment.
debugger // this line will not be scanned
console.debug('debugging') // this line will not be scanned
```

```javascript{6} [Disable sepcific rules]
// ast-grep-ignore: no-debugger

// This file will not be scanned by ast-grep
// note the empty line after the suppression comment.
debugger // this line will not trigger error
console.debug('debugging') // this line will trigger error
```

:::

To suppress the whole file, there must be [two conditions](https://github.com/ast-grep/ast-grep/issues/1541#issuecomment-2573212686) met:

- The suppression comment is on the very first line of the file.
- AND the next line (second line in file) is empty

These conditions are designed for backward compatibility.

## Report Unused Suppressions

ast-grep can report unused suppression comments in your codebase. This is useful to keep your codebase clean and to avoid suppressing issues that are no longer relevant. An example report will look like this:

```diff
help[unused-suppression]: Unused 'ast-grep-ignore' directive.
- // ast-grep-ignore
+
```

`unused-suppression` itself behaves like a `hint` rule with auto-fix.
But it is enabled, by default, only **when all rules are enabled**.

More specifically, [these conditions](https://github.com/ast-grep/ast-grep/blob/553f5e5ac577b6d2e0904c423bb5dbd27804328b/crates/cli/src/scan.rs#L68-L73) must be met:

1. No rule is [disabled](/guide/project/severity.html#override-severity-on-cli) by the `--off` flag on the CLI. `severity: off` configured in the YAML rule file does not count.
2. The CLI [`--rule`](/reference/cli/scan.html#r-rule-rule-file) flag is not used.
3. The CLI [`--inline-rules`](/reference/cli/scan.html#inline-rules-rule-text) flag is not used.
4. The CLI [`--filter`](/reference/cli/scan.html#filter-regex) flag is not used.

:::tip Unused suppression report only happens in `ast-grep scan`
If a rule is skipped during a scan, it is possible to mistakenly report a suppression comment as unused.
So running specific rules or disabling rules will not trigger the unused suppression report.
:::

You can also override the severity level of the `unused-suppression` rule on the command line. This can change the default behavior or unused-suppression reporting.

```bash
# treat unused directive as error, useful in CI/CD
ast-grep scan --error unused-suppression
# enable report even not all rules are enabled
ast-grep --rule rule.yml scan --hint unused-suppression
```

## Inspect Rule Severity

Finally, ast-grep provides a CLI flag [`--inspect`](/reference/cli/scan.html#inspect-granularity) to debug what rules are enabled and their severity levels. This is useful to understand the rule configuration and to debug why a rule is not triggered.

```bash
ast-grep scan --inspect entity
```

Example standard error debugging output:

```
sg: entity|rule|no-dupe-class-members: finalSeverity=Error
sg: entity|rule|no-new-symbol: finalSeverity=Error
sg: entity|rule|no-cond-assign: finalSeverity=Warning
sg: entity|rule|no-constant-condition: finalSeverity=Warning
sg: entity|rule|no-dupe-keys: finalSeverity=Error
sg: entity|rule|no-await-in-loop: finalSeverity=Warning
```
