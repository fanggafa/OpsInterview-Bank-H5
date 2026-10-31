import { describe, expect, it, beforeAll } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { stripAfterBuild } from '../scripts/vite-plugin-strip-data.mjs'

/**
 * 部署产物的数据体积守卫。
 *
 * 为什么需要：运行时已改用「索引 + 分片」，而 public/data/questions.json（4.3 MB）
 * 只用于编辑期。它一旦重新被拷进 dist，部署体积会翻倍 —— 这个测试守住它。
 */

describe('构建产物：源数据不应被部署', () => {
  it('stripAfterBuild 能删掉指定文件并报告体积', () => {
    // 造一个临时 dist 目录，不要碰真实构建产物
    const dir = mkdtempSync(join(tmpdir(), 'strip-'))
    mkdirSync(join(dir, 'data'), { recursive: true })
    const f = join(dir, 'data', 'questions.json')
    writeFileSync(f, 'x'.repeat(2048), 'utf8')

    const removed = stripAfterBuild(['data/questions.json'], dir)
    expect(removed).toHaveLength(1)
    expect(removed[0].path).toBe('data/questions.json')
    expect(removed[0].kb).toBe(2)
    expect(existsSync(f)).toBe(false)
  })

  it('文件不存在时不报错（幂等）', () => {
    const dir = mkdtempSync(join(tmpdir(), 'strip2-'))
    const removed = stripAfterBuild(['data/not-there.json'], dir)
    expect(removed).toEqual([])
  })

  it('vite 配置里挂了 stripSourceData 插件，且剔除目标是 questions.json', () => {
    const cfg = readFileSync('vite.config.js', 'utf8')
    expect(cfg).toContain('stripSourceData')
    const plugin = readFileSync('scripts/vite-plugin-strip-data.mjs', 'utf8')
    expect(plugin).toContain("'data/questions.json'")
  })

  it('运行时源码里不再有 fetch(data/questions.json) 之类的请求', () => {
    // 扫描 src，确认没有 URL 常量指向 questions.json
    const bad = []
    const walk = (d) => {
      for (const name of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, name.name)
        if (name.isDirectory()) walk(p)
        else if (/\.(js|vue)$/.test(name.name)) {
          const src = readFileSync(p, 'utf8')
          // 只关心「拼成 URL 并 fetch」的模式
          if (/DATA_URL\s*=\s*`[^`]*questions\.json`/.test(src)) bad.push(p)
        }
      }
    }
    walk('src')
    expect(bad).toEqual([])
  })
})
