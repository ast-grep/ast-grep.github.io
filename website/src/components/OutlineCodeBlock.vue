<script setup lang="ts">
import OutlineCodeLine from './OutlineCodeLine.vue'
import type { OutlineCodeRow, OutlineStyleRole } from './outlineCode'

withDefaults(defineProps<{
  label: string
  minWidth?: string
  rows: OutlineCodeRow[]
  activeGroup?: OutlineStyleRole
}>(), {
  minWidth: '520px',
})
</script>

<template>
  <div
    class="outline-code-block"
    :aria-label="label"
    :style="{ '--outline-code-min-width': minWidth }"
  >
    <pre><code><OutlineCodeLine
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :row="row"
      :active="activeGroup ? row.groups?.includes(activeGroup) : false"
    /></code></pre>
  </div>
</template>

<style scoped>
.outline-code-block {
  --outline-code-bg: #f6f8fa;
  --outline-code-border: #d0d7de;
  --outline-code-text: #57606a;
  --outline-code-muted: #8c959f;
  --outline-code-path: #24292f;
  --outline-code-active-bg: rgba(9, 105, 218, 0.1);
  --outline-code-active-bar: #0969da;
  --outline-code-class: #8250df;
  --outline-code-callable: #1a7f37;
  --outline-code-field: #9a6700;
  --outline-code-import: #cf222e;
  --outline-code-type: #0969da;

  overflow: auto;
  border: 1px solid var(--outline-code-border);
  border-radius: 8px;
  background: var(--outline-code-bg);
}

.dark .outline-code-block {
  --outline-code-bg: #0d1117;
  --outline-code-border: #30363d;
  --outline-code-text: #8b949e;
  --outline-code-muted: #6e7681;
  --outline-code-path: #c9d1d9;
  --outline-code-active-bg: rgba(88, 166, 255, 0.14);
  --outline-code-active-bar: #58a6ff;
  --outline-code-class: #d2a8ff;
  --outline-code-callable: #7ee787;
  --outline-code-field: #f2cc60;
  --outline-code-import: #ff7b72;
  --outline-code-type: #79c0ff;
}

.outline-code-block pre {
  margin: 0;
  padding: 14px 0;
  min-width: var(--outline-code-min-width);
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
  line-height: 1.55;
}
</style>
