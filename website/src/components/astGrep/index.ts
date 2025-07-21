import { shallowRef, watchEffect, inject, Ref } from 'vue'
import { doFind, Match, useSetupParser } from './lang'
import { Mode, State, useSgState, astGrepStateKey } from './state'

export type { SupportedLang, Match } from './lang'
export { initializeParser, langLoadedKey } from './lang'
export { Mode } from './state'

type YAML = typeof import('js-yaml')

export const yamlImport = import('js-yaml')

function buildRules(yaml: YAML, state: State) {
  let json = []
  if (state.mode === Mode.Patch && state.query) {
    json = [{
      id: 'test-rule',
      language: state.lang,
      rule: {
        pattern: {
          context: state.query,
          strictness: state.strictness || undefined,
          selector: state.selector || undefined,
        },
      },
      fix: state.rewrite || '',
    }]
  } else if (state.config) {
    const ruleStr = state.config // make sync access
    json = yaml.loadAll(ruleStr) as any[]
    let i = 0
    for (let rule of json) {
      if (!rule.id) {
        rule.id = `test-rule-${i++}`
      }
      rule.language = state.lang
    }
  }
  return json
}

function useDoFind(langLoaded: Ref<boolean>, state: State) {
  const matchedHighlights = shallowRef([] as Match[])
  const matchedEnvs = shallowRef([] as unknown[])
  const rewrittenCode = shallowRef(state.source)
  const ruleErrors = shallowRef<string>()

  let yaml = shallowRef<YAML | null>(null)
  yamlImport.then(yml => {
    yaml.value = yml
  })

  watchEffect(async (onInvalidate) => {
    if (!langLoaded.value || !yaml.value) {
      return
    }
    let invalidated = false
    // before async
    const [src, json] = [state.source, buildRules(yaml.value, state)]
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
  })
  return {
    matchedHighlights,
    matchedEnvs,
    rewrittenCode,
    ruleErrors,
  }
}

// NB: this hook cannot be async since it sets up `provide`
export function useAstGrep() {
  const { state, lang, ...refs } = useSgState()
  const langLoaded = useSetupParser(lang)
  const results = useDoFind(langLoaded, state)

  return {
    state,
    lang,
    ...results,
    ...refs,
  }
}

export function usePattern() {
  const {
    query,
    rewrite,
    selector,
    strictness,
  } = inject(astGrepStateKey)!
  return {
    query,
    rewrite,
    selector,
    strictness,
  }
}