import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
https://github.com/remcohaszing/monaco-yaml/issues/150#issuecomment-1048599960
import yamlWorker from './workaround?worker'

type Monaco = typeof import('monaco-editor');
let mnc: Promise<Monaco>

export async function setup() {
  if (!mnc) {
    mnc = doSetup()
  }
  return mnc
}

async function doSetup() {
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      if (label === 'yaml') {
        return new yamlWorker()
      }
      return new editorWorker()
    }
  }
  const [monaco, { configureMonacoYaml }] = await Promise.all([
    import('monaco-editor'),
    import('monaco-yaml')
  ])

  disableTypeScriptCheck(monaco)

  configureMonacoYaml(monaco, {
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    validate: true,
    format: true,
    schemas: [
      {
        uri: '/schema.json',
        fileMatch: ['*'],
      },
    ],
  })
  return monaco
}

// code fragment usually does not type check
function disableTypeScriptCheck(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  })
}