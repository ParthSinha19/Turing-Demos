import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local development is served from localhost root. Production assets are built
// for the nested GitHub Pages URL: /main-repository/the-next-game/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/main-repository/the-next-game/' : '/',
  plugins: [react()],
}))
