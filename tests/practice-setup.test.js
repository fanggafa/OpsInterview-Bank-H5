import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PracticeView from '@/views/PracticeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 刷题页的「两步流程」：
 *
 * 1. 进入 `/practice` 先只显示**选择页**（两个居中按钮，不展示题目）
 * 2. 点选「刷题模式」或「背题模式」后才渲染题卡
 *
 * 需求背景：之前进入页面即出题卡、顶部有模式按钮，用户要求
 * 「只要两个按钮居中做选择，不用展示题目」。
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
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

/** 点选练习方式 */
async function pick(wrapper, keyword) {
  const btn = wrapper.findAll('.picker__btn').find((b) => b.text().includes(keyword))
  expect(btn).toBeTruthy()
  await btn.trigger('click')
  await flushPromises()
  await wrapper.vm.$nextTick()
}

describe('刷题页 · 选择页（两个居中按钮）', () => {
  it('进入后只显示选择页，不展示题目', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.picker').exists()).toBe(true)
    expect(wrapper.find('.stage').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(false)
  })

  it('选择页恰好两个按钮：刷题模式 / 背题模式', async () => {
    const { wrapper } = await mountPractice()
    const btns = wrapper.findAll('.picker__btn')
    expect(btns).toHaveLength(2)
    expect(btns[0].text()).toContain('刷题模式')
    expect(btns[1].text()).toContain('背题模式')
  })

  it('两个按钮各自带一句模式说明', async () => {
    const { wrapper } = await mountPractice()
    const btns = wrapper.findAll('.picker__btn')
    expect(btns[0].text()).toContain('全部题')
    expect(btns[1].text()).toContain('简答题')
  })

  it('点「刷题模式」后进入题卡', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '刷题模式')
    expect(wrapper.find('.picker').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
    expect(wrapper.text()).toContain('第 1 / 3 题')
  })

  it('点「背题模式」后进入题卡，且只剩简答题', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '背题模式')
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
    expect(wrapper.text()).toContain('第 1 / 2 题')
  })

  it('背题按钮把 studyMode 写进 URL', async () => {
    const { wrapper, router } = await mountPractice()
    await pick(wrapper, '背题模式')
    expect(router.currentRoute.value.query.studyMode).toBe('memorize')
  })

  it('带 studyMode=memorize 进来时，点背题直接用该模式', async () => {
    const { wrapper } = await mountPractice({ studyMode: 'memorize' })
    await pick(wrapper, '背题模式')
    expect(wrapper.text()).toContain('第 1 / 2 题')
  })

  it('选择页提示上次进度（若有）', async () => {
    study.saveProgress({ mode: 'sequential', studyMode: 'practice', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    const tip = wrapper.find('.picker__resume')
    expect(tip.exists()).toBe(true)
    expect(tip.text()).toContain('上次停在')
  })

  it('无进度时选择页不显示上次进度提示', async () => {
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.picker__resume').exists()).toBe(false)
  })
})

describe('刷题页 · 进入后仍可切换', () => {
  it('题卡页顶部保留练习方式切换与题目顺序', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '刷题模式')

    expect(wrapper.find('[aria-label="练习方式"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="题目顺序"]').exists()).toBe(true)
  })

  it('题卡页点「背题模式」会切队列', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '刷题模式')
    expect(wrapper.text()).toContain('第 1 / 3 题')

    const btns = wrapper.findAll('[aria-label="练习方式"] .modes__item')
    await btns[1].trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('第 1 / 2 题')
  })

  it('题卡页点「随机」写入 mode=random', async () => {
    const { wrapper, router } = await mountPractice()
    await pick(wrapper, '刷题模式')

    const btns = wrapper.find('[aria-label="题目顺序"]').findAll('.modes__item')
    await btns[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.mode).toBe('random')
  })
})
