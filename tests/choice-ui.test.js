import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import QuestionView from '@/views/QuestionView.vue'
import PracticeView from '@/views/PracticeView.vue'
import HomeView from '@/views/HomeView.vue'
import QuestionCardDefault from '@/components/QuestionCard.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS } from '@/utils/constants'

const SINGLE = {
  id: 1,
  type: 'single',
  category: 'Linux基础',
  difficulty: '简单',
  question: '哪个命令查看打开的文件？',
  options: [
    { key: 'A', text: 'ls' },
    { key: 'B', text: 'lsof' },
    { key: 'C', text: 'du' },
  ],
  answer: ['B'],
  explanation: 'lsof 列出进程打开的文件描述符。',
  tags: ['命令'],
  frequency: '高频',
}

const MULTIPLE = {
  id: 2,
  type: 'multiple',
  category: 'Linux基础',
  difficulty: '中等',
  question: '以下哪些是软链接特性？',
  options: [
    { key: 'A', text: '可跨文件系统' },
    { key: 'B', text: '共享 inode' },
    { key: 'C', text: '可指向目录' },
  ],
  answer: ['A', 'C'],
  explanation: '软链接是独立文件，可跨文件系统、可指向目录。',
  tags: ['inode'],
  frequency: '中频',
}

const SHORT = {
  id: 3,
  type: 'short',
  category: 'MySQL',
  difficulty: '中等',
  question: '什么是 MVCC？',
  answer: '多版本并发控制，通过 undo log 与 ReadView 实现快照读。',
  tags: ['事务'],
  frequency: '高频',
}

const FIXTURE = [SINGLE, MULTIPLE, SHORT]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/question/:id', component: QuestionView },
      { path: '/practice', component: PracticeView },
      { path: '/stats', component: HomeView },
      { path: '/bank', component: HomeView },
    ],
  })
}

let pinia
let study
let bank

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

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

