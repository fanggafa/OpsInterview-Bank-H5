import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import HomeView from '@/views/HomeView.vue'
import WrongView from '@/views/WrongView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { REVIEW_SIZES, STATUS } from '@/utils/constants'

/**
 * 复习赛（每日复习 / 错题复习）。
 *
 * 用户需求：
 * - 首页加「每日复习」，点进去随机 15 题用来巩固学习
 * - 再加「错题复习」，从错题本抽 10 题来复习
 *
 * 与普通刷题的关键差别（也是这里要断言的点）：
 * - 直接出题，不经过「选择练习方式」
 * - 每次进入重新抽，不写断点进度
 * - 错题复习的题池就是错题本
 */

/**
 * 夹具：默认全部是选择题。
 *
 * 复习赛默认使用做题模式（practice），而该模式**只含选择题** ——
 * 所以简答题会被 byStudyMode 过滤掉，题池就是空的。
 * 需要验证「背题模式的复习」时用 SHORT_FIXTURE。
 */
const mk = (i, type = 'single', extra = {}) => ({
  id: i,
  type,
  category: 'Linux基础',
  difficulty: '中等',
  frequency: '高频',
  question: `题目 ${i}`,
  answer: ['A'],
  options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
  explanation: '解析文本够长了吧',
  tags: ['t'],
  ...extra,
})

const FIXTURE = Array.from({ length: 20 }, (_, i) => mk(i + 1))
/**
 * 简答题夹具（用于背题模式的复习赛）。
 *
 * 注意简答题的 answer 必须是**字符串**（选择题才是 key 数组），
 * 否则 PracticeView 会把数组传给 AnswerText，触发 prop 类型警告。
 */
const SHORT_FIXTURE = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  type: 'short',
  category: 'Linux基础',
  difficulty: '中等',
  frequency: '高频',
  question: `简答题 ${i + 1}`,
  answer: `答案 ${i + 1}`,
  tags: ['t'],
}))

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/practice', component: PracticeView },
      { path: '/wrong', component: WrongView },
      { path: '/question/:id', component: HomeView },
      { path: '/me', component: HomeView },
      { path: '/bank', component: HomeView },
    ],
  })
}

let pinia
let bank
let study

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  sessionStorage.clear()
  bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  bank.load = () => Promise.resolve(FIXTURE)
  study = useStudyStore()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

async function mountPractice(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

async function mountHome() {
  const router = makeRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(HomeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('复习赛 · 每日一刷', () => {
  it('带 review=dailyDrill 进来直接出题，不显示「选择练习方式」', async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    expect(wrapper.find('.picker').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
  })

  it(`抽 ${REVIEW_SIZES.dailyDrill} 题（题池足够时抽满 30）`, async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    const count = wrapper.find('.ptop__count').text()
    expect(count).toMatch(/\/ \d+ 题/)
  })

  it('顶栏显示「每日一刷」标题', async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    expect(wrapper.find('.ptop__review-title').text()).toBe('每日一刷')
  })

  it('复习赛不显示题目顺序与练习方式切换（这批题是抽出来的）', async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    expect(wrapper.find('.ptop__seg').exists()).toBe(false)
    expect(wrapper.find('.practice__mode-btn').exists()).toBe(false)
  })

  it('复习赛不写断点进度（进度保持为空）', async () => {
    const { wrapper } = await mountPractice({ review: 'dailyDrill' })
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()
    expect(study.progress).toBeNull()
  })

  it('复习赛返回：两个限时自测都要确认（答题中离开有损失）', async () => {
    /**
     * 2026-11：每日复习升级为「限时自测」，与每日一刷共用同一套流程，
     * 所以它也不再直接退出 —— 答题中离开会丢进度和剩余时间，需要确认。
     * 早先这条断言「只有错题复习直接回首页」，那个前提已被推翻。
     */
    const { wrapper } = await mountPractice({ review: 'wrong' })
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()
    // 不是直接跳走，而是弹确认
    expect(wrapper.text()).toContain('退出')
  })
})

