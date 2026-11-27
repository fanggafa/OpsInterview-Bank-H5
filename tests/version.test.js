import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 版本标识守卫。
 *
 * ## 为什么需要这个测试
 *
 * 2026-11 用户反馈「手机上的题库永远停在 2892 题」，
 * 排查时发现**根本无从判断用户手机上是哪个版本**：
 * 设置页里写着 `const appVersion = '0.3.0'` 这个硬编码字符串，
 * 而 `package.json` 里是 `0.1.0` —— 两个数字都不反映真实情况。
 *
 * 没有可靠的版本标识，用户报「我这是旧版」时无法确认，
 * 也无法判断是「SW 没更新」还是「真的没发版」。
 *
 * 所以这里守住三件事：
 * 1. 版本号必须来自构建期注入，不能硬编码
 * 2. `vite.config.js` 必须真的注入了这些常量
 * 3. PWA 的分片缓存名必须带构建时间戳（否则用户永久停在旧题库）
 */

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('版本标识 · 不能硬编码', () => {
  it('SettingsView 不再硬编码 appVersion 字符串', () => {
    const src = read('src/views/SettingsView.vue')
    /**
     * 早先的写法是 `const appVersion = '0.3.0'`（真实代码行）。
     * 注释里可能会提到这段历史，所以要**排除注释行**再判断。
     */
    const codeLines = src
      .split('\n')
      .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
      .join('\n')
    expect(codeLines).not.toMatch(/const\s+appVersion\s*=\s*['"]\d+\.\d+\.\d+['"]/)
  })

  it('SettingsView 从 version 工具读取版本', () => {
    const src = read('src/views/SettingsView.vue')
    expect(src).toContain("@/utils/version")
    expect(src).toContain('VERSION_LABEL')
  })

  it('「我的」页底部也展示版本', () => {
    const src = read('src/views/MeView.vue')
    expect(src).toContain("@/utils/version")
    expect(src).toContain('VERSION_LABEL')
    // 有对应的模板节点
    expect(src).toMatch(/class="version"/)
  })

  it('「我的」页版本条只显示版本+sha，不显示构建日期', () => {
    /**
     * 早先这里是 `v1.0.0 · ae245d1 · 2026-11-27 14:22`。
     * 那个日期长得就像右上角的时钟，容易被误读成「当前时间」；
     * 而 sha 已能定位到具体提交，日期属冗余。
     * 真要看构建时间，设置页「关于」里有带「构建于」前缀的完整展示。
     */
    const src = read('src/views/MeView.vue')

    // 模板里不能再用构建时间
    const tpl = src.slice(src.indexOf('<template>'), src.indexOf('</template>', src.indexOf('<template>')))
    expect(tpl).not.toContain('builtAtText')
    expect(tpl).not.toContain('formatBuiltAt')

    // 也不该再引入这个函数
    expect(src).not.toContain('formatBuiltAt')
    expect(src).not.toContain('version__time')
  })
})

describe('版本标识 · 构建期注入', () => {
  it('vite.config.js 注入了四个版本常量', () => {
    const cfg = read('vite.config.js')
    for (const name of ['__APP_VERSION__', '__APP_SHA__', '__APP_BUILT_AT__', '__APP_REPO__']) {
      expect(cfg, `缺少 ${name} 的注入`).toContain(name)
    }
  })

  it('version 工具对缺失常量有降级（单测环境无 vite define）', () => {
    const src = read('src/utils/version.js')
    // 用 typeof 判断，不能直接裸引用（会 ReferenceError）
    expect(src).toMatch(/typeof\s+__APP_VERSION__\s*!==\s*'undefined'/)
  })

  it('version 工具导出仓库地址且指向本项目', () => {
    const src = read('src/utils/version.js')
    expect(src).toContain('github.com/fanggafa/OpsInterview-Bank-H5')
  })

  it('sha 用 rev-parse --short，而非 git describe', () => {
    /**
     * 这条守住「浅克隆可用性」：
     * CI 的 actions/checkout 默认 fetch-depth: 1，
     * `git describe` 需要 tag 历史会失败，`rev-parse --short HEAD` 只读 HEAD 没问题。
     */
    const cfg = read('vite.config.js')
    expect(cfg).toContain('git rev-parse --short HEAD')
    expect(cfg).not.toContain('git describe')
  })
})

describe('PWA · 分片缓存必须随构建失效', () => {
  it('cacheName 带构建时间戳，而不是固定名', () => {
    const cfg = read('vite.config.js')
    /**
     * 这是 2026-11 那次「题库停在 2892 题」的直接原因：
     * 固定 cacheName + 365 天保留期 → 分片一年不回源，
     * 而 cleanupOutdatedCaches 不管 runtimeCaching 的缓存桶。
     */
    expect(cfg).toMatch(/cacheName:\s*`answers-shards-\$\{/)
  })

  it('分片保留期不超过 90 天', () => {
    const cfg = read('vite.config.js')
    const m = cfg.match(/maxAgeSeconds:\s*\d+\s*\*\s*\d+\s*\*\s*\d+\s*\*\s*(\d+)/)
    expect(m, '未找到 maxAgeSeconds 配置').toBeTruthy()
    expect(Number(m[1])).toBeLessThanOrEqual(90)
  })
})
