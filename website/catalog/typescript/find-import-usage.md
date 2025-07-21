## Find Import Usage

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoicmVsYXhlZCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicnVsZTpcbiAgIyB0aGUgdXNhZ2VcbiAga2luZDogaWRlbnRpZmllclxuICBwYXR0ZXJuOiAkTU9EXG4gICMgaXRzIHJlbGF0aW9uc2hpcCB0byB0aGUgcm9vdFxuICBpbnNpZGU6XG4gICAgc3RvcEJ5OiBlbmRcbiAgICBraW5kOiBwcm9ncmFtXG4gICAgIyBhbmQgYmFjayBkb3duIHRvIHRoZSBpbXBvcnQgc3RhdGVtZW50XG4gICAgaGFzOlxuICAgICAga2luZDogaW1wb3J0X3N0YXRlbWVudFxuICAgICAgIyBhbmQgZGVlcGVyIGludG8gdGhlIGltcG9ydCBzdGF0ZW1lbnQgbG9va2luZyBmb3IgdGhlIG1hdGNoaW5nIGlkZW50aWZpZXJcbiAgICAgIGhhczpcbiAgICAgICAgc3RvcEJ5OiBlbmRcbiAgICAgICAga2luZDogaW1wb3J0X3NwZWNpZmllclxuICAgICAgICBwYXR0ZXJuOiAkTU9EICMgc2FtZSBwYXR0ZXJuIGFzIHRoZSB1c2FnZSBpcyBlbmZvcmNlZCBoZXJlIiwic291cmNlIjoiaW1wb3J0IHsgTW9uZ29DbGllbnQgfSBmcm9tICdtb25nb2RiJztcbmNvbnN0IHVybCA9ICdtb25nb2RiOi8vbG9jYWxob3N0OjI3MDE3JztcbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgY29uc3QgY2xpZW50ID0gbmV3IE1vbmdvQ2xpZW50KHVybCk7XG59XG4ifQ==)

### Description

It is common to find the usage of an imported module in a codebase. This rule helps you to find the usage of an imported module in your codebase.
The idea of this rule can be broken into several parts:

* Find the use of an identifier `$MOD`
* To find the import, we first need to find the root file of which `$MOD` is  `inside`
* The `program` file `has` an `import` statement
* The `import` statement `has` the identifier `$MOD`

<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
id: find-import-usage
language: typescript
rule:
  kind: identifier # ast-grep requires a kind
  pattern: $MOD   # the identifier to find
  inside: # find the root
    stopBy: end
    kind: program
    has: # and has the import statement
      kind: import_statement
      has: # look for the matching identifier
        stopBy: end
        kind: import_specifier
        pattern: $MOD # same pattern as the usage is enforced here
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```ts {4}
import { MongoClient } from 'mongodb';
const url = 'mongodb://localhost:27017';
async function run() {
  const client = new MongoClient(url);
}
```

### Contributed by
[Steven Love](https://github.com/StevenLove)
