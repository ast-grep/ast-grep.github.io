<script setup lang="ts">
import { shallowRef } from 'vue'
let isCollapsed = shallowRef(true)
defineProps({
  panelTitle: String,
})
const emits = defineEmits<{
  (e: 'enterPanel'): void,
  (e: 'leavePanel'): void,
}>()

</script>

<template>
  <div class="editor-panel-container">
    <div class="editor-area">
      <slot name="editor"/>
    </div>
    <div class="panel-area" :class="!isCollapsed && 'collapsed'"
      @mouseenter="emits('enterPanel')" @mouseleave="emits('leavePanel')">
      <p @click.self="isCollapsed = !isCollapsed">
        <slot name="panelAccessory"/>
        <span class="chevron">›</span>
        {{panelTitle}}
      </p>
      <div class="scrollable">
        <slot name="panel"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-area {
  flex: 60% 6 0;
}

.panel-area {
  display: flex;
  flex-direction: column;
  flex: 40% 4 0;
  overflow: auto;
  font-size: 12px;
  line-height: 2;
  white-space: pre;
  padding: 1em;
  padding-top: 0;
  z-index: 1; /* prevent being covered by monaco */
  border-top: 1px solid #f5f5f5;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
  transition: flex 0.2s;
}
.panel-area.collapsed {
  flex: 2em 0 0;
  overflow: hidden;
}
.panel-area p {
  text-align: right;
  background: linear-gradient(to bottom, #fff, #fff7);
  z-index: 0;
  cursor: pointer;
}
.chevron {
  display: inline-block;
  transform: rotate(90deg);
  transition: transform 0.2s;
}
.collapsed .chevron {
  transform: rotate(0);
}
.dumped.collapsed > .scrollable {
  display: none;
}
.scrollable {
  flex: 1 1 100%;
  padding-top: 1em;
  margin-top: -1em;
  overflow-y: auto;
}
</style>
