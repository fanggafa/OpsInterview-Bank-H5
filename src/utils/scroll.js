/**
 * 滚动相关的小工具（统一处理兼容与测试环境）。
 */

/**
 * 滚动到页面顶部。
 * jsdom 未实现 window.scrollTo，直接调用会抛「Not implemented」；
 * 这里做存在性判断，测试环境静默跳过。
 */
export function scrollToTop(smooth = false) {
  if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') return

  // jsdom 未实现 scrollTo：调用只会打印「Not implemented」噪音且不抛错，
  // 所以先探测再调用，避免污染测试输出。
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) return

  try {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
  } catch (e) {
    /* 极老浏览器：忽略即可，不影响功能 */
  }
}
