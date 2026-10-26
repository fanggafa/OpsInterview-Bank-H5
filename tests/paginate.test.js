import { describe, expect, it } from 'vitest'
import { clampPage, pageCount, pageMeta, paginate, parsePage } from '@/utils/paginate'

describe('pageCount', () => {
  it('正常向上取整', () => {
    expect(pageCount(119, 20)).toBe(6)
    expect(pageCount(40, 20)).toBe(2)
    expect(pageCount(20, 20)).toBe(1)
  })

  it('不足一页也算 1 页', () => {
    expect(pageCount(1, 20)).toBe(1)
    expect(pageCount(19, 20)).toBe(1)
  })

  it('空列表返回 1 页（用于展示空状态）', () => {
    expect(pageCount(0, 20)).toBe(1)
    expect(pageCount(-5, 20)).toBe(1)
    expect(pageCount(NaN, 20)).toBe(1)
  })
})

describe('clampPage', () => {
  it('合法页码原样返回', () => {
    expect(clampPage(2, 119, 20)).toBe(2)
    expect(clampPage(6, 119, 20)).toBe(6)
  })

  it('小于 1 归一到第 1 页', () => {
    expect(clampPage(0, 119, 20)).toBe(1)
    expect(clampPage(-3, 119, 20)).toBe(1)
  })

  it('超过总页数归一到末页', () => {
    expect(clampPage(99, 119, 20)).toBe(6)
  })

  it('非法值回退第 1 页', () => {
    expect(clampPage('abc', 119, 20)).toBe(1)
    expect(clampPage(null, 119, 20)).toBe(1)
    expect(clampPage(undefined, 119, 20)).toBe(1)
  })

  it('小数向下取整', () => {
    expect(clampPage(2.9, 119, 20)).toBe(2)
  })
})

describe('paginate', () => {
  const list = Array.from({ length: 45 }, (_, i) => i + 1)

  it('第 1 页取前 20 条', () => {
    expect(paginate(list, 1, 20)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  it('第 2 页取 21-40', () => {
    const page2 = paginate(list, 2, 20)
    expect(page2[0]).toBe(21)
    expect(page2[19]).toBe(40)
  })

  it('末页只取剩余条目', () => {
    expect(paginate(list, 3, 20)).toEqual([41, 42, 43, 44, 45])
  })

  it('越界页码自动收敛到末页', () => {
    expect(paginate(list, 99, 20)).toEqual([41, 42, 43, 44, 45])
  })

  it('空列表返回空数组', () => {
    expect(paginate([], 1, 20)).toEqual([])
  })

  it('非数组入参返回空数组', () => {
    expect(paginate(null, 1, 20)).toEqual([])
  })

  it('不修改原数组', () => {
    const copy = list.slice()
    paginate(list, 2, 20)
    expect(list).toEqual(copy)
  })
})

describe('pageMeta', () => {
  it('首页的上下页状态', () => {
    const m = pageMeta(119, 1, 20)
    expect(m).toMatchObject({
      page: 1,
      pageCount: 6,
      total: 119,
      from: 1,
      to: 20,
      hasPrev: false,
      hasNext: true,
      visible: true,
    })
  })

  it('中间页两侧都可用', () => {
    const m = pageMeta(119, 3, 20)
    expect(m.hasPrev).toBe(true)
    expect(m.hasNext).toBe(true)
    expect(m.from).toBe(41)
    expect(m.to).toBe(60)
  })

  it('末页的区间与按钮状态', () => {
    const m = pageMeta(119, 6, 20)
    expect(m.page).toBe(6)
    expect(m.from).toBe(101)
    expect(m.to).toBe(119)
    expect(m.hasNext).toBe(false)
    expect(m.hasPrev).toBe(true)
  })

  it('只有一页时不显示分页控件', () => {
    const m = pageMeta(15, 1, 20)
    expect(m.pageCount).toBe(1)
    expect(m.visible).toBe(false)
    expect(m.hasPrev).toBe(false)
    expect(m.hasNext).toBe(false)
  })

  it('恰好一整页时也不显示控件', () => {
    const m = pageMeta(20, 1, 20)
    expect(m.visible).toBe(false)
  })

  it('空列表时可见性为 false 且区间为 0-0', () => {
    const m = pageMeta(0, 1, 20)
    expect(m.visible).toBe(false)
    expect(m.total).toBe(0)
    expect(m.from).toBe(0)
    expect(m.to).toBe(0)
  })

  it('越界页码自动收敛', () => {
    expect(pageMeta(119, 999, 20).page).toBe(6)
    expect(pageMeta(119, 0, 20).page).toBe(1)
  })
})

describe('parsePage', () => {
  it('合法页码解析为数字', () => {
    expect(parsePage({ page: '3' })).toBe(3)
    expect(parsePage({ page: 2 })).toBe(2)
  })

  it('缺省或非法值回退 1', () => {
    expect(parsePage({})).toBe(1)
    expect(parsePage({ page: 'abc' })).toBe(1)
    expect(parsePage({ page: '0' })).toBe(1)
    expect(parsePage({ page: '-2' })).toBe(1)
    expect(parsePage(undefined)).toBe(1)
  })
})
