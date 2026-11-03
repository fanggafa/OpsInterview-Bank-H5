import { describe, expect, it } from 'vitest'
import {
  detectPlatform,
  installGuide,
  installGuideAll,
  installSteps,
  isInstalled,
  GUIDE_ORDER,
  GUIDE_LABELS,
} from '@/utils/installGuide'

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

describe('installGuideAll · 全平台一次列出', () => {
  /**
   * 2026-11 改版：展开后列出**所有端**，而不只是当前平台。
   * 目的：在电脑网页上打开也能看到「手机上可以装成 App」，知道可以换到手机用。
   */
  it('无论在哪一端，都返回 iOS / 安卓 / 电脑 三组', () => {
    for (const ua of ['iPhone', 'Android', 'Windows NT 10.0']) {
      const g = installGuideAll({ ua })
      expect(g.groups.map((x) => x.platform)).toEqual(GUIDE_ORDER)
      expect(g.groups.length).toBe(3)
    }
  })

  it('手机端排在电脑前面（本应用主要给手机上用）', () => {
    expect(GUIDE_ORDER).toEqual(['ios', 'android', 'desktop'])
  })

  it('每组都有 label、标题与非空步骤', () => {
    const g = installGuideAll({ ua: 'Windows' })
    for (const grp of g.groups) {
      expect(grp.label.length).toBeGreaterThan(0)
      expect(grp.title.length).toBeGreaterThan(0)
      expect(grp.steps.length).toBeGreaterThan(0)
    }
  })

  it('标出当前设备，且只标一个', () => {
    const g = installGuideAll({ ua: 'iPhone' })
    expect(g.current).toBe('ios')
    const marked = g.groups.filter((x) => x.platform === g.current)
    expect(marked.length).toBe(1)
  })

  it('在电脑上打开时，仍然能看到 iOS 与安卓的步骤', () => {
    /**
     * 这是本次需求的核心：电脑端用户也能看到移动端安装方式。
     */
    const g = installGuideAll({ ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
    expect(g.current).toBe('desktop')

    const ios = g.groups.find((x) => x.platform === 'ios')
    const android = g.groups.find((x) => x.platform === 'android')
    expect(ios.steps.some((s) => s.includes('Safari'))).toBe(true)
    expect(android.steps.some((s) => s.includes('自带浏览器'))).toBe(true)
  })

  it('已装好时 installed 为 true，但三组说明仍然齐全', () => {
    const g = installGuideAll({ ua: 'Android', standalone: true })
    expect(g.installed).toBe(true)
    expect(g.groups.length).toBe(3)
  })

  it('平台标签是人能读的名字，不是内部 key', () => {
    for (const p of GUIDE_ORDER) {
      expect(GUIDE_LABELS[p]).toBeTruthy()
      expect(GUIDE_LABELS[p]).not.toBe(p)
    }
    expect(GUIDE_LABELS.desktop).toContain('电脑')
  })
})
