import { parserPaths, repos, versions } from '../../_data/parsers.ts'
import fs from 'node:fs'

async function main() {
  const dirname = import.meta.dirname
  for (const [lang, path] of Object.entries(parserPaths)) {
    const repo = repos[lang]
    const version = versions[lang]
    if (!repo || !version) {
      console.error(`Missing repo or version for ${lang}`)
      continue
    }
    const url = `${repo}@v${version}/${path}`
    console.log(`Downloading ${lang} parser from ${url}`)
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const wasm = new Uint8Array(buffer)
    console.log(`Writing ${lang} parser to ${path}`)
    fs.writeFileSync(`${dirname}/${path}`, wasm)
  }
}

main()