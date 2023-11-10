<template>
  <ul class="features">
    <li class="feature" v-for="feat in feats">
      <hr/>
      <div class="description">
        <h2>{{feat.title}}</h2>
        <p>
          {{feat.description}}
        </p>
        <code>
          {{ feat.code }}
        </code>
      </div>
      <img :src='feat.image' width="2004" height="1462"/>
    </li>
    <hr/>
  </ul>
</template>
<script setup lang="ts">
const feats = [
  {
    image: '/image/search-replace.png',
    title: 'Search and Rewrite',
    description: 'ast-grep is a code tool for structural search and replace. It is like syntax-aware grep/sed! You can write code patterns to locate and modify code, based on AST, in thousands of files, interactively.',
    code: `sg -p '$A && $A()' -r '$A?.()'`
  },
  {
    image: '/image/yaml-scan.png',
    title: 'Scan as Linter',
    description: 'ast-grep is a versatile and flexible tool for linting code with AST patterns. You can easily add new customized rules with intuitive syntax and enjoy pretty error reporting out of box.',
    code: `sg scan`,
  },
  {
    image: '/image/sg-napi.png',
    title: 'Programmatic Usage',
    description: 'ast-grep also provides node-js binding for manipulating syntax trees programmatically. You can use jQuery like utility methods to traverse and manipulate syntax tree nodes, or use operators to compose complex matching from simple patterns.',
    code: `npm install @ast-grep/napi`,
  },
]
</script>
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
  hr {
    width: 100%;
    border: none;
    border-top: 1px solid var(--vp-c-divider);
    margin: 2em;
  }
</style>