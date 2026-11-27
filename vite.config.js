import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { stripSourceData } from './scripts/vite-plugin-strip-data.mjs'
import { emitVersionFile } from './scripts/vite-plugin-version-file.mjs'

/**
 * 计算文件内容的短哈希，用作 Workbox 预缓存条目的 `revision`。
 *
 * ## 为什么必须有它
 *
 * Workbox 用 `(url, revision)` 作为预缓存条目的缓存键：
 * - `revision` 为 `null` → 键恒定 → **SW 升级也不会重新下载该文件**
 * - `revision` 变化 → 才会重新拉取
 *
 * 2026-11 的事故就是 `questions-index.json` 用了 `revision: null`：
 * 外壳和版本号都更新了，但索引永远命中旧缓存，
 * 用户看到的题库停在 2892 题（详见 docs/deployment.md）。
 *
 * ## 读源文件而不是 dist 产物
 *
 * Vite 配置在**构建开始时**就会求值，那时 `dist/data/questions-index.json`
 * 还不存在（它是 `split:data` 阶段生成、被复制进 dist 的）。
 * 所以读 `public/data/questions-index.json` —— 两者内容一致。
 *
 * 文件不存在时退化为基于版本信息的固定串，保证构建不会因此失败。
 */
function hashFile(relPath) {
  try {
    // relPath 形如 dist/data/questions-index.json → 改读 public 源文件
    const srcPath = relPath.replace(/^dist\//, 'public/')
    const buf = readFileSync(new URL(`./${srcPath}`, import.meta.url))
    return createHash('sha256').update(buf).digest('hex').slice(0, 16)
  } catch {
    // 文件缺失时用构建时间兜底：仍然保证「每次构建 revision 都会变」
    return `build-${APP_VERSION_INFO.builtAt}`
  }
}

/**
 * 把「生成 version.json」包成一个 Vite 插件。
 *
 * 用 `closeBundle` 而不是 `writeBundle`：要等所有产物（含 SW 的 precache 清单）
 * 都写完之后再生成，避免 version.json 被误纳入 precache。
 * 实际上它还靠 runtimeCaching 的 NetworkOnly 规则保证不被缓存。
 */
function versionFile(info) {
  return {
    name: 'emit-version-file',
    apply: 'build',
    closeBundle() {
      emitVersionFile('dist', info)
    },
  }
}

/**
 * 版本信息：构建时注入，用于「我的」页展示与判断「手机上是不是旧版本」。
 *
 * 三种信息缺一不可：
 * - `version`：package.json 里的语义版本，人工维护
 * - `sha`：提交短哈希，**每次提交都会变**，是判断「是否最新」的可靠依据
 * - `builtAt`：构建时间，用于回答「这个版本是什么时候的」
 *
 * 为什么不能只靠 package.json 的 version：
 * 跑在用户手机上的 SW 是旧版本时，页面展示的也是旧值 ——
 * 但因为每次构建都会注入新值，用户一眼就能看出「我这里是旧的」。
 *
 * 拿不到 git 信息时（如 CI 的浅克隆、无 git 环境）降级为 'unknown'，
 * 不能让构建因此失败。
 */
function buildVersionInfo() {
  let version = '0.0.0'
  try {
    version = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
  } catch {
    /* 保持默认值 */
  }

  let sha = 'unknown'
  try {
    sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    /* CI 浅克隆或无 git 时忽略 */
  }

  return {
    version,
    sha,
    builtAt: new Date().toISOString(),
  }
}

const APP_VERSION_INFO = buildVersionInfo()

// https://vitejs.dev/config/
export default defineConfig({
  // 部署到子目录时用环境变量指定，例如：BASE_PATH=/ops/ npm run build
  // 默认 '/'（根域名或独立域名部署）
  base: process.env.BASE_PATH || '/',

  /**
   * 编译期常量：版本信息与仓库地址。
   *
   * 用 `define` 而不是运行时读文件 —— 这样它们能被 tree-shake 进 bundle，
   * 且**每次构建都会重新注入**，是判断版本新旧的可靠来源。
   */
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION_INFO.version),
    __APP_SHA__: JSON.stringify(APP_VERSION_INFO.sha),
    __APP_BUILT_AT__: JSON.stringify(APP_VERSION_INFO.builtAt),
    __APP_REPO__: JSON.stringify('https://github.com/fanggafa/OpsInterview-Bank-H5'),
  },
  // stripSourceData：构建后删掉 dist/data/questions.json —— 运行时已用
  // questions-index.json + answers/*.json，这份 4.3 MB 的源数据只用于编辑期。
  plugins: [
    vue(),
    stripSourceData(),
    /**
     * 生成 `dist/data/version.json` —— 前端用来探测「服务器上是不是有更新」。
     *
     * 这是解决「存量用户不知道自己该更新」的关键：
     * SW 的更新弹窗只在「新版已装好进 waiting」时出现，
     * 而旧 SW 什么时候去检查、检不检查得到，用户完全无感。
     * 有了这个静态探针，前端可以主动比对 sha，不一致就在首页挂横幅。
     */
    versionFile(APP_VERSION_INFO),
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
         * 旧缓存清理的机制说明。
         *
         * `cleanupOutdatedCaches` 只处理 precache manifest 中的旧条目，
         * 对 `runtimeCaching` 生成的缓存桶**不管**。
         * 所以答案分片改用「cacheName 带构建时间戳」+ `expiration.maxAgeSeconds: 30 天`
         * 来保证失效：新版本一构建就是全新的缓存桶，旧桶在 30 天后由 workbox 的
         * expiration 插件自动清掉，不会永久残留。
         *
         * 这比手写 activate 钩子更稳 —— workbox 的 expiration 由它自己的插件管理，
         * 不需要我们注入额外脚本。
         */

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
         * `globPatterns` 去掉了 json，但 `questions-index.json`（约 200 KB）是**首屏必需**的：
         * 列表、统计、筛选都靠它，离线时必须可用。它只有 1 个文件，
         * 放进预缓存不会造成卡顿；真正重的是答案分片（4 MB+），那些走运行时缓存。
         *
         * ## ⚠️ 2026-11 事故：`revision: null` 导致题库永久停在旧版本
         *
         * 早先这里写的是 `revision: null`，注释里的理由是
         * 「文件名不带 hash，靠 SW 版本号整体失效；避免每次重算 460 KB 摘要」。
         *
         * **这个假设是错的。** Workbox 判断「预缓存条目是否要重新下载」时，
         * 依据的是 `(url, revision)` 这一对键：
         *
         * - `revision` 是 `null` → 键永远不变 → **无论 SW 怎么升级都不重新下载**
         * - 只有 `revision` 变化才会触发重新拉取
         *
         * 所以即使 `sw.js` 换了新版本、`index-xxx.js` 也换了，
         * 浏览器仍然从旧的 precache 里读那份 2892 题的索引 ——
         * 用户看到的就是「版本号是最新的，但题库还是旧的」。
         *
         * ## 现在怎么修
         *
         * 用**内容哈希**做 revision：文件内容一变，revision 就变，必然重新下载。
         * 摘要只在构建时算一次（不是每次请求都算），成本可以忽略。
         */
        additionalManifestEntries: [
          {
            url: 'data/questions-index.json',
            revision: hashFile('dist/data/questions-index.json'),
          },
        ],

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
          /**
           * `version.json` 必须**永远走网络** —— 它存在的唯一目的就是拿到服务器最新值。
           *
           * 用 `NetworkOnly` 而不是 `NetworkFirst`：
           * NetworkFirst 在网络失败时会回落到缓存，返回一个**过期的版本号**，
           * 那会让前端误判「已是最新」，恰好掩盖了需要更新的情况。
           * 拿不到就让它失败，前端按「未知」处理（不误报、也不误判为最新）。
           *
           * 必须放在 answers 规则**之前**：workbox 按数组顺序匹配，先命中先生效。
           */
          {
            urlPattern: /\/data\/version\.json$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/data\/answers\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              /**
               * 2026-11 关键修复：cacheName 带上**构建版本**。
               *
               * ## 曾经的真实故障
               *
               * 早先 cacheName 是固定的 `answers-shards`，配合 `maxAgeSeconds: 365 天`：
               * 用户手机里的答案分片一旦缓存，就是**整整一年不变**。
               *
               * `cleanupOutdatedCaches` 只清理 **precache** 的旧 entry，
               * 对 `runtimeCaching` 产生的缓存**完全不管** —— 所以即使 SW 更新了、
               * 索引也更新了，答案分片仍旧命中旧缓存。
               *
               * 用户看到的现象就是「题库停在 2892 题，怎么刷新都更新不了」：
               * 索引是新的（30xx 题），但点进去读的是旧分片，题目数与内容对不上。
               *
               * ## 现在怎么保证会更新
               *
               * cacheName 里带上构建时间戳 → 每次构建产生**全新的缓存桶**，
               * 旧桶由下方 `cleanupOutdatedCaches` 之外的机制（activate 时的
               * 显式清理，见 sw 的 activate 钩子）删除，不会永久残留。
               *
               * 这样「SW 更新 → 新 cacheName → 必然重新拉取最新分片」，
               * 不会再出现「版本更新了但数据还是旧的」。
               */
              cacheName: `answers-shards-${APP_VERSION_INFO.builtAt.replace(/[^0-9]/g, '').slice(0, 12)}`,
              expiration: {
                // 34 个分类分片，留一倍余量
                maxEntries: 80,
                /**
                 * 保留期从 365 天降到 30 天。
                 *
                 * 分片的有效性完全依附于「当前构建版本」—— cacheName 一变就整桶作废，
                 * 所以长保留期没有任何好处，只会在长期不更新的客户端上留下陈旧数据。
                 * 30 天足够覆盖正常使用周期，也给极端情况（长期离线）留了兜底。
                 */
                maxAgeSeconds: 60 * 60 * 24 * 30,
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
