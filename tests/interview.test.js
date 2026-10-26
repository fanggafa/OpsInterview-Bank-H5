import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import InterviewSetupView from '@/views/InterviewSetupView.vue'
import InterviewRunView from '@/views/InterviewRunView.vue'
import InterviewResultView from '@/views/InterviewResultView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { useInterviewStore } from '@/stores/interviewStore'
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
  {
    id: 5,
    type: 'multiple',
    category: 'Redis',
    difficulty: '困难',
    question: 'c2',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }],
    answer: ['A', 'C'],
    explanation: '解析内容足够长，便于通过校验。',
    tags: ['t'],
    frequency: '中频',
  },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/stats', component: HomeView },
      { path: '/practice', component: HomeView },
      { path: '/bank', component: HomeView },
      { path: '/interview', component: InterviewSetupView },
      { path: '/interview/run', component: InterviewRunView },
      { path: '/interview/result', component: InterviewResultView },
    ],
  })
}

let pinia
let bank
let study
let interview

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
  interview = useInterviewStore()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
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

describe('interviewStore · 会话生成', () => {
  it('默认 10 题，题库不足时按题库量出题', () => {
    interview.start({ size: 10 })
    expect(interview.total).toBe(5)
  })

  it('题目不重复', () => {
    interview.start({ size: 5 })
    expect(new Set(interview.ids).size).toBe(interview.ids.length)
  })

  it('按分类范围抽题', () => {
    interview.start({ size: 10, categories: ['MySQL'] })
    const cats = interview.ids.map((id) => bank.getById(id).category)
    expect(cats.every((c) => c === 'MySQL')).toBe(true)
    expect(interview.total).toBe(2)
  })

  it('空范围返回全部', () => {
    interview.start({ size: 5, categories: [] })
    expect(interview.total).toBe(5)
  })

  it('指定题数小于题库时按指定数出题', () => {
    interview.start({ size: 2 })
    expect(interview.total).toBe(2)
  })

  it('非法分类返回失败且空会话', () => {
    expect(interview.start({ size: 5, categories: ['不存在'] })).toBe(false)
    expect(interview.total).toBe(0)
    expect(interview.active).toBe(false)
  })
})

describe('interviewStore · 得分口径', () => {
  it('得分 = 答对 / 总题数（含未答）', () => {
    interview.start({ size: 4 })
    // 答对 2 题，其余未答
    interview.answer(interview.ids[0], STATUS.KNOW)
    interview.answer(interview.ids[1], STATUS.KNOW)
    expect(interview.result.score).toBe(50)
    expect(interview.result.know).toBe(2)
    expect(interview.result.unanswered).toBe(2)
  })

  it('全对为 100 分', () => {
    interview.start({ size: 3 })
    interview.ids.forEach((id) => interview.answer(id, STATUS.KNOW))
    expect(interview.result.score).toBe(100)
  })

  it('已答正确率与得分区分开（未答完时两者不同）', () => {
    interview.start({ size: 4 })
    interview.answer(interview.ids[0], STATUS.KNOW)
    interview.answer(interview.ids[1], STATUS.UNKNOWN)
    // 已答 2 题，对 1 → accuracy 50；总 4 题，对 1 → score 25
    expect(interview.result.accuracy).toBe(50)
    expect(interview.result.score).toBe(25)
  })

  it('未作答时 accuracy 为 null', () => {
    interview.start({ size: 3 })
    expect(interview.result.accuracy).toBeNull()
  })

  it('分类正确率按分类聚合', () => {
    interview.start({ size: 5 })
    const linux = interview.ids.filter((id) => bank.getById(id).category === 'Linux基础')
    linux.forEach((id) => interview.answer(id, STATUS.KNOW))
    const mysqlShort = interview.ids.filter(
      (id) => bank.getById(id).category === 'MySQL' && bank.getById(id).type !== 'single' && bank.getById(id).type !== 'multiple'
    )
    mysqlShort.forEach((id) => interview.answer(id, STATUS.UNKNOWN))

    const r = interview.result
    const linuxStat = r.categories.find((c) => c.category === 'Linux基础')
    expect(linuxStat.rate).toBe(100)
    if (mysqlShort.length) {
      const mysqlStat = r.categories.find((c) => c.category === 'MySQL')
      expect(mysqlStat.know).toBe(0)
    }
  })

  it('薄弱分类按正确率升序，最多 3 个', () => {
    interview.start({ size: 5 })
    interview.ids.forEach((id) => interview.answer(id, STATUS.UNKNOWN))
    expect(interview.result.weakCategories.length).toBeLessThanOrEqual(3)
    const rates = interview.result.weakCategories.map((c) => c.rate)
    expect(rates).toEqual([...rates].sort((a, b) => a - b))
  })

  it('全对时薄弱分类为空', () => {
    interview.start({ size: 3 })
    interview.ids.forEach((id) => interview.answer(id, STATUS.KNOW))
    expect(interview.result.weakCategories).toEqual([])
  })
})

