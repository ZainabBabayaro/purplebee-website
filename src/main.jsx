import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { loaderForPath } from './routes/pageLoaders.js'
import './index.css'

// Client entry. Prerendered pages hydrate the existing HTML (no flash); in dev,
// where the root is empty, we mount fresh instead.
const rootEl = document.getElementById('root')
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

async function start() {
  if (!rootEl.hasChildNodes()) {
    createRoot(rootEl).render(app)
    return
  }

  // Resolve the current route's code-split chunk BEFORE hydrating. A lazy route
  // that is still loading suspends on the first pass, so React throws away the
  // prerendered markup for that Suspense boundary and re-renders on the client.
  const loader = loaderForPath(window.location.pathname)
  if (loader) {
    try {
      await loader()
    } catch {
      /* fall through — hydrate anyway; the page will client-render */
    }
  }

  hydrateRoot(rootEl, app, {
    onRecoverableError(error) {
      if (import.meta.env.DEV) console.error('[hydration]', error)
    },
  })
}

start()
