<script lang="ts">
import { ref } from 'vue'

// Global reactive state for toast
const shown = ref(false)
const text = ref('')
let timer: number

export function showToast(txt: string) {
  text.value = txt
  shown.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    shown.value = false
    text.value = ''
  }, 2000)
}

export function useToast() {
  return { shown, text }
}
</script>
<script setup lang="ts">
// Use the global toast state
const { shown, text } = useToast()
</script>

<template>
  <transition>
    <div class="toast" v-if="shown">
      {{text}}
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  right: 50%;
  top: 1em;
  font-size: 1em;
  color: white;
  padding: 0.75em 1em;
  background: #0009;
  z-index: 9999;
  border-radius: 4px;
  backdrop-filter: blur(3px);
  transform: translate(50%, 0%);
  box-shadow:  0 10px 38px rgba(0,0,0,0.30), 0 5px 12px rgba(0,0,0,0.22);
}
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translate(50%, -10%);
}
</style>