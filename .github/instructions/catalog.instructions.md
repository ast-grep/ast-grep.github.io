---
applyTo: "website/catalog/**/*.md"
---

# Catalog Instructions

These instructions apply specifically to markdown files in the `website/catalog/` directory and help with creating and managing ast-grep rule examples.

## Rule Creation Workflow

When creating or modifying catalog rules, follow this structured approach:

### 1. Determine Example Language
- Identify the programming language for the rule example
- Ensure the language folder exists in `website/catalog/` (e.g., `typescript/`, `python/`, `rust/`)
- If the language folder doesn't exist, create it with an `index.md` file

### 2. Determine Rule Format
Choose between two formats:
- **Pattern**: Use ast-grep's pattern syntax for simple rules
- **YAML**: Use YAML configuration for complex rules with multiple conditions

### 3. Use Rule Template
- Base new rules on `website/catalog/rule-template.md`
- Include all required sections:
  - Title with optional `<Badge type="tip" text="Has Fix" />` if rule has a fix
  - Playground link
  - Description
  - Pattern OR YAML section (delete unused section)
  - Example code with highlighted lines
  - Diff section (if rule has a fix)
  - Contributed by section

### 4. Include Rule in Language Index
- Add the new rule to the language folder's `index.md` using the include syntax:
  ```markdown
  <!--@include: ./rule-filename.md-->
  ```
- Place includes in appropriate order within the index file

### 5. Required Components
Ensure every rule has:
- **Example code**: Realistic code that demonstrates the pattern
- **Rule/Pattern**: Either a pattern or YAML configuration
- **Playground link**: URL to test the rule in the ast-grep playground
- **Clear description**: Concise explanation of what the rule does and why it's useful

### 6. Content Guidelines
- **Descriptions**: Keep them clear, short, and explain the purpose
- **Examples**: Use realistic code that developers would encounter
- **Highlighting**: Use `{lineNum}` syntax to highlight matched lines in examples
- **Diff annotations**: Use `// [!code --]` and `// [!code ++]` for before/after code
- **Badges**: Add `<Badge type="tip" text="Has Fix" />` to rule titles that include fixes

### 7. Fix Rules
If the rule includes a fix/rewrite capability:
- Add the "Has Fix" badge to the title
- Include a "Diff" section showing before/after code
- Ensure the fix is demonstrated in the playground link

## File Naming
- Use kebab-case for rule filenames (e.g., `no-await-in-promise-all.md`)
- Make filenames descriptive of the rule's purpose
- Keep filenames concise but clear

## Language-Specific Notes
- **TypeScript vs TSX**: These are different parsers - TSX allows JSX elements
- **Include syntax**: Always use `<!--@include: ./filename.md-->` format
- **Language folders**: Each language should have its own folder with an `index.md`

## Quality Standards
- Test rules in the playground before submitting
- Ensure examples are syntactically correct
- Verify playground links work correctly
- Use consistent formatting across all rules
- Provide proper attribution in "Contributed by" section

## Example Structure
```markdown
## Rule Name <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#...)

### Description
Clear explanation of what the rule does and why it's useful.

### YAML
```yaml
id: rule-id
language: typescript
rule:
  pattern: pattern here
fix: fix pattern
```

### Example
```ts {1,3}
// Example code with highlighted lines
```

### Diff
```ts
old code // [!code --]
new code // [!code ++]
```

### Contributed by
[Author Name](https://link)
```