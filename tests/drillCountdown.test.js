import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { DAILY_DRILL_LIMIT_SEC } from '@/utils/constants'

/**
 * 每日一刷的限时倒计时。
 *
 * 三条规则：
 * 1. 只有每日一刷显示倒计时（普通刷题/错题复习不显示）；
 * 2. 剩余 ≤1 分钟转告警色；
 * 3. 到点**自动交卷**，且未答题按错计入分母（否则「只答一半还全对」= 100%）。
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

const FIXTURE = [mk(11, 'c1'), mk(12, 'c2'), mk(13, 'c3')]

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

async function mountPractice(query) {
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

beforeEach(() => {
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
  if (mounted) {
    mounted.unmount()
    mounted = null
  }
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('每日一刷 · 倒计时显示', () => {
  it('进入后顶部出现倒计时，初始为 20:00', async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    const el = wrapper.find('.ptop__countdown')
    expect(el.exists()).toBe(true)
    expect(el.text()).toContain('20:00')
  })

  it('普通刷题不显示倒计时', async () => {
    const { wrapper } = await mountPractice({ mode: 'sequential' })
    // 先点「做题模式」进入答题
    const btn = wrapper.findAll('.picker__btn')[0]
    if (btn) await btn.trigger('click')
    await flushPromises()
    expect(wrapper.find('.ptop__countdown').exists()).toBe(false)
  })

  it('每日复习也显示倒计时（与每日一刷同流程）', async () => {
    /**
     * 2026-11：每日复习从「普通练习」升级为「限时自测」，
     * 与每日一刷共用倒计时 / 交卷 / 结果页。
     * 早先这条用例断言「错题复习不显示倒计时」——那个前提已被推翻。
     */
    const { wrapper } = await mountPractice({ review: 'wrong' })
    expect(wrapper.find('.ptop__countdown').exists()).toBe(true)
    expect(wrapper.find('.ptop__countdown').text()).toContain('20:00')
  })

  it('倒计时每秒递减', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    expect(wrapper.find('.ptop__countdown').text()).toContain('20:00')

    await vi.advanceTimersByTimeAsync(1000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ptop__countdown').text()).toContain('19:59')

    await vi.advanceTimersByTimeAsync(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ptop__countdown').text()).toContain('19:57')
  })

  it('剩余 ≤1 分钟时加告警样式', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })

    await vi.advanceTimersByTimeAsync((DAILY_DRILL_LIMIT_SEC - 30) * 1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ptop__countdown').text()).toContain('00:30')
    expect(wrapper.find('.ptop__countdown--urgent').exists()).toBe(true)
  })
})

describe('每日一刷 · 超时自动交卷', () => {
  it('时间到自动进入成绩单，并标注超时', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })

    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.find('.done').exists()).toBe(true)
    expect(wrapper.find('.done__timeout').exists()).toBe(true)
    // 倒计时随交卷消失
    expect(wrapper.find('.ptop__countdown').exists()).toBe(false)
  })

  it('超时未答的题按错计入分母（不能因少答而虚高正确率）', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })

    // 只答对 1 题
    await wrapper.findAll('.option')[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 直接跳到时间结束
    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    const cells = wrapper.findAll('.score__cell')
    expect(cells).toHaveLength(3)
    // 只答 1 题且答对：正确率应是 33%（1/3），而不是 100%
    expect(cells[0].text()).toContain('33')
    expect(cells[1].text()).toContain('1/3')
  })
})


describe('每日复习 · 与每日一刷同流程', () => {
  /**
   * 2026-11：每日复习从「普通练习」升级为「限时自测」，
   * 与每日一刷共用倒计时 / 交卷 / 结果页 / 离开确认。
   * 区别只在题来源（错题本 vs 全库）与题量（两者都是 30 题）。
   */
  it('每日复习也限时 20 分钟', async () => {
    const { wrapper } = await mountPractice({ review: 'wrong' })
    const el = wrapper.find('.ptop__countdown')
    expect(el.exists()).toBe(true)
    expect(el.text()).toContain('20:00')
  })

  it('每日复习超时自动交卷并出结果页', async () => {
    /**
     * 与每日一刷同款：超时即交卷，已答的计入、未答的算错。
     * 这里只答 1 题就等超时，验证结果页出现。
     *
     * 注意：每日复习从**错题本**抽题，所以必须先造几道错题，
     * 否则队列为空、连选项都渲染不出来。
     */
    vi.useFakeTimers()
    const bank = useBankStore()
    const study = useStudyStore()
    // 每日复习从错题本抽题，先造几道错题，否则队列为空
    bank.questions.filter((q) => q.type !== 'short').forEach((q) => study.markUnknown(q.id))

    const { wrapper } = await mountPractice({ review: 'wrong' })

    await wrapper.findAll('.option')[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.findAll('.score__cell')).toHaveLength(3)
    vi.useRealTimers()
  })
})

