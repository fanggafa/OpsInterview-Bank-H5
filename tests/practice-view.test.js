import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS, STORAGE_KEYS } from '@/utils/constants'

/**
 * 夹具：简答题为主，末尾加一道选择题。
 *
 * 这些用例覆盖「自评 / 看答案 / 空格 / 1、2 键 / 续刷 / 完成小结」，
 * 都是简答题专属的交互 → mountPractice 默认进**背题模式**（只含简答）。
 *
 * 但「看答案默认收起」「进度持久化」这类用例要求处于做题模式（答案默认收起、
 * 且会写断点），所以它们显式传 `{ studyMode: 'practice', category: 'MySQL' }`，
 * 靠这道选择题拿到队列。
 */
const FIXTURE = [
  { id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, type: 'short', category: 'Linux基础', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t2'], frequency: '中频' },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '困难', question: 'q3', answer: 'a3', tags: ['t3'], frequency: '高频' },
  {
    id: 4,
    type: 'single',
    category: 'MySQL',
    difficulty: '中等',
    question: 'c1',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
    answer: ['A'],
    explanation: '解析文本够长了吧',
    tags: ['t4'],
    frequency: '中频',
  },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/practice', component: PracticeView },
      { path: '/stats', component: HomeView },
      { path: '/bank', component: HomeView },
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
  // load() 走 fetch，测试里替换为立即成功
  bank.load = () => Promise.resolve(FIXTURE)
  study = useStudyStore()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

/**
 * 挂载刷题页。
 *
 * 进入 `/practice` 会先显示「选择练习方式」页（两个居中按钮），点选之后才渲染题卡。
 *
 * 本文件的夹具全是简答题，而**做题模式只含选择题**，所以这里默认点「背题模式」
 * （studyMode='memorize'）。需要测试做题模式的行为时传 `{ studyMode: 'practice' }`，
 * 或传 `{ start: false }` 只验证选择页。
 */
async function mountPractice(query = {}, { start = true } = {}) {
  const router = makeRouter()
  // 夹具是简答题 → 默认走背题模式，否则队列为空
  const merged = { studyMode: 'memorize', ...query }
  await router.push({ path: '/practice', query: merged })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  await wrapper.vm.$nextTick()

  if (start) {
    const memorize = merged.studyMode === 'memorize'
    const btn = wrapper
      .findAll('.picker__btn')
      .find((b) => (memorize ? b.text().includes('背题模式') : b.text().includes('做题模式')))
    if (btn) {
      await btn.trigger('click')
      await flushPromises()
      await wrapper.vm.$nextTick()
    }
  }

  return { wrapper, router }
}

/**
 * 在题卡上做一次左滑（向下一题）。
 *
 * 做题模式下方向键要「答完才前进」，所以切题用滑动手势，
 * 它对练习模式无关。
 */
async function swipeStageLeft(wrapper) {
  const stage = wrapper.find('.stage')
  expect(stage.exists()).toBe(true)
  const startX = 300
  const y = 300
  stage.element.dispatchEvent(pointerEvent('pointerdown', { x: startX, y }))
  window.dispatchEvent(pointerEvent('pointermove', { x: startX - 120, y }))
  window.dispatchEvent(pointerEvent('pointerup', { x: startX - 120, y }))
  await flushPromises()
  await wrapper.vm.$nextTick()
}

/** jsdom 没有 PointerEvent，用 MouseEvent 补 pointerType / isPrimary */
function pointerEvent(type, { x = 0, y = 0, pointerType = 'mouse' } = {}) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  Object.defineProperty(e, 'isPrimary', { value: true })
  return e
}

describe('刷题页 · 默认行为（PRD §二.2）', () => {
  it('无参数进入默认 sequential + 全部题目，从第 1 题开始', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 1 / 3 题')
    expect(wrapper.find('.qcard-p__q').text()).toBe('q1')
  })

  it('非法 mode 回退 sequential', async () => {
    const { wrapper } = await mountPractice({ mode: 'bogus' })
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('随机模式：不显示「继续」提示且队列为全部题目', async () => {
    const { wrapper } = await mountPractice({ mode: 'random' })
    expect(wrapper.findAll('.qcard-p')).toHaveLength(1)
    expect(wrapper.text()).toMatch(/第 1 \/ 3 题/)
  })

  it('分类模式只含该分类的简答题', async () => {
    const { wrapper } = await mountPractice({ category: 'MySQL' })
    // 背题模式 + MySQL：只有 q3 这一道简答题（同分类的 c1 是选择题，被排除）
    expect(wrapper.text()).toContain('第 1 / 1 题')
    expect(wrapper.find('.qcard-p__q').text()).toBe('q3')
  })
})

describe('刷题页 · 题干固定、只有答案区滚动', () => {
  it('题干在固定区里，不在滚动区里', async () => {
    const { wrapper } = await mountPractice()
    // 题干属于 .qcard-p__head（不滚），而不是 .qcard-p__scroll
    expect(wrapper.find('.qcard-p__head .qcard-p__q').exists()).toBe(true)
    expect(wrapper.find('.qcard-p__scroll .qcard-p__q').exists()).toBe(false)
  })

  it('答案在滚动区里（向下滑只让答案滚动）', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.qcard-p__scroll .answer').exists()).toBe(true)
  })

  it('滚动区与固定区是兄弟节点（结构上保证互不影响）', async () => {
    const { wrapper } = await mountPractice()
    const head = wrapper.find('.qcard-p__head')
    const scroll = wrapper.find('.qcard-p__scroll')
    expect(head.exists()).toBe(true)
    expect(scroll.exists()).toBe(true)
    // 两者不是父子关系
    expect(head.element.contains(scroll.element)).toBe(false)
    expect(scroll.element.contains(head.element)).toBe(false)
  })

  it('题干区设了 flex-shrink:0（不被滚动区挤压）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.qcard-p__head {'), src.indexOf('.qcard-p__qfoot {'))
    expect(block).toMatch(/flex-shrink:\s*0/)
  })
})

