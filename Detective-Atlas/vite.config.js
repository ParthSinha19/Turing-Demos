import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' makes the build work from any GitHub Pages subdirectory
export default defineConfig({ base: './', plugins: [react()], build: { chunkSizeWarningLimit: 1500 } });
