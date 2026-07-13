# Config Cheat Sheet

This cheat sheet provides a concise overview of ast-grep's linter rule YAML configuration.  It's designed as a handy reference for common usage.

<script setup>
import CheatSheet from '../src/cheatsheet/SheetTable.vue'
import Item from '../src/cheatsheet/Item.vue'
</script>


## Basic Information

Core details that identify and define your rule and miscellaneous keys for documentation and custom data.

<CheatSheet title="ℹ️ Basic Information" variant="info">
<Item>

```yaml
id: no-console-log
```

🆔 A unique, descriptive identifier for the rule.

</Item>

<Item>

```yaml
language: JavaScript
```

🌐 The programming language the rule applies to.

</Item>


<Item>

```yaml
url: 'https://doc.link/'
```
🔗 A URL to the rule's documentation.

</Item>


<Item>

```yaml
metadata: { author: 'John Doe' }
```

📓 metadata	A dictionary for custom data related to the rule.

</Item>

</CheatSheet>

## Finding

Keys for specifying what code to search for.

<CheatSheet title="🔍 Finding Code" variant="danger">

<Item>

```yaml
rule:
  pattern: 'console.log($$$ARGS)'
```

🎯 The core `rule` to find matching AST nodes.

</Item>

<Item>

```yaml
constraints:
  ARG: { kind: 'string' }
```

⚙️ Additional `constraints` rules to filter meta-variable matches.

</Item>

<Item>

```yaml
utils:
  is-react:
    kind: function_declaration
    has: { kind: jsx_element }
```

🛠️ A dictionary of reusable utility rules. Use them in `matches` to modularize your rules.

</Item>

</CheatSheet>


## Patching

Keys for defining how to automatically fix the found code.


<CheatSheet title="🛠️ Patching Code" variant="tip">

<Item>

```yaml
transform:
  NEW_VAR:
    substring: {endChar: 1, source: $V}
```

🎩 `transform` meta-variables before they are used in `fix`.

</Item>

<Item>

```yaml
transform:
  NEW_VAR: substring($V, endChar=1)
```

🎩 `transform` also accepts string form.

</Item>

<Item>

```yaml
fix: "logger.log($$$ARGS)"
```

🔧 A `fix` string to auto-fix the matched code.

</Item>

<Item>

```yaml
fix:
  template: "logger.log($$$ARGS)"
  expandEnd: { regex: ',' }
```

🔧 Fix also accepts `FixConfig` object.

</Item>

<Item>

```yaml
rewriters:
- id: remove-quotes
  rule: { pattern: "'$A'" }
  fix: "$A"
```

✍️ A list of `rewriters` for complex transformations.

</Item>

</CheatSheet>

## Linting

Keys for configuring the messages and severity of reported issues.

<CheatSheet title="🚦 Linting" variant="warning">

<Item>

```yaml
severity: warning
```

⚠️ The `severity` level of the linting message.

</Item>

<Item>

```yaml
message: "Avoid using $MATCH in production."
```

💬 A concise `message` explaining the rule. Matched $VAR can be used.

</Item>

<Item>

```yaml
note:
  Use a _logger_ instead of `console`
```

📌 More detailed `note`. It supports Markdown format.

</Item>

<Item>

```yaml
labels:
  ARG:
    style: 'primary'
    message: 'The argument to log'
```

🎨 Customized `labels` for highlighting parts of the matched code.

</Item>

<Item>

```yaml
files: ['src/**/*.js']
```

✅ Glob `files` patterns to include files for the rule.

</Item>

<Item>

```yaml
files:
  - glob: 'README.md'
    caseInsensitive: true
```

✅ Use object syntax for case-insensitive glob matching.

</Item>

<Item>

```yaml
ignores: ['test/**/*.js']
```

❌ Glob patterns to exclude files from the rule.

</Item>

</CheatSheet>
