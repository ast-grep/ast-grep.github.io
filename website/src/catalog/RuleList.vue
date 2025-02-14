<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
// @ts-ignore missing type
import { continuous } from '@number-flow/vue'
import { type Filter, getRuleMetaData } from './data.js'
import { computed, ref, type PropType } from 'vue'
import RuleItem from './RuleItem.vue'
import IconDown from '../components/utils/IconDown.vue'

const sortBy = ref('name')
const props = defineProps({
  filter: {
    type: Object as PropType<Filter>,
    required: true,
  }
})
const emit = defineEmits<{
  reset: []
}>()

const ruleMetaData = computed(() => getRuleMetaData(props.filter, sortBy.value))
</script>

<template>
  <div class="rule-list-container">
    <h3>
      Rule List
      <NumberFlow
        prefix="("
        suffix=")"
        :plugins="[continuous]"
        :value="ruleMetaData.length"
      />
      <label class="sort-by">
        Sort by:
        <select v-model="sortBy">
          <option value="name">Name</option>
          <option value="lang">Lang</option>
          <option value="complexity">Complexity</option>
        </select>
        <IconDown/>
      </label>
    </h3>
    <TransitionGroup class="rule-list" tag="ul">
      <RuleItem
        v-for="meta in ruleMetaData"
        :key="meta.language + meta.id"
        :meta="meta"
        :filter="filter"
      />
    </TransitionGroup>
    <Transition name="not-found">
      <div class="no-rule" v-if="ruleMetaData.length === 0">
        <p class="title">No Matching Rule</p>
        <hr class="divider"/>
        <div class="actions">
          You can <a href="" @click="emit('reset')">reset the filter</a> to discover all rules.<br/>
          Contributing a new rule is also warmly welcomed. 🎉
          <ol>
            <li>
              Read the
              <a href="/reference/rule.html" target="_blank">rule</a> and
              <a href="/reference/yaml.html" target="_blank">YAML</a> doc.</li>
            <li>Write your own rule in the
              <a href="/playground.html" target="_blank">
                playground
              </a>.
            </li>
            <li>
              Add a new example in the ast-grep
                <a href="https://github.com/ast-grep/ast-grep.github.io/tree/main/website/catalog" target="_blank">
                  website repo
                </a>.
            </li>
          </ol>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rule-list-container {
  position: relative;
  min-height: 280px;
}
h3 {
  margin: 20px 0 8px;
}
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.no-rule {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}
.actions {
  margin: 0 auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

h3 {
  display: flex;
}
.sort-by {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  font-size: 14px;
  font-weight: 400;
}
.sort-by > select {
  margin-left: 6px;
  padding-right: 4px;
}

.not-found-enter-active,
.not-found-leave-active {
  transition: all 0.4s cubic-bezier(0.59, 0.12, 0.34, 0.95);
}
.not-found-enter-from,
.not-found-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.not-found-leave-active {
  position: absolute;
  /* this is somehow hard coded*/
  top: 38px;
}

.v-move,
.v-enter-active,
.v-leave-active {
  transition: all 0.4s cubic-bezier(0.59, 0.12, 0.34, 0.95);
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center top;
}
.v-leave-active {
  position: absolute;
  width: 100%;
}
number-flow-vue::part(integer) {
  font-variant-numeric: tabular-nums;
}
</style>