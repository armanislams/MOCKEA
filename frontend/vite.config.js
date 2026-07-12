import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Normalize separators for cross-platform compatibility
            const normalizedId = id.replace(/\\/g, '/');
            if (
              normalizedId.includes('node_modules/react/') ||
              normalizedId.includes('node_modules/react-dom/') ||
              normalizedId.includes('node_modules/react-router/')
            ) {
              return 'vendor-react';
            }
            if (normalizedId.includes('node_modules/react-icons/')) {
              return 'vendor-icons';
            }
            if (normalizedId.includes('node_modules/firebase/')) {
              return 'vendor-firebase';
            }
            if (
              normalizedId.includes('node_modules/framer-motion/') ||
              normalizedId.includes('node_modules/gsap/')
            ) {
              return 'vendor-animations';
            }
            return 'vendor-utils';
          }
        }
      }
    }
  }
})
