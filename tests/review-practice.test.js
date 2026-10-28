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

const mk = (i, type = 'short', extra = {}) => ({
  id: i,
  type,
  category: 'Linux基础',
  difficulty: '中等',
  frequency: '高频',
  question: `题目 ${i}`,
  answer: `答案 ${i}`,
  tags: ['t'],
  ...extra,
})

const FIXTURE = Array.from({ length: 20 }, (_, i) => mk(i + 1))

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

describe('复习赛 · 每日复习', () => {
  it('带 review=daily 进来直接出题，不显示「选择练习方式」', async () => {
    const { wrapper } = await mountPractice({ review: 'daily' })
    expect(wrapper.find('.picker').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
  })

  it(`抽 ${REVIEW_SIZES.daily} 题（题池 20 题够抽）`, async () => {
    const { wrapper } = await mountPractice({ review: 'daily' })
    expect(wrapper.find('.ptop__count').text()).toContain(`/ ${REVIEW_SIZES.daily} 题`)
  })

  it('顶栏显示「每日复习」标题', async () => {
    const { wrapper } = await mountPractice({ review: 'daily' })
    expect(wrapper.find('.ptop__review-title').text()).toBe('每日复习')
  })

  it('复习赛不显示题目顺序与练习方式切换（这批题是抽出来的）', async () => {
    const { wrapper } = await mountPractice({ review: 'daily' })
    expect(wrapper.find('.ptop__seg').exists()).toBe(false)
    expect(wrapper.find('.practice__mode-btn').exists()).toBe(false)
  })

  it('复习赛不写断点进度（进度保持为空）', async () => {
    const { wrapper } = await mountPractice({ review: 'daily' })
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()
    expect(study.progress).toBeNull()
  })

  it('复习赛返回按钮回首页（没有选择页可退）', async () => {
    const { wrapper, router } = await mountPractice({ review: 'daily' })
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })
})

describe('复习赛 · 错题复习', () => {
  it('题池就是错题本：抽题数量按错题本实际题数', async () => {
    // 只让 6 道题进错题本
    ;[1, 2, 3, 4, 5, 6].forEach((id) => study.markUnknown(id))
    const { wrapper } = await mountPractice({ review: 'wrong' })
    expect(wrapper.find('.ptop__review-title').text()).toBe('错题复习')
    expect(wrapper.find('.ptop__count').text()).toContain('/ 6 题')
  })

  it('错题超过 10 道时只抽 10 道', async () => {
    FIXTURE.forEach((q) => study.markUnknown(q.id))
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
    // 简答题：点「会」
    const know = wrapper.findAll('.actions__btn').find((b) => b.text() === '会')
    await know.trigger('click')
    await flushPromises()
    expect(study.streakOf(1)).toBe(1)
    expect(study.isWrong(1)).toBe(true)
  })
})

describe('复习赛 · 完成态', () => {
  it('最后一题答完后显示「每日复习完成」', async () => {
    vi.useFakeTimers()
    try {
      // 题池只留 2 题，抽完即结束
      bank.questions = FIXTURE.slice(0, 2)
      const { wrapper } = await mountPractice({ review: 'daily' })
      expect(wrapper.find('.ptop__count').text()).toContain('/ 2 题')

      const know = () => wrapper.findAll('.actions__btn').find((b) => b.text() === '会')
      await know().trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      await know().trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.done__title').text()).toBe('每日复习完成')
      expect(wrapper.text()).toContain('再来一批')
    } finally {
      vi.useRealTimers()
    }
  })
})
