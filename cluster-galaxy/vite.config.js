import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset paths work on localhost and beneath a GitHub Pages repository path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
