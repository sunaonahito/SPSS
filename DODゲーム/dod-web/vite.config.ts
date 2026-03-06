import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/dice-of-destiny-online3/', // GitHub Pages用の新しいベースURL
  plugins: [react()],
})