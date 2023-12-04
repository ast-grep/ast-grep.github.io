## Get number of digits in a `usize` <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoicnVzdCIsInF1ZXJ5IjoiJE5VTS50b19zdHJpbmcoKS5jaGFycygpLmNvdW50KCkiLCJyZXdyaXRlIjoiJE5VTS5jaGVja2VkX2lsb2cxMCgpLnVud3JhcF9vcigwKSArIDEiLCJjb25maWciOiIjIFlBTUwgUnVsZSBpcyBtb3JlIHBvd2VyZnVsIVxuIyBodHRwczovL2FzdC1ncmVwLmdpdGh1Yi5pby9ndWlkZS9ydWxlLWNvbmZpZy5odG1sI3J1bGVcbnJ1bGU6XG4gIGFueTpcbiAgICAtIHBhdHRlcm46IGNvbnNvbGUubG9nKCRBKVxuICAgIC0gcGF0dGVybjogY29uc29sZS5kZWJ1ZygkQSlcbmZpeDpcbiAgbG9nZ2VyLmxvZygkQSkiLCJzb3VyY2UiOiJsZXQgd2lkdGggPSAobGluZXMgKyBudW0pLnRvX3N0cmluZygpLmNoYXJzKCkuY291bnQoKTsifQ==)

### Description

Getting the number of digits in a usize number can be useful for various purposes, such as counting the column width of line numbers in a text editor or formatting the output of a number with commas or spaces.

A common but inefficient way of getting the number of digits in a `usize` number is to use `num.to_string().chars().count()`. This method converts the number to a string, iterates over its characters, and counts them. However, this method involves allocating a new string, which can be costly in terms of memory and time.

A better alternative is to use [`checked_ilog10`](https://doc.rust-lang.org/std/primitive.usize.html#method.checked_ilog10).

```rs
num.checked_ilog10().unwrap_or(0) + 1
```

The snippet above computes the integer logarithm base 10 of the number and adds one. This snippet does not allocate any memory and is faster than the string conversion approach. The [efficient](https://doc.rust-lang.org/src/core/num/int_log10.rs.html) `checked_ilog10` function returns an `Option<usize>` that is `Some(log)` if the number is positive and `None` if the number is zero. The `unwrap_or(0)` function returns the value inside the option or `0` if the option is `None`.

### Pattern

```shell
sg -p '$NUM.to_string().chars().count()' \
   -r '$NUM.checked_ilog10().unwrap_or(0) + 1' \
   -l rs
```

### Example

```rs {1}
let width = (lines + num).to_string().chars().count();
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```rs
let width = (lines + num).to_string().chars().count(); // [!code --]
let width = (lines + num).checked_ilog10().unwrap_or(0) + 1; // [!code ++]
```

### Contributed by

[Herrington Darkholme](https://twitter.com/hd_nvim), inspired by [dogfooding ast-grep](https://github.com/ast-grep/ast-grep/issues/550)
