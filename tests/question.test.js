import { describe, expect, it } from 'vitest'
import {
  answerSingle,
  correctKeys,
  getType,
  isChoice,
  isMultiple,
  isShort,
  judgeChoice,
  optionState,
  resultText,
  resultToStatus,
  toggleOption,
} from '@/utils/question'
import { STATUS } from '@/utils/constants'

const SINGLE = {
  id: 1,
  type: 'single',
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
    { key: 'C', text: 'c' },
  ],
  answer: ['B'],
}

const MULTIPLE = {
  id: 2,
  type: 'multiple',
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
    { key: 'C', text: 'c' },
    { key: 'D', text: 'd' },
  ],
  answer: ['A', 'C'],
}

const SHORT = { id: 3, question: 'q', answer: 'a' }

describe('题型识别', () => {
  it('缺省 type 视为 short（兼容旧数据）', () => {
    expect(getType(SHORT)).toBe('short')
    expect(getType({})).toBe('short')
    expect(getType(null)).toBe('short')
  })

  it('非法 type 回退 short', () => {
    expect(getType({ type: 'bogus' })).toBe('short')
  })

  it('isShort / isChoice / isMultiple', () => {
    expect(isShort(SHORT)).toBe(true)
    expect(isShort(SINGLE)).toBe(false)
    expect(isChoice(SINGLE)).toBe(true)
    expect(isChoice(MULTIPLE)).toBe(true)
    expect(isChoice(SHORT)).toBe(false)
    expect(isMultiple(MULTIPLE)).toBe(true)
    expect(isMultiple(SINGLE)).toBe(false)
  })
})

describe('correctKeys', () => {
  it('返回归一化的大写 key 数组', () => {
    expect(correctKeys({ answer: ['a', 'C'] })).toEqual(['A', 'C'])
  })

  it('非数组返回空（防御简答题）', () => {
    expect(correctKeys(SHORT)).toEqual([])
    expect(correctKeys({})).toEqual([])
  })

  it('过滤空白项', () => {
    expect(correctKeys({ answer: ['A', '', ' '] })).toEqual(['A'])
  })
})

describe('judgeChoice · 单选', () => {
  it('选对为 true', () => {
    expect(judgeChoice(SINGLE, ['B'])).toBe(true)
  })

  it('选错为 false', () => {
    expect(judgeChoice(SINGLE, ['A'])).toBe(false)
  })

  it('小写 key 同样判定正确', () => {
    expect(judgeChoice(SINGLE, ['b'])).toBe(true)
  })

  it('未选择为 false', () => {
    expect(judgeChoice(SINGLE, [])).toBe(false)
    expect(judgeChoice(SINGLE, null)).toBe(false)
  })

  it('单选多选了也算错', () => {
    expect(judgeChoice(SINGLE, ['A', 'B'])).toBe(false)
  })
})

describe('judgeChoice · 多选（全对才算对）', () => {
  it('完全正确为 true', () => {
    expect(judgeChoice(MULTIPLE, ['A', 'C'])).toBe(true)
  })

  it('顺序无关', () => {
    expect(judgeChoice(MULTIPLE, ['C', 'A'])).toBe(true)
  })

  it('漏选算错', () => {
    expect(judgeChoice(MULTIPLE, ['A'])).toBe(false)
    expect(judgeChoice(MULTIPLE, ['C'])).toBe(false)
  })

  it('多选（含错误项）算错', () => {
    expect(judgeChoice(MULTIPLE, ['A', 'B', 'C'])).toBe(false)
  })

  it('全错算错', () => {
    expect(judgeChoice(MULTIPLE, ['B', 'D'])).toBe(false)
  })

  it('只选错误项算错', () => {
    expect(judgeChoice(MULTIPLE, ['B'])).toBe(false)
  })

  it('不选算错', () => {
    expect(judgeChoice(MULTIPLE, [])).toBe(false)
  })

  it('答案缺失时一律判错', () => {
    expect(judgeChoice({ type: 'single', options: [], answer: [] }, ['A'])).toBe(false)
  })
})

describe('answerSingle', () => {
  it('点对选项返回 passed=true', () => {
    expect(answerSingle(SINGLE, 'B')).toEqual({ selected: ['B'], passed: true })
  })

  it('点错选项返回 passed=false', () => {
    expect(answerSingle(SINGLE, 'A')).toEqual({ selected: ['A'], passed: false })
  })

  it('小写 key 归一化', () => {
    expect(answerSingle(SINGLE, 'b').selected).toEqual(['B'])
  })
})

describe('toggleOption', () => {
  it('未选中则加入', () => {
    expect(toggleOption([], 'A')).toEqual(['A'])
  })

  it('已选中则移除', () => {
    expect(toggleOption(['A', 'C'], 'A')).toEqual(['C'])
  })

  it('不修改原数组', () => {
    const src = ['A']
    toggleOption(src, 'B')
    expect(src).toEqual(['A'])
  })

  it('小写归一化后仍能正确切换', () => {
    expect(toggleOption(['a'], 'A')).toEqual([])
  })

  it('非法入参兜底为空数组', () => {
    expect(toggleOption(null, 'A')).toEqual(['A'])
  })
})

describe('resultToStatus', () => {
  it('答对 → know', () => {
    expect(resultToStatus(true)).toBe(STATUS.KNOW)
  })

  it('答错 → unknown', () => {
    expect(resultToStatus(false)).toBe(STATUS.UNKNOWN)
  })
})

describe('optionState', () => {
  it('单选答对：选中项为 correct，其余 idle', () => {
    const states = optionState(SINGLE, ['B'], true)
    expect(states).toEqual({ A: 'idle', B: 'correct', C: 'idle' })
  })

  it('单选答错：选中项 wrong，正确项在答错后标记 missed', () => {
    const states = optionState(SINGLE, ['A'], false)
    expect(states).toEqual({ A: 'wrong', B: 'missed', C: 'idle' })
  })

  it('多选全对：两个正确项都为 correct', () => {
    const states = optionState(MULTIPLE, ['A', 'C'], true)
    expect(states).toEqual({ A: 'correct', B: 'idle', C: 'correct', D: 'idle' })
  })

  it('多选漏选：漏选那项为 missed，选中正确项为 correct', () => {
    const states = optionState(MULTIPLE, ['A'], false)
    expect(states).toEqual({ A: 'correct', B: 'idle', C: 'missed', D: 'idle' })
  })

  it('多选多选：错选项为 wrong', () => {
    const states = optionState(MULTIPLE, ['A', 'B', 'C'], false)
    expect(states).toEqual({ A: 'correct', B: 'wrong', C: 'correct', D: 'idle' })
  })

  it('空选项返回空对象', () => {
    expect(optionState({}, [], false)).toEqual({})
  })
})

describe('resultText', () => {
  it('简答题用「会/不会/未刷」', () => {
    expect(resultText(SHORT, STATUS.KNOW)).toBe('会')
    expect(resultText(SHORT, STATUS.UNKNOWN)).toBe('不会')
    expect(resultText(SHORT, null)).toBe('未刷')
  })

  it('选择题用「答对/答错/未作答」', () => {
    expect(resultText(SINGLE, STATUS.KNOW)).toBe('答对')
    expect(resultText(SINGLE, STATUS.UNKNOWN)).toBe('答错')
    expect(resultText(SINGLE, null)).toBe('未作答')
  })
})
