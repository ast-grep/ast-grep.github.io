import type { SupportedLang } from "./lang"
import { shallowReactive, toRefs, watch, provide } from 'vue'
import type { InjectionKey, ToRefs, ShallowReactive } from 'vue'
import { utoa, atou } from '../../utils'

export enum Mode {
  Patch = 'Patch',
  Config = 'Config',
}

export type State = {
  mode: Mode,
  query: string,
  rewrite: string,
  config: string,
  source: string,
  strictness: string,
  selector: string,
  lang: SupportedLang,
}

export function serialize(state: State): string {
  return utoa(JSON.stringify(state))
}

export function deserialize(str: string): State {
  return JSON.parse(atou(str))
}

const source =
`// console.log() will be matched by pattern!
// click diff tab to see rewrite.

function tryAstGrep() {
  console.log('matched in metavar!')
}

const multiLineExpression =
  console
   .log('Also matched!')

if (true) {
  const notThis = 'console.log("not me")'
} else {
  console.debug('matched by YAML')
}`

const query = 'console.log($MATCH)'
const rewrite = 'logger.log($MATCH)'
const config = `
# YAML Rule is more powerful!
# https://ast-grep.github.io/guide/rule-config.html#rule
rule:
  any:
    - pattern: console.log($A)
    - pattern: console.debug($A)
fix:
  logger.log($A)
`.trim()

const defaultState = {
  mode: Mode.Patch,
  lang: 'javascript' as const,
  query,
  rewrite,
  strictness: 'smart',
  selector: '',
  config,
  source,
}

function restoreState(): State {
  try {
    if (location.hash.length > 1) {
      return {
        ...defaultState,
        ...deserialize(location.hash.slice(1)),
      }
    }
    const stateStr = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stateStr) {
      return {
        ...defaultState,
        ...JSON.parse(stateStr),
      }
    }
    return defaultState
  } catch {
    return defaultState
  }
}
const LOCAL_STORAGE_KEY = 'ast-grep-playground-state'

function storeStateInLocalStorage(state: State) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // pass
  }
}

function resetState(state: ShallowReactive<State>) {
  state.mode = Mode.Patch
  state.query = query
  state.rewrite = rewrite
  state.config = config
  state.source = source
  state.strictness = 'smart'
  state.selector = ''
  state.lang = 'javascript'
}

export const astGrepStateKey = Symbol.for('ast-grep-state') as InjectionKey<ToRefs<ShallowReactive<State>>>

export function useSgState() {
  const state = shallowReactive(restoreState())
  const refs = toRefs(state)
  provide(astGrepStateKey, refs)
  watch(() => state, state => {
    storeStateInLocalStorage(state)
    history.replaceState({}, '', '#' + serialize(state))
  }, { deep: true })
  return {
    state,
    reset: () => resetState(state),
    ...refs,
  }
}