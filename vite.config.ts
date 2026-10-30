import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths work seamlessly on GitHub Pages, local files, and Capacitor
  server: {
    port: 3002,
    open: true
  },
  preview: {
    port: 3002
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
