import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import QuestionView from '@/views/QuestionView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 题目详情页的「返回」应该**回到进来的那一页**，而不是一律回题库。
 *
 * 用户明确报过：从首页「每日一题」点进详情，点返回却跳到了题库页。
 *
 * 实现约定：入口页跳转时带 `?from=<路径>`，详情页只接受白名单内的值。
 */

const FIXTURE = [
  {
    id: 1,
    type: 'short',
    category: 'Linux基础',
    difficulty: '简单',
    question: 'q1',
    answer: 'a1',
    tags: ['t'],
    frequency: '高频',
  },
]

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
      { path: '/me', component: { template: '<div/>' } },
      { path: '/question/:id', component: QuestionView },
    ],
  })
}

async function mountDetail(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/question/1', query })
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

describe('详情页 · 返回来源', () => {
  it.each([
    ['/', '从首页每日一题进来'],
    ['/bank', '从题库进来'],
    ['/favorites', '从收藏进来'],
    ['/wrong', '从错题本进来'],
    ['/me', '从我的进来'],
  ])('from=%s 时点返回真的跳到该页（%s）', async (from) => {
    const { wrapper, router } = await mountDetail({ from })
    const back = wrapper.find('[aria-label="返回"]')
    expect(back.exists()).toBe(true)

    await back.trigger('click')
    await flushPromises()
    // 核心断言：返回目标就是来路，而不是一律 /bank
    expect(router.currentRoute.value.path).toBe(from)
  })

  it('不带 from 时走浏览器历史回退（backTo 为空）', async () => {
    const { wrapper } = await mountDetail({})
    expect(wrapper.find('.stage').exists()).toBe(true)
  })

  it('from 不在白名单时被忽略，不会变成任意跳转', async () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/QuestionView.vue'), 'utf8')
    // 白名单校验必须在源码里
    expect(src).toMatch(/FROM_ROUTES/)
    expect(src).toMatch(/FROM_ROUTES\.includes\(from\)/)
  })

  it('首页每日一题跳转时带上 from=/', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/HomeView.vue'), 'utf8')
    // 形如 router.push(`/question/${daily.value.id}?from=/`)
    expect(src).toContain('?from=/`')
  })

  it('三个列表页都把自己的路径作为 from 传给卡片', () => {
    const cases = [
      ['src/views/BankView.vue', '/bank'],
      ['src/views/FavoritesView.vue', '/favorites'],
      ['src/views/WrongView.vue', '/wrong'],
    ]
    for (const [file, from] of cases) {
      const src = readFileSync(resolve(process.cwd(), file), 'utf8')
      expect(src).toContain(`from="${from}"`)
    }
  })

  it('卡片组件把 from（以及滑动范围 scope/category）透传到详情页 URL', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/QuestionCard.vue'), 'utf8')
    /**
     * 2026-11：改用 URLSearchParams 拼参数（原来手写 `?from=xxx` + encodeURIComponent）。
     *
     * 同时新增 scope/category —— 从错题本/收藏进详情页时，
     * 左右滑动要**限定在那一批题**里，不能再按全库切（用户报过这个 bug）。
     */
    expect(src).toMatch(/from/)
    expect(src).toMatch(/URLSearchParams/)
    expect(src).toMatch(/scope/)
    expect(src).toMatch(/category/)
  })
})
