import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import BankView from '@/views/BankView.vue'
import WrongView from '@/views/WrongView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { PAGE_SIZE } from '@/utils/constants'

/** 造题量：比 3 页多 5 条，保证末页有「剩余不整页」的场景 */
const TOTAL = PAGE_SIZE * 3 + 5

const MANY = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  type: 'short',
  category: 'Linux基础',
  difficulty: '中等',
  question: `题目 ${i + 1}`,
  answer: `答案 ${i + 1}`,
  tags: ['标签'],
  frequency: '中频',
}))

/** 末页条目数（TOTAL - PAGE_SIZE*3） */
const SECOND_PAGE = TOTAL - PAGE_SIZE * 3
/** 跨两页所需的条目数（PAGE_SIZE + 5），保证末页不是整页 */
const OVER_ONE_PAGE = PAGE_SIZE + 5

/**
 * 多分类 fixture：错题本 / 收藏页现在是**按分类分组 + 按组分页**，
 * 单分类题库只会分出一组、永远只有一页，测不出分页行为。
 *
 * 这里造 6 个分类 × 5 题 = 30 题。组页大小是 4，所以 30 题 → 6 组 → 2 页，
 * 第 1 页 4 组（20 题）、第 2 页 2 组（10 题）。
 */
/**
 * 多分类 fixture：错题本 / 收藏页现在是**按分类分组 + 按组分页**，
 * 单分类题库只会分出一组、永远只有一页，测不出分页行为。
 *
 * ⚠️ 这里必须按 `CATEGORIES` 的**真实业务顺序**排列
 * （Linux基础 → 网络基础 → Nginx → Redis → MySQL → Kubernetes），
 * 分组后组的先后就按它来 —— 随便写一个自认为的顺序会让断言与实现不一致。
 */
const CATS = ['Linux基础', '网络基础', 'Nginx', 'Redis', 'MySQL', 'Kubernetes']
const PER_CAT = 5
const MULTI = CATS.flatMap((cat, ci) =>
  Array.from({ length: PER_CAT }, (_, i) => ({
    id: ci * PER_CAT + i + 1,
    type: 'short',
    category: cat,
    difficulty: '中等',
    question: `${cat} 题目 ${i + 1}`,
    answer: `答案 ${i + 1}`,
    tags: ['标签'],
    frequency: '中频',
  })),
)
/** 组页大小，与视图里的 GROUP_PAGE_SIZE 一致 */
const GROUP_PAGE_SIZE = 4

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/bank', component: BankView },
      { path: '/wrong', component: WrongView },
      { path: '/favorites', component: FavoritesView },
      { path: '/practice', component: HomeView },
      { path: '/stats', component: HomeView },
      { path: '/question/:id', component: HomeView },
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
  bank.questions = MANY
  bank.loading = false
  bank.error = ''
  bank.load = () => Promise.resolve(MANY)
  study = useStudyStore()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

