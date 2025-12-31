import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'serve-formgear-assets',
      configureServer(server) {
        // Serve FormGear dist files directly from parent dist folder
        server.middlewares.use((req, res, next) => {
          const distDir = resolve(__dirname, '../dist')

          if (req.url === '/form-gear.umd.js') {
            const filePath = resolve(distDir, 'form-gear.umd.js')
            if (existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.end(readFileSync(filePath))
              return
            }
          }

          if (req.url === '/form-gear.css') {
            const filePath = resolve(distDir, 'form-gear.css')
            if (existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/css')
              res.end(readFileSync(filePath))
              return
            }
          }

          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Allow importing from parent form-gear package for preview
      'form-gear': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5174,
    // Allow serving files from parent directory for FormGear preview
    fs: {
      allow: ['..'],
    },
  },
  // Optimize deps to include form-gear dependencies
  optimizeDeps: {
    include: ['solid-js', 'solid-js/web'],
  },
})
