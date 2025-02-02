export const languages = [
  'C',
  'C++',
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