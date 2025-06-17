// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    hmr: {
      overlay: true // veya false yaparsan hata mesajı tam ekran çıkmaz
    }
  }
});
