<script lang="ts" setup>
import { PropType, watch } from 'vue';
import Share from '../icons/Share.vue'
import { serialize, State, storeStateInLocalStorage } from '../state'
import { showToast } from './utils/Toast.vue'

const props = defineProps({
  state: {
    type: Object as PropType<State>,
    required: true,
  },
  active: String,
})

async function onShare() {
  history.replaceState({}, '', '#' + serialize(props.state))
  await navigator.clipboard.writeText(location.href)
  showToast('Sharable URL has been copied to clipboard!')
}

watch(() => props.state, state => {
  storeStateInLocalStorage(state)
}, { deep: true })

</script>

<template>
  <div class="toolbars">
    <button class="floating" title="Copy your code URL to share!" @click="onShare">
      <Share style="width: 24px; height: 24px;"/>
    </button>
    <button
      class="switch"
      :class="active === 'code' && 'active'"
      @click="$emit('changeActiveEditor', 'code')"
    >
      Code
    </button>
    <button
      class="switch"
      :class="active === 'search' && 'active'"
      @click="$emit('changeActiveEditor', 'search')"
    >
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

@media only screen and (min-width: 780px) {
  [title] {
    position: relative;
  }

  [title]:after {
    content: attr(title);
    position: absolute;
    left: -10%;
    bottom: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.25em 0.5em;
    font-size: 10px;
    width: max-content;
    opacity: 0;
    transform: translate(-100%, 50%);
    transition: 0.2s;
    border-radius: 5px;
  }

  [title]:hover:after {
    opacity: 1;
  }
}
.switch {
  display: none;
  border-radius: 5px 5px 0px 0px;
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
    transform: translate(-60%, 0%);
    box-shadow: none;
  }
  .switch {
    flex: 1 0 auto;
    display: block;
    text-align: center;
    cursor: pointer;
    padding: 0.8rem;
    background: var(--vp-c-bg);
  }
  .switch.active {
    color: var(--vp-c-brand);
  }
  .switch.active:hover {
    border-color: var(--vp-c-brand);
  }
}
</style>