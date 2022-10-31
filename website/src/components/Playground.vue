<script setup lang="ts">
import { ref, shallowRef, shallowReactive, toRefs, watchEffect } from 'vue'
import Monaco from './Monaco.vue'
import QueryEditor from './QueryEditor.vue'
import Diff from './Diff.vue'
import TreeSitter from 'web-tree-sitter'
import init, {findNodes, setupParser, fixErrors, dumpASTNodes} from 'ast-grep-wasm'
import SelectLang from './SelectLang.vue'
import Tabs from './Tabs.vue'
import Toolbars from './Toolbars.vue'
import { restoreState, Mode as ModeImport } from '../state'

const Mode = ModeImport

async function initializeTreeSitter() {
  await TreeSitter.init()
  let entrypoint = globalThis as any
  entrypoint.Parser = TreeSitter
  entrypoint.Language = TreeSitter.Language
}

await initializeTreeSitter()
await init()

const state = shallowReactive(restoreState())
let {
  source,
  query,
  config,
  mode,
  lang,
} = toRefs(state)
let langLoaded = ref(false)
let activeEditor = ref('code')
let parser = shallowRef(null)
function changeActiveEditor(active) {
  activeEditor.value = active
}

const matchedHighlights = ref([])
const rewrittenCode = ref(source.value)
const parserPaths: Record<string, string> = {
  javascript: 'tree-sitter-javascript.wasm',
  typescript: 'tree-sitter-typescript.wasm',
}

async function parseYAML(src: string) {
  const yaml = await import('js-yaml')
  return yaml.load(src) as any
}

async function doFind() {
  if (mode.value === Mode.Patch) {
    return findNodes(
      source.value,
      {rule: {pattern: query.value}},
    )
  } else {
    const src = source.value
    const val = config.value;
    const json = await parseYAML(val)
    if (json.fix) {
      rewrittenCode.value = fixErrors(src, json)
    } else {
      rewrittenCode.value = src
    }
    return findNodes(
      src,
      json,
    )
  }
}

watchEffect(async () => {
  langLoaded.value = false
  parser.value = null
  const path = parserPaths[lang.value]
  await setupParser(path)
  const loadedLang = await globalThis.Language.load(path)
  const p = new globalThis.Parser()
  p.setLanguage(loadedLang)
  parser.value = p
  langLoaded.value = true
})

watchEffect(async () => {
  try {
    if (!langLoaded.value) {
      return
    }
    matchedHighlights.value = await doFind()
  } catch (e) {
    matchedHighlights.value = []
  }
  return
})

const modeText = {
  [Mode.Patch]: 'Pattern',
  [Mode.Config]: 'YAML',
}

let codeText = {
  code: 'Source',
  diff: 'Diff',
}

let codeMode = ref('code')

</script>

<template>
  <Toolbars
    :state="state"
    :active="activeEditor"
    @changeActiveEditor="changeActiveEditor"
  />
  <main class="playground">
    <div class="half" :class="activeEditor !== 'code' && 'inactive'">
      <Tabs v-model="codeMode" :modeText="codeText">
      <template #code>
        <Monaco v-model="source" :language="lang" :highlights="matchedHighlights"/>
      </template>
      <template #diff>
        <Diff :source="source" :rewrite="rewrittenCode" :language="lang"/>
      </template>
      <template #addon>
        <p class="match-result">
          <span  v-if="matchedHighlights.length > 0">
            Found {{ matchedHighlights.length }} match(es).
          </span>
          <span v-else>No match found.</span>
        </p>
      </template>
      </Tabs>
    </div>
    <div class="half" :class="activeEditor !== 'search' && 'inactive'">
      <Tabs v-model="mode" :modeText="modeText">
        <template #[Mode.Patch]>
          <QueryEditor v-model="query" :language="lang" :parser="parser"/>
        </template>
        <template #[Mode.Config]>
          <Monaco language="yaml" v-model="config"/>
        </template>
        <template #addon>
          <SelectLang v-model="lang"/>
        </template>
      </Tabs>
    </div>
  </main>
</template>

<style scoped>
.playground {
  display: flex;
  flex-wrap: wrap;
  flex: 1 0 auto;
  align-items: stretch;
  gap: 0 10px;
  position: relative;
}
.half {
  min-width: 320px;
  flex: 1 0 30%;
  display: flex;
  flex-direction: column;
  filter: drop-shadow(0 0 8px #00000010);
}
.half:focus-within {
  filter: drop-shadow(0 0 16px #00000020);
}

@media only screen and (max-width: 780px) {
  .half.inactive {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.2s all;
    opacity: 0;
    pointer-events: none;
  }
}

</style>
