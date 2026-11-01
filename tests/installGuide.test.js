import { describe, expect, it } from 'vitest'
import { detectPlatform, installGuide, installSteps, isInstalled } from '@/utils/installGuide'

describe('detectPlatform · UA 识别', () => {
  it('识别 iPhone / iPad / iPod 为 ios', () => {
    for (const ua of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)',
    ]) {
      expect(detectPlatform(ua)).toBe('ios')
    }
  })

  it('iPadOS 13+ 伪装成 Macintosh 时靠触摸点识别为 ios', () => {
    // 这是真实坑：iPadOS 的 UA 里只有 Macintosh，没有 iPad
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
    expect(detectPlatform(ua, 5)).toBe('ios')
    // 同一 UA 但无触摸点 → 真的是 Mac 桌面
    expect(detectPlatform(ua, 0)).toBe('desktop')
  })

  it('识别 Android 为 android', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; 23127PN0CC)')).toBe('android')
  })

  it('识别桌面系统为 desktop', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop')
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe('desktop')
  })

  it('空 UA 或无法识别时回退 unknown', () => {
    expect(detectPlatform('')).toBe('unknown')
    expect(detectPlatform(undefined)).toBe('unknown')
    expect(detectPlatform('curl/8.0')).toBe('unknown')
  })
})

describe('isInstalled · 独立形态判定', () => {
  it('display-mode: standalone 或 navigator.standalone 任一成立即视为已装', () => {
    expect(isInstalled(true, false)).toBe(true)
    expect(isInstalled(false, true)).toBe(true)
    expect(isInstalled(true, true)).toBe(true)
    expect(isInstalled(false, false)).toBe(false)
  })
})

describe('installSteps · 各平台步骤', () => {
  it('iOS 明确要求 Safari（Chrome / 微信内不行）', () => {
    const g = installSteps('ios')
    expect(g.title).toBe('添加到主屏幕')
    expect(g.warning).toContain('Safari')
    expect(g.steps.some((s) => s.includes('分享'))).toBe(true)
  })

  it('安卓优先推荐自带浏览器，并解释 Chrome 为何可能失败', () => {
    const g = installSteps('android')
    expect(g.warning).toContain('自带浏览器')
    expect(g.warning).toContain('Chrome')
    expect(g.steps[0]).toContain('自带浏览器')
  })

  it('安卓给出失败时的备选说明（.mht / 保存网页）', () => {
    const g = installSteps('android')
    // 这是真实踩坑：国行小米上 Chrome 的安装会退化成「保存网页」
    expect(g.fallback).toContain('.mht')
    expect(g.fallback).toContain('保存网页')
  })

  it('桌面给出 Chrome / Edge / Safari 的入口', () => {
    const g = installSteps('desktop')
    expect(g.steps.join(' ')).toContain('Chrome')
    expect(g.note).toContain('离线')
  })

  it('未知平台给通用兜底步骤，不谎报细节', () => {
    const g = installSteps('unknown')
    expect(g.title).toBe('添加到桌面')
    expect(g.steps.length).toBeGreaterThan(0)
  })

  it('每个平台都必须有标题与非空步骤', () => {
    for (const p of ['ios', 'android', 'desktop', 'unknown']) {
      const g = installSteps(p)
      expect(g.title.length).toBeGreaterThan(0)
      expect(g.steps.length).toBeGreaterThan(0)
    }
  })
})

describe('installGuide · 组合入口', () => {
  it('已装好时 installed 为 true（页面据此只显示「已装好」）', () => {
    const g = installGuide({ ua: 'Android', standalone: true })
    expect(g.installed).toBe(true)
    expect(g.platform).toBe('android')
  })

  it('未装时给出对应平台步骤', () => {
    const g = installGuide({ ua: 'iPhone', standalone: false })
    expect(g.installed).toBe(false)
    expect(g.platform).toBe('ios')
    expect(g.title).toBe('添加到主屏幕')
  })
})
