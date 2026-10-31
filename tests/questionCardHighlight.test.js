import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuestionCard from '@/components/QuestionCard.vue'

/**
 * 列表卡片的题干高亮。
 *
 * 关键约束：**不能出现 v-html** —— 题库内容可能含任意字符，
 * 用 HTML 拼接就有注入风险。所以高亮必须是「插值 + <mark>」的形式。
 */

beforeEach(() => {
  setActivePinia(createPinia())
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
})

const Q = {
  id: 5001,
  type: 'short',
  category: 'Linux基础',
  difficulty: '简单',
  frequency: '高频',
  question: '三次握手发生在 TCP 的哪个阶段？',
  tags: [],
}

function mountCard(props = {}) {
  return mount(QuestionCard, {
    props: { question: Q, showStatus: false, ...props },
  })
}

describe('QuestionCard · 搜索高亮', () => {
  it('无关键词时不渲染任何 mark', () => {
    const w = mountCard({ keyword: '' })
    expect(w.findAll('mark')).toHaveLength(0)
    expect(w.find('.qcard__summary').text()).toBe('三次握手发生在 TCP 的哪个阶段？')
  })

  it('有命中关键词时渲染 mark，且内容正确', () => {
    const w = mountCard({ keyword: '握手' })
    const marks = w.findAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('握手')
    expect(marks[0].classes()).toContain('qcard__hl')
  })

  it('高亮后题干文本与原文一致（不丢字、不重复）', () => {
    const w = mountCard({ keyword: 'TCP' })
    expect(w.find('.qcard__summary').text()).toBe(Q.question)
  })

  it('无命中时整段正常显示，不出现 mark', () => {
    const w = mountCard({ keyword: 'xyz不存在' })
    expect(w.findAll('mark')).toHaveLength(0)
    expect(w.find('.qcard__summary').text()).toBe(Q.question)
  })

  it('大小写不敏感：小写关键词也能命中大写的 TCP', () => {
    const w = mountCard({ keyword: 'tcp' })
    const marks = w.findAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('TCP')
  })

  it('多个关键词各自高亮', () => {
    const w = mountCard({ keyword: '握手 阶段' })
    const marks = w.findAll('mark').map((m) => m.text())
    expect(marks).toEqual(['握手', '阶段'])
  })

  it('不使用 v-html（防注入）：模板里不应出现 v-html', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/components/QuestionCard.vue', 'utf8')
    expect(src).not.toContain('v-html')
  })

  it('含特殊字符的题库内容被当作文本处理，不会变成标签', () => {
    const evil = {
      ...Q,
      question: '<script>alert(1)</script> 是什么',
    }
    const w = mount(QuestionCard, {
      props: { question: evil, showStatus: false, keyword: 'script' },
    })
    // 尖括号被转义成文本，不产生真实 script 标签
    expect(w.html()).not.toContain('<script>alert')
    expect(w.find('.qcard__summary').text()).toContain('<script>alert(1)</script>')
  })
})
