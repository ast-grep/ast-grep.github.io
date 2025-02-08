import { createContentLoader } from 'vitepress'
import { ExampleLangs } from '../src/catalog/data'

interface Rule {
  id: string
  name: string
  type: string
  link: string
  playgroundLink: string
  language: ExampleLangs
  hasFix: boolean
  rules: string[]
  features: string[]
}

declare const data: Rule[]
export { data }

export default createContentLoader('catalog/**/*.md', {
  includeSrc: true,
  transform(raw): Rule[] {
    return raw
      .filter(({ url }) => {
        return url.endsWith('.html') && !url.includes('rule-template')
      })
      .map(({ url, src }) => {
        const source = src!
        const id = url.split('/').pop()?.replace(/\.md$/, '') || ''
        const type = source.includes('```yml') || source.includes('```yaml')
         ? 'YAML' : 'Pattern'
        const playgroundLink = /\[Playground Link\]\((.+)\)/.exec(source)?.[1] || ''
        const hasFix = source.includes('<Badge') && source.includes('Has Fix')
        const language = url.split('/')[2] as ExampleLangs
        const name = source.match(/##\s*([^<\n]+)/)?.[1] || ''

        return {
          id,
          name,
          type,
          link: url,
          playgroundLink,
          language,
          hasFix,
          rules: [],
          features: [],
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id))
  },
})