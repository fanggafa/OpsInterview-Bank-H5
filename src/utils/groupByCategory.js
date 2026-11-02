/**
 * 按分类分组的纯函数。
 *
 * 列表页（错题本 / 我的收藏）原来是平铺一堆卡片，用户反馈「都没分类」——
 * 找不到想复习的那一类，只能一页页翻。这里把同一分类的题聚成一组，
 * 组的顺序复用 `CATEGORIES` 的业务优先级（与题库页筛选顺序一致），
 * 组内保持调用方传进来的顺序（收藏按时间倒序、错题按入本顺序）。
 *
 * 为什么要单独抽成纯函数：两个页面都要用同一套分组规则，
 * 逻辑分散在两处迟早会不一致；也让分组顺序这件事能被测试直接验证。
 */

import { CATEGORIES } from '@/utils/constants'

/**
 * @param {Array} list 题目数组（每项需有 category 字段）
 * @returns {Array<{ category: string, items: Array, count: number }>}
 *   按 `CATEGORIES` 顺序排列；不在 `CATEGORIES` 里的分类排在最后（按出现顺序），
 *   避免新增分类还没登记时题被静默丢掉。
 */
export function groupByCategory(list) {
  const items = Array.isArray(list) ? list : []
  if (!items.length) return []

  const buckets = new Map()
  for (const q of items) {
    const category = q && q.category ? q.category : '未分类'
    if (!buckets.has(category)) buckets.set(category, [])
    buckets.get(category).push(q)
  }

  // 已知分类按 CATEGORIES 的业务顺序；未知分类按首次出现顺序接在后面
  const known = CATEGORIES.filter((c) => buckets.has(c))
  const unknown = Array.from(buckets.keys()).filter((c) => !CATEGORIES.includes(c))

  return [...known, ...unknown].map((category) => ({
    category,
    items: buckets.get(category),
    count: buckets.get(category).length,
  }))
}
