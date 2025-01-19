# TSX

This page curates a list of example ast-grep rules to check and to rewrite TypeScript with JSX syntax.

:::danger TypeScript and TSX are different.
TypeScript is a typed JavaScript extension and TSX is a further extension that allows JSX elements.
They need different parsers because of [conflicting syntax](https://www.typescriptlang.org/docs/handbook/jsx.html#the-as-operator).

In order to reduce rule duplication, you can use the [`languageGlobs`](/reference/sgconfig.html#languageglobs) option to force ast-grep to use parse `.ts` files as TSX.
:::

<!--@include: ./redundant-usestate-type.md-->
<!--@include: ./avoid-jsx-short-circuit.md-->
<!--@include: ./rewrite-mobx-component.md-->
<!--@include: ./unnecessary-react-hook.md-->