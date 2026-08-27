## Stream split results with `SplitSeq` and `FieldsSeq` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImdvIiwicXVlcnkiOiIiLCJyZXdyaXRlIjoiIiwiY29uZmlnIjoiaWQ6IHVzZS1zcGxpdC1zZXFcbmxhbmd1YWdlOiBHb1xuc2V2ZXJpdHk6IGhpbnRcbm1lc3NhZ2U6IFN0cmVhbSBzcGxpdCByZXN1bHRzIHdpdGggYSBTZXEgaGVscGVyLlxucnVsZTpcbiAgcGF0dGVybjpcbiAgICBjb250ZXh0OiB8XG4gICAgICBmdW5jIGYoKSB7XG4gICAgICAgIGZvciBfLCAkSVRFTSA6PSByYW5nZSAkUEFDS0FHRS4kRlVOQ1RJT04oJCQkQVJHUykge1xuICAgICAgICAgICQkJEJPRFlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIHNlbGVjdG9yOiBmb3Jfc3RhdGVtZW50XG5jb25zdHJhaW50czpcbiAgUEFDS0FHRTpcbiAgICByZWdleDogJ14oc3RyaW5nc3xieXRlcykkJ1xuICBGVU5DVElPTjpcbiAgICByZWdleDogJ14oU3BsaXR8RmllbGRzKSQnXG4gIElURU06XG4gICAgYWxsOlxuICAgICAgLSBraW5kOiBpZGVudGlmaWVyXG4gICAgICAtIG5vdDpcbiAgICAgICAgICByZWdleDogJ15fJCdcbnRyYW5zZm9ybTpcbiAgU0VRX0ZVTkNUSU9OOlxuICAgIHJlcGxhY2U6XG4gICAgICBzb3VyY2U6ICRGVU5DVElPTlxuICAgICAgcmVwbGFjZTogJyQnXG4gICAgICBieTogU2VxXG5maXg6IHwtXG4gIGZvciAkSVRFTSA6PSByYW5nZSAkUEFDS0FHRS4kU0VRX0ZVTkNUSU9OKCQkJEFSR1MpIHtcbiAgICAkJCRCT0RZXG4gIH0iLCJzb3VyY2UiOiJwYWNrYWdlIG1haW5cblxuaW1wb3J0IChcbiAgXCJieXRlc1wiXG4gIFwic3RyaW5nc1wiXG4pXG5cbmZ1bmMgdmlzaXQodGV4dCBzdHJpbmcsIGRhdGEgW11ieXRlKSB7XG4gIGZvciBfLCBwYXJ0IDo9IHJhbmdlIHN0cmluZ3MuU3BsaXQodGV4dCwgXCIsXCIpIHtcbiAgICB1c2VTdHJpbmcocGFydClcbiAgfVxuICBmb3IgXywgZmllbGQgOj0gcmFuZ2UgYnl0ZXMuRmllbGRzKGRhdGEpIHtcbiAgICB1c2VCeXRlcyhmaWVsZClcbiAgfVxufSJ9)

### Description

Go 1.24 added `SplitSeq` and `FieldsSeq` to `strings` and `bytes`. When a range loop discards the slice index, these helpers stream each part without first allocating the complete result slice. The rule preserves the loop body and deliberately ignores loops that use the index.

It assumes `strings` and `bytes` are the canonical standard-library package names and does not manage imports.

### YAML

```yaml
id: use-split-seq
language: Go
severity: hint
message: Stream split results with a Seq helper.
rule:
  pattern:
    context: |
      func f() {
        for _, $ITEM := range $PACKAGE.$FUNCTION($$$ARGS) {
          $$$BODY
        }
      }
    selector: for_statement
constraints:
  PACKAGE:
    regex: '^(strings|bytes)$'
  FUNCTION:
    regex: '^(Split|Fields)$'
  ITEM:
    all:
      - kind: identifier
      - not:
          regex: '^_$'
transform:
  SEQ_FUNCTION:
    replace:
      source: $FUNCTION
      replace: '$'
      by: Seq
fix: |-
  for $ITEM := range $PACKAGE.$SEQ_FUNCTION($$$ARGS) {
    $$$BODY
  }
```

### Example

```go {9-11,12-14}
package main

import (
  "bytes"
  "strings"
)

func visit(text string, data []byte) {
  for _, part := range strings.Split(text, ",") {
    useString(part)
  }
  for _, field := range bytes.Fields(data) {
    useBytes(field)
  }
}
```

### Diff

```go
for _, part := range strings.Split(text, ",") { // [!code --]
for part := range strings.SplitSeq(text, ",") { // [!code ++]
  useString(part)
}

for _, field := range bytes.Fields(data) { // [!code --]
for field := range bytes.FieldsSeq(data) { // [!code ++]
  useBytes(field)
}
```

### Contributed by

Based on [JetBrains' Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
