/**
 * 全局常量：枚举值与文案的唯一来源。
 * 组件内禁止硬编码中文字面量做比较，一律引用此文件。
 */

/** 分类枚举（顺序即 UI 展示顺序） */
export const CATEGORIES = [
  'Linux基础',
  'Shell脚本',
  '网络基础',
  'MySQL',
  'Redis',
  'Docker/K8s',
  'CI/CD',
  '监控告警',
  '安全',
  '综合场景题',
]

/** 各分类一句话复习建议，用于模拟面试评估页「薄弱分类」文案 */
export const CATEGORY_ADVICE = {
  Linux基础:
    '重点补 CPU/内存/IO 排查链路：top → vmstat → iostat → pidstat，并熟记 inode、软硬链接、进程与线程区别。',
  Shell脚本:
    '把 set -euo pipefail、引号与变量展开、$? 与管道退出码、find/xargs 组合过一遍，能手写日志清理与批量巡检脚本。',
  网络基础:
    '吃透 TCP 三次握手/四次挥手、TIME_WAIT、tcpdump 抓包定位思路，以及 DNS 解析链路与常见连通性排查顺序。',
  MySQL:
    '重点补索引结构与最左前缀、EXPLAIN 各列含义、慢查询定位、事务隔离级别与锁、主从延迟排查。',
  Redis:
    '熟记五大数据结构与底层编码、过期与淘汰策略、缓存穿透/击穿/雪崩的应对、持久化 RDB/AOF 取舍与主从哨兵。',
  'Docker/K8s':
    '重点补镜像分层与构建优化、Pod 生命周期与探针、资源 requests/limits、Service/Ingress 转发、Pod 异常排查 kubectl describe/logs/events。',
  'CI/CD':
    '理清流水线阶段划分、制品与版本策略、灰度与回滚方案、构建缓存与失败重试，能讲清一次发布全链路。',
  监控告警:
    '重点补黄金三指标（延迟/流量/错误/饱和度）、Prometheus 指标类型与 PromQL 常用函数、告警收敛与值班响应流程。',
  安全:
    '补常见攻击面（SSH 爆破、越权、注入、反弹 shell）、最小权限与基线加固、证书与密钥管理、应急响应取证顺序。',
  综合场景题:
    '按「先止损 → 再定位 → 后复盘」的顺序组织回答，量化影响面与耗时，并给出可落地的预防措施。',
}

/** 难度枚举 + 颜色（CSS 变量在样式里，这里保留语义供 JS 判断） */
export const DIFFICULTIES = ['简单', '中等', '困难']

/** 题型枚举（v1.3） */
export const QUESTION_TYPES = ['short', 'single', 'multiple']

/** 题型展示标签 */
export const TYPE_LABEL = {
  short: '简答',
  single: '单选',
  multiple: '多选',
}

/** 题型对应的判定结果文案 */
export const CHOICE_RESULT_LABEL = {
  correct: '答对',
  wrong: '答错',
}

export const DIFFICULTY_COLOR = {
  简单: '#52C41A',
  中等: '#FAAD14',
  困难: '#F5222D',
}

/** 频率枚举 */
export const FREQUENCIES = ['高频', '中频', '低频']

/** 自评状态 */
export const STATUS = {
  KNOW: 'know',
  UNKNOWN: 'unknown',
}

/** 刷题模式 */
export const PRACTICE_MODES = ['sequential', 'random', 'wrong']

/** 主题枚举 */
export const THEMES = ['light', 'dark', 'system']

export const DEFAULT_THEME = 'system'

/** localStorage key（统一 oi_ 前缀） */
export const STORAGE_KEYS = {
  RECORDS: 'oi_records',
  FAVORITES: 'oi_favorites',
  SETTINGS: 'oi_settings',
  PROGRESS: 'oi_progress',
}

/** 底部 TabBar（4 项，不含首页） */
export const TAB_ITEMS = [
  { path: '/bank', label: '题库', icon: 'bank' },
  { path: '/practice', label: '刷题', icon: 'practice' },
  { path: '/stats', label: '统计', icon: 'stats' },
  { path: '/me', label: '我的', icon: 'me' },
]

/** 模拟面试可选题数 */
export const INTERVIEW_SIZES = [5, 10, 15, 20]
export const DEFAULT_INTERVIEW_SIZE = 10

/** 搜索防抖毫秒 */
export const SEARCH_DEBOUNCE_MS = 300

/** 题干摘要截断长度 */
export const SUMMARY_LENGTH = 50

/** 列表每页条数（手机一屏约 5 张卡片，3 屏左右刚好，翻页不费力） */
export const PAGE_SIZE = 15

/** 分页快捷跳页的候选步长（「上一页/下一页」之外的首页末页） */
export const PAGE_JUMP_EDGE = true
