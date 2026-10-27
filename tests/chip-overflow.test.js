import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 回归：题库页「分类胶囊里的文字撑出边框」。
 *
 * 根因：`.chip-grid` 用固定列宽（`grid-template-columns: minmax(104px, 1fr)`），
 * 而分类名长度差异极大（`MySQL` 5 字符 vs `iptables/firewalld` 19 字符、
 * `自动化与配置管理` 8 汉字），固定列宽容不下长名字 → 文字溢出胶囊。
 *
 * 正确做法：flex-wrap 换行 + 每个胶囊按内容自适应宽度 + 文字容器可省略。
 * jsdom 不做布局计算，无法断言实际渲染宽度，因此这里检查源码 CSS 规则。
 */
const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

describe('分类胶囊不再溢出', () => {
  const css = read('src/assets/styles.css')
  const bankView = read('src/views/BankView.vue')

  it('.chip-grid 用 flex 换行，而不是固定列宽 grid', () => {
    // 取 .chip-grid 规则块
    const block = css.match(/\.chip-grid\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const rule = block[0]
    expect(rule).toMatch(/display:\s*flex/)
    expect(rule).toMatch(/flex-wrap:\s*wrap/)
    // 回归点：不能再出现固定列宽（minmax / repeat(auto-fill ...)）
    expect(rule).not.toMatch(/grid-template-columns/)
  })

  it('胶囊允许收缩（flex-shrink），不会把容器撑破', () => {
    const block = css.match(/\.chip-grid\s+\.chip\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const rule = block[0]
    expect(rule).toMatch(/min-width:\s*0/)
    expect(rule).toMatch(/flex:\s*0\s+1\s+auto/)
  })

  it('基础 .chip 带 min-width:0，flex 子项才能正常收缩', () => {
    const block = css.match(/^\.chip\s*\{[^}]*\}/m)
    expect(block).toBeTruthy()
    expect(block[0]).toMatch(/min-width:\s*0/)
  })

  it('分类名与计数分属独立容器，名字超出时可省略', () => {
    expect(bankView).toMatch(/\.chip__label\s*\{[^}]*text-overflow:\s*ellipsis/)
    expect(bankView).toMatch(/\.chip__label\s*\{[^}]*min-width:\s*0/)
    expect(bankView).toMatch(/\.chip__count\s*\{[^}]*flex-shrink:\s*0/)
  })
})
