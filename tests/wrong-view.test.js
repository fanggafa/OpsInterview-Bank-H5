import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import WrongView from '@/views/WrongView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { WRONG_CLEAR_STREAK } from '@/utils/constants'

/**
 * 错题本的新规则（用户要求）：
 * 答错和自评「不会」的都记录进去，之后任意方式刷到，累计三次都对就自动剔除。
 *
 * 页面侧要表达的两件事：
 * 1. 规则本身要写在列表上方（不然用户会疑惑「我答对了怎么还在」）
 * 2. 每道题当前连对了几次，要用进度点显示出来
 */

const FIXTURE = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  type: 'short',
  category: 'Linux基础',
  difficulty: '中等',
  frequency: '高频',
  question: `题目 ${i + 1}`,
  answer: `答案 ${i + 1}`,
  tags: ['t'],
}))

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/wrong', component: WrongView },
      { path: '/practice', component: HomeView },
      { path: '/me', component: HomeView },
      { path: '/', component: HomeView },
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

async function mountWrong() {
  const router = makeRouter()
  await router.push('/wrong')
  await router.isReady()
  const wrapper = mount(WrongView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('错题本 · 连对移出规则', () => {
  it('列表上方写明「连对 3 次自动移出」', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountWrong()
    expect(wrapper.find('.rule').text()).toContain(`连对 ${WRONG_CLEAR_STREAK} 次自动移出`)
    expect(wrapper.find('.rule').text()).toContain('任意方式刷到都算')
  })

  it('每道错题显示当前连对进度（0/3）', async () => {
    study.markUnknown(1)
    study.markUnknown(2)
    const { wrapper } = await mountWrong()
    const hints = wrapper.findAll('.progress-hint')
    expect(hints).toHaveLength(2)
    expect(hints[0].text()).toContain('连对 0 / 3')
  })

  it('答对一次后进度点亮一个，题仍在列表里', async () => {
    study.markUnknown(1)
    study.markKnow(1)
    const { wrapper } = await mountWrong()
    expect(wrapper.findAll('.qcard')).toHaveLength(1)
    expect(wrapper.find('.progress-hint').text()).toContain('连对 1 / 3')
    expect(wrapper.findAll('.progress-dot--on')).toHaveLength(1)
  })

  it('连对 2 次时亮两个点', async () => {
    study.markUnknown(1)
    study.markKnow(1)
    study.markKnow(1)
    const { wrapper } = await mountWrong()
    expect(wrapper.find('.progress-hint').text()).toContain('连对 2 / 3')
    expect(wrapper.findAll('.progress-dot--on')).toHaveLength(2)
  })

  it('连对满 3 次后从列表消失', async () => {
    study.markUnknown(1)
    study.markUnknown(2)
    study.markKnow(1)
    study.markKnow(1)
    study.markKnow(1)
    const { wrapper } = await mountWrong()
    expect(wrapper.findAll('.qcard')).toHaveLength(1)
    expect(wrapper.text()).toContain('共 1 道错题')
  })

  it('全部移出后显示空态', async () => {
    study.markUnknown(1)
    for (let i = 0; i < WRONG_CLEAR_STREAK; i++) study.markKnow(1)
    const { wrapper } = await mountWrong()
    expect(wrapper.text()).toContain('错题本是空的')
  })
})

describe('错题本 · 入口按钮', () => {
  it('有错题时显示「错题复习」按钮（不是旧的专项刷题）', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountWrong()
    const btn = wrapper.find('.head__btn')
    expect(btn.text()).toBe('错题复习')
    expect(wrapper.text()).not.toContain('错题专项刷题')
  })

  it('点按钮进入 review=wrong 的复习赛', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountWrong()
    const router = wrapper.vm.$router
    await wrapper.find('.head__btn').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/practice')
    expect(router.currentRoute.value.query.review).toBe('wrong')
  })

  it('空态文案说明「连对 3 次移出」，不是旧的「答对就移出」', async () => {
    const { wrapper } = await mountWrong()
    const text = wrapper.text()
    expect(text).toContain('连续答对 3 次即自动移出')
    expect(text).not.toContain('之后答对了会自动移出')
  })
})
