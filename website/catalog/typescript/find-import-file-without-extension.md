## Find Import File without Extension

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoibGFuZ3VhZ2U6IFwianNcIlxucnVsZTpcbiAgcmVnZXg6IFwiL1teLl0rW14vXSRcIiAgXG4gIGtpbmQ6IHN0cmluZ19mcmFnbWVudFxuICBhbnk6XG4gICAgLSBpbnNpZGU6XG4gICAgICAgIHN0b3BCeTogZW5kXG4gICAgICAgIGtpbmQ6IGltcG9ydF9zdGF0ZW1lbnRcbiAgICAtIGluc2lkZTpcbiAgICAgICAgc3RvcEJ5OiBlbmRcbiAgICAgICAga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgIGhhczpcbiAgICAgICAgICBmaWVsZDogZnVuY3Rpb25cbiAgICAgICAgICByZWdleDogXCJeaW1wb3J0JFwiXG4iLCJzb3VyY2UiOiJpbXBvcnQgYSwge2IsIGMsIGR9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCBlIGZyb20gXCIuL290aGVyX2ZpbGUuanNcIjtcbmltcG9ydCBcIi4vZm9sZGVyL1wiO1xuaW1wb3J0IHt4fSBmcm9tIFwicGFja2FnZVwiO1xuaW1wb3J0IHt5fSBmcm9tIFwicGFja2FnZS93aXRoL3BhdGhcIjtcblxuaW1wb3J0KFwiLi9keW5hbWljMVwiKTtcbmltcG9ydChcIi4vZHluYW1pYzIuanNcIik7XG5cbm15X2Z1bmMoXCIuL3VucmVsYXRlZF9wYXRoX3N0cmluZ1wiKVxuXG4ifQ==)

### Description

In ECMAScript modules (ESM), the module specifier must include the file extension, such as `.js` or `.mjs`, when importing local or absolute modules. This is because ESM does not perform any automatic file extension resolution, unlike CommonJS modules tools such as Webpack or Babel. This behavior matches how import behaves in browser environments, and is specified by the [ESM module spec](https://stackoverflow.com/questions/66375075/node-14-ecmascript-modules-import-modules-without-file-extensions).

The rule finds all imports (static and dynamic) for files without a file extension.

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: find-import-file
language: js
rule:
  regex: "/[^.]+[^/]$"
  kind: string_fragment
  any:
    - inside:
        stopBy: end
        kind: import_statement
    - inside:
        stopBy: end
        kind: call_expression
        has:
          field: function
          regex: "^import$"
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```ts {1,5,7}
import a, { b, c, d } from './file'
import e from './other_file.js'
import './folder/'
import { x } from 'package'
import { y } from 'package/with/path'

import('./dynamic1')
import('./dynamic2.js')

my_func('./unrelated_path_string')
```

### Contributed by

[DasSurma](https://twitter.com/DasSurma) in [this tweet](https://x.com/DasSurma/status/1706213303331029277).
