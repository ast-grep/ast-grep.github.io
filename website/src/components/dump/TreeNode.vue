<script setup lang="ts">
import { PropType, ComputedRef, computed } from 'vue'
import { DumpNode, Pos } from './dumpTree'
import { showToast } from '../utils/Toast.vue'
import { useHighlightNode } from './highlightNode'

const props = defineProps({
  node: {
    type: Object as PropType<DumpNode>,
    required: true
  },
  cursorPosition: {
    type: Object as PropType<Pos>,
  },
  showUnnamed: {
    type: Boolean,
    default: false,
  },
  clickKind: Function as PropType<(k: string) => void>,
})

type DestructedNode = {
  [K in keyof DumpNode]: ComputedRef<DumpNode[K]>
}
function deepReactive(): DestructedNode {
  const keys = Object.keys(props.node)
  const entries = keys.map(k => [k, computed(() => props.node[k])])
  return Object.fromEntries(entries)
}

let {
  field,
  kind,
  start,
  end,
  children,
  isNamed,
} = deepReactive()

const {
  isWithin,
  isTarget,
  highlightNode,
  expanded,
  nodeRef,
} = useHighlightNode(props)

function copyKind(kind: string) {
  if (props.clickKind) {
    props.clickKind(kind)
    return
  }
  navigator.clipboard.writeText(kind)
  showToast('Node kind copied!')
}
function copyField(name: string) {
  navigator.clipboard.writeText(name)
  showToast('Node field copied!')
}
</script>

<template>
  <div v-if="showUnnamed || isNamed || field" class="tree-node" ref="nodeRef" :class="{target: isTarget}">
    <p class="click-area" @click.stop="expanded = !expanded" @mouseover="highlightNode">
      <span
        v-if="children.some(n => n.isNamed || n.field)"
        class="toggle-sign"
        :class="{expanded}"/>
      <span v-if="isNamed" class="node-kind" @click.stop="copyKind(kind)">{{ kind }}</span>
      <span v-else class="node-text">{{ kind }}</span>
      <span class="node-field" @click.stop="copyField(kind)">{{ field }}</span>
      <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    </p>
    <TreeNode
      :showUnnamed="showUnnamed"
      :node="child"
      :cursorPosition="isWithin ? cursorPosition : undefined"
      :clickKind="clickKind"
      v-if="expanded"
      v-for="child in children"
    />
  </div>
</template>

<style>
.tree-node {
  --yellow:    #bf8803;
  --red:       #a31515;
  --blue:      #006ab1;
  --green:     #008000;
  --black:     #002b36;
}
html.dark .tree-node {
  --yellow:    #ce9178;
  --red:       #f48771;
  --blue:      #569cd6;
  --green:     #608b4e;
  --black:     #d4d4d4;
}
</style>

<style scoped>
.tree-node {
  margin: 0 0 0 1em;
  padding: 0 0 0 0.5em;
  border-left: 1px dashed var(--vp-c-divider);
  user-select: none;
  transition: background-color ease-out .217s;
}
.click-area {
  cursor: pointer;
}
.tree-node:has(> .click-area:hover) {
  background-color: var(--theme-highlight4);
}
.tree-node.target {
  background-color: var(--theme-highlight3);
}
/* fallback for browser without :has */
.click-area:hover {
  background-color: var(--theme-highlight4);
}
.toggle-sign {
  color: var(--green);
  display: inline-block;
}
.toggle-sign::before {
  content: '+';
}
.toggle-sign.expanded {
  color: var(--red);
}
.toggle-sign.expanded::before {
  content: '-';
}
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