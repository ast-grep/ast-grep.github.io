<script setup lang="ts">
import Monaco from './Monaco.vue'
import { shallowRef, watchEffect, provide, PropType } from 'vue'
import TreeNode from './TreeNode.vue'
import { dumpTree, highlightKey } from './dumpTree'
import EditorWithPanel from './EditorWithPanel.vue'

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

watchEffect(() => {
  const {modelValue, parser} = props
  if (!parser) {
    return
  }
  // TODO implement this in rust
  const dumped = parser.parse(modelValue).rootNode
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
