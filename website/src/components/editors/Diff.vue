<script lang="ts">
// LOL vue sfc compiler does not allow type alias and dynamic import co-exist
import type monaco from 'monaco-editor'
</script>

<script lang="ts" setup>
import { onActivated, onBeforeUnmount, onMounted, ref, shallowRef, watchEffect } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'javascript',
  },
  source: {
    type: String,
    required: true,
  },
  rewrite: {
    type: String,
    default: '',
  },
})

const monaco = await import('monaco-editor')

const containerRef = ref<HTMLDivElement | null>(null)
const editor = shallowRef<monaco.editor.IStandaloneDiffEditor | null>(null)

onMounted(() => {
  if (!containerRef.value) {
    return
  }
  const editorInstance = monaco.editor.createDiffEditor(containerRef.value, {
    readOnly: true,
    automaticLayout: false,
    scrollBeyondLastLine: false,
    lineNumbersMinChars: 3,
    minimap: {
      enabled: false,
    },
    wordWrap: 'on',
    // disable the resizing
    enableSplitViewResizing: false,
    // Render the diff inline
    renderSideBySide: false,
    renderOverviewRuler: false,
  })
  editor.value = editorInstance
})

watchEffect(() => {
  let oldModel = editor.value?.getModel()
  const original = monaco.editor.createModel(props.source, props.language)
  const modified = monaco.editor.createModel(props.rewrite, props.language)
  editor.value?.setModel({
    original,
    modified,
  })
  if (oldModel) {
    oldModel.original?.dispose()
    oldModel.modified?.dispose()
  }
})

// I don't know why but monaco will lose dom lines
// when it is not dom-visible.
// We force re-render on onActivate
onActivated(() => {
  let oldModel = editor.value?.getModel()
  const original = monaco.editor.createModel(props.source, props.language)
  const modified = monaco.editor.createModel(props.rewrite, props.language)
  editor.value?.setModel({
    original,
    modified,
  })
  if (oldModel) {
    oldModel.original?.dispose()
    oldModel.modified?.dispose()
  }
})

onBeforeUnmount(() => {
  editor.value?.dispose()
})
</script>

<template>
  <div class="editor" ref="containerRef" />
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  text-align: left;
}
</style>