async function mountView(component, path, query = {}) {
  const router = makeRouter()
  await router.push({ path, query })
  await router.isReady()
  const wrapper = mount(component, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('题库页 · 分页边界', () => {
  it(`首屏只渲染前 ${PAGE_SIZE} 条，不是全部 ${TOTAL} 条`, async () => {
    const { wrapper } = await mountView(BankView, '/bank')
    expect(wrapper.findAll('.qcard')).toHaveLength(PAGE_SIZE)
  })

  it('显示分页控件与总数', async () => {
    const { wrapper } = await mountView(BankView, '/bank')
    const pager = wrapper.find('.pager')
    expect(pager.exists()).toBe(true)
    expect(pager.text()).toContain('第 1 / 4 页')
    expect(pager.text()).toContain(`共 ${TOTAL} 题`)
  })

  it('首页「上一页」禁用，「下一页」可用', async () => {
    const { wrapper } = await mountView(BankView, '/bank')
    const navs = wrapper.findAll('.pager__nav')
    expect(navs[0].attributes('disabled')).toBeDefined()
    expect(navs[1].attributes('disabled')).toBeUndefined()
  })

  it('点下一页切到第 2 页并写入 URL', async () => {
    const { wrapper, router } = await mountView(BankView, '/bank')
    await wrapper.findAll('.pager__nav')[1].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.page).toBe('2')
    expect(wrapper.findAll('.qcard')).toHaveLength(PAGE_SIZE)
    // 第 2 页首条 = PAGE_SIZE + 1
    expect(wrapper.find('.qcard__summary').text()).toBe(`题目 ${PAGE_SIZE + 1}`)
  })

  it('末页只渲染剩余条目，「下一页」禁用', async () => {
    const { wrapper } = await mountView(BankView, '/bank', { page: '4' })
    expect(wrapper.findAll('.qcard')).toHaveLength(SECOND_PAGE)
    const navs = wrapper.findAll('.pager__nav')
    expect(navs[0].attributes('disabled')).toBeUndefined()
    expect(navs[1].attributes('disabled')).toBeDefined()
  })

  it('URL 页码越界时收敛到末页（不显示空白页）', async () => {
    const { wrapper } = await mountView(BankView, '/bank', { page: '99' })
    expect(wrapper.findAll('.qcard')).toHaveLength(SECOND_PAGE)
    expect(wrapper.find('.pager').text()).toContain('第 4 / 4 页')
  })

  it('URL 页码非法时回退到第 1 页', async () => {
    const { wrapper } = await mountView(BankView, '/bank', { page: 'abc' })
    expect(wrapper.find('.pager').text()).toContain('第 1 / 4 页')
  })

  it('点页码直接跳页', async () => {
    const { wrapper, router } = await mountView(BankView, '/bank')
    const nums = wrapper.findAll('.pager__num')
    await nums[2].trigger('click') // 第 3 页
    await flushPromises()
    expect(router.currentRoute.value.query.page).toBe('3')
  })

  it('切换分类后回到第 1 页（分页不残留）', async () => {
    const { wrapper, router } = await mountView(BankView, '/bank', { page: '3' })
    const allTab = wrapper.findAll('nav[aria-label="分类筛选"] .chip')[0]
    await allTab.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.page).toBeUndefined()
  })

  it('筛选后结果不足一页时不显示分页控件', async () => {
    // 「题目 3」只命中 题目 3、30..35 共 7 条，稳定小于一页
    const { wrapper } = await mountView(BankView, '/bank', { q: '题目 3' })
    expect(wrapper.findAll('.qcard').length).toBeLessThanOrEqual(PAGE_SIZE)
    expect(wrapper.find('.pager').exists()).toBe(false)
  })

  it('卡片序号跨页连续（第 2 页从 PAGE_SIZE+1 开始）', async () => {
    const { wrapper } = await mountView(BankView, '/bank', { page: '2' })
    expect(wrapper.find('.qcard__index').text()).toBe(String(PAGE_SIZE + 1))
  })

  it('无结果时不显示分页控件', async () => {
    const { wrapper } = await mountView(BankView, '/bank', { q: 'zzz-不存在' })
    expect(wrapper.text()).toContain('没有匹配的题目')
    expect(wrapper.find('.pager').exists()).toBe(false)
  })
})

