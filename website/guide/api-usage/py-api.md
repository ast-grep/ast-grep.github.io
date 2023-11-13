# Python API

ast-grep's Python API is powered by [PyO3](https://pyo3.rs/).
You can write Python to programmatically inspect and change syntax trees.

To try out ast-grep's Python API, you can use the [online colab notebook](https://colab.research.google.com/drive/1nVT6rQKRIPv0TsKpCv5uD-Zuw-lUC67A?usp=sharing).

## Installation

ast-grep's Python library is distributed on PyPI. You can install it with pip.

```bash
pip install ast-grep-py
```

## Core Concepts

The core concepts in ast-grep's Python API are:
* `SgRoot`: a class to parse a string into a syntax tree
* `SgNode`: a node in the syntax tree

:::tip Make AST like a XML/HTML doc!
Using ast-grep's API is like [web scraping](https://opensource.com/article/21/9/web-scraping-python-beautiful-soup) using [beautiful soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) or [pyquery](https://pyquery.readthedocs.io/en/latest/). You can use `SgNode` to traverse the syntax tree and collect information from the nodes.
:::

A common workflow to use ast-grep's Python API is:
1. Parse a string into a syntax tree by using `SgRoot`
2. Get the root node of the syntax tree by calling `root.root()`
3. `find` relevant nodes by using patterns or rules
4. Collect information from the nodes

**Example:**

```python
from ast_grep_py import SgRoot

root = SgRoot("print('hello world')", "python") # 1. parse
node = root.root()                              # 2. get root
print_stmt = node.find(pattern="print($A)")     # 3. find
print_stmt.get_match('A').text()                # 4. collect information
# 'hello world'
```

### `SgRoot`

The `SgRoot` class has the following signature:

```python
class SgRoot:
    def __init__(self, src: str, language: str) -> None: ...
    def root(self) -> SgNode: ...
```

`__init__` takes two arguments: the first argument is the source code string, and the second argument is the language name.
`root` returns the root node of the syntax tree, which is an instance of `SgNode`.

**Example:**

```python
root = SgRoot("print('hello world')", "python") # 1. parse
node = root.root()                              # 2. get root
```

The code above parses the string `print('hello world')` into a syntax tree, and gets the root node of the syntax tree.

The root node can be used to find other nodes in the syntax tree.


### `SgNode`

`SgNode` is the most important class in ast-grep's Python API. It provides methods to inspect and traverse the syntax tree.
The following sections will introduce several methods in `SgNode`.

**Example:**

```python
node = root.root()
string = node.find(kind="string")
assert string # assume we can find a string node in the source
print(string.text())
```

## Search

You can use `find` and `find_all` to search for nodes in the syntax tree.

* `find` returns the first node that matches the pattern or rule.
* `find_all` returns a list of nodes that match the pattern or rule.

```python
# Search
class SgNode:
    @overload
    def find(self, **kwargs: Unpack[Rule]) -> Optional[SgNode]: ...
    @overload
    def find_all(self, **kwargs: Unpack[Rule]) -> List[SgNode]: ...
    @overload
    def find(self, config: Config) -> Optional[SgNode]: ...
    @overload
    def find_all(self, config: Config) -> List[SgNode]: ...
```

