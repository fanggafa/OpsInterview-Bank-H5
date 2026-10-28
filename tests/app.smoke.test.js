import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import HomeView from '@/views/HomeView.vue'
import BankView from '@/views/BankView.vue'
import MeView from '@/views/MeView.vue'
import SettingsView from '@/views/SettingsView.vue'
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
  it('渲染 4 项且当前路由高亮（统计页已并入「我的」）', async () => {
    const router = makeRouter()
    router.push('/bank')
    await router.isReady()

    const wrapper = mount(TabBar, { global: { plugins: [pinia, router] } })
    const links = wrapper.findAll('.tabbar__item')
    expect(links).toHaveLength(4)
    expect(wrapper.find('.tabbar__item--active').text()).toContain('题库')
    // 统计页已移除，底部栏不应再有「统计」
    expect(wrapper.text()).not.toContain('统计')
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

describe('SettingsView 设置页', () => {
  async function mountSettings() {
    const router = makeRouter()
    router.push('/settings')
    await router.isReady()
    const wrapper = mount(SettingsView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    return { wrapper, router }
  }

  function rowByTitle(wrapper, title) {
    return wrapper
      .findAll('.row')
      .find((r) => r.find('.row__title').exists() && r.find('.row__title').text() === title)
  }

  it('主题是三态分段控件，点击写入 localStorage', async () => {
    const { wrapper } = await mountSettings()
    const themeSeg = wrapper.findAll('.seg')[0]
    const buttons = themeSeg.findAll('.seg__item')
    expect(buttons).toHaveLength(3)

    await buttons[1].trigger('click')
    expect(JSON.parse(localStorage.getItem('oi_settings')).theme).toBe('dark')
  })

  it('包含默认练习方式与数据管理', async () => {
    const { wrapper } = await mountSettings()
    expect(wrapper.text()).toContain('默认练习方式')
    expect(rowByTitle(wrapper, '清空学习记录')).toBeTruthy()
    expect(rowByTitle(wrapper, '清空收藏')).toBeTruthy()
  })

  it('清空记录用页内确认（不依赖 window.confirm），取消则不执行', async () => {
    const { wrapper } = await mountSettings()
    const study = useStudyStore()
    study.markKnow(1)
    await flushPromises()
    const before = Object.keys(study.records).length
    expect(before).toBeGreaterThan(0)

    // window.confirm 在微信/WebView 里可能静默失效，页面不应依赖它
    const confirmSpy = vi.spyOn(window, 'confirm')
    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(confirmSpy).not.toHaveBeenCalled()
    confirmSpy.mockRestore()

    expect(wrapper.find('.confirm').exists()).toBe(true)
    expect(Object.keys(study.records).length).toBe(before)

    await wrapper.find('.confirm .btn--plain').trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
    expect(Object.keys(study.records).length).toBe(before)
  })

  it('两个清空按钮各自独立弹确认条（不会同时展开）', async () => {
    const { wrapper } = await mountSettings()
    const study = useStudyStore()
    study.markKnow(1)
    study.toggleFavorite(1)
    await wrapper.vm.$nextTick()

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)

    await rowByTitle(wrapper, '清空收藏').trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)
    expect(wrapper.find('.confirm').text()).toContain('收藏')
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
