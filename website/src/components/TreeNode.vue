<script setup lang="ts">
import { PropType, ref, toRefs, ComputedRef, computed} from 'vue'
import { DumpNode } from './dumpTree'

const props = defineProps({
  node: {
    type: Object as PropType<DumpNode>,
    required: true
  },
})

type DestructedNode = {
  [K in keyof DumpNode]: ComputedRef<DumpNode[K]>
}
function deepReactive(): DestructedNode {
  const keys = Object.keys(props.node)
  const entries = keys.map(k => [k, computed(() => props.node[k])])
  return Object.fromEntries(entries)
}

let expanded = ref(true)
let {
  field,
  kind,
  start,
  end,
  children,
} = deepReactive()
</script>

<template>
  <div class="tree-node">
    <p class="click-area" @click.stop="expanded = !expanded">
      <span
        v-if="children.length > 0"
        class="toggle-sign"
        :class="{expanded}"/>
      <span class="node-kind">{{ kind }}</span>
      <span class="node-field">{{ field }}</span>
      <span class="node-range">({{ start.row }}, {{start.column}})-({{ end.row }},{{ end.column }})</span>
    </p>
    <TreeNode :node="child" v-show="expanded" v-for="child in children"/>
  </div>
</template>

<style scoped>
.tree-node {
  margin: 0 0 0 1.5em;
  padding: 0 0 0 0.5em;
  border-left: 1px dashed #eee;
  user-select: none;
  --yellow:    #bf8803;
  --red:       #a31515;
  --blue:      #006ab1;
  --green:     #008000;
  --highlight: #fdf6e9;
}
.click-area {
  cursor: pointer;
}
.click-area:hover {
  background-color: var(--highlight);
}
.toggle-sign {
  background: white;
  margin-left: -1em;
  color: var(--green);
  display: inline-block;
}
.toggle-sign::before {
  content: '+';
}
.toggle-sign.expanded {
  color: var(--red);
}
.toggle-sign.expanded::before {
  content: '-';
}
.node-kind {
  color: var(--blue);
  padding-left: 0.6em;
  cursor: pointer;
}
.node-kind:hover {
  text-decoration: underline;
}
.node-field {
  padding: 0.4em;
  color: var(--yellow);
}
.node-field:empty {
  padding-left: 0;
}
.node-range {
  color: #999;
}
</style>
