import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { prerenderContent } from './scripts/prerenderContent.mjs'

function prerenderContentPlugin() {
  return {
    name: 'prerender-content',
    closeBundle: {
      order: 'post',
      sequential: true,
      async handler() {
        await prerenderContent()
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), prerenderContentPlugin()],
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
})
