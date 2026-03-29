import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.webmanifest',
        devOptions: {
          enabled: true,
          type: 'classic'
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'icons/*.png'],
        manifest: {
          name: 'Estética - Business & Beauty',
          short_name: 'Estética',
          description: 'Gestión integral para centros de belleza, spas y barberías.',
          theme_color: '#333333',
          background_color: '#F5F5F7',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          shortcuts: [
            {
              name: 'Ver Agenda',
              url: '/business/calendar',
              icons: [{ src: '/icons/calendar.png', sizes: '192x192' }]
            },
            {
              name: 'Mis Citas',
              url: '/client/appointments',
              icons: [{ src: '/icons/appointments.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      // Legacy support — keep for any code using process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
