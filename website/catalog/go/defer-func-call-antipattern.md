## Detect problematic defer statements with function calls

* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiZ28iLCJxdWVyeSI6InsgXG4gICAgZGVmZXIgJEEuJEIodCwgZmFpbHBvaW50LiRNKCQkJCkpIFxufSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6ImRlZmVyX3N0YXRlbWVudCIsImNvbmZpZyI6InJ1bGU6XG4iLCJzb3VyY2UiOiJmdW5jIFRlc3RJc3N1ZTE2Njk2KHQgKnRlc3RpbmcuVCkge1xuXHRhbGFybVJhdGlvIDo9IHZhcmRlZi5NZW1vcnlVc2FnZUFsYXJtUmF0aW8uTG9hZCgpXG5cdHZhcmRlZi5NZW1vcnlVc2FnZUFsYXJtUmF0aW8uU3RvcmUoMC4wKVxuXHRkZWZlciB2YXJkZWYuTWVtb3J5VXNhZ2VBbGFybVJhdGlvLlN0b3JlKGFsYXJtUmF0aW8pXG5cdHJlcXVpcmUuTm9FcnJvcih0LCBmYWlscG9pbnQuRW5hYmxlKFwiZ2l0aHViLmNvbS9waW5nY2FwL3RpZGIvcGtnL2V4ZWN1dG9yL3NvcnRleGVjL3Rlc3RTb3J0ZWRSb3dDb250YWluZXJTcGlsbFwiLCBcInJldHVybih0cnVlKVwiKSlcblx0ZGVmZXIgcmVxdWlyZS5Ob0Vycm9yKHQsIFxuXHQgICBmYWlscG9pbnQuRGlzYWJsZShcblx0XHRcImdpdGh1Yi5jb20vcGluZ2NhcC90aWRiL3BrZy9leGVjdXRvci9zb3J0ZXhlYy90ZXN0U29ydGVkUm93Q29udGFpbmVyU3BpbGxcIlxuXHQpKVxuXHRyZXF1aXJlLk5vRXJyb3IodCwgXG5cdFx0ZmFpbHBvaW50LkVuYWJsZShcImdpdGh1Yi5jb20vcGluZ2NhcC90aWRiL3BrZy9leGVjdXRvci9qb2luL3Rlc3RSb3dDb250YWluZXJTcGlsbFwiLCBcInJldHVybih0cnVlKVwiKSlcblx0ZGVmZXIgcmVxdWlyZS5Ob0Vycm9yKHQsIFxuXHRcdGZhaWxwb2ludC5EaXNhYmxlKFwiZ2l0aHViLmNvbS9waW5nY2FwL3RpZGIvcGtnL2V4ZWN1dG9yL2pvaW4vdGVzdFJvd0NvbnRhaW5lclNwaWxsXCIpKVxufSJ9)

### Description

This rule detects a common anti-pattern in Go testing code where `defer` statements contain function calls with parameters that are evaluated immediately instead of when the defer executes.

In Go, `defer` schedules a function call to be executed when the surrounding function returns. However, the **arguments to the deferred function are evaluated immediately** when the defer statement is encountered, not when the defer executes.

This is particularly problematic when using assertion libraries in tests. For example:
```go
defer require.NoError(t, failpoint.Disable("some/path"))
```

In this case, `failpoint.Disable("some/path")` is called immediately when the defer statement is reached, not when the function exits. This means the failpoint is disabled right after being enabled, making the test ineffective.

### YAML

```yaml
id: defer-func-call-antipattern
language: go
rule:
  pattern: |
    defer $A.$B(t, failpoint.$M($$$))
  selector: defer_statement
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```go{6-9,11-12}
func TestIssue16696(t *testing.T) {
	alarmRatio := vardef.MemoryUsageAlarmRatio.Load()
	vardef.MemoryUsageAlarmRatio.Store(0.0)
	defer vardef.MemoryUsageAlarmRatio.Store(alarmRatio)
	require.NoError(t, failpoint.Enable("github.com/pingcap/tidb/pkg/executor/sortexec/testSortedRowContainerSpill", "return(true)"))
	defer require.NoError(t, 
	   failpoint.Disable(
		"github.com/pingcap/tidb/pkg/executor/sortexec/testSortedRowContainerSpill"
	))
	require.NoError(t, failpoint.Enable("github.com/pingcap/tidb/pkg/executor/join/testRowContainerSpill", "return(true)"))
	defer require.NoError(t, 
		failpoint.Disable("github.com/pingcap/tidb/pkg/executor/join/testRowContainerSpill"))
}
```

### Fix

The correct way to defer a function with parameters is to wrap it in an anonymous function:

```go
defer func() {
    require.NoError(t, failpoint.Disable("some/path"))
}()
```

### Contributed by

Inspired by [YangKeao's tweet](https://x.com/YangKeao/status/1671420857565212672) about this common pitfall in TiDB codebase.