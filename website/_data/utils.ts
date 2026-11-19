import { JSON_SCHEMA, loadAll } from 'js-yaml'

export function loadYAMLRules(yaml: string): Record<string, unknown>[] {
  if (!yaml) {
    return []
  }
  return loadAll(yaml, null, { schema: JSON_SCHEMA }) as Record<
    string,
    unknown
  >[]
}

export function extractCatalogYaml(source: string): string {
  return source.match(/```ya?ml\n([\s\S]+?)\n```/)?.[1] || ''
}
