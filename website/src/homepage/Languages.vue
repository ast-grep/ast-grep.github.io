<template>
  <div>
    <div class="section-title">
      <h1>20+ Supported Languages</h1>
    </div>
    <div class="languages">
      <a href="/catalog/c/">
        <img src='/icons/C.svg'/>
      </a>
      <img src='/icons/CSharp.svg'/>
      <a href="/catalog/go/">
        <img src='/icons/Go.svg'/>
      </a>
      <a href="/catalog/java/">
        <img src='/icons/Java.svg'/>
      </a>
      <a href="/catalog/tsx/">
        <img src='/icons/JS.svg'/>
      </a>
      <a href="/catalog/kotlin/">
        <img src='/icons/Kotlin.svg'/>
      </a>
      <a href="/catalog/python/">
        <img src='/icons/Python.svg'/>
      </a>
      <a href="/catalog/rust/">
        <img src='/icons/Rust.svg'/>
      </a>
      <a href="/catalog/typescript/">
        <img src='/icons/TS.svg'/>
      </a>
      <p>
        See more in the
        <a class="link" href="/reference/languages.html">full list</a>.
        Custom languages are also
        <a class="link" href="/advanced/custom-language.html">loadable</a>.
      </p>
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
  p {
    opacity: 0.5;
  }
  a.link {
    text-decoration: underline;
  }
  .feature {
    flex: 0 0 100vw;
    scroll-snap-align: start;
  }
  .feature > img {
    width: 60%;
  }
  .languages {
    width: 100%;
    padding: 0 20px;
    overflow: auto;
    white-space: nowrap;
    text-align: center;
    scroll-behavior: smooth;
  }
  .languages img {
    display: inline-block;
    padding: 20px;
    width: 120px;
    height: 120px;
    transition: 0.2s ease-in-out;
  }
</style>