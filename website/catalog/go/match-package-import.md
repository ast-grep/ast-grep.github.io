## Match package import in Golang

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbWF0Y2gtcGFja2FnZS1pbXBvcnRcbmxhbmd1YWdlOiBnb1xucnVsZTpcbiAga2luZDogaW1wb3J0X3NwZWNcbiAgaGFzOlxuICAgIHJlZ2V4OiBnaXRodWIuY29tL2dvbGFuZy1qd3Qvand0Iiwic291cmNlIjoicGFja2FnZSBtYWluXG5cbmltcG9ydCAoXG5cdFwiZm10XCJcblx0XCJnaXRodWIuY29tL2dvbGFuZy1qd3Qvand0XCIgIC8vIFRoaXMgbWF0Y2hlcyB0aGUgQVNUIHJ1bGVcbilcblxuZnVuYyBtYWluKCkge1xuXHQvLyBDcmVhdGUgYSBuZXcgdG9rZW5cblx0dG9rZW4gOj0gand0Lk5ldyhqd3QuU2lnbmluZ01ldGhvZEhTMjU2KVxuXHRcblx0Ly8gQWRkIHNvbWUgY2xhaW1zXG5cdHRva2VuLkNsYWltcyA9IGp3dC5NYXBDbGFpbXN7XG5cdFx0XCJ1c2VyXCI6IFwiYWxpY2VcIixcblx0XHRcInJvbGVcIjogXCJhZG1pblwiLFxuXHR9XG5cdFxuXHQvLyBTaWduIHRoZSB0b2tlblxuXHR0b2tlblN0cmluZywgZXJyIDo9IHRva2VuLlNpZ25lZFN0cmluZyhbXWJ5dGUoXCJteS1zZWNyZXRcIikpXG5cdGlmIGVyciAhPSBuaWwge1xuXHRcdGZtdC5QcmludGYoXCJFcnJvciBzaWduaW5nIHRva2VuOiAldlxcblwiLCBlcnIpXG5cdFx0cmV0dXJuXG5cdH1cblx0XG5cdGZtdC5QcmludGYoXCJHZW5lcmF0ZWQgdG9rZW46ICVzXFxuXCIsIHRva2VuU3RyaW5nKVxufSJ9)

### Description

A generic rule template for detecting imports of specific packages in Go source code. This rule can be customized to match any package by modifying the regex pattern, making it useful for security auditing, dependency management, and compliance checking.

This rule identifies Go import statements based on the configured regex pattern, including:

Direct imports: `import "package/name"`  
Versioned imports: `import "package/name/v4"`  
Subpackage imports: `import "package/name/subpkg"`  
Grouped imports within `import () blocks` 

### YAML

```yaml
id: match-package-import
language: go
rule:
  kind: import_spec
  has:
    regex: PACKAGE_PATTERN_HERE
``` 

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
