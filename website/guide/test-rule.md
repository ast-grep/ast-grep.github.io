# Test Your Rule

Though it is easy to write a simple rule to match some code in ast-grep, writing a robust and comprehensive rule to cover codebase in production is still a pretty challenging work.

To alleviate this pain, ast-grep provides a builtin tool to help you test your rule. You can provide a list of `valid` cases and `invalid` cases to test against your rule.

## Basic Concepts

Ideally, a perfect rule will approve all valid code and report issues only for all invalid code. Testing a rule should also cover two categories of code accordingly. If you are familiar with [detection theory](https://en.wikipedia.org/wiki/Detection_theory), you should recognize that testing rule will involve the four scenarios tabulated below.

|Code Validity \ Rule Report | No Report | Has Report |
|----------------------------|-----------|------------|
|         Valid              | Validated |    Noisy   |
|         Invalid            | Missing   |  Reported  |

* If ast-grep reports error for invalid code, it is a correct **reported** match.
* If ast-grep reports error for valid code, it is called **noisy** match.
* If ast-grep reports nothing for invalid code, we have a **missing** match.
* If ast-grep reports nothing for valid code, it is called **validated** match.

We will see these four case status in ast-grep's test output.

## Test Setup

Let's write a test for the rule we wrote in the [previous section](/guide/rule-config.html#rule-file).

To write a test, we first need to specify a rule test directory in `sgconfig.yml`. This directory will be used to store all test cases for rules.

Suppose we have the `sgconfig.yml` as below.
```yaml{4,5}
ruleDirs:
  - rules
# testConfigs contains a list of test directories for rules.
testConfigs:
  - testDir: rule-tests
```

The configuration file should be located at a directory that looks like this.

```bash{3,5}
my-awesome-rules/
  |- rules/
  | |- no-await-in-loop.yml        # test file
  |- rule-tests/
  | |- no-await-in-loop-test.yml   # rule file
  |- sgconfig.yml
```

`rules` folder contains all rule files, while `rule-tests` folder contains all test cases for rules.

In the example, `no-await-in-loop.yml` contains the rule configuration we wrote before.

Below are all relevant files used in this example.

::: code-group
```yaml [no-await-in-loop.yml]{1}
id: no-await-in-loop
message: Don't use await inside of loops
severity: warning
language: TypeScript
rule:
  all:
    - inside:
        any:
          - kind: for_in_statement
          - kind: while_statement
        stopBy:
          end
    - pattern: await $_
```


```yaml [no-await-in-loop-test.yml]{1}
id: no-await-in-loop
valid:
  - for (let a of b) { console.log(a) }
  # .... more valid test cases
invalid:
  - async function foo() { for (var bar of baz) await bar; }
  # .... more invalid test cases
```


```yaml [sgconfig.yml]{4,5}
ruleDirs:
  - rules
# testConfigs contains a list of test directories for rules.
testConfigs:
  - testDir: rule-tests
```
:::

We will delve into `no-await-in-loop-test.yml` in next section.

## Test Case Configuration

Test configuration file is very straightforward. It contains a list of `valid` and `invalid` cases with an `id` field to specify which rule will be tested against.

`valid` is a list of source code that we **do not** expect the rule to report any issue.
`invalid` is a list of source code that we **do** expect the rule to report some issues.

```yaml
id: no-await-in-loop
valid:
  - for (let a of b) { console.log(a) }
  # .... more valid test cases
invalid:
  - async function foo() { for (var bar of baz) await bar; }
  # .... more invalid test cases
```

After writing the test configuration file, you can run `sg test` in the root folder to test your rule.
We will discuss the `skip-snapshot-tests` option later.

```bash
$ sg test --skip-snapshot-tests

Running 1 tests
PASS no-await-in-loop  .........................
test result: ok. 1 passed; 0 failed;
```

ast-grep will report the passed rule and failed rule. The dots behind test case id represent passed cases.

If we swap the test case and make them failed, we will get the following output.

```bash
Running 1 tests
FAIL no-await-in-loop  ...........N............M

----------- Failure Details -----------
[Noisy] Expect no-await-in-loop to report no issue, but some issues found in:

  async function foo() { for (var bar of baz) await bar; }

[Missing] Expect rule no-await-in-loop to report issues, but none found in:

  for (let a of b) { console.log(a) }

Error: test failed. 0 passed; 1 failed;
```

The output shows that we have two failed cases. One is a **noisy** match, which means ast-grep reports error for valid code. The other is a **missing** match, which means ast-grep reports nothing for invalid code.
In the test summary, we can see the cases are marked with `N` and `M` respectively.
In failure details, we can see the detailed code snippet for each case.

Besides testing code validity, we can further test rule's output like error's message and span. This is what snapshot test will cover.

## Snapshot Test
Let's rerun `sg test` without `--skip-snapshot-tests` option.
This time we will get test failure that invalid code error does not have a matching snapshot.
Previously we use the `skip-snapshot-tests` option to suppress snapshot test, which is useful when you are still working on your rule. But after the rule is polished, we can create snapshot to capture the desired output of the rule.

The `--update-all` or `-U` will generate a snapshot directory for us.

```bash
my-awesome-rules/
  |- rules/
  | |- no-await-in-loop.yml               # test file
  |- rule-tests/
  | |- no-await-in-loop-test.yml          # rule file
  | |- __snapshots__/                     # snapshots folder
  | |  |- no-await-in-loop-snapshot.yml   # generated snapshot file!
  |- sgconfig.yml
```

The generated `__snapshots__` folder will store all the error output and later test run will match against them.
After the snapshot is generated, we can run `sg test` again, without any option this time, and pass all the test cases!

Furthermore, when we change the rule or update the test case, we can use interactive mode to update the snapshot.

Running this command

```bash
sg test --interactive
```

ast-grep will spawn an interactive session to ask you select desired snapshot updates. Example interactive session will look like this. Note the snapshot diff is highlighted in red/green color.

```diff
[Wrong] no-await-in-loop snapshot is different from baseline.
Diff:
 labels:
 - source: await bar
   style: Primary
-  start: 2
+  start: 28
   end: 37
 - source: do { await bar; } while (baz);
   style: Secondary
For Code:
  async function foo() { do { await bar; } while (baz); }

Accept new snapshot? (Yes[y], No[n], Accept All[a], Quit[q])
```

Pressing the `y` key will accept the new snapshot and update the snapshot file.
