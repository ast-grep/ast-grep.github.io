<script setup lang="ts">
import { type PropType, computed } from 'vue'

import { type RuleMeta, type Filter, languages } from './data'
import Option from './Option.vue'

const { meta, filter } = defineProps({
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
const displayedRules = computed(() => {
  // display selected rules first
  const result = []
  const notSelected = []
  for (const rule of meta.rules) {
    if (filter.selectedRuleFilters.includes(rule)) {
      result.push(rule)
    } else {
      notSelected.push(rule)
    }
  }
  return result.concat(notSelected).slice(0, displayRuleCount.value)
})
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
            📚 {{ languages[meta.language] }}
          </Badge>
        </a>
        <Badge v-if="meta.hasFix" type="tip">
          <span class="override-badge-text-color">🛠️ Fix</span>
        </Badge>
      </div>
    </div>
    <div class="rule-details">
      <div class="rule-badges" >
        <Badge v-if="meta.type === 'Pattern'" type="info" text="Simple Pattern Example" />
        <template v-else>
          <span title="Used Rules">📏</span>
          <span class="emoji-offset"/>
          <Option
            v-for="rule in displayedRules"
            :key="rule"
            :text="rule"
            :highlight="filter.selectedRuleFilters.includes(rule)"
          />
          <Option
            v-if="moreRules"
            :text="`+${moreRules}`"
            :data-title="meta.rules.slice(displayRuleCount).join(', ')"
          />
        </template>
      </div>
      <div class="rule-badges" v-if="meta.features.length > 0">
          <span title="Used Features">💡</span>
          <Option
            v-for="feature in meta.features"
            :key="feature"
            :text="feature"
            :highlight="filter.selectedFeatures.includes(feature)"
          />
          <Option
            v-if="moreFeatures"
            :text="`+${moreFeatures}`"
            :data-title="meta.features.slice(2).join(', ')"
          />
      </div>
      <a :href="meta.playgroundLink" class="playground link" target="_blank">
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
a > .VPBadge:hover {
  text-decoration: underline;
}
.highlight-filter {
  color: var(--vp-c-text-2);
  border-color: var(--vp-c-text-3);
}
.highlight-filter:hover {
  color: var(--vp-c-text-2);
}
@media only screen and (min-width: 780px) {
  [data-title] {
    position: relative;
    cursor: help;
  }
  [data-title]::before {
    position: absolute;
    left: 5px;
    bottom: -5px;
    width: 0;
    height: 0;
    display: block;
    border: 5px solid transparent;
    content: '';
    border-bottom-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: 0.2s;
  }

  [data-title]::after {
    content: attr(data-title);
    position: absolute;
    left: 50%;
    bottom: -5px;
    color: var(--vp-c-white);
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.25em 0.5em;
    font-size: 10px;
    width: max-content;
    transform: translate(-50%, 100%);
    transition: 0.2s;
    border-radius: 5px;
    opacity: 0;
  }

  [data-title]:hover::after, [data-title]:hover::before {
    opacity: 1;
  }
}
</style>