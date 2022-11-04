import {Tree, TreeCursor} from 'web-tree-sitter'

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

  let node: DumpNode = {
    field: '',
    kind: '',
    start: {row: 0, column: 0},
    end: {row: 0, column: 0},
    children: [],
  }
  let parents = [node]
  let finishedRow = false
  let visitedChildren = false

  for (let i = 0;; i++) {
    let displayName: string
    if (cursor.nodeIsMissing) {
      displayName = `MISSING ${cursor.nodeType}`
    } else if (cursor.nodeIsNamed) {
      displayName = cursor.nodeType
    }

    if (visitedChildren) {
      if (displayName) {
        finishedRow = true
      }

      if (cursor.gotoNextSibling()) {
        visitedChildren = false
      } else if (cursor.gotoParent()) {
        visitedChildren = true
        const current = parents.pop()
        parents[parents.length - 1].children.push(current)
      } else {
        break
      }
    } else {
      if (displayName) {
        if (finishedRow) {
          parents[parent.length - 1].children.push(node)
          finishedRow = false
        }
        const start = cursor.startPosition
        const end = cursor.endPosition
        let field = cursor.currentFieldName()
        node = {
          field,
          kind: displayName,
          start,
          end,
          children: []
        }
        finishedRow = true
      }

      if (cursor.gotoFirstChild()) {
        visitedChildren = false
        parents.push(node)
      } else {
        visitedChildren = true
      }
    }
  }
  if (finishedRow) {
    parents[parents.length - 1].children.push(node)
  }
  return parents
}
