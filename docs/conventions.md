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

### 换行符：一律 LF（`.gitattributes` 管住）

仓库与工作区统一 **LF**，规则写在根目录 `.gitattributes`：

```gitattributes
* text=auto eol=lf
*.png binary   # 以及 jpg/gif/ico/woff/ttf 等
```

| 要点 | 说明 |
|---|---|
| 为什么需要 | 没有它时 `core.autocrlf=input` **只在提交时**转 LF，checkout 不做转换 |
| 后果 | 某个用编辑器存过的文件会一直是 CRLF，下次碰巧改到它就报<br>`CRLF will be replaced by LF the next time Git touches it` |
| 那条警告有害吗 | **无害**（内容不变），但它意味着「同一份代码在不同机器上换行符不同」 |
| 二进制文件 | 必须显式标 `binary`，否则会被当文本做换行转换、内容损坏 |

> **加了 `.gitattributes` 之后要跑一次 `git add --renormalize .`**，
> 把索引里已存在的文件重新归一化 —— 否则老文件仍是旧换行符。
>
> 本仓库实际执行时，归一化后**只有 `.gitattributes` 一个新增文件**、零内容变更，
> 因为仓库里本来就存的是 LF；只有本地工作区那两个 `.vue` 是 CRLF。

### 题库答案的排版语法（写题库时必须遵守）

答案用**极简块级语法**，由 `AnswerText` 解析成真实 DOM（不用 `v-html`）：

| 想要的效果 | 写法 | 注意 |
|---|---|---|
| 有序列表 | `1. 内容`（**行首**、半角 `.`、**点后空格**） | 每项**单独一行** |
| 无序列表 | `- 内容` | 同上 |
| 小标题 | `## 标题` | |
| 表格 | `\| a \| b \|` + 下一行 `\|---\|---\|` | 缺分隔行会被当普通段落 |
| 代码 | ` ``` ` 围栏 | **必须闭合**，否则后面正文全被吞进代码块 |

> **最容易犯的错：把有序列表写成一整行、并用全角序号。**
>
> 错误：`1）容量规划：…；2）架构预案：…；3）稳定性检查：…` —— 全角 `）` 且不换行，
> `OL_RE`（`/^(\s*)(\d+)[.)]\s+(.*)$/`）完全匹配不上，
> 于是整段被渲染成一个段落，几十字连成一坨，手机上极难扫读。
>
> 正确：
> ```
> 1. 容量规划：…；
> 2. 架构预案：…；
> 3. 稳定性检查：…。
> ```
> 列表项**中间用分号、最后一项用句号**（库内 2544 个列表项的既有风格）。

**为什么改数据而不是放宽解析器**：全角「1）」在正文里也会合法出现
（如引用式写法），放宽正则会把普通文本误拆成列表。
数据侧改成标准写法最稳妥，也让所有题目的排版保持一致。

**这个坑现在由校验脚本兜住**（`scripts/validate-data.mjs` 的 `checkMarkup`）：

> 同一行出现 **≥3 个**全角序号（`N）`）→ 判为「把有序列表挤成了一整行」，校验失败。
> 少于 3 个不做判定，避免误伤 `DNS（53）`、`RAID 10（1）` 这类正文引用。

### 渲染器不支持真正的嵌套列表

`AnswerText` 的列表项有 `depth` 字段（每 2 空格缩进一层），
但 `depth` **只加左边距，编号仍按外层索引连续排**。

所以这样写会出问题：

```markdown
5. 制品晋级…。回滚预案：
  1. 代码回滚：…
  2. DB 回滚：…
```

渲染成 `5.` `6.` `7.` —— 子项被编成了外层序号，看着像层级错乱。

**正确做法：把子列表合并进外层项，用 ①②③ 这类圆圈序号区分。**

```markdown
6. 回滚预案：① 代码回滚：…；② DB 回滚：…；③ 回滚后验证核心业务。
```

或干脆把子列表拆成独立的外层项（前提是语义上确实平级）。

**改完数据记得重新生成分片**：

```bash
npm run split:data    # 重生成 questions-index.json 与 answers/*.json
```

否则 `tests/splitData.test.js` 会报「答案分片与题库不一致」——
这个测试就是专门守这条的。

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
| 规模 | 当前 58 个文件 / 898 个用例 |

**默认题序是随机**：凡断言具体题序/题号的测试，必须显式传
`{ mode: 'sequential' }`，否则队列顺序不稳定（会 flaky）。

**测试的取数口径要与实现一致** —— 尤其是「按条件挑出一题」这类函数。
典型翻车：首页实现是
`pickDailyQuestion(bank.questions, date, { types: ['short'] })`（只从简答题挑），
而测试写成 `pickDailyQuestion(FIXTURE, date)`（从全库挑）。
一旦按日期哈希选中选择题，测试标记的是 A 题、页面展示的是 B 题，
「今日答对后状态转绿」之类的断言就失败 —— 而且**看起来像是实现坏了**。

> 排查这类失败的第一步：**把测试里的调用和实现的调用逐字比对**，
> 特别是有没有少传参数。别急着改实现。

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
