import { createContentLoader, type ContentData } from 'vitepress'
import { ExampleLangs } from '../src/catalog/data'
import { loadAll, JSON_SCHEMA } from 'js-yaml'

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
      .map(extractRuleInfo)
      .sort((a, b) => a.id.localeCompare(b.id))
  },
})

function extractRuleInfo({ url, src }: ContentData): Rule {
  const source = src!
  const id = url.split('/').pop()?.replace(/\.md$/, '') || ''
  const type = source.includes('```yml') || source.includes('```yaml')
   ? 'YAML' : 'Pattern'
  const playgroundLink = /\[Playground Link\]\((.+)\)/.exec(source)?.[1] || ''
  const hasFix = source.includes('<Badge') && source.includes('Has Fix')
  const language = url.split('/')[2] as ExampleLangs
  const name = source.match(/##\s*([^<\n]+)/)?.[1] || ''

  const yamls = extractYAMLRule(source)

  return {
    id,
    name,
    type,
    link: url,
    playgroundLink,
    language,
    hasFix,
    rules: extractUsedRules(yamls),
    features: extractUsedFeatures(yamls),
  }
}

function extractYAMLRule(source: string): Record<string, unknown>[] {
  const yaml = source.match(/```ya?ml\n([\s\S]+?)\n```/)?.[1] || ''
  if (!yaml) {
    return []
  }
  return loadAll(yaml, null, { schema: JSON_SCHEMA }) as Record<string, unknown>[]
}

function extractUsedRules(yamls: Record<string, unknown>[]): string[] {
  return []
}

function extractUsedFeatures(yamls: Record<string, unknown>[]): string[] {
  return []
}