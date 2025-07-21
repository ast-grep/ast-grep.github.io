<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps({
  error: String,
})
let prettyError = computed(() => {
  if (!props.error) {
    return ''
  }
  // remove leading `Error: ` inject by serde-json
  return props.error
    .replace(/^(Error: )*/, '')
    .split('\n').filter(Boolean).join('\n╰▻ ') // add line break
})
</script>
<template>
  <div v-if="error" class="error-msg">
    ⚠ {{prettyError}}
  </div>
</template>

<style scoped>
.error-msg {
  border-radius: 5px;
  padding: 5px 10px;
  background: var(--vp-custom-block-danger-bg);
  margin-top: 5px;
  color: var(--vp-c-danger-1);
  white-space: pre-wrap;
}
.error-msg::first-line {
  font-weight: 600;
  line-height: 24px;
}
</style>