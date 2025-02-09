import { data as allRules } from '../../_data/catalog.data'
export type { RuleMeta } from '../../_data/catalog.data'

export function getRuleMetaData(filter: Filter) {
  const {
    selectedLanguages,
  } = filter
  return allRules.filter(meta => {
    const langFilter = !selectedLanguages.length || selectedLanguages.includes(meta.language)
    const ruleFilter = !filter.selectedRuleFilters.length || filter.selectedRuleFilters.some(r => meta.rules.includes(r))
    return langFilter && ruleFilter
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
  'rewrite',
  'transform',
  'constraints',
  'utils'
]