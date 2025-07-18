<script setup lang="ts">
import { dumpPattern } from 'ast-grep-wasm'
import { inject, provide, shallowRef, watch, watchEffect } from 'vue'
import { langLoadedKey, usePattern } from './astGrep'
import { highlightKey, PatternTree, Pos } from './dump/dumpTree'
import PatternNode from './dump/PatternNode.vue'
import { EditorWithPanel, Monaco } from './editors'
import PatternConfig from './PatternConfig.vue'
import Error from './utils/Error.vue'

const props = defineProps({
  language: {
    type: String,
    default: 'javascript',
  },
  ruleErrors: {
    type: String,
  },
})

const {
  query,
  rewrite,
  strictness,
  selector,
} = usePattern()

let root = shallowRef(null as PatternTree | null)
let highlights = shallowRef([] as number[][])

const langLoaded = inject(langLoadedKey)!
watchEffect(() => {
  if (!langLoaded.value) {
    return
  }
  try {
    root.value = dumpPattern(query.value || '', selector.value || undefined)
  } catch (e) {
    console.error(e)
  }
})

watch(() => [query.value, props.language], () => {
  selector.value = ''
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
</script>

<template>
  <EditorWithPanel
    @enterPanel="cursorPosition = undefined"
    @leavePanel="highlights = []"
  >
    <template #editor>
      <div class="dual-editor">
        <Monaco
          v-model="query"
          @changeCursor="changeFocusNode"
          :language="language"
          :highlights="highlights"
        />
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
        v-model:strictness="strictness"
        v-model:selector="selector"
      />
    </template>
    <template #panel>
      <Error class="error" :error="ruleErrors" />
      <PatternNode
        v-if="root"
        :clickKind="k => selector = k"
        :strictness="strictness"
        class="pre"
        :node="root"
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

.error {
  width: 100%;
  margin: 0.5em 0 0.25em;
}
</style>
