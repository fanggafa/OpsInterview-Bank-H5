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
  it('数据不足时入口卡仍常驻，显示引导文案且可点进 /weak', async () => {
    study.records = { 1: rec({ inWrong: true }) } // 只刷 1 题，未达门槛
    const { wrapper, router } = await mountAt('/', HomeView)
    const texts = wrapper.findAll('.review__title').map((t) => t.text())
    // 卡片常驻（与「错题复习」一致）：功能要可发现，不能整卡消失
    expect(texts).toContain('薄弱分类')

    const cards = wrapper.findAll('.review')
    const card = cards.find((c) => c.text().includes('薄弱分类'))
    expect(card).toBeTruthy()
    // 不给结论，只给引导
    expect(card.text()).toContain('数据还不够')

    // 点击仍进入 /weak（那边有空状态说明「为什么还不给结论」）
    await card.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/weak')
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
    const weakCard = cards.find((c) => c.text().includes('薄弱分类'))
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
    const weakCard = wrapper.findAll('.review').find((c) => c.text().includes('薄弱分类'))
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

  it('每行显示错误率与紧凑样本量（错 n · 刷 x/y）', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: false }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    const item = wrapper.find('.item')
    expect(item.find('.item__rate').text()).toBe('67%')
    /**
     * 2026-11：为了把 26 个分类压进更少屏幕，样本量文案从
     * 「错 2 题 · 已刷 3/3 题」精简成「错 2 · 刷 3/3」——
     * 行内放得下，语义也没丢。
     */
    const meta = item.find('.item__meta').text()
    expect(meta).toContain('错')
    expect(meta).toContain('刷 3/3')
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

  it('整行是纯展示区，不可点、不触发任何跳转', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper, router } = await mountAt('/weak', WeakView)
    /**
     * 2026-11：整行最终定为**不可点**。
     *
     * 走过两个弯路：
     * ① 整行可点 = 直接开刷  → 用户：「点文字/进度条想看看数据，却被丢进练习页」
     * ② 整行可点 = 进题库页  → 用户：「整行就显示这个进度条不行吗，非得跳转」
     * 结论：数据展示就是展示，本页唯一操作是右侧「刷错题」。
     */
    const info = wrapper.find('.item__info')
    expect(info.exists()).toBe(true)
    // 是 div 而不是 button —— 不该有任何可点语义
    expect(info.element.tagName).toBe('DIV')

    const before = router.currentRoute.value.fullPath
    await info.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe(before)
  })

  it('「刷错题」是明确文字按钮（不是难懂的图标），点了进 practice', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper, router } = await mountAt('/weak', WeakView)
    const act = wrapper.find('.item__act')
    expect(act.exists()).toBe(true)
    // 用文字而不是纯图标：图标「看不清也看不明白」
    expect(act.text()).toContain('刷错题')
    await act.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.mode).toBe('wrong')
    expect(router.currentRoute.value.query.category).toBe('MySQL')
  })

  it('行尾不再有含义不清的小图标按钮', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    // 试过的书本图标已移除
    expect(wrapper.find('.item__browse').exists()).toBe(false)
    // 双箭头也移除了（整行就是入口，不需要再提示箭头）
    expect(wrapper.find('.item__chevron').exists()).toBe(false)
  })

  it('卡片不再塞整块大按钮（27 个分类时页面不该被撑长）', async () => {
    study.records = {
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    }
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.find('.item__acts').exists()).toBe(false)
    expect(wrapper.find('.item__btn').exists()).toBe(false)
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
