<script setup lang="ts">
import { shallowRef, shallowReactive, toRefs, watchEffect } from 'vue'
import { Monaco, Diff, EditorWithPanel } from './editors'
import QueryEditor from './QueryEditor.vue'
import PatternEditor from './PatternEditor.vue'
import SelectLang from './SelectLang.vue'
import Tabs from './utils/Tabs.vue'
import { showToast } from './utils/Toast.vue'
import Toolbars from './Toolbars.vue'
import EnvDisplay from './EnvDisplay.vue'
import '../style.css'
import { initializeParser, doFind, Match } from './astGrep/lang'
import { useSetupParser, restoreState, Mode as ModeImport } from './astGrep'

// important initialization
await initializeParser()


// this re-aliasing is critical for template usage
const Mode = ModeImport

const state = shallowReactive(restoreState())
let {
  source,
  query,
  rewrite,
  strictness,
  selector,
  config,
  mode,
  lang,
} = toRefs(state)

let langLoaded = useSetupParser(lang)

let activeEditor = shallowRef('code')
function changeActiveEditor(active: string) {
  activeEditor.value = active
}

type YAML = typeof import('js-yaml')
let yaml = shallowRef<YAML | null>(null)
import('js-yaml').then(yml => {
  yaml.value = yml
})

const matchedHighlights = shallowRef([] as Match[])
const matchedEnvs = shallowRef([] as unknown[])
const rewrittenCode = shallowRef(source.value)
const ruleErrors = shallowRef<string>()

function parseYAML(src: string) {
  return yaml.value!.loadAll(src) as any[]
}

function buildRules() {
  let json = []
  if (mode.value === Mode.Patch && query.value) {
    json = [{
      id: 'test-rule',
      language: lang.value,
      rule: {
        pattern: {
          context: query.value,
          strictness: strictness.value || undefined,
          selector: selector.value || undefined,
        },
      },
      fix: rewrite.value || '',
    }]
  } else if (config.value) {
    const ruleStr = config.value // make sync access
    json = parseYAML(ruleStr) as any[]
    let i = 0
    for (let rule of json) {
      if (!rule.id) {
        rule.id = `test-rule-${i++}`
      }
      rule.language = lang.value
    }
  }
  return json
}

watchEffect(async (onInvalidate) => {
  if (!langLoaded.value || !yaml.value) {
    return
  }
  let invalidated = false
  // before async
  const [src, json] = [source.value, buildRules()]
  onInvalidate(() => invalidated = true)
  try {
    const [matches, fixed] = await doFind(src, json)
    if (invalidated) { return }
    rewrittenCode.value = fixed
    matchedHighlights.value = matches
    matchedEnvs.value = matches.map(m => m.env)
    ruleErrors.value = undefined
  } catch (e: any) {
    if (invalidated) { return }
    console.error(e)
    ruleErrors.value = e.toString()
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

function setSelector(kind: string) {
  selector.value = kind
  showToast('Selected Sub-node in Pattern!')
}

let codeMode = shallowRef('code')
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
          <PatternEditor
            :clickKind="setSelector"
            :ruleErrors="ruleErrors"
            v-model="query"
            v-model:rewrite="rewrite"
            v-model:strictness="strictness"
            v-model:selector="selector"
            :language="lang"/>
        </template>
        <template #[Mode.Config]>
          <EditorWithPanel panelTitle="Matched Variables">
            <template #editor>
              <Monaco language="yaml" v-model="config"/>
            </template>
            <template #panel>
              <EnvDisplay :envs="matchedEnvs" :error="ruleErrors"/>
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
  /* drop-shadow is causing Monaco suggestion misplaced */
  filter: drop-shadow(0 0 8px #00000010);
}
.half:focus-within {
  /* keep here since monaco suggestion details are not expanded by default */
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