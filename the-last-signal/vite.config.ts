import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Matches your GitHub Pages URL structure: /<repository>/<subfolder>/
  base: '/Turing-Demos/the-last-signal/',
  plugins: [react()],
})
