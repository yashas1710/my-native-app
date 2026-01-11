import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Increase warning limit (default 500kb → now 1000kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core into its own chunk
          react: ['react', 'react-dom'],
          // Split Firebase SDK modules into separate chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  server: {
    host: true,        // Allow access from localhost & network IPs
    port: 5173,        // Use this port (or any other free port)
    strictPort: false, // If port busy, pick another one
    hmr: {
      overlay: true,   // Show HMR overlay for errors
    },
  },
})
