import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
 * 2. 点选「做题模式」或「背题模式」后才渲染题卡
 *
 * 需求背景：之前进入页面即出题卡、顶部有模式按钮，用户要求
 * 「只要两个按钮居中做选择，不用展示题目」。
 */

/**
 * 夹具：简答与选择题并存，用来验证「两个模式题型互斥」。
 *
 * - 做题模式（practice）只看选择题：id 2、4（共 2 题）
 * - 背题模式（memorize）只看简答题：id 1、3（共 2 题）
 */
const FIXTURE = [
  { id: 1, type: 'short', category: 'Linux基础', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t1'], frequency: '高频' },
  { id: 2, type: 'single', category: 'MySQL', difficulty: '中等', question: 'q2', answer: ['B'], tags: ['t2'], frequency: '中频', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], explanation: '解析文本够长了吧' },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '困难', question: 'q3', answer: 'a3', tags: ['t3'], frequency: '低频' },
  { id: 4, type: 'single', category: 'Linux基础', difficulty: '简单', question: 'q4', answer: ['A'], tags: ['t1'], frequency: '高频', options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], explanation: '解析文本够长了吧' },
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

  it('选择页恰好两个按钮：做题模式 / 背题模式', async () => {
    const { wrapper } = await mountPractice()
    const btns = wrapper.findAll('.picker__btn')
    expect(btns).toHaveLength(2)
    expect(btns[0].text()).toContain('做题模式')
    expect(btns[1].text()).toContain('背题模式')
  })

  it('两个按钮各自说明自己的题型（互斥，不是共用同一套题库）', async () => {
    const { wrapper } = await mountPractice()
    const btns = wrapper.findAll('.picker__btn')
    expect(btns[0].text()).toContain('只有选择题')
    expect(btns[1].text()).toContain('只有简答题')
  })

  it('点「做题模式」后进入题卡，且只剩选择题', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')
    expect(wrapper.find('.picker').exists()).toBe(false)
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
    expect(wrapper.text()).toContain('第 1 / 2 题')
    // 选择题才有选项列表，简答题没有
    expect(wrapper.findAll('.option').length).toBeGreaterThan(0)
  })

  it('点「背题模式」后进入题卡，且只剩简答题', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '背题模式')
    expect(wrapper.find('.qcard-p').exists()).toBe(true)
    expect(wrapper.text()).toContain('第 1 / 2 题')
    expect(wrapper.findAll('.option')).toHaveLength(0)
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

  it('随机模式的进度不显示提示（按位置续刷会落到另一道题）', async () => {
    // 兼容升级前遗留的 random 断点：新代码已不再写，但旧记录仍可能存在
    study.saveProgress({ mode: 'random', studyMode: 'practice', category: null, index: 1 })
    const { wrapper } = await mountPractice()
    expect(wrapper.find('.picker__resume').exists()).toBe(false)
  })
})

