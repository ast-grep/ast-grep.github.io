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

/** stub wasm DumpNode */
export interface DumpNode {
  field: string | undefined
  kind: string
  start: Pos
  end: Pos
  isNamed: boolean
  children: DumpNode[]
}

/** stub wasm DumpPattern */
export interface DumpPattern {
  kind: string | undefined
  metaVar: string | undefined
  start: Pos
  end: Pos
  isNamed: boolean
  children: DumpPattern[]
}