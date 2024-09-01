<script setup lang="ts">
import { Monaco, EditorWithPanel } from './editors'
import { shallowRef, watchEffect, provide, PropType, inject } from 'vue'
import PatternNode from './dump/PatternNode.vue'
import { highlightKey, langLoadedKey, PatternTree, Pos } from './dump/dumpTree'
import { dumpPattern } from 'ast-grep-wasm'
import PatternConfig from './PatternConfig.vue'

const modelValue = defineModel<string>()
const rewrite = defineModel<string>('rewrite')
const strictness = defineModel<string>('strictness')
const selector = defineModel<string>('selector')

defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  ruleErrors: {
    type: String,
  },
  clickKind: Function as PropType<(k: string) => void>,
})

let root = shallowRef(null as PatternTree | null)
let highlights = shallowRef([] as number[][])

const langLoaded = inject(langLoadedKey)!
watchEffect(() => {
  if (langLoaded.value) {
    root.value = dumpPattern(modelValue.value || '')
  }
})

let cursorPosition = shallowRef<Pos | null>(null)
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

</script>

<template>
  <EditorWithPanel
    @enterPanel="cursorPosition = null" @leavePanel="highlights = []"
  >
    <template #editor>
      <div class="dual-editor">
        <Monaco
          v-model="modelValue"
          @changeCursor="changeFocusNode"
          :language="language"
          :highlights="highlights"/>
        <p class="pattern-separator">
          <a target="_blank" href="https://ast-grep.github.io/guide/rewrite-code.html">ⓘ</a>
          Rewrite
        </p>
        <Monaco
           v-model="rewrite"
          :language="language"
        />
      </div>
    </template>
    <template #panelAccessory>
      <PatternConfig
        :error="ruleErrors"
        v-model:strictness="strictness"
        v-model:selector="selector"
      />
    </template>
    <template #panel>
      <PatternNode
        v-if="root"
        :clickKind="clickKind"
        :showUnnamed="true"
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

.dual-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pattern-separator {
  border-top: 1px solid var(--vp-c-bg-soft);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  border-radius: 10px 10px 0 0;
  padding: 0 1em 0;
  z-index: 0;
}
</style>