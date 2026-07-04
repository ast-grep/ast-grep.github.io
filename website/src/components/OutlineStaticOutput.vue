<script setup lang="ts">
import OutlineCodeBlock from './OutlineCodeBlock.vue'
import type { OutlineCodeRow } from './outlineCode'

type OutputVariant = 'file' | 'directory'

const props = defineProps<{
  variant: OutputVariant
}>()

const outputs: Record<OutputVariant, { label: string; rows: OutlineCodeRow[] }> = {
  file: {
    label: 'Example ast-grep outline file output',
    rows: [
      { path: true, parts: [{ text: 'src/parser.ts' }] },
      {
        line: '12',
        parts: [
          { text: 'export function ' },
          { text: 'parseRule', kind: 'function', exported: true },
          { text: '(source: string)' },
        ],
      },
      {
        line: '40',
        parts: [
          { text: 'export class ' },
          { text: 'Parser', kind: 'class', exported: true },
        ],
      },
      {
        member: true,
        parts: [
          { text: 'fields:', kind: 'field' },
          { text: ' source, diagnostics' },
        ],
      },
      {
        member: true,
        parts: [
          { text: 'methods:', kind: 'method' },
          { text: ' parse, recover, finish' },
        ],
      },
    ],
  },
  directory: {
    label: 'Example ast-grep outline directory output',
    rows: [
      { path: true, parts: [{ text: 'src/parser.ts' }] },
      {
        parts: [
          { text: 'function: ', kind: 'function' },
          { text: 'parseRule', exported: true },
        ],
      },
      {
        parts: [
          { text: 'class: ', kind: 'class' },
          { text: 'Parser', exported: true },
        ],
      },
      { path: true, parts: [{ text: 'src/rule.ts' }] },
      {
        parts: [
          { text: 'interface: ', kind: 'interface' },
          { text: 'Rule', exported: true },
        ],
      },
      {
        parts: [
          { text: 'function: ', kind: 'function' },
          { text: 'validateRule', exported: true },
        ],
      },
    ],
  },
}
</script>

<template>
  <OutlineCodeBlock
    class="outline-static-output"
    :label="outputs[props.variant].label"
    :rows="outputs[props.variant].rows"
  />
</template>

<style scoped>
.outline-static-output {
  margin: 16px 0;
}
</style>
