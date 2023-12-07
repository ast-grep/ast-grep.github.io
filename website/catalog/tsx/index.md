# TSX

This page curates a list of example ast-grep rules to check and to rewrite TypeScript with JSX syntax.

:::danger TypeScript and TSX are different.
TypeScript is a typed JavaScript extension and TSX is a further extension that allows JSX elements.
They need different parsers because of [conflicting syntax](https://www.typescriptlang.org/docs/handbook/jsx.html#the-as-operator).

TS allows both the `as` operator and angle brackets (`<>`) for type assertions. While TSX only allows the `as` operator because it interprets angle brackets as JSX elements.
:::

<!--@include: ./avoid-jsx-short-circuit.md-->
<!--@include: ./rewrite-mobx-component.md-->