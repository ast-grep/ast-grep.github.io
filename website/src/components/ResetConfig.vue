<script lang="ts" setup>
import IconReset from '../icons/Reset.vue'

const state = defineModel()
const config = `
# YAML Rule is more powerful!
# https://ast-grep.github.io/guide/rule-config.html#rule
rule:
  any:
    - pattern: console.log($A)
    - pattern: console.debug($A)
fix:
  logger.log($A)
`.trim()

const onReset = () => {
  state.value.config = config
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
