
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Turing-Demos/robot-detective/',
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
