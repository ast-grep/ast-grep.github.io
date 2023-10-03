# Rewrite Code

One of the powers of ast-grep is that it can not only find code patterns, but also transform them into new code.

For example, you may want to rename a variable, change a function call, or add a comment. ast-grep provides two ways to do this: using the `--rewrite` flag or using the `fix` key in YAML rules.

## Using `sg run -p 'pat' --rewrite`

The simplest way to rewrite code is to use the `--rewrite` flag with the `sg run` command. This flag takes a string argument that specifies the new code to replace the matched pattern. For example, if you want to change all occurrences of `foo` to `bar`, you can run:

```bash
sg run -p 'foo' --rewrite 'bar'
```

This will show you a diff of the changes that will be made. If you are using interactive mode by the `--interactive` flag, ast-grep ask you if you want to apply them.

:::tip
You can also use the `--update-all` or `-U` flag to automatically accept the changes without confirmation.
:::

## Using `fix` in YAML Rule

Another way to rewrite code is to use the `fix` key in a YAML rule file. This key allows you to specify more complex and flexible rewrite rules, such as using transformations and regular expressions. For example, if you have a rule file named `rename.yaml` with the following content:

```yaml
rules:
- id: rename
  pattern: $X = foo($Y)
  fix: $X = bar($Y)
```

You can run:

```bash
sg run -f rename.yaml
```

This will find and replace all occurrences of `foo` function calls with `bar` function calls, while preserving the variable names.

Let's look at a simple example of using `fix` in a YAML rule. Suppose we have a Python file named `test.py` with the following content:

```python
def foo(x):
    return x + 1

y = foo(2)
print(y)
```

We want to change the name of the function `foo` to `baz`, and also change its parameter name from `x` to `n`. We can write a YAML rule file named `change_name.yaml` with the following content:

```yaml
rules:
- id: change_name
  pattern: |
    def foo($X):
      $S
  fix: |
    def baz($X):
      $S
- id: change_param
  pattern: foo($X)
  fix: baz(n)
```

The first rule matches the definition of the function `foo`, and replaces it with `baz`. The second rule matches the calls of the function `foo`, and replaces them with `baz(n)`. Note that we use `$X` and `$S` as meta variables, which can match any expression and any statement, respectively. We can run:

```bash
sg run -f change_name.yaml test.py
```

This will show us the following diff:

```diff
--- test.py
+++ test.py
@@ -1,7 +1,7 @@
-def foo(x):
-    return x + 1
+def baz(n):
+    return n + 1

-y = foo(2)
-print(y)
+y = baz(n)
+print(n)
```

We can see that the function name and parameter name are changed as we expected.

## Use Meta Variable in Rewrite

As we saw in the previous example, we can use meta variables in both the pattern and the fix parts of a YAML rule. Meta variables are identifiers that start with `$`, and they can match any syntactic element in the code, such as expressions, statements, types, etc. For example, `$X`, `$Y`, and `$Z` are meta variables.

When we use a meta variable in the fix part of a rule, it will be replaced by whatever it matched in the pattern part. For example, if we have a rule like this:

```yaml
rules:
- id: swap
  pattern: $X = $Y
  fix: $Y = $X
```

This rule will swap the left-hand side and right-hand side of any assignment statement. For example, if we have a code like this:

```python
a = b
c = d + e
f = g * h
```

The rule will rewrite it as:

```python
b = a
d + e = c
g * h = f
```

Note that this may not be a valid or sensible code transformation, but it illustrates how meta variables work.

### Rewrite is Indentation Sensitive

When we use multi-line strings in the fix part of a YAML rule, we need to be careful about the indentation level. The indentation level of the first line of the fix string will determine how much indentation to add or remove for the rest of the lines. For example, if we have a rule like this:

```yaml
rules:
- id: add_comment
  pattern: |
    def foo():
      $S
  fix: |
    def foo():
      # This is a comment
      $S
```

This rule will add a comment before the body of any function named `foo`. For example, if we have a code like this:

```python
def foo():
    print("Hello")
    return 42
```

The rule will rewrite it as:

```python
def foo():
    # This is a comment
    print("Hello")
    return 42
```

Note that the indentation level of the fix string is the same as the pattern string, so the comment and the original statements are aligned correctly. However, if we change the indentation level of the fix string, like this:

```yaml
rules:
- id: add_comment
  pattern: |
    def foo():
      $S
  fix: |
        def foo():
          # This is a comment
          $S
```

The rule will rewrite the code as:

```python
        def foo():
          # This is a comment
          print("Hello")
          return 42
```

Note that the indentation level of the whole function is increased by four spaces, which may not be what we want. Therefore, we should always make sure that the indentation level of the fix string matches the indentation level of the pattern string.

## Use `transform` in Rewrite

Sometimes, we may want to apply some transformations to the meta variables in the fix part of a YAML rule. For example, we may want to change the case, add or remove prefixes or suffixes, or perform some arithmetic operations. ast-grep provides a `transform` key that allows us to specify such transformations. For example, if we have a rule like this:

```yaml
id: change_case
rule:
  pattern: $X = $Y.upper()
fix: $X.lower() = $Y
transform: lower($X)
```

This rule will change the case of both sides of an assignment statement that involves calling the `upper` method on the right-hand side. For example, if we have a code like this:

```python
name = "Alice".upper()
greeting = "Hello".upper()
```

The rule will rewrite it as:

```python
alice = "Alice"
hello = "Hello"
```

Note that we use the `transform` key to specify that we want to apply the `lower` function to the meta variable `$X`. This function will convert any string to lowercase. ast-grep provides several built-in functions for common transformations, such as `upper`, `lower`, `capitalize`, `snake_case`, `camel_case`, etc. We can also define our own custom functions using Python syntax.

## See More in Example Catalog

If you want to see more examples of using ast-grep to rewrite code, you can check out our [example catalog]. There you can find various use cases and scenarios where ast-grep can help you refactor and improve your code. You can also contribute your own examples and share them with other users.