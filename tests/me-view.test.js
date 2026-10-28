import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import MeView from '@/views/MeView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STORAGE_KEYS, STUDY_MODE_LABEL } from '@/utils/constants'

/**
 * 「我的」页与「设置」页的职责划分：
 *
 * - 我的：个人卡、掌握情况、分类图表（折叠）、错题本/收藏入口、设置入口
 * - 设置：外观主题、默认练习方式、清空数据、关于
 *
 * 关键回归仍是「清空必须用页内确认，不能依赖 window.confirm」——
 * 微信内置浏览器下 confirm 会静默返回 false，表现为「点了没反应」。
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
      { path: '/settings', component: SettingsView },
      { path: '/practice', component: MeView },
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

async function mountAt(path, component) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(component, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

const mountMe = () => mountAt('/me', MeView)
const mountSettings = () => mountAt('/settings', SettingsView)

/** 按行标题找行（.row 内 .row__title） */
function rowByTitle(wrapper, title) {
  return wrapper
    .findAll('.row')
    .find((r) => r.find('.row__title').exists() && r.find('.row__title').text() === title)
}

describe('我的 · 页面结构', () => {
  it('顶部个人卡：头像 + 总进度 + 三格数字', async () => {
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

  it('页头右侧有设置入口，指向 /settings', async () => {
    const { wrapper } = await mountMe()
    const entry = wrapper.find('.me__settings')
    expect(entry.exists()).toBe(true)
    expect(entry.attributes('href')).toContain('/settings')
  })

  it('提供错题本与收藏入口', async () => {
    const { wrapper } = await mountMe()
    expect(rowByTitle(wrapper, '错题本')).toBeTruthy()
    expect(rowByTitle(wrapper, '我的收藏')).toBeTruthy()
  })

  it('不再直接展示设置项（已搬到设置页）', async () => {
    const { wrapper } = await mountMe()
    expect(rowByTitle(wrapper, '外观主题')).toBeFalsy()
    expect(rowByTitle(wrapper, '清空学习记录')).toBeFalsy()
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })
})

describe('我的 · 分类图表默认折叠', () => {
  it('默认不渲染图表，标题可点', async () => {
    const { wrapper } = await mountMe()
    const collapses = wrapper.findAll('.collapse')
    expect(collapses.length).toBe(2)
    expect(wrapper.find('.chart-card').exists()).toBe(false)
    expect(collapses[0].attributes('aria-expanded')).toBe('false')
  })

  it('点「各分类掌握度」后展开图表', async () => {
    const { wrapper } = await mountMe()
    await wrapper.findAll('.collapse')[0].trigger('click')
    expect(wrapper.find('.chart-card').exists()).toBe(true)
    expect(wrapper.findAll('.collapse')[0].attributes('aria-expanded')).toBe('true')
  })

  it('两块图表可独立展开', async () => {
    const { wrapper } = await mountMe()
    await wrapper.findAll('.collapse')[1].trigger('click')
    expect(wrapper.findAll('.chart-card').length).toBe(1)
    await wrapper.findAll('.collapse')[0].trigger('click')
    expect(wrapper.findAll('.chart-card').length).toBe(2)
  })

  it('折叠条是卡片式（带 bg/border/padding），不是裸文字', () => {
    // 回归：早先只写了 padding: 0 2px + 无边框，视觉上像普通小标题
    const src = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    const collapseBlock = src.slice(src.indexOf('.collapse {'), src.indexOf('.collapse:active'))
    expect(collapseBlock).toMatch(/border:\s*1px solid var\(--c-border\)/)
    expect(collapseBlock).toMatch(/background:\s*var\(--c-card\)/)
    expect(collapseBlock).toMatch(/border-radius:\s*var\(--radius\)/)
    expect(collapseBlock).toMatch(/padding:\s*0 14px/)
  })

  it('展开时折叠条与图表卡贴合（去掉中间圆角）', async () => {
    const { wrapper } = await mountMe()
    await wrapper.findAll('.collapse')[0].trigger('click')
    expect(wrapper.findAll('.collapse')[0].classes()).toContain('collapse--open')
    expect(wrapper.find('.chart-card').classes()).toContain('chart-card--attached')
  })
})

describe('我的 · 设置入口与「我的题目」卡片对齐', () => {
  it('设置入口也用 .group 容器包裹（宽度来源与上面的卡一致）', async () => {
    const { wrapper } = await mountMe()
    const groups = wrapper.findAll('.group')
    // 「我的题目」一组 + 「设置」一组 = 2
    expect(groups.length).toBe(2)

    const settingsGroup = groups[1]
    const entry = settingsGroup.find('a[href*="/settings"]')
    expect(entry.exists()).toBe(true)
    // 行本身不再自带左右 padding —— 交给 .group 统一提供
    expect(entry.classes()).not.toContain('row--entry')
  })

  it('不再保留 .row--entry（曾导致卡片宽出 28px、与上图对不齐）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    expect(src).not.toMatch(/\.row--entry\s*\{/)
  })

  it('设置入口是一个可点的链接行，包含图标/标题/描述/箭头', async () => {
    const { wrapper } = await mountMe()
    // 页头还有一个齿轮入口，这里要的是 .group 里的那一行
    const entry = wrapper.find('.group a[href*="/settings"]')
    expect(entry.exists()).toBe(true)
    expect(entry.find('.row__icon').exists()).toBe(true)
    expect(entry.find('.row__title').text()).toBe('设置')
    expect(entry.find('.row__desc').exists()).toBe(true)
    expect(entry.find('.row__chev').exists()).toBe(true)
  })
})

describe('设置 · 外观与练习方式', () => {
  it('主题是三态分段控件，点击写入 localStorage', async () => {
    const { wrapper } = await mountSettings()
    const segButtons = wrapper.findAll('.seg')[0].findAll('.seg__item')
    expect(segButtons).toHaveLength(3)

    await segButtons[1].trigger('click')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).theme).toBe('dark')
  })

  it('可以设置默认练习方式', async () => {
    const { wrapper } = await mountSettings()
    const prefButtons = wrapper.findAll('.seg')[1].findAll('.seg__item')
    expect(prefButtons.map((b) => b.text())).toContain(STUDY_MODE_LABEL.memorize)

    const memorizeBtn = prefButtons.find((b) => b.text() === STUDY_MODE_LABEL.memorize)
    await memorizeBtn.trigger('click')

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS))
    expect(saved.studyMode).toBe('memorize')
  })
})

