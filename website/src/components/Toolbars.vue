<script setup>
import Share from '../icons/Share.vue'
import {serialize} from '../state'

const props = defineProps({
  state: Object,
})

async function onShare() {
  history.replaceState({}, '', '#' + serialize(props.state))
  await navigator.clipboard.writeText(location.href)
  alert('Sharable URL has been copied to clipboard!')
}

function select(mode) {
}

</script>

<template>
  <div class="toolbars">
    <button class="floating" title="Copy your code URL to share!" @click="onShare">
      <Share/>
    </button>
    <button class="switch" @click="select('code')">
      Code
    </button>
    <button class="switch" @click="select('code')">
      Search
    </button>
  </div>
</template>

<style scoped>
.toolbars {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 9999;
}
.floating {
  color: var(--vp-c-bg);
  background-color: var(--brand-color);
  padding: 13px;
  border-radius: 50%;
  box-shadow:
    rgba(0, 0, 0, 0.2) 0px 3px 5px -1px,
    rgba(0, 0, 0, 0.14) 0px 6px 10px 0px,
    rgba(0, 0, 0, 0.12) 0px 1px 18px 0px;
  cursor: pointer;
  transition: all 0.2s;
}
.floating:active {
  color: var(--vp-c-brand);
}
.switch {
  display: none;
}
@media only screen and (max-width: 780px) {
  .toolbars {
    display: flex;
    right: 0;
    background: var(--vp-c-bg);
    left: 0;
    bottom: 0;
    border-top: 1px solid var(--vp-c-divider-light);
  }
  .floating {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -20%);
    box-shadow: none;
  }
  .switch {
    flex: 1 0 auto;
    display: block;
    text-align: center;
    cursor: pointer;
    padding: 1rem;
    background: var(--vp-c-bg);
  }
}
</style>
