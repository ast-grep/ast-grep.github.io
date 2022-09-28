<script setup>
import Share from '../icons/Share.vue'
import {activeTabs, serialize} from '../state'

const props = defineProps({
  state: Object,
})

async function onShare() {
  history.replaceState({}, '', '#' + serialize(props.state))
  await navigator.clipboard.writeText(location.href)
  alert('Sharable URL has been copied to clipboard!')
}

</script>

<template>
  <div class="toolbars">
    <Share title="Copy your code URL to share!" @click="onShare"/>
  </div>
</template>

<style scoped>
.toolbars {
  display: flex;
  flex-direction: row-reverse;
}
</style>