describe('设置 · 清空数据用页内确认', () => {
  it('点击后弹页内确认条，不调用 window.confirm', async () => {
    const { wrapper } = await mountSettings()
    study.markKnow(1)
    await flushPromises()

    const confirmRow = rowByTitle(wrapper, '清空学习记录')
    expect(confirmRow).toBeTruthy()

    // 不依赖 window.confirm（微信/WebView 下会静默失效）
    const spy = globalThis.vi?.spyOn ? globalThis.vi.spyOn(window, 'confirm') : null
    await confirmRow.trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(true)
    if (spy) {
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    }
  })

  it('确认前不删除数据，取消后数据仍在', async () => {
    const { wrapper } = await mountSettings()
    study.markKnow(1)
    await flushPromises()
    const before = Object.keys(study.records).length

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    expect(Object.keys(study.records).length).toBe(before)

    await wrapper.find('.confirm .btn--plain').trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
    expect(Object.keys(study.records).length).toBe(before)
  })

  it('点「确定清空」后记录被清空并同步 localStorage', async () => {
    const { wrapper } = await mountSettings()
    study.markKnow(1)
    study.markUnknown(2)
    await flushPromises()
    expect(Object.keys(study.records).length).toBe(2)

    await rowByTitle(wrapper, '清空学习记录').trigger('click')
    await wrapper.find('.confirm .btn--danger').trigger('click')

    expect(Object.keys(study.records).length).toBe(0)
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS)
    expect(raw === null || raw === '{}').toBe(true)
  })

  it('没有收藏时「清空收藏」行禁用', async () => {
    const { wrapper } = await mountSettings()
    const row = rowByTitle(wrapper, '清空收藏')
    expect(row.attributes('disabled')).toBeDefined()
    await row.trigger('click')
    expect(wrapper.find('.confirm').exists()).toBe(false)
  })

  it('两个确认条不会同时展开', async () => {
    const { wrapper } = await mountSettings()
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
