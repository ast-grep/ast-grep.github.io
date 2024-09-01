<script setup lang="ts">
import { Monaco, EditorWithPanel } from './editors'
import { shallowRef, watchEffect, provide, PropType, inject } from 'vue'
import TreeNode from './dump/TreeNode.vue'
import { highlightKey, DumpNode, Pos } from './dump/dumpTree'
import { dumpASTNodes } from 'ast-grep-wasm'
import { langLoadedKey } from './astGrep'
import type { Match, SupportedLang } from './astGrep'

const modelValue = defineModel<string>()

defineProps({
  language: {
    type: String as PropType<SupportedLang>,
    default: 'javascript'
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

let cursorPosition = shallowRef<Pos>()
provide(highlightKey, e => {
  highlights.value = [e]
})

function changeFocusNode(e: any) {
  const {position} = e
  cursorPosition.value = {
    row: position.lineNumber - 1,
    column: position.column - 1,
  }
}

let showFullTree = shallowRef(false)
</script>

<template>
  <EditorWithPanel panelTitle="TreeSitter Output"
    @enterPanel="cursorPosition = undefined" @leavePanel="highlights = []"
  >
    <template #editor>
      <div class="dual-editor">
        <Monaco
          v-model="modelValue"
          @changeCursor="changeFocusNode"
          :language="language"
          :matches="matches"
          :highlights="highlights"/>
        <slot/>
      </div>
    </template>
    <template #panelAccessory>
      <label class="tree-toggle-label">
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
        :cursorPosition="cursorPosition"/>
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
  content: "✓";
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