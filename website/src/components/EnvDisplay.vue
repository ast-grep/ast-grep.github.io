<script lang="ts" setup>
import {computed, shallowRef, PropType} from 'vue'
import Error from './utils/Error.vue'
import { yamlImport } from './astGrep'
import { showToast } from './utils/Toast.vue'

const props = defineProps({
  envs: Array as PropType<any>,
  error: String,
  rule: String,
})
let currentIndex = shallowRef(0)
let currentEnv = computed(() => {
  const map = props.envs[currentIndex.value]
  if (!map) {
    return null
  }
  const keys = [...map.keys()]
  return Object.fromEntries(
    keys
      .filter(k => /^[A-Z_1-9]+$/.test(k)) // remove internal labels
      .map(k => [k, map.get(k)])
  )
})

function increment() {
  currentIndex.value = (currentIndex.value + 1) % props.envs.length
}
function decrement() {
  currentIndex.value = (currentIndex.value + props.envs.length - 1) % props.envs.length
}
async function copyJson() {
  const yaml = await yamlImport
  const rules = yaml.loadAll(props.rule || '{}')
  const json = rules.length === 1 ? rules[0] : rules
  navigator.clipboard.writeText(JSON.stringify(json, null, 2))
  showToast('Rule JSON copied to clipboard.')
}
</script>

<template>
<div class="var-debugger">
  <template v-if="currentEnv">
    <table class="metavar-table">
      <thead>
        <tr>
          <td>MetaVar Name</td>
          <td>Matched Node(s)</td>
        </tr>
      </thead>
      <tbody v-if="currentEnv">
        <tr v-for="(val, key) in currentEnv">
          <td>{{key}}</td>
          <td>
            <code>
              {{val.text}}
            </code>
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <div class="choose-match-division" />
      <button @click="decrement">❮</button>
      <span class="match-count">{{ currentIndex + 1 }}/{{props.envs.length}} match(es)</span>
      <button @click="increment">❯</button>
      <button @click="copyJson" class="copy-json" data-title="Copy Rule as JSON" title-up>JSON</button>
    </div>
  </template>
  <Error v-else-if="error" :error="error"/>
  <div v-else class="vp-doc">
    <div class="custom-block warning no-match-tip">
      <p class="custom-block-title">No match found? Some tips:</p>
      <ul>
        <li>Simplify the rule and code. Start from a minimal example.</li>
        <li>
          <code>pattern</code> may <a href="/advanced/pattern-parse.html#extract-effective-ast-for-pattern">not match a whole statement</a> but the expression inside.
        </li>
        <li>
          <a href="/advanced/faq.html#why-is-rule-matching-order-sensitive">Rule order</a> can be important. Try using <code>all</code>.
        </li>
        <li>Deep dive into <a href="/advanced/pattern-parse.html" target="_blank">Pattern Syntax</a></li>
        <li>See ast-grep's <a href="/advanced/faq.html" target="_blank">FAQs</a> for more info.</li>
      </ul>
    </div>
  </div>
</div>
</template>

<style scoped>
.metavar-table {
  width: 100%;
  table-layout: fixed;
  flex: 1 0 auto;
}
.metavar-table thead {
  border-bottom: 1px solid var(--vp-c-divider);
}
.metavar-table tbody tr {
  border-bottom: 1px solid var(--vp-c-divider);
}
.metavar-table tbody tr:nth-child(2n+1) {
  background-color: var(--vp-c-bg-soft);
}
.metavar-table td {
  padding: 0.2em 1em;
}
.metavar-table td:nth-child(2n) {
  border-left: 1px solid var(--vp-c-divider);
  width: 75%;
}
.match-count {
  margin: 0 0.5em;
  opacity: 0.8;
}
.choose-match-division{
  margin-top: 1em;
}

tfoot button {
  padding: 0;
  text-align: center;
  line-height: 24px;
  width: 24px;
}

.no-match-tip {
  margin-top: 5px;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: unset;
  line-height: unset;
}
.no-match-tip ul {
  margin: 0;
  padding-left: 1em;
  padding-top: 0.5em;
}
.no-match-tip ul > li {
  margin-top: 4px;
}
.copy-json {
  margin-left: 0.5em;
}
</style>