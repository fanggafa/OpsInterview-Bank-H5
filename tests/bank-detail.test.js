import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BankView from '@/views/BankView.vue'
import QuestionView from '@/views/QuestionView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS } from '@/utils/constants'

/** 夹具使用真实分类名，与 constants.js 的 10 个枚举一致 */
const FIXTURE = [
  { id: 1, category: 'Linux基础', difficulty: '简单', question: 'tcp handshake?', answer: 'three way', tags: ['网络', 'tcp'], frequency: '高频' },
  { id: 2, category: 'Linux基础', difficulty: '中等', question: 'redis cache?', answer: 'eviction', tags: ['缓存'], frequency: '中频' },
  { id: 3, category: 'MySQL', difficulty: '困难', question: 'mysql index?', answer: 'B+ tree', tags: ['DB'], frequency: '高频' },
]

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/bank', component: BankView },
      { path: '/question/:id', component: QuestionView },
    ],
  })
}

let pinia

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
  // 防止 fake timers 泄漏到后续用例导致挂死
  vi.useRealTimers()
})

async function mountBank(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/bank', query })
  await router.isReady()
  const wrapper = mount(BankView, { global: { plugins: [pinia, router] } })
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

async function mountDetail(id = 1) {
  const router = makeRouter()
  await router.push(`/question/${id}`)
  await router.isReady()
  const wrapper = mount(QuestionView, { global: { plugins: [pinia, router] } })
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

/** 找分类 Tab 中指定文字的那一项 */
function categoryTab(wrapper, label) {
  return wrapper
    .findAll('nav[aria-label="分类筛选"] .chip')
    .find((c) => c.text().startsWith(label))
}

describe('题库页 · 渲染', () => {
  it('默认展示全部题目', async () => {
    const { wrapper } = await mountBank()
    expect(wrapper.findAll('.qcard')).toHaveLength(3)
    expect(wrapper.text()).toContain('共 3 题')
  })

  it('分类 Tab = 全部 + 题库中实际存在的分类', async () => {
    const { wrapper } = await mountBank()
    const tabs = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    // 夹具只有 Linux基础 与 MySQL 两个分类
    expect(tabs).toHaveLength(3)
    expect(tabs[0].text()).toContain('全部')
    expect(tabs[1].text()).toContain('Linux基础')
    expect(tabs[2].text()).toContain('MySQL')
  })

  it('分类 Tab 显示题量角标', async () => {
    const { wrapper } = await mountBank()
    expect(categoryTab(wrapper, 'Linux基础').text()).toContain('2')
  })

  it('频率筛选含重置按钮（有筛选时）', async () => {
    const { wrapper } = await mountBank({ category: 'Linux基础' })
    expect(wrapper.find('.chip--reset').exists()).toBe(true)
  })

  it('无筛选时不显示重置按钮', async () => {
    const { wrapper } = await mountBank()
    expect(wrapper.find('.chip--reset').exists()).toBe(false)
  })
})

describe('题库页 · URL 筛选态', () => {
  it('URL 带分类时只显示该分类', async () => {
    const { wrapper } = await mountBank({ category: 'Linux基础' })
    expect(wrapper.findAll('.qcard')).toHaveLength(2)
    expect(wrapper.text()).toContain('筛选出 2 题')
  })

  it('URL 带关键词时过滤', async () => {
    const { wrapper } = await mountBank({ q: 'mysql' })
    expect(wrapper.findAll('.qcard')).toHaveLength(1)
  })

  it('URL 非法分类值被忽略，退回全部', async () => {
    const { wrapper } = await mountBank({ category: '不存在的分类' })
    expect(wrapper.findAll('.qcard')).toHaveLength(3)
  })

  it('点击分类写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    await categoryTab(wrapper, 'Linux基础').trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.category).toBe('Linux基础')
  })

  it('再次点击同一分类可取消筛选', async () => {
    const { wrapper, router } = await mountBank({ category: 'Linux基础' })
    await categoryTab(wrapper, 'Linux基础').trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.category).toBeUndefined()
  })

  it('点击「全部」清空分类但保留关键词', async () => {
    const { wrapper, router } = await mountBank({ category: 'MySQL', q: 'mysql' })
    await wrapper.findAll('nav[aria-label="分类筛选"] .chip')[0].trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.category).toBeUndefined()
    expect(router.currentRoute.value.query.q).toBe('mysql')
  })

  it('重置按钮清空全部筛选', async () => {
    const { wrapper, router } = await mountBank({ category: 'MySQL', q: 'redis' })
    await wrapper.find('.chip--reset').trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query).toEqual({})
  })
})

describe('题库页 · 搜索防抖', () => {
  it('输入后 300ms 内不更新 URL，到期后更新', async () => {
    const { wrapper, router } = await mountBank()
    vi.useFakeTimers()
    try {
      await wrapper.find('.search__input').setValue('mysql')

      await vi.advanceTimersByTimeAsync(200)
      expect(router.currentRoute.value.query.q).toBeUndefined()

      await vi.advanceTimersByTimeAsync(150)
      await router.isReady()
      expect(router.currentRoute.value.query.q).toBe('mysql')
    } finally {
      vi.useRealTimers()
    }
  })

  it('点击清空按钮立即清空关键词', async () => {
    const { wrapper, router } = await mountBank({ q: 'mysql' })
    await wrapper.find('.search__clear').trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.q).toBeUndefined()
  })

  it('URL 关键词回显到输入框', async () => {
    const { wrapper } = await mountBank({ q: 'redis' })
    expect(wrapper.find('.search__input').element.value).toBe('redis')
  })
})

