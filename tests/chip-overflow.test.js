import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 回归：题库页「分类胶囊里的文字撑出边框」。
 *
 * ## 原始 bug
 *
 * `.chip-grid` 曾用固定列宽 `grid-template-columns: minmax(104px, 1fr)`，
 * 而分类名长度差异极大（`MySQL` 5 字符 vs `iptables/firewalld` 19 字符），
 * 固定窄列宽容不下长名字 → 文字溢出胶囊边框。
 *
 * ## 这个测试真正要守的是什么
 *
 * 不是「必须用 flex」—— 那是当时选的手段，不是目的。
 * 真正要守的是三件事：
 *
 * 1. **列/项宽度不能被内容撑破**（`min-width: 0`，否则 flex/grid 都会溢出）
 * 2. **文字超出时有省略**（`text-overflow: ellipsis`）
 * 3. **文字与计数分属独立容器**，计数不被压缩（`flex-shrink: 0`）
 *
 * 2026-11 用 grid 替代 flex 后，前两条依然是保障，只是实现方式变了：
 * grid 的 `minmax(0, 1fr)` 保证列宽由容器决定，不随内容撑开。
 *
 * jsdom 不做布局计算，无法断言实际渲染宽度，因此这里检查源码 CSS 规则。
 */
const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

describe('分类胶囊不再溢出', () => {
  const css = read('src/assets/styles.css')
  const bankView = read('src/views/BankView.vue')

  it('.chip-grid 的列宽由容器决定，不被内容撑破', () => {
    const block = css.match(/\.chip-grid\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const rule = block[0]

    /**
     * 两种布局都接受，但都必须是「列宽可控」的写法：
     * - flex：`flex-wrap: wrap` + 子项 `min-width: 0`
     * - grid：`grid-template-columns` 里用 `minmax(0, ...)` 或固定的 1fr
     *
     * **禁止**的是「按内容自适应且不给收缩空间」——
     * 那正是最初溢出的原因。
     */
    const isFlex = /display:\s*flex/.test(rule) && /flex-wrap:\s*wrap/.test(rule)
    const isGrid = /display:\s*grid/.test(rule) && /grid-template-columns:/.test(rule)
    expect(isFlex || isGrid, '必须是 flex-wrap 或 grid 之一').toBe(true)

    // grid 模式下必须用 minmax(0, ...) 防止列被内容撑开
    if (isGrid) {
      expect(rule).toMatch(/minmax\(0,/)
    }
  })

  it('胶囊允许收缩，不会把容器撑破', () => {
    const block = css.match(/\.chip-grid\s+\.chip\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const rule = block[0]
    // 无论 flex 还是 grid，子项都必须允许收缩
    expect(rule).toMatch(/min-width:\s*0/)
  })

  it('基础 .chip 带 min-width:0，子项才能正常收缩', () => {
    const block = css.match(/^\.chip\s*\{[^}]*\}/m)
    expect(block).toBeTruthy()
    expect(block[0]).toMatch(/min-width:\s*0/)
  })

  it('分类名与计数分属独立容器，名字超出时可省略', () => {
    // 文字容器：必须能省略，否则会撑出胶囊
    expect(bankView).toMatch(/\.chip__label\s*\{[^}]*text-overflow:\s*ellipsis/)
    expect(bankView).toMatch(/\.chip__label\s*\{[^}]*min-width:\s*0/)
    // 计数：不能被压缩掉
    expect(bankView).toMatch(/\.chip__count\s*\{[^}]*flex-shrink:\s*0/)
  })
})
