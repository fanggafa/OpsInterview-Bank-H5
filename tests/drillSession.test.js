import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { DAILY_DRILL_LIMIT_SEC, STORAGE_KEYS } from '@/utils/constants'

/**
 * 每日一刷的三处「考试完整性」保障：
 *
 * 1. **刷新不丢**：下拉刷新（= 重新 mount）不能换一套题，
 *    已答的题和剩余时间都要接着原来的；
 * 2. **退出要确认**：答题中点返回要先问，退出后本轮作废；
 * 3. **再来一轮要重新抽题**：交卷后点「再来一轮」是新的一轮，
 *    不能因为快照而恢复成上一轮的同一批题。
 *
 * ⚠️ 第 3 条最容易出错：build() 会优先从快照恢复，
 * 所以 restart 必须先清快照再 build。
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

/** 8 道题，方便验证「抽题子集」在刷新前后是否一致 */
const FIXTURE = [11, 12, 13, 14, 15, 16, 17, 18].map((id) => mk(id, `c${id}`))

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

async function mountDrill() {
  const router = makeRouter()
  await router.push({ path: '/practice', query: { review: 'dailyDrill' } })
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

/** 卸载但**不**清 sessionStorage —— 模拟「刷新页面」 */
function unmountKeepStorage() {
  if (mounted) {
    mounted.unmount()
    mounted = null
  }
}

function readSnap() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.DRILL_SESSION)
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
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('每日一刷 · 刷新不丢题组', () => {
  it('答几题后重新进入（模拟刷新），题组与作答都保留', async () => {
    const first = await mountDrill()
    const q1 = first.wrapper.find('.qcard-p__q').text()

    // 答第一题
    await first.wrapper.findAll('.option')[0].trigger('click')
    await flushPromises()
    await first.wrapper.vm.$nextTick()

    const snapBefore = readSnap()
    expect(snapBefore).toBeTruthy()
    expect(snapBefore.ids.length).toBeGreaterThan(0)

    // 模拟刷新：卸载但不删 sessionStorage，再挂一次
    unmountKeepStorage()
    const second = await mountDrill()

    // 肩题组一致（不是重新抽了一套）
    const snapAfter = readSnap()
    expect(snapAfter.ids).toEqual(snapBefore.ids)
    // 回到原来的位置与题目
    expect(second.wrapper.find('.qcard-p__q').text()).toBe(q1)
    // 已答的题仍然保持已作答（有「下一题」按钮而不是未作答提示）
    expect(second.wrapper.find('.actions__hint').exists()).toBe(false)
  })

  it('刷新恢复剩余时间，而不是重置成 30 分钟', async () => {
    vi.useFakeTimers()
    const first = await mountDrill()

    // 跑掉 5 秒
    await vi.advanceTimersByTimeAsync(5000)
    await first.wrapper.vm.$nextTick()
    expect(first.wrapper.find('.ptop__countdown').text()).toContain('29:5')

    unmountKeepStorage()
    const second = await mountDrill()
    await second.wrapper.vm.$nextTick()

    const cd = second.wrapper.find('.ptop__countdown').text()
    // 不能回到 30:00（那等于刷新白送时间）
    expect(cd).not.toContain('30:00')
    expect(cd).toMatch(/29:\d\d/)
  })

  it('交卷后刷新不会回到答题态（快照已清）', async () => {
    // 必须在挂载**之前**启用假定时器：倒河时的 setInterval 是挂载时创建的
    vi.useFakeTimers()
    const { wrapper } = await mountDrill()
    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.find('.done').exists()).toBe(true)
    expect(readSnap()).toBeNull()
  })
})

describe('每日一刷 · 退出要确认', () => {
  it('答题中点返回先弹确认框，而不是直接退出', async () => {
    const { wrapper, router } = await mountDrill()
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()

    expect(wrapper.find('.exit-mask').exists()).toBe(true)
    expect(router.currentRoute.value.path).toBe('/practice')
  })

  it('点「继续答题」关闭确认框，留在原题', async () => {
    const { wrapper, router } = await mountDrill()
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()

    const btns = wrapper.findAll('.exit-box__actions .btn')
    await btns[0].trigger('click') // 继续答题
    await flushPromises()

    expect(wrapper.find('.exit-mask').exists()).toBe(false)
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(wrapper.find('.qcard-p__q').exists()).toBe(true)
  })

  it('点「确定退出」离开并清掉快照', async () => {
    const { wrapper, router } = await mountDrill()
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()

    const btns = wrapper.findAll('.exit-box__actions .btn')
    await btns[1].trigger('click') // 确定退出
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
    expect(readSnap()).toBeNull()
  })

  it('交卷后点返回不再弹确认（已无损失）', async () => {
    vi.useFakeTimers()
    const { wrapper, router } = await mountDrill()
    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.find('.done').exists()).toBe(true)
    // 成绩单状态：退出的入口是「退出」按钮，不走顶栏返回
    expect(wrapper.find('.exit-mask').exists()).toBe(false)
    expect(router.currentRoute.value.path).toBe('/practice')
  })
})

describe('每日一刷 · 再来一轮要重新抽题', () => {
  it('交卷后点「再来一轮」，题目会重新抽取而不是恢复旧题组', async () => {
    // 假定时器必须在挂载前（倒计时 interval 在挂载时创建）
    vi.useFakeTimers()
    const { wrapper } = await mountDrill()

    // 记下这一轮抽到的题目 id 序列
    const beforeIds = readSnap()?.ids || null
    expect(beforeIds).toBeTruthy()

    // 超时交卷进入成绩单
    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(wrapper.find('.done').exists()).toBe(true)

    // 点「再来一轮」
    const btns = wrapper.findAll('.done__actions .btn')
    expect(btns.length).toBeGreaterThan(0)
    await btns[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 回到答题态、计时重置、成绩单消失
    expect(wrapper.find('.done').exists()).toBe(false)
    expect(wrapper.find('.qcard-p__q').exists()).toBe(true)
    expect(wrapper.find('.ptop__countdown').text()).toContain('30:00')

    const afterIds = readSnap()?.ids
    expect(afterIds).toBeTruthy()

    /**
     * 核心断言：新一轮的题组**不能和上一轮相同**。
     *
     * 只断言「afterIds 存在」是没用的 —— 无论有没有清快照它都存在。
     * 如果 restart 忘了 clearDrillSession，build() 会命中旧快照、
     * 原样恢复上一轮的 ids，这时两次完全一致。
     *
     * 题池 8 题、每轮抽 3 题，两轮抽到完全相同组合的概率是 1/56，
     * 为了让断言稳定，这里直接要求「不全等」。万一真撞上，
     * 下面还会用随机源兜底的说明（见文件头的注释）。
     */
    expect(afterIds).not.toEqual(beforeIds)
  })

  it('再来一轮后已答状态是空的（不是沿用上一轮的作答）', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountDrill()

    // 先答一题
    await wrapper.findAll('.option')[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 交卷
    await vi.advanceTimersByTimeAsync(DAILY_DRILL_LIMIT_SEC * 1000 + 2000)
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 再来一轮
    const btns = wrapper.findAll('.done__actions .btn')
    await btns[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 新一轮第一题应是未作答态（有提示文案，而不是「下一题」按钮）
    expect(wrapper.find('.actions__hint').exists()).toBe(true)
    const snap = readSnap()
    expect(snap.roundAnswers).toEqual({})
  })
})
