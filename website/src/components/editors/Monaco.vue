<script lang="ts">
// LOL vue sfc compiler does not allow type alias and dynamic import co-exist
import type monaco from 'monaco-editor'

function truthy<T>(v: T | null | undefined): v is T {
  return Boolean(v)
}
</script>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { onBeforeUnmount, onMounted, PropType, ref, shallowRef, watch } from 'vue'
import { Match, normalizeMonacoLang } from '../astGrep/lang'
import { setup } from './monaco'

// https://vitepress.dev/reference/runtime-api
const { isDark } = useData()
const monaco = await setup()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'changeCursor', value: any): void
}>()

const props = defineProps({
  language: {
    type: String as PropType<string>,
    default: 'javascript',
  },
  modelValue: String,
  readonly: {
    type: Boolean,
    default: false,
  },
  highlights: {
    type: Array as PropType<number[][]>,
  },
  matches: {
    type: Array as PropType<Match[]>,
  },
})

const containerRef = ref<HTMLDivElement | null>(null)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)

let highlights: monaco.editor.IEditorDecorationsCollection | null = null
let matches: monaco.editor.IEditorDecorationsCollection | null = null

onMounted(() => {
  if (!containerRef.value) {
    return
  }
  const editorInstance = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: normalizeMonacoLang(props.language),
    readOnly: props.readonly,
    automaticLayout: false,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbersMinChars: 3,
    theme: isDark.value ? 'vs-dark' : 'vs',
    minimap: {
      enabled: false,
    },
    suggest: {
      preview: true,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
  })
  editor.value = editorInstance
  editorInstance.onDidChangeModelContent(() => {
    emits('update:modelValue', editorInstance.getValue())
  })
  editorInstance.onDidChangeCursorPosition(e => {
    emits('changeCursor', e)
  })
  highlights = editorInstance.createDecorationsCollection(
    props.highlights?.map(transformHighlight) || [],
  )
  matches = editorInstance.createDecorationsCollection(
    props.matches?.map(transformMatch).filter(truthy) || [],
  )
  const modelMarks = props.matches?.map(toModelMark).filter(truthy) || []
  let oldModel = editorInstance.getModel()
  if (oldModel) {
    monaco.editor.setModelMarkers(oldModel, 'owner', modelMarks)
  }
})

watch(isDark, () => {
  monaco.editor.setTheme(isDark.value ? 'vs-dark' : 'vs')
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value?.getValue() === value) return
    editor.value?.setValue(value || '')
  },
  { immediate: true },
)

const transformHighlight = (match: number[]) => {
  const [sr, sc, er, ec] = match
  return {
    range: new monaco.Range(sr + 1, sc + 1, er + 1, ec + 1),
    options: {
      inlineClassName: 'monaco-highlight-span',
    },
  }
}

const transformMatch = (match: Match) => {
  if (match.type !== 'simple') {
    return null
  }
  const [sr, sc, er, ec] = match.range
  return {
    range: new monaco.Range(sr + 1, sc + 1, er + 1, ec + 1),
    options: {
      inlineClassName: 'monaco-match-span',
    },
  }
}

const mapping: Record<string, monaco.MarkerSeverity> = {
  info: monaco.MarkerSeverity.Info,
  warning: monaco.MarkerSeverity.Warning,
  error: monaco.MarkerSeverity.Error,
}

function toModelMark(match: Match) {
  if (match.type !== 'rule') {
    return null
  }
  const m = match.range
  console.log(match)
  return {
    code: match.rule,
    message: match.message,
    severity: mapping[match.severity],
    startLineNumber: m[0] + 1,
    startColumn: m[1] + 1,
    endLineNumber: m[2] + 1,
    endColumn: m[3] + 1,
  }
}

watch(() => props.highlights, (matched) => {
  const ranges = matched!.map(transformHighlight)
  highlights?.set(ranges)
})

watch(() => props.matches, (matched) => {
  const ranges = matched!.map(transformMatch).filter(truthy)
  matches?.set(ranges)
  const modelMarks = matched!.map(toModelMark).filter(truthy)
  let oldModel = editor.value?.getModel()
  if (oldModel) {
    monaco.editor.setModelMarkers(oldModel, 'owner', modelMarks)
  }
})

watch(() => props.language, lang => {
  let oldModel = editor.value?.getModel()
  let newModel = monaco.editor.createModel(props.modelValue || '', normalizeMonacoLang(lang))
  editor.value?.setModel(newModel)
  if (oldModel) {
    oldModel.dispose()
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
<style>
.monaco-highlight-span {
  border-bottom: 1px dashed var(--brand-color);
  background-color: var(--theme-highlight4);
}
.monaco-match-span {
  background-color: var(--theme-highlight3);
}
</style>