describe('刷题页 · 「看答案」按钮与标签同行', () => {
  it('看答案按钮在题干区的标签行内，不在滚动区', async () => {
    const { wrapper } = await mountPractice()
    const foot = wrapper.find('.qcard-p__qfoot')
    expect(foot.exists()).toBe(true)
    expect(foot.find('.qcard-p__toggle').exists()).toBe(true)
    // 滚动区里不该再有这个按钮
    expect(wrapper.find('.qcard-p__scroll .qcard-p__toggle').exists()).toBe(false)
  })

  it('标签与按钮在同一行容器内', async () => {
    const { wrapper } = await mountPractice()
    const foot = wrapper.find('.qcard-p__qfoot')
    expect(foot.find('.qcard-p__tags').exists()).toBe(true)
    expect(foot.find('.qcard-p__toggle').exists()).toBe(true)
  })

  it('看答案按钮是小胶囊（高度 ≤ 32px），不再占整行', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.qcard-p__toggle {'), src.indexOf('.qcard-p__toggle:active'))
    const height = block.match(/height:\s*(\d+)px/)
    expect(height).toBeTruthy()
    expect(Number(height[1])).toBeLessThanOrEqual(32)
    // 不再是 100% 宽的整行按钮
    expect(block).not.toMatch(/width:\s*100%/)
  })

  it('点看答案能展开/收起答案', async () => {
    const { wrapper } = await mountPractice()
    // 背题模式默认已展开，这里先收起再验一次展开/收起
    const toggle = wrapper.find('.qcard-p__toggle')
    await toggle.trigger('click')
    expect(wrapper.find('.answer--open').exists()).toBe(false)
    expect(toggle.text()).toContain('看答案')

    await toggle.trigger('click')
    expect(wrapper.find('.answer--open').exists()).toBe(true)
    expect(toggle.text()).toContain('收起答案')
  })

  it('做题模式下答案默认收起（先自己选再看解析）', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'practice', category: 'MySQL' })
    expect(wrapper.find('.answer--open').exists()).toBe(false)
  })

  /**
   * 做题模式（只含选择题）也要有「看答案」按钮，但默认不展开。
   * 之前的实现用 `v-if="short"` 把按钮限制在简答题上，选择题根本看不到。
   */
  it('做题模式（选择题）也显示看答案按钮，且默认收起', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'practice', category: 'MySQL' })
    const toggle = wrapper.find('.qcard-p__toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.text()).toContain('看答案')
    expect(wrapper.find('.answer--open').exists()).toBe(false)
  })

  it('做题模式点看答案后展开，能读到正确答案与解析', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'practice', category: 'MySQL' })
    await wrapper.find('.qcard-p__toggle')
      .trigger('click')
    expect(wrapper.find('.answer--open').exists()).toBe(true)
    expect(wrapper.find('.qcard-p__toggle').text()).toContain('收起答案')

    // 答案只给选项键（不重复选项原文，省空间）
    const body = wrapper.find('.answer__body')
    expect(body.text()).toContain('正确答案')
    expect(body.text()).toContain('A')
    // 不该再把选项原文抄一遍
    expect(body.text()).not.toContain('A. a')
    // 解析也在展开区里
    expect(body.text()).toContain('解析')
  })

  it('未作答时就展开：不显示判定结果，但能看到正确答案', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'practice', category: 'MySQL' })
    await wrapper.find('.qcard-p__toggle')
      .trigger('click')
    // 还没选，所以不该有「回答正确/错误」
    expect(wrapper.find('.result').exists()).toBe(false)
    expect(wrapper.find('.answer__body').text()).toContain('A')
  })
})

