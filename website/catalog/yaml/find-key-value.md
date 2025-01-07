## Find key/value and show message using those key/vals

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InlhbWwiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6ImlkOiBkZXRlY3QtaG9zdC1wb3J0XG5tZXNzYWdlOiBZb3UgYXJlIHVzaW5nICRIT1NUIG9uIFBvcnQgJFBPUlQsIHBsZWFzZSBjaGFuZ2UgaXQgdG8gODAwMFxuc2V2ZXJpdHk6IGVycm9yXG5ydWxlOlxuICBhbnk6XG4gIC0gcGF0dGVybjogfFxuICAgICBwb3J0OiAkUE9SVFxuICAtIHBhdHRlcm46IHxcbiAgICAgaG9zdDogJEhPU1QiLCJzb3VyY2UiOiJkYjpcbiAgIHVzZXJuYW1lOiByb290XG4gICBwYXNzd29yZDogcm9vdFxuXG5zZXJ2ZXI6XG4gIGhvc3Q6IDEyNy4wLjAuMVxuICBwb3J0OiA4MDAxIn0=)

### Description

This YAML rule helps detect specific host and port configurations in your code. For example, it checks if the port is set to something other than 8000 or if a particular host is used. It provides an error message prompting you to update the configuration.

### YAML

```yaml
id: detect-host-port
message: You are using $HOST on Port $PORT, please change it to 8000
severity: error
rule:
  any:
    - pattern: |
        port: $PORT
    - pattern: |
        host: $HOST
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```yaml {5,6}
db:
  username: root
  password: root
server:
  host: 127.0.0.1
  port: 8001
```

### Contributed by
[rohitcoder](https://twitter.com/rohitcoder) on [Discord](https://discord.com/invite/4YZjf6htSQ).
