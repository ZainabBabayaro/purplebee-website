import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'

// For SSG/prerender we use a special version of App that imports all pages
// statically — lazy() + Suspense would render the fallback spinner instead
// of the page content during server-side rendering.
import AppSSR from './AppSSR.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

export function render(url, helmetContext) {
  return renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AuthProvider>
          <CartProvider>
            <AppSSR />
          </CartProvider>
        </AuthProvider>
      </StaticRouter>
    </HelmetProvider>,
  )
}
