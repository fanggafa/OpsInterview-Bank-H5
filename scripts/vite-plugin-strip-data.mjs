/**
 * 构建后从 dist 里剔除「运行时不再需要」的源数据文件。
 *
 * 背景：public/data/questions.json 是**编辑期**的数据源（merge-batch、fig.mjs、
 * 各 check 脚本都读它），必须留在仓库里；但运行时已改用
 * questions-index.json + answers/*.json，所以它不该被部署出去。
 *
 * 它单个就有 4.3 MB，是 dist/data 里最大的一块 —— 部署体积的主要浪费。
 *
 * Vite 5 只能整体开关 publicDir 拷贝，没有「排除个别文件」的配置，
 * 所以用插件的 closeBundle 钩子事后删除。
 */
import { existsSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

/** 要从 dist 里剔除的文件（相对 dist 根目录） */
export const STRIP = ['data/questions.json']

/**
 * 实际删除逻辑单独抽出来，便于直接测试（不经过完整构建）。
 *
 * @param {string[]} paths 相对 dist 根目录的路径
 * @param {string} distDir 默认 dist
 * @returns {Array<{path: string, kb: number}>} 被删掉的文件
 */
export function stripAfterBuild(paths = STRIP, distDir = 'dist') {
  const removed = []
  for (const rel of paths) {
    const abs = join(distDir, rel)
    if (!existsSync(abs)) continue
    const size = statSync(abs).size
    unlinkSync(abs)
    removed.push({ path: rel, kb: Math.round(size / 1024) })
  }
  if (removed.length) {
    const total = removed.reduce((a, r) => a + r.kb, 0)
    console.log(`  stripped ${removed.length} source file(s) from dist (${total} KB)`)
  }
  return removed
}

/**
 * @returns {import('vite').Plugin}
 */
export function stripSourceData() {
  return {
    name: 'dsh:strip-source-data',
    apply: 'build',
    closeBundle() {
      stripAfterBuild()
    },
  }
}