`find` has two overloads: one takes keyword arguments of [`Rule`](/reference/api.html#rule), and the other takes a [`Config`](/reference/api.html#config) object.

### Search with Rule
Using keyword arguments rule is the most straightforward way to search for nodes.

The argument name is the key of a rule, and the argument value is the rule's value.
You can passing multiple keyword arguments to `find` to search for nodes that match **all** the rules.

```python
root = SgRoot("print('hello world')", "python")
node = root.root()
node.find(pattern="print($A)") # will return the print function call
node.find(kind="string") # will return the string 'hello world'
# below will return print function call because it matches both rules
node.find(pattern="print($A)", kind="call")
# below will return None because the pattern cannot be a string literal
node.find(pattern="print($A)", kind="string")

strings = node.find_all(kind="string") # will return [SgNode("hello world")]
assert len(strings) == 1
```

### Search with Config

You can also use a `Config` object to search for nodes. This is similar to directly use YAML in the command line.

The main difference between using `Config` and using `Rule` is that `Config` has more options to control the search behavior, like [`constraints`](/guide/rule-config.html#constraints) and [`utils`](/guide/rule-config/utility-rule.html).

```python
# will find a string node with text 'hello world'
root.root().find({
  "rule": {
    "pattern": "print($A)",
  },
  "constraints": {
    "A": { "regex": "hello" }
  }
})
# will return None because constraints are not satisfied
root.root().find({
  "rule": {
    "pattern": "print($A)",
  },
  "constraints": {
    "A": { "regex": "no match" }
  }
})
```

## Match

Once we find a node, we can use the following methods to get meta variables from the search.

The `get_match` method returns the single node that matches the [single meta variable](/guide/pattern-syntax.html#meta-variable).

And th `get_multiple_matches` returns a list of nodes that match the [multi meta variable](/guide/pattern-syntax.html#multi-meta-variable).

```python
class SgNode:
    def get_match(self, meta_var: str) -> Optional[SgNode]: ...
    def get_multiple_matches(self, meta_var: str) -> List[SgNode]: ...
    def get_transformed(self, meta_var: str) -> Optional[str]: ...
    def __getitem__(self, meta_var: str) -> SgNode: ...
```

**Example:**

```python
src = """
print('hello')
print('hello', 'world', '!')
"""
root = SgRoot(src, "python").root()
node = root.find(pattern="print($A)")
arg = node.get_match("A") # returns SgNode('hello')
assert arg # assert node is found
arg.text() # returns 'hello'
# returns [] because $A and $$$A are different
node.get_multiple_matches("A")

node = root.find(pattern="print($$$ARGS)")
# returns [SgNode('hello'), SgNode('world'), SgNode('!')]
node.get_multiple_matches("ARGS")
node.get_match("A") # returns None
```

`SgNode` also supports `__getitem__` to get the match of single meta variable.

It is equivalent to `get_match` except that it will either return `SgNode` or raise a `KeyError` if the match is not found.

Use `__getitem__` to avoid unnecessary `None` checks when you are using a type checker.

```python
node = root.find(pattern="print($A)")
# node.get_match("A").text() # error: node.get_match("A") can be None
node["A"].text() # Ok
```

## Inspection
The following methods are used to inspect the node.

```python
# Node Inspection
class SgNode:
    def range(self) -> Range: ...
    def is_leaf(self) -> bool: ...
    def is_named(self) -> bool: ...
    def is_named_leaf(self) -> bool: ...
    def kind(self) -> str: ...
    def text(self) -> str: ...
```

**Example:**

```python
root = SgRoot("print('hello world')", "python")
node = root.root()
node.text() # will return "print('hello world')"
```

Another important method is `range`, which returns two `Pos` object representing the start and end of the node.

One `Pos` contains the line, column, and offset of that position. All of them are 0-indexed.

You can use the range information to locate the source and modify the source code.

```python
rng = node.range()
pos = rng.start # or rng.end, both are `Pos` objects
pos.line # 0, line starts with 0
pos.column # 0, line starts with 0
rng.end.index # 17, index starts with 0
```

## Refinement

You can also filter nodes after matching by using the following methods.

This is dubbed as "refinement" in the documentation. Note these refinement methods only support using `Rule`.

```python
# Search Refinement
class SgNode:
    def matches(self, **rule: Unpack[Rule]) -> bool: ...
    def inside(self, **rule: Unpack[Rule]) -> bool: ...
    def has(self, **rule: Unpack[Rule]) -> bool: ...
    def precedes(self, **rule: Unpack[Rule]) -> bool: ...
    def follows(self, **rule: Unpack[Rule]) -> bool: ...
```

**Example:**

```python
node = root.find(pattern="print($A)")
if node["A"].matches(kind="string"):
  print("A is a string")
```

## Traversal

You can traverse the tree using the following methods, like using pyquery.

```python
# Tree Traversal
class SgNode:
    def get_root(self) -> SgRoot: ...
    def field(self, name: str) -> Optional[SgNode]: ...
    def parent(self) -> Optional[SgNode]: ...
    def child(self, nth: int) -> Optional[SgNode]: ...
    def children(self) -> List[SgNode]: ...
    def ancestors(self) -> List[SgNode]: ...
    def next(self) -> Optional[SgNode]: ...
    def next_all(self) -> List[SgNode]: ...
    def prev(self) -> Optional[SgNode]: ...
    def prev_all(self) -> List[SgNode]: ...
```