<script lang="ts" setup>
import {computed, shallowRef, PropType} from 'vue'
const props = defineProps({
  envs: Array as PropType<any>,
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
      .filter(k => /^[A-Z]+$/.test(k)) // remove internal labels
      .map(k => [k, map.get(k)])
  )
})

function increment() {
  currentIndex.value = (currentIndex.value + 1) % props.envs.length
}
function decrement() {
  currentIndex.value = (currentIndex.value + props.envs.length - 1) % props.envs.length
}
</script>>

<template>
<div class="var-debugger">
  <table class="metavar-table" v-if="currentEnv">
    <thead>
      <tr>
        <td>Metavariable Name</td>
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
  <div class="choose-match">
    <button @click="decrement">Prev Match</button>
    &nbsp;
    <button @click="increment">Next Match</button>
  </div>
</div>
</template>

<style scoped>
.metavar-table {
  width: 100%;
  table-layout: fixed;
  border-bottom: 1px solid #eee;
  flex: 1 0 auto;
}
.metavar-table thead {
  border-bottom: 1px solid #eee;
}
.metavar-table tbody tr:hover {
  background-color: #f7f7f7;
}
.metavar-table td {
  padding: 0.2em 1em;
}
.metavar-table td:nth-child(2n) {
  border-left: 1px solid #eee;
  width: 75%;
}
.choose-match {
  margin-top: 1em;
}
</style>
