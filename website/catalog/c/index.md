# C

This page curates a list of example ast-grep rules to check and to rewrite C code.

:::tip C files can be parsed as Cpp
You can parse C code as Cpp to avoid rewriting similar rules. The [`languageGlobs`](/reference/sgconfig.html#languageglobs) option can force ast-grep to parse `.c` files as Cpp.
:::

<!--@include: ./match-function-call.md-->
<!--@include: ./rewrite-method-to-function-call.md-->
<!--@include: ./yoda-condition.md-->