import type { InjectionKey, Ref } from 'vue'

interface HighlightContext {
  (range: number[]): void
}

export const langLoadedKey = Symbol.for('lang-loaded') as InjectionKey<Ref<boolean>>
export const highlightKey = Symbol.for('highlight-node') as InjectionKey<HighlightContext>

export interface Pos {
  row: number
  column: number
}

export interface GeneralNode {
  start: Pos
  end: Pos
  children: this[]
}

/** stub wasm DumpNode */
export interface DumpNode extends GeneralNode {
  field: string | undefined
  kind: string
  isNamed: boolean
}

/** stub wasm PatternTree */
export interface PatternTree extends GeneralNode {
  kind: string
  isNamed: boolean
  text: string | undefined
  pattern?: 'metaVar' | 'terminal' | 'internal'
}