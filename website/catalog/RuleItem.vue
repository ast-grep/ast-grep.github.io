<script setup>
import { defineProps } from 'vue'
defineProps({
  title: String,
})
</script>
<template>
  <h1>{{ title }}</h1>
</template>
