<script setup lang="ts">
import { type PropType, computed } from 'vue'

import { type RuleMeta, type Filter, languages, intersect } from './data'
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

// display selected options first
function sortedOptions(options: string[], selected: string[]) {
  const result = []
  const notSelected = []
  for (const option of options) {
    if (selected.includes(option)) {
      result.push(option)
    } else {
      notSelected.push(option)
    }
  }
  return result.concat(notSelected)
}

const displayRuleCount = computed(() => {
  const maxRule = meta.features.length > 0 ? 2 : 5
  return Math.min(meta.rules.length, maxRule)
})

const sortedRules = computed(() => sortedOptions(meta.rules, filter.selectedRules))
const displayedRules = computed(() => sortedRules.value.slice(0, displayRuleCount.value))
const moreRules = computed(() => sortedRules.value.slice(displayRuleCount.value))

const sortedFeatures = computed(() => sortedOptions(meta.features, filter.selectedFeatures))
const displayFeatures = computed(() => sortedFeatures.value.slice(0, 2))
const moreFeatures = computed(() => sortedFeatures.value.slice(2))
</script>

<template>
  <li class="rule-item">
    <div class="rule-main">
      <a :href="meta.link" class="rule-name" target="_blank">
        {{ meta.name }}
        <img class="logo" :src="'/langs/' + meta.language.toLowerCase() + '.svg'"/>
      </a>
      <div class="rule-details">
        <div class="rule-badges" >
          <template v-if="meta.type === 'Pattern'">
            <Badge type="info" text="Simple Pattern Example" />
          </template>
          <template v-else>
            <span title="Used Rules">📏</span>
            <span class="emoji-offset"/>
            <Option
              v-for="rule in displayedRules"
              :key="rule"
              :text="rule"
              :highlight="filter.selectedRules.includes(rule)"
            />
            <Option
              v-if="moreRules.length"
              :text="`+${moreRules.length}`"
              :data-title="moreRules.join(', ')"
              :highlight="intersect(moreRules, filter.selectedRules)"
            />
          </template>
        </div>
        <div class="rule-badges" v-if="displayFeatures.length > 0">
            <span title="Used Features">💡</span>
            <Option
              v-for="feature in displayFeatures"
              :key="feature"
              :text="feature"
              :highlight="filter.selectedFeatures.includes(feature)"
            />
            <Option
              v-if="moreFeatures.length"
              :text="`+${moreFeatures.length}`"
              :data-title="moreFeatures.join(', ')"
              :highlight="intersect(moreFeatures, filter.selectedFeatures)"
            />
        </div>
      </div>
    </div>
    <div class="rule-aux">
      <div class="rule-badges">
        <span> <!-- dummy wrapper for better align items -->
          <Badge v-if="meta.hasFix" type="tip">
            <span class="override-badge-text-color">🛠️ Fix</span>
          </Badge>
        </span>
        <a :href="`/catalog/${meta.language}/`" target="_blank">
          <Badge type="info" :class="filter.selectedLanguages.length && 'highlight-filter'">
            📚 {{ languages[meta.language] }}
          </Badge>
        </a>
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

.rule-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
}

.rule-badges {
  display: flex;
  gap: 4px;
  align-items: center;
}

.rule-main {
  flex: 1 1 auto;
}

.rule-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  margin-bottom: 12px;
}

.logo {
  height: 18px;
  display: inline;
}

.rule-aux {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.playground {
  font-size: 0.8em;
  white-space: nowrap;
  text-align: right;
  flex: 1 0 auto;
}

.rule-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-details > div {
  flex: 1 0 50%;
}

@media only screen and (max-width: 640px) {
  .rule-item {
    margin: 0 -24px;
    border-radius: 0;
    border-width: 0;
    border-bottom-width: 1px;
    flex-direction: column;
    gap: 8px;
  }
  .rule-name {
    text-wrap: pretty;
    justify-content: space-between;
  }
  .rule-item:first-child {
    border-top-width: 1px;
  }
  .rule-aux {
    flex: 1 0 auto;
    flex-direction: row;
  }
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
  height: 24px;
  line-height: 24px;
  transform: translateY(0);
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