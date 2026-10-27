import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BankView from '@/views/BankView.vue'
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
    explanation: '解析内容足够长，便于通过校验。',
    tags: ['t'],
    frequency: '高频',
  },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/bank', component: BankView },
      { path: '/practice', component: HomeView },
      { path: '/interview', component: HomeView },
      { path: '/stats', component: HomeView },
      { path: '/me', component: HomeView },
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

async function mountHome() {
  const router = makeRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(HomeView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('首页 · 总进度与双指标', () => {
  it('未作答时两个指标显示「—」而不是 0%', async () => {
    const { wrapper } = await mountHome()
    const rows = wrapper.findAll('.hero__stat strong').map((r) => r.text())
    expect(rows[1]).toBe('—') // 简答掌握率
    expect(rows[2]).toBe('—') // 选择正确率
  })

  it('无数据时百分比显示「—」（而非 0%）', async () => {
    const { wrapper } = await mountHome()
    const strongs = wrapper.findAll('.hero__stat strong')
    expect(strongs[1].text()).toBe('—')
    expect(strongs[2].text()).toBe('—')
  })

  it('有数据后按各自口径显示（简答/选择分开算）', async () => {
    study.markKnow(1)
    study.markUnknown(2)
    const { wrapper } = await mountHome()
    const strongs = wrapper.findAll('.hero__stat strong')
    expect(strongs[1].text()).toBe('50%')
    // 选择题还没答，仍为「—」
    expect(strongs[2].text()).toBe('—')
  })

  it('已刷数与总数正确', async () => {
    study.markKnow(1)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.hero__stat strong').text()).toContain('1')
    expect(wrapper.find('.hero__stat em').text()).toContain('/ 4')
  })

  it('总进度环按已刷/总数计算', async () => {
    study.markKnow(1)
    study.markKnow(2)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.ring__text').text()).toBe('50%')
  })
})

describe('首页 · 今日文案', () => {
  it('今日未刷时显示引导文案', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.hero__sub').text()).toBe('碎片时间，背完这些题')
  })

  it('今日已刷时显示今日题数', async () => {
    study.markKnow(1)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.hero__sub').text()).toContain('今天已经刷了 1 题')
  })
})

describe('首页 · 快捷入口', () => {
  it('渲染刷题与模拟面试两个入口', async () => {
    const { wrapper } = await mountHome()
    const entries = wrapper.findAll('.entry')
    expect(entries).toHaveLength(2)
    expect(entries[0].text()).toContain('开始刷题')
    expect(entries[1].text()).toContain('模拟面试')
  })

  it('点「开始刷题」进入刷题页', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.findAll('.entry')[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
  })

  it('点「模拟面试」进入面试设置页', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.findAll('.entry')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/interview')
  })

  it('右上角按钮直接切换主题，不跳转页面', async () => {
    const { wrapper, router } = await mountHome()
    const before = router.currentRoute.value.path

    await wrapper.find('.hero__btn').trigger('click')
    await flushPromises()

    // 仍留在首页，且主题被切成深色
    expect(router.currentRoute.value.path).toBe(before)
    expect(JSON.parse(localStorage.getItem('oi_settings')).theme).toBe('dark')

    // 再点一次切回浅色
    await wrapper.find('.hero__btn').trigger('click')
    await flushPromises()
    expect(JSON.parse(localStorage.getItem('oi_settings')).theme).toBe('light')
  })
})

describe('首页 · 分类入口', () => {
  it('按题库实际分类生成，不出现空分类', async () => {
    const { wrapper } = await mountHome()
    const cats = wrapper.findAll('.cats__item').map((c) => c.find('.cats__name').text())
    expect(cats).toEqual(['Linux基础', 'MySQL'])
  })

  it('每个分类卡片带 --cat-color 自定义属性', async () => {
    const { wrapper } = await mountHome()
    wrapper.findAll('.cats__item').forEach((it) => {
      expect(it.attributes('style') || '').toContain('--cat-color')
    })
  })

  it('不同分类使用不同颜色（分类色板生效）', async () => {
    const { wrapper } = await mountHome()
    const items = wrapper.findAll('.cats__item')
    expect(items[0].attributes('style')).not.toBe(items[1].attributes('style'))
  })

  it('渲染分类色点（视觉区分）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.cats__dot').length).toBe(2)
  })

  it('显示各分类已刷/总数与进度条', async () => {
    study.markKnow(1)
    const { wrapper } = await mountHome()
    const first = wrapper.findAll('.cats__item')[0]
    expect(first.find('.cats__count').text()).toBe('1/2')

    const fill = first.find('.cats__fill')
    expect(fill.attributes('style')).toContain('50%')
  })

  it('未刷分类进度为 0 且不报错', async () => {
    const { wrapper } = await mountHome()
    const mysql = wrapper.findAll('.cats__item')[1]
    // MySQL 有 2 道题（1 简答 + 1 单选）
    expect(mysql.find('.cats__count').text()).toBe('0/2')
    expect(mysql.find('.cats__fill').attributes('style')).toContain('0%')
  })

  it('点击分类进入该分类刷题', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.findAll('.cats__item')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.category).toBe('MySQL')
  })

  it('页脚说明题型构成', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.home-foot').text()).toContain('简答 3')
    expect(wrapper.find('.home-foot').text()).toContain('选择 1')
  })
})

describe('首页 · 继续上次', () => {
  it('无进度时不显示', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.continue').exists()).toBe(false)
  })

  it('有进度时显示，点击跳刷题页（模式在刷题页的面板里选）', async () => {
    study.saveProgress({ mode: 'random', studyMode: 'memorize', category: 'MySQL', index: 1 })
    const { wrapper, router } = await mountHome()

    // 文案里带上练习模式，让用户知道上次在练什么
    expect(wrapper.find('.continue__desc').text()).toContain('MySQL')
    expect(wrapper.find('.continue__desc').text()).toContain('背题')

    await wrapper.find('.continue').trigger('click')
    await flushPromises()
    // 统一进刷题页，不再把 mode/category 塞进 URL——由刷题页的模式面板决定
    expect(router.currentRoute.value.path).toBe('/practice')
  })
})
