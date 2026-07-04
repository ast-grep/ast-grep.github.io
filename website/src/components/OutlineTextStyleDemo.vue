<script setup lang="ts">
import { computed, ref } from 'vue'
import OutlineCodeBlock from './OutlineCodeBlock.vue'
import type { OutlineCodeRow, OutlineStyleRole } from './outlineCode'

const styles: Array<{
  id: OutlineStyleRole
  label: string
  parts: Array<{ text: string; class?: string }>
}> = [
  {
    id: 'symbol',
    label: 'Symbol type',
    parts: [
      { text: 'Signature lines color the symbol name by type, such as ' },
      { text: 'class', class: 'outline-style-demo__mark--class' },
      { text: ', ' },
      { text: 'import', class: 'outline-style-demo__mark--import' },
      { text: ', ' },
      { text: 'method', class: 'outline-style-demo__mark--method' },
      { text: ', or ' },
      { text: 'field', class: 'outline-style-demo__mark--field' },
      { text: '.' },
    ],
  },
  {
    id: 'exported',
    label: 'Exported',
    parts: [
      { text: 'Exported items use ' },
      { text: 'bold', class: 'outline-style-demo__mark--bold' },
      { text: ' symbol names.' },
    ],
  },
  {
    id: 'imported',
    label: 'Imported',
    parts: [
      { text: 'Imported items use ' },
      { text: 'italic', class: 'outline-style-demo__mark--italic' },
      { text: ' text when the item represents an import or dependency edge.' },
    ],
  },
  {
    id: 'private',
    label: 'Private',
    parts: [
      { text: 'Private members are ' },
      { text: 'dimmed', class: 'outline-style-demo__mark--dimmed' },
      { text: ' when local syntax marks them private.' },
    ],
  },
]

const lines: OutlineCodeRow[] = [
  {
    groups: [],
    path: true,
    parts: [{ text: './src/vs/workbench/contrib/chat/browser/widgetHosts/chatQuick.ts' }],
  },
  {
    line: '1',
    groups: ['imported', 'symbol'],
    parts: [
      { text: 'import ', kind: 'import', imported: true },
      { text: '{ Disposable }', kind: 'import', imported: true },
      { text: ' from "vs/base/common/lifecycle"' },
    ],
  },
  {
    line: '35',
    groups: ['exported', 'symbol'],
    parts: [
      { text: 'export class ' },
      { text: 'QuickChatService', kind: 'class', exported: true },
      { text: ' extends Disposable {' },
    ],
  },
  {
    line: '36',
    indent: true,
    groups: [],
    parts: [
      { text: 'readonly ' },
      { text: '_serviceBrand', kind: 'field' },
      { text: ': undefined' },
    ],
  },
  {
    line: '38',
    indent: true,
    groups: ['private'],
    parts: [
      { text: 'private readonly ' },
      { text: '_onDidClose', kind: 'field' },
      { text: ' = this._register(...)' },
    ],
  },
  {
    line: '39',
    indent: true,
    groups: [],
    parts: [
      { text: 'get ' },
      { text: 'onDidClose', kind: 'method' },
      { text: '() { ... }' },
    ],
  },
  {
    line: '70',
    indent: true,
    groups: [],
    parts: [
      { text: 'toggle', kind: 'method' },
      { text: '(options?: IQuickChatOpenOptions): void {' },
    ],
  },
  {
    line: '150',
    groups: ['symbol'],
    parts: [
      { text: 'class ' },
      { text: 'QuickChat', kind: 'class' },
      { text: ' extends Disposable {' },
    ],
  },
  {
    line: '152',
    indent: true,
    groups: [],
    parts: [
      { text: 'static ' },
      { text: 'DEFAULT_MIN_HEIGHT', kind: 'field' },
      { text: ' = 200' },
    ],
  },
  {
    line: '153',
    indent: true,
    groups: ['private'],
    parts: [
      { text: 'private static readonly ' },
      { text: 'DEFAULT_HEIGHT_OFFSET', kind: 'field' },
      { text: ' = 100' },
    ],
  },
]

const placeholder = 'Select a style to highlight it in the output.'

const active = ref<OutlineStyleRole | null>(null)

const activeStyle = computed(() => styles.find(style => style.id === active.value) ?? null)

function toggleStyle(style: OutlineStyleRole) {
  active.value = active.value === style ? null : style
}
</script>

<template>
  <div class="outline-style-demo">
    <OutlineCodeBlock
      label="Example ast-grep outline text output"
      min-width="760px"
      :rows="lines"
      :active-group="active ?? undefined"
    />

    <div class="outline-style-demo__controls" aria-label="Text output style controls">
      <button
        v-for="style in styles"
        :key="style.id"
        type="button"
        :class="{ 'outline-style-demo__button--active': style.id === active }"
        @click="toggleStyle(style.id)"
      >
        {{ style.label }}
      </button>
    </div>

    <div class="outline-style-demo__explanation">
      <Transition name="outline-style-demo__text" mode="out-in">
        <p v-if="activeStyle" :key="activeStyle.id">
          <span
            v-for="(part, partIndex) in activeStyle.parts"
            :key="partIndex"
            :class="part.class"
          >{{ part.text }}</span>
        </p>
        <p v-else key="placeholder">{{ placeholder }}</p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.outline-style-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.outline-style-demo__controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.outline-style-demo__controls button {
  min-height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font: inherit;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.outline-style-demo__controls button:hover,
.outline-style-demo__controls button:focus-visible {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-text-1);
}

.outline-style-demo__controls button:active {
  transform: translateY(1px);
}

.outline-style-demo__button--active {
  border-color: var(--vp-c-brand-3) !important;
  background: var(--vp-c-brand-soft) !important;
  color: var(--vp-c-text-1) !important;
  font-weight: 600 !important;
}

.outline-style-demo__explanation {
  max-width: 680px;
}

.outline-style-demo__explanation p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.outline-style-demo__text-enter-active,
.outline-style-demo__text-leave-active {
  transition: opacity 0.2s ease;
}

.outline-style-demo__text-enter-from,
.outline-style-demo__text-leave-to {
  opacity: 0;
}

.outline-style-demo__mark--bold {
  color: var(--vp-c-text-1);
  font-weight: 800;
}

.outline-style-demo__mark--italic {
  color: var(--vp-c-text-1);
  font-style: italic;
}

.outline-style-demo__mark--dimmed {
  color: var(--vp-c-text-3);
}

.outline-style-demo__mark--class {
  color: #8250df;
  font-weight: 650;
}

.outline-style-demo__mark--field {
  color: #9a6700;
  font-weight: 650;
}

.outline-style-demo__mark--import {
  color: #cf222e;
  font-weight: 650;
}

.outline-style-demo__mark--method {
  color: #1a7f37;
  font-weight: 650;
}

.dark .outline-style-demo__mark--class {
  color: #d2a8ff;
}

.dark .outline-style-demo__mark--field {
  color: #f2cc60;
}

.dark .outline-style-demo__mark--import {
  color: #ff7b72;
}

.dark .outline-style-demo__mark--method {
  color: #7ee787;
}

@media (max-width: 760px) {
  .outline-style-demo__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
