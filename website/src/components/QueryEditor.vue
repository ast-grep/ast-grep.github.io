<script setup lang="ts">
import { dumpASTNodes } from 'ast-grep-wasm'
import { computed, inject, PropType, provide, shallowRef, watchEffect } from 'vue'
import { langLoadedKey } from './astGrep'
import type { Match, SupportedLang } from './astGrep'
import { DumpNode, highlightKey, Pos } from './dump/dumpTree'
import TreeNode from './dump/TreeNode.vue'
import { EditorWithPanel, Monaco } from './editors'

const modelValue = defineModel<string>()

const props = defineProps({
  language: {
    type: String as PropType<SupportedLang>,
    default: 'javascript',
  },
  matches: Array as PropType<Match[]>,
})

let root = shallowRef(null as DumpNode | null)
let highlights = shallowRef([] as number[][])

const langLoaded = inject(langLoadedKey)!
watchEffect(() => {
  if (langLoaded.value) {
    root.value = dumpASTNodes(modelValue.value || '')
  }
})

// this assumes the node can be tracked by range + kind
// it will break if multiple same-kind nodes have the same range
const matchedIds = computed(() => {
  const matches = props.matches || []
  return new Set(matches.map(match => {
    const [startRow, startCol, endRow, endCol] = match.range
    return `${match.kind}-${startRow}-${startCol}-${endRow}-${endCol}`
  }))
})

let cursorPosition = shallowRef<Pos>()
provide(highlightKey, e => {
  highlights.value = [e]
})

function changeFocusNode(e: any) {
  const { position } = e
  cursorPosition.value = {
    row: position.lineNumber - 1,
    column: position.column - 1,
  }
}

let showFullTree = shallowRef(false)
</script>

<template>
  <EditorWithPanel
    panelTitle="TreeSitter Output"
    @enterPanel="cursorPosition = undefined"
    @leavePanel="highlights = []"
  >
    <template #editor>
      <div class="dual-editor">
        <Monaco
          v-model="modelValue"
          @changeCursor="changeFocusNode"
          :language="language"
          :matches="matches"
          :highlights="highlights"
        />
        <slot />
      </div>
    </template>
    <template #panelAccessory>
      <label class="tree-toggle-label" title="Show unnamed nodes in CST">
        <input class="tree-toggle" type="checkbox" v-model="showFullTree">
        Show Full Tree
        <a target="_blank" href="https://ast-grep.github.io/advanced/core-concepts.html">ⓘ</a>
      </label>
    </template>
    <template #panel>
      <TreeNode
        v-if="root"
        :showUnnamed="showFullTree"
        class="pre"
        :node="root"
        :matchedIds="matchedIds"
        :cursorPosition="cursorPosition"
      />
    </template>
  </EditorWithPanel>
</template>

<style scoped>
.pre {
  font-family: monospace;
  line-height: 1.5em;
}
.tree-toggle-label {
  float: left;
  user-select: none;
  vertical-align: middle;
}
.tree-toggle-label:hover > a {
  text-decoration: underline dashed;
  text-underline-offset: 3px;
}
.tree-toggle {
  height: 0.85em;
  width: 0.85em;
  /* Remove most all native input styles */
  appearance: none;
  /* For iOS < 15 */
  background-color: transparent;
  /* Not removed via appearance */
  margin: 0;

  font: inherit;
  border: 1px solid currentColor;
  color: var(--brand-color);
  border-radius: 0.15em;
  position: relative;
  line-height: 1;
}
.tree-toggle::before {
  position: absolute;
  font-size: 0.7em;
  content: '✓';
  top: 0;
  left: 0;
  transform: scale(0);
  transform-origin: center center;
  transition: 120ms transform ease-in-out;
  background-color: transparent;
}

.tree-toggle:checked::before {
  transform: scale(1);
}
.dual-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
