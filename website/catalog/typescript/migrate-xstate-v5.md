## Migrate XState to v5 from v4 <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImlmICgkQSkgeyAkJCRCIH0iLCJyZXdyaXRlIjoiaWYgKCEoJEEpKSB7XG4gICAgcmV0dXJuO1xufVxuJCQkQiIsImNvbmZpZyI6InV0aWxzOlxuICBGUk9NX1hTVEFURTogeyBraW5kOiBpbXBvcnRfc3RhdGVtZW50LCBoYXM6IHsga2luZDogc3RyaW5nLCByZWdleDogeHN0YXRlIH0gfVxuICBYU1RBVEVfRVhQT1JUOlxuICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgICBpbnNpZGU6IHsgaGFzOiB7IG1hdGNoZXM6IEZST01fWFNUQVRFIH0sIHN0b3BCeTogZW5kIH1cbnJ1bGU6IHsgcmVnZXg6IF5NYWNoaW5lfGludGVycHJldCQsIHBhdHRlcm46ICRJTVBPUlQsIG1hdGNoZXM6IFhTVEFURV9FWFBPUlQgfVxudHJhbnNmb3JtOlxuICBTVEVQMTogXG4gICAgcmVwbGFjZToge2J5OiBjcmVhdGUkMSwgcmVwbGFjZTogKE1hY2hpbmUpLCBzb3VyY2U6ICRJTVBPUlQgfVxuICBGSU5BTDpcbiAgICByZXBsYWNlOiB7IGJ5OiBjcmVhdGVBY3RvciwgcmVwbGFjZTogaW50ZXJwcmV0LCBzb3VyY2U6ICRTVEVQMSB9XG5maXg6ICRGSU5BTFxuLS0tIFxucnVsZTogeyBwYXR0ZXJuOiAkTUFDSElORS53aXRoQ29uZmlnIH1cbmZpeDogJE1BQ0hJTkUucHJvdmlkZVxuLS0tXG5ydWxlOlxuICBraW5kOiBwcm9wZXJ0eV9pZGVudGlmaWVyXG4gIHJlZ2V4OiBec2VydmljZXMkXG4gIGluc2lkZTogeyBwYXR0ZXJuOiAgJE0ud2l0aENvbmZpZygkJCRBUkdTKSwgc3RvcEJ5OiBlbmQgfVxuZml4OiBhY3RvcnMiLCJzb3VyY2UiOiJpbXBvcnQgeyBNYWNoaW5lLCBpbnRlcnByZXQgfSBmcm9tICd4c3RhdGUnO1xuXG5jb25zdCBtYWNoaW5lID0gTWFjaGluZSh7IC8qLi4uKi99KTtcblxuY29uc3Qgc3BlY2lmaWNNYWNoaW5lID0gbWFjaGluZS53aXRoQ29uZmlnKHtcbiAgYWN0aW9uczogeyAvKiAuLi4gKi8gfSxcbiAgZ3VhcmRzOiB7IC8qIC4uLiAqLyB9LFxuICBzZXJ2aWNlczogeyAvKiAuLi4gKi8gfSxcbn0pO1xuXG5jb25zdCBhY3RvciA9IGludGVycHJldChzcGVjaWZpY01hY2hpbmUsIHtcbi8qIGFjdG9yIG9wdGlvbnMgKi9cbn0pOyJ9)

### Description

[XState](https://xstate.js.org/) is a state management/orchestration library based on state machines, statecharts, and the actor model. It allows you to model complex logic in event-driven ways, and orchestrate the behavior of many actors communicating with each other.

XState's v5 version introduced some breaking changes and new features compared to v4.
While the migration should be a straightforward process, it is a tedious process and requires knowledge of the differences between v4 and v5.

ast-grep provides a way to automate the process and a way to encode valuable knowledge to executable rules.

The following example picks up some migration items and demonstrates the power of ast-grep's rule system.

### YAML

The rules below correspond to XState v5's [`createMachine`](https://stately.ai/docs/migration#use-createmachine-not-machine), [`createActor`](https://stately.ai/docs/migration#use-createactor-not-interpret), and [`machine.provide`](https://stately.ai/docs/migration#use-machineprovide-not-machinewithconfig).

The example shows how ast-grep can use various features like [utility rule](/guide/rule-config/utility-rule.html), [transformation](/reference/yaml/transformation.html) and [multiple rule in single file](/reference/playground.html#test-multiple-rules) to automate the migration. Each rule has a clear and descriptive `id` field that explains its purpose.

For more information, you can use [Codemod AI](https://app.codemod.com/studio?ai_thread_id=new) to provide more detailed explanation for each rule.

```yaml
id: migrate-import-name
utils:
  FROM_XS: {kind: import_statement, has: {kind: string, regex: xstate}}
  XS_EXPORT:
    kind: identifier
    inside: { has: { matches: FROM_XS }, stopBy: end }
rule: { regex: ^Machine|interpret$, pattern: $IMPT, matches: XS_EXPORT }
transform:
  STEP1:
    replace: {by: create$1, replace: (Machine), source: $IMPT }
  FINAL:
    replace: { by: createActor, replace: interpret, source: $STEP1 }
fix: $FINAL

---

id: migrate-to-provide
rule: { pattern: $MACHINE.withConfig }
fix: $MACHINE.provide

---

id: migrate-to-actors
rule:
  kind: property_identifier
  regex: ^services$
  inside: { pattern:  $M.withConfig($$$ARGS), stopBy: end }
fix: actors
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```js {1,3,5,8,11}
import { interpret, Machine } from 'xstate'

const machine = Machine({/*...*/})

const specificMachine = machine.withConfig({
  actions: {/* ... */},
  guards: {/* ... */},
  services: {/* ... */},
})

const actor = interpret(specificMachine, {
  /* actor options */
})
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```js
import { Machine, interpret } from 'xstate'; // [!code --]
import { createMachine, createActor } from 'xstate'; // [!code ++]

const machine = Machine({ /*...*/}); // [!code --]
const machine = createMachine({ /*...*/}); // [!code ++]

const specificMachine = machine.withConfig({ // [!code --]
const specificMachine = machine.provide({ // [!code ++]
  actions: { /* ... */ },
  guards: { /* ... */ },
  services: { /* ... */ }, // [!code --]
  actors: { /* ... */ }, // [!code ++]
});

const actor = interpret(specificMachine, { // [!code --]
const actor = createActor(specificMachine, { // [!code ++]
  /* actor options */
});
```

### Contributed by

Inspired by [XState's blog](https://stately.ai/blog/2023-12-01-xstate-v5).
