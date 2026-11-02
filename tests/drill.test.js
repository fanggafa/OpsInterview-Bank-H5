import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 每日一刷（review=dailyDrill）的行为约定。
 *
 * 三个用户实际提过的点：
 * 1. 答完 A 进 B、再回 A 时，A **不能**变回空白重做（状态要保留）；
 * 2. 答题过程中**不给看答案/解析**（自测边做边看就没有分数意义）；
 * 3. 交卷后给成绩单（正确率 / 答对题数 / 用时）+ 逐题回顾，能点回查看解析。
 *
 * ⚠️ 每日一刷是**随机抽题**，队列顺序不固定 —— 断言不能假设「第一题是 c1」，
 * 只能用「当前题目」这个变量来对比前后。
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

const FIXTURE = [mk(11, 'c1'), mk(12, 'c2'), mk(13, 'c3'), mk(14, 'c4'), mk(15, 'c5')]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/practice', component: PracticeView },
      { path: '/me', component: { template: '<div/>' } },
    ],
  })
}

let pinia

/**
 * 每个用例新建 wrapper，**用完必须卸载**。
 *
 * 不卸载的话，PracticeView 在 onMounted 里挂的 window keydown 监听会残留 ——
 * 下一个用例发键盘事件时，多个旧实例一起响应，题目会一次跳好几题
 * （表现为「前进一题却到了第 5 题」）。这是测试环境的坑，不是产品 bug。
 */
let mounted

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
  if (mounted) {
    mounted.unmount()
    mounted = null
  }
  document.body.innerHTML = ''
})

async function mountDrill() {
  const router = makeRouter()
  await router.push({ path: '/practice', query: { review: 'dailyDrill' } })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  mounted = wrapper // 交给 afterEach 卸载，避免 keydown 监听残留
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

const questionOf = (wrapper) => wrapper.find('.qcard-p__q').text()

/** 点当前题的正确选项（fixture 里答案都是 A，即第 1 个选项） */
async function answerCorrect(wrapper) {
  await wrapper.findAll('.option')[0].trigger('click')
  await flushPromises()
  await wrapper.vm.$nextTick()
}

/** 点「下一题 →」并推进切题动画（180ms） */
async function goNext(wrapper) {
  const btn = wrapper.findAll('.actions__submit')[0]
  if (!btn) return false
  await btn.trigger('click')
  await flushPromises()
  // goTo 用 setTimeout(180) 完成切题；测试里没有假定时器，直接等真实时间
  await new Promise((r) => setTimeout(r, 220))
  await wrapper.vm.$nextTick()
  await flushPromises()
  return true
}

describe('每日一刷 · 回看不重做（核心回归）', () => {
  it('答完当前题进下一题，再回上一题时仍是「已作答」状态', async () => {
    const { wrapper } = await mountDrill()

    const first = questionOf(wrapper)
    await answerCorrect(wrapper)
    // 答题中不给看答案，所以「有下一题按钮」本身就说明已作答
    expect(wrapper.findAll('.actions__submit').length).toBeGreaterThan(0)

    const wentNext = await goNext(wrapper)
    expect(wentNext).toBe(true)
    const second = questionOf(wrapper)
    // 随机抽题，但正常情况下应该是另一道题
    expect(second).not.toBe(first)

    // 回上一题
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await new Promise((r) => setTimeout(r, 220))
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 回到了第一题，且是「已作答」状态
    expect(questionOf(wrapper)).toBe(first)
    expect(wrapper.find('.actions__hint').exists()).toBe(false)
    expect(wrapper.findAll('.actions__submit').length).toBeGreaterThan(0)
  })

  it('回看已答题目时，所选选项仍在选中态', async () => {
    const { wrapper } = await mountDrill()

    const first = questionOf(wrapper)
    await answerCorrect(wrapper)
    await goNext(wrapper)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await new Promise((r) => setTimeout(r, 220))
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 回到了第一题
    expect(questionOf(wrapper)).toBe(first)
    // 选择被恢复（不是空白）
    expect(wrapper.findAll('.option--selected').length).toBeGreaterThan(0)
    // 且选项是禁用态（已判定的题不能再改）
    const opts = wrapper.findAll('.option')
    expect(opts[0].attributes('disabled')).toBeDefined()
  })
})

describe('每日一刷 · 答题中不给看答案', () => {
  it('答题过程中没有「看答案」按钮', async () => {
    const { wrapper } = await mountDrill()
    expect(wrapper.find('.qcard-p__toggle').exists()).toBe(false)
  })

  it('答题中判定后不显示「回答正确/错误」', async () => {
    const { wrapper } = await mountDrill()
    await answerCorrect(wrapper)
    expect(wrapper.find('.result').exists()).toBe(false)
  })

  it('答题中不显示解析', async () => {
    const { wrapper } = await mountDrill()
    await answerCorrect(wrapper)
    expect(wrapper.find('.explain').exists()).toBe(false)
  })
})

describe('每日一刷 · 交卷后的成绩单', () => {
  /** 从头答完整轮（保持不自触发下一题，直到最后一题） */
  async function finishAll(wrapper) {
    const total = 5
    for (let i = 0; i < total; i++) {
      await answerCorrect(wrapper)
      const isLast = wrapper.findAll('.actions__submit')[0]?.text().includes('完成本轮')
      await goNext(wrapper)
      if (isLast) break
    }
    await flushPromises()
    await wrapper.vm.$nextTick()
  }

  it('显示三栏：正确率 / 答对题数 / 用时', async () => {
    const { wrapper } = await mountDrill()
    await finishAll(wrapper)

    const cells = wrapper.findAll('.score__cell')
    expect(cells).toHaveLength(3)
    const all = cells.map((c) => c.text()).join(' ')
    expect(all).toContain('正确率')
    expect(all).toContain('答对题数')
    expect(all).toContain('用时')
    expect(wrapper.text()).toMatch(/\d{2}:\d{2}/)
  })

  it('全对时正确率 100%、答对 5/5', async () => {
    const { wrapper } = await mountDrill()
    await finishAll(wrapper)
    const cells = wrapper.findAll('.score__cell')
    expect(cells[0].text()).toContain('100')
    expect(cells[1].text()).toContain('5/5')
  })

  it('给出「退出」与「再来一轮」两个出口', async () => {
    const { wrapper } = await mountDrill()
    await finishAll(wrapper)
    const btns = wrapper.findAll('.done__actions .btn').map((b) => b.text())
    expect(btns.some((t) => t.includes('再来一轮'))).toBe(true)
    expect(btns.some((t) => t.includes('退出'))).toBe(true)
  })

  it('列出全部题目，点任意一行可回看解析（已解锁看答案）', async () => {
    const { wrapper } = await mountDrill()
    await finishAll(wrapper)

    const rows = wrapper.findAll('.rl__row')
    expect(rows).toHaveLength(5)

    await rows[0].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 交卷后看答案按钮出现（答题中是没有的）
    expect(wrapper.find('.qcard-p__toggle').exists()).toBe(true)
    // 底部换成「返回结果」
    expect(wrapper.text()).toContain('返回结果')
  })

  it('回顾后能回到结果页', async () => {
    const { wrapper } = await mountDrill()
    await finishAll(wrapper)

    await wrapper.findAll('.rl__row')[0].trigger('click')
    await flushPromises()
    await wrapper.find('.actions__submit').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.score__cell')).toHaveLength(3)
  })
})
