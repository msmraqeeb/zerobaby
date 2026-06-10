
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Zerobaby',
        short_name: 'Zerobaby',
        description: 'Zerobaby E-commerce Store',
        theme_color: '#e92c5d',
        icons: [
          {
            src: 'https://ik.imagekit.io/vrtbi4wsn/store/zerobaby-fav.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://ik.imagekit.io/vrtbi4wsn/store/zerobaby-fav.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
