import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 早期题目 id 迁移（1–119 → 各分类编号段）。
 *
 * 背景：学习记录按 id 存 localStorage，题库重编号后若不改写，
 * 老用户在这 119 题上的进度会变成「未知 id」而退出统计。
 */

const store = new Map()

beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
  vi.resetModules()
})

async function load() {
  const mod = await import('@/utils/idMigration.js')
  const { STORAGE_KEYS } = await import('@/utils/constants.js')
  return { ...mod, STORAGE_KEYS }
}

describe('migrateEarlyIds', () => {
  it('把旧记录的键改写为新 id', async () => {
    const { migrateEarlyIds, STORAGE_KEYS } = await load()
    // 旧 id 1 (Linux基础) 与新 id 4115；旧 id 66 (安全) → 5320
    store.set(STORAGE_KEYS.RECORDS, JSON.stringify({ 1: { status: 'mastered', times: 3 }, 66: { times: 1 } }))

    const r = migrateEarlyIds()
    expect(r.migrated).toBe(true)
    expect(r.records).toBe(2)

    const after = JSON.parse(store.get(STORAGE_KEYS.RECORDS))
    expect(after['4115']).toEqual({ status: 'mastered', times: 3 })
    expect(after['5320']).toEqual({ times: 1 })
    expect(after['1']).toBeUndefined()
    expect(after['66']).toBeUndefined()
  })

  it('收藏数组里的旧 id 也被改写并去重', async () => {
    const { migrateEarlyIds, STORAGE_KEYS } = await load()
    store.set(STORAGE_KEYS.FAVORITES, JSON.stringify([1, 4115, 66]))

    const r = migrateEarlyIds()
    expect(r.favorites).toBe(2)

    const after = JSON.parse(store.get(STORAGE_KEYS.FAVORITES))
    expect(after).toEqual([4115, 5320])
  })

  it('不碰非早期 id（新段已有的记录保持原样）', async () => {
    const { migrateEarlyIds, STORAGE_KEYS } = await load()
    store.set(STORAGE_KEYS.RECORDS, JSON.stringify({ 1000: { times: 2 }, 5602: { times: 1 } }))

    const r = migrateEarlyIds()
    expect(r.records).toBe(0)
    expect(JSON.parse(store.get(STORAGE_KEYS.RECORDS))).toEqual({ 1000: { times: 2 }, 5602: { times: 1 } })
  })

  it('幂等：第二次调用不做任何改写', async () => {
    const { migrateEarlyIds, STORAGE_KEYS } = await load()
    store.set(STORAGE_KEYS.RECORDS, JSON.stringify({ 1: { times: 3 } }))

    const first = migrateEarlyIds()
    expect(first.migrated).toBe(true)

    const second = migrateEarlyIds()
    expect(second.migrated).toBe(false)
    expect(second.records).toBe(0)

    const after = JSON.parse(store.get(STORAGE_KEYS.RECORDS))
    expect(after['4115']).toEqual({ times: 3 })
  })

  it('存储为空时不报错', async () => {
    const { migrateEarlyIds } = await load()
    const r = migrateEarlyIds()
    expect(r.migrated).toBe(true)
    expect(r.records).toBe(0)
    expect(r.favorites).toBe(0)
  })
})
