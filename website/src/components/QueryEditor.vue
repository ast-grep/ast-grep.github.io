<script setup lang="ts">
import Monaco from './Monaco.vue'
import { shallowRef, watch, watchEffect, provide, reactive } from 'vue'
import TreeNode from './TreeNode.vue'
import { dumpTree, highlightKey } from './dumpTree'

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
})

let root = shallowRef(null)
let highlights = shallowRef([])

watch(() => props.modelValue, (value) => {
  emits('update:modelValue', value)
})

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

function changeFocusNode(e) {
  const {position} = e
  cursorPosition.value = {
    row: position.lineNumber - 1,
    column: position.column - 1,
  }
}

</script>

<template>
  <div class="query-editor">
    <div class="query-input">
      <Monaco
         v-model="modelValue"
         @changeCursor="changeFocusNode"
        :language="language"
        :highlights="highlights"/>
    </div>
    <div class="dumped" @mouseenter="cursorPosition = null" @mouseleave="highlights = []">
      <p>TreeSitter Output</p>
      <div class="scrollable">
        <TreeNode class="pre" :node="root" v-if="root" :cursorPosition="cursorPosition"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.query-input {
  flex: 60% 6 0;
}

.dumped {
  display: flex;
  flex-direction: column;
  flex: 40% 4 0;
  overflow: auto;
  font-size: 12px;
  white-space: pre;
  padding: 1em;
  padding-top: 0;
  z-index: 1; /* prevent being covered by monaco */
  border-top: 1px solid #f5f5f5;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}
.dumped p {
  text-align: right;
  background: linear-gradient(to bottom, #fff, #fff7);
  backdrop-filter: blur(1px);
  z-index: 0;
}
.scrollable {
  flex: 1 1 100%;
  padding-top: 1em;
  margin-top: -1em;
  overflow-y: auto;
}
.pre {
  font-family: monospace;
  line-height: 1.5em;
}
</style>
