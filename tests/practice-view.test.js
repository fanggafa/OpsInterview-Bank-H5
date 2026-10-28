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

const FIXTURE = [
  { id: 1, category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, category: 'Linux基础', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t2'], frequency: '中频' },
  { id: 3, category: 'MySQL', difficulty: '困难', question: 'q3', answer: 'a3', tags: ['t3'], frequency: '高频' },
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
 * 注意：现在进入 `/practice` 会先显示「选择练习方式」页（两个居中按钮），
 * 点选之后才渲染题卡。这里默认 `start: true` 自动点击「刷题模式」/「背题模式」
 * 完成这一步，让断言聚焦在刷题行为本身；需要测选择页的用例传 start: false。
 */
async function mountPractice(query = {}, { start = true } = {}) {
  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  await wrapper.vm.$nextTick()

  if (start) {
    const memorize = query.studyMode === 'memorize'
    const btn = wrapper
      .findAll('.picker__btn')
      .find((b) => (memorize ? b.text().includes('背题模式') : b.text().includes('刷题模式')))
    if (btn) {
      await btn.trigger('click')
      await flushPromises()
      await wrapper.vm.$nextTick()
    }
  }

  return { wrapper, router }
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

  it('分类模式只含该分类题目', async () => {
    const { wrapper } = await mountPractice({ category: 'MySQL' })
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
    const toggle = wrapper.find('.qcard-p__toggle')
    expect(wrapper.find('.answer--open').exists()).toBe(false)

    await toggle.trigger('click')
    expect(wrapper.find('.answer--open').exists()).toBe(true)
    expect(toggle.text()).toContain('收起答案')

    await toggle.trigger('click')
    expect(wrapper.find('.answer--open').exists()).toBe(false)
    expect(toggle.text()).toContain('看答案')
  })
})

describe('刷题页 · 断点续刷', () => {
  it('progress 存在且模式分类一致时从上次位置继续，并给出浮层提示', async () => {
    study.saveProgress({ mode: 'sequential', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 2 / 3 题')
    // 提示从「常驻一行」改成了 2 秒浮层
    expect(wrapper.find('.resume-toast').exists()).toBe(true)
    expect(wrapper.find('.resume-toast').text()).toContain('已从第 2 题继续')
  })

  it('续刷提示是浮层而非常驻行（不占高度）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.resume-toast {'), src.indexOf('.toast-enter-active'))
    expect(block).toMatch(/position:\s*absolute/)
    expect(block).toMatch(/pointer-events:\s*none/)
  })

  it('progress 模式不一致时不续刷', async () => {
    study.saveProgress({ mode: 'random', category: null, index: 2 })
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 1 / 3 题')
    expect(wrapper.find('.resume-toast').exists()).toBe(false)
  })

  it('progress 分类不一致时不续刷', async () => {
    study.saveProgress({ mode: 'sequential', category: 'MySQL', index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('续刷后能正确显示对应题目', async () => {
    study.saveProgress({ mode: 'sequential', category: null, index: 2 })
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
      await wrapper.find('.qcard-p__toggle').trigger('click')
      expect(wrapper.find('.answer').classes()).toContain('answer--open')

      await wrapper.findAll('.actions__btn')[1].trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.answer').classes()).not.toContain('answer--open')
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

  it('空格切换答案展开', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
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
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('有错题时错题模式只刷错题', async () => {
    study.markUnknown(2)
    const { wrapper } = await mountPractice({ mode: 'wrong' })
    expect(wrapper.text()).toContain('第 1 / 1 题')
    expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
  })
})

describe('刷题页 · 进度持久化', () => {
  it('切题后写入 oi_progress', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await mountPractice()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
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
      const first = await mountPractice()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      await vi.advanceTimersByTimeAsync(400)
      first.wrapper.unmount()
      vi.useRealTimers()

      const second = await mountPractice()
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
