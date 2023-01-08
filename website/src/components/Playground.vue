<script setup lang="ts">
import { shallowRef, shallowReactive, toRefs, provide, watchEffect } from 'vue'
import Monaco from './Monaco.vue'
import QueryEditor from './QueryEditor.vue'
import Diff from './Diff.vue'
import { findNodes, fixErrors } from 'ast-grep-wasm'
import SelectLang from './SelectLang.vue'
import Tabs from './Tabs.vue'
import Toolbars from './Toolbars.vue'
import EnvDisplay from './EnvDisplay.vue'
import EditorWithPanel from './EditorWithPanel.vue'
import { initializeParser, setGlobalParser } from './lang'
import { restoreState, Mode as ModeImport } from '../state'
import { langLoadedKey } from './dumpTree'

// important initialization
await initializeParser()

// this re-aliasing is critical for template usage
const Mode = ModeImport

const state = shallowReactive(restoreState())
let {
  source,
  query,
  config,
  mode,
  lang,
} = toRefs(state)
let langLoaded = shallowRef(false)
let activeEditor = shallowRef('code')
function changeActiveEditor(active) {
  activeEditor.value = active
}

const matchedHighlights = shallowRef([])
const matchedEnvs = shallowRef([])
const rewrittenCode = shallowRef(source.value)

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
  await setGlobalParser(lang.value)
  langLoaded.value = true
})

watchEffect(async () => {
  if (!langLoaded.value) {
    return
  }
  try {
    const matches = await doFind()
    matchedHighlights.value = matches.map(m => m.node.range)
    matchedEnvs.value = matches.map(m => m.env)
  } catch (e) {
    console.error(e)
    matchedHighlights.value = []
    matchedEnvs.value = []
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

let codeMode = shallowRef('code')
provide(langLoadedKey, langLoaded)
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
        <QueryEditor v-model="source" :language="lang" :matches="matchedHighlights"/>
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
          <QueryEditor v-model="query" :language="lang"/>
        </template>
        <template #[Mode.Config]>
          <EditorWithPanel panelTitle="Matched Variables">
            <template #editor>
              <Monaco language="yaml" v-model="config"/>
            </template>
            <template #panel>
              <EnvDisplay :envs="matchedEnvs"/>
            </template>
          </EditorWithPanel>
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
