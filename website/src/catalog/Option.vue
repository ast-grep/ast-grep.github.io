<script setup lang="ts">
// hohoho option, not the 0dte one

defineProps({
  text: String,
  highlight: Boolean,
})
</script>

<template>
  <code class="option" :class="{ highlight }">{{ text }}</code>
</template>

<style scoped>
code.option {
  cursor: pointer;
  filter: saturate(0);
  opacity: 0.8;
  user-select: none;
  border: 1px solid transparent;
  min-width: 3em;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  text-align: center;
  padding-top: 0;
}
code.option:hover {
  opacity: 1;
  filter: saturate(1);
}
.highlight {
  color: var(--vp-c-brand-1);
}
.highlight-filter:hover {
  color: var(--vp-c-brand-1);
}
</style>