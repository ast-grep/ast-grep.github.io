<script setup lang="ts">
import { computed, PropType } from 'vue'
import { PatternTree, Pos, deepReactiveNode } from './dumpTree'
import GeneralNode from './GeneralNode.vue';

const props = defineProps({
  node: {
    type: Object as PropType<PatternTree>,
    required: true,
  },
  cursorPosition: Object as PropType<Pos>,
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

let showText = computed(() => {
  if (text.value) {
    return text.value
  } else if (!isNamed.value && kind.value) {
    // MISSING node
    return kind.value
  } else {
    return ''
  }
})

let metaVarClass = computed(() => {
  if (pattern?.value !== 'metaVar') {
    return ''
  }
  let metaVarText = text.value || ''
  if (metaVarText.startsWith('$$$')) {
    return metaVarText.startsWith('$$$_') || metaVarText === '$$$'
      ? 'multi meta-var non-capture' : 'multi meta-var'
  }
  return metaVarText.startsWith('$_') ? 'meta-var non-capture' : 'meta-var'
})

</script>

<template>
  <GeneralNode v-if="showUnnamed || isNamed"
    :showToggle="children.some(n => n.isNamed)"
    :node="node"
    :cursorPosition="cursorPosition"
  >
    <template #info>
      <span :class="!pattern && 'inactive'">
        <span :class="metaVarClass" v-if="metaVarClass">{{ text }}</span>
        <span v-else-if="isNamed" class="node-kind"  @click.stop="clickKind?.(kind)">{{ kind }}</span>
        <span v-else-if="showText" class="node-text">{{ showText }}</span>
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
.meta-var {
  background: var(--red);
  color: var(--vp-c-bg);
  padding: 0.1em 0.3em;
  border-radius: 4px;
  margin-left: 7px;
  font-size: 0.9em;
}
.multi {
  background: var(--blue);
}
.non-capture {
  background: var(--gray);
}
.node-kind {
  color: var(--blue);
  padding-left: 7px;
  cursor: pointer;
}
.node-text {
  padding-left: 7px;
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