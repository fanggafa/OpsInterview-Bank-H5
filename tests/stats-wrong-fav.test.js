import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import StatsView from '@/views/StatsView.vue'
import WrongView from '@/views/WrongView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS } from '@/utils/constants'

const FIXTURE = [
  { id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t'], frequency: '高频' },
  { id: 2, type: 'short', category: 'Linux基础', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t'], frequency: '高频' },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '中等', question: 'q3', answer: 'a3', tags: ['t'], frequency: '中频' },
  {
    id: 4,
    type: 'single',
    category: 'MySQL',
    difficulty: '简单',
    question: 'c1',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
    answer: ['A'],
    explanation: '解析内容足够长以便通过校验。',
    tags: ['t'],
    frequency: '高频',
  },
  {
    id: 5,
    type: 'multiple',
    category: 'Redis',
    difficulty: '困难',
    question: 'c2',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }],
    answer: ['A', 'C'],
    explanation: '解析内容足够长以便通过校验。',
    tags: ['t'],
    frequency: '中频',
  },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/stats', component: StatsView },
      { path: '/wrong', component: WrongView },
      { path: '/favorites', component: FavoritesView },
      { path: '/practice', component: HomeView },
      { path: '/bank', component: HomeView },
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
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  bank.load = () => Promise.resolve(FIXTURE)
  study = useStudyStore()
})

async function mountView(component, path) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(component, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('统计页 · 双指标口径', () => {
  it('未作答时两个指标都显示「—」而非 0%', async () => {
    const { wrapper } = await mountView(StatsView, '/stats')
    const values = wrapper.findAll('.metric__value').map((v) => v.text())
    expect(values).toEqual(['—', '—'])
  })

  it('简答掌握率只用简答计算，选择题不影响', async () => {
    study.markKnow(1) // 简答会
    study.markUnknown(2) // 简答不会
    const { wrapper } = await mountView(StatsView, '/stats')

    const values = wrapper.findAll('.metric__value').map((v) => v.text())
    expect(values[0]).toBe('50%') // 简答 1/2
    expect(values[1]).toBe('—') // 选择题还没答
  })

  it('选择题正确率独立计算', async () => {
    study.markKnow(4) // 选择题对
    study.markUnknown(5) // 选择题错
    const { wrapper } = await mountView(StatsView, '/stats')
    const values = wrapper.findAll('.metric__value').map((v) => v.text())
    expect(values[1]).toBe('50%')
    expect(values[0]).toBe('—') // 简答还没答
  })

  it('显示已答数与总数明细', async () => {
    study.markKnow(1)
    const { wrapper } = await mountView(StatsView, '/stats')
    expect(wrapper.text()).toContain('已答 1 / 共 3 道简答')
    expect(wrapper.text()).toContain('已答 0 / 共 2 道选择')
  })

  it('总进度环显示已刷/总数', async () => {
    study.markKnow(1)
    study.markKnow(4)
    const { wrapper } = await mountView(StatsView, '/stats')
    expect(wrapper.find('.ring__text').text()).toBe('40%') // 2/5
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('/ 5')
  })

  it('分类掌握度只列出有简答题的分类', async () => {
    study.markKnow(1)
    const { wrapper } = await mountView(StatsView, '/stats')
    const bars = wrapper.findAll('.bar-row__label').map((b) => b.text())
    // Redis 分类只有选择题，不应出现在简答掌握度里
    expect(bars).toContain('Linux基础')
    expect(bars).toContain('MySQL')
    expect(bars).not.toContain('Redis')
  })

  it('入口显示错题与收藏数量', async () => {
    study.markUnknown(1)
    study.toggleFavorite(3)
    const { wrapper } = await mountView(StatsView, '/stats')
    const nums = wrapper.findAll('.entry__num').map((n) => n.text())
    expect(nums[0]).toBe('1') // 错题
    expect(nums[1]).toBe('1') // 收藏
  })

  it('无任何记录时显示引导空状态', async () => {
    const { wrapper } = await mountView(StatsView, '/stats')
    expect(wrapper.text()).toContain('还没有开始刷题')
  })

  it('有记录后不再显示引导空状态', async () => {
    study.markKnow(1)
    const { wrapper } = await mountView(StatsView, '/stats')
    expect(wrapper.text()).not.toContain('还没有开始刷题')
  })

  it('点击入口跳转到错题本', async () => {
    const { wrapper, router } = await mountView(StatsView, '/stats')
    await wrapper.findAll('.entry')[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/wrong')
  })

  it('点击入口跳转到收藏页', async () => {
    const { wrapper, router } = await mountView(StatsView, '/stats')
    await wrapper.findAll('.entry')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/favorites')
  })
})

describe('错题本', () => {
  it('空时显示空状态', async () => {
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.text()).toContain('错题本是空的')
    expect(wrapper.findAll('.qcard')).toHaveLength(0)
  })

  it('列出最近一次答错的题', async () => {
    study.markUnknown(1)
    study.markUnknown(4)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.qcard')).toHaveLength(2)
    expect(wrapper.text()).toContain('共 2 道错题')
  })

  it('改判为答对后自动移出', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountView(WrongView, '/wrong')
    expect(wrapper.findAll('.qcard')).toHaveLength(1)

    study.markKnow(1)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.qcard')).toHaveLength(0)
    expect(wrapper.text()).toContain('错题本是空的')
  })

  it('按题库顺序展示', async () => {
    study.markUnknown(3)
    study.markUnknown(1)
    const { wrapper } = await mountView(WrongView, '/wrong')
    const titles = wrapper.findAll('.qcard__summary').map((t) => t.text())
    expect(titles).toEqual(['q1', 'q3'])
  })

  it('「错题专项刷题」跳转到 mode=wrong', async () => {
    study.markUnknown(1)
    const { wrapper, router } = await mountView(WrongView, '/wrong')
    await wrapper.find('.head__btn').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.mode).toBe('wrong')
  })
})

