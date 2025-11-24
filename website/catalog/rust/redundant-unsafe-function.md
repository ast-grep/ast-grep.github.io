## Unsafe Function Without Unsafe Block

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1c3QiLCJxdWVyeSI6IntcbiAgZGVzY3JpcHRpb24gPSAkQVxufSIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6ImJpbmRpbmciLCJjb25maWciOiIgIGlkOiByZWR1bmRhbnQtdW5zYWZlLWZ1bmN0aW9uXG4gIGxhbmd1YWdlOiBydXN0XG4gIHNldmVyaXR5OiBlcnJvclxuICBtZXNzYWdlOiBVbnNhZmUgZnVuY3Rpb24gd2l0aG91dCB1bnNhZmUgYmxvY2sgaW5zaWRlXG4gIG5vdGU6IHxcbiAgICBDb25zaWRlciB3aGV0aGVyIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgbWFya2VkIHVuc2FmZSBcbiAgICBvciBpZiB1bnNhZmUgb3BlcmF0aW9ucyBzaG91bGQgYmUgd3JhcHBlZCBpbiBhbiB1bnNhZmUgYmxvY2tcbiAgcnVsZTpcbiAgICBhbGw6XG4gICAgICAtIGtpbmQ6IGZ1bmN0aW9uX2l0ZW1cbiAgICAgIC0gaGFzOlxuICAgICAgICAgIGtpbmQ6IGZ1bmN0aW9uX21vZGlmaWVyc1xuICAgICAgICAgIHJlZ2V4OiBcIl51bnNhZmVcIlxuICAgICAgLSBub3Q6XG4gICAgICAgICAgaGFzOlxuICAgICAgICAgICAga2luZDogdW5zYWZlX2Jsb2NrXG4gICAgICAgICAgICBzdG9wQnk6IGVuZCIsInNvdXJjZSI6IiAgLy8gU2hvdWxkIG1hdGNoIC0gdW5zYWZlIGZ1bmN0aW9uIHdpdGhvdXQgdW5zYWZlIGJsb2NrIChubyByZXR1cm4gdHlwZSlcbiAgdW5zYWZlIGZuIHJlZHVuZGFudF91bnNhZmUoKSB7XG4gICAgICBwcmludGxuIShcIk5vIHVuc2FmZSBvcGVyYXRpb25zIGhlcmVcIik7XG4gIH1cblxuICAvLyBTaG91bGQgbWF0Y2ggLSB1bnNhZmUgZnVuY3Rpb24gd2l0aCByZXR1cm4gdHlwZSwgbm8gdW5zYWZlIGJsb2NrXG4gIHVuc2FmZSBmbiByZWR1bmRhbnRfd2l0aF9yZXR1cm4oKSAtPiBpMzIge1xuICAgICAgbGV0IHggPSA1O1xuICAgICAgeCArIDEwXG4gIH1cblxuICAvLyBTaG91bGQgbWF0Y2ggLSB1bnNhZmUgZnVuY3Rpb24gd2l0aCBjb21wbGV4IHJldHVybiB0eXBlXG4gIHVuc2FmZSBmbiByZWR1bmRhbnRfY29tcGxleF9yZXR1cm4oKSAtPiBSZXN1bHQ8U3RyaW5nLCBzdGQ6OmlvOjpFcnJvcj4ge1xuICAgICAgT2soU3RyaW5nOjpmcm9tKFwic2FmZSBvcGVyYXRpb25cIikpXG4gIH1cblxuICAvLyBTaG91bGQgTk9UIG1hdGNoIC0gdW5zYWZlIGZ1bmN0aW9uIHdpdGggdW5zYWZlIGJsb2NrXG4gIHVuc2FmZSBmbiBwcm9wZXJfdW5zYWZlKCkgLT4gKmNvbnN0IGkzMiB7XG4gICAgICB1bnNhZmUge1xuICAgICAgICAgIGxldCBwdHIgPSAweDEyMzQgYXMgKmNvbnN0IGkzMjtcbiAgICAgICAgICBwdHJcbiAgICAgIH1cbiAgfVxuXG4gIC8vIFNob3VsZCBtYXRjaCAtIHVuc2FmZSBhc3luYyBmdW5jdGlvbiB3aXRob3V0IHVuc2FmZSBibG9ja1xuICB1bnNhZmUgYXN5bmMgZm4gYXN5bmNfcmVkdW5kYW50KCkgLT4gaTMyIHtcbiAgICAgIDQyXG4gIH1cblxuICAvLyBTaG91bGQgbWF0Y2ggLSB1bnNhZmUgY29uc3QgZnVuY3Rpb25cbiAgdW5zYWZlIGNvbnN0IGZuIGNvbnN0X3JlZHVuZGFudCgpIC0+IGkzMiB7XG4gICAgICAxMDBcbiAgfVxuXG4gIC8vIFNob3VsZCBOT1QgbWF0Y2ggLSByZWd1bGFyIGZ1bmN0aW9uXG4gIGZuIHJlZ3VsYXJfZnVuY3Rpb24oKSAtPiBpMzIge1xuICAgICAgNDJcbiAgfSJ9)

### Description

This rule detects functions marked with the `unsafe` keyword that do not contain any `unsafe` blocks in their body.

When a function is marked `unsafe`, it indicates that the function contains operations that the compiler cannot verify as safe. However, if the function body doesn't contain any `unsafe` blocks, it may be unnecessarily marked as `unsafe`. This could be a sign that:

1. The function should not be marked `unsafe` if it doesn't perform any unsafe operations
2. Or if there are unsafe operations, they should be explicitly wrapped in `unsafe` blocks for clarity

This rule helps identify such cases so developers can review whether the `unsafe` marker is truly necessary or if the code needs to be refactored.

### YAML
```yaml
id: redundant-unsafe-function
language: rust
severity: error
message: Unsafe function without unsafe block inside
note: |
  Consider whether this function needs to be marked unsafe 
  or if unsafe operations should be wrapped in an unsafe block
rule:
  all:
    - kind: function_item
    - has:
        kind: function_modifiers
        regex: "^unsafe"
    - not:
        has:
          kind: unsafe_block
          stopBy: end
```

### Example

```rs {2,7,12,24,29}
// Should match - unsafe function without unsafe block (no return type)
unsafe fn redundant_unsafe() {
    println!("No unsafe operations here");
}

// Should match - unsafe function with return type, no unsafe block
unsafe fn redundant_with_return() -> i32 {
    let x = 5;
    x + 10
}

// Should match - unsafe function with complex return type
unsafe fn redundant_complex_return() -> Result<String, std::io::Error> {
    Ok(String::from("safe operation"))
}

// Should NOT match - unsafe function with unsafe block
unsafe fn proper_unsafe() -> *const i32 {
    unsafe {
        let ptr = 0x1234 as *const i32;
        ptr
    }
}

// Should match - unsafe async function without unsafe block
unsafe async fn async_redundant() -> i32 {
    42
}

// Should match - unsafe const function
unsafe const fn const_redundant() -> i32 {
    100
}

// Should NOT match - regular function
fn regular_function() -> i32 {
    42
}
```

### Contributed by

Inspired by [@hd_nvim's Tweet](https://x.com/hd_nvim/status/1992810384072585397?s=20)
