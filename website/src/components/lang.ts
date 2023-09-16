type SupportedLang = keyof typeof parserPaths
import init, { setupParser, initializeTreeSitter, findNodes, fixErrors } from 'ast-grep-wasm'

const parserPaths = {
  javascript: 'tree-sitter-javascript.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  tsx: 'tree-sitter-tsx.wasm',
  // not so well supported lang...
  c: 'tree-sitter-c.wasm',
  csharp: 'tree-sitter-c_sharp.wasm',
  cpp: 'tree-sitter-cpp.wasm',
  dart: 'tree-sitter-dart.wasm',
  go: 'tree-sitter-go.wasm',
  html: 'tree-sitter-html.wasm',
  java: 'tree-sitter-java.wasm',
  python: 'tree-sitter-python.wasm',
  ruby: 'tree-sitter-ruby.wasm',
  rust: 'tree-sitter-rust.wasm',
  scala: 'tree-sitter-scala.wasm',
  swift: 'tree-sitter-swift.wasm',
}

export const languageDisplayNames: Record<SupportedLang, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  // not so well supported lang...
  c: 'C',
  csharp: 'C#',
  cpp: 'C++',
  dart: 'Dart',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  scala: 'Scala',
  swift: 'Swift',
}

export async function initializeParser() {
  await init()
  await initializeTreeSitter()
}

export async function setGlobalParser(lang: string) {
  const path = parserPaths[lang]
  await setupParser(lang, path)
}

export function doFind(src: string, json: any[]) {
  if (!src || !json) {
    return [[], src]
  }
  const matched = findNodes(src, json)
  const fixed = fixErrors(src, json)
  return [matched, fixed]
}