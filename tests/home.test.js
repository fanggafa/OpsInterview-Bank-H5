import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BankView from '@/views/BankView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { pickDailyQuestion } from '@/utils/daily'
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

describe('首页 · 快捷入口已移除', () => {
  it('不再渲染「开始刷题 / 模拟面试」快捷卡片（改为底部 Tab 进入）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.entry')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('模拟面试')
  })

  it('不再渲染「继续上次」卡片（续刷入口放在刷题页内）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.continue').exists()).toBe(false)
  })

  it('首页不再有分类列表（已换成每日一题）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.cats__item')).toHaveLength(0)
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

describe('首页 · 每日一题', () => {
  it('渲染每日一题卡片（替代原来的分类列表）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.daily').exists()).toBe(true)
    expect(wrapper.find('.daily__q').text().length).toBeGreaterThan(0)
  })

  it('不再渲染「按分类刷题」列表（点哪儿都跳同一个刷题页，信息量低）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.cats__item')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('按分类刷题')
  })

  it('同一天始终是同一题（不是随机刷新）', async () => {
    const { wrapper } = await mountHome()
    const first = wrapper.find('.daily__q').text()
    const second = await mountHome()
    expect(second.wrapper.find('.daily__q').text()).toBe(first)
  })

  it('点击进入题目详情页（与刷题页不重复）', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.find('.daily').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toMatch(/^\/question\/\d+$/)
  })

  it('未作答时不显示状态标签（区块标题已说明是每日一题）', async () => {
    const { wrapper } = await mountHome()
    // 未作答时挂一个同义徽标只是重复，还会把题干挤下去
    expect(wrapper.find('.daily__tag').exists()).toBe(false)
    // 题干成为卡片首行内容，不再被一行空白顶下去
    expect(wrapper.find('.daily__q').exists()).toBe(true)
  })

  it('日期显示在 hero 标题下方（年月日完整格式）', async () => {
    const { wrapper } = await mountHome()
    const date = wrapper.find('.hero__date')
    expect(date.exists()).toBe(true)
    // 必须带年份：只写「11月1日」不足以让人一眼认出是哪一年
    expect(date.text()).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/)
    // 日期不再挂在每日一题卡片上
    expect(wrapper.find('.daily__date').exists()).toBe(false)
  })

  it('今日答对后状态转绿并提示已作答', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date())
    study.markKnow(q.id)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.daily__tag--know').exists()).toBe(true)
    expect(wrapper.find('.daily__hint').text()).toContain('今天已作答')
  })

  it('今日答错后状态转红', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date())
    study.markUnknown(q.id)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.daily__tag--unknown').exists()).toBe(true)
  })

  it('昨天答过不算今天答过（不显示今日状态标签）', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date())
    // 手工塞一条「昨天」的记录
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    study.records = {
      ...study.records,
      [q.id]: { status: STATUS.KNOW, times: 1, lastReviewed: yesterday },
    }
    const { wrapper } = await mountHome()
    expect(wrapper.find('.daily__tag').exists()).toBe(false)
  })

  it('页脚说明题型构成', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.home-foot').text()).toContain('简答 3')
    expect(wrapper.find('.home-foot').text()).toContain('选择 1')
  })
})

describe('首页 · 不再承载「继续上次」', () => {
  it('无进度时不显示续刷卡片', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.find('.continue').exists()).toBe(false)
  })

  it('有进度时首页也不显示（续刷入口只在刷题页内）', async () => {
    study.saveProgress({ mode: 'random', studyMode: 'memorize', category: 'MySQL', index: 1 })
    const { wrapper } = await mountHome()
    expect(wrapper.find('.continue').exists()).toBe(false)
    // 首页文本里不应出现「继续上次」这类入口文案
    expect(wrapper.text()).not.toContain('继续上次')
  })
})

describe('首页 · 复习入口', () => {
  it('每日一刷是独立区块（在每日一题下方），不在复习巩固里', async () => {
    const { wrapper } = await mountHome()
    // 复习巩固容器里只剩错题复习与薄弱分类
    expect(wrapper.findAll('.reviews .review')).toHaveLength(2)
    // 每日一刷是独立的 .review--drill 卡
    expect(wrapper.findAll('.review--drill')).toHaveLength(1)
  })

  it('复习巩固里两个入口：错题复习 / 薄弱分类', async () => {
    const { wrapper } = await mountHome()
    const items = wrapper.findAll('.reviews .review')
    // 薄弱分类卡常驻（无数据时显示引导，不整卡隐藏）
    expect(items[0].text()).toContain('错题复习')
    expect(items[1].text()).toContain('薄弱分类')
  })

  it('每日一刷显示「随机 30 题选择题」', async () => {
    const { wrapper } = await mountHome()
    const card = wrapper.find('.review--drill')
    expect(card.text()).toContain('30 题')
    expect(card.text()).toContain('选择题')
  })

  it('点每日一刷跳到 review=dailyDrill', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.find('.review--drill').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.review).toBe('dailyDrill')
  })

  it('错题本为空时错题复习置灰不可点，并说明原因', async () => {
    const { wrapper } = await mountHome()
    const wrongBtn = wrapper.findAll('.review')[1]
    expect(wrongBtn.attributes('disabled')).toBeDefined()
    expect(wrongBtn.text()).toContain('错题本是空的')
  })

  it('有错题时可点，且文案带上实际抽题数', async () => {
    study.markUnknown(1)
    study.markUnknown(2)
    const { wrapper, router } = await mountHome()
    const wrongBtn = wrapper.findAll('.review')[1]
    expect(wrongBtn.attributes('disabled')).toBeUndefined()
    expect(wrongBtn.text()).toContain('抽 2 题')

    await wrongBtn.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.review).toBe('wrong')
  })

  it('错题超过 10 道时文案显示抽 10 题', async () => {
    // FIXTURE 只有 4 题，这里补到 12 道错题
    bank.questions = [
      ...FIXTURE,
      ...Array.from({ length: 8 }, (_, i) => ({
        id: 100 + i,
        type: 'short',
        category: 'Linux基础',
        difficulty: '中等',
        question: `q${100 + i}`,
        answer: 'a',
        frequency: '高频',
      })),
    ]
    bank.questions.forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.review')[1].text()).toContain('抽 10 题')
  })

  it('错题复习入口说明「连对 3 次移出」', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.review')[1].text()).toContain('连对 3 次移出')
  })
})
