<template>
  <div>
    <div class="section-title">
      <h1>Who is using ast-grep</h1>
    </div>
    <div class="ecosystem">
      <a target="_blank" href="https://vue-vine.dev/" title="vue-vine" class="sponsor">
        <img src='https://vue-vine.dev/vine-logo.png'/>
      </a>
      <a target="_blank" href="https://swc.rs" title="SWC" class="sponsor">
        <img src='https://avatars.githubusercontent.com/u/26715726?s=200&v=4'/>
      </a>
      <a target="_blank" href="https://github.com/unplugin/unplugin-vue-cssvars#readme" title="unplugin-vue-cssvars">
        <img src='https://raw.githubusercontent.com/baiwusanyu-c/unplugin-vue-cssvars/master/public/logo.png' style="padding: 25px"/>
      </a>
      <a target="_blank" href="https://hydrogen.shopify.dev/" title="Hydrogen">
        <img src='/logos/hydrogen.svg'/>
      </a>
      <a target="_blank" href="https://github.com/vue-macros/vue-macros-cli" title="vue-macros" class="sponsor">
        <img src='https://avatars.githubusercontent.com/u/120662729?s=200&v=4'/>
      </a>
      <a target="_blank" href="https://modernjs.dev/" title="Modern.js">
        <img src='https://avatars.githubusercontent.com/u/126793605?s=200&v=4'/>
      </a>
      <a target="_blank" href="https://coderabbit.ai/" title="CodeRabbit" class="sponsor">
        <img src='https://avatars.githubusercontent.com/in/347564?s=200&v=4' style="padding: 23px"/>
      </a>
    </div>
  </div>
</template>
<style scoped>
  .section-title {
    margin-top: 1em;
    text-align: center;
  }
  h1 {
    display: inline-block;
    margin: 48px auto 20px;
    padding-top: 24px;
    border-top: 1px solid var(--vp-c-divider);
    text-align: center;
    font-size: 24px;
    opacity: 0.5;
    letter-spacing: -0.02em;
  }
  .ecosystem {
    width: 100%;
    padding: 0 20px;
    overflow: auto;
    white-space: nowrap;
    text-align: center;
    scroll-behavior: smooth;
  }
  .ecosystem img {
    padding: 10px;
    width: 120px;
    height: 120px;
    transition: 0.2s ease-in-out;
  }
  .ecosystem a {
    position: relative;
    display: inline-block;
    overflow: hidden;
    transition: transform 0.2s linear;
  }
  .sponsor::before {
    content: '';
    background: linear-gradient(
      to bottom, rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.4) 25%,
      rgba(255, 255, 255, 0.4) 75%,
      rgba(255, 255, 255, 0)
    );
    width: 60%;
    height: 100%;
    top: 0%;
    transform: skew(45deg);
    position: absolute;
    transition: left 0.4s linear;
    left: -125%;
  }
  .sponsor:hover {
    transform: translateY(-5%);
  }
  .sponsor:hover::before {
    left: 150%;
  }
</style>