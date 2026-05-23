#!/usr/bin/env node
// Checks that language lists across documentation and source files stay consistent.
// Run: node website/check-lang-consistency.mjs

import { readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let errors = 0

function error(msg) {
  console.error(`  ERROR: ${msg}`)
  errors++
}

function sorted(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b))
}

// --- 1. Parse reference/languages.md table ---
console.log('Checking reference/languages.md ...')
const langsMd = readFileSync(join(__dirname, 'reference/languages.md'), 'utf8')
const langTableRe = /^\|(\w+)\s*\|/gm
const langsFromTable = []
for (const m of langsMd.matchAll(langTableRe)) {
  const name = m[1]
  if (name === 'Language') continue // header row
  langsFromTable.push(name)
}
console.log(`  Found ${langsFromTable.length} languages in table`)

// --- 2. Parse reference/yaml.md valid values ---
console.log('Checking reference/yaml.md ...')
const yamlMd = readFileSync(join(__dirname, 'reference/yaml.md'), 'utf8')
const yamlValuesRe = /Valid values are:\s*(.+)/
const yamlMatch = yamlMd.match(yamlValuesRe)
const langsFromYaml = yamlMatch
  ? yamlMatch[1].match(/`(\w+)`/g).map(s => s.replace(/`/g, ''))
  : []
console.log(`  Found ${langsFromYaml.length} languages in valid values`)

// --- 3. Compare languages.md vs yaml.md ---
console.log('Comparing languages.md <-> yaml.md ...')
const tableSet = new Set(langsFromTable)
const yamlSet = new Set(langsFromYaml)
for (const lang of langsFromTable) {
  if (!yamlSet.has(lang)) {
    error(`"${lang}" is in languages.md but missing from yaml.md valid values`)
  }
}
for (const lang of langsFromYaml) {
  if (!tableSet.has(lang)) {
    error(`"${lang}" is in yaml.md valid values but missing from languages.md table`)
  }
}

// --- 4. Check languages.md table is alphabetically sorted ---
console.log('Checking languages.md alphabetical order ...')
const sortedLangs = sorted(langsFromTable)
for (let i = 0; i < langsFromTable.length; i++) {
  if (langsFromTable[i] !== sortedLangs[i]) {
    error(`languages.md table is not alphabetically sorted: "${langsFromTable[i]}" should be at position of "${sortedLangs[i]}"`)
    break
  }
}

// --- 5. Parse parsers.ts parserPaths keys ---
console.log('Checking _data/parsers.ts ...')
const parsersTs = readFileSync(join(__dirname, '_data/parsers.ts'), 'utf8')
const parserPathsBlock = parsersTs.match(/export const parserPaths = \{([\s\S]*?)\}/)?.[1] || ''
const parserKeys = [...parserPathsBlock.matchAll(/^\s*(\w+):/gm)].map(m => m[1])
console.log(`  Found ${parserKeys.length} languages in parserPaths`)

// --- 6. Parse lang.ts languageDisplayNames keys ---
console.log('Checking src/components/astGrep/lang.ts ...')
const langTs = readFileSync(join(__dirname, 'src/components/astGrep/lang.ts'), 'utf8')
const displayNamesBlock = langTs.match(/languageDisplayNames[\s\S]*?\{([\s\S]*?)\}/)?.[1] || ''
const displayKeys = [...displayNamesBlock.matchAll(/^\s*(\w+):/gm)].map(m => m[1])
console.log(`  Found ${displayKeys.length} languages in languageDisplayNames`)

// --- 7. Compare parserPaths vs languageDisplayNames ---
console.log('Comparing parserPaths <-> languageDisplayNames ...')
const parserSet = new Set(parserKeys)
const displaySet = new Set(displayKeys)
for (const lang of parserKeys) {
  if (!displaySet.has(lang)) {
    error(`"${lang}" is in parserPaths but missing from languageDisplayNames`)
  }
}
for (const lang of displayKeys) {
  if (!parserSet.has(lang)) {
    error(`"${lang}" is in languageDisplayNames but missing from parserPaths`)
  }
}

// --- 8. Parse wasm_lang.rs WasmLang enum variants ---
console.log('Checking src/wasm_lang.rs ...')
const wasmRs = readFileSync(join(__dirname, '..', 'src/wasm_lang.rs'), 'utf8')
const enumBlock = wasmRs.match(/pub enum WasmLang \{([\s\S]*?)\}/)?.[1] || ''
const wasmVariants = [...enumBlock.matchAll(/^\s*(\w+),?/gm)]
  .map(m => m[1])
  .filter(v => !v.startsWith('//'))
const wasmLangsLower = wasmVariants.map(v => v.toLowerCase())
console.log(`  Found ${wasmVariants.length} languages in WasmLang enum`)

// --- 9. Compare parserPaths vs WasmLang ---
console.log('Comparing parserPaths <-> WasmLang enum ...')
const wasmSet = new Set(wasmLangsLower)
for (const lang of parserKeys) {
  if (!wasmSet.has(lang)) {
    error(`"${lang}" is in parserPaths but missing from WasmLang enum`)
  }
}
for (const lang of wasmLangsLower) {
  if (!parserSet.has(lang)) {
    error(`"${lang}" is in WasmLang enum but missing from parserPaths`)
  }
}

// --- 10. Check every parserPaths WASM file exists on disk ---
console.log('Checking WASM parser files exist ...')
const parsersDir = join(__dirname, 'public/parsers')
const wasmFiles = new Set(readdirSync(parsersDir).filter(f => f.endsWith('.wasm')))
const parserPathValues = [...parserPathsBlock.matchAll(/:\s*'([^']+)'/gm)].map(m => m[1])
for (const file of parserPathValues) {
  if (!wasmFiles.has(file)) {
    error(`parserPaths references "${file}" but it does not exist in public/parsers/`)
  }
}

// --- 11. Check every playground language has an SVG icon ---
console.log('Checking SVG language icons ...')
const iconsDir = join(__dirname, 'public/langs')
const svgFiles = new Set(readdirSync(iconsDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', '')))
for (const lang of parserKeys) {
  if (!svgFiles.has(lang)) {
    error(`Playground language "${lang}" has no SVG icon in public/langs/${lang}.svg`)
  }
}

// --- 12. All playground languages should be in the docs ---
console.log('Comparing playground languages <-> languages.md ...')
// Normalize: languages.md uses PascalCase, playground uses lowercase
const tableLower = new Set(langsFromTable.map(l => l.toLowerCase()))
for (const lang of parserKeys) {
  if (!tableLower.has(lang)) {
    error(`Playground language "${lang}" is not listed in languages.md`)
  }
}

// --- Summary ---
console.log('')
if (errors === 0) {
  console.log('All consistency checks passed.')
} else {
  console.error(`Found ${errors} consistency error(s).`)
  process.exit(1)
}
