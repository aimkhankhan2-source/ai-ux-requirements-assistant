import { fileURLToPath } from 'node:url'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The client lives in client/, but prompts/ux-requirements-assistant.md
// (imported via `?raw` in src/lib/promptBuilder.js) lives one level up at
// the repo root. Vite's dev server only serves files inside its project
// root by default, so this explicitly allows the repo root too — needed in
// dev only; `vite build` has no such restriction.
const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
