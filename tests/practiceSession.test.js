import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * 普通刷题页的「刷新不换题」。
 *
 * 用户原话：「刷题页面无论进哪个模式，在答题页面一刷新就自动返回到刷题页面了」，
 * 后续补充：「刷新题目变了你没修，至少保证当前题目刷新不会变成别的」。
 *
 * 两条要求都要覆盖：
 * 1. 刷新不退回「选择练习方式」；
 * 2. 刷新后**当前这道题不变**（随机模式下不能重新洗牌）。
 */

const mk = (id, q) => ({
  id,
  type: 'single',
  category: 'MySQL',
  difficulty: '中等',
  question: q,
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
  ],
  answer: ['A'],
  explanation: '解析文本够长了吧够长了吧',
  tags: ['t'],
  frequency: '中频',
})

const FIXTURE = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((id) => mk(id, `q${id}`))

let pinia
let mounted

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/practice', component: PracticeView },
    ],
  })
}

/** 挂载并（若 URL 带 started=1）自动进入答题态 */
async function mountPractice(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  mounted = wrapper
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

/** 按文字点「做题模式」/「背题模式」（按钮顺序不可靠，必须按文字找） */
async function pickMode(wrapper, keyword) {
  const btn = wrapper.findAll('.picker__btn').find((b) => b.text().includes(keyword))
  if (!btn) return false
  await btn.trigger('click')
  await flushPromises()
  await wrapper.vm.$nextTick()
  return true
}

async function pickPractice(wrapper) {
  return pickMode(wrapper, '做题模式')
}

/** 模拟刷新：卸载但保留 sessionStorage / localStorage，再按同一 URL 重挂 */
function unmountKeepStorage() {
  if (mounted) {
    mounted.unmount()
    mounted = null
  }
}

function readSnap() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.PRACTICE_SESSION)
  return raw ? JSON.parse(raw) : null
}

beforeEach(() => {
  vi.useRealTimers()
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  sessionStorage.clear()
  const bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  useStudyStore()
})

afterEach(() => {
  unmountKeepStorage()
  document.body.innerHTML = ''
})

describe('普通刷题 · 刷新停在答题页', () => {
  it('点做题模式后 URL 带 started=1，刷新后仍直接出题卡', async () => {
    const { wrapper, router } = await mountPractice()
    await pickPractice(wrapper)
    expect(wrapper.find('.ptop').exists()).toBe(true)
    // 开始答题后 URL 应带上 started=1
    expect(router.currentRoute.value.query.started).toBe('1')

    // 模拟刷新：按同一 URL 重挂
    unmountKeepStorage()
    const again = await mountPractice({ ...router.currentRoute.value.query, started: '1' })
    await flushPromises()

    expect(again.wrapper.find('.picker').exists()).toBe(false)
    expect(again.wrapper.find('.qcard-p').exists()).toBe(true)
  })

  it('背题模式同样刷新不回选择页', async () => {
    const { wrapper, router } = await mountPractice({ studyMode: 'memorize' })
    await pickMode(wrapper, '背题模式')
    expect(router.currentRoute.value.query.started).toBe('1')

    unmountKeepStorage()
    const again = await mountPractice({ ...router.currentRoute.value.query, started: '1' })
    await flushPromises()
    expect(again.wrapper.find('.picker').exists()).toBe(false)
    expect(again.wrapper.find('.qcard-p').exists()).toBe(true)
  })
})

describe('普通刷题 · 刷新题目不变（核心）', () => {
  it('随机模式下刷新，当前这道题不变、题组顺序不变', async () => {
    // 随机模式最容易暴露问题（每次 buildQueue 都会重新洗牌）
    const { wrapper, router } = await mountPractice({ mode: 'random' })
    await pickPractice(wrapper)

    const qBefore = wrapper.find('.qcard-p__q').text()
    const snapBefore = readSnap()
    expect(snapBefore).toBeTruthy()
    expect(snapBefore.ids.length).toBe(FIXTURE.length)

    unmountKeepStorage()
    const again = await mountPractice({ ...router.currentRoute.value.query, started: '1' })
    await flushPromises()

    const qAfter = again.wrapper.find('.qcard-p__q').text()
    // 关键断言：题目没变（不重新洗牌）
    expect(qAfter).toBe(qBefore)

    // 队列顺序也一致（整体 id 序列相同）
    const snapAfter = readSnap()
    expect(snapAfter.ids).toEqual(snapBefore.ids)
  })

  it('刷新后停在第几题保持一致（不是回到第一题）', async () => {
    const { wrapper, router } = await mountPractice({ mode: 'sequential' })
    await pickPractice(wrapper)

    // 前进两题（每次都重新取 DOM，切题后元素会重建）
    for (let i = 0; i < 2; i++) {
      const opt = wrapper.findAll('.option')[0]
      if (!opt) break
      await opt.trigger('click')
      await flushPromises()
      const next = wrapper.findAll('.actions__submit')[0]
      if (!next) break
      await next.trigger('click')
      await flushPromises()
      // 切题有 180ms 动画
      await new Promise((r) => setTimeout(r, 260))
      await wrapper.vm.$nextTick()
    }

    const before = wrapper.find('.ptop__count').text()
    const snapBefore = readSnap()
    // 前提：确实前进了（否则这条测试没意义）
    expect(snapBefore.cursor).toBeGreaterThan(0)

    unmountKeepStorage()
    /**
     * 重新挂载时**必须显式带上原来的 mode**。
     *
     * 早先写的是 `{ ...router.currentRoute.value.query, started: '1' }`，
     * 但旧 router 实例的 query 在卸载后可能已空 → mode 丢失 →
     * 归一化后回落成 random → 与快照的 sequential 不匹配 → 重抽换题。
     * 这是测试写法的问题，不是产品 bug（实测浏览器刷新时 URL 完整）。
     */
    const again = await mountPractice({ mode: 'sequential', started: '1' })
    await flushPromises()

    const after = again.wrapper.find('.ptop__count').text()
    // 位置保持一致（不回到第 1 题）
    expect(after).toBe(before)
    expect(readSnap().cursor).toBe(snapBefore.cursor)
  })

  it('换了分类（条件不一致）不应恢复旧快照', async () => {
    const { wrapper, router } = await mountPractice({ mode: 'random' })
    await pickPractice(wrapper)
    expect(readSnap()).toBeTruthy()

    unmountKeepStorage()
    // 换分类重新进入：快照的 category 与当前不一致 → 应重抽而不是恢复
    const other = await mountPractice({ mode: 'random', category: 'MySQL' })
    await pickPractice(other.wrapper)
    const snap = readSnap()
    expect(snap.category).toBe('MySQL')
  })
})