async function mountDetail(id) {
  const router = makeRouter()
  await router.push(`/question/${id}`)
  await router.isReady()
  const wrapper = mount(QuestionView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

async function mountPractice(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()

  // 进入刷题页先落在「选择练习方式」，点一下才开始出题卡
  const memorize = query.studyMode === 'memorize'
  const btn = wrapper
    .findAll('.picker__btn')
    .find((b) => (memorize ? b.text().includes('背题模式') : b.text().includes('做题模式')))
  if (btn) {
    await btn.trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()
  }

  return { wrapper, router }
}

describe('详情页 · 单选题', () => {
  it('按选项渲染，不显示纯文本答案', async () => {
    const { wrapper } = await mountDetail(1)
    expect(wrapper.findAll('.option')).toHaveLength(3)
    expect(wrapper.find('.answer-toggle').exists()).toBe(false)
    expect(wrapper.find('.pre-text').exists()).toBe(false)
  })

  it('显示「单选」题型徽标', async () => {
    const { wrapper } = await mountDetail(1)
    expect(wrapper.find('.detail__type').text()).toBe('单选')
  })

  it('点对选项立即判定：显示正确、记 know、绿标', async () => {
    const { wrapper } = await mountDetail(1)
    const options = wrapper.findAll('.option')
    await options[1].trigger('click') // B 是正确答案
    await wrapper.vm.$nextTick()

    expect(study.recordOf(1).status).toBe(STATUS.KNOW)
    expect(wrapper.find('.result--ok').exists()).toBe(true)
    expect(wrapper.find('.result').text()).toContain('回答正确')
    expect(options[1].classes()).toContain('option--correct')
  })

  it('点错选项判定为错：显示错误、记 unknown、标出漏选的正确项', async () => {
    const { wrapper } = await mountDetail(1)
    await wrapper.findAll('.option')[0].trigger('click') // A 错误
    await wrapper.vm.$nextTick()

    expect(study.recordOf(1).status).toBe(STATUS.UNKNOWN)
    expect(wrapper.find('.result--bad').exists()).toBe(true)

    const options = wrapper.findAll('.option')
    expect(options[0].classes()).toContain('option--wrong')
    expect(options[1].classes()).toContain('option--missed')
  })

  it('判定后显示解析', async () => {
    const { wrapper } = await mountDetail(1)
    await wrapper.findAll('.option')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.explain .ans-block').text()).toContain('lsof')
  })

  it('判定后选项不可再点击', async () => {
    const { wrapper } = await mountDetail(1)
    await wrapper.findAll('.option')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.option')[0].attributes('disabled')).toBeDefined()
  })

  it('「重做」清除判定状态', async () => {
    const { wrapper } = await mountDetail(1)
    await wrapper.findAll('.option')[1].trigger('click')
    await wrapper.vm.$nextTick()

    await wrapper.find('.result__retry').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.result').exists()).toBe(false)
    expect(wrapper.findAll('.option')[0].attributes('disabled')).toBeUndefined()
  })

  it('选择题不显示「会/不会」自评按钮', async () => {
    const { wrapper } = await mountDetail(1)
    expect(wrapper.findAll('.actions__btn')).toHaveLength(0)
  })

  it('切题后重置作答态', async () => {
    const { wrapper, router } = await mountDetail(1)
    await wrapper.findAll('.option')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.result').exists()).toBe(true)

    // 翻题按钮已移除，改为直接跳到下一题的路由（等价于滑动触发）
    await router.push('/question/2')
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.result').exists()).toBe(false)
  })
})

describe('详情页 · 多选题', () => {
  it('显示「多选」徽标且有提交按钮', async () => {
    const { wrapper } = await mountDetail(2)
    expect(wrapper.find('.detail__type').text()).toBe('多选')
    expect(wrapper.find('.detail__submit').exists()).toBe(true)
  })

  it('点击选项只切换选中，不立即判定', async () => {
    const { wrapper } = await mountDetail(2)
    await wrapper.findAll('.option')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.result').exists()).toBe(false)
    expect(study.recordOf(2)).toBeNull()
    expect(wrapper.findAll('.option')[0].classes()).toContain('option--selected')
  })

  it('再次点击取消选中', async () => {
    const { wrapper } = await mountDetail(2)
    await wrapper.findAll('.option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('.option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.option')[0].classes()).not.toContain('option--selected')
  })

  it('未选任何项时提交按钮禁用', async () => {
    const { wrapper } = await mountDetail(2)
    expect(wrapper.find('.detail__submit').attributes('disabled')).toBeDefined()
  })

  it('全选正确项提交后判定为对', async () => {
    const { wrapper } = await mountDetail(2)
    await wrapper.findAll('.option')[0].trigger('click') // A
    await wrapper.findAll('.option')[2].trigger('click') // C
    await wrapper.find('.detail__submit').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.result--ok').exists()).toBe(true)
    expect(study.recordOf(2).status).toBe(STATUS.KNOW)
  })

  it('漏选一项提交后判定为错，并标出漏选', async () => {
    const { wrapper } = await mountDetail(2)
    await wrapper.findAll('.option')[0].trigger('click') // 只选 A
    await wrapper.find('.detail__submit').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.result--bad').exists()).toBe(true)
    expect(wrapper.findAll('.option')[2].classes()).toContain('option--missed')
    expect(study.recordOf(2).status).toBe(STATUS.UNKNOWN)
  })

  it('多选了错误项提交后判定为错', async () => {
    const { wrapper } = await mountDetail(2)
    await wrapper.findAll('.option')[0].trigger('click')
    await wrapper.findAll('.option')[1].trigger('click') // B 错误
    await wrapper.findAll('.option')[2].trigger('click')
    await wrapper.find('.detail__submit').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.result--bad').exists()).toBe(true)
    expect(wrapper.findAll('.option')[1].classes()).toContain('option--wrong')
  })
})

describe('详情页 · 简答题保持原行为', () => {
  it('仍是折叠答案 + 自评按钮', async () => {
    const { wrapper } = await mountDetail(3)
    expect(wrapper.find('.answer-toggle').exists()).toBe(true)
    expect(wrapper.findAll('.actions__btn')).toHaveLength(2)
    expect(wrapper.find('.option').exists()).toBe(false)
  })

  it('自评「会」仍记 know', async () => {
    const { wrapper } = await mountDetail(3)
    await wrapper.findAll('.actions__btn')[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(study.recordOf(3).status).toBe(STATUS.KNOW)
  })
})

describe('刷题页 · 选择题', () => {
  it('选择题按选项渲染，单选给出点击提示而非提交按钮', async () => {
    const { wrapper } = await mountPractice({ category: 'Linux基础' })
    expect(wrapper.findAll('.option').length).toBeGreaterThan(0)
    // 单选点选项即判定，操作区显示提示文案
    expect(wrapper.find('.actions__submit').exists()).toBe(false)
    expect(wrapper.find('.actions__hint').text()).toContain('点击选项即作答')
    expect(wrapper.findAll('.actions__btn')).toHaveLength(0)
  })

  it('单选点选项即判定并记录', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice({ category: 'Linux基础' })
      await wrapper.findAll('.option')[1].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.result--ok').exists()).toBe(true)
      expect(study.recordOf(1).status).toBe(STATUS.KNOW)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  /**
   * 回归：判定后必须停在本题，不能自动翻页。
   *
   * 用户反馈原话：「选择题点击选项即刻作答，判断对错后不要自动进入下一题，
   * 不然我看不了解析，怎么学习呢」。
   * 早期实现在判定 1.4 秒后自动进入下一题，解析根本来不及看；
   * 现在改为停留，由用户点「下一题 →」/ 左滑 / → 键自己决定节奏。
   */
  it('判定后停在本题，不自动进入下一题（才看得到解析）', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice({ category: 'Linux基础' })
      await wrapper.findAll('.option')[1].trigger('click')
      await vi.advanceTimersByTimeAsync(3000)
      await wrapper.vm.$nextTick()

      // 仍然是第 1 题（3 个选项，不是第 2 题的 3 个）：
      // 判定结果与解析都在，说明没有翻页
      expect(wrapper.find('.result--ok').exists()).toBe(true)
      expect(wrapper.find('.explain').exists()).toBe(true)
      expect(wrapper.find('.qcard-p__q').text()).toContain('哪个命令查看打开的文件')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('判定后出现「下一题 →」按钮，点了才前进', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice({ category: 'Linux基础' })
      await wrapper.findAll('.option')[1].trigger('click')
      await wrapper.vm.$nextTick()

      const nextBtn = wrapper.find('.actions__submit')
      expect(nextBtn.exists()).toBe(true)
      expect(nextBtn.text()).toContain('下一题')

      await nextBtn.trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      // 第 2 题是同一分类下的多选题
      expect(wrapper.findAll('.option')).toHaveLength(3)
      expect(wrapper.find('.result').exists()).toBe(false)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('多选未选中时操作区显示提交按钮，选中后按钮可用', async () => {
    // 构造只含多选题的队列
    bank.questions = [MULTIPLE]
    const { wrapper } = await mountPractice({ mode: 'sequential' })

    const submit = wrapper.find('.actions__submit')
    expect(submit.exists()).toBe(true)
    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toContain('提交答案')

    await wrapper.findAll('.option')[0].trigger('click')
    await wrapper.vm.$nextTick()

    const submit2 = wrapper.find('.actions__submit')
    expect(submit2.attributes('disabled')).toBeUndefined()
    expect(submit2.text()).toContain('已选 1')
  })

  it('简答题操作区仍是「不会/会」两按钮（背题模式）', async () => {
    // 做题模式只含选择题 → 要看简答题的自评按钮，必须进背题模式
    const { wrapper } = await mountPractice({ category: 'MySQL', studyMode: 'memorize' })
    expect(wrapper.findAll('.actions__btn')).toHaveLength(2)
    expect(wrapper.find('.actions__submit').exists()).toBe(false)
  })

  it('键盘 A-D 可选择选项', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice({ category: 'Linux基础' })
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
      await wrapper.vm.$nextTick()

      expect(study.recordOf(1).status).toBe(STATUS.KNOW)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('题库卡片 · 题型标识', () => {
  /** QuestionCard 内部用了 useRouter，需注入 router */
  function mountCard(question, router) {
    return mount(QuestionCardDefault, { props: { question }, global: { plugins: [pinia, router] } })
  }

  it('选择题卡片状态文案为「答对/答错」', async () => {
    study.markKnow(1)
    study.markUnknown(2)
    const router = makeRouter()
    await router.push('/bank')
    await router.isReady()

    const single = mountCard(SINGLE, router)
    expect(single.find('.qcard__status').text()).toBe('答对')
    expect(single.find('.qcard__type').text()).toBe('单选')

    const multi = mountCard(MULTIPLE, router)
    expect(multi.find('.qcard__status').text()).toBe('答错')
    expect(multi.find('.qcard__type').text()).toBe('多选')
  })

  it('简答题卡片状态仍是「会/不会」', async () => {
    study.markKnow(3)
    const router = makeRouter()
    await router.push('/bank')
    await router.isReady()

    const wrapper = mountCard(SHORT, router)
    expect(wrapper.find('.qcard__status').text()).toBe('会')
    expect(wrapper.find('.qcard__type').text()).toBe('简答')
  })
})
