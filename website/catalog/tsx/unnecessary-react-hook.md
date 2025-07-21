## Avoid Unnecessary React Hook
* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6InV0aWxzOlxuICBob29rX2NhbGw6XG4gICAgaGFzOlxuICAgICAga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICByZWdleDogXnVzZVxuICAgICAgc3RvcEJ5OiBlbmRcbnJ1bGU6XG4gIGFueTpcbiAgLSBwYXR0ZXJuOiBmdW5jdGlvbiAkRlVOQygkJCQpIHsgJCQkIH1cbiAgLSBwYXR0ZXJuOiBsZXQgJEZVTkMgPSAoJCQkKSA9PiAkJCQgXG4gIC0gcGF0dGVybjogY29uc3QgJEZVTkMgPSAoJCQkKSA9PiAkJCRcbiAgaGFzOlxuICAgIHBhdHRlcm46ICRCT0RZXG4gICAga2luZDogc3RhdGVtZW50X2Jsb2NrXG4gICAgc3RvcEJ5OiBlbmQgXG5jb25zdHJhaW50czpcbiAgRlVOQzoge3JlZ2V4OiBedXNlIH1cbiAgQk9EWTogeyBub3Q6IHsgbWF0Y2hlczogaG9va19jYWxsIH0gfSBcbiIsInNvdXJjZSI6ImZ1bmN0aW9uIHVzZUlBbU5vdEhvb2tBY3R1YWxseShhcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0NhbGxlZCBpbiBSZWFjdCBidXQgSSBkb250IG5lZWQgdG8gYmUgYSBob29rJylcbiAgICByZXR1cm4gYXJncy5sZW5ndGhcbn1cbmNvbnN0IHVzZUlBbU5vdEhvb2tUb28gPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdDYWxsZWQgaW4gUmVhY3QgYnV0IEkgZG9udCBuZWVkIHRvIGJlIGEgaG9vaycpXG4gICAgcmV0dXJuIGFyZ3MubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIHVzZUhvb2soKSB7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFsIGhvb2snKSAgIFxuICAgIH0pXG59In0=)

### Description

React hook is a powerful feature in React that allows you to use state and other React features in a functional component.

However, you should avoid using hooks when you don't need them. If the code does not contain using any other React hooks,
it can be rewritten to a plain function. This can help to separate your application logic from the React-specific UI logic.


### YAML

```yaml
id: unnecessary-react-hook
language: Tsx
utils:
  hook_call:
    has:
      kind: call_expression
      regex: ^use
      stopBy: end
rule:
  any:
  - pattern: function $FUNC($$$) { $$$ }
  - pattern: let $FUNC = ($$$) => $$$
  - pattern: const $FUNC = ($$$) => $$$
  has:
    pattern: $BODY
    kind: statement_block
    stopBy: end
constraints:
  FUNC: {regex: ^use }
  BODY: { not: { matches: hook_call } }
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```tsx {1-8}
function useIAmNotHookActually(args) {
    console.log('Called in React but I dont need to be a hook')
    return args.length
}
const useIAmNotHookToo = (...args) => {
    console.log('Called in React but I dont need to be a hook')
    return args.length
}

function useTrueHook() {
    useEffect(() => {
      console.log('Real hook')
    })
}
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim)