describe('interviewStore · 选择题判定', () => {
  it('单选题答对记 know', () => {
    interview.start({ size: 5 })
    // 直接构造：把 current 指向 id=4
    interview.ids = [4]
    interview.cursor = 0
    const res = interview.submitChoice(['A'])
    expect(res.passed).toBe(true)
    expect(interview.answers[4]).toBe(STATUS.KNOW)
  })

  it('单选题答错记 unknown', () => {
    interview.start({ size: 5 })
    interview.ids = [4]
    interview.cursor = 0
    const res = interview.submitChoice(['B'])
    expect(res.passed).toBe(false)
    expect(interview.answers[4]).toBe(STATUS.UNKNOWN)
  })

  it('多选漏选判错', () => {
    interview.ids = [5]
    interview.cursor = 0
    expect(interview.submitChoice(['A']).passed).toBe(false)
  })

  it('多选全对判对', () => {
    interview.ids = [5]
    interview.cursor = 0
    expect(interview.submitChoice(['A', 'C']).passed).toBe(true)
  })

  it('空选择返回 null 且不推进', () => {
    interview.ids = [4]
    interview.cursor = 0
    expect(interview.submitChoice([])).toBeNull()
    expect(interview.cursor).toBe(0)
  })
})

describe('interviewStore · 落库时机', () => {
  it('中途作答不写入 study records', () => {
    interview.start({ size: 3 })
    interview.submit(STATUS.KNOW)
    expect(Object.keys(study.records)).toHaveLength(0)
  })

  it('commitToStudy 一次性写入', () => {
    interview.start({ size: 3 })
    interview.ids.forEach((id) => interview.answer(id, STATUS.KNOW))
    interview.commitToStudy()
    expect(study.reviewedCount).toBe(3)
  })

  it('未作答的题不写入（不影响统计）', () => {
    interview.start({ size: 3 })
    interview.answer(interview.ids[0], STATUS.KNOW)
    interview.commitToStudy()
    expect(study.reviewedCount).toBe(1)
  })
})

describe('设置页', () => {
  it('默认 10 题选中，显示可选题量', async () => {
    const { wrapper } = await mountView(InterviewSetupView, '/interview')
    expect(wrapper.find('.sizes__item--on').text()).toBe('10')
    expect(wrapper.text()).toContain('5 道') // poolSize
  })

  it('题数超过可选题量时按题库量出题并提示', async () => {
    const { wrapper } = await mountView(InterviewSetupView, '/interview')
    // 夹具 5 题，默认 10
    expect(wrapper.find('.summary__size').text()).toBe('5 道')
    expect(wrapper.text()).toContain('只有 5 道题')
  })

  it('选择分类后范围与可选题量随之更新', async () => {
    const { wrapper } = await mountView(InterviewSetupView, '/interview')
    const mysqlTab = wrapper.findAll('.chip-grid .chip').find((c) => c.text().includes('MySQL'))
    await mysqlTab.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('1 个分类')
    expect(wrapper.find('.summary__size').text()).toBe('2 道')
  })

  it('全选按钮切换全部/清空', async () => {
    const { wrapper } = await mountView(InterviewSetupView, '/interview')
    const allBtn = wrapper.findAll('.range-btn')[0]
    await allBtn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('3 个分类')

    await allBtn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('全部分类')
  })

  it('点击开始生成会话并跳转答题页', async () => {
    const { wrapper, router } = await mountView(InterviewSetupView, '/interview')
    await wrapper.find('.start-btn').trigger('click')
    await flushPromises()
    expect(interview.active).toBe(true)
    expect(router.currentRoute.value.path).toBe('/interview/run')
  })
})

