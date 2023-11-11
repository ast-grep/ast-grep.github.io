import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'ast-grep',
  description: 'ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.',
  outDir: './dist',
  appearance: false,
  lastUpdated: true,
  vite: {
    build: {
      target: 'es2020',
      ssr: false,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
    },
  },
})