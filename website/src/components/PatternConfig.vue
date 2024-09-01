<script setup lang="ts">
import IconDown from './utils/IconDown.vue'

const strictness = defineModel<string>('strictness')
const selector = defineModel<string>('selector')

function selectAll(e: FocusEvent) {
  const input = e.target as HTMLInputElement
  input.select()
}
</script>

<template>
  <div class="pattern-config">
    <label>
      <a target="_blank" href="https://ast-grep.github.io/advanced/match-algorithm.html">ⓘ</a>
      Strictness:
      <select class="strictness-select" v-model="strictness">
        <option value="smart">Smart</option>
        <option value="ast">Ast</option>
        <option value="cst">Cst</option>
        <option value="relaxed">Relaxed</option>
        <option value="signature">Signature</option>
      </select>
      <IconDown/>
    </label>
    <label>
      <a target="_blank" href="https://ast-grep.github.io/advanced/faq.html#my-pattern-does-not-work-why">ⓘ</a>
      Selector:
      <input @focus="selectAll" class="selector-input" type="text" v-model="selector"/>
    </label>
  </div>
</template>

<style scoped>
.pattern-config {
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-size: 12px;
  padding: 0.5em 0;
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
</style>