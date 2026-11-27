/**
 * 构建后生成 `dist/data/version.json` —— 供前端判断「是否有新版本」。
 *
 * ## 为什么需要这个文件
 *
 * 2026-11 的真实问题：用户设备上装着旧 SW，题库停在 2892 题，
 * 但**他自己完全不知道**有新版本可用 ——
 * `registerType: 'prompt'` 的弹窗只在「SW 已经装好新版本、进入 waiting」时才出现，
 * 而旧 SW 是否去检查更新、什么时候检查，用户完全无感。
 *
 * 这个文件是一个**极小的静态探针**：前端定期 fetch 它，
 * 比对 `sha` 与当前运行的版本：
 * - 一致 → 是最新
 * - 不一致 → 有新版本，在首页显示可点击的横幅
 *
 * ## 为什么不用 GitHub API
 *
 * 用 `api.github.com` 查 main 的最新 commit 也行，但有三个问题：
 * ① 未认证请求限流 60 次/小时/IP，用户多了会 403
 * ② 依赖第三方可用性，GitHub 挂了我们也就查不到
 * ③ 跨域、CSP 等额外限制
 *
 * 自己的静态文件没有这些问题，而且**与产物同源，永远不会不一致**。
 *
 * ## 这个文件必须**不被 SW 缓存**
 *
 * 它存在的唯一目的就是「拿到服务器上的最新值」，
 * 一旦被 CacheFirst 缓存就完全失效了。见 vite.config.js 的 runtimeCaching。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

export function emitVersionFile(outDir, info) {
  const dir = resolve(outDir, 'data')
  mkdirSync(dir, { recursive: true })

  const payload = {
    version: info.version,
    sha: info.sha,
    builtAt: info.builtAt,
  }

  writeFileSync(resolve(dir, 'version.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`  data/version.json  ${payload.version} · ${payload.sha}`)
}
