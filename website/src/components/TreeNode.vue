<script setup lang="ts">
import { PropType, ref, ComputedRef, computed, inject, watchEffect } from 'vue'
import { DumpNode, highlightKey, Pos } from './dumpTree'
import { showToast } from './Toast.vue'

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
  }
})

type DestructedNode = {
  [K in keyof DumpNode]: ComputedRef<DumpNode[K]>
}
function deepReactive(): DestructedNode {
  const keys = Object.keys(props.node)
  const entries = keys.map(k => [k, computed(() => props.node[k])])
  return Object.fromEntries(entries)
}

let expanded = ref(true)
let {
  field,
  kind,
  start,
  end,
  children,
  isNamed,
} = deepReactive()

const highlightContext = inject(highlightKey)

function highlightNode() {
  const { start, end } = props.node
  highlightContext?.([
    start.row,
    start.column,
    end.row,
    end.column,
  ])
}

function withinPos({start, end}: DumpNode, {row, column}: Pos) {
  let withinStart = (start.row < row) || (start.row === row && start.column <= column)
  let withinEnd = (end.row > row) || (end.row === row && end.column >= column)
  return withinStart && withinEnd
}

let isWithin = computed(() => {
  const {cursorPosition} = props
  if (!cursorPosition) {
    return false
  }
  return withinPos(props.node, cursorPosition)
})
let isTarget = computed(() => {
  if (!isWithin.value) {
    return false
  }
  const {node, cursorPosition} = props
  const isTarget =
    !expanded.value || // children not expanded, current target is the target
    !node.children.some(n => withinPos(n, cursorPosition)) // no children within node
  return isTarget
})

let nodeRef = ref(null)
watchEffect(() => {
  if (isTarget.value) {
    nodeRef.value?.scrollIntoView({
      block: 'center',
    })
  }
});

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
      :cursorPosition="isWithin ? cursorPosition : null"
      v-if="expanded"
      v-for="child in children"
    />
  </div>
</template>

<style scoped>
.tree-node {
  margin: 0 0 0 1em;
  padding: 0 0 0 0.5em;
  border-left: 1px dashed var(--vp-c-divider);
  user-select: none;
  --yellow:    #bf8803;
  --red:       #a31515;
  --blue:      #006ab1;
  --green:     #008000;
  --black:     #002b36;
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