# HTML

This page curates a list of example ast-grep rules to check and to rewrite HTML code.

:::tip Use HTML parser for frameworks
You can leverage the [`languageGlobs`](/reference/sgconfig.html#languageglobs) option to parse framework files as plain HTML, such as `vue`, `svelte`, and `astro`.

**Caveat**: This approach may not parse framework-specific syntax, like Astro's [frontmatter script](https://docs.astro.build/en/basics/astro-components/#the-component-script) or [Svelte control flow](https://svelte.dev/docs/svelte/if). You will need to load [custom languages](/advanced/custom-language.html) for such cases.
:::

<!--@include: ./upgrade-ant-design-vue.md-->
<!--@include: ./extract-i18n-key.md-->