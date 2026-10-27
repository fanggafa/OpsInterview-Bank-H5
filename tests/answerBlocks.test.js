import { describe, expect, it } from 'vitest'
import { parseAnswerFlow, parseBlocks, splitInline } from '@/utils/answerParts'

/** 取块类型的简写 */
const types = (blocks) => blocks.map((b) => b.type)

/** 把行内片段还原成纯文本 */
const flat = (segs) => segs.map((s) => s.text).join('')

describe('splitInline · 强调与行内代码', () => {
  it('无标记时为单个普通片段', () => {
    expect(splitInline('普通文本')).toEqual([{ text: '普通文本', strong: false, code: false }])
  })

  it('识别 **强调**', () => {
    const segs = splitInline('这是**重点**内容')
    expect(segs).toEqual([
      { text: '这是', strong: false, code: false },
      { text: '重点', strong: true, code: false },
      { text: '内容', strong: false, code: false },
    ])
  })

  it('识别 `行内代码`', () => {
    const segs = splitInline('执行 `kubectl drain` 迁移')
    expect(segs).toEqual([
      { text: '执行 ', strong: false, code: false },
      { text: 'kubectl drain', strong: false, code: true },
      { text: ' 迁移', strong: false, code: false },
    ])
  })

  it('强调与代码可混排', () => {
    const segs = splitInline('**先**跑 `ls`')
    expect(segs.filter((s) => s.strong).map((s) => s.text)).toEqual(['先'])
    expect(segs.filter((s) => s.code).map((s) => s.text)).toEqual(['ls'])
  })

  it('未闭合的标记原样保留', () => {
    const joined = flat(splitInline('落单 ** 与 ` 号'))
    expect(joined).toContain('**')
    expect(joined).toContain('`')
  })

  it('空输入返回空数组', () => {
    expect(splitInline('')).toEqual([])
    expect(splitInline(null)).toEqual([])
  })
})

describe('parseBlocks · 块级结构', () => {
  it('空文本返回空数组', () => {
    expect(parseBlocks('')).toEqual([])
    expect(parseBlocks('   \n\n  ')).toEqual([])
  })

  it('纯段落', () => {
    const b = parseBlocks('第一行\n第二行')
    expect(types(b)).toEqual(['paragraph'])
    expect(flat(b[0].segs)).toBe('第一行\n第二行')
  })

  it('标题按层级解析', () => {
    const b = parseBlocks('# 一级\n### 三级')
    expect(types(b)).toEqual(['heading', 'heading'])
    expect(b[0].level).toBe(1)
    expect(b[1].level).toBe(3)
  })

  it('无序列表按行拆项', () => {
    const b = parseBlocks('- 甲\n- 乙\n- 丙')
    expect(types(b)).toEqual(['list'])
    expect(b[0].ordered).toBe(false)
    expect(b[0].items.map((i) => flat(i.segs))).toEqual(['甲', '乙', '丙'])
  })

  it('有序列表按行拆项', () => {
    const b = parseBlocks('1. 一\n2. 二')
    expect(types(b)).toEqual(['list'])
    expect(b[0].ordered).toBe(true)
    expect(b[0].items).toHaveLength(2)
  })

  it('列表缩进映射为层级', () => {
    const b = parseBlocks('- 顶层\n  - 二级')
    expect(b[0].items[0].depth).toBe(0)
    expect(b[0].items[1].depth).toBe(1)
  })

  it('表格解析出表头、对齐与数据行', () => {
    const b = parseBlocks('| 名称 | 说明 |\n|---|:---:|\n| a | 甲 |\n| b | 乙 |')
    expect(types(b)).toEqual(['table'])
    expect(b[0].header.map(flat)).toEqual(['名称', '说明'])
    expect(b[0].align).toEqual(['left', 'center'])
    expect(b[0].rows).toHaveLength(2)
    expect(b[0].rows[1].map(flat)).toEqual(['b', '乙'])
  })

  it('表格单元格内的 | 被转义保护', () => {
    const b = parseBlocks('| 命令 | 说明 |\n|---|---|\n| a \\| b | 管道 |')
    expect(b[0].rows[0][0]).toEqual([{ text: 'a | b', strong: false, code: false }])
  })

  it('代码围栏保留内部内容与缩进', () => {
    const b = parseBlocks('```bash\nls -l\n  echo hi\n```')
    expect(types(b)).toEqual(['code'])
    expect(b[0].lang).toBe('bash')
    expect(b[0].lines).toEqual(['ls -l', '  echo hi'])
  })

  it('未闭合的代码围栏也按代码块处理（不吞掉后文）', () => {
    const b = parseBlocks('```\na\n```')
    expect(types(b)).toEqual(['code'])
    expect(b[0].lines).toEqual(['a'])
  })

  it('分隔线与引用', () => {
    expect(types(parseBlocks('---'))).toEqual(['hr'])
    const q = parseBlocks('> 引用一\n> 引用二')
    expect(types(q)).toEqual(['quote'])
    expect(q[0].text).toBe('引用一\n引用二')
  })

  it('段落、列表、代码可混合', () => {
    const b = parseBlocks('开头\n\n- 甲\n- 乙\n\n```\nx\n```\n\n结尾')
    expect(types(b)).toEqual(['paragraph', 'list', 'code', 'paragraph'])
  })

  it('整段缩进的续行按代码块渲染（保留树形对齐）', () => {
    const b = parseBlocks('目录结构：\n  a\n    b')
    expect(types(b)).toEqual(['paragraph', 'code'])
    expect(b[1].lines[1]).toBe('  b')
  })
})

describe('parseAnswerFlow · 插图与块混合', () => {
  it('无插图时返回单个 blocks 项', () => {
    const flow = parseAnswerFlow('第一段\n- 甲')
    expect(flow).toHaveLength(1)
    expect(flow[0].type).toBe('blocks')
    expect(types(flow[0].blocks)).toEqual(['paragraph', 'list'])
  })

  it('插图单独成项，前后文本各自成块', () => {
    const flow = parseAnswerFlow('前文\n[[图:dns-resolve]]\n后文')
    expect(flow.map((f) => f.type)).toEqual(['blocks', 'figure', 'blocks'])
    expect(flow[1].id).toBe('dns-resolve')
  })
})