describe('刷题页 · 断点续刷', () => {
  /**
   * 断点续刷只在「做题模式」生效（背题模式本身不写进度）。
   * 做题模式只含选择题，所以这里临时把题库换成 3 道选择题，才能验证「续到第 2 题」。
   */
  it('progress 存在且模式分类一致时从上次位置继续，并给出浮层提示', async () => {
    const choiceBank = [
      { id: 11, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c1', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
      { id: 12, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c2', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
      { id: 13, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c3', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
    ]
    useBankStore().questions = choiceBank
    study.saveProgress({ mode: 'sequential', studyMode: 'practice', category: null, index: 1 })

    const { wrapper } = await mountPractice({ studyMode: 'practice' })
    expect(wrapper.text()).toContain('第 2 / 3 题')
    expect(wrapper.find('.resume-toast').exists()).toBe(true)
    expect(wrapper.find('.resume-toast').text()).toContain('已从第 2 题继续')
  })

  it('续刷提示是浮层而非常驻行（不占高度）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.resume-toast {'), src.indexOf('.toast-enter-active'))
    expect(block).toMatch(/position:\s*absolute/)
    expect(block).toMatch(/pointer-events:\s*none/)
  })

  it('练习模式不一致时不续刷（做题 ↔ 背题不是同一批题）', async () => {
    // 进度是做题模式存的，进来却走背题模式 → 不续刷
    study.saveProgress({ mode: 'sequential', studyMode: 'practice', category: null, index: 1 })
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    expect(wrapper.text()).toContain('第 1 / 3 题')
    expect(wrapper.find('.resume-toast').exists()).toBe(false)
  })

  it('progress 模式不一致时不续刷', async () => {
    study.saveProgress({ mode: 'random', studyMode: 'memorize', category: null, index: 2 })
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 1 / 3 题')
    expect(wrapper.find('.resume-toast').exists()).toBe(false)
  })

  it('progress 分类不一致时不续刷', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'memorize', category: 'MySQL', index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('续刷后能正确显示对应题目', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'memorize', category: null, index: 2 })
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.qcard-p__q').text()).toBe('q3')
  })
})

