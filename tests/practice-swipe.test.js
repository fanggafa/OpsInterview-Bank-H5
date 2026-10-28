import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 关键回归：题卡在「题库异步加载完成后」才渲染，
 * 手势必须在卡片出现的瞬间绑定，否则「鼠标/触摸滑动切题」完全失效
 * （这是第三步的真实 bug：原实现只在 onMounted 里绑，那时 DOM 还是骨架屏）。
 */

const FIXTURE = [
  { id: 1, category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, category: 'Linux基础', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t2'], frequency: '中频' },
  { id: 3, category: 'MySQL', difficulty: '困难', question: 'q3', answer: 'a3', tags: ['t3'], frequency: '高频' },
]

function pointerEvent(type, { x = 0, y = 0, pointerType = 'mouse', button = 0 } = {}) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, cancelable: true })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  Object.defineProperty(e, 'isPrimary', { value: true })
  return e
}

function swipe(el, { dx = -120, pointerType = 'mouse' } = {}) {
  const startX = 300
  el.dispatchEvent(pointerEvent('pointerdown', { x: startX, y: 300, pointerType }))
  window.dispatchEvent(pointerEvent('pointermove', { x: startX + dx, y: 300, pointerType }))
  window.dispatchEvent(pointerEvent('pointerup', { x: startX + dx, y: 300, pointerType }))
}

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
let bank

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  sessionStorage.clear()
  bank = useBankStore()
  bank.questions = []
  bank.loading = true
  bank.error = ''
  useStudyStore()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

/** 模拟题库异步加载：先骨架屏，后数据到达 */
async function mountWithAsyncLoad(query = {}) {
  let resolveLoad
  const gate = new Promise((r) => {
    resolveLoad = r
  })

  bank.load = () => {
    bank.loading = true
    return gate.then(() => {
      bank.questions = FIXTURE
      bank.loading = false
      return FIXTURE
    })
  }

  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()

  return {
    wrapper,
    router,
    async finishLoading() {
      bank.questions = FIXTURE
      bank.loading = false
      resolveLoad()
      await flushPromises()
      await wrapper.vm.$nextTick()
      await flushPromises()

      // 数据就绪后先落在「选择练习方式」页，点一下才出题卡
      const btn = wrapper
        .findAll('.picker__btn')
        .find((b) => b.text().includes('刷题模式'))
      if (btn) {
        await btn.trigger('click')
        await flushPromises()
        await wrapper.vm.$nextTick()
        await flushPromises()
      }
    },
  }
}

describe('滑动切题 · 异步加载后仍可用（核心回归）', () => {
  it('题库加载前没有题卡（先落在选择练习方式）', async () => {
    const { wrapper } = await mountWithAsyncLoad()
    expect(wrapper.find('.stage').exists()).toBe(false)
    // 未点选之前不渲染题卡；选择页本身可先选，加载会并行完成
    expect(wrapper.find('.picker').exists() || wrapper.find('.skeleton').exists()).toBe(true)
  })

  it('加载完成后卡片出现，鼠标左滑能切到下一题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad()

      // 用真实定时器完成加载
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      expect(wrapper.find('.stage').exists()).toBe(true)
      expect(wrapper.find('.qcard-p__q').text()).toBe('q1')

      swipe(wrapper.find('.stage').element)
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('触摸左滑同样生效', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad()
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      swipe(wrapper.find('.stage').element, { pointerType: 'touch' })
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.qcard-p__q').text()).toBe('q2')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('右滑回到上一题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad()
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      const stage = () => wrapper.find('.stage').element
      swipe(stage(), { dx: -120 })
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q2')

      swipe(stage(), { dx: 120 })
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.qcard-p__q').text()).toBe('q1')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('最后一题继续左滑不越界', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad({ category: 'MySQL' })
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      swipe(wrapper.find('.stage').element, { dx: -120 })
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('第 1 / 1 题')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })

  it('完成小结出现后滑动手势不再切题', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad({ category: 'MySQL' })
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      // 自评触发完成态
      await wrapper.findAll('.actions__btn')[1].trigger('click')
      await vi.advanceTimersByTimeAsync(400)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('本轮完成')

      // .stage 已不存在，向 body 派发滑动不应报错
      expect(() => swipe(document.body)).not.toThrow()
      expect(wrapper.text()).toContain('本轮完成')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('滑动切题 · 组件卸载清理', () => {
  it('卸载后 window 上不再残留手势监听', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, finishLoading } = await mountWithAsyncLoad()
      vi.useRealTimers()
      await finishLoading()
      vi.useFakeTimers()

      const before = wrapper.find('.qcard-p__q').text()
      wrapper.unmount()

      // 卸载后向 window 派发拖拽，不应有任何错误或状态变化
      expect(() => swipe(document.body)).not.toThrow()
      expect(before).toBe('q1')
      vi.useRealTimers()
    } finally {
      vi.useRealTimers()
    }
  })
})
