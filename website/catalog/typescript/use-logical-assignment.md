## Use Logical Assignment Operators

* [Playground Link](/playground.html#eyJtb2RlIjoiUGF0Y2giLCJsYW5nIjoiamF2YXNjcmlwdCIsInF1ZXJ5IjoiJEEgPSAkQSB8fCAkQiIsInJld3JpdGUiOiIkQSB8fD0gJEIiLCJzdHJpY3RuZXNzIjoic21hcnQiLCJzZWxlY3RvciI6IiIsImNvbmZpZyI6IiMgWUFNTCBSdWxlIGlzIG1vcmUgcG93ZXJmdWwhXG4jIGh0dHBzOi8vYXN0LWdyZXAuZ2l0aHViLmlvL2d1aWRlL3J1bGUtY29uZmlnLmh0bWwjcnVsZVxucnVsZTpcbiAgYW55OlxuICAgIC0gcGF0dGVybjogY29uc29sZS5sb2coJEEpXG4gICAgLSBwYXR0ZXJuOiBjb25zb2xlLmRlYnVnKCRBKVxuZml4OlxuICBsb2dnZXIubG9nKCRBKSIsInNvdXJjZSI6ImNvbnN0IGEgPSB7IGR1cmF0aW9uOiA1MCwgdGl0bGU6ICcnIH07XG5cbmEuZHVyYXRpb24gPSBhLmR1cmF0aW9uIHx8IDEwO1xuY29uc29sZS5sb2coYS5kdXJhdGlvbik7XG5hLnRpdGxlID0gYS50aXRsZSB8fCAndGl0bGUgaXMgZW1wdHkuJztcbmNvbnNvbGUubG9nKGEudGl0bGUpO1xuIn0=)

### Description

A logical assignment operator in JavaScript combines a logical operation (like OR or nullish coalescing) with an assignment. It updates a variable or property only under specific conditions, making code more concise.

This is a relatively new feature in JavaScript (introduced in ES2021), so older codebases might not use it yet. This rule identifies instances where a variable is assigned a value using a logical OR (`||`) operation and suggests replacing it with the more concise logical assignment operator (`||=`).

### Pattern

```shell
ast-grep -p '$A = $A || $B' -r '$A ||= $B' -l ts
```

### Example

```ts {3,5}
const a = { duration: 50, title: '' };

a.duration = a.duration || 10;
console.log(a.duration);
a.title = a.title || 'title is empty.';
console.log(a.title);
```

### Diff

```ts
const a = { duration: 50, title: '' };

a.duration = a.duration || 10; // [!code --]
a.duration ||= 10; // [!code ++]
console.log(a.duration);
a.title = a.title || 'title is empty.'; // [!code --]
a.title ||= 'title is empty.'; // [!code ++]
console.log(a.title);
```

### Contributed by
Inspired by [this tweet](https://x.com/YTCodeAntonio/status/1973720331656605809).