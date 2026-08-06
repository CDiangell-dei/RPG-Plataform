import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  base: '/RPG-Plataform/',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'docs',
  }
})
