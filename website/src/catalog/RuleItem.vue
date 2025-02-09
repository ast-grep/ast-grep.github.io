<script setup lang="ts">
import { type RuleMeta, languages } from './data'
import { type PropType, computed } from 'vue'

const { meta } = defineProps({
  meta: {
    type: Object as PropType<RuleMeta>,
    required: true,
  }
})
const displayRuleCount = computed(() => {
  const maxRule = meta.features.length > 0 ? 2 : 5
  return Math.min(meta.rules.length, maxRule)
})
const displayedRules = computed(() => meta.rules.slice(0, displayRuleCount.value))
const moreRules = computed(() => meta.rules.length - displayRuleCount.value)
const moreFeatures = computed(() => Math.max(meta.features.length - 2, 0))
</script>

<template>
  <li class="rule-item">
    <div class="rule-header">
      <a :href="meta.link" class="rule-name" target="_blank">{{ meta.name }}</a>
      <div class="rule-badges">
        <a :href="`/catalog/${meta.language}/`">
          <Badge type="info" :text="languages[meta.language]" />
        </a>
        <Badge v-if="meta.hasFix" type="tip" text="🛠️ Fix" />
      </div>
    </div>
    <div class="rule-details">
      <div class="rule-badges">
        <Badge v-if="meta.type === 'Pattern'" type="info" text="Simple Pattern Example" />
        <template v-else>
          📏<span class="emoji-offset"/>
          <code class="used" v-for="rule in displayedRules">
            {{ rule }}
          </code>
          <code class="used" v-if="moreRules">
            +{{ moreRules }}
          </code>
        </template>
      </div>
      <div class="rule-badges" v-if="meta.features.length > 0">
          💡
          <code class="used" v-for="feature in meta.features">
            {{ feature }}
          </code>
          <code class="used" v-if="moreFeatures">
            +{{ moreFeatures }}
          </code>
      </div>
      <a :href="meta.playgroundLink" class="playground-link" target="_blank">
        Try in Playground →
      </a>
    </div>
  </li>
</template>

<style scoped>
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
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
  gap: 4px;
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
.emoji-offset {
  /* Offset emoji visual spacing */
  margin-right: -2px;
}
</style>