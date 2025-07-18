<script setup lang="ts">
import { computed, PropType } from 'vue'
import { deepReactiveNode, PatternTree, Pos } from './dumpTree'
import GeneralNode from './GeneralNode.vue'

const props = defineProps({
  node: {
    type: Object as PropType<PatternTree>,
    required: true,
  },
  cursorPosition: Object as PropType<Pos>,
  strictness: {
    type: String,
    required: true,
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
  if (pattern?.value === 'metaVar' || props.strictness === 'signature') {
    return ''
  } else if (text.value) {
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
      ? 'multi meta-var non-capture' :
      'multi meta-var'
  }
  return metaVarText.startsWith('$_') ? 'meta-var non-capture' : 'meta-var'
})

const shouldShow = computed(() => {
  const { strictness } = props
  if (strictness === 'cst' || strictness === 'smart') {
    return true
  } else if (strictness === 'relaxed' || strictness === 'signature') {
    return isNamed.value && !kind.value.includes('comment')
  } else {
    return isNamed.value
  }
})
</script>

<template>
  <GeneralNode
    v-if="shouldShow"
    :showToggle="children.some(n => n.isNamed)"
    :node="node"
    :cursorPosition="cursorPosition"
  >
    <template #info>
      <span :class="!pattern && 'inactive'">
        <span :class="metaVarClass" v-if="metaVarClass">{{ text }}</span>
        <span v-else-if="isNamed" class="node-kind" @click.stop="clickKind?.(kind)">{{
          kind
        }}</span>
        <span v-if="showText" class="node-text">{{ showText }}</span>
        <span class="node-range">
          ({{ start.row }}, {{ start.column }})-({{ end.row }},{{ end.column }})
        </span>
      </span>
    </template>
    <template #children="{ cursorPosition }">
      <PatternNode
        :strictness="strictness"
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
  border: 1px solid currentColor;
  color: var(--red);
  padding: 0.1em 0.35em;
  border-radius: 5px;
  margin: 0 4px 7px;
  font-size: 0.9em;
}
.multi {
  color: var(--green);
}
.non-capture {
  color: var(--gray);
}
.node-kind {
  color: var(--blue);
  padding-left: 7px;
  cursor: pointer;
}
.node-text {
  padding: 7px;
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
