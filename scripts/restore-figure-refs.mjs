/**
 * 补回两处被我重写时丢掉的插图标记。
 *
 * 1001（DNS 解析链路）→ [[图:dns-resolve]]
 * 1401（Nginx location 优先级）→ [[图:nginx-location-match]]
 *
 * 放在答案的「链路/顺序」段落之后，让图解紧跟文字说明。
 * 跑完即删。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** 在指定锚点后插入图标记 */
function insertAfter(id, anchor, figure) {
  const q = data.find((x) => x.id === id)
  if (!q) {
    console.log(`未找到 id=${id}`)
    return false
  }
  if (q.answer.includes(`[[图:${figure}]]`)) {
    console.log(`id=${id} 已有该图，跳过`)
    return false
  }
  const idx = q.answer.indexOf(anchor)
  if (idx === -1) {
    console.log(`id=${id} 未找到锚点「${anchor}」`)
    return false
  }
  const pos = idx + anchor.length
  q.answer = `${q.answer.slice(0, pos)}\n\n[[图:${figure}]]${q.answer.slice(pos)}`
  console.log(`id=${id} 已插入 [[图:${figure}]]`)
  return true
}

// 1001：在「完整链路」标题段之后插 DNS 解析图
insertAfter(1001, '**完整链路**：', 'dns-resolve')
// 1401：在优先级列表之后插 location 匹配图
insertAfter(1401, '4. （无修饰）前缀匹配        取最长匹配的那个', 'nginx-location-match')

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
