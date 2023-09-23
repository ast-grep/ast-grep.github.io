<template>
  <header>
    <details>
      <summary class="description vp-doc">
        SG playground: Write Code to Match Code.
        <a href="/reference/playground" target="_blank">Manual 🔗</a>
      </summary>
      <hr/>
        <ul>
          <li>
            <code>ast-grep</code> is a AST-based tool to search code by pattern code. Think it as your old-friend <code>grep</code> but it matches AST node instead of text.
          </li>
          <li>
            Write pattern as if write ordinary code. It will match all code that has the same syntactical structure.
          </li>
          <li>
            You can use <code>$</code> sign + upper case letters as wildcard, e.g. <code>$MATCH</code>, to match any single AST node. Think it as REGEX dot <code>.</code>, except it is not textual.
          </li>
          <li>
            You can use <code>$$$</code> to match multiple AST nodes.
          </li>
        </ul>
    </details>
  </header>
</template>

<style scoped>
header {
  padding-bottom: 0.5em;
}
details {
  cursor: pointer;
}
summary {
  font-size: 1em;
  list-style: revert;
}
.description {
  text-align: left;
}

code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  padding: 0.1em 0.2em;
  background-color: rgba(128, 128, 128, 0.3);
}
ul {
  list-style: disc inside;
}
hr {
  margin: 0.5em 0;
  border-top: 1px solid #eee;
}
</style>