import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 「有新版本」横幅与远端版本探测的守卫。
 *
 * ## 解决什么问题
 *
 * 2026-11 的真实困境：修复发了，但存量用户**毫不知情**，
 * 一直用着停在 2892 题的旧版本。
 *
 * 原因是 SW 更新弹窗有三个前提，旧版本用户全都不满足：
 * ① 旧 SW 必须主动去检查（旧代码每小时才一次）
 * ② 检查时 App 必须开着
 * ③ 用户不能点过「稍后」
 *
 * 这条横幅不依赖 SW 生命周期 —— 前端自己 fetch 静态的 version.json 比对 sha。
 * 这里守住让这套机制成立的关键点。
 */

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('版本探针 · version.json', () => {
  it('构建时生成 version.json（插件已挂载）', () => {
    const cfg = read('vite.config.js')
    expect(cfg).toContain('emitVersionFile')
    expect(cfg).toContain('versionFile(APP_VERSION_INFO)')
  })

  it('version.json 必须走 NetworkOnly，不能缓存', () => {
    const cfg = read('vite.config.js')
    /**
     * 用 NetworkFirst 都不行：网络失败时会回落缓存，
     * 返回过期版本号 → 前端误判「已是最新」，恰好掩盖需要更新的情况。
     */
    const block = cfg.slice(cfg.indexOf('version\\.json'), cfg.indexOf('version\\.json') + 300)
    expect(block).toContain('NetworkOnly')
    expect(block).not.toContain('NetworkFirst')
  })

  it('version 规则必须排在 answers 规则之前', () => {
    const cfg = read('vite.config.js')
    // workbox 按数组顺序匹配，先命中先生效
    const vIdx = cfg.indexOf('version\\.json')
    const aIdx = cfg.indexOf('answers\\/.*\\.json')
    expect(vIdx).toBeGreaterThan(-1)
    expect(aIdx).toBeGreaterThan(-1)
    expect(vIdx).toBeLessThan(aIdx)
  })

  it('version.json 不能进 precache', () => {
    const cfg = read('vite.config.js')
    // globPatterns 不能包含 json（否则 version.json 会被预缓存）
    expect(cfg).toMatch(/globPatterns:\s*\[[^\]]*\]/)
    const glob = cfg.match(/globPatterns:\s*\[([^\]]*)\]/)[1]
    expect(glob).not.toContain('json')
  })
})

describe('预缓存 · revision 必须随内容变化（2026-11 事故）', () => {
  /**
   * ## 事故经过
   *
   * 用户反馈「版本号已经是最新的，但题库还是 2892 题，电脑手机都是」。
   *
   * 根因：`questions-index.json` 的 precache 条目写了 `revision: null`。
   * Workbox 用 `(url, revision)` 作为缓存键 —— revision 恒定意味着
   * **无论 SW 怎么升级都不会重新下载这个文件**。
   *
   * 于是出现了最迷惑的症状：外壳（JS/CSS）是新的、版本号也是新的，
   * 唯独决定「有多少题」的索引永远读旧缓存。
   *
   * 当初写 null 的理由是「避免每次重算 460 KB 摘要」，属于典型的
   * 「优化了一个无关紧要的点，换来一个致命 bug」。
   */
  it('questions-index.json 的 revision 不能是 null', () => {
    const cfg = read('vite.config.js')
    /**
     * 只看 `additionalManifestEntries` 的**数组字面量**，
     * 不扫注释（注释里必然会提到 "revision: null" 这段历史）。
     */
    const start = cfg.indexOf('additionalManifestEntries')
    expect(start).toBeGreaterThan(-1)
    // 从 `additionalManifestEntries` 往后取到数组闭合
    const block = cfg.slice(start, cfg.indexOf('],', start) + 2)

    expect(block).toContain('questions-index.json')
    expect(block).not.toContain('revision: null')
    expect(block).toContain('hashFile')
  })

  it('revision 用内容哈希计算', () => {
    const cfg = read('vite.config.js')
    expect(cfg).toContain('createHash')
    expect(cfg).toContain('sha256')
    // 读的是 public 源文件（构建开始时 dist 还没生成）
    expect(cfg).toContain("replace(/^dist\\//, 'public/')")
  })

  it('hashFile 有兜底，文件缺失时不阻断构建', () => {
    const cfg = read('vite.config.js')
    const fn = cfg.slice(cfg.indexOf('function hashFile'), cfg.indexOf('function hashFile') + 500)
    expect(fn).toContain('catch')
  })
})

describe('版本探针 · 前端比对逻辑', () => {
  it('用 sha 而不是 version 判断新旧', () => {
    const src = read('src/composables/useVersionCheck.js')
    /**
     * 版本号人工维护，改 bug 不升版本 —— 同一版本号下会有多个 sha。
     * 只有 sha 能精确判断「是否同一次构建」。
     */
    expect(src).toContain('info.sha === APP_SHA')
  })

  it('拿不到版本文件时静默（不能误报有新版本）', () => {
    const src = read('src/composables/useVersionCheck.js')
    // 三态：latest / stale / unknown，只有 stale 才提示
    expect(src).toContain("'unknown'")
    expect(src).toContain("'stale'")
    expect(src).toContain("'latest'")
    // 默认值是 unknown，而不是 stale
    expect(src).toMatch(/ref\('unknown'\)/)
  })

  it('本地开发（sha=dev）不做判断，避免永远提示有新版本', () => {
    const src = read('src/composables/useVersionCheck.js')
    expect(src).toContain("APP_SHA === 'dev'")
  })

  it('检查间隔是 5 分钟（不是旧的一小时）', () => {
    const vc = read('src/composables/useVersionCheck.js')
    expect(vc).toMatch(/CHECK_INTERVAL\s*=\s*5\s*\*\s*60\s*\*\s*1000/)

    // SW 的 registration.update() 也同步加快了
    const pwa = read('src/composables/usePwaUpdate.js')
    expect(pwa).toMatch(/5\s*\*\s*60\s*\*\s*1000/)
    expect(pwa).not.toMatch(/60\s*\*\s*60\s*\*\s*1000/)
  })
})

describe('版本横幅 · UI 接线', () => {
  it('横幅挂在首页，且只在 stale 时显示', () => {
    const home = read('src/views/HomeView.vue')
    expect(home).toContain('UpdateBanner')

    const banner = read('src/components/UpdateBanner.vue')
    expect(banner).toContain("remoteState.value === 'stale'")
  })

  it('点横幅能触发更新，且兼容「没有 waiting 版本」的情况', () => {
    const banner = read('src/components/UpdateBanner.vue')
    // 有 waiting 走标准流程，没有则直接重载
    expect(banner).toContain('pwa.applyUpdate()')
    expect(banner).toContain('window.location.reload()')
  })

  it('关闭状态用 sessionStorage，刷新不重复弹但新会话仍提示', () => {
    const banner = read('src/components/UpdateBanner.vue')
    expect(banner).toContain('sessionStorage')
    expect(banner).toContain('oi_version_banner_hidden')
  })

  it('探针在 main.js 启动', () => {
    const main = read('src/main.js')
    expect(main).toContain('useVersionCheck')
    expect(main).toContain('startWatching()')
  })
})