describe('刷题页 · 进入后的紧凑顶栏', () => {
  it('刷题中不再显示大标题栏，改为紧凑顶栏', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')

    // 大标题栏（AppHeader）不在了
    expect(wrapper.find('.header').exists()).toBe(false)
    // 换成 ptop 紧凑顶栏
    expect(wrapper.find('.ptop').exists()).toBe(true)
  })

  it('题目顺序做成顶栏里的分段胶囊，不再单独占一行', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')

    const seg = wrapper.find('.ptop__seg')
    expect(seg.exists()).toBe(true)
    expect(seg.attributes('role')).toBe('radiogroup')
    const items = seg.findAll('.ptop__seg-item')
    expect(items.map((o) => o.text())).toEqual(['顺序', '随机'])
  })

  it('练习方式仍收在右上角一个按钮', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')
    expect(wrapper.find('.ptop .practice__mode-btn').exists()).toBe(true)
  })

  it('顶栏带「返回」按钮、进度文字与进度条', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')
    // 返回用箭头（不是 ✕，语义是「退回选择页」）
    const back = wrapper.find('.ptop__back')
    expect(back.exists()).toBe(true)
    expect(back.attributes('aria-label')).toContain('返回')
    expect(wrapper.find('.ptop__bar').exists()).toBe(true)
    expect(wrapper.find('.ptop__count').text()).toContain('第 1 / 2 题')
  })

  it('返回箭头是「横线+箭头」的标准样式，不是孤立的小 chevron', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    // 回归：早先用单个 chevron（M15 5l-7 7 7 7），反馈「很突兀」
    expect(src).not.toMatch(/M15 5l-7 7 7 7/)
    // 现在用带横线的箭头
    expect(src).toMatch(/M20 12H5M11 6l-6 6 6 6/)
  })

  it('返回按钮有淡底色块（与其它块状控件同一视觉语言，不显孤立）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.ptop__back {'), src.indexOf('.ptop__back:active'))
    expect(block).toMatch(/background:\s*var\(--c-card\)/)
    expect(block).toMatch(/border:\s*1px solid var\(--c-border\)/)
    expect(block).toMatch(/border-radius:\s*9px/)
  })

  it('点返回回到「选择练习方式」页（而不是跳走）', async () => {
    const { wrapper, router } = await mountPractice()
    await pick(wrapper, '做题模式')
    expect(wrapper.find('.ptop').exists()).toBe(true)

    const before = router.currentRoute.value.path
    await wrapper.find('.ptop__back').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 页码不变，但回到选择页
    expect(router.currentRoute.value.path).toBe(before)
    expect(wrapper.find('.picker').exists()).toBe(true)
    expect(wrapper.find('.ptop').exists()).toBe(false)
  })

  it('点右上角模式按钮会切到另一种练习方式', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')
    expect(wrapper.text()).toContain('第 1 / 2 题')
    expect(wrapper.find('.practice__mode-btn').text()).toContain('做题模式')

    await wrapper.find('.practice__mode-btn').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 切到背题模式：只剩简答题，按钮文案也跟着变
    expect(wrapper.find('.practice__mode-btn').text()).toContain('背题模式')
    expect(wrapper.text()).toContain('第 1 / 2 题')
  })

  it('模式按钮足够大（用户反馈「有点小」，不再是个小标签）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    const block = src.slice(src.indexOf('.practice__mode-btn {'), src.indexOf('.practice__mode-btn:active'))

    const height = block.match(/height:\s*(\d+)px/)
    expect(height).toBeTruthy()
    expect(Number(height[1])).toBeGreaterThanOrEqual(36)

    const fontSize = block.match(/font-size:\s*([\d.]+)px/)
    expect(fontSize).toBeTruthy()
    expect(Number(fontSize[1])).toBeGreaterThanOrEqual(13)
  })

  it('两种模式有不同配色（一眼区分当前模式）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')
    expect(src).toMatch(/\.practice__mode-btn--practice/)
    expect(src).toMatch(/\.practice__mode-btn--memorize/)
  })

  it('收藏按钮在题卡内，不在页头', async () => {
    const { wrapper } = await mountPractice()
    await pick(wrapper, '做题模式')
    // 页头里不应有收藏按钮
    expect(wrapper.find('.header__right .qcard-p__fav').exists()).toBe(false)
    // 收藏按钮在题卡的题头行里
    expect(wrapper.find('.qcard-p__meta .qcard-p__fav').exists()).toBe(true)
  })

  it('顶栏在「随机 / 顺序」间切换会写入对应的 mode', async () => {
    const { wrapper, router } = await mountPractice()
    await pick(wrapper, '做题模式')

    // 默认已是 random，所以先切到「顺序」再切回「随机」，两次都要写进 query
    const items = wrapper.findAll('.ptop__seg-item')
    await items[0].trigger('click') // 顺序
    await flushPromises()
    expect(router.currentRoute.value.query.mode).toBe('sequential')

    await items[1].trigger('click') // 随机
    await flushPromises()
    expect(router.currentRoute.value.query.mode).toBe('random')
  })
})