describe('错题本 · 分类汇总 → 明细', () => {
  /** 把 MULTI 前 n 题标记为错题 */
  function markWrongMulti(n) {
    bank.questions = MULTI
    for (let i = 1; i <= n; i++) study.markUnknown(i)
  }

  it('默认进入分类汇总视图：一行一个分类，不直接铺题目', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper } = await mountView(WrongView, '/wrong')
    /**
     * 2026-11：两页都改成「先进分类汇总，再点进某个分类看明细」，
     * 与「薄弱分类」页同款。汇总视图里不该出现题目卡。
     */
    expect(wrapper.findAll('.cat')).toHaveLength(CATS.length)
    expect(wrapper.findAll('.qcard')).toHaveLength(0)
  })

  it('汇总顺序跟随 CATEGORIES', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.cat__name').map((n) => n.text())).toEqual(CATS)
  })

  it('每行显示该分类的错题数与「查看」按钮', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.cat__meta')[0].text()).toBe(`${PER_CAT} 道错题`)
    expect(wrapper.findAll('.cat__act').map((b) => b.text())).toEqual(Array(CATS.length).fill('查看'))
  })

  it('点「查看」进入该分类的明细，只显示这一类的题', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper, router } = await mountView(WrongView, '/wrong')
    await wrapper.findAll('.cat__act')[2].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    const cat = CATS[2]
    expect(router.currentRoute.value.query.category).toBe(cat)
    // 明细里只有这一类的 5 题
    expect(wrapper.findAll('.qcard')).toHaveLength(PER_CAT)
    expect(wrapper.find('.head__cat').text()).toBe(cat)
  })

  it('明细里点返回回到汇总视图', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper, router } = await mountView(WrongView, '/wrong', { category: CATS[0] })
    expect(wrapper.findAll('.qcard')).toHaveLength(PER_CAT)

    await wrapper.find('.head__back').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(router.currentRoute.value.query.category).toBeUndefined()
    expect(wrapper.findAll('.cat')).toHaveLength(CATS.length)
  })

  it('明细里编号从 1 开始连续', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper } = await mountView(WrongView, '/wrong', { category: CATS[0] })
    const indexes = wrapper.findAll('.qcard__index').map((n) => Number(n.text()))
    expect(indexes).toEqual(Array.from({ length: PER_CAT }, (_, i) => i + 1))
  })

  it('错题本为空时给空状态，不显示分类汇总', async () => {
    bank.questions = MULTI
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.text()).toContain('错题本是空的')
    expect(wrapper.findAll('.cat')).toHaveLength(0)
    expect(wrapper.find('.pager').exists()).toBe(false)
  })

  it('汇总视图里没有分页（分类数量有限，一屏能看完）', async () => {
    markWrongMulti(MULTI.length)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.find('.pager').exists()).toBe(false)
  })
})

describe('收藏页 · 分类汇总 → 明细', () => {
  function markFavMulti(n) {
    bank.questions = MULTI
    for (let i = 1; i <= n; i++) study.toggleFavorite(i)
  }

  it('默认进入分类汇总视图：一行一个分类，不直接铺题目', async () => {
    markFavMulti(MULTI.length)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.findAll('.cat')).toHaveLength(CATS.length)
    expect(wrapper.findAll('.qcard')).toHaveLength(0)
  })

  it('汇总顺序跟随 CATEGORIES', async () => {
    markFavMulti(MULTI.length)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.findAll('.cat__name').map((n) => n.text())).toEqual(CATS)
  })

  it('点「查看」进入该分类明细', async () => {
    markFavMulti(MULTI.length)
    const { wrapper, router } = await mountView(FavoritesView, '/favorites')
    await wrapper.findAll('.cat__act')[1].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(router.currentRoute.value.query.category).toBe(CATS[1])
    expect(wrapper.findAll('.qcard')).toHaveLength(PER_CAT)
  })

  it('明细里点返回回到汇总', async () => {
    markFavMulti(MULTI.length)
    const { wrapper, router } = await mountView(FavoritesView, '/favorites', { category: CATS[0] })
    await wrapper.find('.head__back').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(router.currentRoute.value.query.category).toBeUndefined()
    expect(wrapper.findAll('.cat')).toHaveLength(CATS.length)
  })

  it('「全部取消」后显示空状态', async () => {
    markFavMulti(MULTI.length)
    const { wrapper } = await mountView(FavoritesView, '/favorites')

    // 点「全部取消」→ 页内确认条 → 点「确定取消」
    await wrapper.find('.head__clear').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('.confirm .btn--danger').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('还没有收藏')
    expect(wrapper.findAll('.cat')).toHaveLength(0)
  })

  it('有收藏时**不再**显示「还没有收藏」空状态（曾因 v-else 错位而重复出现）', async () => {
    markFavMulti(3)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    /**
     * 用户实际报过的 bug：明明已经有收藏，页面上还挂着「还没有收藏」的提示。
     *
     * 根因：EmptyState 用的是 `v-else`，它接的是上面 `v-if="confirming"` 的确认条，
     * 而不是 `list.length` —— 只要没在确认态，空状态就永远显示。
     * 现在改成 `v-if="!list.length"` 独立判断。
     */
    expect(wrapper.text()).not.toContain('还没有收藏')
    expect(wrapper.findAll('.cat')).toHaveLength(1) // 3 题都在 Linux基础 一类的场景下
  })
})
