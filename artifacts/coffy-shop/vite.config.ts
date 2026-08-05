import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const workspaceRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig({
  base: '/',
  envDir: workspaceRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    fs: {
      strict: true,
      allow: [workspaceRoot],
    },
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
});
