## Rust 2024 Let-Chain Candidate

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1c3QiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6ImlkOiBydXN0LTIwMjQtbGV0LWNoYWluLWNhbmRpZGF0ZVxubGFuZ3VhZ2U6IFJ1c3RcbnNldmVyaXR5OiBoaW50XG5tZXNzYWdlOiBuZXN0ZWQgaWYgY29uZGl0aW9ucyBjYW4gYmUgY29sbGFwc2VkIGludG8gYSBSdXN0IDIwMjQgbGV0LWNoYWluXG5cbnV0aWxzOlxuICAjIFRoZSBuZXN0ZWQgaWYgc3RhdGVtZW50IHNob3VsZCBiZSB0aGUgb25seSBzdGF0ZW1lbnQgaW4gaXRzIGJsb2NrLlxuICBzb2xlLWNoaWxkOlxuICAgIGFsbDpcbiAgICAgIC0gbnRoQ2hpbGQ6IDFcbiAgICAgIC0gbnRoQ2hpbGQ6XG4gICAgICAgICAgcG9zaXRpb246IDFcbiAgICAgICAgICByZXZlcnNlOiB0cnVlXG5cbiAgIyBMZXQtY2hhaW5zIGNhbiBvbmx5IHByZXNlcnZlIGJlaGF2aW9yIHdoZW4gdGhlcmUgaXMgbm8gZWxzZSBicmFuY2guXG4gIGlmLW5vLWVsc2U6XG4gICAga2luZDogaWZfZXhwcmVzc2lvblxuICAgIG5vdDpcbiAgICAgIGhhczpcbiAgICAgICAgZmllbGQ6IGFsdGVybmF0aXZlXG4gICAgICAgIGtpbmQ6IGVsc2VfY2xhdXNlXG5cbiAgIyBBdCBsZWFzdCBvbmUgc2lkZSBvZiB0aGUgbmVzdGVkIGlmIHBhaXIgbXVzdCBiZSBhbiBpZiBsZXQuXG4gIGlmLWxldC1uby1lbHNlOlxuICAgIG1hdGNoZXM6IGlmLW5vLWVsc2VcbiAgICBoYXM6XG4gICAgICBmaWVsZDogY29uZGl0aW9uXG4gICAgICBraW5kOiBsZXRfY29uZGl0aW9uXG5cbiAgIyBNYXRjaCBhbiBpbm5lciBpZiB0aGF0IGlzIHRoZSBzb2xlIHN0YXRlbWVudCBpbnNpZGUgdGhlIG91dGVyIGlmIGJsb2NrLlxuICBzb2xlLWlubmVyLWlmLXN0bXQ6XG4gICAga2luZDogZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgICBtYXRjaGVzOiBzb2xlLWNoaWxkXG4gICAgaGFzOlxuICAgICAgbWF0Y2hlczogaWYtbm8tZWxzZVxuXG4gICMgU2FtZSBhcyBhYm92ZSwgYnV0IHJlcXVpcmUgdGhlIGlubmVyIGlmIHRvIGJlIGFuIGlmIGxldC5cbiAgc29sZS1pbm5lci1pZi1sZXQtc3RtdDpcbiAgICBraW5kOiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIG1hdGNoZXM6IHNvbGUtY2hpbGRcbiAgICBoYXM6XG4gICAgICBtYXRjaGVzOiBpZi1sZXQtbm8tZWxzZVxuXG5ydWxlOlxuICAjIFN0YXJ0IGZyb20gYW4gb3V0ZXIgaWYgd2l0aG91dCBhbiBlbHNlIGJyYW5jaC5cbiAgbWF0Y2hlczogaWYtbm8tZWxzZVxuICAjIEl0cyBkaXJlY3QgY29uc2VxdWVuY2UgYmxvY2sgbXVzdCBjb250YWluIGV4YWN0bHkgb25lIGlubmVyIGlmIHN0YXRlbWVudC5cbiAgaGFzOlxuICAgIGZpZWxkOiBjb25zZXF1ZW5jZVxuICAgIGtpbmQ6IGJsb2NrXG4gICAgaGFzOlxuICAgICAgbWF0Y2hlczogc29sZS1pbm5lci1pZi1zdG10XG4gICMgRWl0aGVyIHRoZSBvdXRlciBjb25kaXRpb24gb3IgdGhlIGlubmVyIGNvbmRpdGlvbiBtdXN0IGJpbmQgd2l0aCBpZiBsZXQuXG4gIGFueTpcbiAgICAtIG1hdGNoZXM6IGlmLWxldC1uby1lbHNlXG4gICAgLSBoYXM6XG4gICAgICAgIGZpZWxkOiBjb25zZXF1ZW5jZVxuICAgICAgICBraW5kOiBibG9ja1xuICAgICAgICBoYXM6XG4gICAgICAgICAgbWF0Y2hlczogc29sZS1pbm5lci1pZi1sZXQtc3RtdCIsInNvdXJjZSI6ImZuIGhhbmRsZV9yZXF1ZXN0KHVzZXI6IE9wdGlvbjxVc2VyPiwgY2ZnOiBDb25maWcpIHtcbiAgICBpZiBsZXQgU29tZSh1c2VyKSA9IHVzZXIge1xuICAgICAgICBpZiB1c2VyLmlzX2FjdGl2ZSgpIHtcbiAgICAgICAgICAgIGdyYW50X2FjY2Vzcyh1c2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIGNmZyEoZGVidWdfYXNzZXJ0aW9ucykge1xuICAgICAgICBpZiBsZXQgU29tZShwYXRoKSA9IGNmZy5sb2dfcGF0aCgpIHtcbiAgICAgICAgICAgIGVuYWJsZV9maWxlX2xvZ2dpbmcocGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPSzogdGhlIGlubmVyIGlmIGlzIG5vdCB0aGUgb25seSBzdGF0ZW1lbnQgaW4gdGhlIGJsb2NrLlxuICAgIGlmIGxldCBTb21lKHVzZXIpID0gY3VycmVudF91c2VyKCkge1xuICAgICAgICBhdWRpdCgmdXNlcik7XG4gICAgICAgIGlmIHVzZXIuaXNfYWRtaW4oKSB7XG4gICAgICAgICAgICBncmFudF9hZG1pbih1c2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9LOiB0aGlzIGhhcyBhbiBlbHNlIGJyYW5jaC5cbiAgICBpZiBsZXQgU29tZShwYXRoKSA9IGNmZy5jYWNoZV9wYXRoKCkge1xuICAgICAgICBpZiBwYXRoLmV4aXN0cygpIHtcbiAgICAgICAgICAgIGxvYWRfY2FjaGUocGF0aCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZWJ1aWxkX2NhY2hlKCk7XG4gICAgfVxufSJ9)

