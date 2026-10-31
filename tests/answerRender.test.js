import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerText from '@/components/AnswerText.vue'

const DATA = JSON.parse(readFileSync(resolve(__dirname, '../public/data/questions.json'), 'utf8'))
const byId = (id) => DATA.find((q) => q.id === id)

/**
 * 按题干片段找题。
 *
 * 题库编号会随「区间扩容」重排（如 200 区间 → 500 区间），
 * 所以测试不要硬编码 id，用题干特征更稳。
 */
const byQuestion = (fragment) => DATA.find((q) => String(q.question).includes(fragment))

function mountAnswer(answer) {
  return mount(AnswerText, { props: { answer } })
}

describe('AnswerText · 表格渲染', () => {
  it('Markdown 表格渲染成真 <table>，而不是一串竖线', () => {
    const wrapper = mountAnswer('核心结构：\n\n| 概念 | 说明 |\n|---|---|\n| MVCC | 多版本 |\n| WAL | 先写日志 |')
    expect(wrapper.find('table.ans-table').exists()).toBe(true)
    expect(wrapper.findAll('thead th')).toHaveLength(2)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    // 正文里不应再出现裸的竖线分隔符
    expect(wrapper.find('.ans-table-wrap').text()).not.toContain('|')
  })

  it('表格对齐方式写入 td 的 class', () => {
    const wrapper = mountAnswer('| 左 | 中 | 右 |\n|---|:---:|---:|\n| a | b | c |')
    const tds = wrapper.findAll('tbody td')
    expect(tds[0].classes()).toContain('ta-left')
    expect(tds[1].classes()).toContain('ta-center')
    expect(tds[2].classes()).toContain('ta-right')
  })

  it('真实题库的 WiredTiger 题目渲染出表格（回归：文字串行/竖线外露）', () => {
    // 用题干特征定位，避免题库重排 id 后测试失效
    const q = byQuestion('WiredTiger')
    expect(q).toBeTruthy()
    const wrapper = mountAnswer(q.answer)
    expect(wrapper.find('table.ans-table').exists()).toBe(true)
    const text = wrapper.text()
    expect(text).toContain('WiredTiger')
    expect(text).not.toContain('|---|---|')
  })
})

describe('AnswerText · 列表与代码', () => {
  it('无序列表渲染成 <ul>，每项一个 li', () => {
    const wrapper = mountAnswer('问题：\n- 静默失败\n- 集合级锁\n- 索引膨胀')
    expect(wrapper.findAll('ul.ans-list > li')).toHaveLength(3)
  })

  it('有序列表渲染成 <ol> 并带序号徽标', () => {
    const wrapper = mountAnswer('1. 第一步\n2. 第二步')
    expect(wrapper.findAll('ol.ans-list > li')).toHaveLength(2)
    expect(wrapper.findAll('.ans-list__num').map((n) => n.text())).toEqual(['1', '2'])
  })

  it('代码围栏渲染成 pre > code，保留换行', () => {
    const wrapper = mountAnswer('```bash\nls -l\n```')
    const pre = wrapper.find('pre.ans-pre__body')
    expect(pre.exists()).toBe(true)
    expect(pre.find('code').text()).toContain('ls -l')
    expect(wrapper.find('.ans-pre__lang').text()).toBe('bash')
  })

  it('未闭合的代码围栏不会把后文变成超长代码块', () => {
    const wrapper = mountAnswer('开头\n```\nline1\nline2')
    expect(wrapper.find('pre.ans-pre__body').exists()).toBe(true)
    expect(wrapper.text()).toContain('开头')
  })
})

describe('AnswerText · 行内样式', () => {
  it('**强调** 渲染成 strong，星号不外露', () => {
    const wrapper = mountAnswer('这是**重点**内容')
    expect(wrapper.find('strong.ans-strong').text()).toBe('重点')
    expect(wrapper.text()).not.toContain('**')
  })

  it('`行内代码` 渲染成 code，反引号不外露', () => {
    const wrapper = mountAnswer('执行 `kubectl drain` 迁移')
    expect(wrapper.find('code.ans-code-inline').text()).toBe('kubectl drain')
    expect(wrapper.text()).not.toContain('`')
  })

  it('标题渲染成带层级的块', () => {
    const wrapper = mountAnswer('# 一级标题')
    expect(wrapper.find('.ans-h--1').text()).toBe('一级标题')
  })

  it('不渲染 HTML：内容里的标签原样显示为文本', () => {
    const wrapper = mountAnswer('<img src=x onerror=alert(1)> 与 <b>bold</b>')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('b').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x onerror=alert(1)>')
  })
})

describe('AnswerText · 插图与空态', () => {
  it('未注册的插图 id 退化成纯文本标记', () => {
    const wrapper = mountAnswer('前文\n[[图:not-exist]]\n后文')
    expect(wrapper.text()).toContain('[[图:not-exist]]')
  })

  it('空答案渲染为空容器且不报错', () => {
    const wrapper = mountAnswer('')
    expect(wrapper.find('.answer-body').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })
})