describe('题库页 · 三态', () => {
  it('无匹配结果时显示空状态与重置入口', async () => {
    const { wrapper } = await mountBank({ q: 'zzzz-not-exist' })
    expect(wrapper.text()).toContain('没有匹配的题目')
    expect(wrapper.text()).toContain('重置筛选')
  })

  it('加载失败显示重试按钮', async () => {
    useBankStore().error = '网络异常，无法加载题库'
    const { wrapper } = await mountBank()
    expect(wrapper.text()).toContain('题库加载失败')
    expect(wrapper.text()).toContain('重试')
  })

  it('loading 时显示骨架屏', async () => {
    useBankStore().loading = true
    const { wrapper } = await mountBank()
    expect(wrapper.findAll('.skeleton')).toHaveLength(5)
  })
})

describe('详情页 · 折叠答案', () => {
  it('默认折叠，aria-expanded 为 false', async () => {
    const { wrapper } = await mountDetail()
    expect(wrapper.find('.answer-toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.answer').classes()).not.toContain('answer--open')
  })

  it('点击展开后 aria-expanded 为 true 且答案可见', async () => {
    const { wrapper } = await mountDetail()
    await wrapper.find('.answer-toggle').trigger('click')
    expect(wrapper.find('.answer-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.answer').classes()).toContain('answer--open')
    // 答案改由 AnswerText 渲染（.ans-block），不再用 pre.pre-text
    expect(wrapper.find('.ans-block').text()).toContain('three way')
  })

  it('再次点击收起', async () => {
    const { wrapper } = await mountDetail()
    await wrapper.find('.answer-toggle').trigger('click')
    await wrapper.find('.answer-toggle').trigger('click')
    expect(wrapper.find('.answer').classes()).not.toContain('answer--open')
  })
})

describe('详情页 · 自评与收藏', () => {
  it('点击「会」只写入一次记录（times 加 1）', async () => {
    const { wrapper } = await mountDetail()
    const study = useStudyStore()
    await wrapper.findAll('.actions__btn')[1].trigger('click')
    expect(study.recordOf(1).status).toBe(STATUS.KNOW)
    expect(study.recordOf(1).times).toBe(1)
  })

  it('点击「不会」写入 unknown', async () => {
    const { wrapper } = await mountDetail()
    await wrapper.findAll('.actions__btn')[0].trigger('click')
    expect(useStudyStore().recordOf(1).status).toBe(STATUS.UNKNOWN)
  })

  it('已自评状态显示在提示行', async () => {
    useStudyStore().markKnow(1)
    const { wrapper } = await mountDetail()
    expect(wrapper.find('.status-hint').text()).toContain('已标记为「会」')
  })

  it('未自评显示「尚未自评」', async () => {
    const { wrapper } = await mountDetail()
    expect(wrapper.find('.status-hint').text()).toContain('尚未自评')
  })

  it('收藏按钮切换状态，与 store 一致', async () => {
    const { wrapper } = await mountDetail()
    const study = useStudyStore()
    expect(wrapper.find('.detail__star').attributes('aria-pressed')).toBe('false')

    await wrapper.find('.detail__star').trigger('click')
    expect(study.isFavorite(1)).toBe(true)
    expect(wrapper.find('.detail__star').attributes('aria-pressed')).toBe('true')

    await wrapper.find('.detail__star').trigger('click')
    expect(study.isFavorite(1)).toBe(false)
  })

  it('标签带 # 前缀渲染', async () => {
    const { wrapper } = await mountDetail()
    expect(wrapper.findAll('.detail__tag').map((t) => t.text())).toEqual(['#网络', '#tcp'])
  })

  it('不存在的 id 显示「题目不存在」', async () => {
    const { wrapper } = await mountDetail(999)
    expect(wrapper.text()).toContain('题目不存在')
  })
})

describe('详情页 · 翻题（改为左右滑动）', () => {
  it('不再渲染「上一题 / 下一题」按钮', async () => {
    const { wrapper } = await mountDetail(1)
    expect(wrapper.findAll('.pager__btn')).toHaveLength(0)
    expect(wrapper.find('.pager').exists()).toBe(false)
    // 滑动提示里含「上一题」字样，但那是提示而非按钮
    expect(wrapper.find('.swipe-hint').exists()).toBe(true)
    expect(wrapper.findAll('button').filter((b) => b.text().includes('上一题'))).toHaveLength(0)
  })

  it('提供滑动切题的舞台，并给出滑动提示', async () => {
    const { wrapper } = await mountDetail(1)
    expect(wrapper.find('.stage').exists()).toBe(true)
    expect(wrapper.find('.swipe-hint').text()).toContain('左右滑动')
  })

  it('舞台及其子孙都设了 touch-action: pan-y（否则移动端横向手势会被吞掉）', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/views/QuestionView.vue'), 'utf8')
    expect(src).toMatch(/\.stage,\s*\n\s*\.stage \*/)
    expect(src).toMatch(/touch-action:\s*pan-y/)
  })

  it('边界处不越界：第一题没有上一题，最后一题没有下一题', async () => {
    const { wrapper: first } = await mountDetail(1)
    const { wrapper: last } = await mountDetail(3)
    // 通过源码约束确认两端做了判空（滑动回调里 go(null) 不会跳转）
    const src = readFileSync(resolve(process.cwd(), 'src/views/QuestionView.vue'), 'utf8')
    expect(src).toMatch(/onLeft:\s*\(\)\s*=>\s*go\(nextQuestion\.value\)/)
    expect(src).toMatch(/onRight:\s*\(\)\s*=>\s*go\(prevQuestion\.value\)/)
    expect(src).toMatch(/function go\(q\)\s*\{\s*\n\s*if \(q\)/)
    expect(first.find('.stage').exists()).toBe(true)
    expect(last.find('.stage').exists()).toBe(true)
  })
})
