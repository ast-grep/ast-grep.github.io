<script lang="ts" setup>
import { languageDisplayNames } from './astGrep/lang'
import IconDown from './utils/IconDown.vue'
import { versions } from '../../_data/parsers'
import { computed } from 'vue';

const lang = defineModel<string>({
  required: true,
})

const version = computed(() => {
  return versions[lang.value]
})
</script>

<template>
  <div class="selector">
    <span v-if="version" :title="`Parser version ${version}`">ⓘ </span>
    Language:
    <select v-model="lang">
      <option
        class="selector-option-text"
        v-for="val, key in languageDisplayNames"
        :value="key"
      >
        {{val}}
      </option>
    </select>
    <IconDown/>
  </div>
</template>

<style scoped>
.selector {
  text-align: left;
}
select {
  line-height: 1.5em;
  padding: 0.5em 0 0.5em 0.5em;
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  cursor: pointer;
}
.selector-option-text {
  color: var(--vp-custom-selector-option-text);
}
@media only screen and (max-width: 780px) {
  .selector {
    display: none;
  }
}
</style>