## Match package import in Golang

* [Playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbWF0Y2gtaW1wb3J0LXBrZ1xubGFuZ3VhZ2U6IGdvXG5ydWxlOlxuICBraW5kOiBpbXBvcnRfc3BlY1xuICBoYXM6XG4gICAgcmVnZXg6IGdpdGh1Yi5jb20vZ29sYW5nLWp3dC9qd3QiLCJzb3VyY2UiOiJpbXBvcnQgKFxuXHRcImNvbnRleHRcIlxuXHRcImZtdFwiXG5cdFwib3NcIlxuXG5cdFwiZ2l0aHViLmNvbS9nb2xhbmctand0L2p3dFwiXG4pXG5cbmltcG9ydCBcdFwiZ2l0aHViLmNvbS9nb2xhbmctand0L2p3dFwiXG5cbmltcG9ydCBcdFwiZ2l0aHViLmNvbS9nb2xhbmctand0L2p3dC92NFwiIn0=)

### Description

A generic rule template for detecting imports of specific packages in Go source code. This rule can be customized to match any package by modifying the regex pattern, making it useful for security auditing, dependency management, and compliance checking.

### YAML

```yaml
id: match-package-import
language: go
rule:
  kind: import_spec
  has:
    regex: PACKAGE_PATTERN_HERE
```

### Configuration
Replace PACKAGE_PATTERN_HERE with your target package pattern

### What it matches

This rule identifies Go import statements based on the configured regex pattern, including:

Direct imports: `import "package/name"`  
Versioned imports: `import "package/name/v4"`  
Subpackage imports: `import "package/name/subpkg"`  
Grouped imports within `import () blocks`  

### Example

JWT Library Detection

```yaml
id: match-package-import
language: go
rule:
  kind: import_spec
  has:
    regex: github.com/golang-jwt/jwt
```

### Contributed by
[Sudesh Gutta](https://github.com/sudeshgutta)
