import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { usePwaUpdate } from '@/composables/usePwaUpdate'
import { mount } from '@vue/test-utils'
import PwaUpdateDialog from '@/components/PwaUpdateDialog.vue'

/**
 * PWA 更新提示。
 *
 * 测试环境没有 `virtual:pwa-register`（构建期才生成的虚拟模块），
 * 也通常没有 navigator.serviceWorker —— 所以重点验证：
 * 1. 在没有 SW 支持时**不报错、不显示提示**（应用照常可用）
 * 2. 提示条的状态联动正确（needRefresh / dismissed）
 * 3. 「稍后」只影响本次会话
 */

function resetShared() {
  // composable 是模块级单例，测试之间要重置
  return import('@/composables/usePwaUpdate').then((m) => {
    // 没有暴露重置接口，这里通过重新导入模块来隔离（vi.resetModules 由用例负责）
    return m
  })
}

beforeEach(() => {
  vi.resetModules()
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePwaUpdate · 无 Service Worker 环境', () => {
  it('register 不抛错（浏览器不支持 SW 时静默跳过）', async () => {
    const { usePwaUpdate } = await import('@/composables/usePwaUpdate')
    const pwa = usePwaUpdate()
    await expect(pwa.register()).resolves.toBeUndefined()
  })

  it('初始状态：不需要刷新、未离线就绪、未忽略', async () => {
    const { usePwaUpdate } = await import('@/composables/usePwaUpdate')
    const pwa = usePwaUpdate()
    expect(pwa.needRefresh.value).toBe(false)
    expect(pwa.offlineReady.value).toBe(false)
    expect(pwa.dismissed.value).toBe(false)
    expect(pwa.promptVisible()).toBe(false)
  })

  it('applyUpdate 在没有更新器时兜底重载页面', async () => {
    const reload = vi.fn()
    const original = globalThis.location
    // 用 stub 避免 jsdom 的 location.reload 报「未实现」
    vi.stubGlobal('location', { ...original, reload })

    const { usePwaUpdate } = await import('@/composables/usePwaUpdate')
    const pwa = usePwaUpdate()
    pwa.applyUpdate()
    expect(reload).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })
})

describe('PwaUpdateDialog · 弹窗联动', () => {
  it('默认不显示', async () => {
    const pwa = usePwaUpdate()
    pwa.needRefresh.value = false
    pwa.dismissed.value = false

    const wrapper = mount(PwaUpdateDialog)
    expect(wrapper.find('.pwa-dialog').exists()).toBe(false)
  })

  it('needRefresh 为真时显示提示与两个按钮', async () => {
    const pwa = usePwaUpdate()
    pwa.needRefresh.value = true
    pwa.dismissed.value = false

    const wrapper = mount(PwaUpdateDialog)
    expect(wrapper.find('.pwa-dialog').exists()).toBe(true)
    expect(wrapper.text()).toContain('有新版本可用')
    expect(wrapper.text()).toContain('稍后')
    expect(wrapper.text()).toContain('立即更新')
  })

  it('点「稍后」后隐藏（本次会话不再提示）', async () => {
    const pwa = usePwaUpdate()
    pwa.needRefresh.value = true
    pwa.dismissed.value = false

    const wrapper = mount(PwaUpdateDialog)
    const ghost = wrapper.findAll('.pwa-dialog__btn').find((b) => b.text().includes('稍后'))
    await ghost.trigger('click')
    await wrapper.vm.$nextTick()

    expect(pwa.dismissed.value).toBe(true)
    expect(wrapper.find('.pwa-dialog').exists()).toBe(false)
  })

  it('是页内弹窗，不是 window.confirm（项目约定）', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/components/PwaUpdateDialog.vue', 'utf8')
    expect(src).not.toContain('window.confirm')
    expect(src).toContain('role="dialog"')
    // 居中弹窗：遮罩铺满全屏 + flex 居中，不再是贴底的提示条
    expect(src).toMatch(/position:\s*fixed/)
    expect(src).toMatch(/inset:\s*0/)
    expect(src).toMatch(/align-items:\s*center/)
    expect(src).toMatch(/justify-content:\s*center/)
    // 旧版贴底定位已移除
    expect(src).not.toMatch(/bottom:\s*calc\(env\(safe-area-inset-bottom/)
  })
})