describe('复习赛 · 错题复习', () => {
  it('题池就是错题本：抽题数量按错题本实际题数', async () => {
    // 只让 6 道题进错题本
    ;[1, 2, 3, 4, 5, 6].forEach((id) => study.markUnknown(id))
    const { wrapper } = await mountPractice({ review: 'wrong' })
    expect(wrapper.find('.ptop__review-title').text()).toBe('每日复习')
    expect(wrapper.find('.ptop__count').text()).toContain('/ 6 题')
  })

  it('错题超过 30 道时只抽 30 道', async () => {
    /**
     * 需要题池 > 30 才测得出「截断」。
     * FIXTURE 只有 20 题，这里补一批选择题进错题本。
     */
    bank.questions = [
      ...FIXTURE,
      ...Array.from({ length: 20 }, (_, i) => ({
        id: 900 + i,
        type: 'single',
        category: 'MySQL',
        difficulty: '中等',
        question: `补充题 ${900 + i}`,
        options: [
          { key: 'A', text: 'a' },
          { key: 'B', text: 'b' },
        ],
        answer: ['A'],
        explanation: '解析文本够长了吧够长了吧',
        tags: ['t'],
        frequency: '中频',
      })),
    ]
    bank.questions.filter((q) => q.type !== 'short').forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountPractice({ review: 'wrong' })
    expect(wrapper.find('.ptop__count').text()).toContain(`/ ${REVIEW_SIZES.wrong} 题`)
  })

  it('抽到的题确实都在错题本里', async () => {
    FIXTURE.forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountPractice({ review: 'wrong' })
    // 逐题翻看，题干对应 id 都在错题本
    const wrongIds = new Set(study.wrongList.map((q) => q.id))
    const shown = wrapper.find('.qcard-p__q').text()
    const id = Number(shown.replace('题目 ', ''))
    expect(wrongIds.has(id)).toBe(true)
  })

  it('错题本为空时显示「错题本是空的」空态', async () => {
    const { wrapper } = await mountPractice({ review: 'wrong' })
    expect(wrapper.text()).toContain('错题本是空的')
    expect(wrapper.find('.qcard-p').exists()).toBe(false)
  })

  it('复习赛答对会累加连对计数（用于移出错题本）', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountPractice({ review: 'wrong' })
    // 做题模式的复习赛是单选题：点正确选项即判定
    const option = wrapper.findAll('.option').find((o) => o.text().includes('a'))
    await option.trigger('click')
    await flushPromises()
    expect(study.streakOf(1)).toBe(1)
    expect(study.isWrong(1)).toBe(true)
  })

  it('错题复习即使传了 memorize 也只有选择题（错题本只收选择题）', async () => {
    /**
     * 2026-11 规则：**错题本只收选择题**。
     *
     * 早先这条用例断言「背题模式的错题复习抽简答题」——
     * 但简答题现在根本进不了错题本，这个场景已不存在。
     * 现在无论传什么 studyMode，错题复习抽出来的都是选择题（有选项、无自评按钮）。
     */
    bank.questions = SHORT_FIXTURE
    SHORT_FIXTURE.forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountPractice({ review: 'wrong', studyMode: 'memorize' })
    // 简答题进不了错题本 → 队列为空，给空态提示
    expect(wrapper.text()).toContain('错题本是空的')
  })

  it('错题复习抽的是选择题（有选项、无自评按钮）', async () => {
    bank.questions = FIXTURE
    FIXTURE.filter((q) => q.type !== 'short').forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountPractice({ review: 'wrong', studyMode: 'memorize' })
    expect(wrapper.findAll('.option').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.actions__btn')).toHaveLength(0)
  })

  it('每日一刷即使传了 memorize 也强制出选择题', async () => {
    bank.questions = FIXTURE
    const { wrapper } = await mountPractice({ review: 'dailyDrill', studyMode: 'memorize' })
    // 强制做题模式 → 抽到的是选择题，有选项
    expect(wrapper.findAll('.option').length).toBeGreaterThan(0)
  })
})

describe('复习赛 · 完成态', () => {
  it('最后一题答完后显示「每日复习完成」', async () => {
    vi.useFakeTimers()
    try {
      // 题池只留 2 题，抽完即结束
      bank.questions = FIXTURE.slice(0, 2)
      const { wrapper } = await mountPractice({ review: 'dailyDrill' })
      expect(wrapper.find('.ptop__count').text()).toContain('/ 2 题')

      // 选择题：点正确选项 → 判定 → 点「完成本轮 / 下一题」
      const answerOne = async () => {
        const option = wrapper.findAll('.option')[0]
        await option.trigger('click')
        await wrapper.vm.$nextTick()
        await wrapper.find('.actions__submit').trigger('click')
        await vi.advanceTimersByTimeAsync(400)
        await wrapper.vm.$nextTick()
      }

      await answerOne()
      await answerOne()
      await wrapper.vm.$nextTick()

      // 每日一刷的结果页是「成绩单」样式（对齐设计稿的三栏）
      expect(wrapper.find('.done__title').text()).toContain('测试结果')
      expect(wrapper.text()).toContain('再来一轮')

      // 三栏：正确率 / 答对题数 / 用时
      const cells = wrapper.findAll('.score__cell')
      expect(cells).toHaveLength(3)
      expect(cells[0].text()).toContain('正确率')
      expect(cells[1].text()).toContain('答对题数')
      expect(cells[2].text()).toContain('用时')

      // 成绩单下方给等级与建议
      expect(wrapper.find('.drill').exists()).toBe(true)
      expect(wrapper.find('.drill__advice').text().length).toBeGreaterThan(10)

      // 逐题回顾：可点回每题查看解析
      const rows = wrapper.findAll('.rl__row')
      expect(rows.length).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
