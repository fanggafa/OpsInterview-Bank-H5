import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { stripSourceData } from './scripts/vite-plugin-strip-data.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  // 部署到子目录时用环境变量指定，例如：BASE_PATH=/ops/ npm run build
  // 默认 '/'（根域名或独立域名部署）
  base: process.env.BASE_PATH || '/',
  // stripSourceData：构建后删掉 dist/data/questions.json —— 运行时已用
  // questions-index.json + answers/*.json，这份 4.3 MB 的源数据只用于编辑期。
  plugins: [vue(), stripSourceData()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 兼容微信内置浏览器 / 老 X5 内核
  build: {
    target: 'es2018',
  },
  server: {
    host: '127.0.0.1',
    port: 5273,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5274,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
  },
})
