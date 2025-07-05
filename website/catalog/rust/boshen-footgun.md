## Beware of char offset when iterate over a string <Badge type="tip" text="Has Fix" />

- [Playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoicnVzdCIsInF1ZXJ5IjoiJEEuY2hhcnMoKS5lbnVtZXJhdGUoKSIsInJld3JpdGUiOiIkQS5jaGFyX2luZGljZXMoKSIsImNvbmZpZyI6IiIsInNvdXJjZSI6ImZvciAoaSwgY2hhcikgaW4gc291cmNlLmNoYXJzKCkuZW51bWVyYXRlKCkge1xuICAgIHByaW50bG4hKFwiQm9zaGVuIGlzIGFuZ3J5IDopXCIpO1xufSJ9)

### Description

It's a common pitfall in Rust that counting _character offset_ is not the same as counting _byte offset_ when iterating through a string. Rust string is represented by utf-8 byte array, which is a variable-length encoding scheme.

`chars().enumerate()` will yield the character offset, while [`char_indices()`](https://doc.rust-lang.org/std/primitive.str.html#method.char_indices) will yield the byte offset.

```rs
let yes = "y̆es";
let mut char_indices = yes.char_indices();
assert_eq!(Some((0, 'y')), char_indices.next()); // not (0, 'y̆')
assert_eq!(Some((1, '\u{0306}')), char_indices.next());
// note the 3 here - the last character took up two bytes
assert_eq!(Some((3, 'e')), char_indices.next());
assert_eq!(Some((4, 's')), char_indices.next());
```

Depending on your use case, you may want to use `char_indices()` instead of `chars().enumerate()`.

### Pattern

```shell
ast-grep -p '$A.chars().enumerate()' \
   -r '$A.char_indices()' \
   -l rs
```

### Example

```rs {1}
for (i, char) in source.chars().enumerate() {
    println!("Boshen is angry :)");
}
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```rs
for (i, char) in source.chars().enumerate() { // [!code --]
for (i, char) in source.char_indices() { // [!code ++]
    println!("Boshen is angry :)");
}
```

### Contributed by

Inspired by [Boshen's Tweet](https://x.com/boshen_c/status/1719033308682870891)

![Boshen's footgun](https://pbs.twimg.com/media/F9s7mJHaYAEndnY?format=jpg&name=medium)
