## Switch Chai from `should` style to `expect` <Badge type="tip" text="Has Fix" />


* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1c3QiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoicmVsYXhlZCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiaWQ6IHNob3VsZF90b19leHBlY3RfaW5zdGFuY2VvZlxubGFuZ3VhZ2U6IFR5cGVTY3JpcHRcbnJ1bGU6XG4gIGFueTpcbiAgLSBwYXR0ZXJuOiAkTkFNRS5zaG91bGQuYmUuYW4uaW5zdGFuY2VvZigkVFlQRSlcbiAgLSBwYXR0ZXJuOiAkTkFNRS5zaG91bGQuYmUuYW4uaW5zdGFuY2VPZigkVFlQRSlcbmZpeDogfC1cbiAgZXhwZWN0KCROQU1FKS5pbnN0YW5jZU9mKCRUWVBFKVxuLS0tXG5pZDogc2hvdWxkX3RvX2V4cGVjdF9nZW5lcmljU2hvdWxkQmVcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBwYXR0ZXJuOiAkTkFNRS5zaG91bGQuYmUuJFBST1BcbmZpeDogfC1cbiAgZXhwZWN0KCROQU1FKS50by5iZS4kUFJPUFxuIiwic291cmNlIjoiaXQoJ3Nob3VsZCBwcm9kdWNlIGFuIGluc3RhbmNlIG9mIGNob2tpZGFyLkZTV2F0Y2hlcicsICgpID0+IHtcbiAgd2F0Y2hlci5zaG91bGQuYmUuYW4uaW5zdGFuY2VvZihjaG9raWRhci5GU1dhdGNoZXIpO1xufSk7XG5pdCgnc2hvdWxkIGV4cG9zZSBwdWJsaWMgQVBJIG1ldGhvZHMnLCAoKSA9PiB7XG4gIHdhdGNoZXIub24uc2hvdWxkLmJlLmEoJ2Z1bmN0aW9uJyk7XG4gIHdhdGNoZXIuZW1pdC5zaG91bGQuYmUuYSgnZnVuY3Rpb24nKTtcbiAgd2F0Y2hlci5hZGQuc2hvdWxkLmJlLmEoJ2Z1bmN0aW9uJyk7XG4gIHdhdGNoZXIuY2xvc2Uuc2hvdWxkLmJlLmEoJ2Z1bmN0aW9uJyk7XG4gIHdhdGNoZXIuZ2V0V2F0Y2hlZC5zaG91bGQuYmUuYSgnZnVuY3Rpb24nKTtcbn0pOyJ9)

### Description

[Chai](https://www.chaijs.com) is a BDD / TDD assertion library for JavaScript. It comes with [two styles](https://www.chaijs.com/) of assertions: `should` and `expect`.

The `expect` interface provides a function as a starting point for chaining your language assertions and works with `undefined` and `null` values.
The `should` style allows for the same chainable assertions as the expect interface, however it extends each object with a should property to start your chain and [does not work](https://www.chaijs.com/guide/styles/#should-extras) with `undefined` and `null` values.

This rule migrates Chai `should` style assertions to `expect` style assertions. Note this is an example rule and a excerpt from [the original rules](https://github.com/43081j/codemods/blob/cddfe101e7f759e4da08b7e2f7bfe892c20f6f48/codemods/chai-should-to-expect.yml).

### YAML
```yaml
id: should_to_expect_instanceof
language: TypeScript
rule:
  any:
  - pattern: $NAME.should.be.an.instanceof($TYPE)
  - pattern: $NAME.should.be.an.instanceOf($TYPE)
fix: |-
  expect($NAME).instanceOf($TYPE)
---
id: should_to_expect_genericShouldBe
language: TypeScript
rule:
  pattern: $NAME.should.be.$PROP
fix: |-
  expect($NAME).to.be.$PROP
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```js {2,5-9}
it('should produce an instance of chokidar.FSWatcher', () => {
  watcher.should.be.an.instanceof(chokidar.FSWatcher);
});
it('should expose public API methods', () => {
  watcher.on.should.be.a('function');
  watcher.emit.should.be.a('function');
  watcher.add.should.be.a('function');
  watcher.close.should.be.a('function');
  watcher.getWatched.should.be.a('function');
});
```

### Diff
<!-- use // [!code --] and // [!code ++] to annotate diff -->
```js
it('should produce an instance of chokidar.FSWatcher', () => {
  watcher.should.be.an.instanceof(chokidar.FSWatcher); // [!code --]
  expect(watcher).instanceOf(chokidar.FSWatcher); // [!code ++]
});
it('should expose public API methods', () => {
  watcher.on.should.be.a('function');   // [!code --]
  watcher.emit.should.be.a('function'); // [!code --]
  watcher.add.should.be.a('function');  // [!code --]
  watcher.close.should.be.a('function'); // [!code --]
  watcher.getWatched.should.be.a('function'); // [!code --]
  expect(watcher.on).to.be.a('function'); // [!code ++]
  expect(watcher.emit).to.be.a('function'); // [!code ++]
  expect(watcher.add).to.be.a('function'); // [!code ++]
  expect(watcher.close).to.be.a('function'); // [!code ++]
  expect(watcher.getWatched).to.be.a('function'); // [!code ++]
});
```

### Contributed by
[James](https://bsky.app/profile/43081j.com), by [this post](https://bsky.app/profile/43081j.com/post/3lgimzfxza22i)

### Exercise

Exercise left to the reader: can you write a rule to implement [this migration to `node:assert`](https://github.com/paulmillr/chokidar/pull/1409/files)?