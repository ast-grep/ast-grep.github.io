<script setup lang="ts">
import { shallowRef } from 'vue'
import { Monaco, Diff, EditorWithPanel } from './editors'
import QueryEditor from './QueryEditor.vue'
import ResetConfig from './ResetConfig.vue'
import PatternEditor from './PatternEditor.vue'
import SelectLang from './SelectLang.vue'
import Tabs from './utils/Tabs.vue'
import Toolbars from './Toolbars.vue'
import EnvDisplay from './EnvDisplay.vue'
import { initializeParser, useAstGrep, Mode as ModeImport } from './astGrep'

// important initialization
await initializeParser()

const {
  state,
  mode,
  lang,
  // source code
  source,
  // config
  config,
  // match result
  matchedEnvs,
  matchedHighlights,
  rewrittenCode,
  // error
  ruleErrors,
} = useAstGrep()

// this re-aliasing is critical for template usage
const Mode = ModeImport

let activeEditor = shallowRef('code')
function changeActiveEditor(active: string) {
  activeEditor.value = active
}

const modeText = {
  [Mode.Patch]: 'Pattern',
  [Mode.Config]: 'YAML',
}

let codeText = {
  code: 'Source',
  diff: 'Diff',
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
            :ruleErrors="ruleErrors"
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
          <div class="action-bar">
            <SelectLang v-model="lang"/>
            <ResetConfig v-model="state" />
          </div>
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
.action-bar {
  display: flex;
  align-items: center;
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
