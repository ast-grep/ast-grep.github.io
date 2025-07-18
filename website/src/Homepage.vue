<script setup lang="ts">
import { useData } from 'vitepress'
import Theme from 'vitepress/theme'
import { nextTick, provide } from 'vue'
import Ecosystem from './homepage/Ecosystem.vue'
import Features from './homepage/Features.vue'
import Languages from './homepage/Languages.vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

const toggle = async () => {
  isDark.value = !isDark.value
  await nextTick()
}

provide('toggle-appearance', async () => {
  if (!enableTransitions()) {
    return toggle()
  }
  return document.startViewTransition(toggle).ready
})
</script>

<template>
  <Theme.Layout>
    <template #home-features-before>
      <Features />
    </template>
    <template #home-features-after>
      <Languages />
      <Ecosystem />
    </template>
  </Theme.Layout>
</template>
