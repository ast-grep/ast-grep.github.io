<script lang="ts" setup>
import IconReset from '../icons/Reset.vue'

const emits = defineEmits<{
  reset: []
}>()
</script>

<template>
  <button class="reset" data-title="Reset your config" title-up @click="emits('reset')">
    <IconReset />
  </button>
</template>

<style scoped>
.reset {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  padding: 0px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}

.reset[data-title]:after {
  transform: translate(-80%, -100%);
}
</style>
