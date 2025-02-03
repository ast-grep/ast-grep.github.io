<script setup lang="ts">

import { data as rules } from '../../_data/catalog.data'

</script>

<template>
  <h2> Rule List </h2>
  <ul class="rule-list">
    <li v-for="rule in rules" :key="rule.language + rule.id" class="rule-item">
      <div class="rule-header">
        <a :href="rule.link" class="rule-name">{{ rule.name }}</a>
        <div class="rule-badges">
          <span class="badge type">{{ rule.type }}</span>
          <a :href="`/catalog/${rule.language}/`" class="badge language">
            {{ rule.language }}
          </a>
        </div>
      </div>
      <div class="rule-details">
        <span class="badge fix" :class="{ 'has-fix': rule.hasFix }">
          {{ rule.hasFix ? 'Has Fix' : 'No Fix' }}
        </span>
        <!--
        <div class="features">
          <span v-for="feature in rule.features" :key="feature" class="feature-tag">
            {{ feature }}
          </span>
        </div>
        -->
        <a :href="rule.playgroundLink" class="playground-link" target="_blank">
          Try in Playground
          <span class="arrow">→</span>
        </a>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.rule-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.rule-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rule-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.rule-name:hover {
  text-decoration: underline;
}

.rule-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.badge.language {
  background-color: #f3f4f6;
  color: #4b5563;
  text-decoration: none;
}

.badge.type {
  background-color: #e0f2fe;
  color: #0369a1;
}

.badge.fix {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge.fix.has-fix {
  background-color: #dcfce7;
  color: #166534;
}

.rule-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.features {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feature-tag {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.playground-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
}

.playground-link:hover {
  text-decoration: underline;
}

.arrow {
  font-size: 1.1em;
  transition: transform 0.2s ease;
}

.playground-link:hover .arrow {
  transform: translateX(2px);
}
</style>