describe('答题页', () => {
  it('显示进度与题目', async () => {
    interview.start({ size: 3 })
    interview.ids = [1, 2, 3]
    interview.cursor = 0
    const { wrapper } = await mountView(InterviewRunView, '/interview/run')
    expect(wrapper.text()).toContain('第 1 / 3 题')
    expect(wrapper.find('.qcard-p__q').text()).toBeTruthy()
  })

  it('简答题自评后推进到下一题', async () => {
    interview.start({ size: 3 })
    // 指定为简答题，避免随机抽到选择题导致操作区没有自评按钮
    interview.ids = [1, 2, 3]
    interview.cursor = 0
    const { wrapper } = await mountView(InterviewRunView, '/interview/run')
    const firstId = interview.currentId
    expect(firstId).toBe(1)

    await wrapper.findAll('.actions__btn')[1].trigger('click') // 会
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(interview.answers[firstId]).toBe(STATUS.KNOW)
    expect(interview.cursor).toBe(1)
  })

  it('最后一题自评后跳转结果页', async () => {
    interview.start({ size: 1 })
    interview.ids = [1] // 确保是简答题
    interview.cursor = 0
    const { wrapper, router } = await mountView(InterviewRunView, '/interview/run')
    await wrapper.findAll('.actions__btn')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/interview/result')
  })

  it('选择题显示选项而非自评按钮', async () => {
    interview.start({ size: 5 })
    interview.ids = [4]
    interview.cursor = 0
    const { wrapper } = await mountView(InterviewRunView, '/interview/run')
    expect(wrapper.findAll('.option')).toHaveLength(2)
    expect(wrapper.findAll('.actions__btn')).toHaveLength(0)
  })

  it('多选题需提交，未选时按钮禁用', async () => {
    interview.ids = [5]
    interview.cursor = 0
    const { wrapper } = await mountView(InterviewRunView, '/interview/run')
    const btn = wrapper.find('.actions__submit')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('退出需确认，确认后清空会话', async () => {
    interview.start({ size: 3 })
    interview.ids = [1, 2, 3]
    interview.cursor = 0
    const { wrapper, router } = await mountView(InterviewRunView, '/interview/run')
    const spy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await wrapper.find('.quit').trigger('click')
    await flushPromises()
    expect(interview.active).toBe(false)
    expect(router.currentRoute.value.path).toBe('/interview')
    spy.mockRestore()
  })
})

describe('结果页', () => {
  async function mountResultWithAnswers(answers) {
    interview.start({ size: answers.length })
    interview.ids = Object.keys(answers).map(Number)
    Object.entries(answers).forEach(([id, status]) => interview.answer(Number(id), status))
    return mountView(InterviewResultView, '/interview/result')
  }

  it('显示得分、对错数与定性结论', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.KNOW, 2: STATUS.KNOW, 3: STATUS.KNOW })
    expect(wrapper.find('.ring__text').text()).toBe('100%')
    expect(wrapper.text()).toContain('表现优秀')
    expect(wrapper.text()).toContain('对 3')
  })

  it('低分给出「需要重点复习」', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.UNKNOWN, 2: STATUS.UNKNOWN, 3: STATUS.KNOW })
    expect(wrapper.text()).toContain('需要重点复习')
  })

  it('标注为自评评估，不宣传 AI 判分', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.KNOW })
    expect(wrapper.text()).toContain('自评评估')
    expect(wrapper.text()).not.toMatch(/AI\s*判分/)
  })

  it('展示薄弱分类建议文案', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.UNKNOWN })
    expect(wrapper.findAll('.advice__item').length).toBeGreaterThan(0)
    expect(wrapper.find('.advice__text').text().length).toBeGreaterThan(10)
  })

  it('全对时显示无明显薄弱的提示', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.KNOW, 2: STATUS.KNOW })
    expect(wrapper.find('.done-tip').exists()).toBe(true)
  })

  it('逐题回顾列出全部题目与对错标签', async () => {
    const { wrapper } = await mountResultWithAnswers({ 1: STATUS.KNOW, 2: STATUS.UNKNOWN })
    const items = wrapper.findAll('.review__item')
    expect(items).toHaveLength(2)
    expect(items[0].find('.review__tag').text()).toBe('对')
    expect(items[1].find('.review__tag').text()).toBe('错')
  })

  it('进入结果页即把结果落库', async () => {
    await mountResultWithAnswers({ 1: STATUS.KNOW, 2: STATUS.UNKNOWN })
    expect(study.recordOf(1).status).toBe(STATUS.KNOW)
    expect(study.recordOf(2).status).toBe(STATUS.UNKNOWN)
  })

  it('「再来一次」清空会话并回设置页', async () => {
    const { wrapper, router } = await mountResultWithAnswers({ 1: STATUS.KNOW })
    await wrapper.findAll('.cta__btn')[0].trigger('click')
    await flushPromises()
    expect(interview.active).toBe(false)
    expect(router.currentRoute.value.path).toBe('/interview')
  })

  it('无会话时显示空状态', async () => {
    const { wrapper } = await mountView(InterviewResultView, '/interview/result')
    expect(wrapper.text()).toContain('没有可评估的会话')
  })
})
