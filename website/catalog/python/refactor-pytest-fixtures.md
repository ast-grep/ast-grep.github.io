## Refactor pytest fixtures

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmIGZvbygkWCk6XG4gICRTIiwicmV3cml0ZSI6ImxvZ2dlci5sb2coJE1BVENIKSIsImNvbmZpZyI6ImlkOiBweXRlc3QtdHlwZS1oaW50LWZpeHR1cmVcbmxhbmd1YWdlOiBQeXRob25cbnV0aWxzOlxuICBpcy1maXh0dXJlLWZ1bmN0aW9uOlxuICAgIGtpbmQ6IGZ1bmN0aW9uX2RlZmluaXRpb25cbiAgICBmb2xsb3dzOlxuICAgICAga2luZDogZGVjb3JhdG9yXG4gICAgICBoYXM6XG4gICAgICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgICAgcmVnZXg6IF5maXh0dXJlJFxuICAgICAgICBzdG9wQnk6IGVuZFxuICBpcy10ZXN0LWZ1bmN0aW9uOlxuICAgIGtpbmQ6IGZ1bmN0aW9uX2RlZmluaXRpb25cbiAgICBoYXM6XG4gICAgICBmaWVsZDogbmFtZVxuICAgICAgcmVnZXg6IF50ZXN0X1xuICBpcy1weXRlc3QtY29udGV4dDpcbiAgICAjIFB5dGVzdCBjb250ZXh0IGlzIGEgbm9kZSBpbnNpZGUgYSBweXRlc3RcbiAgICAjIHRlc3QvZml4dHVyZVxuICAgIGluc2lkZTpcbiAgICAgIHN0b3BCeTogZW5kXG4gICAgICBhbnk6XG4gICAgICAgIC0gbWF0Y2hlczogaXMtZml4dHVyZS1mdW5jdGlvblxuICAgICAgICAtIG1hdGNoZXM6IGlzLXRlc3QtZnVuY3Rpb25cbiAgaXMtZml4dHVyZS1hcmc6XG4gICAgIyBGaXh0dXJlIGFyZ3VtZW50cyBhcmUgaWRlbnRpZmllcnMgaW5zaWRlIHRoZSBcbiAgICAjIHBhcmFtZXRlcnMgb2YgYSB0ZXN0L2ZpeHR1cmUgZnVuY3Rpb25cbiAgICBhbGw6XG4gICAgICAtIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgIC0gbWF0Y2hlczogaXMtcHl0ZXN0LWNvbnRleHRcbiAgICAgIC0gaW5zaWRlOlxuICAgICAgICAgIGtpbmQ6IHBhcmFtZXRlcnNcbnJ1bGU6XG4gIG1hdGNoZXM6IGlzLWZpeHR1cmUtYXJnXG4gIHJlZ2V4OiBeZm9vJFxuZml4OiAnZm9vOiBpbnQnXG4iLCJzb3VyY2UiOiJmcm9tIGNvbGxlY3Rpb25zLmFiYyBpbXBvcnQgSXRlcmFibGVcbmZyb20gdHlwaW5nIGltcG9ydCBBbnlcblxuaW1wb3J0IHB5dGVzdFxuZnJvbSBweXRlc3QgaW1wb3J0IGZpeHR1cmVcblxuQHB5dGVzdC5maXh0dXJlKHNjb3BlPVwic2Vzc2lvblwiKVxuZGVmIGZvbygpIC0+IEl0ZXJhYmxlW2ludF06XG4gICAgeWllbGQgNVxuXG5AZml4dHVyZVxuZGVmIGJhcihmb28pIC0+IHN0cjpcbiAgICByZXR1cm4gc3RyKGZvbylcblxuZGVmIHJlZ3VsYXJfZnVuY3Rpb24oZm9vKSAtPiBOb25lOlxuICAgICMgVGhpcyBmdW5jdGlvbiBkb2Vzbid0IHVzZSB0aGUgJ2ZvbycgZml4dHVyZVxuICAgIHByaW50KGZvbylcblxuZGVmIHRlc3RfMShmb28sIGJhcik6XG4gICAgcHJpbnQoZm9vLCBiYXIpXG5cbmRlZiB0ZXN0XzIoYmFyKTpcbiAgICAuLi4ifQ==)

