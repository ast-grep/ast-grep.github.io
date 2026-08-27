## Remove redundant range-variable copies <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogbG9vcHZhci1jYXB0dXJlXG5sYW5ndWFnZTogR29cbnJ1bGU6XG4gIGFsbDpcbiAgICAtIHBhdHRlcm46XG4gICAgICAgIGNvbnRleHQ6IGZ1bmMgZigpIHsgJFZBUiA6PSAkVkFSIH1cbiAgICAgICAgc2VsZWN0b3I6IHNob3J0X3Zhcl9kZWNsYXJhdGlvblxuICAgIC0gaW5zaWRlOlxuICAgICAgICBraW5kOiBmb3Jfc3RhdGVtZW50XG4gICAgICAgIGhhczpcbiAgICAgICAgICBhbnk6XG4gICAgICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICAgICAgY29udGV4dDogZm9yICRWQVIgOj0gcmFuZ2UgJFJBTkdFIHt9XG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6IHJhbmdlX2NsYXVzZVxuICAgICAgICAgICAgICAgIHN0cmljdG5lc3M6IGNzdFxuICAgICAgICAgICAgLSBwYXR0ZXJuOlxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IGZvciAkVkFSLCAkXyA6PSByYW5nZSAkUkFOR0Uge31cbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogcmFuZ2VfY2xhdXNlXG4gICAgICAgICAgICAgICAgc3RyaWN0bmVzczogY3N0XG4gICAgICAgICAgICAtIHBhdHRlcm46XG4gICAgICAgICAgICAgICAgY29udGV4dDogZm9yICRfLCAkVkFSIDo9IHJhbmdlICRSQU5HRSB7fVxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiByYW5nZV9jbGF1c2VcbiAgICAgICAgICAgICAgICBzdHJpY3RuZXNzOiBjc3RcbiAgICAgICAgc3RvcEJ5OiBlbmRcbmZpeDogXCJcIiIsInNvdXJjZSI6InBhY2thZ2UgZXhhbXBsZVxuXG5mdW5jIHByb2Nlc3NBbGwoaXRlbXMgW11JdGVtKSB7XG5cdGZvciBfLCBpdGVtIDo9IHJhbmdlIGl0ZW1zIHtcblx0XHRpdGVtIDo9IGl0ZW1cblx0XHRnbyBwcm9jZXNzKGl0ZW0pXG5cdH1cbn0ifQ==)

### Description

Since Go 1.22, variables declared by a `range` clause are recreated for each iteration. A direct `item := item` copy is therefore unnecessary, even when a closure captures `item` or code takes its address.

This rule deliberately matches only variables declared with `:=` in an enclosing range loop. Use it only when the module targets Go 1.22 or newer.

### YAML

```yaml
id: loopvar-capture
language: Go
rule:
  all:
    - pattern:
        context: func f() { $VAR := $VAR }
        selector: short_var_declaration
    - inside:
        kind: for_statement
        has:
          any:
            - pattern:
                context: for $VAR := range $RANGE {}
                selector: range_clause
                strictness: cst
            - pattern:
                context: for $VAR, $_ := range $RANGE {}
                selector: range_clause
                strictness: cst
            - pattern:
                context: for $_, $VAR := range $RANGE {}
                selector: range_clause
                strictness: cst
        stopBy: end
fix: ""
```

### Example

```go{5}
package example

func processAll(items []Item) {
	for _, item := range items {
		item := item
		go process(item)
	}
}
```

### Diff

```go
for _, item := range items {
	item := item // [!code --]
	go process(item)
}
```

### Credits

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
