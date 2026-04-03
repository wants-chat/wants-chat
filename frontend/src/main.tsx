import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import './i18n'
import './index.css'
import App from './App.tsx'
import { initializeAnalytics } from './utils/analytics'

// Initialize Google Analytics
initializeAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
