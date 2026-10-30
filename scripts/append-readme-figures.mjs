/**
 * 在 README 的插图清单末尾追加本批新增的 19 张图。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'README.md'
let s = readFileSync(F, 'utf8')

const ROWS = [
  ['wait-not-compute-tree', '「资源不高却超时」的五个等待点排查树', '题 67'],
  ['half-users-dimensions', '「一半用户受影响」的五维分流', '题 5401'],
  ['dual-active-phases', '单主库做双活的三阶段演进', '题 5417'],
  ['hourly-spike-triage', '整点前后变差的排查与整点任务清单', '题 5422'],
  ['intermittent-issue-strategy', '偶发问题：定义→观测→抓现场→固化', '题 5439'],
  ['redis-timeout-paths', 'Redis 超时的五个方向分流', '题 5416'],
  ['midnight-cpu-surge', '凌晨多机 CPU 飙高：止血→us/sy/wa 分流→复盘', '题 113'],
  ['replication-lag-triage', '主从延迟：读回主库止血 + 五类原因', '题 5402'],
  ['fixed-time-slowness', '固定时间变慢：时间轴对齐找撞车', '题 5405'],
  ['multi-region-layers', '异地多活四层与「单元化」消除写冲突', '题 5404'],
  ['config-drift-decision', '一台配置不一致：查原因→评估→三种决策', '题 5430'],
  ['code-vs-env-bisect', '代码还是环境问题：最小差异实验二分', '题 5433'],
  ['memory-growth-decision', '内存上涨：泄漏 vs 缓存，堆内 vs 堆外', '题 71'],
  ['restart-triggers', '准时重启：进程 / Pod / 整机三路分流', '题 5412'],
  ['disk-full-safe-triage', '磁盘将满：按安全等级从高到低处理', '题 5427'],
  ['microservice-observability', '微服务排查三件套与 trace_id 断点', '题 5437'],
  ['alert-fatigue-triage', '告警疲劳：量化后四类分别处理', '题 5418'],
  ['monitor-blind-spots', '指标正常但用户不满的四个盲区', '题 5442'],
  ['env-parity-gap', '测试与生产的六类差异与四项治理', '题 5426'],
]

const anchor = '| `alert-funnel`'
const idx = s.indexOf(anchor)
if (idx === -1) {
  console.log('✗ 未找到 alert-funnel 行，清单结构可能变了')
  process.exit(1)
}

// 找到该行的结尾（下一个换行）
let lineEnd = s.indexOf('\n', idx)
if (lineEnd === -1) lineEnd = s.length

const rows = ROWS.map(([id, desc, where]) => `| \`${id}\` | ${desc} | ${where} |`).join('\n')
s = `${s.slice(0, lineEnd)}\n${rows}${s.slice(lineEnd)}`

writeFileSync(F, s, 'utf8')
console.log(`已追加 ${ROWS.length} 行插图说明`)
