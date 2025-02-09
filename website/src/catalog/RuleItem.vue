<script setup lang="ts">
import { type RuleMeta, type Filter, languages } from './data'
import { type PropType, computed } from 'vue'

const { meta } = defineProps({
  meta: {
    type: Object as PropType<RuleMeta>,
    required: true,
  },
  filter: {
    type: Object as PropType<Filter>,
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
        <a :href="`/catalog/${meta.language}/`" target="_blank">
          <Badge type="info" :class="filter.selectedLanguages.length && 'highlight-filter'">
            {{ languages[meta.language] }}
          </Badge>
        </a>
        <Badge v-if="meta.hasFix" type="tip">
          <span class="override-badge-text-color">🛠️ Fix</span>
        </Badge>
      </div>
    </div>
    <div class="rule-details">
      <div class="rule-badges">
        <Badge v-if="meta.type === 'Pattern'" type="info" text="Simple Pattern Example" />
        <template v-else>
          📏<span class="emoji-offset"/>
          <code class="used" v-for="rule in displayedRules" :class="filter.selectedRuleFilters.includes(rule) && 'highlight-filter'">
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
      <a :href="meta.playgroundLink" class="link playground" target="_blank">
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
.override-badge-text-color {
  color: var(--vp-c-text-2);
}
.override-badge-text-color:hover {
  color: var(--vp-c-text-2);
}

.link {
  filter: brightness(1.3);
  color: var(--vp-button-brand-bg);
}
.link:hover {
  color: var(--vp-button-brand-bg);
  filter: brightness(1.5);
}
.rule-name {
  font-weight: 600;
}
.playground {
  font-size: 0.8em;
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
  color: var(--vp-c-text-2);
  user-select: none;
  height: 24px;
  line-height: 24px;
  padding-top: 0;
}
.emoji-offset {
  /* Offset emoji visual spacing */
  margin-right: -2px;
}
/* hack vpbage's border transition */
.VPBadge {
  transition-property: all;
  transition-duration: 0.25s;
}
.highlight-filter {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.highlight-filter:hover {
  color: var(--vp-c-brand-1);
}
</style>