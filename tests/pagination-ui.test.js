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
    const { wrapper } = await mountView(BankView, '/bank', { q: '题目 1' })
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

describe('错题本 · 分页边界', () => {
  function markWrong(count) {
    for (let i = 1; i <= count; i++) study.markUnknown(i)
  }

  it('错题超过一页时出现分页控件', async () => {
    markWrong(OVER_ONE_PAGE)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.qcard')).toHaveLength(PAGE_SIZE)
    expect(wrapper.find('.pager').text()).toContain('第 1 / 2 页')
  })

  it('翻到第 2 页只显示剩余条目', async () => {
    markWrong(OVER_ONE_PAGE)
    const { wrapper } = await mountView(WrongView, '/wrong')
    await wrapper.findAll('.pager__nav')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.qcard')).toHaveLength(OVER_ONE_PAGE - PAGE_SIZE)
  })

  it('错题不足一页时不显示分页控件（避免多余 UI）', async () => {
    markWrong(5)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.qcard')).toHaveLength(5)
    expect(wrapper.find('.pager').exists()).toBe(false)
  })

  it('末页答对移出导致越界时，页码自动回退且控件隐藏', async () => {
    markWrong(OVER_ONE_PAGE)
    const { wrapper } = await mountView(WrongView, '/wrong')
    await wrapper.findAll('.pager__nav')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.pager__info').text()).toContain('第 2 / 2 页')

    // 把第 2 页的题全部改判为答对，只剩第 1 页的 PAGE_SIZE 条 → 恰好一页
    for (let i = PAGE_SIZE + 1; i <= OVER_ONE_PAGE; i++) study.markKnow(i)
    await wrapper.vm.$nextTick()

    // 只剩一页时分页控件整体隐藏，列表回退到第 1 页
    expect(wrapper.find('.pager').exists()).toBe(false)
    expect(wrapper.findAll('.qcard')).toHaveLength(PAGE_SIZE)
    expect(wrapper.text()).toContain(`共 ${PAGE_SIZE} 道错题`)
  })

  it('空错题本时既不显示列表也不显示分页', async () => {
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.text()).toContain('错题本是空的')
    expect(wrapper.find('.pager').exists()).toBe(false)
  })
})

describe('收藏页 · 分页边界', () => {
  function markFav(count) {
    for (let i = 1; i <= count; i++) study.toggleFavorite(i)
  }

  it('收藏超过一页时出现分页控件', async () => {
    markFav(OVER_ONE_PAGE)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.findAll('.qcard')).toHaveLength(PAGE_SIZE)
    expect(wrapper.find('.pager').text()).toContain('第 1 / 2 页')
  })

  it('末页显示剩余条目', async () => {
    markFav(OVER_ONE_PAGE)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    await wrapper.findAll('.pager__nav')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.qcard')).toHaveLength(OVER_ONE_PAGE - PAGE_SIZE)
  })

  it('「全部取消」后回到第 1 页且隐藏分页', async () => {
    markFav(OVER_ONE_PAGE)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    await wrapper.findAll('.pager__nav')[1].trigger('click')
    await wrapper.vm.$nextTick()

    const spy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await wrapper.find('.head__clear').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('还没有收藏')
    expect(wrapper.find('.pager').exists()).toBe(false)
    spy.mockRestore()
  })

  it('收藏不足一页时不显示分页', async () => {
    markFav(3)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.find('.pager').exists()).toBe(false)
  })
})
