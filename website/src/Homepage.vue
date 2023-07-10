<script setup lang="ts">
import Theme from 'vitepress/theme'
import Features from './homepage/Features.vue'
import Languages from './homepage/Languages.vue'
</script>

<template>
  <Theme.Layout>
    <template #home-features-before>
      <Features />
    </template>
    <template #home-features-after>
      <Languages />
    </template>
  </Theme.Layout>
</template>
