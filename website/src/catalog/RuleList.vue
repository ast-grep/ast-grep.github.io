<script setup lang="ts">
import { type Filter, getRuleMetaData } from './data'
import { computed, type PropType } from 'vue'
import RuleItem from './RuleItem.vue'

const props = defineProps({
  filter: {
    type: Object as PropType<Filter>,
    required: true,
  }
})

const ruleMetaData = computed(() => getRuleMetaData(props.filter))
</script>

<template>
  <h3>Rule List</h3>
  <br/>
  <TransitionGroup class="rule-list" tag="ul">
    <RuleItem
      v-for="meta in ruleMetaData"
      :key="meta.language + meta.id"
      :meta="meta"
      :filter="filter"
    />
  </TransitionGroup>
</template>

<style scoped>
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
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
</style>