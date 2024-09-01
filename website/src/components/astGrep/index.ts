import { shallowRef, watchEffect } from 'vue'
import { doFind, Match, useSetupParser } from './lang'
import { Mode, useSgState } from './state'

export type { SupportedLang, Match } from './lang'
export { initializeParser, langLoadedKey } from './lang'
export { Mode } from './state'

type YAML = typeof import('js-yaml')

const yamlImport = import('js-yaml')

// NB: this hook cannot be async since it sets up `provide`
export function useAstGrep() {
  const {
    state,
    lang,
    ...refs
  } = useSgState()

  const langLoaded = useSetupParser(lang)

  let yaml = shallowRef<YAML | null>(null)
  yamlImport.then(yml => {
    yaml.value = yml
  })

  const matchedHighlights = shallowRef([] as Match[])
  const matchedEnvs = shallowRef([] as unknown[])
  const rewrittenCode = shallowRef(state.source)
  const ruleErrors = shallowRef<string>()

  function parseYAML(src: string) {
    return yaml.value!.loadAll(src) as any[]
  }

  function buildRules() {
    let json = []
    if (state.mode === Mode.Patch && state.query) {
      json = [{
        id: 'test-rule',
        language: lang.value,
        rule: {
          pattern: {
            context: state.query,
            strictness: state.rewrite || undefined,
            selector: state.selector || undefined,
          },
        },
        fix: state.rewrite || '',
      }]
    } else if (state.config) {
      const ruleStr = state.config // make sync access
      json = parseYAML(ruleStr)
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
    const [src, json] = [state.source, buildRules()]
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

  return {
    state,
    lang,
    matchedHighlights,
    matchedEnvs,
    rewrittenCode,
    ruleErrors,
    ...refs,
  }
}