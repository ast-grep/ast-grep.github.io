<script setup lang="ts">
import { PropType, ref, toRefs, ComputedRef, computed, inject, watchEffect } from 'vue'
import { DumpNode, highlightKey, Pos } from './dumpTree'

const props = defineProps({
  node: {
    type: Object as PropType<DumpNode>,
    required: true
  },
  cursorPosition: {
    type: Object as PropType<Pos>,
  },
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
</script>

<template>
  <div class="tree-node" ref="nodeRef" :class="{target: isTarget}">
    <p class="click-area" @click.stop="expanded = !expanded" @mouseover="highlightNode">
      <span
        v-if="children.length > 0"
        class="toggle-sign"
        :class="{expanded}"/>
      <span class="node-kind">{{ kind }}</span>
      <span class="node-field">{{ field }}</span>
      <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    </p>
    <TreeNode
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
  border-left: 1px dashed #eee;
  user-select: none;
  --yellow:    #bf8803;
  --red:       #a31515;
  --blue:      #006ab1;
  --green:     #008000;
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
.node-range {
  color: #999;
}
</style>
