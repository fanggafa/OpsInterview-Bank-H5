# 运维面试题库 H5（OpsInterview Bank）

面向运维工程师的面试题库刷题工具：手机浏览器 / 微信内打开，利用碎片时间背题自测。

- 技术栈：Vue 3 + Vite + Vue Router + Pinia（纯 JavaScript，无 TypeScript）
- 形态：SPA，移动端优先，**无后端、无登录、无 API Key**，可部署到任意静态托管
- 题库：**119 题**（93 简答 + 16 单选 + 10 多选），10 个分类
- 线上演示：**https://fanggafa.github.io/OpsInterview-Bank-H5/**
- 需求文档：[`docs/ops-interview-bank-PRD.md`](docs/ops-interview-bank-PRD.md)（v1.3）

> 只想部署出去用？看[部署](#部署)第 4 节「不想配 rewrite？改用 hash 模式」，一行改动零配置上线。

---

## 快速开始

```bash
npm install
npm run dev          # http://127.0.0.1:5273
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器（127.0.0.1:5273） |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 预览构建产物（127.0.0.1:5274） |
| `npm run test` | 运行 vitest（20 个文件 / 427 个用例） |
| `npm run validate:data` | 校验题库结构（枚举 / id / 题数 / 字段） |
| `npm run check:encoding` | 编码守卫（防中文被写坏，见[编码守卫](#编码守卫)） |
| `npm run verify` | **提交前跑这个**：编码 + 题库 + 测试 + 构建 全流程 |

环境要求：Node.js ≥ 18。

部署到子目录时用 `BASE_PATH=/子目录/ npm run build`（详见[部署](#部署)第 3 节）。

---

## 功能一览

| 页面 | 说明 |
|---|---|
| `/` 首页 | 总进度环、简答掌握率 / 选择题正确率、刷题与面试快捷入口、分类进度、继续上次 |
| `/bank` 题库 | 分类 + 频率筛选、防抖搜索、分页（15 条/页，页码进 URL） |
| `/question/:id` | 简答折叠答案 + 自评；选择题选项判定 + 解析 |
| `/practice` | 顺序 / 随机 / 分类 / 错题四种模式，滑动 + 键盘，断点续刷，完成小结 |
| `/interview` | 题数 + 分类范围 → 答题 → 自评评估（得分 / 正确率 / 薄弱分类 / 逐题回顾） |
| `/stats` | 双指标、分类条形图、错题与收藏入口 |
| `/wrong` `/favorites` | 错题本（实时派生）、收藏（倒序），均分页 |
| `/me` | 主题三态（浅色/深色/跟随系统）、清空数据、关于 |

一共 12 条路由，含 404。

---

## 目录结构

```
ops-interview-h5/
├── docs/ops-interview-bank-PRD.md   # 产品需求文档
├── public/data/questions.json       # 题库（119 题）
├── scripts/
│   ├── validate-data.mjs            # 题库结构校验
│   └── measure.mjs                  # 移动端布局实测（CDP，需本地起 dev）
├── src/
│   ├── api/dataService.js           # 题库加载封装（缓存 + 错误包装）
│   ├── stores/
│   │   ├── bankStore.js             # 题库数据与 loading/error/empty 三态
│   │   ├── studyStore.js            # 学习记录 / 收藏 / 进度 / 全部统计口径
│   │   ├── settingsStore.js         # 主题（light|dark|system）
│   │   └── interviewStore.js        # 面试会话（仅内存，刷新失效）
│   ├── router/index.js              # 12 条路由 + 守卫 + 页面 title
│   ├── views/                       # 页面（11 个 + 404）
│   ├── components/                  # TabBar / AppHeader / QuestionCard / Pagination / Ring …
│   ├── assets/styles.css            # CSS 变量与全局样式（含深色主题）
│   └── utils/
│       ├── constants.js             # 枚举、存储 key、PAGE_SIZE、分类建议文案
│       ├── storage.js               # localStorage 封装（容错 / 配额降级 / 节流落盘）
│       ├── format.js                # 截断、百分比、相对时间、洗牌、关键词匹配
│       ├── question.js              # 题型判定（简答 / 单选 / 多选）
│       ├── filter.js                # 题库筛选 + URL query 序列化
│       ├── paginate.js              # 分页计算
│       ├── practice.js              # 刷题队列与断点续刷
│       ├── gestures.js              # 滑动手势判定（轴锁定 + 阈值 + 速度）
│       └── scroll.js                # 回到顶部（兼容测试环境）
├── tests/                           # vitest（20 个文件 / 427 个用例）
├── deploy/nginx.conf.snippet        # Nginx 配置片段
├── vercel.json / netlify.toml       # 平台配置
└── index.html
```

---

## 统计口径（全局唯一定义，见 `studyStore` getters）

| 指标 | 定义 | 边界 |
|---|---|---|
| `reviewedCount` | 有效记录中 `times > 0` 的题数（含选择题） | 仅统计题库中存在的 id |
| `progressRate` | `reviewedCount / total` | 总题为 0 → `null`，UI 显示「—」 |
| `masteryRate` | **仅简答题**：`shortKnow / (shortKnow + shortUnknown)` | 分母为 0 → `null` |
| `choiceRate` | **仅选择题**：`choiceKnow / (choiceKnow + choiceUnknown)` | 分母为 0 → `null` |
| `todayReviewedCount` | `lastReviewed` 落在本地时区今天的题数 | 含选择题 |
| 分类掌握度 | 该分类内**简答题**的 `know / (know + unknown)` | 该分类无简答 → `null` |

- 百分比统一 `Math.round` 取整；`null` 一律渲染「—」，**不显示 0%**。
- **掌握率只算简答题，选择题单独算正确率**——两者的"会"含义不同，混在一起会让数字失真。
- 错题本**由记录实时派生**：最近一次结果为「不会 / 答错」才在错题本，之后答对自动移出。
- 未知 id 保留在 localStorage（便于题库回滚），但不参与统计与列表展示。

---

## 本地存储

| key | 结构 |
|---|---|
| `oi_records` | `{ [id]: { status: "know"\|"unknown", times: number, lastReviewed: number } }` |
| `oi_favorites` | `[id, ...]`（按收藏先后 push，展示倒序） |
| `oi_settings` | `{ theme: "light"\|"dark"\|"system" }` |
| `oi_progress` | `{ mode, category, index, updatedAt }`（断点续刷） |

- 写入采用 ≥200ms 节流，并在 `visibilitychange(hidden)` / `pagehide` 时强制落盘。
- JSON 损坏会自动回退默认值并清理脏数据；配额超限时静默降级，不阻塞使用。

---

## 维护题库

题库共 **119 题**：93 道简答题 + 16 道单选题 + 10 道多选题。

### 简答题

```json
{
  "id": 1,
  "type": "short",
  "category": "Linux基础",
  "difficulty": "中等",
  "question": "……",
  "answer": "纯文本，可用 \\n 换行与缩进",
  "tags": ["负载", "性能排查"],
  "frequency": "高频"
}
```

### 选择题（单选 / 多选）

```json
{
  "id": 73,
  "type": "single",
  "category": "MySQL",
  "difficulty": "中等",
  "question": "InnoDB 默认的事务隔离级别是？",
  "options": [
    { "key": "A", "text": "READ UNCOMMITTED" },
    { "key": "B", "text": "READ COMMITTED" },
    { "key": "C", "text": "REPEATABLE READ" },
    { "key": "D", "text": "SERIALIZABLE" }
  ],
  "answer": ["C"],
  "explanation": "InnoDB 默认 REPEATABLE READ……",
  "tags": ["事务"],
  "frequency": "高频"
}
```

| 字段 | 约束 |
|---|---|
| `id` | 正整数，唯一，从 1 连续递增 |
| `type` | `short` / `single` / `multiple`（缺省为 `short`） |
| `category` | 10 个分类之一（枚举在 `src/utils/constants.js`） |
| `difficulty` | 简单 / 中等 / 困难 |
| `question` | 非空，≤ 120 字 |
| `answer` | 简答：非空字符串；选择：选项 key 数组 |
| `options` | 仅选择题，2–6 项，key 必须是从 A 起的连续大写字母 |
| `explanation` | 仅选择题，可选，≥ 10 字 |
| `tags` | 2–5 个，不带 `#` |
| `frequency` | 高频 / 中频 / 低频 |

改完跑 `npm run validate:data`，它会拦住：枚举错误、id 不连续、`single` 配多个答案、`multiple` 只配一个答案、`answer` 引用不存在的选项、选项 key 不连续等。

> ⚠️ **两个坑**：
> 1. 题目内容里**不要写未转义的 `"`**（会破坏 JSON），命令片段用单引号。
> 2. `validate:data` **只校验结构，不判断主题重复**。加题后请人眼过一遍同分类列表——
>    简答题和选择题应是**不同知识点**，不要把简答题改写成选项形式凑数。

### 修改题库后的生效方式

改 `public/data/questions.json` 后重新构建部署即可；`data/questions.json` 已配 `no-cache`，
用户刷新页面就能拿到新题。新增分类只需改 `constants.js` 的 `CATEGORIES` + 题库数据，页面会自动出现新 Tab。

---

## 题型与判定

| 题型 | 判定方式 | 记录状态 |
|---|---|---|
| 简答 | 用户自评 | 会 / 不会 |
| 单选 | 点选项即判 | 答对 / 答错 |
| 多选 | 点「提交答案」，**全对才算对** | 答对 / 答错 |

判定结果统一映射到既有的 `know` / `unknown` 状态，所以错题本、今日已刷数无需特殊处理。
但掌握率只统计简答题（见[统计口径](#统计口径全局唯一定义见-studystore-getters)），选择题另有独立指标。
答错的选择题**会**进入错题本。

### 以后要加新题型（判断、填空等）

1. `src/utils/constants.js` 的 `QUESTION_TYPES` 加值，`TYPE_LABEL` 加标签
2. `src/utils/question.js` 加判定函数，`getType()` 已做缺省回退，旧数据不受影响
3. `scripts/validate-data.mjs` 加对应校验分支
4. 在 `QuestionView` / `PracticeView` / `InterviewRunView` 加渲染分支（三者结构一致）

---

## 列表分页

题库 / 错题本 / 收藏页统一分页，**不做无限滚动**：

- 每页 **15 条**（改 `src/utils/constants.js` 的 `PAGE_SIZE` 全局生效）。
- 分页控件**吸底固定**，滚到任何位置都能翻页，不必先滚回顶部。
- 只在**超过一页**时出现；不足一页完全不显示，避免多余 UI。
- 题库页码写进 URL（`/bank?category=MySQL&page=2`），刷新与浏览器后退都能恢复；切换筛选重置回第 1 页。
- 错题本/收藏页在条目减少（答对移出、取消收藏）导致页码越界时，自动收敛到有内容的页。
- 统计页与面试评估页较长，提供悬浮「回到顶部」按钮。

---

## 模拟面试

`/interview` → `/interview/run` → `/interview/result`

- **设置**：题数 5/10/15/20，分类范围可多选。题数超过所选范围时自动按实际题量出题并提示。
- **答题**：随机抽题、不重复。简答题自评；选择题点选项即判定（多选需提交），判定后展示解析。
- **评估**（自评评估，不调用 AI）：
  - **得分** = 答对（自评「会」/ 选择答对）占总题数的比例，含未答题目
  - **已答正确率** = 答对 / 已答题数，用于区分「没答完」与「答错」
  - 各分类表现条形图、薄弱分类 Top3 与分类复习建议、逐题回顾
- 会话只存内存，**刷新即失效**，路由守卫会跳回设置页。
- 结果只在进入评估页时**一次性写入**学习记录，中途退出不污染统计。

---

## 部署

### 0. 先理解：为什么需要 rewrite

本项目使用 **history 路由**（`createWebHistory`），URL 是 `/bank`、`/question/3` 这样的真实路径。
服务器找不到对应文件时，**必须回退到 `index.html`** 让前端路由接管，否则刷新子页面会返回 404。

```
用户访问 /bank  →  服务器没有 bank.html  →  [未配置] 404
                                          →  [已配置] 返回 index.html → 前端路由渲染题库页
```

首页 `/` 永远正常，所以**这个坑只在刷新/直接分享子页面时出现**，很容易上线后才发现。

### 1. 构建

```bash
npm install
npm run build          # 产物在 dist/
npm run preview        # 本地预览构建产物（127.0.0.1:5274）
```

### 2. 部署到根路径（最常见）

直接把 `dist/` 整个目录传上去即可。按平台选一种：

**Vercel**

仓库已带 `vercel.json`，导入 Git 仓库后自动识别（构建命令 `npm run build`，输出目录 `dist`）：

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify**

仓库已带 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx（自建服务器最常用）**

完整可复制片段见 [`deploy/nginx.conf.snippet`](deploy/nginx.conf.snippet)，核心就一行：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

> ⚠️ 只写 `root` + `index` 是不够的，必须加 `try_files`，否则刷新 `/bank` 会 404。

**其他静态托管**（GitHub Pages / 阿里云 OSS / 腾讯云 COS / 宝塔等）：
找到「404 回退到 index.html」或「重写规则」的开关打开；没有该功能的，用下面第 4 节的 hash 模式。

### 3. 部署到子目录（https://example.com/ops/）

默认构建的产物引用绝对路径 `/assets/...`，**直接放子目录会加载不到 JS/CSS（白屏）**。
构建时指定 `BASE_PATH` 环境变量即可：

```bash
# Linux / macOS
BASE_PATH=/ops/ npm run build

# Windows PowerShell
$env:BASE_PATH='/ops/'; npm run build
```

产物路径会变成 `/ops/assets/...`，`index.html`、路由、题库数据会同步适配
（代码里所有资源路径都走 `import.meta.env.BASE_URL`，无需改业务代码）。

Nginx 对应配置：

```nginx
location /ops/ {
    alias /usr/share/nginx/html/ops/;
    try_files $uri $uri/ /ops/index.html;
}
```

### 4. 不想配 rewrite？改用 hash 路由模式

**不用改源码**，构建时指定环境变量即可：

```bash
VITE_ROUTER_MODE=hash BASE_PATH=/你的子目录/ npm run build
```

URL 变成 `/#/bank`、`/#/question/3`。**任何静态托管、甚至直接双击 html 都能用，零配置**。
代价是 URL 带 `#`，不好看，且部分统计/分享工具处理 hash 不佳。

> 路由模式由 `import.meta.env.VITE_ROUTER_MODE` 控制（见 `src/router/index.js`），
> 不用为了部署去改源码再忘记改回来。

### 4.1 GitHub Pages（已配置自动部署）

**线上地址：https://fanggafa.github.io/OpsInterview-Bank-H5/**

仓库已带 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)，推送 `main` 后自动发布。
工作流包含 `configure-pages` 的 `enablement: true`，**首次部署会自己开启 Pages**，无需手动配置。

工作流已处理 Pages 的两个特殊要求：

| 要求 | 处理方式 |
|---|---|
| 项目站点在子路径下 | 自动设 `BASE_PATH=/<仓库名>/` |
| **Pages 不支持服务器端 rewrite** | 自动用 `VITE_ROUTER_MODE=hash` |

> ⚠️ 这一点很关键：已实测确认，history 模式在纯静态托管上，`/bank`、`/stats`、`/question/1`
> 都会直接 404，只有首页能用。所以 Pages 必须用 hash 模式。

**已知限制**：hash 模式下 URL 形如 `#/bank`，所以：

- ✅ 分享 `https://fanggafa.github.io/OpsInterview-Bank-H5/#/question/3` 可直达详情
- ❌ 分享 `https://fanggafa.github.io/OpsInterview-Bank-H5/bank`（不带 `#`）会 404
  —— 这是 hash 路由的固有行为，不是 bug

### 4.2 其他平台速查

### 5. 部署后必须验证的 4 件事

按顺序点一遍，前两条是最容易踩的：

1. **直接刷新子路由**：打开 `/bank` 后按 F5 → 不能 404
2. **深链接直达**：把 `/question/3` 发给别人打开 → 能正常显示
3. **题库加载**：题库页能看到题（说明 `/data/questions.json` 路径正确）
4. **手机真机**：微信内置浏览器打开 → 布局正常、能滑动切题

> `npm run preview` 对所有路径都返回 200，**不能代表线上一定没问题**
> （那是预览服务器的默认行为）。真正要验证的是部署平台上的 rewrite 配置。

### 6. 缓存与更新

- `assets/*` 文件名带 hash，可设长缓存（`expires 1y` + `immutable`）
- `index.html` **不要**强缓存，否则用户拿到旧版本引用旧的 hash 资源 → 白屏
- `data/questions.json` 建议 `no-cache`，这样更新题库后用户刷新即生效
  （`deploy/nginx.conf.snippet` 里已按此配置）

### 7. 其他注意事项

| 事项 | 说明 |
|---|---|
| HTTPS | 必须用 HTTPS。微信内打开、`prefers-color-scheme` 都依赖安全上下文 |
| 数据存储位置 | 学习记录存**用户浏览器本地**，不随服务器更新而变化；换设备/清缓存即丢失 |
| CDN | 若走 CDN，记得在 CDN 层也配置「404 → index.html」，否则回退会被 CDN 拦掉 |
| 微信分享 | 分享卡片标题取 `index.html` 的 `<title>`，当前为「运维面试题库」；自定义卡片需接 JSSDK |
| 多环境 | `localStorage` key 固定为 `oi_*`，同一域名下不同部署会共用记录 |

### 8. 部署后常见故障速查

| 现象 | 原因 | 解决 |
|---|---|---|
| 首页正常，刷新 `/bank` 出现 404 / Nginx 默认页 | 缺 rewrite 回退 | 加 `try_files $uri $uri/ /index.html;`，或改用 hash 模式 |
| 页面全白，控制台 `Failed to load module script` | 资源路径不对（部署在子目录但没设 base） | 用 `BASE_PATH=/子目录/ npm run build` 重新构建 |
| 白屏且 `index.html` 引用的旧 hash 文件 404 | `index.html` 被强缓存了 | 给 `index.html` 设 `no-cache`，assets 才设长缓存 |
| 题库页一直转圈 / 显示加载失败 | `data/questions.json` 路径错或未上传 | 确认 `dist/data/questions.json` 存在；点页面上的「重试」 |
| CDN 后面仍然 404 | CDN 层没配回退 | 在 CDN 的「自定义错误页 / 回源规则」里也做 404→index.html |
| 手机上左右滑动切题没反应 | 浏览器未触发 pointer 事件（极老内核） | 用键盘/按钮切题；或升级 WebView |
| 深色模式不跟随系统 | 浏览器不支持 `prefers-color-scheme` 或非 HTTPS | 在「我的」里手动固定为深色；生产用 HTTPS |
| 清缓存后学习记录全没了 | 记录只存浏览器 localStorage | 属预期行为，见「已知限制」 |

---

## 题库页的筛选态

筛选状态**只存在 URL query** 中，刷新与浏览器后退都能恢复：

```
/bank?category=MySQL&frequency=高频&q=index&page=2
```

- `category` / `frequency` 非法值会被忽略并回退为「全部」（防止手改 URL 出现异常状态）。
- 搜索 300ms 防抖，匹配范围：题干 + 答案 + 标签 + 选项 + 解析，忽略大小写。
- 列表滚动位置存 `sessionStorage`，从详情页返回时恢复。

---

## 编码守卫

本项目曾发生过一次事故：用 PowerShell 批量处理时，UTF-8 中文被按 GBK 读写，**整个 README 变成乱码且无法回滚**（当时没有 git）。

现在有两道防线：

### 1. `npm run check:encoding`

扫描所有被 git 跟踪的文本文件，检测三类问题：

| 类型 | 说明 | 严重性 |
|---|---|---|
| 非法 UTF-8 字节序列 | 文件已损坏，`TextDecoder` 严格解码失败 | ❌ 阻断 |
| U+FFFD 替换字符 | 曾以错误编码解码过，信息已不可逆丢失 | ❌ 阻断 |
| 疑似乱码 | **合法 UTF-8 但中文是乱码**（最隐蔽） | ❌ 阻断 |
| UTF-8 BOM | 项目约定不用 BOM | ⚠ 提示 |

第 3 类靠「常用汉字占比」启发式识别——正常中文里「的了是在我有和就」等高频字占比通常 >10%，
而 GBK 误解码产生的乱码文本几乎为 0%。实测我复现的那次事故：**占比仅 0.2%**，可稳定拦下。

### 2. CI（`.github/workflows/ci.yml`）

每次 push / PR 到 `main` 自动执行，顺序刻意把编码检查放在最前
（编码坏了会污染后面所有步骤的排查）：

```
编码检查 → 题库校验 → 单元测试 → 构建 → BASE_PATH 构建 → 校验产物 → 上传 artifact
```

- Node 20.x 与 22.x 双版本矩阵
- 构建产物在 Actions 页面可直接下载部署
- 同分支新推送自动取消旧任务

### 本地写中文文件的注意事项

**不要用** PowerShell 的 `>`、`Set-Content` 默认编码写中文文件：

```powershell
# ❌ 会破坏 UTF-8 中文
Get-Content README.md | Set-Content README.md

# ✓ 显式指定编码
Set-Content -Path README.md -Value $content -Encoding UTF8
```

更推荐：用编辑器的 `write` / `edit` 操作，或用 node 脚本处理文本。

---

## 开发笔记

- **主题**通过 `<html data-theme="light|dark">` + CSS 变量驱动，组件里不写死颜色。
- **深色对比度**经实测：23 个文字元素的对比度最低 5.09，全部 ≥ WCAG AA 的 4.5。
  改颜色时注意 `--c-text-3` 在深色下不能低于 `#8E8E8E`。
- **手势**绑定用 `watch(stageRef, { flush: 'post' })` 而非 `onMounted`——
  卡片在异步加载后才渲染，`onMounted` 时 DOM 还是骨架屏，会导致手势从未生效。
- **无数据占位**「—」在大字号下易被误读成装饰线，需用小字号 + 中性色渲染。
- 改动后务必跑**全量** `npm run test`，不能只看被改动的文件。

---

## 已知限制

- 无后端 / 无 AI：模拟面试的「评估」为**自评统计**，不做自动判分。
- 不支持多设备同步；换浏览器或清缓存会丢记录。
- 题库规模按 ≤500 题设计，不做虚拟滚动；列表已分页（15 条/页）。
- `validate:data` 只校验结构，**不判断主题重复**，加题后需人工过一遍同分类列表。

---

## 未实现（P2 扩展点已预留）

| 功能 | 预留位置 |
|---|---|
| 登录 / 云同步 | `src/api/dataService.js`（替换 fetch 实现即可，store 不用改） |
| 每日一题 | `src/api/dataService.js` 加 `dailyQuestion(date)`，用日期做随机种子 |
| PWA 离线 | 接入 `vite-plugin-pwa`，无需改业务代码 |
| 面试单题倒计时 | `InterviewRunView` 加计时器即可 |

---

## 分支保护需要的 status check 名称

开启分支保护时，GitHub 会要求选择「必须通过的 status check」。本项目的名称由
`job.name` + 矩阵值拼成，因此是这两个：

```
测试与构建 (20.x)
测试与构建 (22.x)
```

> 如果设置页显示 `No checks have been added`，说明仓库最近还没有过 `pull_request`
> 触发的 CI 运行（push 事件产生的 check 不会进入这个候选列表）。
> 解法：提一个 PR 让 CI 跑一次，之后就能搜到了。

