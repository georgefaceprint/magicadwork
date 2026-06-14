import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Skip waiting and claim clients immediately — no stale cache
        skipWaiting: true,
        clientsClaim: true,
        // Use NetworkFirst for navigations so users always get fresh HTML
        navigateFallback: 'index.html',
        // Don't precache everything aggressively — let network take priority
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'forex-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Magic Adwork Supplier & Service',
        short_name: 'Magic Adwork',
        description: 'Wide format printing equipment, inks, parts, and repairs in Johannesburg.',
        theme_color: '#ff007f',
        background_color: '#0b0c10',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
