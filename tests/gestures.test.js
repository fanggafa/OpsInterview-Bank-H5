import { describe, expect, it } from 'vitest'
import {
  AXIS_RATIO,
  classifyGesture,
  DISTANCE_THRESHOLD,
  MIN_DISTANCE,
  VELOCITY_THRESHOLD,
} from '@/utils/gestures'

describe('classifyGesture', () => {
  it('横向滑动超过阈值为 left / right', () => {
    expect(classifyGesture({ dx: -100, dy: 5, duration: 300 })).toBe('left')
    expect(classifyGesture({ dx: 100, dy: 5, duration: 300 })).toBe('right')
  })

  it('位移小于最小距离不算手势', () => {
    expect(classifyGesture({ dx: -MIN_DISTANCE, dy: 0, duration: 100 })).toBeNull()
  })

  it('纵向为主时轴锁定为纵向，不算横向手势', () => {
    // dx 大于最小距离，但 dy 占优
    expect(classifyGesture({ dx: -20, dy: 40, duration: 200 })).toBeNull()
  })

  it('边界：dx 恰为 dy 的 AXIS_RATIO 倍时应判为纵向', () => {
    const dy = 20
    const dx = -(dy * AXIS_RATIO)
    expect(classifyGesture({ dx, dy, duration: 200 })).toBeNull()
  })

  it('距离不足但速度够快也算滑动', () => {
    const dx = -(DISTANCE_THRESHOLD - 20) // 40px
    const duration = dx / VELOCITY_THRESHOLD / 2 // 速度约为阈值 2 倍
    expect(classifyGesture({ dx, dy: 2, duration })).toBe('left')
  })

  it('距离不足且速度不足则为回弹', () => {
    expect(classifyGesture({ dx: -30, dy: 2, duration: 400 })).toBeNull()
  })

  it('非法入参返回 null', () => {
    expect(classifyGesture({ dx: undefined, dy: 0, duration: 100 })).toBeNull()
    expect(classifyGesture({})).toBeNull()
  })

  it('duration 为 0 时不产生除零异常', () => {
    expect(classifyGesture({ dx: -100, dy: 0, duration: 0 })).toBe('left')
  })
})
