<script setup lang="ts">
import { PropType, ref, ComputedRef, computed, inject, watchEffect } from 'vue'
import { PatternTree, highlightKey, Pos } from './dumpTree'
import { showToast } from '../utils/Toast.vue'

const props = defineProps({
  node: {
    type: Object as PropType<PatternTree>,
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
  [K in keyof PatternTree]: ComputedRef<PatternTree[K]>
}
function deepReactive(): DestructedNode {
  const keys = Object.keys(props.node)
  const entries = keys.map(k => [k, computed(() => props.node[k])])
  return Object.fromEntries(entries)
}

let expanded = ref(true)
let {
  kind,
  start,
  end,
  children,
  isNamed,
  text,
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

function withinPos({start, end}: PatternTree, {row, column}: Pos) {
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
  if (props.clickKind) {
    props.clickKind(kind)
    return
  }
  navigator.clipboard.writeText(kind)
  showToast('Node kind copied!')
}
</script>

<template>
  <div v-if="showUnnamed || isNamed" class="tree-node" ref="nodeRef" :class="{target: isTarget}">
    <p class="click-area" @click.stop="expanded = !expanded" @mouseover="highlightNode">
      <span
        v-if="children.some(n => n.isNamed)"
        class="toggle-sign"
        :class="{expanded}"/>
      <span v-if="isNamed" class="node-kind" @click.stop="copyKind(kind)">{{ kind }}</span>
      <span v-if="text" class="node-text">{{ text }}</span>
      <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    </p>
    <PatternNode
      :showUnnamed="showUnnamed"
      :node="child"
      :cursorPosition="isWithin ? cursorPosition : null"
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
.node-range {
  color: #999;
}
</style>