<script setup lang="ts">
import { PropType } from 'vue'
import { DumpNode, Pos, deepReactiveNode } from './dumpTree'
import { showToast } from '../utils/Toast.vue'
import GeneralNode from './GeneralNode.vue'

const props = defineProps({
  node: {
    type: Object as PropType<DumpNode>,
    required: true
  },
  cursorPosition: {
    type: Object as PropType<Pos | null>,
    required: true,
  },
  showUnnamed: {
    type: Boolean,
    default: false,
  },
})

let {
  field,
  kind,
  start,
  end,
  children,
  isNamed,
} = deepReactiveNode(props)

function copyKind(kind: string) {
  navigator.clipboard.writeText(kind)
  showToast('Node kind copied!')
}
function copyField(name: string) {
  navigator.clipboard.writeText(name)
  showToast('Node field copied!')
}
</script>

<template>
  <GeneralNode v-if="showUnnamed || isNamed || field"
    :node="node"
    :cursorPosition="cursorPosition"
    :showToggle="children.some(n => n.isNamed || n.field)"
  >
    <template #info>
      <span v-if="isNamed" class="node-kind" @click.stop="copyKind(kind)">{{ kind }}</span>
      <span v-else class="node-text">{{ kind }}</span>
      <span class="node-field" @click.stop="copyField(field || '')">{{ field }}</span>
      <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    </template>
    <template #children="{cursorPosition}">
      <TreeNode
        :showUnnamed="showUnnamed"
        :node="child"
        :cursorPosition="cursorPosition"
        v-for="child in children"
      />
    </template>
  </GeneralNode>
</template>

<style scoped>
.node-kind {
  color: var(--blue);
  padding-left: 0.6em;
  cursor: pointer;
}
.node-text {
  padding-left: 0.6em;
  cursor: text;
  color: var(--black);
}
.node-kind:hover {
  text-decoration: underline;
}
.node-field {
  padding: 0.4em;
  color: var(--yellow);
}
.node-field:empty {
  padding-left: 0;
}
.node-field:hover {
  text-decoration: underline;
}
.node-range {
  color: #999;
}
</style>