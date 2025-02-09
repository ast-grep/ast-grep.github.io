<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import Option from './Option.vue'
import {
  languages,
  ruleFilters,
  features,
  ruleTypes,
  type Filter,
} from './data'

const model = defineModel<Filter>()

const filter = ref<Filter>({
  selectedLanguages: [],
  selectedRuleFilters: [],
  selectedFeatures: [],
  selectedTypes: [],
})

watchEffect(() => {
  model.value = filter.value
})

</script>
<template>
  <form class="filters">
    <details open>
      <summary>📚Example Language</summary>
      <div class="checkbox-group">
        <label v-for="displayName, lang in languages" :key="lang">
          <input type="checkbox" v-model="filter.selectedLanguages" :value="lang">
          <Option :text="displayName" class="filter-option"/>
        </label>
      </div>
    </details>

    <details class="filter-group">
      <summary>📏Used Rule</summary>
      <div class="rule-group">
        <div v-for="rules, type in ruleFilters">
          <em style="text-transform: capitalize;">{{ type }}</em>
          <div class="checkbox-group">
            <label v-for="rule in rules" :key="rule">
              <input type="checkbox" v-model="filter.selectedRuleFilters" :value="rule">
              <Option :text="rule" class="filter-option"/>
            </label>
          </div>
        </div>
      </div>
    </details>

    <details class="filter-group">
      <summary>💡More Features</summary>
      <div class="rule-group">
        <div>
          <em>Type</em>
          <div class="checkbox-group">
            <label v-for="type in ruleTypes" :key="type">
              <input type="checkbox" v-model="filter.selectedTypes" :value="type">
              <Option :text="type" class="filter-option"/>
            </label>
          </div>
        </div>
        <div>
          <em>Features</em>
          <div class="checkbox-group">
            <label v-for="feature in features" :key="feature">
              <input type="checkbox" v-model="filter.selectedFeatures" :value="feature">
              <Option :text="feature" class="filter-option"/>
            </label>
          </div>
        </div>
      </div>
    </details>
  </form>
</template>

<style scoped>
.rule-group {
  display: flex;
  margin-top: -2px;
  gap: 8px;
}

.checkbox-group {
  margin-top: 0.2em;
  display: flex;
  gap: 4px;
}

label {
  display: inline-block;
}
details {
  padding-bottom: 5px;
  border-radius: 5px;
}
summary {
  margin: 0;
  padding: 12px 0 6px;
  line-height: 24px;
  font-size: 18px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}
summary:hover {
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
input[type="checkbox"] {
  display: none;
}

.filter-option {
  cursor: pointer;
  opacity: 0.8;
  min-width: 3em;
}
.filter-option:hover {
  color: var(--vp-c-brand-1);
  opacity: 1;
}

input[type="checkbox"]:checked + code.option {
  opacity: 1;
  border-color: var(--vp-c-text-3);
}
input[type="checkbox"]:checked + code.option:hover {
  border-color: currentColor;
}

@keyframes details-show {
  from {
    opacity:0;
    transform: translateY(-0.5em);
  }
}
details[open] > *:not(summary) {
  animation: details-show 0.2s ease-in-out;
}
</style>