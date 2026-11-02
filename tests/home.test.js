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

/**
 * 按卡片标题找入口卡。
 *
 * 为什么不用索引：首页的卡片顺序会随产品调整而变（2026-11 就把「错题本」
 * 插到了「错题复习」前面），用 `findAll('.review')[1]` 这类写法会在每次
 * 重排时全部错位。按标题找，重排不影响断言。
 */
function reviewBy(wrapper, title) {
  const found = wrapper.findAll('.review').find((r) => r.find('.review__title').text() === title)
  // 找不到时给出清晰报错，而不是让后续 .attributes() 抛「undefined」
  expect(found, `首页应有一张标题为「${title}」的卡片`).toBeTruthy()
  return found
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

describe('首页 · 每日一记', () => {
  /**
   * 2026-11：每日一记卡片改成**与其它卡片同构**（.review 骨架）。
   *
   * 早先它是独立版式：.daily 卡片 + 左上状态胶囊 + 纯文字标题 + 题干 + meta 徽标。
   * 放在「我的收藏 / 每日一刷 / 错题本」这些卡中间，明显是两套东西 ——
   * 没图标、标题跟题干挤在一行、卡片间距也不同。用户反馈「太乱了」。
   *
   * 现在：图标 + 标题 + 副标题 + 行尾箭头，和其它卡完全一致。
   * 题干摘要移进副标题（作答后显示「状态 · 题干」）。
   */
  it('渲染每日一记卡片，与其它卡片同构', async () => {
    const { wrapper } = await mountHome()
    const card = wrapper.find('.review--daily')
    expect(card.exists()).toBe(true)
    // 同一套骨架：图标 + 标题 + 副标题 + 箭头
    expect(card.find('.review__icon').exists()).toBe(true)
    expect(card.find('.review__title').text()).toBe('每日一记')
    expect(card.find('.review__desc').exists()).toBe(true)
    expect(card.find('.review__arrow').exists()).toBe(true)
    // 旧版式已移除
    expect(wrapper.find('.daily').exists()).toBe(false)
    expect(wrapper.find('.daily__q').exists()).toBe(false)
  })

  it('不再渲染「按分类刷题」列表（点哪儿都跳同一个刷题页，信息量低）', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.findAll('.cats__item')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('按分类刷题')
  })

  it('同一天始终是同一题（不是随机刷新）', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date(), { types: ['short'] })
    const { wrapper } = await mountHome()
    // 副标题在未作答时是固定文案；这里验证挑题是确定性的
    const second = await mountHome()
    expect(second.wrapper.vm.daily.id).toBe(q.id)
    expect(wrapper.vm.daily.id).toBe(q.id)
  })

  it('点击进入题目详情页（与刷题页不重复）', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.find('.review--daily').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toMatch(/^\/question\/\d+$/)
  })

  it('未作答时显示题干，且不显示状态胶囊', async () => {
    const { wrapper } = await mountHome()
    /**
     * 2026-11：这张卡**不要副标题**，只显示题干 ——
     * 题干才是用户关心的（今天记哪道题），
     * 「每天一道 · 看完答案再自评」那种说明文案纯占地方。
     */
    const desc = wrapper.find('.review--daily .review__desc--question').text()
    expect(desc.length).toBeGreaterThan(0)
    // 未作答时没有状态胶囊
    expect(wrapper.find('.review--daily .review__state').exists()).toBe(false)
  })

  it('日期显示在 hero 标题下方（年月日完整格式）', async () => {
    const { wrapper } = await mountHome()
    const date = wrapper.find('.hero__date')
    expect(date.exists()).toBe(true)
    // 必须带年份：只写「11月1日」不足以让人一眼认出是哪一年
    expect(date.text()).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/)
  })

  it('今日标记「会」后，标题旁出现状态胶囊', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date(), { types: ['short'] })
    study.markKnow(q.id)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.review--daily .review__state').text()).toContain('会')
    // 题干摘要仍在，让用户不点进去也知道是哪道题
    expect(wrapper.find('.review--daily .review__desc--question').text().length).toBeGreaterThan(0)
  })

  it('今日标记「不会」后，标题旁出现对应状态胶囊', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date(), { types: ['short'] })
    study.markUnknown(q.id)
    const { wrapper } = await mountHome()
    expect(wrapper.find('.review--daily .review__state').text()).toContain('不会')
  })

  it('昨天答过不算今天答过（不显示状态胶囊）', async () => {
    const q = pickDailyQuestion(FIXTURE, new Date(), { types: ['short'] })
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    study.records = {
      ...study.records,
      [q.id]: { status: STATUS.KNOW, times: 1, lastReviewed: yesterday },
    }
    const { wrapper } = await mountHome()
    expect(wrapper.find('.review--daily .review__state').exists()).toBe(false)
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
  it('刷一刷题区共 4 张卡，同一容器内间距一致', async () => {
    const { wrapper } = await mountHome()
    /**
     * 2026-11 区块重排：`.reviews` 现在只有两组 ——
     * ① 背一背题（每日一记 + 我的收藏，2 张）
     * ② 刷一刷题（每日一刷30题 + 每日复习30题 + 错题本 + 薄弱分类，4 张）
     *
     * 早先「每日一刷」和「复习组」各用一个 `.reviews`，两个容器相邻却没有外边距，
     * 结果它们之间是 0px、组内其它卡是 8px —— 看着就是「间距不对」。
     * 现在同区块的卡都在一个容器里，共用一个 gap。
     */
    expect(wrapper.findAll('.reviews .review')).toHaveLength(6)
    const groups = wrapper.findAll('.reviews')
    expect(groups).toHaveLength(2)
    expect(groups[1].findAll('.review')).toHaveLength(4)
  })

  it('首页分成「背一背题」「刷一刷题」两个区块', async () => {
    /**
     * 2026-11：首页按**使用方式**分成两个大区块：
     * - 背一背题：每日一记 + 我的收藏（收藏只收简答题）
     * - 刷一刷题：每日一刷30题 + 每日复习30题 / 错题本 / 薄弱分类
     *
     * 2026-11 二次调整：**取消了所有子标题**（`.section-sub`）——
     * 「每日一记」「我的收藏」「每日一刷」「复习巩固」这些名字，
     * 要么本身就是卡片标题（重复），要么只是把几张卡归个类（没必要另起一行）。
     * 现在只有两个大区块标题 + 每张卡自己的标题。
     */
    const { wrapper } = await mountHome()
    const titles = wrapper.findAll('.section-title').map((n) => n.text())
    expect(titles).toEqual(['背一背题', '刷一刷题'])

    // 不再有任何子标题
    expect(wrapper.findAll('.section-sub')).toHaveLength(0)
  })

  it('刷一刷题区按「每日一刷30题 → 每日复习30题 → 错题本 → 薄弱分类」排列', async () => {
    const { wrapper } = await mountHome()
    // 取最后一个 .reviews（刷一刷题区，4 张卡）
    const groups = wrapper.findAll('.reviews')
    const last = groups[groups.length - 1]
    const items = last.findAll('.review')
    /**
     * 2026-11 调整：**每日复习30题（原「错题复习」）排到第二**，错题本退到第三 ——
     * 每日复习是「现在就练一批」的动作，错题本是「看看有哪些题要补」的清单，
     * 先练再翻清单更顺手。
     */
    expect(items[0].text()).toContain('每日一刷30题')
    expect(items[1].text()).toContain('每日复习30题')
    expect(items[2].text()).toContain('错题本')
    expect(items[3].text()).toContain('薄弱分类')
  })

  it('每日一刷显示「随机 30 题选择题」', async () => {
    const { wrapper } = await mountHome()
    const card = wrapper.findAll('.review').find((c) => c.text().includes('每日一刷30题'))
    expect(card.text()).toContain('每日一刷30题')
    expect(card.text()).toContain('选择题')
  })

  it('点每日一刷跳到 review=dailyDrill', async () => {
    const { wrapper, router } = await mountHome()
    await wrapper.findAll('.review').find((c) => c.text().includes('每日一刷30题')).trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.review).toBe('dailyDrill')
  })

  it('错题本为空时错题复习置灰不可点，并说明原因', async () => {
    const { wrapper } = await mountHome()
    const wrongBtn = reviewBy(wrapper, '每日复习30题')
    expect(wrongBtn.attributes('disabled')).toBeDefined()
    expect(wrongBtn.text()).toContain('错题本为空')
  })

  it('有错题时可点，且文案带上实际抽题数', async () => {
    // 错题本只收选择题：用 id=4（single）造一道错题
    study.markUnknown(4)
    const { wrapper, router } = await mountHome()
    const wrongBtn = reviewBy(wrapper, '每日复习30题')
    expect(wrongBtn.attributes('disabled')).toBeUndefined()
    expect(wrongBtn.text()).toContain('抽 1 题')

    await wrongBtn.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.review).toBe('wrong')
  })

  it('错题超过 10 道时文案显示抽 10 题', async () => {
    // 错题本只收选择题，所以这里补的都是 single 题
    bank.questions = [
      ...FIXTURE,
      ...Array.from({ length: 12 }, (_, i) => ({
        id: 100 + i,
        type: 'single',
        category: 'Linux基础',
        difficulty: '中等',
        question: `q${100 + i}`,
        answer: ['A'],
        options: [
          { key: 'A', text: 'a' },
          { key: 'B', text: 'b' },
        ],
        frequency: '高频',
      })),
    ]
    bank.questions.filter((q) => q.type === 'single').forEach((q) => study.markUnknown(q.id))
    const { wrapper } = await mountHome()
    expect(reviewBy(wrapper, '每日复习30题').text()).toContain('抽 10 题')
  })

  it('错题复习入口说明「连对 3 次移出」', async () => {
    // 错题本只收选择题，用 single 题造错题
    study.markUnknown(4)
    const { wrapper } = await mountHome()
    expect(reviewBy(wrapper, '每日复习30题').text()).toContain('连对3次移出')
  })
})
