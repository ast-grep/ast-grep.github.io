// Created from https://github.com/vitejs/vite/blob/d7c8603897a8d78b83a4420846581a2e80cb57dd/docs/.vitepress/config.ts
import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  date: {
    time: number
    string: string
  }
  description: string
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/*.md', {
  // excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter }) => ({
        title: frontmatter.head.find((e: any) => e[1].property === 'og:title')[1]
          .content,
        url,
        date: formatDate(frontmatter.date),
        description: frontmatter.head.find((e: any) => e[1].property === 'og:description')[1]
          .content,
      }))
      .sort((a, b) => b.date.time - a.date.time)
  },
})

function formatDate(raw: string): Post['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}