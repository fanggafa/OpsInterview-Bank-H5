import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import BankView from '@/views/BankView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { CATEGORIES, DIFFICULTIES } from '@/utils/constants'

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

/**
 * 只取「分类胶囊」，排除末尾的展开/收起箭头。
 * 箭头也是 .chip（复用胶囊样式），但它不是分类，计数时必须排除。
 */
function categoryChips(wrapper) {
  return wrapper
    .findAll('nav[aria-label="分类筛选"] .chip')
    .filter((c) => !c.classes().includes('chip--expand'))
}


describe('分类 Tab · 展开后全部可见（回归）', () => {
  it('展开后渲染「全部」+ 全部 25 个分类，无遗漏', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.chip--expand').trigger('click')
    expect(categoryChips(wrapper)).toHaveLength(CATEGORIES.length + 1)

    const texts = categoryChips(wrapper).map((t) => t.text())
    CATEGORIES.forEach((cat) => {
      expect(texts.some((t) => t.includes(cat))).toBe(true)
    })
  })

  it('每个分类 Tab 都可点击并写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    await wrapper.find('.chip--expand').trigger('click')
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
    // 只查「分类胶囊」：展开箭头里没有文字，不该要求它有 .chip__label
    const chips = categoryChips(wrapper)
    // 每个 chip 内的文字都在 .chip__label 里，配合 CSS 的 ellipsis 才不会溢出
    chips.forEach((chip) => {
      expect(chip.find('.chip__label').exists()).toBe(true)
    })
    // 长分类名也要有(自动化与配置管理 / iptables/firewalld 这类)
    const longChip = chips.find((c) => c.text().includes('iptables/firewalld'))
    expect(longChip).toBeTruthy()
    expect(longChip.find('.chip__label').text()).toBe('iptables/firewalld')
  })

  it('展开箭头里没有文字（省掉一整行），但保留 aria-label 与 title', async () => {
    const { wrapper } = await mountBank()
    const arrow = wrapper.find('.chip--expand')
    expect(arrow.exists()).toBe(true)
    expect(arrow.text().trim()).toBe('')
    expect(arrow.find('.chip__label').exists()).toBe(false)
    expect(arrow.attributes('aria-label')).toBeTruthy()
    expect(arrow.attributes('title')).toBeTruthy()
  })

  it('长分类名有 title 兜底（省略后仍可看到全名）', async () => {
    const { wrapper } = await mountBank()
    const longChip = wrapper
      .findAll('nav[aria-label="分类筛选"] .chip')
      .find((c) => c.text().includes('iptables/firewalld'))
    expect(longChip.attributes('title')).toBe('iptables/firewalld')
  })
})

