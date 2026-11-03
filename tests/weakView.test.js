import { describe, expect, it, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import WeakView from '@/views/WeakView.vue'
import HomeView from '@/views/HomeView.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { proficiencyLevel } from '@/utils/constants'

/**
 * 分类熟练度页（原「薄弱分类」）。
 *
 * 2026-11 合并：本页由两处并成 ——
 * ① 原「薄弱分类」（选择题错误率榜）
 * ② 「我的」页的「各分类掌握度（仅简答题）」柱状图
 *
 * 现在一行一个分类，**左列选择题熟练度、右列简答题掌握度**。
 * 两个指标统一成「越高越好」：选择题由错误率反算（`1 - 错率`）。
 */

const mkChoice = (id, category) => ({
  id,
  type: 'single',
  category,
  difficulty: '简单',
  frequency: '高频',
  question: `${category}-${id}`,
  answer: ['A'],
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
  ],
  tags: [],
})

const mkShort = (id, category) => ({
  id,
  type: 'short',
  category,
  difficulty: '简单',
  frequency: '高频',
  question: `${category}-简答-${id}`,
  answer: '一段足够长的答案文本，用于通过校验。',
  tags: [],
})

/**
 * 夹具需同时覆盖两种题型：
 * - MySQL：3 道选择题（全错 → 选择熟练度 0%）
 * - MySQL：2 道简答题（自评 1 会 1 不会 → 掌握度 50%）
 * - Nginx：3 道选择题（全对 → 选择熟练度 100%）
 * - Nginx：2 道简答题（都自评「不会」→ 掌握度 0%）
 *
 * 注意分类名必须是 `CATEGORIES` 里的真实名字，否则 `categoryProficiency`
 * 过滤时会因为不在枚举里而被丢掉。
 */
const FIXTURE = [
  mkChoice(1, 'MySQL'),
  mkChoice(2, 'MySQL'),
  mkChoice(3, 'MySQL'),
  mkShort(4, 'MySQL'),
  mkShort(5, 'MySQL'),
  mkChoice(11, 'Nginx'),
  mkChoice(12, 'Nginx'),
  mkChoice(13, 'Nginx'),
  mkShort(14, 'Nginx'),
  mkShort(15, 'Nginx'),
]

const rec = ({ times = 1, inWrong = false, status = 'unknown' } = {}) => ({
  times,
  inWrong,
  status,
  lastReviewed: 1,
  streak: 0,
})

let pinia
let bank
let study

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
  bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  bank.loadIndex = () => Promise.resolve(FIXTURE)
  study = useStudyStore()
})

function makeRouter() {
  const blank = { template: '<div />' }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/weak', component: WeakView },
      { path: '/practice', component: blank },
      { path: '/bank', component: blank },
      { path: '/question/:id', component: blank },
      { path: '/me', component: blank },
    ],
  })
}

async function mountAt(path, comp) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(comp, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return { wrapper, router }
}

describe('store · categoryProficiency', () => {
  it('选择题错误率反转成熟练度（全错 → 0%）', () => {
    // 3 道选择题全进错题本 → 错误率 100% → 熟练度 0%
    ;[1, 2, 3].forEach((id) => study.markUnknown(id))
    const mysql = study.categoryProficiency.find((r) => r.category === 'MySQL')
    expect(mysql.choice.pct).toBe(0)
    expect(mysql.choice.reviewed).toBe(3)
    expect(mysql.choice.wrong).toBe(3)
  })

  it('选择题全对 → 熟练度 100%', () => {
    bank.questions = [mkChoice(11, 'Nginx'), mkChoice(12, 'Nginx'), mkChoice(13, 'Nginx')]
    ;[11, 12, 13].forEach((id) => {
      study.records = { ...study.records, [id]: rec({ times: 1, inWrong: false, status: 'know' }) }
    })
    const nginx = study.categoryProficiency.find((r) => r.category === 'Nginx')
    expect(nginx.choice.pct).toBe(100)
    expect(nginx.choice.wrong).toBe(0)
  })

  it('简答题掌握度 = 会 / (会+不会)', () => {
    study.markKnow(4)
    study.markUnknown(5)
    const mysql = study.categoryProficiency.find((r) => r.category === 'MySQL')
    expect(mysql.short.pct).toBe(50)
    expect(mysql.short.answered).toBe(2)
  })

  it('没刷过选择题时该列为 null（显示「—」而不是 0%）', () => {
    const mysql = study.categoryProficiency.find((r) => r.category === 'MySQL')
    expect(mysql.choice.pct).toBeNull()
  })

  it('不受 33% 上榜门槛影响：刷 1 题全对也给 100%', () => {
    /**
     * 关键差异：`weakCategories` 有 33% 门槛（样本不够不进榜），
     * 但熟练度页要**如实展示每个分类**。
     * 早先若复用 weakCategories，刷 3 题全对的分类会显示成「—」，像没数据。
     */
    bank.questions = [mkChoice(11, 'Nginx'), mkChoice(12, 'Nginx'), mkChoice(13, 'Nginx')]
    study.records = { ...study.records, 11: rec({ times: 1, inWrong: false, status: 'know' }) }
    const nginx = study.categoryProficiency.find((r) => r.category === 'Nginx')
    expect(nginx.choice.pct).toBe(100)
  })
})

