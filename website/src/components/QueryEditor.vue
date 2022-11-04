<script setup lang="ts">
import Monaco from './Monaco.vue'
import { shallowRef, watch, watchEffect, computed } from 'vue'
import TreeNode from './TreeNode.vue'
import { dumpTree } from './dumpTree'

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

let dumped = shallowRef(null)

watch(() => props.modelValue, (value) => {
  emits('update:modelValue', value)
})

watchEffect(() => {
  const {modelValue, parser} = props
  if (!parser) {
    return
  }
  // TODO implement this in rust
  dumped.value = parser.parse(modelValue).rootNode
})

const root = computed(() => {
  const cursor = dumped.value?.walk()
  const rendered = dumpTree(cursor)[0]?.children[0]
  cursor?.delete()
  return rendered
})

</script>

<template>
  <div class="query-editor">
    <div class="query-input">
      <Monaco :language="language" v-model="modelValue"/>
    </div>
    <div class="dumped">
      <TreeNode class="pre" :node="root" v-if="root"/>
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
  flex: 70% 7 0;
}

.dumped {
  flex: 30% 3 0;
  overflow: auto;
  font-size: 12px;
  white-space: pre;
  padding: 1em 2em 1em 0;
  z-index: 1; /* prevent being covered by monaco */
  border-top: 1px solid #f5f5f5;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}
.pre {
  font-family: monospace;
  margin-left: 2em;
  line-height: 1.5em;
}
</style>
