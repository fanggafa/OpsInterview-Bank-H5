import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '@/utils/constants'

/**
 * 分类枚举顺序守卫。
 *
 * 分类筛选条的展示顺序直接由 `CATEGORIES` 数组决定
 * （见 BankView 的 `CATEGORIES.filter(...)`），所以这个顺序是**产品行为**。
 *
 * 这份顺序是**人工指定的业务优先级**（不是字母序）：
 * 高频必考分类在前（Linux基础、网络基础、综合场景题），冷门辅助分类靠后。
 *
 * 下面的 EXPECTED 是唯一事实来源 —— 改顺序时同时改这里，测试才能通过。
 * 这样能防止「改了一处忘了另一处」或「新增分类时漏登记展示顺序」。
 */

/** 期望的展示顺序（按业务优先级，与 src/utils/constants.js 保持一致） */
const EXPECTED = [
  'Linux基础',
  '网络基础',
  '综合场景题',
  '虚拟化',
  'DNS',
  'iptables/firewalld',
  'Nginx',
  'Tomcat/JVM',
  'LVS/HAProxy',
  'Redis',
  'MySQL',
  'MongoDB',
  'Git/GitLab',
  'Shell脚本',
  'Python',
  'CI/CD',
  '自动化与配置管理',
  '消息队列',
  '日志与ELK',
  'Docker',
  'Kubernetes',
  '存储与备份',
  '云与高可用',
  '监控告警',
  '安全与跳板机',
  'AI与大模型',
]

describe('CATEGORIES 展示顺序（业务优先级）', () => {
  it('顺序与约定的优先级完全一致', () => {
    expect(CATEGORIES).toEqual(EXPECTED)
  })

  it('分类数量与预期一致（新增分类时必须同时登记顺序）', () => {
    expect(CATEGORIES.length).toBe(EXPECTED.length)
  })

  it('无重复分类', () => {
    const dup = CATEGORIES.filter((c, i) => CATEGORIES.indexOf(c) !== i)
    expect(dup, `重复的分类: ${dup.join(',')}`).toEqual([])
  })

  it('高频分类排在前面（冒烟：前 3 项是最常刷的）', () => {
    expect(CATEGORIES.slice(0, 3)).toEqual(['Linux基础', '网络基础', '综合场景题'])
  })
})
