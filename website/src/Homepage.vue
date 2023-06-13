<template>
  <Theme.Layout>
    <template #home-features-before>
      <Features v-if="isHomePage"/>
    </template>
    <template #home-features-after>
      <Languages v-if="isHomePage" />
    </template>
  </Theme.Layout>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import Features from './homepage/Features.vue'
import Languages from './homepage/Languages.vue'

let isHomePage = computed(() => useRoute().path === '/')
</script>
<style scoped>
</style>
