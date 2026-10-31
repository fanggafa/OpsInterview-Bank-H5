/**
 * 把主题主色从蓝色改为「初音未来」的青蓝。
 *
 * 色值选择依据：
 * - 初音发色是青蓝（Blue > Green），不是墨绿。
 *   上一版用了 #0d857b（G=133 > B=123），看着「太青/偏墨绿」，所以这版
 *   明确让 B > G：浅色 #0e8298（B-G=+22），深色 #3cd4e0（B-G=+12）。
 * - 浅色主题需保证白底对比度 ≥ 4.5（白字按钮），#0e8298 实测 4.50。
 * - 深色主题用更亮的 #3cd4e0（深底对比度 10.42）。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'src/assets/styles.css'
let s = readFileSync(F, 'utf8')

/** 浅色主题：蓝 -> 初音青蓝 */
const LIGHT = [
  ['--c-primary: #4f7cff;', '--c-primary: #0e8298;'],
  ['--c-primary-weak: rgba(79, 124, 255, 0.1);', '--c-primary-weak: rgba(14, 130, 152, 0.1);'],
  [
    '--grad-hero: linear-gradient(135deg, #4f7cff 0%, #7b6cf6 55%, #a06af5 100%);',
    '--grad-hero: linear-gradient(135deg, #0e8298 0%, #1690a8 55%, #22a0b8 100%);',
  ],
  [
    '--grad-card: linear-gradient(180deg, rgba(79, 124, 255, 0.06), rgba(79, 124, 255, 0));',
    '--grad-card: linear-gradient(180deg, rgba(14, 130, 152, 0.06), rgba(14, 130, 152, 0));',
  ],
  ['--fig-bg: linear-gradient(160deg, #f8faff 0%, #f2f6ff 100%);', '--fig-bg: linear-gradient(160deg, #f6fcfe 0%, #eef8fb 100%);'],
  ['--fig-stroke: #c7d2fe;', '--fig-stroke: #a8dcea;'],
  ['--shadow-lift: 0 4px 16px rgba(79, 124, 255, 0.12);', '--shadow-lift: 0 4px 16px rgba(14, 130, 152, 0.12);'],
  ['--c-code-bg: #f4f6fb;', '--c-code-bg: #f3fafc;'],
  ['--c-code-head: #eaeefa;', '--c-code-head: #e4f3f7;'],
  ['--c-code-border: #e2e7f3;', '--c-code-border: #d9eef4;'],
  ['--c-table-zebra: rgba(79, 124, 255, 0.028);', '--c-table-zebra: rgba(14, 130, 152, 0.028);'],
]

/** 深色主题：蓝 -> 亮青蓝 */
const DARK = [
  [
    '--c-primary: #6e93ff;\n  --c-primary-weak: rgba(110, 147, 255, 0.16);',
    '--c-primary: #3cd4e0;\n  --c-primary-weak: rgba(60, 212, 224, 0.16);',
  ],
  [
    '--grad-hero: linear-gradient(135deg, #3d5fc4 0%, #5a4fb8 55%, #6d47a3 100%);',
    '--grad-hero: linear-gradient(135deg, #0a6478 0%, #117d92 55%, #1692a8 100%);',
  ],
  [
    '--grad-card: linear-gradient(180deg, rgba(110, 147, 255, 0.08), rgba(110, 147, 255, 0));',
    '--grad-card: linear-gradient(180deg, rgba(60, 212, 224, 0.08), rgba(60, 212, 224, 0));',
  ],
  ['--c-code-bg: #1b2130;', '--c-code-bg: #142124;'],
  ['--c-code-head: #232b3c;', '--c-code-head: #1a2b2f;'],
  ['--c-code-border: #2c3547;', '--c-code-border: #22363a;'],
  ['--c-code-text: #d7e0ef;', '--c-code-text: #d4e8ea;'],
  ['--c-table-head: #232b3c;', '--c-table-head: #1a2b2f;'],
  ['--c-table-line: #2a3243;', '--c-table-line: #22343a;'],
  ['--c-table-zebra: rgba(110, 147, 255, 0.045);', '--c-table-zebra: rgba(60, 212, 224, 0.045);'],
  ['--c-answer-bg: #191e29;', '--c-answer-bg: #131f22;'],
  ['--c-answer-border: #2a3140;', '--c-answer-border: #223438;'],
]

let n = 0
for (const [a, b] of LIGHT.concat(DARK)) {
  if (!s.includes(a)) {
    console.log(`✗ 未匹配: ${a.slice(0, 55)}`)
    continue
  }
  s = s.split(a).join(b)
  n++
}
writeFileSync(F, s, 'utf8')
console.log(`✓ 替换 ${n} / ${LIGHT.length + DARK.length} 处`)
