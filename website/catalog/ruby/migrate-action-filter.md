## Migrate action_filter in Ruby on Rails <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1YnkiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoiIyBhc3QtZ3JlcCBZQU1MIFJ1bGUgaXMgcG93ZXJmdWwgZm9yIGxpbnRpbmchXG4jIGh0dHBzOi8vYXN0LWdyZXAuZ2l0aHViLmlvL2d1aWRlL3J1bGUtY29uZmlnLmh0bWwjcnVsZVxucnVsZTpcbiAgYW55OlxuICAgIC0gcGF0dGVybjogYmVmb3JlX2ZpbHRlciAkJCRBQ1RJT05cbiAgICAtIHBhdHRlcm46IGFyb3VuZF9maWx0ZXIgJCQkQUNUSU9OXG4gICAgLSBwYXR0ZXJuOiBhZnRlcl9maWx0ZXIgJCQkQUNUSU9OXG4gIGhhczpcbiAgICBwYXR0ZXJuOiAkRklMVEVSXG4gICAgZmllbGQ6IG1ldGhvZFxuZml4OiBcbiAgJE5FV19BQ1RJT04gJCQkQUNUSU9OXG50cmFuc2Zvcm06XG4gIE5FV19BQ1RJT046XG4gICAgcmVwbGFjZTpcbiAgICAgIHNvdXJjZTogJEZJTFRFUlxuICAgICAgcmVwbGFjZTogX2ZpbHRlclxuICAgICAgYnk6IF9hY3Rpb24iLCJzb3VyY2UiOiJjbGFzcyBUb2Rvc0NvbnRyb2xsZXIgPCBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcbiAgYmVmb3JlX2ZpbHRlciA6YXV0aGVudGljYXRlXG4gIGFyb3VuZF9maWx0ZXIgOndyYXBfaW5fdHJhbnNhY3Rpb24sIG9ubHk6IDpzaG93XG4gIGFmdGVyX2ZpbHRlciBkbyB8Y29udHJvbGxlcnxcbiAgICBmbGFzaFs6ZXJyb3JdID0gXCJZb3UgbXVzdCBiZSBsb2dnZWQgaW5cIlxuICBlbmRcblxuICBkZWYgaW5kZXhcbiAgICBAdG9kb3MgPSBUb2RvLmFsbFxuICBlbmRcbmVuZFxuIn0=)

### Description

This rule is used to migrate `{before,after,around}_filter` to `{before,after,around}_action` in Ruby on Rails controllers.

These are methods that run before, after or around an action is executed, and they can be used to check permissions, set variables, redirect requests, log events, etc. However, these methods are [deprecated](https://stackoverflow.com/questions/16519828/rails-4-before-filter-vs-before-action) in Rails 5.0 and will be removed in Rails 5.1. `{before,after,around}_action` are the new syntax for the same functionality.

This rule will replace all occurrences of `{before,after,around}_filter` with `{before,after,around}_action` in the controller code.


### YAML
```yaml
id: migration-action-filter
language: ruby
rule:
  any:
    - pattern: before_filter $$$ACTION
    - pattern: around_filter $$$ACTION
    - pattern: after_filter $$$ACTION
  has:
    pattern: $FILTER
    field: method
fix:
  $NEW_ACTION $$$ACTION
transform:
  NEW_ACTION:
    replace:
      source: $FILTER
      replace: _filter
      by: _action
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```rb {2-4}
class TodosController < ApplicationController
  before_filter :authenticate
  around_filter :wrap_in_transaction, only: :show
  after_filter do |controller|
    flash[:error] = "You must be logged in"
  end

  def index
    @todos = Todo.all
  end
end
```

### Diff
<!-- use # [!code --] and # [!code ++] to annotate diff -->
```rb
class TodosController < ApplicationController
  before_action :authenticate  # [!code --]
  before_filter :authenticate # [!code ++]
  around_action :wrap_in_transaction, only: :show # [!code --]
  around_filter :wrap_in_transaction, only: :show # [!code ++]
  after_action do |controller|  # [!code --]
     flash[:error] = "You must be logged in" # [!code --]
  end # [!code --]
  after_filter do |controller| # [!code ++]
    flash[:error] = "You must be logged in" # [!code ++]
  end # [!code ++]

  def index
    @todos = Todo.all
  end
end
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim), inspired by [Future of Ruby - AST Tooling](https://dev.to/baweaver/future-of-ruby-ast-tooling-9i1).