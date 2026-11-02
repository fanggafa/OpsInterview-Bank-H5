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
import { STORAGE_KEYS } from '@/utils/constants'

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

  it('不再提供错题本 / 收藏入口（已搬到首页「我的题集」）', async () => {
    const { wrapper } = await mountMe()
    /**
     * 2026-11：错题本与收藏从「我的」页搬到首页 —— 它们是「题」而非「我的设置」，
     * 放首页与其他题目入口同段更好找。「我的」页只留数据看板 + 右上角设置。
     */
    expect(rowByTitle(wrapper, '错题本')).toBeFalsy()
    expect(rowByTitle(wrapper, '我的收藏')).toBeFalsy()
  })

  it('头部三格（已刷/错题/收藏）是纯展示，不再链去别的页面', async () => {
    const { wrapper } = await mountMe()
    /**
     * 入口搬到首页后，这三格若仍链到 /wrong、/favorites，
     * 等于「我的」页又偷偷保留了入口，与「只做数据看板」的定位矛盾。
     */
    const stats = wrapper.findAll('.profile__stat')
    expect(stats).toHaveLength(3)
    // 不该是 <a>（router-link 会被渲染成 a）
    for (const s of stats) expect(s.element.tagName).not.toBe('A')
    // 数值仍然看得见
    expect(stats.map((s) => s.find('.profile__label').text())).toEqual(['已刷', '错题', '收藏'])
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
    // 2026-11：只剩「各分类掌握度」一块（「各分类选择正确率」图表已移除）
    expect(collapses.length).toBe(1)
    expect(wrapper.find('.chart-card').exists()).toBe(false)
    expect(collapses[0].attributes('aria-expanded')).toBe('false')
  })

  it('点「各分类掌握度」后展开图表', async () => {
    const { wrapper } = await mountMe()
    await wrapper.findAll('.collapse')[0].trigger('click')
    expect(wrapper.find('.chart-card').exists()).toBe(true)
    expect(wrapper.findAll('.collapse')[0].attributes('aria-expanded')).toBe('true')
  })

  it('不再有「各分类选择正确率」图表（已随需求移除）', async () => {
    const { wrapper } = await mountMe()
    expect(wrapper.text()).not.toContain('各分类选择正确率')
  })

  it('各分类掌握度的顺序与题库页分类筛选顺序一致（CATEGORIES）', async () => {
    /**
     * 故意让题库里的分类顺序与 CATEGORIES 相反：
     * 题库遍历顺序会是 MySQL → 网络基础 → Linux基础，
     * 而 CATEGORIES 里是 Linux基础 → 网络基础 → …… → MySQL。
     * 图表必须跟随后者，否则两个页面的分类排列会跳来跳去。
     */
    const bank = useBankStore()
    bank.questions = [
      { id: 1, type: 'short', category: 'MySQL', difficulty: '简单', question: 'q', answer: 'a', tags: ['t'], frequency: '高频' },
      { id: 2, type: 'short', category: '网络基础', difficulty: '简单', question: 'q', answer: 'a', tags: ['t'], frequency: '高频' },
      { id: 3, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q', answer: 'a', tags: ['t'], frequency: '高频' },
    ]

    const { wrapper } = await mountMe()
    await wrapper.findAll('.collapse')[0].trigger('click')

    const labels = wrapper.findAll('.bar-row__label').map((n) => n.text())
    expect(labels).toEqual(['Linux基础', '网络基础', 'MySQL'])
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

describe('我的 · 设置只有右上角一个入口', () => {
  /**
   * 2026-11：这一页删掉了「我的题目」整块（错题本/收藏搬到首页）
   * 和「设置」整行（输出到页头齿轮）。
   *
   * 早先这里断言的是「设置行也是一个 .group 容器、与上面的卡对齐」——
   * 那组测试的前提（页面里有两组 .group）已经不存在了，
   * 现在改成断言「只剩一个齿轮入口、页面没有多余的分组行」。
   */
  it('设置入口只有页头右上角的齿轮按钮', async () => {
    const { wrapper } = await mountMe()
    // 页面里不该再有整行式设置入口
    expect(wrapper.find('.group').exists()).toBe(false)
    expect(wrapper.find('a[href*="/settings"]').exists()).toBe(true)
    // 齿轮在页头里
    expect(wrapper.find('.header').find('a[href*="/settings"]').exists()).toBe(true)
  })

  it('不再保留 .row--entry（曾导致卡片宽出 28px、与上图对不齐）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    expect(src).not.toMatch(/\.row--entry\s*\{/)
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

  it('不再有「默认练习方式」（该开关从未被读取，已移除）', async () => {
    const { wrapper } = await mountSettings()
    // 之前这里是个死开关：写进 oi_settings 却没人读，
    // PracticeView 用的是硬编码 DEFAULT_STUDY_MODE，所以删掉而不是修。
    expect(wrapper.text()).not.toContain('默认练习方式')
    // 设置里不应再写入 studyMode
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
    expect(saved.studyMode).toBeUndefined()
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
