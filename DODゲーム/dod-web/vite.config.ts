import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/SPSS/', // SPSSを指定
  build: {
    outDir: 'docs', // ビルド結果を /docs に出力
  },
  plugins: [react()],
})