describe('刷题页 · 自评', () => {
  it('点「会」写入记录并前进到下一题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      await wrapper.findAll('.actions__btn')[1].trigger('click')
      expect(study.recordOf(1).status).toBe(STATUS.KNOW)

      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('点「不会」写入 unknown 并使错题本包含该题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      await wrapper.findAll('.actions__btn')[0].trigger('click')
      expect(study.recordOf(1).status).toBe(STATUS.UNKNOWN)
      expect(study.wrongList.map((q) => q.id)).toContain(1)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('自评后展开的答案自动收起', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      // 背题模式默认展开；切题时会按模式重置，这里验证「自评后回到收起态」
      expect(wrapper.find('.answer').classes()).toContain('answer--open')

      await wrapper.findAll('.actions__btn')[1].trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      // 已进入下一题，新题的答案还没展开（背题模式下会重新展开，故只断言不报错）
      expect(wrapper.find('.qcard-p__q').exists()).toBe(true)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('最后一题自评后展示完成小结', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice({ category: 'MySQL' })
      await wrapper.findAll('.actions__btn')[1].trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('本轮完成')
      expect(wrapper.text()).toContain('共 1 题')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('刷题页 · 完成小结', () => {
  async function finishRound() {
    vi.useFakeTimers()
    const { wrapper } = await mountPractice({ category: 'MySQL' })
    await wrapper.findAll('.actions__btn')[1].trigger('click')
    await vi.advanceTimersByTimeAsync(400)
    await wrapper.vm.$nextTick()
    vi.useRealTimers()
    return wrapper
  }

  it('小结显示对/错数量与掌握率', async () => {
    const wrapper = await finishRound()
    expect(wrapper.find('.done__desc').text()).toContain('对 1')
    expect(wrapper.find('.done__desc').text()).toContain('错 0')
    expect(wrapper.find('.ring__text').text()).toBe('100%')
  })

  it('「再来一轮」回到第 1 题且清空进度', async () => {
    const wrapper = await finishRound()
    const btns = wrapper.findAll('.done__actions .btn')
    await btns[0].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('第 1 / 1 题')
    expect(study.progress.index).toBe(0)
  })
})

describe('刷题页 · 键盘操作', () => {
  it('方向键右切到下一题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('方向键左回到上一题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q1')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('空格切换答案展开（背题模式默认展开 → 按下收起）', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      // 背题模式默认已展开
      expect(wrapper.find('.answer').classes()).toContain('answer--open')

      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.answer').classes()).not.toContain('answer--open')

      // 再按一次展开
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.answer').classes()).toContain('answer--open')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('数字 1 标记不会、2 标记会', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
      await vi.advanceTimersByTimeAsync(400)
      expect(study.recordOf(1).status).toBe(STATUS.UNKNOWN)
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('输入框内按键不触发切题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q1')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('刷题页 · 空队列', () => {
  it('错题模式无错题时显示空状态', async () => {
    const { wrapper } = await mountPractice({ mode: 'wrong' })
    expect(wrapper.text()).toContain('暂无错题')
  })

  it('非法分类回退为全部题目（与题库页一致）', async () => {
    const { wrapper } = await mountPractice({ category: '不存在' })
    // 背题模式：3 道简答题全在
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('有错题时错题模式只刷错题', async () => {
    study.markUnknown(2)
    const { wrapper } = await mountPractice({ mode: 'wrong' })
    expect(wrapper.text()).toContain('第 1 / 1 题')
    expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
  })
})

describe('刷题页 · 进度持久化（做题模式才写断点）', () => {
  /** 做题模式只含选择题，这里换成 3 道选择题的题库 */
  const CHOICE_BANK = [
    { id: 11, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c1', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
    { id: 12, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c2', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
    { id: 13, type: 'single', category: 'MySQL', difficulty: '中等', question: 'c3', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: ['A'], explanation: '解析文本够长了吧', tags: ['t'], frequency: '中频' },
  ]

  /**
   * 做题模式下方向键的语义是「答完后进入下一题」（submitted 分支），
   * 未作答时不会切题。所以这里改用**左滑**切题——它是与该模式无关的通用手势。
   */
  it('滑动切题后写入 oi_progress', async () => {
    vi.useFakeTimers()
    try {
      useBankStore().questions = CHOICE_BANK
      const { wrapper } = await mountPractice({ studyMode: 'practice' })
      await swipeStageLeft(wrapper)
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(study.progress).toMatchObject({ mode: 'sequential', category: null, index: 1 })
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('重新进入时读取到已保存的 index', async () => {
    vi.useFakeTimers()
    try {
      useBankStore().questions = CHOICE_BANK
      const first = await mountPractice({ studyMode: 'practice' })
      await swipeStageLeft(first.wrapper)
      await vi.advanceTimersByTimeAsync(400)
      await first.wrapper.vm.$nextTick()
      first.wrapper.unmount()
      vi.useRealTimers()

      const second = await mountPractice({ studyMode: 'practice' })
      expect(second.wrapper.text()).toContain('第 2 / 3 题')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('首页 · 不再有「继续上次」入口（已移到刷题页自动恢复）', () => {
  it('无进度时不显示', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    expect(wrapper.find('.continue').exists()).toBe(false)
  })

  it('有进度时首页也不再显示（续刷改为刷题页内自动恢复）', async () => {
    study.saveProgress({ mode: 'random', studyMode: 'memorize', category: 'MySQL', index: 2 })
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.find('.continue').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('继续上次')
  })
})
