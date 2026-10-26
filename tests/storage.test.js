import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetPending,
  bindFlushOnHide,
  flushAll,
  isQuotaError,
  isStorageAvailable,
  readJSON,
  safeRemove,
  writeJSON,
  writeJSONThrottled,
} from '@/utils/storage'

beforeEach(() => {
  localStorage.clear()
  __resetPending()
  vi.useRealTimers()
})

describe('isStorageAvailable', () => {
  it('正常环境下可用', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('setItem 抛错时判定为不可用', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(isStorageAvailable()).toBe(false)
    spy.mockRestore()
  })
})

describe('readJSON', () => {
  it('缺失 key 返回 fallback', () => {
    expect(readJSON('oi_missing', { a: 1 })).toEqual({ a: 1 })
  })

  it('返回 fallback 的深拷贝，互不影响', () => {
    const fallback = { list: [] }
    const first = readJSON('oi_missing', fallback)
    first.list.push(1)
    expect(fallback.list).toEqual([])
  })

  it('正常 JSON 可读取', () => {
    localStorage.setItem('oi_x', JSON.stringify([1, 2]))
    expect(readJSON('oi_x', [])).toEqual([1, 2])
  })

  it('损坏 JSON 回退默认值并清理脏数据', () => {
    localStorage.setItem('oi_bad', '{not json')
    expect(readJSON('oi_bad', [])).toEqual([])
    expect(localStorage.getItem('oi_bad')).toBeNull()
  })

  it('类型守卫不通过时清理并回退', () => {
    localStorage.setItem('oi_wrong', JSON.stringify({ theme: 123 }))
    const validate = (v) => v && typeof v.theme === 'string'
    expect(readJSON('oi_wrong', { theme: 'system' }, validate)).toEqual({ theme: 'system' })
    expect(localStorage.getItem('oi_wrong')).toBeNull()
  })

  it('空字符串视为缺失', () => {
    localStorage.setItem('oi_empty', '')
    expect(readJSON('oi_empty', { ok: true })).toEqual({ ok: true })
  })
})

describe('writeJSON', () => {
  it('写入成功返回 true', () => {
    expect(writeJSON('oi_a', { n: 1 })).toBe(true)
    expect(JSON.parse(localStorage.getItem('oi_a'))).toEqual({ n: 1 })
  })

  it('配额超限返回 false 且不抛错', () => {
    const err = new Error('quota')
    err.name = 'QuotaExceededError'
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw err
    })
    expect(writeJSON('oi_a', { n: 1 })).toBe(false)
    spy.mockRestore()
  })
})

describe('isQuotaError', () => {
  it('识别常见配额错误', () => {
    const e1 = new Error('x')
    e1.name = 'QuotaExceededError'
    expect(isQuotaError(e1)).toBe(true)
    expect(isQuotaError({ code: 22 })).toBe(true)
    expect(isQuotaError({ code: 1014 })).toBe(true)
    expect(isQuotaError(new Error('other'))).toBe(false)
    expect(isQuotaError(null)).toBe(false)
  })
})

describe('writeJSONThrottled / flushAll', () => {
  it('节流窗口内只落盘最后一次值', () => {
    vi.useFakeTimers()
    writeJSONThrottled('oi_t', { v: 1 })
    writeJSONThrottled('oi_t', { v: 2 })
    writeJSONThrottled('oi_t', { v: 3 })
    expect(localStorage.getItem('oi_t')).toBeNull()

    vi.advanceTimersByTime(250)
    expect(JSON.parse(localStorage.getItem('oi_t'))).toEqual({ v: 3 })
  })

  it('flushAll 立即落盘未到期数据', () => {
    vi.useFakeTimers()
    writeJSONThrottled('oi_f', { v: 'x' })
    flushAll()
    expect(JSON.parse(localStorage.getItem('oi_f'))).toEqual({ v: 'x' })
  })

  it('flushAll 后不再重复写入', () => {
    vi.useFakeTimers()
    writeJSONThrottled('oi_g', { v: 1 })
    flushAll()
    vi.advanceTimersByTime(500)
    expect(JSON.parse(localStorage.getItem('oi_g'))).toEqual({ v: 1 })
  })
})

describe('bindFlushOnHide', () => {
  it('pagehide 时强制落盘，解绑后不再响应', () => {
    vi.useFakeTimers()
    const unbind = bindFlushOnHide()

    writeJSONThrottled('oi_h', { v: 'a' })
    window.dispatchEvent(new Event('pagehide'))
    expect(JSON.parse(localStorage.getItem('oi_h'))).toEqual({ v: 'a' })

    localStorage.removeItem('oi_h')
    unbind()
    writeJSONThrottled('oi_h', { v: 'b' })
    window.dispatchEvent(new Event('pagehide'))
    expect(localStorage.getItem('oi_h')).toBeNull()
    vi.advanceTimersByTime(300)
  })
})

describe('safeRemove', () => {
  it('移除不存在的 key 不抛错', () => {
    expect(() => safeRemove('oi_none')).not.toThrow()
  })
})
