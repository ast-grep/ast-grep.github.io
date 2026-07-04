<script setup lang="ts">
import type { OutlineCodePart, OutlineCodeRow } from './outlineCode'

defineProps<{
  row: OutlineCodeRow
  active?: boolean
}>()

function partClasses(part: OutlineCodePart) {
  return [
    part.kind ? `outline-code-token--${part.kind}` : '',
    {
      'outline-code-token--exported': part.exported,
      'outline-code-token--imported': part.imported,
    },
  ]
}
</script>

<template>
  <span
    class="outline-code-line"
    :class="{
      'outline-code-line--active': active,
      'outline-code-line--dim': row.groups?.includes('private'),
      'outline-code-line--member': row.member || (row.indent && !row.line),
      'outline-code-line--path': row.path,
    }"
  >
    <span v-if="row.line" class="outline-code-line__number">{{ row.line }}:</span><span
      v-if="row.line && row.indent"
      class="outline-code-line__indent"
    >  </span><span
      v-for="(part, partIndex) in row.parts"
      :key="partIndex"
      class="outline-code-token"
      :class="partClasses(part)"
    >{{ part.text }}</span>
  </span>
</template>

<style scoped>
.outline-code-line {
  display: block;
  padding: 0 16px;
  min-height: 1.55em;
  color: var(--outline-code-text);
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease;
}

.outline-code-line--active {
  background: var(--outline-code-active-bg);
  box-shadow: inset 3px 0 0 var(--outline-code-active-bar);
}

.outline-code-line--dim {
  opacity: 0.44;
}

.outline-code-line--dim.outline-code-line--active {
  opacity: 0.72;
}

.outline-code-line--member {
  padding-left: calc(16px + 4ch);
}

.outline-code-line--path {
  color: var(--outline-code-path);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--outline-code-muted);
  text-underline-offset: 3px;
}

.outline-code-line__number {
  display: inline-block;
  width: 4ch;
  color: var(--outline-code-muted);
}

.outline-code-token {
  display: inline;
}

.outline-code-token--class,
.outline-code-token--field,
.outline-code-token--function,
.outline-code-token--import,
.outline-code-token--interface,
.outline-code-token--method {
  font-weight: 650;
}

.outline-code-token--class {
  color: var(--outline-code-class);
}

.outline-code-token--field {
  color: var(--outline-code-field);
}

.outline-code-token--function,
.outline-code-token--method {
  color: var(--outline-code-callable);
}

.outline-code-token--import {
  color: var(--outline-code-import);
}

.outline-code-token--interface {
  color: var(--outline-code-type);
}

.outline-code-token--exported {
  font-weight: 800;
}

.outline-code-token--imported {
  font-style: italic;
}
</style>
