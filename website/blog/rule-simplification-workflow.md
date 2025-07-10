---
author:
  - name: Herrington Darkholme
date: 2025-07-10
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: "Debugging Complex Rules: A Step-by-Step Simplification Workflow"
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/rule-simplification-workflow.html
  - - meta
    - property: og:description
      content: "Learn how to debug complex ast-grep rules through iterative simplification of both rules and test files."
---

# Debugging Complex Rules: A Step-by-Step Simplification Workflow

When working with complex ast-grep rules, you might encounter situations where your rule doesn't match as expected, or worse, causes runtime errors. This blog post demonstrates a systematic approach to debugging such issues through iterative simplification.

## The Problem: Complex Rules Can Be Hard to Debug

Let's start with a real-world example - a Python SQL injection detection rule that's more complex than it initially appears:

```yaml
id: some_sqli_rule
language: python
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list
    has:
      nthChild: 1
      any:
        - kind: identifier
          pattern: $VAR
        - has:
            stopBy: end
            kind: identifier
            pattern: $VAR
  inside:
    stopBy: end
    kind: module
    has:
      stopBy: end
      kind: assignment
      pattern: $VAR = $$$
```

And the corresponding test file:

```python
something = "value"  # If has comment it does catch the vulnerable line

vuln_param = other

x.execute(f"DROP TABLE IF EXISTS {vuln_param}")  # Vulnerable
```

This rule is designed to catch SQL injection vulnerabilities where a variable used in a database execute call is assigned elsewhere in the module. However, complex rules like this can be challenging to debug when they don't work as expected.

## The Simplification Workflow

Here's a systematic approach to debugging complex rules:

### Step 1: Start with the Original Rule and Test File

First, let's test our original rule:

```bash
ast-grep scan -r sqli_rule.yml test.py
```

If this doesn't work as expected, we need to start simplifying.

### Step 2: Simplify the Test File

Remove unrelated code that might be causing confusion:

```python
# Original file
something = "value"  # If has comment it does catch the vulnerable line

vuln_param = other

x.execute(f"DROP TABLE IF EXISTS {vuln_param}")  # Vulnerable
```

Simplified version:

```python
# Simplified file
vuln_param = other
x.execute(f"DROP TABLE IF EXISTS {vuln_param}")
```

Test again:

```bash
ast-grep scan -r sqli_rule.yml test_simple.py
```

### Step 3: Use `ast-grep dump` to Understand the AST Structure

When your rule doesn't match, use `ast-grep dump` to see the actual AST structure:

```bash
ast-grep dump test_simple.py
```

This will show you the AST structure of your code, helping you understand what kinds and patterns to match.

### Step 4: Simplify the Rule Iteratively

Start by simplifying the rule to its core components. Let's break down our complex rule:

**Step 4a: Test the basic pattern**

```yaml
id: test_basic_pattern
language: python
rule:
  pattern: $X.execute($$$)
```

**Step 4b: Add the argument constraint**

```yaml
id: test_with_args
language: python
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list
    has:
      nthChild: 1
      kind: identifier
      pattern: $VAR
```

**Step 4c: Add the context constraint**

```yaml
id: test_with_context
language: python
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list
    has:
      nthChild: 1
      kind: identifier
      pattern: $VAR
  inside:
    kind: module
    has:
      kind: assignment
      pattern: $VAR = $$$
```

Test each iteration:

```bash
ast-grep scan -r test_basic_pattern.yml test_simple.py
ast-grep scan -r test_with_args.yml test_simple.py
ast-grep scan -r test_with_context.yml test_simple.py
```

### Step 5: Identify the Issue

Through this process, you might discover that:

1. The basic pattern works
2. The argument constraint works
3. The context constraint fails

This helps you pinpoint exactly where the issue lies.

### Step 6: Fix and Iterate

Once you've identified the problematic part, you can:

1. Use `ast-grep dump` to understand the correct AST structure
2. Adjust your rule accordingly
3. Test with your simplified examples
4. Gradually add back complexity

## Common Debugging Patterns

### Pattern 1: Overly Specific Constraints

Sometimes rules are too specific. For example:

```yaml
# Too specific
has:
  stopBy: end
  kind: assignment
  pattern: $VAR = $$$
```

Can be simplified to:

```yaml
# More general
has:
  kind: assignment
  pattern: $VAR = $$$
```

### Pattern 2: Incorrect AST Kind Names

Use `ast-grep dump` to find the correct kind names:

```bash
ast-grep dump -l python -c "x.execute(param)"
```

### Pattern 3: Complex Nested Structures

Break down complex `has` and `inside` constraints:

```yaml
# Complex
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list
    has:
      nthChild: 1
      any:
        - kind: identifier
          pattern: $VAR
        - has:
            stopBy: end
            kind: identifier
            pattern: $VAR
```

Test each part separately:

```yaml
# Test the argument list first
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list

# Then test the nthChild constraint
rule:
  pattern: $X.execute($$$)
  has:
    kind: argument_list
    has:
      nthChild: 1
      kind: identifier
```

## Tips for Effective Debugging

1. **Start Simple**: Always begin with the simplest possible rule and test file
2. **Use `ast-grep dump`**: This is your best friend for understanding AST structure
3. **Test Incrementally**: Add one constraint at a time
4. **Keep Good Examples**: Maintain a collection of working simple examples
5. **Document Your Process**: Keep notes on what works and what doesn't

## Advanced Debugging Techniques

### Using the Playground

The [ast-grep playground](https://ast-grep.github.io/playground.html) is excellent for quick testing and iteration. You can:

1. Paste your code
2. Write your rule
3. See results immediately
4. Inspect the AST structure

### Using Debug Mode

ast-grep provides verbose output that can help with debugging:

```bash
ast-grep scan -r rule.yml file.py --debug
```

### Testing with Multiple Languages

If you're working with multiple languages, create separate test files for each:

```bash
ast-grep scan -r rule.yml test.py test.js test.ts
```

## Conclusion

Debugging complex ast-grep rules doesn't have to be frustrating. By following this systematic simplification workflow:

1. Start with your complex rule and test file
2. Simplify the test file by removing unrelated code
3. Use `ast-grep dump` to understand the AST structure
4. Iteratively simplify the rule, testing each step
5. Identify the specific issue and fix it
6. Gradually add back complexity

You can efficiently identify and resolve issues in even the most complex rules. Remember, the key is patience and systematic testing - don't try to debug everything at once!

This workflow has helped many developers successfully create and maintain complex ast-grep rules for their codebases. Give it a try the next time you encounter a tricky rule debugging situation!