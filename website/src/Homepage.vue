<script setup lang="ts">
import Theme from 'vitepress/theme'
import Languages from './homepage/Languages.vue'
</script>

<template>
  <Theme.Layout>
    <template #home-features-after>
      <Languages />
    </template>
  </Theme.Layout>
</template>