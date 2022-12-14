export enum Mode {
  Patch = 'Patch',
  Config = 'Config',
}

export const activeTabs = Object.keys(Mode)

export type State = {
  mode: Mode,
  query: string,
  config: string,
  source: string,
  lang: string,
}

// prefer old unicode hacks for backward compatibility
// https://base64.guru/developers/javascript/examples/unicode-strings
function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(data)))
}

function atou(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

export function serialize(state: State): string {
  return utoa(JSON.stringify(state))
}

export function deserialize(str: string): State {
  return JSON.parse(atou(str))
}

const source =
`/* All console.log() call will be highlighted!*/

function tryAstGrep() {
  console.log('Hello World')
}

const multiLineExpression =
  console
   .log('Also matched!')

if (true) {
  const notThis = 'console.log("not me")'
}`

const query = 'console.log($MATCH)'
const config = `
# Configure Rule in YAML
rule:
  any:
    - pattern: if (false) { $$$ }
    - pattern: if (true) { $$$ }
constraints:
  # META_VAR: pattern
`.trim()

const defaultState = {
  mode: Mode.Patch,
  lang: 'javascript',
  query,
  config,
  source,
}

export function restoreState(): State {
  try {
    return deserialize(location.hash.slice(1))
  } catch {
    return defaultState
  }
}
