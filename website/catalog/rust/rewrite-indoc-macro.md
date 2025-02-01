## Rewrite `indoc!` macro <Badge type="tip" text="Has Fix" />


* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoicnVzdCIsInF1ZXJ5IjoiaW5kb2MhIHsgciNcIiQkJEFcIiMgfSIsInJld3JpdGUiOiJgJCQkQWAiLCJzdHJpY3RuZXNzIjoicmVsYXhlZCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoicnVsZTogXG4gYW55OlxuIC0gcGF0dGVybjogJFYgPT09ICRTRU5TRVRJVkVXT1JEXG4gLSBwYXR0ZXJuOiAkU0VOU0VUSVZFV09SRCA9PT0gJFZcbmNvbnN0cmFpbnRzOlxuICBTRU5TRVRJVkVXT1JEOlxuICAgIHJlZ2V4OiBwYXNzd29yZCIsInNvdXJjZSI6ImZuIG1haW4oKSB7XG4gICAgaW5kb2MhIHtyI1wiXG4gICAgICAgIC5mb28ge1xuICAgICAgICAgICAgb3JkZXI6IDE7XG4gICAgICAgIH1cbiAgICBcIiN9O1xufSJ9)

### Description

This example, created from [a Tweet](https://x.com/zack_overflow/status/1885065128590401551), shows a refactoring operation being performed on Rust source code. The changes involve removing `indoc!` macro declarations while preserving the CSS-like content within them.

Previously, the same refactor is implemented by a _unreadable monster regex_ in vim syntax.

:::details Click to see the original regex (neovim, btw)

```vimscript
:%s/\v(indoc!|)(| )([|\{)r#"(([^#]+|\n+)+)"#/\4
```
I have to confess that I don't understand this regex even if I use neovim, btw.

Let Claude break it down piece by piece:

- `:%s/` - This is a vim/sed substitution command
- `\v` - Very magic mode in vim, making special characters active by default
- `(indoc!|)` - Matches either "indoc!" or nothing (optional indoc!)
- `(| )([\{)` - Matches any spaces, parentheses, or curly braces
- `r#"` - Matches the literal raw string prefix in Rust
- `(([^#]+|\n+)+)` - This is the capture group that matches:
  - `[^#]+` - Any characters that aren't '#'
  - `|\n+` - Or one or more newlines
  - The outer `()+` makes it match one or more of these sequences
- `"#` - Matches the raw string suffix
- `/\4` - Replaces the entire match with the contents of the 4th capture group

This regex appears to be designed to extract the content from within Rust raw string literals that may or may not be wrapped in the `indoc!` macro.

:::

<!-- Use pattern in the example. Delete this section if use YAML. -->
### Pattern

```shell
ast-grep --pattern 'indoc! { r#"$$$A"# }' --rewrite '$$$A' sgtest.rs
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
