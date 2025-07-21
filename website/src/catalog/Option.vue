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
.option {
  color: var(--vp-c-text-2);
  user-select: none;
  border: 1px solid transparent;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  text-align: center;
  padding-top: 0;
  transition: all 0.25s;
}
.highlight:hover {
  border-color: currentColor;
}
.highlight {
  border-color: var(--vp-c-text-3);
}
</style>