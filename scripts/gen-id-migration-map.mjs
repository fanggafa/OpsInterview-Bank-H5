/**
 * 用实际迁移映射（scripts/.early-id-map.json）生成 idMigration.js 的 ID_MAP，
 * 避免手写错位。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const MAP = JSON.parse(readFileSync('scripts/.early-id-map.json', 'utf8'))
const F = 'src/utils/idMigration.js'
let s = readFileSync(F, 'utf8')

const entries = Object.entries(MAP).sort((a, b) => Number(a[0]) - Number(b[0]))
const lines = []
for (let i = 0; i < entries.length; i += 8) {
  const chunk = entries.slice(i, i + 8)
  lines.push('  ' + chunk.map(([o, n]) => `${o}: ${n}`).join(', ') + ',')
}

const block = `const ID_MAP = {\n${lines.join('\n')}\n}`

const start = s.indexOf('const ID_MAP = {')
const end = s.indexOf('\n}', start) + 2
if (start === -1) {
  console.log('✗ 找不到 ID_MAP')
  process.exit(1)
}
s = s.slice(0, start) + block + s.slice(end)
writeFileSync(F, s, 'utf8')

console.log(`✓ 已写入 ${entries.length} 条映射（由真实数据生成）`)
console.log(`  样例：1→${MAP['1']}  66→${MAP['66']}  73→${MAP['73']}`)
