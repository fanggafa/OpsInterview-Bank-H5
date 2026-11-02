import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import QuestionView from '@/views/QuestionView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 从错题本 / 收藏进详情页时，**左右滑动必须只在该分类那批题里走**。
 *
 * 用户反馈：「某个分类计数是 6，但进去查看左右滑动会切到别的分类别的题目」。
 * 根因：详情页的上一题/下一题直接取 `bank.questions[index ± 1]`（全库），
 * 与「错题本里的那一批」毫无关系。
 *
 * 修复：入口带 `?scope=wrong|favorites&category=X`，
 * 详情页据此把切题范围收窄；切题时还要把这些参数保住，否则下一题就退回全库。
 */

const mk = (id, category, type = 'single') => ({
  id,
  type,
  category,
  difficulty: '中等',
  question: `q${id}`,
  options:
    type === 'single'
      ? [
          { key: 'A', text: 'a' },
          { key: 'B', text: 'b' },
        ]
      : undefined,
  answer: type === 'single' ? ['A'] : 'a2',
  explanation: '解析文本够长了吧够长了吧',
  tags: ['t'],
  frequency: '中频',
})

/** MySQL 3 题（1-3）· Nginx 2 题（11-12） */
const FIXTURE = [mk(1, 'MySQL'), mk(2, 'MySQL'), mk(3, 'MySQL'), mk(11, 'Nginx'), mk(12, 'Nginx')]

let pinia
let mounted

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/bank', component: { template: '<div/>' } },
      { path: '/favorites', component: { template: '<div/>' } },
      { path: '/wrong', component: { template: '<div/>' } },
      { path: '/question/:id', component: QuestionView },
    ],
  })
}

async function mountDetail(id, query = {}) {
  const router = makeRouter()
  await router.push({ path: `/question/${id}`, query })
  await router.isReady()
  const wrapper = mount(QuestionView, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  mounted = wrapper
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  sessionStorage.clear()
  const bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  useStudyStore()
})

afterEach(() => {
  if (mounted) {
    mounted.unmount()
    mounted = null
  }
  document.body.innerHTML = ''
})

describe('详情页 · 滑动范围限定在来源那批题', () => {
  it('从错题本进 MySQL 分类：滑动只在这 3 题里，不会串到 Nginx', async () => {
    const study = useStudyStore()
    for (const q of FIXTURE) study.markUnknown(q.id)

    const { wrapper } = await mountDetail(1, { from: '/wrong', scope: 'wrong', category: 'MySQL' })

    expect(wrapper.vm.scopedList.map((q) => q.id)).toEqual([1, 2, 3])
    expect(wrapper.vm.nextQuestion.id).toBe(2)
    expect(wrapper.vm.prevQuestion).toBeNull()
    // Nginx 的题不在范围内
    expect(wrapper.vm.scopedList.map((q) => q.id)).not.toContain(11)

    // 走到最后一题：没有下一题，不会跳到 Nginx
    const last = await mountDetail(3, { from: '/wrong', scope: 'wrong', category: 'MySQL' })
    expect(last.wrapper.vm.nextQuestion).toBeNull()
  })

  it('从收藏进分类：范围是收藏里那批题', async () => {
    const study = useStudyStore()
    // 收藏只收简答题，这里直接把 favorites 写进去模拟历史数据
    study.favorites = [11, 12]

    const { wrapper } = await mountDetail(11, { from: '/favorites', scope: 'favorites', category: 'Nginx' })
    expect(wrapper.vm.scopedList.map((q) => q.id).sort((a, b) => a - b)).toEqual([11, 12])
    expect(wrapper.vm.scopedList.length).toBe(2)
  })

  it('不带 scope 时仍是全库顺序（题库页那种浏览场景）', async () => {
    const { wrapper } = await mountDetail(1, { from: '/bank' })
    expect(wrapper.vm.scopedList.length).toBe(FIXTURE.length)
    expect(wrapper.vm.nextQuestion.id).toBe(2)
  })

  it('切题时 URL 保留 scope 与 category（否则切一次就退回全库）', async () => {
    const study = useStudyStore()
    for (const q of FIXTURE) study.markUnknown(q.id)
    const { wrapper, router } = await mountDetail(1, { from: '/wrong', scope: 'wrong', category: 'MySQL' })

    // router.push 是异步的，必须 await 才能读到新路由
    await wrapper.vm.go(wrapper.vm.nextQuestion)
    await flushPromises()

    expect(router.currentRoute.value.query.scope).toBe('wrong')
    expect(router.currentRoute.value.query.category).toBe('MySQL')
    expect(router.currentRoute.value.query.from).toBe('/wrong')
    expect(String(router.currentRoute.value.path)).toBe('/question/2')
  })

  it('题已不在那批里时（如刚被移出错题本）停在原地，不退回全库', async () => {
    const { wrapper } = await mountDetail(1, { from: '/wrong', scope: 'wrong', category: 'MySQL' })
    // 错题本为空 → 列表里没有当前题，兜底成单元素列表
    expect(wrapper.vm.scopedList.map((q) => q.id)).toEqual([1])
    expect(wrapper.vm.prevQuestion).toBeNull()
    expect(wrapper.vm.nextQuestion).toBeNull()
  })
})
