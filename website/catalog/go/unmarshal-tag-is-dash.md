## Detect problematic JSON tags with dash prefix

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiJgJFRBR2AiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogdW5tYXJzaGFsLXRhZy1pcy1kYXNoXG5zZXZlcml0eTogZXJyb3Jcbm1lc3NhZ2U6IFN0cnVjdCBmaWVsZCBjYW4gYmUgZGVjb2RlZCB3aXRoIHRoZSBgLWAga2V5IGJlY2F1c2UgdGhlIEpTT04gdGFnXG4gIHN0YXJ0cyB3aXRoIGEgYC1gIGJ1dCBpcyBmb2xsb3dlZCBieSBhIGNvbW1hLlxucnVsZTpcbiAgcGF0dGVybjogJ2AkVEFHYCdcbiAgaW5zaWRlOlxuICAgIGtpbmQ6IGZpZWxkX2RlY2xhcmF0aW9uXG5jb25zdHJhaW50czpcbiAgVEFHOiBcbiAgICByZWdleDoganNvbjpcIi0sLipcIiIsInNvdXJjZSI6InBhY2thZ2UgbWFpblxuXG50eXBlIFRlc3RTdHJ1Y3QxIHN0cnVjdCB7XG5cdC8vIG9rOiB1bm1hcnNoYWwtdGFnLWlzLWRhc2hcblx0QSBzdHJpbmcgYGpzb246XCJpZFwiYFxufVxuXG50eXBlIFRlc3RTdHJ1Y3QyIHN0cnVjdCB7XG5cdC8vIHJ1bGVpZDogdW5tYXJzaGFsLXRhZy1pcy1kYXNoXG5cdEIgc3RyaW5nIGBqc29uOlwiLSxvbWl0ZW1wdHlcImBcbn1cblxudHlwZSBUZXN0U3RydWN0MyBzdHJ1Y3Qge1xuXHQvLyBydWxlaWQ6IHVubWFyc2hhbC10YWctaXMtZGFzaFxuXHRDIHN0cmluZyBganNvbjpcIi0sMTIzXCJgXG59XG5cbnR5cGUgVGVzdFN0cnVjdDQgc3RydWN0IHtcblx0Ly8gcnVsZWlkOiB1bm1hcnNoYWwtdGFnLWlzLWRhc2hcblx0RCBzdHJpbmcgYGpzb246XCItLFwiYFxufSJ9)

### Description

This rule detects a security vulnerability in Go's JSON unmarshaling. When a struct field has a JSON tag that starts with `-,`, it can be unexpectedly unmarshaled with the `-` key.

According to the [Go documentation](https://pkg.go.dev/encoding/json#Marshal), if the field tag is `-`, the field should be omitted. However, a field with name `-` can still be unmarshaled using the tag `-,`.

This creates a security issue where developers think they are preventing a field from being unmarshaled (like `IsAdmin` in authentication), but attackers can still set that field by providing the `-` key in JSON input.

```go
type User struct {
    Username string `json:"username,omitempty"`
    Password string `json:"password,omitempty"`
    IsAdmin  bool   `json:"-,omitempty"`  // Intended to prevent marshaling
}

// This still works and sets IsAdmin to true!
json.Unmarshal([]byte(`{"-": true}`), &user)
// Result: main.User{Username:"", Password:"", IsAdmin:true}
```

### YAML

```yaml
id: unmarshal-tag-is-dash
severity: error
message: Struct field can be decoded with the `-` key because the JSON tag
  starts with a `-` but is followed by a comma.
rule:
  pattern: '`$TAG`'
  inside:
    kind: field_declaration
constraints:
  TAG:
    regex: json:"-,.*"
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```go{10,15,20}
package main

type TestStruct1 struct {
	A string `json:"id"` // ok
}

type TestStruct2 struct {
	B string `json:"-,omitempty"` // wrong
}

type TestStruct3 struct {
	C string `json:"-,123"` // wrong
}

type TestStruct4 struct {
	D string `json:"-,"` // wrong
}
```

### Fix

To properly omit a field from JSON marshaling/unmarshaling, use just `-` without a comma:

```go
type User struct {
    Username string `json:"username,omitempty"`
    Password string `json:"password,omitempty"`
    IsAdmin  bool   `json:"-"`  // Correctly prevents marshaling/unmarshaling
}
```

### Contributed by

Inspired by [Trail of Bits blog post](https://blog.trailofbits.com/2025/06/17/unexpected-security-footguns-in-gos-parsers/) and their [public Semgrep rule](https://semgrep.dev/playground/r/trailofbits.go.unmarshal-tag-is-dash).