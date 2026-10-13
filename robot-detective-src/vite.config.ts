import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Turing-Demos/robot-detective/',
  build: {
    outDir: '../robot-detective',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});