### Description

One of the most commonly used testing framework in Python is [pytest](https://docs.pytest.org/en/8.2.x/). Among other things, it allows the use of [fixtures](https://docs.pytest.org/en/6.2.x/fixture.html).

Fixtures are defined as functions that can be required in test code, or in other fixtures, as an argument. This means that all functions arguments with a given name in a pytest context (test function or fixture) are essentially the same entity. However, not every editor's LSP is able to keep track of this, making refactoring challenging.

Using ast-grep, we can define some rules to match fixture definition and usage without catching similarly named entities in a non-test context.

First, we define utils to select pytest test/fixture functions.

```yaml
utils:
  is-fixture-function:
    kind: function_definition
    follows:
      kind: decorator
      has:
        kind: identifier
        regex: ^fixture$
        stopBy: end
  is-test-function:
    kind: function_definition
    has:
      field: name
      regex: ^test_
```

Pytest fixtures are declared with a decorator `@pytest.fixture`. We match the `function_definition` node that directly follows a `decorator` node. That decorator node must have a `fixture` identifier somewhere. This accounts for different location of the `fixture` node depending on the type of imports and whether the decorator is used as is or called with parameters.

Pytest functions are fairly straightforward to detect, as they always start with `test_` by convention.

The next utils builds onto those two to incrementally:

- Find if a node is inside a pytest context (test/fixture)
- Find if a node is an argument in such a context

```yaml
utils:
  is-pytest-context:
    # Pytest context is a node inside a pytest
    # test/fixture
    inside:
      stopBy: end
      any:
        - matches: is-fixture-function
        - matches: is-test-function
  is-fixture-arg:
    # Fixture arguments are identifiers inside the
    # parameters of a test/fixture function
    all:
      - kind: identifier
      - inside:
          kind: parameters
      - matches: is-pytest-context
```

Once those utils are declared, you can perform various refactoring on a specific fixture.

The following rule adds a type-hint to a fixture.

```yaml
rule:
  matches: is-fixture-arg
  regex: ^foo$
fix: "foo: int"
```

This one renames a fixture and all its references.

```yaml
rule:
  kind: identifier
  matches: is-fixture-context
  regex: ^foo$
fix: "five"
```

### Example

#### Renaming Fixtures

```python {2,6,7,12,13}
@pytest.fixture
def foo() -> int:
    return 5

@pytest.fixture(scope="function")
def some_fixture(foo: int) -> str:
    return str(foo)

def regular_function(foo) -> None:
    ...

def test_code(foo: int) -> None:
    assert foo == 5
```

#### Diff

```python {2,6,7,12}
@pytest.fixture
def foo() -> int: # [!code --]
def five() -> int: # [!code ++]
    return 5

@pytest.fixture(scope="function")
def some_fixture(foo: int) -> str: # [!code --]
def some_fixture(five: int) -> str: # [!code ++]
    return str(foo)

def regular_function(foo) -> None:
    ...

def test_code(foo: int) -> None: # [!code --]
def test_code(five: int) -> None: # [!code ++]
    assert foo == 5 # [!code --]
    assert five == 5 # [!code ++]
```

#### Type Hinting Fixtures

```python {6,12}
@pytest.fixture
def foo() -> int:
    return 5

@pytest.fixture(scope="function")
def some_fixture(foo) -> str:
    return str(foo)

def regular_function(foo) -> None:
    ...

def test_code(foo) -> None:
    assert foo == 5
```

#### Diff

```python {2,6,7,12}
@pytest.fixture
def foo() -> int:
    return 5

@pytest.fixture(scope="function")
def some_fixture(foo) -> str: # [!code --]
def some_fixture(foo: int) -> str: # [!code ++]
    return str(foo)

def regular_function(foo) -> None:
    ...

def test_code(foo) -> None: # [!code --]
def test_code(foo: int) -> None: # [!code ++]
    assert foo == 5
```
