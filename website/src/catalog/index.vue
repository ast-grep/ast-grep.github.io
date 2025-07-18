<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Filter } from './data'
import { deserialize, serialize } from './data'
import RuleFilter from './RuleFilter.vue'
import RuleList from './RuleList.vue'

// for SSR
const loc = typeof location !== 'undefined' ? location : null
const his = typeof history !== 'undefined' ? history : null

const filter = ref<Filter>(deserialize(
  loc?.hash.slice(1) || '',
))

watch(filter, (value) => {
  const hash = serialize(value)
  his?.replaceState({}, '', hash ? `#${hash}` : '/catalog')
}, {
  deep: true,
  immediate: true,
})

function reset() {
  filter.value = {
    selectedLanguages: [],
    selectedRules: [],
    selectedFeatures: [],
    selectedTypes: [],
  }
}
</script>

<template>
  <div class="catalog-filter">
    <RuleFilter v-model="filter" />
    <RuleList :filter="filter" @reset="reset" />
  </div>
</template>

<style scoped>
.catalog-filter {
  min-height: 300px;
}
</style>
