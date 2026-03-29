import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'Todo AI Goals',
        short_name: 'Todo',
        theme_color: '#0d0f17',
        background_color: '#0d0f17',
        display: 'standalone',
        orientation: 'portrait'
      }
    })
  ],
})
