<script setup lang="ts">
import { PropType } from 'vue'
import { GeneralNode, Pos } from './dumpTree'
import { useHighlightNode } from './highlightNode'

const props = defineProps({
  node: {
    type: Object as PropType<GeneralNode>,
    required: true
  },
  showToggle: Boolean,
  cursorPosition: {
    type: Object as PropType<Pos | null>,
    required: true,
  },
  clickKind: Function as PropType<(k: string) => void>,
})

const {
  isWithin,
  isTarget,
  highlightNode,
  expanded,
  nodeRef,
} = useHighlightNode(props)

</script>

<template>
  <div class="tree-node" ref="nodeRef" :class="{target: isTarget}">
    <p class="click-area" @click.stop="expanded = !expanded" @mouseover="highlightNode">
      <span
        v-if="showToggle"
        class="toggle-sign"
        :class="{expanded}"/>
      <slot name="info"/>
    </p>
    <slot v-if="expanded" name="children" :cursorPosition="isWithin ? cursorPosition : null"/>
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
</style>