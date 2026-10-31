import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

/**
 * 分片数据（索引 + 按分类答案分片）的一致性测试。
 *
 * 为什么需要：分片是「同一份题库的另一种组织方式」，一旦生成脚本和题库脱节，
 * 就会出现「列表有题、点进去没答案」这类问题。这里直接比对索引与分片能否
 * 还原出 questions.json 的全部内容。
 */

const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

const bank = JSON.parse(read('public/data/questions.json'))
const index = JSON.parse(read('public/data/questions-index.json'))
const manifest = JSON.parse(read('public/data/answers/manifest.json'))

describe('分片数据一致性', () => {
  it('索引条数等于题库条数', () => {
    expect(index.length).toBe(bank.length)
  })

  it('索引里每道题的字段与题库一致（id/type/category/difficulty/frequency/question）', () => {
    const byId = new Map(bank.map((q) => [q.id, q]))
    const bad = []
    for (const row of index) {
      const q = byId.get(row.i)
      if (!q) {
        bad.push(`id ${row.i} 在题库里不存在`)
        continue
      }
      if (row.c !== q.category) bad.push(`id ${row.i} 分类不一致`)
      if (row.d !== q.difficulty) bad.push(`id ${row.i} 难度不一致`)
      if (row.q !== q.question) bad.push(`id ${row.i} 题干不一致`)
      const expectType = q.type || 'short'
      if (row.t !== expectType) bad.push(`id ${row.i} 题型不一致`)
    }
    expect(bad).toEqual([])
  })

  it('答案分片覆盖全部题目，且 answer 与题库一致', () => {
    const byId = new Map(bank.map((q) => [q.id, q]))
    const seen = new Set()
    const bad = []

    for (const [cat, meta] of Object.entries(manifest)) {
      const rows = JSON.parse(read(`public/data/answers/${meta.slug}.json`))
      expect(rows.length).toBe(meta.count)
      for (const r of rows) {
        seen.add(r.i)
        const q = byId.get(r.i)
        if (!q) {
          bad.push(`id ${r.i} 在题库里不存在`)
          continue
        }
        if (typeof r.a === 'string') {
          if (r.a !== q.answer) bad.push(`id ${r.i} 答案不一致（${cat}）`)
        } else if (JSON.stringify(r.a) !== JSON.stringify(q.answer)) {
          bad.push(`id ${r.i} 答案数组不一致（${cat}）`)
        }
      }
    }

    expect(bad).toEqual([])
    expect(seen.size).toBe(bank.length)
  })

  it('每个分类都有 slug，且文件名不含中文（URL 安全）', () => {
    for (const [cat, meta] of Object.entries(manifest)) {
      expect(meta.slug).toMatch(/^[a-z0-9-]+$/)
      // 确认真实存在
      expect(() => read(`public/data/answers/${meta.slug}.json`)).not.toThrow()
    }
  })

  it('分片体积不超过「索引 + 最大分片」的首屏预算（gzip 220 KB）', () => {
    // 用 Node 的 zlib 实测，确保拆分真的带来了体积收益
    const idxGz = gzipSync(readFileSync(resolve(process.cwd(), 'public/data/questions-index.json'))).length
    let maxShardGz = 0
    for (const meta of Object.values(manifest)) {
      const buf = readFileSync(resolve(process.cwd(), `public/data/answers/${meta.slug}.json`))
      maxShardGz = Math.max(maxShardGz, gzipSync(buf).length)
    }
    const worst = (idxGz + maxShardGz) / 1024
    console.log(`[体积] 索引 gzip ${(idxGz / 1024).toFixed(0)} KB，最大分片 gzip ${(maxShardGz / 1024).toFixed(0)} KB，最坏 ${worst.toFixed(0)} KB`)
    expect(worst).toBeLessThan(220)
  })
})
