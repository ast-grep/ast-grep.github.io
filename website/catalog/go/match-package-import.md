## Match package import in Golang

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbWF0Y2gtaW1wb3J0LXBrZ1xubGFuZ3VhZ2U6IGdvXG5ydWxlOlxuICBraW5kOiBpbXBvcnRfc3BlY1xuICBoYXM6XG4gICAgcmVnZXg6IGdpdGh1Yi5jb20vZ29sYW5nLWp3dC9qd3QiLCJzb3VyY2UiOiJwYWNrYWdlIG1haW5cblxuaW1wb3J0IChcblx0XCJmbXRcIlxuXHRcImdpdGh1Yi5jb20vZ29sYW5nLWp3dC9qd3RcIiAgLy8gVGhpcyBtYXRjaGVzIHRoZSBBU1QgcnVsZVxuKVxuXG5mdW5jIG1haW4oKSB7XG5cdC8vIENyZWF0ZSBhIG5ldyB0b2tlblxuXHR0b2tlbiA6PSBqd3QuTmV3KGp3dC5TaWduaW5nTWV0aG9kSFMyNTYpXG5cdFxuXHQvLyBBZGQgc29tZSBjbGFpbXNcblx0dG9rZW4uQ2xhaW1zID0gand0Lk1hcENsYWltc3tcblx0XHRcInVzZXJcIjogXCJhbGljZVwiLFxuXHRcdFwicm9sZVwiOiBcImFkbWluXCIsXG5cdH1cblx0XG5cdC8vIFNpZ24gdGhlIHRva2VuXG5cdHRva2VuU3RyaW5nLCBlcnIgOj0gdG9rZW4uU2lnbmVkU3RyaW5nKFtdYnl0ZShcIm15LXNlY3JldFwiKSlcblx0aWYgZXJyICE9IG5pbCB7XG5cdFx0Zm10LlByaW50ZihcIkVycm9yIHNpZ25pbmcgdG9rZW46ICV2XFxuXCIsIGVycilcblx0XHRyZXR1cm5cblx0fVxuXHRcblx0Zm10LlByaW50ZihcIkdlbmVyYXRlZCB0b2tlbjogJXNcXG5cIiwgdG9rZW5TdHJpbmcpXG59In0=)

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

```go
package main

import (
	"fmt"
	"github.com/golang-jwt/jwt"  // This matches the AST rule
)

func main() {
	// Create a new token
	token := jwt.New(jwt.SigningMethodHS256)
	
	// Add some claims
	token.Claims = jwt.MapClaims{
		"user": "alice",
		"role": "admin",
	}
	
	// Sign the token
	tokenString, err := token.SignedString([]byte("my-secret"))
	if err != nil {
		fmt.Printf("Error signing token: %v\n", err)
		return
	}
	
	fmt.Printf("Generated token: %s\n", tokenString)
}
```

### Contributed by

[Sudesh Gutta](https://github.com/sudeshgutta)