describe('分类熟练度页 · 等级制单指标', () => {
  it('一行一个分类，只有一个主指标（不再有第二列）', async () => {
    study.markUnknown(1)
    study.markKnow(4)
    const { wrapper } = await mountAt('/weak', WeakView)

    const items = wrapper.findAll('.item')
    expect(items.length).toBeGreaterThan(0)

    // 每行只有一条进度条 + 一个等级徽标
    const first = items[0]
    expect(first.findAll('.item__bar')).toHaveLength(1)
    expect(first.findAll('.item__level')).toHaveLength(1)
    // 旧的「双列格子」已不存在
    expect(first.findAll('.item__cell')).toHaveLength(0)
  })

  it('不再出现「简答未自评」这类第二指标的注脚', async () => {
    /**
     * A 方案的核心是「一页只讲一件事」：
     * 把主观自评数据留在列表里，哪怕字号再小，也等于承认还有第二根可比指标。
     * 所以简答那行注脚整体移除。
     */
    study.markUnknown(1)
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.text()).not.toContain('简答未自评')
    expect(wrapper.text()).not.toContain('简答自评')
  })

  it('页面标题是「分类熟练度」', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.find('.header__title').text()).toBe('分类熟练度')
  })

  it('没有任何按钮（纯自我评估）', async () => {
    study.markUnknown(1)
    const { wrapper } = await mountAt('/weak', WeakView)
    expect(wrapper.findAll('.item button')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('刷错题')
  })
})

describe('等级换算 proficiencyLevel', () => {
  it('没有样本 → 未开始', () => {
    expect(proficiencyLevel(null).key).toBe('none')
    expect(proficiencyLevel(null).label).toBe('未开始')
  })

  it('0%（刷了但全错）→ 未掌握，而不是入门', () => {
    /**
     * 全错的人看到「入门」会困惑：一道都没答对，怎么就入门了。
     * 所以 0% 单列成「未掌握」。
     */
    expect(proficiencyLevel(0).key).toBe('fail')
    expect(proficiencyLevel(0).label).toBe('未掌握')
  })

  it('1~49% → 入门', () => {
    expect(proficiencyLevel(1).key).toBe('entry')
    expect(proficiencyLevel(49).key).toBe('entry')
  })

  it('50~79% → 熟练', () => {
    expect(proficiencyLevel(50).key).toBe('skilled')
    expect(proficiencyLevel(79).key).toBe('skilled')
  })

  it('>= 80% → 精通', () => {
    expect(proficiencyLevel(80).key).toBe('mastered')
    expect(proficiencyLevel(100).key).toBe('mastered')
  })
})
describe('首页 · 分类熟练度入口卡', () => {
  it('卡片标题是「分类熟练度」，不再叫「薄弱分类」', async () => {
    const { wrapper } = await mountAt('/', HomeView)
    const titles = wrapper.findAll('.review__title').map((n) => n.text())
    expect(titles).toContain('分类熟练度')
    expect(titles).not.toContain('薄弱分类')
  })

  it('无数据时显示引导文案，且仍可点进 /weak', async () => {
    const { wrapper, router } = await mountAt('/', HomeView)
    const card = wrapper.findAll('.review').find((c) => c.text().includes('分类熟练度'))
    expect(card).toBeTruthy()
    expect(card.text()).toContain('数据量不足')

    await card.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/weak')
  })

  it('有数据时摘要说明「有多少个分类有记录」并提示左右两列', async () => {
    study.markUnknown(1)
    study.markKnow(4)
    const { wrapper } = await mountAt('/', HomeView)
    const card = wrapper.findAll('.review').find((c) => c.text().includes('分类熟练度'))
    expect(card.text()).toContain('个分类有记录')
    expect(card.text()).toContain('选择题熟练度')
    
  })
})
