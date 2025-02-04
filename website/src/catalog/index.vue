<script setup lang="ts">
import { ref } from 'vue'
const filter = ref({
  selectedLanguages: [] as string[],
  selectedRuleFilters: [] as string[],
  selectedFeatures: [] as string[],
  selectedTypes: [] as string[],
})
import RuleFilter from './RuleFilter.vue'
import RuleList from './RuleList.vue'
</script>

<template>
  <div class="catalog-filter">
    <RuleFilter v-model="filter" />
    <RuleList :filter="filter"/>
  </div>
</template>

<style scoped>
</style>