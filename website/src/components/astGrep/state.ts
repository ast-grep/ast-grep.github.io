import type { SupportedLang } from "./lang"
import { shallowReactive, toRefs, watch, provide } from 'vue'
import type { InjectionKey, ToRefs, ShallowReactive } from 'vue'

import source from './template/source?raw'
import config from './template/config.yaml?raw'

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

// prefer old unicode hacks for backward compatibility
// https://base64.guru/developers/javascript/examples/unicode-strings
function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(data)))
}

function atou(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

export function serialize(state: State): string {
  return utoa(JSON.stringify(state))
}

export function deserialize(str: string): State {
  return JSON.parse(atou(str))
}

const defaultState = {
  mode: Mode.Patch,
  lang: 'javascript' as const,
  query: 'console.log($MATCH)',
  rewrite: 'logger.log($MATCH)',
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

export const astGrepStateKey = Symbol.for('ast-grep-state') as InjectionKey<ToRefs<ShallowReactive<State>>>

export function useSgState() {
  const state = shallowReactive(restoreState())
  const refs = toRefs(state)
  provide(astGrepStateKey, refs)
  watch(() => state, state => {
    storeStateInLocalStorage(state)
  }, { deep: true })
  return {
    state,
    ...refs,
  }
}
