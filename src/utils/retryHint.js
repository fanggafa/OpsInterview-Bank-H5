/**
 * 错误态文案的统一拼装。
 *
 * 为什么抽出来：`BankView` / `FavoritesView` / `WrongView` / `HomeView` /
 * `QuestionView` / `PracticeView` 都有「加载失败 + 重试」的错误态。
 * 退避冷却、不可重试提示这类文案若各写一遍，很容易改漏（历史上已经因为
 * 「同一逻辑散在多个工作流」出过事）。
 *
 * @param {{ error: string, inCooldown: boolean, retryAfterMs: number, canRetry: boolean }} bank
 *   只需传这几个字段，不依赖 store 实例（便于测试）
 * @returns {string} 给用户看的一行说明；无错误时返回空串
 */
export function buildRetryHint(bank) {
  const base = bank && bank.error ? bank.error : ''
  if (!base) return ''

  if (bank.inCooldown) {
    const sec = Math.max(1, Math.ceil((bank.retryAfterMs || 0) / 1000))
    return `${base}（重试过于频繁，请 ${sec} 秒后再试）`
  }
  if (bank.canRetry === false) {
    return `${base}（数据异常，重试无法解决，请运行 npm run split:data 后重新构建）`
  }
  return base
}
