<script setup lang="ts">
// Created from https://github.com/vitejs/vite/blob/d7c8603897a8d78b83a4420846581a2e80cb57dd/docs/blog.md
import { data as posts } from '../_data/blog.data'

function getDateTime(time: number) {
  return new Date(time).toISOString()
}
</script>

<template>
  <ul class="blog-list">
    <li class="blog-entry" v-for="post of posts">
      <article>
        <time :datetime="getDateTime(post.date.time)">{{ post.date.string }}</time>
        <h2 class="title">
          <a :href="post.url">{{ post.title }}</a>
        </h2>
        <i class="description">{{ post.description }}</i>
      </article>
    </li>
  </ul>
</template>

<style scoped>
.blog-list {
  list-style-type: none;
  padding: 0;
}
.blog-entry {
  margin-top: 3em;
  border-bottom: 1px solid var(--vp-c-divider);
}
.blog-entry time {
  font-size: 14px;
}
.title {
  border: none;
  margin-top: 0;
  padding-top: 0;
  font-size: 22px;
}
.title a {
  font-weight: 600;
  text-decoration: none;
}
.description {
  margin-top: -12px;
  margin-bottom: 16px;
  white-space: nowrap;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
