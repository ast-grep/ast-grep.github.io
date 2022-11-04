import {Tree, TreeCursor} from 'web-tree-sitter'
import type { InjectionKey } from 'vue'

export const highlightKey = Symbol.for('highlight-node') as InjectionKey<string>

interface Pos {
  row: number
  column: number
}

export interface DumpNode {
  field: string,
  kind: string,
  start: Pos,
  end: Pos,
  children: DumpNode[]
}

export function dumpTree(cursor: TreeCursor | null) {
  if (!cursor) {
    return []
  }
  return dumpOneNode(cursor, [])
}

function dumpOneNode(cursor: TreeCursor, target: DumpNode[]) {
    let displayName: string
    if (cursor.nodeIsMissing) {
      displayName = `MISSING ${cursor.nodeType}`
    } else if (cursor.nodeIsNamed) {
      displayName = cursor.nodeType
    }
    if (!displayName) {
      // anonymous node
      return target
    }
    const start = cursor.startPosition
    const end = cursor.endPosition
    let field = cursor.currentFieldName()
    let children: DumpNode[] = []
    if (cursor.gotoFirstChild()) {
      dumpNodes(cursor, children)
      cursor.gotoParent()
    }
    target.push({
      field,
      kind: displayName,
      start,
      end,
      children,
    })
    return target
}

function dumpNodes(cursor: TreeCursor, target: DumpNode[]) {
  do {
    dumpOneNode(cursor, target)
  } while (cursor.gotoNextSibling())
}
