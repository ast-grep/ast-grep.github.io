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
  <h3>Rule List</h3>
  <br/>
  <TransitionGroup class="rule-list" tag="ul">
    <li v-for="rule in rules" :key="rule.language + rule.id" class="rule-item">
      <div class="rule-header">
        <a :href="rule.link" class="rule-name" target="_blank">{{ rule.name }}</a>
        <div class="rule-badges">
          <a :href="`/catalog/${rule.language}/`">
            <Badge type="info" :text="languages[rule.language]" />
          </a>
          <Badge v-if="rule.hasFix" type="tip" text="🛠️ Fix" />
        </div>
      </div>
      <div class="rule-details">
        <div class="rule-badges">
          <Badge v-if="rule.type === 'Pattern'" type="info" text="Simple Pattern" />
          <template v-else>
            📏
            <code class="used" v-for="r in rule.rules.slice(0, 2)">
              {{ r }}
            </code>
          </template>
        </div>
        <div class="rule-badges" v-if="rule.features.length > 0">
            💡
            <code class="used" v-for="feature in rule.features">
              {{ feature }}
            </code>
        </div>
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
  gap: 0.2em;
}

.rule-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-details > div {
  flex: 1;
}

.used {
  filter: saturate(0);
  user-select: none;
  height: 24px;
  line-height: 24px;
  padding-top: 0;
}

.playground-link {
  font-size: 0.8em;
  color: var(--vp-button-brand-bg);
  filter: brightness(1.1);
}
.playground-link:hover {
  color: var(--vp-button-brand-bg);
  filter: brightness(1.35);
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