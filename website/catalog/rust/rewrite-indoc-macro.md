## Rewrite `indoc!` macro <Badge type="tip" text="Has Fix" />


* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoicnVzdCIsInF1ZXJ5IjoiaW5kb2MhIHsgciNcIiQkJEFcIiMgfSIsInJld3JpdGUiOiJgJCQkQWAiLCJzdHJpY3RuZXNzIjoicmVsYXhlZCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicnVsZTogXG4gYW55OlxuIC0gcGF0dGVybjogJFYgPT09ICRTRU5TRVRJVkVXT1JEXG4gLSBwYXR0ZXJuOiAkU0VOU0VUSVZFV09SRCA9PT0gJFZcbmNvbnN0cmFpbnRzOlxuICBTRU5TRVRJVkVXT1JEOlxuICAgIHJlZ2V4OiBwYXNzd29yZCIsInNvdXJjZSI6ImZuIG1haW4oKSB7XG4gICAgaW5kb2MhIHtyI1wiXG4gICAgICAgIC5mb28ge1xuICAgICAgICAgICAgb3JkZXI6IDE7XG4gICAgICAgIH1cbiAgICBcIiN9O1xufSJ9)

### Description

This example, created from [a Tweet](https://x.com/zack_overflow/status/1885065128590401551), shows a refactoring operation being performed on Rust source code. The changes involve removing `indoc!` macro declarations while preserving the CSS-like content within them.

Previously, the same refactor is implemented by a _unreadable monster regex_ in vim syntax.

:::details Click to see the original regex (neovim, btw)

```vimscript
:%s/\v(indoc!|)(| )([|\{)r#"(([^#]+|\n+)+)"#/`\4`
```
I have to confess that I don't understand this regex even if I use neovim, btw.

Let Claude break it down piece by piece:

- `:%s/` - Vim substitution command for all lines
- `\v` - Very magic mode in vim for simpler regex syntax
- `(indoc!|)` - First capture group: matches either "indoc!" or nothing
- `(| )` - Second capture group: matches either empty string or a space
- `([|\{)` - Third capture group: matches either `[` or `{`
- `r#"` - Matches literal `r#"` (Rust raw string delimiter)
- `(([^#]+|\n+)+)` - Fourth capture group (nested):
  - `[^#]+` - One or more non-# characters
  - `|\n+` - OR one or more newlines
  - Outer `()+` makes this repeat one or more times
- `"#` - Matches the closing raw string delimiter
- \`\4\` - Replaces with the fourth capture group wrapped in backticks

This regex is designed to find Rust raw string literals (possibly wrapped in `indoc!` macro), capture their content, and replace the entire match with just the content wrapped in backticks. It's more precise than my previous explanation and matches the pattern you're showing.

:::

<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

```shell
ast-grep --pattern 'indoc! { r#"$$$A"# }' --rewrite '`$$$A`' sgtest.rs
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```rs {2-6}
fn main() {
    indoc! {r#"
        .foo {
            order: 1;
        }
    "#};
}
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```rs
fn main() {
    indoc! {r#" // [!code --]
    `.foo {    // [!code ++]
        order: 1;
    }
    "#}; // [!code --]
        `; // [!code ++]
}
```

### Contributed by
[Zack in SF](https://x.com/zack_overflow)
