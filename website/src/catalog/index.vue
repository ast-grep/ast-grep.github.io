<script setup lang="ts">
import { ref } from 'vue'
import RuleFilter from './RuleFilter.vue'
import RuleList from './RuleList.vue'
import type { Filter } from './data';

const filter = ref<Filter>({
  selectedLanguages: [],
  selectedRules: [],
  selectedFeatures: [],
  selectedTypes: [],
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
    <RuleList :filter="filter" @reset="reset"/>
  </div>
</template>

<style scoped>
.catalog-filter {
  min-height: 300px;
}
</style>