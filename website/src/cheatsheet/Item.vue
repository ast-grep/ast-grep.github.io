<script setup lang="ts">
import { useSlots } from 'vue'
const slots = useSlots()
const [code, ...other] = slots.default?.() || []
</script>

<template>
  <tr class="item">
    <td class="code-cell">
      <component :is="code" />
    </td>
    <td class="description-cell">
      <component v-for="(item, index) in other" :key="index" :is="item" />
    </td>
  </tr>
</template>

<style scoped>
/* override */
.code-cell:deep(div[class*='language-']) {
  margin: 0;
}

.description-cell:deep(p) {
  margin: 0;
}

tr.item {
  background-color: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
td {
  border: none;
  background-color: transparent;
}
code.example {
  white-space: pre;
  display: block;
}
td.code-cell {
  width: 50%;
  padding-right: 0;
}
</style>
