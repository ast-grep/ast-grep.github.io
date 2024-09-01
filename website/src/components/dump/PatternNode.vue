<script setup lang="ts">
import { PropType } from 'vue'
import { PatternTree, Pos, deepReactiveNode } from './dumpTree'
import GeneralNode from './GeneralNode.vue';

const props = defineProps({
  node: {
    type: Object as PropType<PatternTree>,
    required: true,
  },
  cursorPosition: {
    type: Object as PropType<Pos | null>,
    required: true,
  },
  showUnnamed: {
    type: Boolean,
    default: false,
  },
  clickKind: Function as PropType<(k: string) => void>,
})

let {
  kind,
  start,
  end,
  children,
  isNamed,
  text,
  pattern,
} = deepReactiveNode(props)


</script>

<template>
  <GeneralNode v-if="showUnnamed || isNamed"
    :showToggle="children.some(n => n.isNamed)"
    :node="node"
    :cursorPosition="cursorPosition"
  >
    <template #info>
      <span :class="!pattern && 'inactive'">
        <span v-if="isNamed" class="node-kind"  @click.stop="clickKind?.(kind)">{{ kind }}</span>
        <span v-else class="node-text">{{ kind }}</span>
        <span v-if="text" class="node-text">{{ text }}</span>
        <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
      </span>
    </template>
    <template #children={cursorPosition}>
      <PatternNode
        :showUnnamed="showUnnamed"
        :node="child"
        :cursorPosition="cursorPosition"
        :clickKind="clickKind"
        v-for="child in children"
      />
    </template>
  </GeneralNode>
</template>

<style scoped>
.inactive {
  opacity: 0.5;
  font-weight: 100;
  filter: grayscale(0.5);
  font-style: italic;
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