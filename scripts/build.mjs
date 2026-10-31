#!/usr/bin/env node
/**
 * 构建包装器：把 esbuild 的临时目录指到项目内，规避 Windows 上的杀软文件锁。
 *
 * 背景（实测）：在 Windows 上 `vite build` 会随机失败：
 *
 *   [vite:esbuild-transpile] remove C:\Users\...\Temp\esbuild-xxxx: Access is denied.
 *
 * 原因不是代码：esbuild 会把每个待转译模块写到 %TEMP% 下的临时文件再删除，
 * 而 QQProtect（腾讯安全组件）等实时扫描会短暂锁住新建文件，删除就失败。
 * 文件越多越容易撞上（实测同一次 8 个新组件必现，去掉后连续 3 次都成功）。
 *
 * 修法：把 TMP/TEMP 指到项目内的 `.buildtmp/`，扫描器扫不到那里，
 * 构建即稳定。CI（Linux）上该设置无副作用。
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tmpDir = join(root, '.buildtmp')

mkdirSync(tmpDir, { recursive: true })

const env = { ...process.env, TMP: tmpDir, TEMP: tmpDir }

// 透传额外参数（如 --mode production）
const args = ['run', 'build:raw', '--', ...process.argv.slice(2)]
const r = spawnSync('npm', args, { cwd: root, env, stdio: 'inherit', shell: true })

rmSync(tmpDir, { recursive: true, force: true })
process.exit(r.status ?? 1)
