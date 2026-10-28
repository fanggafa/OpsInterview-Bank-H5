import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 刷题页的「练习方式」：两个按钮，直接选，不再是弹出式面板。
 *
 * 需求变更背景：原来点击进入后会先弹一个「选择练习方式」面板
 * （带说明文案、题目顺序、「继续上次」「直接开始」），用户反馈太花哨。
 * 现在改成两行按钮：
 *   第一行：刷题模式 / 背题模式（大按钮）
 *   第二行：顺序 / 随机（小按钮）
 */

const FIXTURE = [
  { id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, type: 'single', category: 'MySQL', difficulty: '中等', question: 'q2', answer: ['B'], tags: ['t2'], frequency: '中频', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], explanation: '解析文本够长了吧' },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '困难', question: 'q3', answer: 'a3', tags: ['t3'], frequency: '低频' },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/practice', component: PracticeView }],
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

async function mountPractice(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/practice', query })
  await router.isReady()
  const wrapper = mount(PracticeView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

describe('刷题页 · 练习方式两个按钮', () => {
  it('进入后直接看到题卡，没有弹出式面板', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.setup').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
  })

  it('渲染「刷题模式 / 背题模式」两个按钮', async () => {
    const { wrapper } = await mountPractice()
    const group = wrapper.find('[aria-label="练习方式"]')
    expect(group.exists()).toBe(true)
    const btns = group.findAll('.modes__item')
    expect(btns).toHaveLength(2)
    expect(btns[0].text()).toBe('刷题模式')
    expect(btns[1].text()).toBe('背题模式')
  })

  it('默认选中刷题模式', async () => {
    const { wrapper } = await mountPractice()
    const on = wrapper.find('[aria-label="练习方式"] .modes__item--on')
    expect(on.text()).toBe('刷题模式')
  })

  it('点「背题模式」→ URL 带上 studyMode=memorize', async () => {
    const { wrapper, router } = await mountPractice()
    const btns = wrapper.findAll('[aria-label="练习方式"] .modes__item')
    await btns[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.studyMode).toBe('memorize')
  })

  it('背题模式下只剩简答题（题量从 3 变 2）', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    expect(wrapper.text()).toContain('第 1 / 2 题')
    expect(wrapper.find('.qcard-p').text()).toContain('q1')
  })

  it('带 studyMode=memorize 进入时选中背题模式', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    const on = wrapper.find('[aria-label="练习方式"] .modes__item--on')
    expect(on.text()).toBe('背题模式')
  })

  it('题目顺序仍是独立的第二行按钮', async () => {
    const { wrapper } = await mountPractice()
    const group = wrapper.find('[aria-label="题目顺序"]')
    expect(group.exists()).toBe(true)
    const btns = group.findAll('.modes__item')
    expect(btns.map((b) => b.text())).toEqual(['顺序', '随机'])
  })

  it('点「随机」→ URL 带上 mode=random', async () => {
    const { wrapper, router } = await mountPractice()
    const group = wrapper.find('[aria-label="题目顺序"]')
    const btns = group.findAll('.modes__item')
    await btns[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.mode).toBe('random')
  })

  it('不再出现「继续上次」「直接开始」这类面板按钮', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'practice', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.setup__resume').exists()).toBe(false)
    expect(wrapper.find('.setup__skip').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('直接开始')
  })

  it('有进度时从断点继续，并给出提示', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'practice', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.hint').exists()).toBe(true)
    expect(wrapper.find('.hint').text()).toContain('已从上次位置继续')
  })
})
