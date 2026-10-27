import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import BankView from '@/views/BankView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { CATEGORIES } from '@/utils/constants'

/**
 * 回归：分类 Tab 曾经用横向滚动 + 隐藏滚动条实现，
 * 窄屏下只有前 3 个可见，其余 8 个既看不到也点不到。
 * 现在改为网格平铺，全部可见；分类也改为从题库动态推导。
 */

/** 覆盖全部 10 个分类的夹具 */
const ALL_CATEGORIES_FIXTURE = CATEGORIES.map((cat, i) => ({
  id: i + 1,
  type: 'short',
  category: cat,
  difficulty: '中等',
  question: `题目 ${i + 1}（${cat}）`,
  answer: `答案 ${i + 1}`,
  tags: ['标签'],
  frequency: '中频',
}))

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/bank', component: BankView },
      { path: '/question/:id', component: BankView },
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
  bank.questions = ALL_CATEGORIES_FIXTURE
  bank.loading = false
  bank.error = ''
  useStudyStore()
})

async function mountBank(query = {}) {
  const router = makeRouter()
  await router.push({ path: '/bank', query })
  await router.isReady()
  const wrapper = mount(BankView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('分类 Tab · 全部可见（回归）', () => {
  it('渲染「全部」+ 全部 10 个分类，无遗漏', async () => {
    const { wrapper } = await mountBank()
    const tabs = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    expect(tabs).toHaveLength(CATEGORIES.length + 1)

    const texts = tabs.map((t) => t.text())
    CATEGORIES.forEach((cat) => {
      expect(texts.some((t) => t.includes(cat))).toBe(true)
    })
  })

  it('每个分类 Tab 都可点击并写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    // 取最后一个分类，正是旧实现里被藏起来的那一批
    const lastCat = CATEGORIES[CATEGORIES.length - 1]
    const tab = wrapper
      .findAll('nav[aria-label="分类筛选"] .chip')
      .find((t) => t.text().includes(lastCat))

    expect(tab).toBeTruthy()
    await tab.trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.category).toBe(lastCat)
  })

  it('不再使用横向滚动的容器（避免隐藏滚动条导致不可发现）', async () => {
    const { wrapper } = await mountBank()
    const nav = wrapper.find('nav[aria-label="分类筛选"]')
    expect(nav.classes()).toContain('chip-grid')
    expect(nav.classes()).not.toContain('scroll-x')
  })

  it('Tab 上显示各分类题量', async () => {
    const { wrapper } = await mountBank()
    const first = wrapper.findAll('nav[aria-label="分类筛选"] .chip')[1]
    expect(first.text()).toContain('1')
  })

  it('分类名用独立容器承载，防止长名字撑破胶囊（显示 bug）', async () => {
    const { wrapper } = await mountBank()
    const chips = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    // 每个 chip 内的文字都在 .chip__label 里，配合 CSS 的 ellipsis 才不会溢出
    chips.forEach((chip) => {
      expect(chip.find('.chip__label').exists()).toBe(true)
    })
    // 长分类名也要有(自动化与配置管理 / iptables/firewalld 这类)
    const longChip = chips.find((c) => c.text().includes('iptables/firewalld'))
    expect(longChip).toBeTruthy()
    expect(longChip.find('.chip__label').text()).toBe('iptables/firewalld')
  })

  it('长分类名有 title 兜底（省略后仍可看到全名）', async () => {
    const { wrapper } = await mountBank()
    const longChip = wrapper
      .findAll('nav[aria-label="分类筛选"] .chip')
      .find((c) => c.text().includes('iptables/firewalld'))
    expect(longChip.attributes('title')).toBe('iptables/firewalld')
  })
})

describe('分类 Tab · 从题库动态推导（可扩展）', () => {
  it('题库里没有的分类不显示（避免空 Tab）', async () => {
    const bank = useBankStore()
    bank.questions = [ALL_CATEGORIES_FIXTURE[0]]
    const { wrapper } = await mountBank()
    const tabs = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    expect(tabs).toHaveLength(2) // 全部 + Linux基础
  })

  it('枚举之外的新分类也会出现（未来扩展不被静默隐藏）', async () => {
    const bank = useBankStore()
    bank.questions = [
      ...ALL_CATEGORIES_FIXTURE,
      {
        id: 99,
        type: 'short',
        category: '可观测性',
        difficulty: '中等',
        question: '新分类题目',
        answer: '新分类答案',
        tags: ['标签'],
        frequency: '中频',
      },
    ]
    const { wrapper } = await mountBank()
    const tabs = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    expect(tabs.some((t) => t.text().includes('可观测性'))).toBe(true)
  })

  it('分类顺序以 CATEGORIES 枚举为准（稳定，不随题库顺序乱跳）', async () => {
    const bank = useBankStore()
    // 打乱顺序，但 Tab 顺序应仍按枚举
    bank.questions = [...ALL_CATEGORIES_FIXTURE].reverse()
    const { wrapper } = await mountBank()
    const tabs = wrapper.findAll('nav[aria-label="分类筛选"] .chip')
    expect(tabs[1].text()).toContain(CATEGORIES[0])
    expect(tabs[2].text()).toContain(CATEGORIES[1])
  })
})
