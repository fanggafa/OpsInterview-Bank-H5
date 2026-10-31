import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'

/**
 * 加载失败后的重试退避 + 请求超时。
 *
 * 为什么要测：错误态里有「重试」按钮，用户会连点；退避必须真的生效，
 * 否则弱网下几十个并发请求会把本就吃力的带宽彻底打满。
 *
 * 做法：mock `@/api/dataService` 让 fetchIndex 可控地失败/成功，
 * 然后驱动真实的 bankStore.loadIndex()，断言退避状态的变化。
 */

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('bankStore · 重试退避（mock dataService 驱动真实 loadIndex）', () => {
  let bank
  let useBankStore
  let DataError

  beforeEach(async () => {
    vi.resetModules()

    // 用可切换行为的 fetchIndex 替身
    const state = { fail: null }
    vi.doMock('@/api/dataService', () => {
      class DE extends Error {
        constructor(msg, cause, meta = {}) {
          super(msg)
          this.name = 'DataError'
          this.retryable = meta.retryable !== false
          this.timeout = Boolean(meta.timeout)
        }
      }
      return {
        DataError: DE,
        fetchIndex: vi.fn(async () => {
          if (state.fail) throw state.fail
          return [{ id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', frequency: '高频', question: 'q', tags: [] }]
        }),
        fetchAnswerShard: vi.fn(async () => []),
        fetchAnswersManifest: vi.fn(async () => ({})),
        hydrateAnswers: vi.fn(async (rows) => rows),
        fetchAllSharded: vi.fn(async () => []),
        clearCache: vi.fn(),
      }
    })

    const pinia = await import('pinia')
    pinia.setActivePinia(pinia.createPinia())
    const storeMod = await import('@/stores/bankStore')
    useBankStore = storeMod.useBankStore
    const ds = await import('@/api/dataService')
    DataError = ds.DataError
    bank = useBankStore()
    bank.__state = state
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} }
  })

  afterEach(() => {
    vi.doUnmock('@/api/dataService')
    vi.restoreAllMocks()
  })

  it('失败一次 → retryAttempt=1、冷却 1 秒、可重试', async () => {
    bank.__state.fail = new DataError('网络异常', undefined, { retryable: true })
    await bank.loadIndex(true).catch(() => {})
    expect(bank.error).toBeTruthy()
    expect(bank.retryAttempt).toBe(1)
    expect(bank.retryAfterMs).toBe(1000)
    expect(bank.inCooldown).toBe(true)
    expect(bank.canRetry).toBe(true)
  })

  it('连续失败 → 间隔指数递增（1s → 2s → 4s）', async () => {
    bank.__state.fail = new DataError('网络异常', undefined, { retryable: true })
    await bank.loadIndex(true).catch(() => {})
    expect(bank.retryAfterMs).toBe(1000)

    await bank.loadIndex(true).catch(() => {})
    expect(bank.retryAfterMs).toBe(2000)

    await bank.loadIndex(true).catch(() => {})
    expect(bank.retryAfterMs).toBe(4000)
  })

  it('成功一次 → 退避清零', async () => {
    bank.__state.fail = new DataError('网络异常', undefined, { retryable: true })
    await bank.loadIndex(true).catch(() => {})
    expect(bank.retryAttempt).toBe(1)

    bank.__state.fail = null
    await bank.loadIndex(true)
    expect(bank.retryAttempt).toBe(0)
    expect(bank.retryAfterMs).toBe(0)
    expect(bank.inCooldown).toBe(false)
  })

  it('连续失败到第 5 次时封顶在 15 秒（不会无限增长）', async () => {
    bank.__state.fail = new DataError('网络异常', undefined, { retryable: true })
    for (let i = 0; i < 6; i++) {
      await bank.loadIndex(true).catch(() => {})
    }
    expect(bank.retryAttempt).toBe(6)
    // 真实 store 算出来的间隔应是 15s 封顶（未封顶会是 32s）
    expect(bank.retryAfterMs).toBe(15000)
  })

  it('不可重试的失败 → 不设冷却，canRetry 为 false', async () => {
    bank.__state.fail = new DataError('索引格式错误', undefined, { retryable: false })
    await bank.loadIndex(true).catch(() => {})
    expect(bank.retryAttempt).toBe(1)
    expect(bank.retryAfterMs).toBe(0) // 冷却没用，不给
    expect(bank.inCooldown).toBe(false)
    expect(bank.canRetry).toBe(false)
  })

  it('超时错误 → 文案体现「超时」且可重试', async () => {
    bank.__state.fail = new DataError('题库索引请求超时（超过 15 秒），请检查网络后重试', undefined, {
      retryable: true,
      timeout: true,
    })
    await bank.loadIndex(true).catch(() => {})
    expect(bank.error).toContain('超时')
    expect(bank.canRetry).toBe(true)
  })
})
