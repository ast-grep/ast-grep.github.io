import { type ContentData, createContentLoader } from 'vitepress'
import { ExampleLangs } from '../src/catalog/data'
import { createCodemodGrepLink } from './codemod-grep'
import { extractCatalogYaml, loadYAMLRules } from './utils'

export interface RuleMeta {
  id: string
  name: string
  type: string
  link: string
  playgroundLink: string
  grepLink: string | null
  language: ExampleLangs
  hasFix: boolean
  rules: string[]
  features: string[]
}

declare const data: RuleMeta[]
export { data }

export default createContentLoader('catalog/**/*.md', {
  includeSrc: true,
  transform(raw): RuleMeta[] {
    return raw
      .filter(({ url }) => {
        return !url.endsWith('/') && !url.includes('rule-template')
      })
      .map(extractRuleInfo)
      .sort((a, b) => a.id.localeCompare(b.id))
  },
})

function extractRuleInfo({ url, src }: ContentData): RuleMeta {
  const source = src!
  const id = url.split('/').pop()?.replace(/\.md$/, '') || ''
  const type = source.includes('```yml') || source.includes('```yaml')
    ? 'YAML' :
    'Pattern'
  const playgroundLink = /\[Playground Link\]\((.+)\)/.exec(source)?.[1] || ''
  const hasFix = source.includes('<Badge') && source.includes('Has Fix')
  const language = url.split('/')[2] as ExampleLangs
  const name = source.match(/##\s*([^<\n]+)/)?.[1] || ''

  const yaml = extractCatalogYaml(source)
  const yamls = loadYAMLRules(yaml)

  return {
    id,
    name,
    type,
    link: url,
    playgroundLink,
    grepLink: createCodemodGrepLink({ language, playgroundLink, type, yaml }),
    language,
    hasFix,
    rules: extractUsedRules(yamls),
    features: extractUsedFeatures(yamls),
  }
}

function extractUsedRules(yamls: Record<string, unknown>[]): string[] {
  const rules = new Set<string>()
  for (const yaml of yamls) {
    if (typeof yaml !== 'object' || yaml === null) {
      continue
    }
    extractOneRuleObject(yaml.rule as object, rules)
    for (const util of Object.values(yaml.utils as object || {})) {
      extractOneRuleObject(util as object, rules)
    }
  }
  return [...rules]
}

function extractOneRuleObject(rule: object, rules: Set<string>) {
  if (!rule) {
    return
  }
  for (const ruleName of Object.keys(rule)) {
    rules.add(ruleName)
    if (ruleName === 'any' || ruleName === 'all') {
      // @ts-expect-error
      for (const subRule of rule[ruleName] as object[]) {
        extractOneRuleObject(subRule, rules)
      }
    }
  }
}

function extractUsedFeatures(yamls: Record<string, unknown>[]): string[] {
  const features = new Set<string>()
  for (const yaml of yamls) {
    if (typeof yaml === 'object' && yaml !== null) {
      if ('utils' in yaml) {
        features.add('utils')
      }
      if ('constraints' in yaml) {
        features.add('constraints')
      }
      if ('rewriters' in yaml) {
        features.add('rewriters')
      }
      if ('transform' in yaml) {
        features.add('transform')
      }
      if ('labels' in yaml) {
        features.add('labels')
      }
    }
  }
  return [...features]
}