describe('分类 Tab · 折叠与展开', () => {
  it('默认折叠：只渲染前 8 个（全部 + 7 个分类），不是全部 24 个', async () => {
    const { wrapper } = await mountBank()
    // 全部 + 7 个分类 + 1 个展开箭头（箭头也是 .chip）
    expect(categoryChips(wrapper)).toHaveLength(8)
  })

  it('折叠时末尾只有一个箭头胶囊（不含文字），语义放在 aria-label', async () => {
    const { wrapper } = await mountBank()
    const toggle = wrapper.find('.chip--expand')
    expect(toggle.exists()).toBe(true)
    // 视觉上只有图标
    expect(toggle.text().trim()).toBe('')
    // 但读屏与 title 要说清「展开全部 N 个分类」
    expect(toggle.attributes('aria-label')).toContain('展开全部')
    expect(toggle.attributes('aria-label')).toContain(String(CATEGORIES.length))
    expect(toggle.attributes('title')).toContain('展开全部')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('点击后展开全部分类，箭头 aria-label 变「收起分类」', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.chip--expand').trigger('click')

    expect(categoryChips(wrapper)).toHaveLength(CATEGORIES.length + 1)

    const toggle = wrapper.find('.chip--expand')
    expect(toggle.attributes('aria-label')).toContain('收起分类')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    // 展开后箭头翻转
    expect(toggle.classes()).toContain('chip--expand--open')
  })

  it('展开后全部 25 个分类都可见可点', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.chip--expand').trigger('click')
    const texts = wrapper.findAll('nav[aria-label="分类筛选"] .chip').map((t) => t.text())
    CATEGORIES.forEach((cat) => {
      expect(texts.some((t) => t.includes(cat))).toBe(true)
    })
  })

  it('折叠时选中的分类一定可见（不会被折叠掉）', async () => {
    // 选最后一个分类（折叠时本不可见）
    const lastCat = CATEGORIES[CATEGORIES.length - 1]
    const { wrapper } = await mountBank({ category: lastCat })
    const texts = wrapper.findAll('nav[aria-label="分类筛选"] .chip').map((t) => t.text())
    expect(texts.some((t) => t.includes(lastCat))).toBe(true)
    // 且该项处于高亮态
    const active = wrapper.find('nav[aria-label="分类筛选"] .chip--active')
    expect(active.text()).toContain(lastCat)
  })

  it('折叠时箭头不带文字（只剩图标，省掉一整行）', async () => {
    const { wrapper } = await mountBank({ category: 'MySQL', difficulty: '困难' })
    const arrow = wrapper.find('.chip--expand')
    // 视觉上只剩箭头，但 aria-label 要说清它干什么
    expect(arrow.text().trim()).toBe('')
    expect(arrow.attributes('aria-label')).toContain('展开全部')
  })

  it('分类不足一屏时不出折叠按钮', async () => {
    const bank = useBankStore()
    bank.questions = ALL_CATEGORIES_FIXTURE.slice(0, 3)
    const { wrapper } = await mountBank()
    expect(wrapper.find('.chip--expand').exists()).toBe(false)
    expect(categoryChips(wrapper)).toHaveLength(4)
  })

  it('展开后仍可点击分类并写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    await wrapper.find('.chip--expand').trigger('click')
    const lastCat = CATEGORIES[CATEGORIES.length - 1]
    const tab = wrapper
      .findAll('nav[aria-label="分类筛选"] .chip')
      .find((t) => t.text().includes(lastCat))
    await tab.trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.category).toBe(lastCat)
  })
})

describe('难度筛选', () => {
  it('渲染「全部难度」+ 三个难度', async () => {
    const { wrapper } = await mountBank()
    const chips = wrapper.findAll('nav[aria-label="难度筛选"] .chip')
    expect(chips).toHaveLength(DIFFICULTIES.length + 1)
    expect(chips[0].text()).toBe('全部难度')
  })

  it('点击难度写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    const chip = wrapper
      .findAll('nav[aria-label="难度筛选"] .chip')
      .find((c) => c.text() === '困难')
    await chip.trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.difficulty).toBe('困难')
  })

  it('再点一次取消该难度', async () => {
    const { wrapper, router } = await mountBank({ difficulty: '困难' })
    const chip = wrapper
      .findAll('nav[aria-label="难度筛选"] .chip')
      .find((c) => c.text() === '困难')
    await chip.trigger('click')
    await new Promise((r) => setTimeout(r, 10))
    expect(router.currentRoute.value.query.difficulty).toBeUndefined()
  })

  it('URL 带 difficulty 时该难度高亮', async () => {
    const { wrapper } = await mountBank({ difficulty: '中等' })
    const active = wrapper.find('nav[aria-label="难度筛选"] .chip--active')
    expect(active.text()).toBe('中等')
  })

  it('难度筛选真的过滤列表', async () => {
    const bank = useBankStore()
    bank.questions = [
      { id: 1, category: 'A', difficulty: '简单', question: '简单题', answer: 'a', tags: ['t'], frequency: '高频' },
      { id: 2, category: 'A', difficulty: '困难', question: '困难题', answer: 'b', tags: ['t'], frequency: '高频' },
    ]
    const { wrapper } = await mountBank({ difficulty: '困难' })
    const summaries = wrapper.findAll('.qcard__summary').map((s) => s.text())
    expect(summaries).toEqual(['困难题'])
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
    await wrapper.find('.chip--expand').trigger('click')
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
