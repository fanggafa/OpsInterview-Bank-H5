/**
 * 早期题目编号迁移（1–119 → 各分类编号段）的本地记录兼容。
 *
 * 背景：学习记录按题目 id 存在 localStorage（`oi_records` 按 id 为键、
 * `oi_favorites` 是 id 数组）。早期 119 道题从 1–119 迁到各自分类编号段后，
 * 老用户在这些题上的进度/收藏会变成「未知 id」——虽然不会被删除，
 * 但会退出统计与展示，等于「记录丢了」。
 *
 * 方案：应用启动时把旧 id 按映射表改写为新 id，并打标记避免重复执行。
 * 只改写「映射表里存在」的 id，其余原样保留。
 */
import { STORAGE_KEYS } from './constants.js'
import { readJSON, writeJSON } from './storage.js'

/** 迁移标记：置位后不再重复改写 */
const MIGRATION_FLAG = 'oi_id_migrated_v1'

/**
 * 旧 id → 新 id。与题库迁移脚本（scripts/apply-early-id-migration.mjs）一致。
 * 这里内联成常量而不是读 JSON，是为了不把构建产物绑到 scripts 目录。
 */
const ID_MAP = {
  1: 4115, 2: 4116, 3: 4117, 4: 4118, 5: 4119, 6: 4120, 7: 4121, 8: 4122,
  9: 4315, 10: 4316, 11: 4317, 12: 4318, 13: 4319, 14: 4320, 15: 4321, 16: 4515,
  17: 4516, 18: 4517, 19: 4518, 20: 4519, 21: 4520, 22: 4521, 23: 4522, 24: 3715,
  25: 3716, 26: 3717, 27: 3718, 28: 3719, 29: 3720, 30: 3721, 31: 3722, 32: 3915,
  33: 3916, 34: 3917, 35: 3918, 36: 3919, 37: 3920, 38: 3921, 39: 3922, 40: 4715,
  41: 4716, 42: 4717, 43: 4718, 44: 4719, 45: 4720, 46: 4721, 47: 4722, 48: 4915,
  49: 4916, 50: 4917, 51: 4918, 52: 4919, 53: 4920, 54: 5115, 55: 5116, 56: 5117,
  57: 5118, 58: 5119, 59: 5120, 60: 5121, 61: 5315, 62: 5316, 63: 5317, 64: 5318,
  65: 5319, 66: 5320, 67: 5540, 68: 5541, 69: 5542, 70: 5543, 71: 5544, 72: 5545,
  73: 4123, 74: 4124, 75: 4125, 76: 4126, 77: 4322, 78: 4323, 79: 4324, 80: 4523,
  81: 4524, 82: 4525, 83: 4526, 84: 3723, 85: 3724, 86: 3725, 87: 3923, 88: 3924,
  89: 3925, 90: 4723, 91: 4724, 92: 4725, 93: 4921, 94: 5122, 95: 5123, 96: 5321,
  97: 4325, 98: 4326, 99: 4327, 100: 4328, 101: 4329, 102: 4527, 103: 4528, 104: 3726,
  105: 3727, 106: 3926, 107: 4922, 108: 4923, 109: 4924, 110: 5124, 111: 5125, 112: 5546,
  113: 5547, 114: 5548, 115: 5549, 116: 5550, 117: 5551, 118: 4925, 119: 5126,
}

/**
 * 执行一次 id 迁移。幂等：已迁移过则直接返回。
 * @returns {{migrated:boolean, records:number, favorites:number}}
 */
export function migrateEarlyIds() {
  const done = readJSON(MIGRATION_FLAG, false)
  if (done) return { migrated: false, records: 0, favorites: 0 }

  // 1) 进度记录：以旧 id 为键的对象 → 改键
  const records = readJSON(STORAGE_KEYS.RECORDS, {})
  let recordCount = 0
  if (records && typeof records === 'object' && !Array.isArray(records)) {
    const next = {}
    for (const [key, value] of Object.entries(records)) {
      const mapped = ID_MAP[key]
      if (mapped !== undefined && next[mapped] === undefined) {
        next[mapped] = value
        recordCount += 1
      } else if (mapped === undefined) {
        next[key] = value
      }
    }
    if (recordCount > 0) writeJSON(STORAGE_KEYS.RECORDS, next)
  }

  // 2) 收藏：id 数组 → 逐项映射并去重
  const favorites = readJSON(STORAGE_KEYS.FAVORITES, [])
  let favCount = 0
  if (Array.isArray(favorites)) {
    const mappedArr = favorites.map((id) => {
      const mapped = ID_MAP[Number(id)]
      if (mapped !== undefined) {
        favCount += 1
        return mapped
      }
      return id
    })
    if (favCount > 0) {
      writeJSON(STORAGE_KEYS.FAVORITES, Array.from(new Set(mappedArr)))
    }
  }

  writeJSON(MIGRATION_FLAG, true)
  return { migrated: true, records: recordCount, favorites: favCount }
}
