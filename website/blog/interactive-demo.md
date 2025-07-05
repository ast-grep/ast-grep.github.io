---
author:
  - name: Herrington Darkholme
date: 2025-06-07
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Interactive Code Fixes with Multiple Options!
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/interactive-demo.html
  - - meta
    - property: og:description
      content: Today, we're thrilled to showcase a game-changing feature, multi-option interactive code fixes!
---

# Interactive Code Fixes with Multiple Options!

Today, we're thrilled to showcase a game-changing feature: **multi-option interactive code fixes!**

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/6m0xTwYaM_A?si=-ywQmlg6Wrg0FfGq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Beyond Simple Search: Interactive Refactoring

ast-grep's interactive mode, activated with `ast-grep scan --interactive`, transforms code analysis into a dynamic, actionable workflow. When a rule identifies a pattern match, you're presented with:

1. **Clear Diff Views:** Instantly see the problematic code (red) and the proposed change (green), making it easy to understand the impact of the fix.
2. **Contextual Markdown Notes:** Rules can embed rich Markdown notes, providing instant documentation, best practices, and explanations directly in your terminal – no need to jump to external docs.

## The Power of Choice: Multiple Fix Options

This is where ast-grep truly stands out. Instead of a single, rigid fix, many rules now offer **multiple, intelligent remediation options**.

**How it works:**

- When a match is found, ast-grep displays a list of available fixes.
- Simply use the **`tab` key** to cycle through the different fix proposals.
- Once you've found the ideal solution, hit `Enter` to apply it.

This flexibility allows you to choose the fix that best aligns with your project's coding standards or specific refactoring goals.

## Real-World Example: Angular `@Input()` Optionality

Consider a common TypeScript scenario in Angular: an `@Input()` decorator where the component property is typed as `string`, but it's optional by default (meaning it could be `undefined`).

ast-grep's rule for this issue intelligently offers two distinct fixes:

1. **Add `undefined` to Type:** Transforms `test: string;` to `test: string | undefined;`, explicitly acknowledging the optionality in the type system.
2. **Make Input Required:** Adds `{ required: true }` to the `@Input()` decorator, enforcing that the input must always be provided.

You choose the solution that fits your use case, and ast-grep applies the transformation seamlessly.

## Behind the Scenes: Configurable Fixes

This powerful multi-fix capability is driven by the rule's YAML configuration. Rules can define an array of `fix` templates, each with a unique `title` and `template`, allowing rule authors to provide comprehensive repair options.

### Streamline Your Workflow Today!

Ast-grep with its interactive multi-fix feature is a game-changer for maintaining code quality, enforcing standards, and accelerating large-scale code transformations. It puts the power of intelligent, context-aware refactoring directly into your hands.

**Ready to refactor like a pro?**
Give ast-grep a try and experience the future of code analysis and transformation!
