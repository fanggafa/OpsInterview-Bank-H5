#!/usr/bin/env node
/**
 * 编码守卫：防止中文内容被错误编码写坏（本项目真实踩过的坑）。
 *
 * 检测三类问题：
 * 1. 非法 UTF-8 字节序列（严格解码失败）
 * 2. U+FFFD 替换字符（解码时已产生不可逆损坏）
 * 3. 乱码文本（GBK 字节被当 UTF-8 解读后产生的「锛鈥鐨」类字符）
 *
 * 第 3 类最隐蔽：它是**合法的 UTF-8**，解码不会报错，肉眼却全是乱码。
 * 用「常用汉字占比」启发式识别——正常中文里「的了是在我有和就不」高频出现，
 * 乱码文本几乎不含这些字。
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const TEXT_EXT = ['md', 'js', 'mjs', 'cjs', 'vue', 'json', 'css', 'html', 'toml', 'snippet', 'yml', 'yaml', 'txt']

/** 正常中文里的高频字，用于区分乱码 */
const COMMON_CJK = new Set(Array.from('的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感'))

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff]/

const errors = []
const warnings = []

/** 列出仓库中被跟踪的文本文件 */
function listTrackedFiles() {
  try {
    const out = execSync('git ls-files', { encoding: 'buffer' })
    return out
      .toString('utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch (e) {
    // 不在 git 仓库中时退化为扫描源码目录
    console.warn('⚠ 未检测到 git 仓库，跳过编码检查（CI 中应始终处于 git 仓库内）')
    return []
  }
}

function pickTextFiles(files) {
  return files.filter((f) => {
    const ext = f.split('.').pop()
    return TEXT_EXT.includes(ext)
  })
}

/** 严格 UTF-8 解码：非法字节序列直接抛错 */
function strictDecode(buf) {
  return new TextDecoder('utf-8', { fatal: true }).decode(buf)
}

function checkFile(file) {
  let buf
  try {
    buf = readFileSync(file)
  } catch (e) {
    errors.push(`${file}: 无法读取（${e.message}）`)
    return
  }

  // 空文件跳过
  if (buf.length === 0) return

  // 1. 严格 UTF-8 解码
  let text
  try {
    text = strictDecode(buf)
  } catch (e) {
    errors.push(`${file}: 含非法 UTF-8 字节序列，文件已损坏（通常是编辑器/命令用了 GBK 编码写入）`)
    return
  }

  // 2. U+FFFD 替换字符
  const fffd = (text.match(/\uFFFD/g) || []).length
  if (fffd > 0) {
    errors.push(`${file}: 含 ${fffd} 个 U+FFFD 替换字符，说明曾以错误编码解码过`)
  }

  // 3. BOM（不阻断，仅提示；我们的文件约定无 BOM）
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    warnings.push(`${file}: 含 UTF-8 BOM（项目约定不使用 BOM）`)
  }

  // 4. 乱码启发式：合法 UTF-8 但中文是乱码
  const cjk = Array.from(text).filter((ch) => CJK_RE.test(ch))
  if (cjk.length >= 30) {
    const common = cjk.filter((ch) => COMMON_CJK.has(ch)).length
    const ratio = common / cjk.length
    if (ratio < 0.04) {
      // 抽样展示，便于定位
      const sample = cjk.slice(0, 12).join('')
      errors.push(
        `${file}: 疑似乱码（常用汉字占比 ${(ratio * 100).toFixed(1)}%，阈值 4%），样例：「${sample}」`
      )
    }
  }
}

const files = pickTextFiles(listTrackedFiles())
console.log(`编码检查：共 ${files.length} 个文本文件`)

for (const f of files) checkFile(f)

if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} 条提示：`)
  warnings.forEach((w) => console.log('  ' + w))
}

if (errors.length) {
  console.error(`\n✗ 编码检查失败，共 ${errors.length} 处：`)
  errors.forEach((e) => console.error('  ' + e))
  console.error('\n修复建议：用编辑器以 UTF-8 重新保存该文件；')
  console.error('PowerShell 下不要用 `>`、Set-Content 默认编码写中文文件，应显式指定 -Encoding UTF8。')
  process.exit(1)
}

console.log('✓ 编码检查通过')
