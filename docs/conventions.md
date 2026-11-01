# 编码约定与协作规范

> 说明「代码怎么写、测试怎么加、改动怎么提交」。
> 架构与数据流见 [architecture](architecture.md)，部署见 [deployment](deployment.md)。

## 代码风格

| 项 | 约定 |
|---|---|
| 语言 | 纯 JavaScript，**不引入 TypeScript** |
| 组件 | Vue 3 `<script setup>`，单文件组件 |
| 注释 | 中文，**说明「为什么」而不是「做了什么」**；踩过的坑要写进注释 |
| 命名 | 文件 kebab-case；组件 PascalCase；工具函数 camelCase |
| 纯函数 | 数据计算放 `src/utils/`，便于单测；副作用留在 store / view |

**不引入重量级依赖**：不为一个小功能引库（图表用 CSS + 内联 SVG 自己画，
不引 echarts / chart.js / d3）。加依赖前先问「能不能用现有手段做」。

## 测试

```bash
npm run test        # 全量
npm run test:watch  # 改代码时持续跑
```

| 约定 | 说明 |
|---|---|
| 框架 | vitest + `@vue/test-utils` |
| 位置 | `tests/*.test.js` |
| 目标 | 优先测**纯函数**与**回归路径**（曾经坏过的行为必须有测试守住） |
| 防御性测试 | 新增守卫逻辑时，临时移除它确认测试会失败（证明测试真的有效） |
| 规模 | 当前 48 个文件 / 791 个用例 |

**默认题序是随机**：凡断言具体题序/题号的测试，必须显式传
`{ mode: 'sequential' }`，否则队列顺序不稳定（会 flaky）。

## 提交与 PR

`main` 分支**已开启保护**，直推会被拒绝：

```
GH006: Protected branch update failed for refs/heads/main.
```

### 完整流程

```bash
# 1. 从最新 main 开分支
git checkout main
git pull
git checkout -b feat/你的改动

# 2. 改代码

# 3. 提交前必须验证（任一失败都不要提交）
npm run verify

# 4. 提交并推送
git add -A
git commit -m "feat: 一句话说明改了什么"
git push -u origin feat/你的改动

# 5. 提 PR，等两个 check 变绿后 Squash and merge

# 6. 同步本地
git checkout main
git pull
git branch -d feat/你的改动
```

### 分支命名

| 前缀 | 用于 |
|---|---|
| `feat/` | 新功能 |
| `fix/` | 修 bug |
| `docs/` | 文档 |
| `chore/` | 工程配置、依赖升级 |
| `content/` | 题库内容增删改 |

### CI 状态检查

两个 check 必须全绿：

```
测试与构建 (20.x)
测试与构建 (22.x)
```

> ⚠️ **单人仓库必须关掉 Require approvals**（GitHub 不允许自己批自己）：

| 选项 | 设置 |
|---|---|
| Require a pull request before merging | ✅ 开 |
| Require approvals | ❌ **关**（或设为 0） |
| Require status checks to pass | ✅ 开（选两个 `测试与构建`） |
| Require branches to be up to date | ✅ 开 |

### 合并后自动发生什么

| 触发 | 结果 |
|---|---|
| 合并进 `main` | `CI` 再跑一遍 |
| 合并进 `main` | `Deploy to GitHub Pages` 自动部署，约 1 分钟后线上更新 |

### 常见情况

| 情况 | 处理 |
|---|---|
| CI 失败但本地能过 | 看 Actions 具体哪步失败；常见是忘记 `git add` 新文件 |
| 想改已推送的 PR | 在分支上继续提交并 push，PR 自动更新 |
| PR 有冲突 | 本地 `git pull origin main` 解决后 push |
| Merge 按钮灰、提示 `Review required` | 去 Settings → Branches 取消 Require approvals |

## 提交前检查清单

`npm run verify` 依次执行，**任一失败都不要提交**：

```
编码检查 → 题库校验 → 插图文字检查 → 导入大小写检查
→ 插图 SFC 检查 → 插图挂载检查 → 全部测试 → 生产构建
```

如果是 UI 改动，还应在浏览器里把宽度切到 **375px** 看一眼（含深色模式）。

## 编码守卫（为什么需要它）

**本项目发生过一次事故**：用 PowerShell 批量处理时，UTF-8 中文被按 GBK 读写，
整个文档变成乱码且无法回滚（当时没有 git）。

因此有两道防线：

### 1. `npm run check:encoding`

扫描所有被 git 跟踪的文本文件，检测：

| 类型 | 说明 | 严重性 |
|---|---|---|
| 非法 UTF-8 字节序列 | 文件已损坏 | ❌ 阻断 |
| U+FFFD 替换字符 | 曾以错误编码解码，信息不可逆丢失 | ❌ 阻断 |
| 疑似乱码 | **合法 UTF-8 但中文是乱码**（最隐蔽） | ❌ 阻断 |
| UTF-8 BOM | 项目约定不用 BOM | ⚠ 提示 |

第 3 类靠「常用汉字占比」启发式识别——正常中文里「的了是在我有和就」等高频字
占比通常 >10%，而 GBK 误解码产生的乱码几乎为 0%。实测那次事故**占比仅 0.2%**，可稳定拦下。

### 2. CI

每次 push / PR 到 `main` 自动执行，**顺序刻意把编码检查放在最前**
（编码坏了会污染后面所有步骤的排查）：

```
编码检查 → 题库校验 → 单元测试 → 构建 → BASE_PATH 构建 → 校验产物 → 上传 artifact
```

## 在 PowerShell 里改文件的陷阱

**本项目多次被这个问题坑**，写进约定：

| 陷阱 | 后果 | 做法 |
|---|---|---|
| `node -e "..."` 里带引号/中文 | PowerShell 会吞引号、破坏 CJK 字符 | **写成 `.mjs` 文件再 `node scripts/x.mjs`** |
| `$L[$_].Trim()` 遇到 null 行 | 抛异常 | 先判空 |
| `ConvertFrom-Json` 读 manifest | 因编码失败 | 改用 node 读 |
| 用 `Remove-Item` 删 git 跟踪的文件后再检查编码 | 报 ENOENT | 用 `git checkout --` 恢复 |
| 字符串替换里含 `;`/`(`/`)` | 被当命令分隔符执行 | 用精确的脚本文本替换，或直接用 edit 工具 |

## 文档同步要求

**每次变更都要同步更新对应文档**——文档与代码对不上，比没有文档更糟：

| 变更类型 | 需要更新 |
|---|---|
| 新增/移除页面与路由 | PRD 与 README 的功能一览 |
| 交互规则变化 | PRD 对应章节、README |
| 存储结构变化 | `architecture.md` 的本地存储 |
| 题量/测试数变化 | README 与本文档 |
| 做完「未实现」清单里的项 | 从清单移走，写进正文 |

**不要把内容全塞进 README**：README 只放门面与导航，
实现细节进 `architecture`，需求进 PRD，规范进本文档。
