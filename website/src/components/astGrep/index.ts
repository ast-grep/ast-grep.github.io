import { shallowRef, watchEffect } from 'vue'
import { doFind, Match, useSetupParser } from './lang'
import { Mode, useSgState } from './state'

export type { SupportedLang } from './lang'
export { initializeParser, useSetupParser, langLoadedKey } from './lang'
export { Mode } from './state'

type YAML = typeof import('js-yaml')

const yamlImport = import('js-yaml')

// NB: this hook cannot be async since it sets up `provide`
export function useAstGrep() {

  const {
    state,
    source,
    query,
    rewrite,
    strictness,
    selector,
    config,
    mode,
    lang,
  } = useSgState()

  const langLoaded = useSetupParser(lang)

  let yaml = shallowRef<YAML | null>(null)
  yamlImport.then(yml => {
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

  return {
    state,
    source,
    query,
    rewrite,
    strictness,
    selector,
    config,
    mode,
    lang,
    matchedHighlights,
    matchedEnvs,
    rewrittenCode,
    ruleErrors,
  }
}