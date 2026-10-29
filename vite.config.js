import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite powers both the dev server and the production build.
// Static generation (SSG) is handled by prerender.js, which runs after build
// to emit pre-rendered HTML for every route so search engines receive fully
// rendered, metadata-rich pages without executing client JavaScript.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  ssr: {
    // react-helmet-async ships a CJS build for Node SSR; transform it so its
    // named exports (Helmet, HelmetProvider) resolve during prerender.
    noExternal: ['react-helmet-async'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
