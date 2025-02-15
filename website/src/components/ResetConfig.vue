<script lang="ts" setup>
import IconReset from '../icons/Reset.vue'

import type { State } from './astGrep/state'
import { config, query, rewrite } from './astGrep/state'

const state = defineModel<State>({
  required: true,
})

const onReset = () => {
  state.value.config = config
  state.value.query = query
  state.value.rewrite = rewrite
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
  background: transparent;
}
</style>