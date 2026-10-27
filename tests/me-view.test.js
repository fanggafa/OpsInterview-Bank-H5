import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import MeView from '@/views/MeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STORAGE_KEYS, STUDY_MODE_LABEL } from '@/utils/constants'

/**
 * 回归：「我的」页的清空按钮点击无效。
 *
 * 根因：用 window.confirm 做二次确认。微信内置浏览器、部分安卓 WebView、
 * 以及「禁止弹窗」的设置下，confirm 会静默返回 false 或根本不弹，
 * 表现为「点了没反应」。
 *
 * 修复：改成页内确认条（渲染在 DOM 里），任何环境下都能显示与点击。
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

/** 找到「清空学习记录 / 清空收藏」两个动作按钮 */
function actions(wrapper) {
  return wrapper.findAll('.list__row--action')
}

describe('我的 · 清空学习记录', () => {
  it('点击后弹页内确认条，且不依赖 window.confirm', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)

    const spy = vi.spyOn(window, 'confirm')
    await actions(wrapper)[0].trigger('click')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()

    expect(wrapper.find('.confirm').exists()).toBe(true)
  })

  it('确认前不删除数据（二次确认生效）', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await actions(wrapper)[0].trigger('click')
    expect(Object.keys(study.records).length).toBeGreaterThan(0)
  })

  it('点「确定清空」后记录真的被清空', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    study.markUnknown(2)
    expect(Object.keys(study.records).length).toBe(2)

    await actions(wrapper)[0].trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')

    expect(Object.keys(study.records).length).toBe(0)
    expect(study.reviewedCount).toBe(0)
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('点「取消」后数据保留、确认条收起', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)

    await actions(wrapper)[0].trigger('click')
    await wrapper.find('.confirm .btn--plain').trigger('click')

    expect(Object.keys(study.records).length).toBe(1)
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('清空后 localStorage 也被同步清掉（不只是内存态）', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await actions(wrapper)[0].trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')
    // writeJSON 是立即写入（clearRecords 用 writeJSON 而非节流版）
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS)
    expect(raw === null || raw === '{}').toBe(true)
  })

  it('清空成功后有轻提示反馈', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    await actions(wrapper)[0].trigger('click')
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

    await actions(wrapper)[1].trigger('click')
    await flushPromises()
    expect(wrapper.find('.confirm').exists()).toBe(true)
    await wrapper.find('.confirm .btn--danger').trigger('click')

    expect(study.favorites.length).toBe(0)
  })

  it('取消则收藏保留', async () => {
    const { wrapper } = await mountMe()
    study.toggleFavorite(1)
    await flushPromises()
    await actions(wrapper)[1].trigger('click')
    await flushPromises()
    await wrapper.find('.confirm .btn--plain').trigger('click')
    expect(study.favorites.length).toBe(1)
  })

  it('没有收藏时按钮禁用，不弹确认条', async () => {
    const { wrapper } = await mountMe()
    const btn = actions(wrapper)[1]
    expect(btn.attributes('disabled')).toBeDefined()

    await btn.trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('两个确认条不会同时展开', async () => {
    const { wrapper } = await mountMe()
    study.markKnow(1)
    study.toggleFavorite(1)

    await actions(wrapper)[0].trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)

    await actions(wrapper)[1].trigger('click')
    expect(wrapper.findAll('.confirm')).toHaveLength(1)
    expect(wrapper.find('.confirm').text()).toContain('收藏')
  })
})

describe('我的 · 页面内容', () => {
  it('显示数据概览（已刷题 / 掌握率 / 正确率 / 今日）', async () => {
    const { wrapper } = await mountMe()
    const labels = wrapper.findAll('.overview__label').map((n) => n.text())
    expect(labels).toEqual(['已刷题', '掌握率', '正确率', '今日'])
  })

  it('未作答时掌握率显示「—」而不是 0%', async () => {
    const { wrapper } = await mountMe()
    const values = wrapper.findAll('.overview__value').map((n) => n.text())
    expect(values[1]).toContain('—')
  })

  it('快捷入口含开始刷题与背题模式', async () => {
    const { wrapper } = await mountMe()
    const titles = wrapper.findAll('.quick__title').map((n) => n.text())
    expect(titles).toContain('开始刷题')
    expect(titles).toContain('背题模式')
  })

  it('点「背题模式」跳到刷题页并带上 studyMode=memorize', async () => {
    const { wrapper, router } = await mountMe()
    const btn = wrapper.findAll('.quick__item')[1]
    await btn.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.studyMode).toBe('memorize')
  })

  it('错题本 / 收藏 显示各自数量', async () => {
    const { wrapper } = await mountMe()
    study.markUnknown(2)
    study.toggleFavorite(1)
    await flushPromises()
    const badges = wrapper.findAll('.quick__badge').map((n) => n.text())
    expect(badges).toContain('1')
  })

  it('可以设置默认练习方式，并写入 localStorage', async () => {
    const { wrapper } = await mountMe()
    // 「默认练习方式」是第二组分段控件
    const segs = wrapper.findAll('.seg')
    const prefButtons = segs[1].findAll('.seg__item')
    expect(prefButtons.map((b) => b.text())).toContain(STUDY_MODE_LABEL.memorize)

    const memorizeBtn = prefButtons.find((b) => b.text() === STUDY_MODE_LABEL.memorize)
    await memorizeBtn.trigger('click')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS))
    expect(saved.studyMode).toBe('memorize')
  })
})
