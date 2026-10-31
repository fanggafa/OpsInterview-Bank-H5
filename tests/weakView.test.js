import { describe, expect, it, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import WeakView from '@/views/WeakView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 薄弱环节：首页入口 + 详情页。
 *
 * 形态是「首页一张摘要卡 → 详情页完整榜单 → 每项两个去向」，
 * 所以测试要覆盖三件事：入口摘要、详情页列表、两个跳转目标。
 */

const FIXTURE = [
  // MySQL：3 题全刷全错 → 100%
  { id: 1, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm1', answer: 'a1', tags: [] },
  { id: 2, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm2', answer: 'a2', tags: [] },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm3', answer: 'a3', tags: [] },
  // Nginx：3 题全刷，错 1 → 33%
  { id: 11, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n1', answer: 'b1', tags: [] },
  { id: 12, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n2', answer: 'b2', tags: [] },
  { id: 13, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n3', answer: 'b3', tags: [] },
]

const rec = ({ times = 1, inWrong = false } = {}) => ({
  times,
  inWrong,
  status: 'unknown',
  lastReviewed: 1,
  streak: 0,
})

let pinia
let bank
let study

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
  bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  bank.loadIndex = () => Promise.resolve(FIXTURE)
  study = useStudyStore()
})

function makeRouter() {
  const blank = { template: '<div />' }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/weak', component: WeakView },
      { path: '/practice', component: blank },
      { path: '/bank', component: blank },
      { path: '/question/:id', component: blank },
      { path: '/me', component: blank },
    ],
  })
}

async function mountAt(path, comp) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(comp, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('首页 · 薄弱环节入口卡', () => {
  it('数据不足时不显示入口', async () => {
    study.records = { 1: rec({ inWrong: true }) } // 只刷 1 题
    const { wrapper } = await mountAt('/', HomeView)
    const texts = wrapper.findAll('.review__title').map((t) => t.text())
    expect(texts).not.toContain('最需要补的分类')
  })

  it('有数据时显示入口卡，摘要显示最弱分类与错题数', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
      11: rec({ inWrong: true }),
      12: rec({ inWrong: false }),
      13: rec({ inWrong: false }),
    }
    const { wrapper } = await mountAt('/', HomeView)
    const cards = wrapper.findAll('.review')
    const weakCard = cards.find((c) => c.text().includes('最需要补的分类'))
    expect(weakCard).toBeTruthy()
    expect(weakCard.text()).toContain('MySQL')
    expect(weakCard.text()).toContain('3/3 错')
  })

  it('点击入口卡跳转到 /weak', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper, router } = await mountAt('/', HomeView)
    const weakCard = wrapper.findAll('.review').find((c) => c.text().includes('最需要补的分类'))
    await weakCard.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/weak')
  })
})

describe('薄弱环节详情页', () => {
  it('无数据时显示空状态而不是空列表', async () => {
    study.records = {}
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.text()).toContain('还没有足够的数据')
  })

  it('列出全部薄弱分类（不只 5 个）', async () => {
    const many = []
    let id = 100
    for (const cat of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']) {
      for (let i = 0; i < 3; i++) {
        many.push({ id, type: 'short', category: cat, difficulty: '简单', frequency: '高频', question: `q${id}`, answer: `a${id}`, tags: [] })
        id += 1
      }
    }
    bank.questions = many
    const recs = {}
    many.forEach((q) => {
      recs[q.id] = rec({ inWrong: true })
    })
    study.records = recs

    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.findAll('.item')).toHaveLength(7)
  })

  it('每项显示错误率、样本量与「已刷 x/y」', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: false }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    const item = wrapper.find('.item')
    expect(item.find('.item__rate').text()).toBe('67%')
    expect(item.find('.item__meta').text()).toContain('错')
    expect(item.find('.item__meta').text()).toContain('已刷 3/3 题')
  })

  it('顶部小结指出最弱分类', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
      11: rec({ inWrong: true }),
      12: rec({ inWrong: false }),
      13: rec({ inWrong: false }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.find('.summary__main').text()).toContain('MySQL')
  })

  it('「刷这个分类的错题」跳到 practice?mode=wrong&category=', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper, router } = await mountAt('/weak', WeakView)
    const primary = wrapper.findAll('.item__btn').find((b) => b.text().includes('刷这个分类的错题'))
    await primary.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.mode).toBe('wrong')
    expect(router.currentRoute.value.query.category).toBe('MySQL')
  })

  it('「看题库」跳到 bank?category=', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper, router } = await mountAt('/weak', WeakView)
    const ghost = wrapper.findAll('.item__btn').find((b) => b.text().includes('看题库'))
    await ghost.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/bank')
    expect(router.currentRoute.value.query.category).toBe('MySQL')
  })

  it('错误率条宽度按比例（100% → 全宽）', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.find('.item__fill').attributes('style')).toContain('width: 100%')
  })
})
