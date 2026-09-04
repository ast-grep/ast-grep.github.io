import { dump, JSON_SCHEMA } from 'js-yaml'
import { extractCatalogYaml } from './utils'

interface GrepLinkInput {
  language: string
  playgroundLink: string
  type: 'Pattern' | 'YAML'
  yaml: string
}

interface PlaygroundState {
  query?: unknown
  selector?: unknown
}

const CODEMOD_GREP_LANGUAGES = new Set([
  'typescript',
  'tsx',
  'javascript',
  'rust',
  'python',
  'go',
  'c',
  'cpp',
  'java',
  'scala',
  'kotlin',
  'php',
  'swift',
  'csharp',
  'haskell',
  'ruby',
  'elixir',
  'dart',
  'bash',
])
const GREP_LINK_LABEL = 'View results in public repositories'

export function addCodemodGrepLinkToCatalogPage(source: string, path: string): string {
  const language = /(?:^|[/\\])catalog[/\\]([^/\\]+)[/\\][^/\\]+\.md$/.exec(path)?.[1]
  const playground = /^(\* \[Playground Link\]\((.+)\))$/m.exec(source)
  if (!language || !playground || source.includes(`[${GREP_LINK_LABEL}]`)) {
    return source
  }

  const yaml = extractCatalogYaml(source)
  const grepLink = createCodemodGrepLink({
    language,
    playgroundLink: playground[2],
    type: yaml ? 'YAML' : 'Pattern',
    yaml,
  })
  if (!grepLink) {
    return source
  }

  return source.replace(
    playground[1],
    `${playground[1]}\n* [${GREP_LINK_LABEL}](${grepLink})`,
  )
}

export function createCodemodGrepLink(input: GrepLinkInput): string | null {
  if (!CODEMOD_GREP_LANGUAGES.has(input.language.toLowerCase())) {
    return null
  }

  const query = createQuery(input)
  if (!query) {
    return null
  }

  const url = new URL('https://grep.codemod.com/')
  url.searchParams.set('q', query.value)
  url.searchParams.set('mode', query.mode)
  url.searchParams.set('language', input.language)
  return url.toString()
}

function createQuery(input: GrepLinkInput) {
  if (input.type === 'YAML') {
    return input.yaml ? { mode: 'yaml', value: input.yaml } : null
  }

  const state = decodePlaygroundState(input.playgroundLink)
  if (!state || typeof state.query !== 'string' || !state.query) {
    return null
  }

  if (typeof state.selector !== 'string' || !state.selector) {
    return { mode: 'pattern', value: state.query }
  }

  return {
    mode: 'yaml',
    value: dump({
      rule: {
        pattern: {
          context: state.query,
          selector: state.selector,
        },
      },
    }, {
      lineWidth: -1,
      noRefs: true,
      schema: JSON_SCHEMA,
    }).trimEnd(),
  }
}

function decodePlaygroundState(link: string): PlaygroundState | null {
  const encoded = link.split('#', 2)[1]
  if (!encoded) {
    return null
  }

  try {
    const binary = atob(encoded)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as PlaygroundState
  } catch {
    return null
  }
}
