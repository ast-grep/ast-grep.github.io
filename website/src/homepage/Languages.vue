<template>
  <div class="section-title">
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
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import Features from './homepage/Features.vue'

let isHomePage = computed(() => useRoute().path === '/')
</script>
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
    scroll-snap-type: x mandatory;
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
