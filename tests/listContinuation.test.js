import { describe, expect, it } from 'vitest'
import { parseBlocks } from '@/utils/answerParts'

const types = (blocks) => blocks.map((b) => b.type)

describe('parseBlocks · 列表项的缩进续行', () => {
  it('续行挂到列表项上，不被拆成独立代码块', () => {
    const b = parseBlocks('1. 用 ipset 替代大量规则：\n   把几百条规则合并\n   ipset create badlist hash:ip')
    expect(types(b)).toEqual(['list'])
    expect(b[0].items[0].extra).toEqual(['把几百条规则合并', 'ipset create badlist hash:ip'])
  })

  it('多个列表项各自的续行互不串台', () => {
    const b = parseBlocks('- 甲：\n  甲续行\n- 乙：\n  乙续行')
    expect(b[0].items).toHaveLength(2)
    expect(b[0].items[0].extra).toEqual(['甲续行'])
    expect(b[0].items[1].extra).toEqual(['乙续行'])
  })

  it('续行之后的同级列表项仍归入同一列表', () => {
    const b = parseBlocks('- 甲\n  续行\n- 乙\n- 丙')
    expect(types(b)).toEqual(['list'])
    expect(b[0].items).toHaveLength(3)
  })

  it('列表后接标题会结束列表', () => {
    const b = parseBlocks('- 甲\n\n**要点**：')
    expect(types(b)).toEqual(['list', 'paragraph'])
  })

  it('列表后接代码围栏会结束列表', () => {
    const b = parseBlocks('- 甲\n```\nls\n```')
    expect(types(b)).toEqual(['list', 'code'])
  })

  it('没有续行时 extra 为空数组', () => {
    const b = parseBlocks('- 甲\n- 乙')
    expect(b[0].items.every((i) => i.extra.length === 0)).toBe(true)
  })
})
