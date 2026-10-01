import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: { '/api': 'http://127.0.0.1:8787' }
  },
  build: { outDir: 'dist', emptyOutDir: true },
  test: { testTimeout: 60000, hookTimeout: 60000, fileParallelism: false }
});
