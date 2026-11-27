/**
 * 应用版本与仓库信息。
 *
 * 数据来自 `vite.config.js` 的 `define`，是**构建期注入**的常量：
 * - `__APP_VERSION__`：package.json 的版本号
 * - `__APP_SHA__`：提交短哈希（每次提交都变，是判断新旧的可靠依据）
 * - `__APP_BUILT_AT__`：构建时间（ISO 字符串）
 * - `__APP_REPO__`：GitHub 仓库地址
 *
 * ## 为什么需要这套东西
 *
 * 用户反馈「手机上的题库停在 2892 题，怎么更新都不变」。
 * 排查时发现**根本无从判断用户手机上是哪个版本** ——
 * 版本号是硬编码的字符串，既不随代码变化，也和 package.json 对不上。
 * 没有版本标识，就无法回答「你是旧的还是我是旧的」。
 *
 * 现在每次构建都会注入真实值，用户可以在「我的 → 设置 → 关于」里看到：
 *
 * ```
 * 版本    v0.1.0 · 9904dbd
 * 构建时间 2026-11-27 12:30
 * ```
 *
 * 与 GitHub 上最新提交对比，立刻能判断是不是旧版本。
 *
 * ## `9904dbd` 是什么
 *
 * 它是 **Git 提交哈希（commit SHA）的前 7 位**，由 `git rev-parse --short HEAD`
 * 取得。完整的 40 位才是 SHA-1 全值，7 位是 Git 的缩写形式 ——
 * `git` 与 GitHub 都支持用缩写反查：
 *
 * - `https://github.com/<owner>/<repo>/commit/9904dbd`
 * - `git show 9904dbd`
 *
 * Git 内部用前缀匹配展开，并会检测冲突（撞了会要求输更长）。7 位约 2680 万组合，
 * 个人项目实际不会撞。
 *
 * **为什么它能用来判断版本新旧**：SHA 由「提交内容 + 父提交 + 作者 + 时间」算出，
 * 同一提交在任何机器上结果一致。所以「页面上显示的 sha」= 「产生这份产物的那次提交」，
 * 拿它和 `main` 的最新提交比对，就能区分「用户是旧版」还是「版本没问题」。
 *
 * ⚠️ **不用 `git describe` 的原因**：CI 的 `actions/checkout@v5` 默认
 * `fetch-depth: 1`（浅克隆），`git describe` 需要 tag 历史会失败；
 * 而 `git rev-parse --short HEAD` 只读 HEAD，浅克隆下依然可用。
 *
 * ⚠️ **本地有未提交改动时 sha 不准确** —— 它指向上一个提交，但代码已含新内容。
 * CI 构建天然没有这个问题。
 *
 * ## 开发环境兼容
 *
 * `define` 的常量在 `npm run dev` 下同样生效（Vite 会注入），
 * 但为了在 **单元测试** 环境（vitest 不走 vite define）不报错，
 * 这里用 `typeof` 做存在性判断再降级。
 */

/**
 * 构建期常量在单元测试环境（vitest 不走 vite 的 define）不存在，
 * 直接引用会抛 ReferenceError。用 `typeof` 判断是标准做法 ——
 * 它对未声明的标识符是安全的（不像直接读取那样报错）。
 */
const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'
const SHA = typeof __APP_SHA__ !== 'undefined' ? __APP_SHA__ : 'dev'
const BUILT_AT = typeof __APP_BUILT_AT__ !== 'undefined' ? __APP_BUILT_AT__ : ''
const REPO = typeof __APP_REPO__ !== 'undefined' ? __APP_REPO__ : 'https://github.com/fanggafa/OpsInterview-Bank-H5'

export const APP_VERSION = VERSION
export const APP_SHA = SHA
export const APP_BUILT_AT = BUILT_AT
export const APP_REPO = REPO

/** 仓库的各个入口地址（设置页直接跳转） */
export const REPO_LINKS = {
  home: APP_REPO,
  issues: `${APP_REPO}/issues`,
  star: APP_REPO,
}

/**
 * 版本短标识，用于「关于」里一行展示。
 *
 * 形如 `v0.1.0 · 1a910fb`；拿不到 sha 时退化为纯版本号。
 */
export const VERSION_LABEL =
  APP_SHA && APP_SHA !== 'unknown' ? `v${APP_VERSION} · ${APP_SHA}` : `v${APP_VERSION}`

/**
 * 构建时间的人性化展示（本地时区，`YYYY-MM-DD HH:mm`）。
 *
 * 用本地时区是因为用户看的是「我手机上这是什么时候的版本」，
 * UTC 会让人误解（比如显示 04:30 实际是中午 12:30）。
 */
export function formatBuiltAt(iso = APP_BUILT_AT) {
  if (!iso) return '未知'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '未知'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