describe('收藏页', () => {
  it('空时显示空状态与引导', async () => {
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.text()).toContain('还没有收藏')
    expect(wrapper.text()).toContain('去题库')
  })

  it('按收藏时间倒序展示', async () => {
    study.toggleFavorite(1)
    study.toggleFavorite(3)
    study.toggleFavorite(2)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    const titles = wrapper.findAll('.qcard__summary').map((t) => t.text())
    expect(titles).toEqual(['q2', 'q3', 'q1'])
  })

  it('点击卡片星标取消收藏后立即从列表移除', async () => {
    study.toggleFavorite(1)
    study.toggleFavorite(2)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.findAll('.qcard')).toHaveLength(2)

    await wrapper.findAll('.qcard__star')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.qcard')).toHaveLength(1)
    expect(study.favorites).toHaveLength(1)
  })

  it('「全部取消」用页内确认（不依赖 window.confirm），取消则不执行', async () => {
    study.toggleFavorite(1)
    const { wrapper } = await mountView(FavoritesView, '/favorites')

    // window.confirm 在微信/WebView 里可能静默失效，页面不应依赖它
    const spy = vi.spyOn(window, 'confirm')
    await wrapper.find('.head__clear').trigger('click')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()

    // 弹页内确认条，此时还没删
    expect(wrapper.find('.confirm').exists()).toBe(true)
    expect(study.favorites).toHaveLength(1)

    // 取消 → 确认条收起，收藏保留
    await wrapper.find('.confirm .btn--plain').trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
    expect(study.favorites).toHaveLength(1)

    // 再来一次并确认 → 收藏清空
    await wrapper.find('.head__clear').trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')
    expect(study.favorites).toHaveLength(0)
  })

  it('显示收藏数量', async () => {
    study.toggleFavorite(1)
    study.toggleFavorite(2)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.text()).toContain('共 2 道收藏')
  })
})

describe('三处状态一致性', () => {
  it('详情页收藏后，收藏页能看到', async () => {
    study.toggleFavorite(1)
    const { wrapper } = await mountView(FavoritesView, '/favorites')
    expect(wrapper.findAll('.qcard')).toHaveLength(1)
  })

  it('错题本与统计页错题数一致', async () => {
    study.markUnknown(1)
    study.markUnknown(3)

    const wrong = await mountView(WrongView, '/wrong')
    const stats = await mountView(StatsView, '/stats')

    expect(wrong.wrapper.findAll('.qcard')).toHaveLength(2)
    expect(stats.wrapper.findAll('.entry__num')[0].text()).toBe('2')
  })
})
