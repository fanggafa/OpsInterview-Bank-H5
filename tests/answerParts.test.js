import { describe, expect, it } from 'vitest'
import { hasFigure, parseAnswer, splitEmphasis } from '@/utils/answerParts'

describe('parseAnswer · 插图标记', () => {
  it('无标记时返回单个文本片段', () => {
    expect(parseAnswer('纯文本答案')).toEqual([{ type: 'text', text: '纯文本答案' }])
  })

  it('识别 [[图:id]] 并拆成三段', () => {
    const parts = parseAnswer('前文\n[[图:dns-resolve]]\n后文')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toEqual({ type: 'text', text: '前文' })
    expect(parts[1]).toEqual({ type: 'figure', id: 'dns-resolve' })
    expect(parts[2]).toEqual({ type: 'text', text: '后文' })
  })

  it('支持多个插图', () => {
    const parts = parseAnswer('A\n[[图:f1]]\nB\n[[图:f2]]\nC')
    const figs = parts.filter((p) => p.type === 'figure')
    expect(figs.map((f) => f.id)).toEqual(['f1', 'f2'])
  })

  it('标记前后多余空行被裁掉', () => {
    const parts = parseAnswer('前\n\n[[图:x]]\n\n后')
    expect(parts[0].text).toBe('前')
    expect(parts[2].text).toBe('后')
  })

  it('空输入返回空数组', () => {
    expect(parseAnswer('')).toEqual([])
    expect(parseAnswer(null)).toEqual([])
    expect(parseAnswer(undefined)).toEqual([])
  })

  it('非法 id（大写/下划线）不会被误认', () => {
    const parts = parseAnswer('看看 [[图:Bad_ID]]')
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe('text')
  })
})

describe('hasFigure', () => {
  it('有标记返回 true', () => {
    expect(hasFigure('x\n[[图:a-b]]\n')).toBe(true)
  })

  it('无标记或非字符串返回 false', () => {
    expect(hasFigure('纯文本')).toBe(false)
    expect(hasFigure(null)).toBe(false)
  })
})

describe('splitEmphasis', () => {
  it('无标记时为单个普通片段', () => {
    expect(splitEmphasis('普通文本')).toEqual([{ text: '普通文本', strong: false }])
  })

  it('识别 **强调** 并标记 strong', () => {
    const segs = splitEmphasis('这是**重点**内容')
    expect(segs).toEqual([
      { text: '这是', strong: false },
      { text: '重点', strong: true },
      { text: '内容', strong: false },
    ])
  })

  it('支持多个强调', () => {
    const segs = splitEmphasis('**A**和**B**')
    expect(segs.filter((s) => s.strong).map((s) => s.text)).toEqual(['A', 'B'])
  })

  it('整段都是强调', () => {
    expect(splitEmphasis('**全部**')).toEqual([{ text: '全部', strong: true }])
  })

  it('未闭合的 ** 原样保留（不产生错误高亮）', () => {
    const segs = splitEmphasis('落单 ** 星号')
    expect(segs.some((s) => s.strong)).toBe(false)
    expect(segs.map((s) => s.text).join('')).toContain('**')
  })

  it('空输入返回空数组', () => {
    expect(splitEmphasis('')).toEqual([])
  })
})
