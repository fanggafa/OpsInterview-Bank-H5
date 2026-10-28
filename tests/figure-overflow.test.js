import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 回归：插图里的文字必须在画布内。
 *
 * 用户反馈原话：「虽然可以点击放大，但是图片内容显示不全」。
 * 根因不是放大倍数不够，而是 SVG 源头就写超了：
 * 画布固定 340 宽，说明行一路写到 400+，超出的部分在画布坐标系里
 * 就被裁掉了 —— 再怎么放大也看不见。
 *
 * jsdom 不做 SVG 排版，所以这里跑构建前的静态估算脚本
 * （scripts/check-figure-text.mjs），顺带守住几条容易复发的排版红线。
 */
const FIGDIR = 'src/components/figures'

describe('插图文字不超出画布', () => {
  it('check:figures 通过（没有会被裁掉的文字）', () => {
    // 有溢出时脚本以退出码 1 结束，execFileSync 会抛错 —— 用例因此失败
    const run = () =>
      execFileSync(process.execPath, [resolve(process.cwd(), 'scripts/check-figure-text.mjs')], {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8',
      })
    expect(run).not.toThrow()
  }, 20000)
})

describe('插图排版约束', () => {
  const files = readdirSync(resolve(process.cwd(), FIGDIR)).filter((f) => f.endsWith('.vue'))

  it('画布宽度统一为 340（版式一致，便于按列宽估算文字）', () => {
    const bad = []
    for (const f of files) {
      const src = readFileSync(resolve(process.cwd(), FIGDIR, f), 'utf8')
      const svg = src.match(/<svg[^>]*viewBox="([^"]+)"/)
      if (!svg) continue
      const [, , w] = svg[1].split(/[\s,]+/).map(Number)
      if (w !== 340) bad.push(`${f}: ${w}`)
    }
    expect(bad).toEqual([])
  })

  it('字号不低于 7px（再小手机上完全没救了，正是要避免的方向）', () => {
    const tooSmall = []
    for (const f of files) {
      const src = readFileSync(resolve(process.cwd(), FIGDIR, f), 'utf8')
      for (const m of src.matchAll(/font-size="([\d.]+)"/g)) {
        if (Number(m[1]) < 7) tooSmall.push(`${f}: ${m[1]}px`)
      }
    }
    expect(tooSmall).toEqual([])
  })
})
