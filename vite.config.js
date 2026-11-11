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
        theme_color: '#1f6feb',
        background_color: '#0d1117',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        /**
         * 预缓存**只放外壳**：JS / CSS / HTML / 图标（约 1.6 MB）。
         *
         * ## 2026-11 重要变更：答案分片不再进 precache
         *
         * 早先 `globPatterns` 里有 `json`，把 34 个答案分片（4.37 MB）也塞进预缓存。
         * 后果是**每次发版后的首次使用都会明显卡顿**（用户反馈「更新完立马用非常卡，
         * 页面切换、按钮点击都卡顿甚至无反应，过一阵子才正常」）：
         *
         * - SW 安装时一次性要下载 4.37 MB 并写入 Cache Storage，主线程与磁盘争用；
         * - 同一时间 `bank.loadIndex()` 还要解析 460 KB 索引；
         * - `fetchJSON` 用 `cache: 'no-cache'`，每个请求都要跟正在写入的 cache 抢。
         *
         * 现在分片改走 `runtimeCaching`（见下），由 `prewarmCache()` 在页面空闲时
         * 分批触发缓存 —— 卡顿被挪到用户无感的空闲时段。
         */
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico}'],

        /**
         * 索引单独放回预缓存。
         *
         * `globPatterns` 去掉了 json，但 `questions-index.json`（460 KB）是**首屏必需**的：
         * 列表、统计、筛选都靠它，离线时必须可用。它只有 1 个文件、460 KB，
         * 放进预缓存不会造成卡顿；真正重的是 34 个答案分片（4.37 MB），
         * 那些走下面的运行时缓存。
         *
         * 用 `url` + `revision: null` 而不是走 glob：
         * - 文件名不带 hash，靠 SW 版本号整体失效（新版本换新 sw.js）
         * - `revision: null` 表示「不按内容改动判断」，避免工作台每次都重算 460 KB 的摘要
         */
        additionalManifestEntries: [{ url: 'data/questions-index.json', revision: null }],

        /**
         * 答案分片：运行时按需缓存（CacheFirst）。
         *
         * 为什么用 CacheFirst 而不是 NetworkFirst：
         * 分片内容随题库版本走、文件名不带 hash（是 `answers/<分类>.json`），
         * NetworkFirst 会导致每次点题都先等网络。而题库更新时 SW 本身会换版本，
         * 旧 cache 由 `cleanupOutdatedCaches` 清掉，不会出现「永久旧数据」。
         *
         * `prewarmCache()` 会主动 fetch 这些 URL 来「喂」这条规则；
         * 用户正常浏览时点开某分类，也会自然把它们缓存下来。
         */
        runtimeCaching: [
          {
            urlPattern: /\/data\/answers\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'answers-shards',
              expiration: {
                // 34 个分类分片，留一倍余量
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // 单个文件上限 6 MB：留给将来可能变大的索引，分片都在 85 KB 量级
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
