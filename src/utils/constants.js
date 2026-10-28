/**
 * 全局常量：枚举值与文案的唯一来源。
 * 组件内禁止硬编码中文字面量做比较，一律引用此文件。
 */

/** 分类枚举（顺序即 UI 展示顺序） */
export const CATEGORIES = [
  'Linux基础',
  'Shell脚本',
  '网络基础',
  'DNS',
  'iptables/firewalld',
  'Nginx',
  'LVS/HAProxy',
  'Tomcat/JVM',
  'MySQL',
  'Redis',
  'MongoDB',
  '消息队列',
  '容器与K8s',
  '存储与备份',
  '虚拟化',
  'CI/CD',
  'Git/GitLab',
  '监控告警',
  '日志与ELK',
  '自动化与配置管理',
  '安全与跳板机',
  '云与高可用',
  '综合场景题',
]

/** 各分类一句话复习建议，用于「我的」页「薄弱分类」文案 */
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
  DNS:
    '记住解析链路（浏览器缓存 → hosts → 递归解析器 → 根/顶级/权威），会用 dig +trace 逐跳排查，理解 TTL 与 ndots 的影响。',
  'iptables/firewalld':
    '先分清五链四表与数据包流向，再记常用规则写法（-A/-I、-s、-p、--dport、-j）；conntrack 表满与默认策略是高频坑。',
  Nginx:
    '重点补 location 匹配优先级、proxy_pass 路径拼接规则、upstream 健康检查与负载均衡算法，以及 502/504 的区分排查。',
  'LVS/HAProxy':
    '记牢 LVS 四种模式的差别（NAT/DR/TUN/FULLNAT）与 DR 模式为什么改 MAC 不改 IP；HAProxy 看前端/后端与 ACL。',
  'Tomcat/JVM':
    '补 JVM 内存分区与 GC 基础、堆栈导出的排查流程（jstack/jmap/MAT）、连接器与线程池配置、内存泄漏定位。',
  MongoDB:
    '理解文档模型与内嵌/引用取舍、索引类型与执行计划 explain、副本集选举与读写关注（writeConcern/readConcern）。',
  消息队列:
    '分清 Kafka 的分区/副本/消费者组与 offset 语义，掌握积压排查、顺序性与幂等、消息丢失的三种场景。',
  '容器与K8s':
    '重点补镜像分层与构建优化、Pod 生命周期与探针、资源 requests/limits、Service/Ingress 转发、Pod 异常排查 kubectl describe/logs/events。',
  '存储与备份':
    '区分块/文件/对象存储的适用场景，掌握 rsync 增量同步与 --delete 风险、备份的三二一原则与恢复演练。',
  虚拟化:
    '了解 KVM 的 QEMU 与内核模块分工、CPU/内存超分的影响、VMware 集群与 vMotion，以及「快照不等于备份」。',
  'CI/CD':
    '理清流水线阶段划分、制品与版本策略、灰度与回滚方案、构建缓存与失败重试，能讲清一次发布全链路。',
  'Git/GitLab':
    '掌握分支策略、merge 与 rebase 的差异、冲突解决、GitLab CI 的 stages/job/runner，以及仓库备份与迁移。',
  监控告警:
    '重点补黄金三指标（延迟/流量/错误/饱和度）、Prometheus 指标类型与 PromQL 常用函数、告警收敛与值班响应流程。',
  '日志与ELK':
    '理清采集（Filebeat）→ 缓冲（Kafka）→ 处理（Logstash）→ 存储检索（ES）的链路，理解 ES 分片/副本与索引生命周期。',
  自动化与配置管理:
    '掌握 Ansible 的 inventory/模块/幂等性、playbook 与 roles 组织，理解为什么幂等是自动化脚本的第一要求。',
  '安全与跳板机':
    '补常见攻击面（SSH 爆破、越权、注入、反弹 shell）、最小权限与基线加固、跳板机审计，以及应急响应取证顺序。',
  '云与高可用':
    '理解 SLB/VPC/安全组的分工、多可用区与异地容灾的 RTO/RPO、弹性伸缩与容量评估，能讲清单点在哪。',
  综合场景题:
    '按「先止损 → 再定位 → 后复盘」的顺序组织回答，量化影响面与耗时，并给出可落地的预防措施。',
}

