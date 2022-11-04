<script setup lang="ts">
import { PropType, ref } from 'vue'
import { DumpNode } from './dumpTree'

const props = defineProps({
  node: {
    type: Object as PropType<DumpNode>,
    required: true
  },
})

let expanded = ref(true)

const {
  field,
  kind,
  start,
  end,
  children,
} = props.node
</script>

<template>
  <div class="tree-node">
    <span class="toggle" @click="expanded = !expanded">{{expanded ? '-' : '+'}}</span>
    <span class="node-kind">{{ kind }}</span>
    <span class="node-field">{{ field }}</span>
    <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    <TreeNode :node="child" v-if="expanded" v-for="child in children"/>
  </div>
</template>

<style scoped>
.toggle {
  background: white;
  margin-left: -1em;
  cursor: pointer;
}
.tree-node {
  margin: 0 1.5em 0;
  padding: 0 0 0 0.5em;
  border-left: 1px dashed #eee;
}
.node-kind {
  color: #10aabb;
  padding-left: 0.6em;
  display: inline-block;
}
.node-field {
  padding: 0.4em;
}
.node-field:empty {
  padding-left: 0;
}
.node-range {
  color: #999;
}
</style>
