import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { DEFAULT_THEME, STORAGE_KEYS, THEMES } from '@/utils/constants'
import { readJSON, writeJSON } from '@/utils/storage'

/**
 * 主题设置：light | dark | system（默认 system）
 * 通过 <html data-theme> + CSS 变量驱动，切换时同步 theme-color。
 */

const META_THEME_COLOR = { light: '#4F7CFF', dark: '#121212' }

const isValidSettings = (v) =>
  v !== null && typeof v === 'object' && THEMES.includes(v.theme)

export const useSettingsStore = defineStore('settings', () => {
  const settings = readJSON(STORAGE_KEYS.SETTINGS, { theme: DEFAULT_THEME }, isValidSettings)
  const theme = ref(THEMES.includes(settings?.theme) ? settings.theme : DEFAULT_THEME)

  /** 系统是否偏好深色 */
  const systemDark = ref(getSystemDark())

  /** 最终生效的主题（解析 system） */
  const resolvedTheme = computed(() => {
    if (theme.value === 'system') return systemDark.value ? 'dark' : 'light'
    return theme.value
  })

  const isDark = computed(() => resolvedTheme.value === 'dark')

  function getSystemDark() {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function applyTheme() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.dataset.theme = resolvedTheme.value
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', META_THEME_COLOR[resolvedTheme.value])
  }

  function setTheme(next) {
    if (!THEMES.includes(next)) return
    theme.value = next
    writeJSON(STORAGE_KEYS.SETTINGS, { theme: next })
  }

  /** 在 system 三态间循环：light → dark → system */
  function cycleTheme() {
    const idx = THEMES.indexOf(theme.value)
    setTheme(THEMES[(idx + 1) % THEMES.length])
  }

  /** 初始化：应用主题并监听系统主题变化（返回解绑函数供测试） */
  function init() {
    applyTheme()
    if (typeof window === 'undefined' || !window.matchMedia) return () => {}
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      systemDark.value = e.matches
    }
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if (mql.addListener) mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else if (mql.removeListener) mql.removeListener(onChange)
    }
  }

  watch(resolvedTheme, applyTheme)

  return {
    theme,
    resolvedTheme,
    isDark,
    systemDark,
    setTheme,
    cycleTheme,
    init,
  }
})
