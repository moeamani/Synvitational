import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One classic script + one stylesheet, fonts and images inlined, so the build
// runs anywhere (including a sandboxed artifact frame with an opaque origin).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 200 * 1024,
    cssCodeSplit: false,
    modulePreload: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
