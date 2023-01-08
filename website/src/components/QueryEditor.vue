<script setup lang="ts">
import Monaco from './Monaco.vue'
import { shallowRef, watchEffect, provide, PropType, computed } from 'vue'
import TreeNode from './TreeNode.vue'
import { dumpTree, highlightKey } from './dumpTree'
import EditorWithPanel from './EditorWithPanel.vue'
import { preProcessPattern } from 'ast-grep-wasm'
import { dumpASTNodes } from 'ast-grep-wasm'

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void,
}>()

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  modelValue: String,
  parser: Object,
  matches: Array as PropType<number[][]>,
})

let root = shallowRef(null)
let highlights = shallowRef([])

const processedSource = computed(() => {
  const { modelValue } = props
  // have matches. It is source code panel
  // do not pre-process source code
  if (props.matches != null) {
    return modelValue
  } else {
    // do process pattern query
    return preProcessPattern(modelValue)
  }
})

watchEffect(() => {
  const {parser} = props
  if (!parser) {
    return
  }
  console.log(dumpASTNodes(processedSource.value))
  const dumped = parser.parse(processedSource.value).rootNode
  const cursor = dumped.walk()
  root.value = dumpTree(cursor)[0]
  cursor.delete()
})

let cursorPosition = shallowRef(null)
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
  <EditorWithPanel panelTitle="TreeSitter Output"
    @enterPanel="cursorPosition = null" @leavePanel="highlights = []"
  >
    <template #editor>
      <Monaco
         :modelValue="modelValue"
         @update:modelValue="emits('update:modelValue', $event)"
         @changeCursor="changeFocusNode"
        :language="language"
        :matches="matches"
        :highlights="highlights"/>
    </template>
    <template #panel>
      <TreeNode
        v-if="root"
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
</style>
