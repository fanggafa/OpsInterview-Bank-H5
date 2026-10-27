import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

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

describe('刷题页 · 模式选择面板', () => {
  it('首次进入显示面板（未开始刷）', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.setup').exists()).toBe(true)
  })

  it('面板含刷题 / 背题两个选项及说明', async () => {
    const { wrapper } = await mountPractice()
    const modes = wrapper.findAll('.setup__mode')
    expect(modes).toHaveLength(2)
    expect(modes[0].text()).toContain('刷题模式')
    expect(modes[0].text()).toContain('全部题')
    expect(modes[1].text()).toContain('背题模式')
    expect(modes[1].text()).toContain('只有简答题')
  })

  it('默认选中刷题模式', async () => {
    const { wrapper } = await mountPractice()
    const on = wrapper.find('.setup__mode--on')
    expect(on.text()).toContain('刷题模式')
  })

  it('面板显示本次题量', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.setup__hint').text()).toContain('本次 3 题')
  })

  it('点「背题模式」→ 切到 memorize，题量变成简答题数', async () => {
    const { wrapper, router } = await mountPractice()
    await wrapper.findAll('.setup__mode')[1].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.studyMode).toBe('memorize')
    expect(wrapper.find('.setup__hint').text()).toContain('本次 2 题')
  })

  it('点「直接开始」收起面板，露出题卡', async () => {
    const { wrapper } = await mountPractice()
    await wrapper.find('.setup__skip').trigger('click')
    await flushPromises()
    expect(wrapper.find('.setup').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
  })

  it('有上次进度时面板显示「继续上次」', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'memorize', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    const resume = wrapper.find('.setup__resume')
    expect(resume.exists()).toBe(true)
    expect(resume.text()).toContain('继续上次刷题')
    expect(resume.text()).toContain('背题')
    expect(resume.text()).toContain('第 2 题')
  })

  it('无进度时不显示「继续上次」', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.setup__resume').exists()).toBe(false)
  })

  it('带 studyMode=memorize 直接进入时，面板选中背题', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    expect(wrapper.find('.setup__mode--on').text()).toContain('背题模式')
  })

  it('背题模式下队列里没有选择题', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    await wrapper.find('.setup__skip').trigger('click')
    await flushPromises()
    // 2 道简答题，题卡类型徽标都是「简答」
    expect(wrapper.find('.setup').exists()).toBe(false)
    expect(wrapper.text()).toContain('第 1 / 2 题')
  })
})
