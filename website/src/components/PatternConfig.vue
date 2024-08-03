<script setup lang="ts">
import IconDown from './utils/IconDown.vue'

const strictness = defineModel('strictness')
const selector = defineModel('selector')
</script>

<template>
  <div class="pattern-config">
    <label>
      Strictness:
      <select class="strictness-select" v-model="strictness">
        <option value="smart">Smart</option>
        <option value="ast">Ast</option>
        <option value="cst">Cst</option>
        <option value="relaxed">Relaxed</option>
        <option value="signature">Signature</option>
      </select>
      <IconDown/>
      <a class="info" target="_blank" href="https://ast-grep.github.io/advanced/match-algorithm.html">ⓘ</a>
    </label>
    <label>
      Selector:
      <input class="selector-input" type="text" v-model="selector"/>
      <a class="info" target="_blank" href="https://ast-grep.github.io/guide/rule-config/atomic-rule.html#pattern-object">ⓘ</a>
    </label>
  </div>
</template>

<style scoped>
.pattern-config {
  z-index: 2;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--vp-c-bg-soft);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  border-radius: 10px 10px 0 0;
  padding: 0.5em 1em;
}
.strictness-select {
  cursor: pointer;
  padding-left: 0.25em;
}
.selector-input {
  background: var(--vp-c-bg-alt);
  border-radius: 5px;
  height: 25px;
  padding: 8px;
}

.info {
  margin-left: 0.5em;
}
</style>