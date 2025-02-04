import { data as allRules } from '../../_data/catalog.data'

export function getRules(filter: Filter) {
  const {
    selectedLanguages,
  } = filter
  return allRules.filter(rule => {
    return !selectedLanguages.length || selectedLanguages.map(s => s.toLowerCase()).includes(rule.language)
  })
}

export type Filter = {
  selectedLanguages: string[],
  selectedRuleFilters: string[],
  selectedFeatures: string[],
  selectedTypes: string[],
}

export const languages = [
  'C',
  'Cpp',
  'Go',
  'HTML',
  'Java',
  'Kotlin',
  'Python',
  'Ruby',
  'Rust',
  'TSX',
  'TypeScript',
  'YAML',
]

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