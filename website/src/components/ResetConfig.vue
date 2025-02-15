<script lang="ts" setup>
import IconReset from '../icons/Reset.vue'

const emits = defineEmits<{
  reset: () => void
}>()
</script>

<template>
  <button class="reset" title="Reset your config" @click="emits('reset')">
    <IconReset />
  </button>
</template>

<style scoped>
.reset {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}
</style>