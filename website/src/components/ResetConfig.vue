<script lang="ts" setup>
import IconReset from '../icons/Reset.vue'
import defaultConfig from './astGrep/template/config.yaml?raw'

const state = defineModel()

const onReset = () => {
  state.value.config = defaultConfig
  state.value.query = 'console.log($MATCH)'
  state.value.rewrite = 'logger.log($MATCH)'
}
</script>

<template>
  <button class="reset" title="Reset your config" @click="onReset">
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
}
</style>
