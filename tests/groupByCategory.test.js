import { describe, expect, it } from 'vitest'
import { groupByCategory } from '@/utils/groupByCategory'
import { CATEGORIES } from '@/utils/constants'

/**
 * 按分类分组的纯函数。
 *
 * 它是「错题本 / 我的收藏」两个页面共用的分组规则 ——
 * 组顺序必须与题库页的分类筛选顺序一致（`CATEGORIES` 的业务优先级），
 * 这样用户在不同页面看到的分类排列才不会跳来跳去。
 */

const mk = (id, category, extra = {}) => ({
  id,
  type: 'short',
  category,
  difficulty: '中等',
  question: `q${id}`,
  answer: 'a',
  frequency: '中频',
  ...extra,
})

describe('groupByCategory', () => {
  it('空列表返回空数组', () => {
    expect(groupByCategory([])).toEqual([])
    expect(groupByCategory(null)).toEqual([])
    expect(groupByCategory(undefined)).toEqual([])
  })

  it('把同一分类的题聚成一组，并给出每题数', () => {
    const list = [mk(1, 'MySQL'), mk(2, 'MySQL'), mk(3, 'Redis')]
    const groups = groupByCategory(list)
    expect(groups).toHaveLength(2)
    // CATEGORIES 里 Redis(9) 排在 MySQL(10) 前面 —— 所以 Redis 组在前
    expect(groups[0].category).toBe('Redis')
    expect(groups[0].count).toBe(1)
    expect(groups[1].category).toBe('MySQL')
    expect(groups[1].count).toBe(2)
  })

  it('组顺序跟随 CATEGORIES，而不是题目出现顺序', () => {
    // 故意让 Redis 先出现，但它在 CATEGORIES 里比 MySQL 靠前
    const list = [mk(1, 'Redis'), mk(2, 'MySQL'), mk(3, 'Linux基础')]
    const groups = groupByCategory(list)
    // CATEGORIES 顺序：Linux基础(0) → Redis(9) → MySQL(10)
    expect(groups.map((g) => g.category)).toEqual(['Linux基础', 'Redis', 'MySQL'])
  })

  it('组内保持调用方传入的顺序（收藏按时间倒序、错题按入本顺序）', () => {
    const list = [mk(9, 'MySQL'), mk(3, 'MySQL'), mk(7, 'MySQL')]
    const groups = groupByCategory(list)
    expect(groups[0].items.map((q) => q.id)).toEqual([9, 3, 7])
  })

  it('不丢题：所有分组的题数之和等于总数', () => {
    const list = [mk(1, 'MySQL'), mk(2, 'Nginx'), mk(3, 'MySQL'), mk(4, 'DNS')]
    const groups = groupByCategory(list)
    const total = groups.reduce((sum, g) => sum + g.count, 0)
    expect(total).toBe(list.length)
  })

  it('不在 CATEGORIES 里的分类排在最后（不静默丢掉）', () => {
    const list = [mk(1, '新分类'), mk(2, 'MySQL')]
    const groups = groupByCategory(list)
    expect(groups.map((g) => g.category)).toEqual(['MySQL', '新分类'])
  })

  it('题缺 category 时归入「未分类」，不抛错', () => {
    const list = [mk(1, undefined), mk(2, '')]
    const groups = groupByCategory(list)
    expect(groups).toHaveLength(1)
    expect(groups[0].category).toBe('未分类')
    expect(groups[0].count).toBe(2)
  })

  it('覆盖 CATEGORIES 全部已知分类时，顺序与 CATEGORIES 完全一致', () => {
    const list = CATEGORIES.map((c, i) => mk(i + 1, c))
    const groups = groupByCategory(list)
    expect(groups.map((g) => g.category)).toEqual(CATEGORIES)
  })
})
