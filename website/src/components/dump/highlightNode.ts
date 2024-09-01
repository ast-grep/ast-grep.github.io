import { ref, computed, inject, watchEffect } from 'vue'
import { highlightKey, Pos, GeneralNode } from './dumpTree'


interface Props {
  node: GeneralNode
  cursorPosition: Pos | null
}

export function useHighlightNode(props: Props) {
  const highlightContext = inject(highlightKey)
  let expanded = ref(true)

  function highlightNode() {
    const { start, end } = props.node
    highlightContext?.([
      start.row,
      start.column,
      end.row,
      end.column,
    ])
  }

  function withinPos({start, end}: GeneralNode, pos: Pos | null) {
    if (!pos) {
      return false
    }
    const { row, column } = pos
    let withinStart = (start.row < row) || (start.row === row && start.column <= column)
    let withinEnd = (end.row > row) || (end.row === row && end.column >= column)
    return withinStart && withinEnd
  }

  let isWithin = computed(() => {
    const {cursorPosition} = props
    if (!cursorPosition) {
      return false
    }
    return withinPos(props.node, cursorPosition)
  })
  let isTarget = computed(() => {
    if (!isWithin.value) {
      return false
    }
    const {node, cursorPosition} = props
    const isTarget =
      !expanded.value || // children not expanded, current target is the target
      !node.children.some(n => withinPos(n, cursorPosition)) // no children within node
    return isTarget
  })

  let nodeRef = ref<HTMLElement | null>(null)
  watchEffect(() => {
    if (isTarget.value) {
      nodeRef.value?.scrollIntoView({
        block: 'center',
      })
    }
  })

  return {
    isTarget,
    isWithin,
    highlightNode,
    expanded,
    nodeRef,
  }
}