import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import HomeView from '@/views/HomeView.vue'
import BankView from '@/views/BankView.vue'
import StatsView from '@/views/StatsView.vue'
import MeView from '@/views/MeView.vue'
import QuestionView from '@/views/QuestionView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import TabBar from '@/components/TabBar.vue'
import Ring from '@/components/Ring.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

const FIXTURE = [
  { id: 1, category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, category: 'MySQL', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t2'], frequency: '中频' },
]

/** 构造带完整路由表的测试 router（组件均为真实实现） */
function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/bank', component: BankView },
      { path: '/question/:id', component: QuestionView },
      { path: '/practice', component: BankView },
      { path: '/stats', component: StatsView },
      { path: '/me', component: MeView },
      { path: '/:pathMatch(.*)*', component: NotFoundView },
    ],
  })
}

let pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  // 预置题库，避免组件挂载时走 fetch
  const bank = useBankStore()
  bank.questions = FIXTURE
  const study = useStudyStore()
  study.markKnow(1)
})

describe('应用挂载冒烟', () => {
  it('能渲染首页且显示今日概览与分类入口', async () => {
    const router = makeRouter()
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [pinia, router] } })
    await new Promise((r) => setTimeout(r, 50))
    // 等待异步组件加载
    await router.isReady()
    expect(wrapper.html()).toBeTruthy()
  })
})

describe('TabBar', () => {
  it('渲染 5 项且当前路由高亮', async () => {
    const router = makeRouter()
    router.push('/bank')
    await router.isReady()

    const wrapper = mount(TabBar, { global: { plugins: [pinia, router] } })
    const links = wrapper.findAll('.tabbar__item')
    expect(links).toHaveLength(5)
    expect(wrapper.find('.tabbar__item--active').text()).toContain('题库')
  })

  it('底部栏包含「首页」入口，且能回到首页（否则进去就出不来）', async () => {
    const router = makeRouter()
    router.push('/bank')
    await router.isReady()

    const wrapper = mount(TabBar, { global: { plugins: [pinia, router] } })
    const labels = wrapper.findAll('.tabbar__label').map((n) => n.text())
    expect(labels).toContain('首页')

    const homeLink = wrapper.findAll('.tabbar__item').find((l) => l.text().includes('首页'))
    await homeLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('在首页时「首页」高亮', async () => {
    const router = makeRouter()
    router.push('/')
    await router.isReady()

    const wrapper = mount(TabBar, { global: { plugins: [pinia, router] } })
    expect(wrapper.find('.tabbar__item--active').text()).toContain('首页')
  })

  it('子路由通过 meta.parent 继承高亮', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/question/:id', component: QuestionView, meta: { parent: '/bank' } },
        { path: '/', component: BankView },
        { path: '/bank', component: BankView },
        { path: '/practice', component: BankView },
        { path: '/stats', component: StatsView },
        { path: '/me', component: MeView },
      ],
    })
    router.push('/question/1')
    await router.isReady()

    const wrapper = mount(TabBar, { global: { plugins: [pinia, router] } })
    expect(wrapper.find('.tabbar__item--active').text()).toContain('题库')
  })
})

describe('统计口径渲染', () => {
  it('分母为 0 时进度环显示「—」而非 0%', () => {
    const wrapper = mount(Ring, { props: { percent: null } })
    expect(wrapper.find('.ring__text').text()).toBe('—')
  })

  it('正常百分比渲染为整数', () => {
    const wrapper = mount(Ring, { props: { percent: 42.6 } })
    expect(wrapper.find('.ring__text').text()).toBe('43%')
  })
})

describe('MeView 主题切换', () => {
  it('点击深色后写入 localStorage 并更新 html data-theme', async () => {
    const router = makeRouter()
    router.push('/me')
    await router.isReady()

    const wrapper = mount(MeView, { global: { plugins: [pinia, router] } })
    const buttons = wrapper.findAll('.seg__item')
    expect(buttons).toHaveLength(3)

    await buttons[1].trigger('click')
    expect(JSON.parse(localStorage.getItem('oi_settings')).theme).toBe('dark')
    await new Promise((r) => setTimeout(r, 0))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('清空记录需二次确认，取消则不执行', async () => {
    const router = makeRouter()
    router.push('/me')
    await router.isReady()
    const wrapper = mount(MeView, { global: { plugins: [pinia, router] } })
    const study = useStudyStore()
    const before = Object.keys(study.records).length

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await wrapper.findAll('.list__row--action')[0].trigger('click')
    expect(Object.keys(study.records).length).toBe(before)

    confirmSpy.mockReturnValue(true)
    await wrapper.findAll('.list__row--action')[0].trigger('click')
    expect(Object.keys(study.records).length).toBe(0)
    confirmSpy.mockRestore()
  })
})

describe('QuestionView 边界', () => {
  it('不存在的 id 渲染「题目不存在」空状态', async () => {
    const router = makeRouter()
    router.push('/question/999')
    await router.isReady()

    const wrapper = mount(QuestionView, { global: { plugins: [pinia, router] } })
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('题目不存在')
  })
})

describe('404', () => {
  it('未知路由渲染 404 页面', async () => {
    const router = makeRouter()
    router.push('/no-such-page')
    await router.isReady()

    const wrapper = mount(NotFoundView, { global: { plugins: [pinia, router] } })
    expect(wrapper.text()).toContain('404')
  })
})
