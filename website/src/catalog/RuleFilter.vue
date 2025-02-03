<script setup lang="ts">
import { reactive } from 'vue'
import {
  languages,
  ruleFilters,
  features,
  ruleTypes,
} from './data'

const filter = reactive({
  selectedLanguages: [] as string[],
  selectedRuleFilters: [] as string[],
  selectedFeatures: [] as string[],
  selectedTypes: [] as string[],
  sortBy: 'name',
})

</script>
<template>
  <form class="filters">
    <details>
      <summary>Language Filters</summary>
      <div class="checkbox-group">
        <label v-for="lang in languages" :key="lang">
          <input type="checkbox" v-model="filter.selectedLanguages" :value="lang">
          <code class="option">{{ lang }}</code>
        </label>
      </div>
    </details>

    <details class="filter-group">
      <summary>Rule Filters</summary>
      <div class="rule-group">
        <div v-for="rules, type in ruleFilters">
          <em style="text-transform: capitalize;">{{ type }}</em>
          <div class="checkbox-group">
            <label v-for="rule in rules" :key="rule">
              <input type="checkbox" v-model="filter.selectedRuleFilters" :value="rule">
              <code class="option">{{ rule }}</code>
            </label>
          </div>
        </div>
      </div>
    </details>

    <details class="filter-group">
      <summary>More Filters</summary>
      <div class="rule-group">
        <div>
          <em>Type</em>
          <div class="checkbox-group">
            <label v-for="type in ruleTypes" :key="type">
              <input type="checkbox" v-model="filter.selectedTypes" :value="type">
              <code class="option">{{ type }}</code>
            </label>
          </div>
        </div>
        <div>
          <em>Features</em>
          <div class="checkbox-group">
            <label v-for="feature in features" :key="feature">
              <input type="checkbox" v-model="filter.selectedFeatures" :value="feature">
              <code class="option">{{ feature }}</code>
            </label>
          </div>
        </div>
        <div>
          <em>Sort By</em>
          <div>
            <label>
              <input value="name" type="radio" v-model="filter.sortBy"/>
              Name
            </label>
            <label>
              <input value="complexity" type="radio" v-model="filter.sortBy"/>
              Complexity
            </label>
          </div>
        </div>
      </div>
    </details>
  </form>
</template>

<style scoped>
.rule-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(20%, 1fr));
  margin-top: -2px;
}

.checkbox-group {
  margin-top: 0.2em;
  display: flex;
  gap: 5px;
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

code.option {
  cursor: pointer;
  filter: saturate(0);
  opacity: 0.8;
  user-select: none;
  border: 1px solid var(--vp-code-bg);
  min-width: 3em;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  text-align: center;
  padding-top: 0;
}

input[type="checkbox"]:checked + code.option {
  filter: saturate(1);
  opacity: 1;
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