<script lang="ts">
let instance: any
export function showToast(txt: string) {
  if (instance) {
    instance.show(txt)
  }
}
</script>
<script setup lang="ts">
import { ref, watch, getCurrentInstance } from 'vue'
let shown = ref(false)
let text = ref('')
instance = getCurrentInstance()
instance.show = function show(val: string) {
  text.value = val
}
let timer: number
watch(text, (newVal) => {
  if (newVal) {
    shown.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      shown.value = false
      text.value = ''
    }, 2000)
  }
})
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