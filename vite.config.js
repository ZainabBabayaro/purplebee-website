import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Split the bundle so the homepage doesn't load Firebase, admin, or store code.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Firebase into its own chunk — only loads when the store/admin is used
          if (id.includes('node_modules/firebase')) return 'firebase'
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react'
          // Router
          if (id.includes('node_modules/react-router')) return 'router'
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) return 'icons'
          // Admin pages — only loaded when visiting /admin
          if (id.includes('/pages/admin/')) return 'admin'
          // Store pages
          if (id.includes('/pages/Store') || id.includes('/pages/Checkout') || id.includes('/pages/OrderConfirmation')) return 'store'
        },
      },
    },
  },
})
