<script lang="ts">
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

export function renderTree(cursor: TreeCursor | null) {
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
  let indentLevel = 0

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
        indentLevel--
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
        indentLevel++
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
</script>

<script setup lang="ts">
import {computed, PropType, h} from 'vue'
const props = defineProps({
  tree: Object as PropType<Tree>,
})
const root = computed(() => {
  const cursor = props.tree?.walk()
  const rendered = renderTree(cursor)[0]?.children[0]
  console.log(rendered)
  cursor?.delete()
  return rendered
})

interface TreeNodeProps {
  node: DumpNode,
  level?: number
}

function TreeNode({node, level = 0}: TreeNodeProps) {
  if (!node) {
    return null
  }
  const {
    field,
    kind,
    start,
    end,
    children,
  } = node
  console.log(children)
  return h('div', {className: 'tree-node'}, [
    h('span', {style: 'color: #10aabb; margin-left: -1em; padding-left: 0.6em; background: white; display: inline-block'}, kind),
    ' ',
    h('span', {}, field),
    ' ',
    h('span', {style: 'color: #999'}, `(${start.row},${start.column})-(${end.row},${end.column})`),
    ...children.map(n => TreeNode({node: n, level: level + 1})),
  ])
}
</script>

<template>
  <TreeNode class="pre" :node="root"/>
</template>

<style>
.pre {
  font-family: monospace;
  margin-left: 2em;
  line-height: 1.5em;
}
.tree-node {
  margin: 0 1.5em 0;
  padding: 0 0 0 0.5em;
  border-left: 1px dashed #eee;
}
</style>