### Description

Rust 2024 supports [`let` conditions in boolean chains](https://doc.rust-lang.org/edition-guide/rust-2024/let-chains.html), so an `if let` wrapping a single nested `if` can often be collapsed into one condition.

This rule reports the outer `if` only when neither branch has an `else`, the outer block contains a single inner `if` statement, and either the outer or inner condition is an `if let`.

### YAML

```yaml
id: rust-2024-let-chain-candidate
language: Rust
severity: hint
message: nested if conditions can be collapsed into a Rust 2024 let-chain

utils:
  # The nested if statement should be the only statement in its block.
  sole-child:
    all:
      - nthChild: 1
      - nthChild:
          position: 1
          reverse: true

  # Let-chains can only preserve behavior when there is no else branch.
  if-no-else:
    kind: if_expression
    not:
      has:
        field: alternative
        kind: else_clause

  # At least one side of the nested if pair must be an if let.
  if-let-no-else:
    matches: if-no-else
    has:
      field: condition
      kind: let_condition

  # Match an inner if that is the sole statement inside the outer if block.
  sole-inner-if-stmt:
    kind: expression_statement
    matches: sole-child
    has:
      matches: if-no-else

  # Same as above, but require the inner if to be an if let.
  sole-inner-if-let-stmt:
    kind: expression_statement
    matches: sole-child
    has:
      matches: if-let-no-else

rule:
  # Start from an outer if without an else branch.
  matches: if-no-else
  # Its direct consequence block must contain exactly one inner if statement.
  has:
    field: consequence
    kind: block
    has:
      matches: sole-inner-if-stmt
  # Either the outer condition or the inner condition must bind with if let.
  any:
    - matches: if-let-no-else
    - has:
        field: consequence
        kind: block
        has:
          matches: sole-inner-if-let-stmt
```

### Example

```rs {2,8}
fn handle_request(user: Option<User>, cfg: Config) {
    if let Some(user) = user {
        if user.is_active() {
            grant_access(user);
        }
    }

    if cfg!(debug_assertions) {
        if let Some(path) = cfg.log_path() {
            enable_file_logging(path);
        }
    }

    // OK: the inner if is not the only statement in the block.
    if let Some(user) = current_user() {
        audit(&user);
        if user.is_admin() {
            grant_admin(user);
        }
    }

    // OK: this has an else branch.
    if let Some(path) = cfg.cache_path() {
        if path.exists() {
            load_cache(path);
        }
    } else {
        rebuild_cache();
    }
}
```

### Contributed by

[Codex](https://openai.com/codex/) (GPT-5.5 high fast)
