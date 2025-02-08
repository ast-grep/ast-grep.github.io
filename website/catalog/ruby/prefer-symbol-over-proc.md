## Prefer Symbol over Proc <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1YnkiLCJxdWVyeSI6IiRMSVNULnNlbGVjdCB7IHwkVnwgJFYuJE1FVEhPRCB9IiwicmV3cml0ZSI6IiRMSVNULnNlbGVjdCgmOiRNRVRIT0QpIiwiY29uZmlnIjoiaWQ6IHByZWZlci1zeW1ib2wtb3Zlci1wcm9jXG5ydWxlOlxuICBwYXR0ZXJuOiAkTElTVC4kSVRFUiB7IHwkVnwgJFYuJE1FVEhPRCB9XG5sYW5ndWFnZTogUnVieVxuY29uc3RyYWludHM6XG4gIElURVI6XG4gICAgcmVnZXg6ICdtYXB8c2VsZWN0fGVhY2gnXG5maXg6ICckTElTVC4kSVRFUigmOiRNRVRIT0QpJ1xuIiwic291cmNlIjoiWzEsIDIsIDNdLnNlbGVjdCB7IHx2fCB2LmV2ZW4/IH1cbigxLi4xMDApLmVhY2ggeyB8aXwgaS50b19zIH1cbm5vdF9saXN0Lm5vX21hdGNoIHsgfHZ8IHYuZXZlbj8gfVxuIn0=)

### Description

Ruby has a more concise symbol shorthand `&:` to invoke methods.
This rule simplifies `proc` to `symbol`.
This example is inspired by this [dev.to article](https://dev.to/baweaver/future-of-ruby-ast-tooling-9i1).


<!-- Use YAML in the example. Delete this section if use pattern. -->
### YAML
```yaml
id: prefer-symbol-over-proc
language: ruby
rule:
  pattern: $LIST.$ITER { |$V| $V.$METHOD }
constraints:
  ITER:
    regex: 'map|select|each'
fix: '$LIST.$ITER(&:$METHOD)'
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```rb {1,2}
[1, 2, 3].select { |v| v.even? }
(1..100).each { |i| i.to_s }
not_list.no_match { |v| v.even? }
```

### Diff
<!-- use # [!code --] and # [!code ++] to annotate diff -->
```rb
[1, 2, 3].select { |v| v.even? } # [!code --]
[1, 2, 3].select(&:even?) # [!code ++]
(1..100).each { |i| i.to_s } # [!code --]
(1..100).each(&:to_s) # [!code ++]

not_list.no_match { |v| v.even? }
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim)