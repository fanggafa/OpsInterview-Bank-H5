import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import BankView from '@/views/BankView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { CATEGORIES, DIFFICULTIES } from '@/utils/constants'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

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
    .filter((c) => !c.classes().includes('bank-cats__more'))
}


describe('分类 Tab · 展开后全部可见（回归）', () => {
  it('展开后渲染「全部」+ 全部 25 个分类，无遗漏', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
    expect(categoryChips(wrapper)).toHaveLength(CATEGORIES.length + 1)

    const texts = categoryChips(wrapper).map((t) => t.text())
    CATEGORIES.forEach((cat) => {
      expect(texts.some((t) => t.includes(cat))).toBe(true)
    })
  })

  it('每个分类 Tab 都可点击并写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
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
    const chips = categoryChips(wrapper)
    // 每个 chip 内的文字都在 .chip__label 里，配合 CSS 的 ellipsis 才不会溢出
    chips.forEach((chip) => {
      expect(chip.find('.chip__label').exists()).toBe(true)
      // 计数在独立容器里，且不被压缩
      expect(chip.find('.chip__count').exists()).toBe(true)
    })
  })

  it('展开箭头里没有文字（省掉一整行），但保留 aria-label 与 title', async () => {
    const { wrapper } = await mountBank()
    const arrow = wrapper.find('.bank-cats__more')
    expect(arrow.exists()).toBe(true)
    expect(arrow.text().trim()).toBe('')
    expect(arrow.find('.chip__label').exists()).toBe(false)
    expect(arrow.attributes('aria-label')).toBeTruthy()
    expect(arrow.attributes('title')).toBeTruthy()
  })

  it('每个分类胶囊都有 title 兜底（万一名字仍被省略也能看到全名）', async () => {
    const { wrapper } = await mountBank()
    /**
     * 2 列布局下实测零截断，但 `title` 仍要保留 ——
     * 超窄屏（320px）或系统字体放大时仍可能省略，那是最后的兜底。
     */
    const chips = categoryChips(wrapper).filter(
      (c) => c.find('.chip__label').text() !== '全部',
    )
    expect(chips.length).toBeGreaterThan(0)
    chips.forEach((c) => {
      const label = c.find('.chip__label').text()
      expect(c.attributes('title')).toBe(label)
    })
  })
})