/** 难度枚举 + 颜色（CSS 变量在样式里，这里保留语义供 JS 判断） */
export const DIFFICULTIES = ['简单', '中等', '困难']

/**
 * 分类 → 主题色键（对应 styles.css 里的 --hue-*）。
 * 各分类有独立颜色，标签点、进度条、插图分支都用它，避免整站一片灰。
 * 键名固定，新增分类时在此登记；未登记的会退化为主色。
 */
export const CATEGORY_HUE = {
  Linux基础: 'blue',
  Shell脚本: 'cyan',
  '网络基础': 'sky',
  DNS: 'indigo',
  'iptables/firewalld': 'orange',
  Nginx: 'emerald',
  'LVS/HAProxy': 'teal',
  'Tomcat/JVM': 'amber',
  MySQL: 'sky',
  Redis: 'rose',
  MongoDB: 'lime',
  消息队列: 'violet',
  '容器与K8s': 'blue',
  '存储与备份': 'fuchsia',
  '虚拟化': 'indigo',
  'CI/CD': 'violet',
  'Git/GitLab': 'orange',
  监控告警: 'emerald',
  '日志与ELK': 'teal',
  '自动化与配置管理': 'fuchsia',
  '安全与跳板机': 'rose',
  '云与高可用': 'sky',
  综合场景题: 'amber',
}

/**
 * 取分类对应的 CSS 颜色表达式。
 * @param {string} category
 * @returns {string} 如 var(--hue-blue)
 */
export function categoryColor(category) {
  const hue = CATEGORY_HUE[category]
  return hue ? `var(--hue-${hue})` : 'var(--c-primary)'
}

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

/**
 * 频率枚举。
 *
 * 顺序按「考察频率由低到高」排列：低频 → 中频 → 高频。
 * 原先是从高到低（高频在前），筛选条上看起来像「默认就该选高频」，
 * 与「全部频率」的先后关系也反直觉；改成低→高后，
 * 视觉上从左到右是「越来越常考」，和难度（简单→中等→困难）一致。
 */
export const FREQUENCIES = ['低频', '中频', '高频']

/** 自评状态 */
export const STATUS = {
  KNOW: 'know',
  UNKNOWN: 'unknown',
}

/** 刷题队列模式（题从哪来） */
export const PRACTICE_MODES = ['sequential', 'random', 'wrong']

/**
 * 练习模式（怎么练）——与上面的「队列模式」是两个正交维度：
 *
 * - practice（刷题模式）：全部题，简答自评 + 选择题作答判定
 * - memorize（背题模式）：只有简答题，以「看题背答案」为主
 *
 * 区分原因：选择题考的是「记住细节」，简答题考的是「能自己讲出来」，
 * 很多人在考前只需要反复背简答题的答案。
 */
export const STUDY_MODES = ['practice', 'memorize']

export const DEFAULT_STUDY_MODE = 'practice'

/** 练习模式展示文案 */
export const STUDY_MODE_LABEL = {
  practice: '刷题模式',
  memorize: '背题模式',
}

export const STUDY_MODE_DESC = {
  practice: '全部题 · 简答自评 / 选择作答',
  memorize: '只有简答题 · 看题背答案',
}

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

/**
 * 底部 TabBar（5 项）。
 *
 * 首页必须在里面：否则从首页进到其他 Tab 后，底部栏没有回首页的入口
 * （只有浏览器后退键，在 PWA/微信里体验很差）。
 */
export const TAB_ITEMS = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/bank', label: '题库', icon: 'bank' },
  { path: '/practice', label: '刷题', icon: 'practice' },
  { path: '/me', label: '我的', icon: 'me' },
]

/** 搜索防抖毫秒 */
export const SEARCH_DEBOUNCE_MS = 300

/** 题干摘要截断长度 */
export const SUMMARY_LENGTH = 50

/**
 * 列表每页条数。
 *
 * 10 条：手机一屏约看 2-3 张卡片，10 条约 3-4 屏，扫一遍就能到底；
 * 15 条时要滚很久才见底，容易误以为「列表只有这些、没有下一页」。
 */
export const PAGE_SIZE = 10

/** 分页快捷跳页的候选步长（「上一页/下一页」之外的首页末页） */
export const PAGE_JUMP_EDGE = true
