import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * 全局回归：源码里不允许再用 `window.confirm` / `confirm(`。
 *
 * 根因（真实 bug）：
 * 微信内置浏览器（X5）、部分安卓 WebView、以及「禁止弹窗」的浏览器设置下，
 * window.confirm 会**静默返回 false 或根本不弹**——用户点击「清空」毫无反应，
 * 也没有任何报错，极难自查。
 *
 * 结论：二次确认一律用「页内确认条」（渲染在 DOM 里），不要依赖原生弹窗。
 * 「我的」页与「收藏」页都因此踩过坑。
 */

const ROOT = resolve(process.cwd(), 'src')

/** 递归收集所有 .vue / .js 源文件 */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(vue|js)$/.test(name)) out.push(p)
  }
  return out
}

/** 去掉注释行，避免把「说明为什么不用 confirm」的注释误判为违规 */
function stripComments(src) {
  return src
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      return !(t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'))
    })
    .join('\n')
}

describe('不使用原生 confirm 做二次确认', () => {
  const files = walk(ROOT)

  it('源码里没有任何 window.confirm 调用', () => {
    const offenders = []
    for (const f of files) {
      const src = stripComments(readFileSync(f, 'utf8'))
      if (/window\.confirm\s*\(/.test(src)) offenders.push(f.replace(process.cwd(), ''))
    }
    expect(offenders).toEqual([])
  })

  it('源码里没有裸 confirm( 调用（排除 mock/handler 命名）', () => {
    const offenders = []
    for (const f of files) {
      const src = stripComments(readFileSync(f, 'utf8'))
      // 只匹配「函数调用形式」：confirm( 且前面不是 . 或标识符的一部分
      const re = /(?<![.\w$])confirm\s*\(/g
      if (re.test(src)) offenders.push(f.replace(process.cwd(), ''))
    }
    expect(offenders).toEqual([])
  })

  it('「设置」页与「收藏」页都提供页内确认条', () => {
    // 清空类操作已从「我的」页搬到「设置」页
    const settings = readFileSync(resolve(ROOT, 'views/SettingsView.vue'), 'utf8')
    const fav = readFileSync(resolve(ROOT, 'views/FavoritesView.vue'), 'utf8')

    ;[settings, fav].forEach((src) => {
      expect(src).toMatch(/role="alertdialog"/)
      expect(src).toMatch(/class="confirm"/)
      expect(src).toMatch(/btn--danger/)
    })
  })

  it('「我的」页本身不再含清空操作（已移到设置页）', () => {
    const me = readFileSync(resolve(ROOT, 'views/MeView.vue'), 'utf8')
    expect(me).not.toMatch(/window\.confirm/)
    expect(me).not.toMatch(/清空学习记录/)
  })
})
