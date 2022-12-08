<script setup lang="ts">
import Monaco from './Monaco.vue'
import { shallowRef, watchEffect, provide } from 'vue'
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

let isCollapsed = shallowRef(true)

</script>

<template>
  <div class="query-editor">
    <div class="query-input">
      <Monaco
         :modelValue="modelValue"
         @update:modelValue="emits('update:modelValue', $event)"
         @changeCursor="changeFocusNode"
        :language="language"
        :highlights="highlights"/>
    </div>
    <div class="dumped" :class="!isCollapsed && 'collapsed'"
      @mouseenter="cursorPosition = null" @mouseleave="highlights = []">
      <p @click.self="isCollapsed = !isCollapsed">
        <span class="chevron">›</span>
        TreeSitter Output
      </p>
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
  transition: flex 0.2s;
}
.dumped.collapsed {
  flex: 2em 0 0;
  overflow: hidden;
}
.dumped p {
  text-align: right;
  background: linear-gradient(to bottom, #fff, #fff7);
  z-index: 0;
  cursor: pointer;
}
.chevron {
  display: inline-block;
  transform: rotate(90deg);
  transition: transform 0.2s;
}
.collapsed .chevron {
  transform: rotate(0);
}
.dumped.collapsed > .scrollable {
  display: none;
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
