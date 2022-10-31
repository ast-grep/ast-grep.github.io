<script setup lang="ts">
import Monaco from './Monaco.vue'
import { ref, watch, watchEffect } from 'vue'

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

let dumped = ref('')

watch(() => props.modelValue, (value) => {
  emits('update:modelValue', value)
})

watchEffect(() => {
  const {modelValue, parser} = props
  if (!parser) {
    return
  }
  // TODO implement this in rust
  const dumpedAST = parser.parse(modelValue).rootNode
  dumped.value = renderTree(dumpedAST)
})

function renderTree(tree: any) {
  const cursor = tree.walk()

  let row = ''
  let rows = []
  let finishedRow = false
  let visitedChildren = false
  let indentLevel = 0

  for (let i = 0;; i++) {
    let displayName: string
    if (cursor.nodeIsMissing) {
      displayName = `MISSING ${cursor.nodeType}`
    } else if (cursor.nodeIsNamed) {
      displayName = cursor.nodeType
    }

    if (visitedChildren) {
      if (displayName) {
        finishedRow = true
      }

      if (cursor.gotoNextSibling()) {
        visitedChildren = false
      } else if (cursor.gotoParent()) {
        visitedChildren = true
        indentLevel--
      } else {
        break
      }
    } else {
      if (displayName) {
        if (finishedRow) {
          rows.push(row)
          finishedRow = false
        }
        const start = cursor.startPosition
        const end = cursor.endPosition
        let fieldName = cursor.currentFieldName()
        if (fieldName) {
          fieldName += ': '
        } else {
          fieldName = ''
        }
        row = `${'  '.repeat(indentLevel)}${fieldName}${displayName} [${start.row}, ${start.column}] - [${end.row}, ${end.column}]`
        finishedRow = true
      }

      if (cursor.gotoFirstChild()) {
        visitedChildren = false
        indentLevel++
      } else {
        visitedChildren = true
      }
    }
  }
  if (finishedRow) {
    rows.push(row)
  }

  cursor.delete()
  return rows.join('\n')
}

</script>

<template>
  <div class="query-editor">
    <div class="query-input">
      <Monaco :language="language" v-model="modelValue"/>
    </div>
    <pre class="dumped">{{ dumped }}</pre>
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
  padding: 1em 2em 1em 2em;
  z-index: 1; /* prevent being covered by monaco */
  border-top: 1px solid #f5f5f5;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}
</style>
