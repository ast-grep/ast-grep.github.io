<script setup>
import RuleItem from './RuleItem.vue'
const rules = [
  'rule1'
]
</script>
<template>
  <div class="rule-filter">
    <label>
      <input type="checkbox"/>
      Single Pattern
    </label>
    <label>
      <input type="checkbox"/>
      YAML Rule
    </label>
    <label>
      <input type="checkbox"/>
      Has Fix
    </label>
  </div>
  <ul>
    <li v-for="rule in rules">
      <RuleItem :title="rule"/>
    </li>
  </ul>
</template>
