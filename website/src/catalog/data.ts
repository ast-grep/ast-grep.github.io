import { data as allRules } from '../../_data/catalog.data'
export type { RuleMeta } from '../../_data/catalog.data'

export function intersect(a: string[], b: string[]) {
  return a.some(x => b.includes(x))
}

export function getRuleMetaData(filter: Filter) {
  const {
    selectedLanguages,
  } = filter
  return allRules.filter(meta => {
    const langFilter = !selectedLanguages.length || selectedLanguages.includes(meta.language)
    const ruleFilter = !filter.selectedRuleFilters.length || intersect(filter.selectedRuleFilters, meta.rules)
    const featureFilter = !filter.selectedFeatures.length || intersect(filter.selectedFeatures, meta.features)
    const typeFilter = !filter.selectedTypes.length || filter.selectedTypes.includes(meta.type)
    return langFilter && ruleFilter && featureFilter && typeFilter
  })
}

export type Filter = {
  selectedLanguages: ExampleLangs[],
  selectedRuleFilters: string[],
  selectedFeatures: string[],
  selectedTypes: string[],
}

export type ExampleLangs = keyof typeof languages
export const languages = {
  c: 'C',
  cpp: 'C++',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  kotlin: 'Kotlin',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  tsx: 'TSX',
  typescript: 'TypeScript',
  yaml: 'YAML',
}

export const ruleTypes = [
  'Pattern',
  'YAML',
]

export const ruleFilters = {
  atomic: [
    'pattern',
    'kind',
    'regex',
  ],
  relational: [
    'inside',
    'has',
    'follows',
    'precedes',
  ],
  composite: [
    'all',
    'any',
    'not',
    'matches',
  ]
}

export const features = [
  'rewriters',
  'transform',
  'constraints',
  'utils'
]