import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register service worker with auto-update — reloads page when new version is available
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically reload when a new version is deployed
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Magic Adwork PWA: Ready for offline use.')
  },
  // Check for updates every 60 seconds
  immediate: true
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
