export type OutlineTokenKind =
  | 'class'
  | 'field'
  | 'function'
  | 'import'
  | 'interface'
  | 'method'

export type OutlineStyleRole = 'symbol' | 'exported' | 'imported' | 'private'

export type OutlineCodePart = {
  text: string
  kind?: OutlineTokenKind
  exported?: boolean
  imported?: boolean
}

export type OutlineCodeRow = {
  line?: string
  path?: boolean
  indent?: boolean
  member?: boolean
  groups?: OutlineStyleRole[]
  parts: OutlineCodePart[]
}
