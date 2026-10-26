/**
 * 分页纯函数集合。
 * 列表页统一用「每页 N 条 + 上下页」而不是无限滚动：
 * 手机上一屏约 5 张卡片，超过 20 条就没有边界感，也不方便回到中间位置。
 */
import { PAGE_SIZE } from '@/utils/constants'

/**
 * 计算总页数。空列表也算 1 页（用于展示空状态）。
 * @param {number} total 总条数
 * @param {number} [pageSize]
 */
export function pageCount(total, pageSize = PAGE_SIZE) {
  if (!Number.isFinite(total) || total <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

/**
 * 把页码收敛到合法区间（1-based）。
 * 非法值（NaN、小数、越界）一律回退到第 1 页或末页。
 * @param {*} page
 * @param {number} total
 * @param {number} [pageSize]
 */
export function clampPage(page, total, pageSize = PAGE_SIZE) {
  const max = pageCount(total, pageSize)
  const n = Number(page)
  if (!Number.isFinite(n)) return 1
  const int = Math.floor(n)
  if (int < 1) return 1
  if (int > max) return max
  return int
}

/**
 * 取当前页的切片。
 * @param {Array} list
 * @param {number} page 1-based
 * @param {number} [pageSize]
 */
export function paginate(list, page, pageSize = PAGE_SIZE) {
  const arr = Array.isArray(list) ? list : []
  const current = clampPage(page, arr.length, pageSize)
  const start = (current - 1) * pageSize
  return arr.slice(start, start + pageSize)
}

/**
 * 分页元信息，供 UI 展示「第 x / y 页，共 n 条」与控制按钮禁用态。
 * @param {number} total
 * @param {number} page
 * @param {number} [pageSize]
 */
export function pageMeta(total, page, pageSize = PAGE_SIZE) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0
  const max = pageCount(safeTotal, pageSize)
  const current = clampPage(page, safeTotal, pageSize)
  const from = safeTotal === 0 ? 0 : (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, safeTotal)

  return {
    page: current,
    pageCount: max,
    total: safeTotal,
    pageSize,
    from,
    to,
    hasPrev: current > 1,
    hasNext: current < max,
    /** 只有超过一页时才需要显示分页控件 */
    visible: safeTotal > pageSize,
  }
}

/**
 * 从 URL query 解析页码（1-based）。
 * 只做基础校验，真正的越界收敛交给 pageMeta（那里知道总条数）。
 * @param {Object} query
 */
export function parsePage(query = {}) {
  const raw = Number(query?.page)
  if (!Number.isFinite(raw)) return 1
  const int = Math.floor(raw)
  return int >= 1 ? int : 1
}
