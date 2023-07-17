# Pattern Syntax

In this guide we will walk through ast-grep's pattern syntax. The example will be written in JavaScript, but the basic principle will
apply to other languages as well.

## Pattern Matching

ast-grep uses pattern code to construct AST tree and match that against target code. The pattern code can search
through the full syntax tree, so pattern can also match nested expression. For example, the pattern `a + 1` can match all the following
code.

```javascript

const b = a + 1

funcCall(a + 1)

deeplyNested({
  target: a + 1
})
```

::: warning
Pattern code must be valid code that tree-sitter can parse.
:::

## Meta Variable
It is usually desirable to write a pattern to match dynamic content.

We can use meta variables to match sub expression in pattern.

Meta variables start with the `$` sign, followed by a name composed of upper case letters `A-Z`, underscore `_` or digits `1-9`.
`$META_VARIABLE` is a wildcard expression that can match any **single** AST node.

Think it as REGEX dot `.`, except it is not textual.


:::tip Valid meta variables
`$META`, `$META_VARIABLE`, `$META_VAR1`
:::


:::danger Invalid meta variables
`$invalid`, `$Svalue`, `$123`
:::

The pattern `console.log($GREETING)` will match all the following.

```javascript
function tryAstGrep() {
  console.log('Hello World')
}

const multiLineExpression =
  console
   .log('Also matched!')
```

But it will not match these.

```javascript
// console.log(123) in comment is not matched
'console.log(123) in string' // is not matched as well
console.log() // mismatch argument
console.log(a, b) // too many arguments
```

Note, one meta variable `$MATCH` will match one **single** AST node, so the last two `console.log` calls do not match the pattern.
Let's see how we can match multiple AST nodes.

## Multi Meta Variable

We can use `$$$` to match zero or more AST nodes, including function arguments, parameters or statements. These variables can also be named, for example: `console.log($$$ARGS)`.


### Function Arguments
For example, `console.log($$$)` can match

```javascript
console.log()                       // matches zero AST node
console.log('hello world')          // matches one node
console.log('debug: ', key, value)  // matches multiple nodes
console.log(...args)                // it also matches spread
```

### Function Parameters

`function $FUNC($$$ARGS) { $$$ }` will match

```javascript
function foo(bar) {
  return bar
}

function noop() {}

function add(a, b, c) {
  return a + b + c
}
```

:::details `ARGS` will be populated with a list of AST nodes. Click to see details.
|Code|Match|
|---|----|
|`function foo(bar) { ... }` | [`bar`] |
|`function noop() {}` | [] |
|`function add(a, b, c) { ... }` | [`a`, `b`, `c`] |
:::

## Meta Variable Capturing

Meta variable is also similar to [capture group](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences) in regular expression.
You can reuse same name meta variables to find previously occurred AST nodes.

For example, the pattern `$A == $A` will have the following result.

```javascript
// will match these patterns
a == a
1 + 1 == 1 + 1
// but will not match these
a == b
1 + 1 == 2
```

### Non Capturing Match

You can also suppress meta variable capturing. All meta variables with name starting with underscore `_` will not be captured.

```javascript
// Given this pattern

$_FUNC($_FUNC)

// it will match all function call with one argument or spread call
test(a)
testFunc(1 + 1)
testFunc(...args)
```

Note in the example above, even if two meta variables have the same name `$_FUNC`, each occurrence of `$_FUNC` can match different content because the are not captured.

:::info Why use non-capturing match?
This is a useful trick to micro-optimize pattern matching speed, since we don't need to create a [HashMap](https://doc.rust-lang.org/stable/std/collections/struct.HashMap.html) for bookkeeping.
:::

### Capture Unnamed Nodes
A meta variable pattern `$META` will capture [named nodes](/advanced/core-concepts.html#named-vs-unnamed) by default.
To capture [unnamed nodes](/advanced/core-concepts.html#named-vs-unnamed), you can use double dollar sign `$$VAR`.

Namedness is an advanced topic in [Tree-sitter](https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes). You can read this [in-depth guide](/advanced/core-concepts.html) for more background.

## More Powerful Rule

Pattern is a fast and easy way to match code. But it is not as powerful as [rule](/guide/rule-config.html#rule-file) which can match code with more [precise selector](/guide/rule-config/atomic-rule.html#kind) or [more context](/guide/rule-config/relational-rule.html).

We will cover using rules in next chapter.

:::tip Pro Tip
You can write a standalone [rule file](/reference/rule.html) and the command `sg scan -r rule.yml` to perform an [ad-hoc search](/guide/tooling-overview.html#run-one-single-query-or-one-single-rule).
:::