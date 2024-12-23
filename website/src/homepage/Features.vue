<template>
  <ul class="features">
    <li class="feature">
      <hr/>
      <div class="description">
        <h2>Search and Rewrite</h2>
        <p>
        ast-grep is a code tool for <a href="/guide/quick-start.html">structural search and replace</a>.
        It is like syntax-aware grep/sed!
        You can write code <a href="/guide/pattern-syntax.html">patterns</a> to locate and modify code,
        based on AST, in thousands of files, <a href="/guide/tooling-overview.html#interactive-mode">interactively</a>.
        </p>
        <code class="vp-code">
          <span>ast-grep</span> -p '$A && $A()' -r '$A?.()'
        </code>
      </div>
      <img src='/image/search-replace.png' width="2004" height="1462"/>
    </li>
    <li class="feature">
      <hr/>
      <div class="description">
        <h2>Scan as Linter</h2>
        <p>
        ast-grep is a versatile and flexible tool for <a href="/guide/scan-project.html">linting</a> code with AST patterns.
        You can easily add new customized rules with <a href="/guide/rule-config.html">intuitive syntax</a> and enjoy pretty error reporting out of box.
        </p>
        <code class="vp-code">
          <span>ast-grep</span> scan
        </code>
      </div>
      <img src='/image/yaml-scan.png' width="2004" height="1462"/>
    </li>
    <li class="feature">
      <hr/>
      <div class="description">
        <h2>Programmatic Usage</h2>
        <p>
          ast-grep also provides <a href="/guide/api-usage/js-api.html">node-js binding</a> to access syntax trees programmatically.
          You can use jQuery like <a href="/reference/api.html#napi">utility methods</a> to traverse syntax tree nodes.
          Node API also has opt-in <a href="/blog/typed-napi.html">type safety</a>.
        </p>
        <code class="vp-code">
          npm install <span>@ast-grep/napi</span>
        </code>
      </div>
      <img src='/image/sg-napi.png' width="2004" height="1462"/>
    </li>
    <hr/>
  </ul>
</template>
<style scoped>
  .features {
    margin-top: -2em;
    margin-bottom: 4em;
    overflow: hidden;
  }
  .feature {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  .feature > img {
    flex: 1 0 50%;
    width: 50%;
    min-width: min(480px, 100vw);
    max-width: min(100vw, 720px);
  }
  .description {
    flex: 1 0 50%;
    max-width: min(100vw, 720px);
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 0em 2em 2em;
    text-align: center;
  }
  .description a {
    text-decoration: underline;
    text-decoration-style: dotted;
    font-style: italic;
  }
  @media (min-width: 640px) {
    .description {
      padding: 0em 4em 2em;
    }
  }
  h2 {
    font-size: 24px;
    line-height: 36px;
    color: var(--vp-c-text-2);
    padding-bottom: 1em;
  }
  p {
    text-align: justify;
  }
  @supports (text-wrap: balance) {
    p {
      text-align: center;
      text-wrap: balance;
    }
  }
  code {
    border: 1px solid var(--vp-c-bg-soft);
    border-radius: 12px;
    margin: 2em 0 0.5em;
    padding: 1em;
    background-color: var(--vp-c-bg-soft);
    transition: border-color 0.25s, background-color 0.25s;
  }
  code span {
    --shiki-light: #6F42C1;
    --shiki-dark: #B392F0;
  }
  hr {
    width: 100%;
    border: none;
    border-top: 1px solid var(--vp-c-divider);
    margin: 2em;
  }
</style>