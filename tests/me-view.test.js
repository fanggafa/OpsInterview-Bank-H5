import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import MeView from '@/views/MeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STORAGE_KEYS, STUDY_MODE_LABEL } from '@/utils/constants'

/**
 * 「我的」页的两类关键回归：
 *
 * 1. **清空按钮必须用页内确认，不能用 window.confirm**
 *    微信内置浏览器、部分安卓 WebView 下 confirm 会静默返回 false，
 *    表现为「点了完全没反应」——这是曾经的真实 bug。
 *
 * 2. **页面结构按主流 App 方案重做**
 *    个人卡（头像 + 进度 + 三格数字）+ 四宫格 + 分组列表，
 *    清空按钮变成带图标/说明/右侧数值的行，确认条仍是页内的。
 */

const FIXTURE = [
  { id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, type: 'single', category: 'MySQL', difficulty: '中等', question: 'q2', answer: ['B'], tags: ['t2'], frequency: '中频', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], explanation: '解析文本够长了' },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/me', component: MeView },
      { path: '/practice', component: MeView },
      { path: '/stats', component: MeView },
      { path: '/wrong', component: MeView },
      { path: '/favorites', component: MeView },
    ],
  })
}

let pinia
let study

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  sessionStorage.clear()
  const bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  study = useStudyStore()
})

async function mountMe() {
  const router = makeRouter()
  await router.push('/me')
  await router.isReady()
  const wrapper = mount(MeView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

/** 按行标题找按钮（新结构里行是 .row，标题在 .row__title） */
function rowByTitle(wrapper, title) {
  return wrapper.findAll('.row').find((r) => r.find('.row__title').exists() && r.find('.row__title').text() === title)
}

describe('我的 · 页面结构（主流方案）', () => {
  it('顶部个人卡：头像 + 总进度 + 三格数字（已刷/错题/收藏）', async () => {
    const { wrapper } = await mountMe()
    expect(wrapper.find('.profile').exists()).toBe(true)
    expect(wrapper.find('.profile__avatar').exists()).toBe(true)

    const labels = wrapper.findAll('.profile__label').map((n) => n.text())
    expect(labels).toEqual(['已刷', '错题', '收藏'])
  })

  it('四宫格数据：简答掌握率 / 选择正确率 / 今日已刷 / 题库总量', async () => {
    const { wrapper } = await mountMe()
    const labels = wrapper.findAll('.tile__label').map((n) => n.text())
    expect(labels).toEqual(['简答掌握率', '选择正确率', '今日已刷', '题库总量'])
  })

  it('未作答时掌握率显示「—」而不是 0%', async () => {
    const { wrapper } = await mountMe()
    const values = wrapper.findAll('.tile__value').map((n) => n.text())
    expect(values[0]).toContain('—')
  })

  it('分组列表包含「学习设置」「数据管理」「关于」三块', async () => {
    const { wrapper } = await mountMe()
    const titles = wrapper.findAll('.section-title').map((n) => n.text())
    expect(titles).toContain('学习设置')
    expect(titles).toContain('数据管理')
    expect(titles).toContain('关于')
  })
})

describe('我的 · 清空学习记录', () => {
  it('点击后弹页内确认条，且不依赖 window.confirm', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)

    const spy = vi.spyOn(window, 'confirm')
    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()

    expect(wrapper.find('.confirm').exists()).toBe(true)
  })

  it('确认前不删除数据', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(Object.keys(study.records).length).toBeGreaterThan(0)
  })

  it('点「确定清空」后记录真的被清空', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    study.markUnknown(2)
    expect(Object.keys(study.records).length).toBe(2)

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')

    expect(Object.keys(study.records).length).toBe(0)
    expect(study.reviewedCount).toBe(0)
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('点「取消」后数据保留、确认条收起', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    await wrapper.find('.confirm .btn--plain').trigger('click')

    expect(Object.keys(study.records).length).toBe(1)
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('清空成功后 localStorage 同步清掉', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS)
    expect(raw === null || raw === '{}').toBe(true)
  })

  it('清空成功后有轻提示反馈', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')
    expect(wrapper.find('.toast').exists()).toBe(true)
    expect(wrapper.find('.toast').text()).toContain('已清空学习记录')
  })
})

describe('我的 · 清空收藏', () => {
  it('点击后弹确认条，确认后收藏被清空', async () => {
    const { wrapper } = await mountMe()
    study.toggleFavorite(1)
    await flushPromises()
    expect(study.favorites.length).toBe(1)

    await rowByTitle(wrapper, '清空收藏').trigger('click')
    await flushPromises()
    expect(wrapper.find('.confirm').exists()).toBe(true)
    await wrapper.find('.confirm .btn--danger').trigger('click')

    expect(study.favorites.length).toBe(0)
  })

  it('取消则收藏保留', async () => {
    const { wrapper } = await mountMe()
    study.toggleFavorite(1)
    await flushPromises()
    await rowByTitle(wrapper, '清空收藏').trigger('click')
    await flushPromises()
    await wrapper.find('.confirm .btn--plain').trigger('click')
    expect(study.favorites.length).toBe(1)
  })

  it('没有收藏时该行禁用，不弹确认条', async () => {
    const { wrapper } = await mountMe()
    const row = rowByTitle(wrapper, '清空收藏')
    expect(row.attributes('disabled')).toBeDefined()

    await row.trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('两个确认条不会同时展开', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    study.toggleFavorite(1)
    await flushPromises()

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)

    await rowByTitle(wrapper, '清空收藏').trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)
    expect(wrapper.find('.confirm').text()).toContain('收藏')
  })
})

describe('我的 · 学习设置', () => {
  it('可以设置默认练习方式，并写入 localStorage', async () => {
    const { wrapper } = await mountMe()
    const prefButtons = wrapper.find('.seg').findAll('.seg__item')
    expect(prefButtons.map((b) => b.text())).toContain(STUDY_MODE_LABEL.memorize)

    const memorizeBtn = prefButtons.find((b) => b.text() === STUDY_MODE_LABEL.memorize)
    await memorizeBtn.trigger('click')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS))
    expect(saved.studyMode).toBe('memorize')
  })

  it('点击「外观主题」行循环切换主题', async () => {
    const { wrapper } = await mountMe()
    const before = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}').theme

    await rowByTitle(wrapper, '外观主题').trigger('click')
    await flushPromises()

    const after = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}').theme
    expect(after).not.toBe(before)
  })
})
