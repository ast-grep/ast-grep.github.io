type SupportedLang = keyof typeof parserPaths
import init, { setupParser, initializeTreeSitter, WASMConfig } from 'ast-grep-wasm'

const parserPaths = {
  javascript: 'tree-sitter-javascript.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  tsx: 'tree-sitter-tsx.wasm',
  // not so well supported lang...
  bash: 'tree-sitter-bash.wasm',
  c: 'tree-sitter-c.wasm',
  csharp: 'tree-sitter-c_sharp.wasm',
  dart: 'tree-sitter-dart.wasm',
  cpp: 'tree-sitter-cpp.wasm',
  go: 'tree-sitter-go.wasm',
  html: 'tree-sitter-html.wasm',
  java: 'tree-sitter-java.wasm',
  php: 'tree-sitter-php.wasm',
  python: 'tree-sitter-python.wasm',
  ruby: 'tree-sitter-ruby.wasm',
  rust: 'tree-sitter-rust.wasm',
  toml: 'tree-sitter-toml.wasm',
  yaml: 'tree-sitter-yaml.wasm',
}

export const languageDisplayNames: Record<SupportedLang, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  // not so well supported lang...
  bash: 'Bash',
  c: 'C',
  csharp: 'C#',
  dart: 'Dart',
  cpp: 'C++',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  toml: 'TOML',
  yaml: 'YAML',
}

export async function initializeParser() {
  await init()
  await initializeTreeSitter()
}

export async function setGlobalParser(lang: string) {
  const path = parserPaths[lang]
  await setupParser(lang, path)
}
