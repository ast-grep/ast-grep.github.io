<script setup lang="ts">
import { type Filter, getRules, languages } from './data'
import { computed, type PropType } from 'vue'
import { } from 'vitepress'

const props = defineProps({
  filter: {
    type: Object as PropType<Filter>,
    required: true,
  }
})

const rules = computed(() => getRules(props.filter))
</script>

<template>
  <h2>
    Rule List
  </h2>
  <TransitionGroup class="rule-list" tag="ul">
    <li v-for="rule in rules" :key="rule.language + rule.id" class="rule-item">
      <div class="rule-header">
        <a :href="rule.link" class="rule-name">{{ rule.name }}</a>
        <div class="rule-badges">
          <Badge type="info" :text="rule.type" />
          <a :href="`/catalog/${rule.language}/`">
            <Badge type="info" :text="languages[rule.language]" />
          </a>
        </div>
      </div>
      <div class="rule-details">
        <Badge v-if="rule.hasFix" type="tip" text="🛠️ Has Fix" />
        <div v-else/>
        <!--
        <div class="features">
          <span v-for="feature in rule.features" :key="feature" class="feature-tag">
            {{ feature }}
          </span>
        </div>
        -->
        <a :href="rule.playgroundLink" class="playground-link" target="_blank">
          Try in Playground →
        </a>
      </div>
    </li>
  </TransitionGroup>
</template>

<style scoped>
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rule-name {
  font-weight: 600;
}

.rule-badges {
  display: flex;
  align-items: center;
  gap: 0.2em;
}

.rule-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.playground-link {
  font-size: 0.8em;
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