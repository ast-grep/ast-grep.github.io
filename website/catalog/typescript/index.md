# TypeScript

This page curates a list of example ast-grep rules to check and to rewrite TypeScript applications.
Check out the [Repository of ESLint rules](https://github.com/ast-grep/eslint/) recreated with ast-grep.

:::danger TypeScript and TSX are different.
TypeScript is a typed JavaScript extension and TSX is a further extension that allows JSX elements.
They need different parsers because of [conflicting syntax](https://www.typescriptlang.org/docs/handbook/jsx.html#the-as-operator).

TS allows both the `as` operator and angle brackets (`<>`) for type assertions. While TSX only allows the `as` operator because it interprets angle brackets as JSX elements.
:::

<!--@include: ./find-import-file-without-extension.md-->
<!--@include: ./migrate-xstate-v5.md-->
<!--@include: ./no-await-in-promise-all.md-->
<!--@include: ./no-console-except-catch.md-->
<!--@include: ./redundant-usestate-type.md-->