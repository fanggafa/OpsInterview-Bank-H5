import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { stripSourceData } from './scripts/vite-plugin-strip-data.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  // 部署到子目录时用环境变量指定，例如：BASE_PATH=/ops/ npm run build
  // 默认 '/'（根域名或独立域名部署）
  base: process.env.BASE_PATH || '/',
  // stripSourceData：构建后删掉 dist/data/questions.json —— 运行时已用
  // questions-index.json + answers/*.json，这份 4.3 MB 的源数据只用于编辑期。
  plugins: [
    vue(),
    stripSourceData(),
    /**
     * PWA：把整个应用（含题库数据）缓存到本地，断网也能刷题。
     *
     * 缓存策略：**全量预缓存 + 手动更新**。
     * - 全部数据（索引 460 KB + 分片 3.2 MB）都进 precache：
     *   这是个人题库工具，核心场景就是通勤/地铁没网时刷题，
     *   只缓存首屏会导致「能打开列表但点进去没答案」。
     * - registerType: 'prompt' —— 新版本不自动激活，而是通过 usePwaUpdate
     *   弹出「有新版本」提示，避免正在刷题时被 Service Worker 强刷打断。
     *
     * 注意 data 目录用 globPatterns 显式包含：vite-plugin-pwa 默认只抓
     * js/css/html/图标，data/*.json 这类资源不在默认列表里。
     */
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '运维面试题库',
        short_name: '运维题库',
        description: '离线可用的运维面试题库（含内联 SVG 图解）',
        lang: 'zh-CN',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        theme_color: '#3cd4e0',
        background_color: '#0d1117',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 预缓存这些资源（默认不含 json，这里显式加上 data 下的题库数据）
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico,json}'],
        // 单个文件上限放宽到 6 MB：最大的分片 85 KB、索引 460 KB，都远小于此，
        // 但留足余量避免将来加数据文件时被静默跳过（workbox 默认 2 MB 会跳过）
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // 不要在 activate 时立刻接管所有页面 —— 配合 registerType:'prompt'，
        // 由我们自己弹提示让用户决定何时更新
        clientsClaim: false,
        skipWaiting: false,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: {
        // 开发环境不开（避免 HMR 与 SW 缓存互相干扰）；要调试可临时改 true
        enabled: false,
      },
    }),
  ],
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
