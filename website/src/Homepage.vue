<template>
  <template v-if="isHomePage">
    <div class="language-section">
      <h1>Supported Languages</h1>
    </div>
    <div class="languages">
      <img src='/icons/C.svg'/>
      <img src='/icons/CSharp.svg'/>
      <img src='/icons/Go.svg'/>
      <img src='/icons/Java.svg'/>
      <img src='/icons/JS.svg'/>
      <img src='/icons/Kotlin.svg'/>
      <img src='/icons/Python.svg'/>
      <img src='/icons/Rust.svg'/>
      <img src='/icons/TS.svg'/>
    </div>
  </template>
</template>
<script setup lang="ts">
import { useRoute } from 'vitepress'
const isHomePage = useRoute().path === '/'
</script>
<style scoped>
  .language-section {
    text-align: center;
  }
  h1 {
    display: inline-block;
    margin: 60px auto 20px;
    padding-top: 24px;
    border-top: 1px solid var(--vp-c-divider);
    text-align: center;
    font-size: 24px;
    opacity: 0.5;
    letter-spacing: -0.02em;
  }
  .languages {
    width: 100%;
    padding: 0 20px;
    overflow: auto;
    white-space: nowrap;
    scroll-behavior: smooth;
    text-align: center;
    scroll-snap-type: x mandatory;
    margin-bottom: -50px;
  }
  .languages img {
    display: inline-block;
    padding: 20px;
    width: 120px;
    height: 120px;
    scroll-snap-align: center;
    transition: 0.2s ease-in-out;
  }
</style>