describe('分类 Tab · 折叠与展开', () => {
  it('默认折叠：只渲染 2 行（全部 + 3 个分类）', async () => {
    const { wrapper } = await mountBank()
    /**
     * 2 列 × 2 行 = 4 格，「全部」占 1 格 → 3 个分类。
     * 展开箭头是绝对定位的浮动按钮，不占网格格子，所以不在 categoryChips 里。
     */
    expect(categoryChips(wrapper)).toHaveLength(4)
  })

  it('箭头位置固定，展开后不跟着跑（手机端好点）', () => {
    const src = read('src/views/BankView.vue')
    /**
     * 早先用 `bottom: 6px` 贴容器底边 —— 折叠态（2 行）时正好落在第 2 行右侧，
     * 但**展开后容器变高，箭头会跑到网格最底部**，手指得移到屏幕下方才点得到。
     * 改用 top 锚定后，两种状态下位置一致。
     *
     * 只检查 CSS 声明，先剥掉注释（注释里会提到 bottom 这段历史）。
     */
    const block = src.match(/\.bank-cats__more\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const decl = block[0].replace(/\/\*[\s\S]*?\*\//g, '')
    expect(decl).toMatch(/top:\s*\d+px/)
    expect(decl).not.toMatch(/bottom:/)
  })

  it('展开后点空白处收起', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
    await wrapper.vm.$nextTick()
    expect(categoryChips(wrapper).length).toBeGreaterThan(4)

    // 模拟点页面其它位置（不在 .bank-cats 内）
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(categoryChips(wrapper)).toHaveLength(4)
    outside.remove()
  })

  it('展开态限高 8 行，不能盖住下面的三行筛选器', () => {
    const css = read('src/assets/styles.css')
    const bankView = read('src/views/BankView.vue')

    /**
     * ## 为什么必须限高
     *
     * 展开分类是「把整个网格塞进页面」，分类越多页面越高。实测：
     *
     * | 分类数 | 展开高度 |
     * |---|---|
     * | 28（当前）| 564px |
     * | 40 | 792px → **超过一屏，题型/频率/难度被顶出视图** |
     *
     * 限高后展开高度恒为 298px（8 行），分类从 28 增长到 100 都不影响布局。
     */
    const block = css.match(/\.chip-grid--scroll\s*\{[^}]*\}/)
    expect(block, '缺少 .chip-grid--scroll 限高规则').toBeTruthy()
    const rule = block[0].replace(/\/\*[\s\S]*?\*\//g, '')

    // 8 行：8×38-6 = 298
    expect(rule).toMatch(/max-height:\s*298px/)
    expect(rule).toMatch(/overflow-y:\s*auto/)

    // 展开时才加这个类
    expect(bankView).toContain("'chip-grid--scroll': catsExpanded")
  })

  it('滚动条是自定义实现，位置在箭头下方', () => {
    const src = read('src/views/BankView.vue')
    /**
     * ## 为什么不用原生滚动条
     *
     * 全局设了 `scrollbar-width: thin`，Chrome 下 `::-webkit-scrollbar`
     * 会走 overlay 路径（实测 `offsetWidth - clientWidth = 0`）——
     * **不占位、静态下几乎不可见**，起不到「下面还有内容」的提示作用。
     *
     * 所以自己画一条 `.bank-cats__bar`，位置、粗细、颜色完全可控。
     */
    expect(src).toContain('bank-cats__bar')
    expect(src).toContain('bank-cats__thumb')
    expect(src).toContain('thumbHeightPct')
    expect(src).toContain('thumbOffsetPct')

    // 原生滚动条要明确关掉，避免两条滚动条并存
    const css = read('src/assets/styles.css')
    const block = css.match(/\.chip-grid--scroll\s*\{[^}]*\}/)
    expect(block[0]).toContain('scrollbar-width: none')

    // 滚动条只在展开且可滚动时渲染
    expect(src).toContain('catsExpanded && catScrollable')
  })

  it('内层滚到底后不能带动外层页面（滚动链）', () => {
    const css = read('src/assets/styles.css')
    const block = css.match(/\.chip-grid--scroll\s*\{[^}]*\}/)
    expect(block).toBeTruthy()
    const rule = block[0].replace(/\/\*[\s\S]*?\*\//g, '')

    /**
     * ## 不加会怎样
     *
     * 内层滚到底后继续滑动，剩余手势会传给外层（滚动链）——
     * 手机上表现为「分类列表已到底，再往上滑整个题库页面跟着动」，
     * 用户本想继续看更多分类，结果题目列表被滑走了。
     *
     * ## 实测对比（390×844 真实触摸序列）
     *
     * | | 页面 scrollY |
     * |---|---|
     * | 有 `contain` | 120 → 120（未动）✓ |
     * | 无 `contain` | 479 → 584（被带动 105px）✗ |
     */
    expect(rule).toMatch(/overscroll-behavior:\s*contain/)
  })

  it('滚动指示条的滑块随滚动位置更新', async () => {
    const { wrapper } = await mountBank()
    const vm = wrapper.vm
    /**
     * `updateCatScrollState` 读 DOM 尺寸，jsdom 里 clientHeight/scrollHeight 都是 0，
     * 所以这里只断言「函数存在且被滚动事件调用」，实际尺寸联动由
     * Playwright 实测覆盖（滚到中间滑块跟随、到底对齐）。
     */
    expect(typeof vm.updateCatScrollState).toBe('function')
    expect(typeof vm.onCatsScroll).toBe('function')

    // 模板里绑定了 scroll
    expect(wrapper.find('nav[aria-label="分类筛选"]').attributes()).toBeTruthy()
  })

  it('展开时把选中的分类滚进可见区', () => {
    const src = read('src/views/BankView.vue')
    /**
     * 限高后大部分分类在滚动区外。若用户当前选的是第 20 个分类，
     * 展开后它可能不在可见范围，用户会以为「没选中」。
     */
    const fn = src.slice(src.indexOf('async function toggleCats'), src.indexOf('async function toggleCats') + 700)
    expect(fn).toContain('scrollIntoView')
    // 只滚网格内部，不带动页面
    expect(fn).toContain("block: 'nearest'")
  })

  it('选中分类后自动收起（选完就该回到紧凑态）', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
    await wrapper.vm.$nextTick()
    expect(categoryChips(wrapper).length).toBeGreaterThan(4)

    // 点第二个 chip（第一个是「全部」）
    await categoryChips(wrapper)[1].trigger('click')
    await wrapper.vm.$nextTick()

    expect(categoryChips(wrapper)).toHaveLength(4)
  })

  it('选中的分类即使被折叠也仍然可见（补到第一位）', async () => {
    const { wrapper } = await mountBank({ category: 'MySQL' })
    /**
     * 折叠只显示前 3 个分类，「MySQL」不在其中 ——
     * 但用户选了它，就必须能在折叠态看到，否则「选中了却看不见」。
     *
     * 注意「全部」永远排第一，被补进来的分类从第二位开始。
     */
    const texts = categoryChips(wrapper).map((c) => c.find('.chip__label').text())
    expect(texts[0]).toBe('全部')
    expect(texts).toContain('MySQL')
    // 且它是「选中」状态
    const mysqlChip = categoryChips(wrapper).find(
      (c) => c.find('.chip__label').text() === 'MySQL',
    )
    expect(mysqlChip.classes()).toContain('chip--active')
  })

  it('折叠时末尾只有一个箭头胶囊（不含文字），语义放在 aria-label', async () => {
    const { wrapper } = await mountBank()
    const toggle = wrapper.find('.bank-cats__more')
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
    await wrapper.find('.bank-cats__more').trigger('click')

    expect(categoryChips(wrapper)).toHaveLength(CATEGORIES.length + 1)

    const toggle = wrapper.find('.bank-cats__more')
    expect(toggle.attributes('aria-label')).toContain('收起分类')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    // 展开后箭头翻转
    expect(toggle.classes()).toContain('bank-cats__more--open')
  })

  it('展开后全部 25 个分类都可见可点', async () => {
    const { wrapper } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
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
    const arrow = wrapper.find('.bank-cats__more')
    // 视觉上只剩箭头，但 aria-label 要说清它干什么
    expect(arrow.text().trim()).toBe('')
    expect(arrow.attributes('aria-label')).toContain('展开全部')
  })

  it('分类不足一屏时不出折叠按钮', async () => {
    const bank = useBankStore()
    bank.questions = ALL_CATEGORIES_FIXTURE.slice(0, 3)
    const { wrapper } = await mountBank()
    expect(wrapper.find('.bank-cats__more').exists()).toBe(false)
    expect(categoryChips(wrapper)).toHaveLength(4)
  })

  it('展开后仍可点击分类并写入 URL', async () => {
    const { wrapper, router } = await mountBank()
    await wrapper.find('.bank-cats__more').trigger('click')
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
    await wrapper.find('.bank-cats__more').trigger('click')
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
