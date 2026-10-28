# 运维面试题库 H5（OpsInterview Bank）

面向运维工程师的面试题库刷题工具：手机浏览器 / 微信内打开，利用碎片时间背题自测。

- 技术栈：Vue 3 + Vite + Vue Router + Pinia（纯 JavaScript，无 TypeScript）
- 形态：SPA，移动端优先，**无后端、无登录、无 API Key**，可部署到任意静态托管
- 题库：**1430 题**（726 简答 + 537 单选 + 167 多选），23 个分类；含 **21 张内联 SVG 图解**（24 题带图）
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
| `npm run test` | 运行 vitest（30 个文件 / 570 个用例） |
| `npm run validate:data` | 校验题库结构（枚举 / id / 题数 / 字段） |
| `npm run check:encoding` | 编码守卫（防中文被写坏，见[编码守卫](#编码守卫)） |
| `npm run verify` | **提交前跑这个**：编码 + 题库 + 测试 + 构建 全流程 |

环境要求：Node.js ≥ 18。

部署到子目录时用 `BASE_PATH=/子目录/ npm run build`（详见[部署](#部署)第 3 节）。

---

## 功能一览

| 页面 | 说明 |
|---|---|
| `/` 首页 | 总进度环、简答掌握率 / 选择题正确率、刷题与面试快捷入口、分类进度、继续上次（跳刷题页） |
| `/bank` 题库 | 分类（默认折叠）+ 频率 + 难度筛选、防抖搜索、分页（10 条/页，页码进 URL） |
| `/question/:id` | 简答折叠答案 + 自评；选择题选项判定 + 解析 |
| `/practice` | **刷题 / 背题两种练习模式** + 顺序 / 随机 / 错题三种队列模式，滑动 + 键盘，断点续刷，完成小结 |
| `/interview` | 题数 + 分类范围 → 答题 → 自评评估（得分 / 正确率 / 薄弱分类 / 逐题回顾） |
| `/stats` | 双指标、分类条形图、错题与收藏入口 |
| `/wrong` `/favorites` | 错题本（实时派生）、收藏（倒序），均分页 |
| `/me` | 数据概览、快捷入口、主题三态、**默认练习方式**、清空数据、关于 |

一共 12 条路由，含 404。

### 底部导航栏

5 个一级页签：**首页 / 题库 / 刷题 / 统计 / 我的**。

- **首页必须在底部栏里**：早先版本只有 4 项（不含首页），从首页进到其他 Tab 后底部栏没有回首页的入口，只能靠浏览器后退——在 PWA/微信里体验很差。
- 沉浸式页面（`/practice`、`/interview/run`）不显示底部栏，它们要占满整屏。
- 二级页面通过路由 `meta.parent` 让所属 Tab 保持高亮（如 `/question/:id` 高亮「题库」）。

### 主题切换

- **首页右上角按钮：点一下直接切浅色/深色**（不再跳「我的」页再选）。
  按钮图标随状态变化：深色下显示太阳、浅色下显示月亮，`aria-label` 同步说明「切换到浅色/深色主题」。
- `/me` 页保留三态选择（浅色 / 深色 / 跟随系统）——「跟随系统」只能在设置里选，快捷按钮只在明暗之间切。
- 主题通过 `<html data-theme>` + CSS 变量驱动，切换时同步 `theme-color` meta。

---

## 目录结构

```
ops-interview-h5/
├── docs/ops-interview-bank-PRD.md   # 产品需求文档
├── public/data/questions.json       # 题库（1430 题）
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
├── tests/                           # vitest（30 个文件 / 570 个用例）
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

题库共 **1430 题**：726 道简答题 + 537 道单选题 + 167 道多选题，分布在 23 个分类中。

### 当前进度

**23 个分类全部达标**（按题量降序）：

| 分类 | 总题数 | 简答 | 单选 | 多选 | 目标 |
|---|---|---|---|---|---|
| 综合场景题 | **81** | 70 | 3 | 8 | 80 ✅ |
| 网络基础 | **64** | 45 | 10 | 9 | 50 ✅ |
| Shell脚本 | **62** | 45 | 9 | 8 | 50 ✅ |
| 容器与K8s | **62** | 38 | 13 | 11 | 60 ✅ |
| Linux基础 | **60** | 40 | 10 | 10 | 50 ✅ |
| MySQL | **50** | 32 | 10 | 8 | 50 ✅ |
| Redis | **50** | 32 | 10 | 8 | 50 ✅ |
| 监控告警 | **50** | 35 | 8 | 7 | 50 ✅ |
| CI/CD | **46** | 34 | 6 | 6 | 45 ✅ |
| MongoDB | **41** | 24 | 9 | 8 | 40 ✅ |
| 消息队列 | **41** | 23 | 10 | 8 | 40 ✅ |
| 日志与ELK | **41** | 29 | 6 | 6 | 40 ✅ |
| 自动化与配置管理 | **41** | 31 | 4 | 6 | 40 ✅ |
| 云与高可用 | **41** | 30 | 4 | 7 | 40 ✅ |
| 安全与跳板机 | **40** | 32 | 2 | 6 | 40 ✅ |
| LVS/HAProxy | **40** | 24 | 9 | 7 | 40 ✅ |
| 存储与备份 | **40** | 28 | 6 | 6 | 40 ✅ |
| DNS | **35** | 19 | 9 | 7 | 35 ✅ |
| iptables/firewalld | **35** | 22 | 7 | 6 | 35 ✅ |
| Nginx | **35** | 22 | 7 | 6 | 35 ✅ |
| Tomcat/JVM | **35** | 21 | 8 | 6 | 35 ✅ |
| 虚拟化 | **35** | 27 | 2 | 6 | 35 ✅ |
| Git/GitLab | **35** | 23 | 5 | 7 | 35 ✅ |

**待填充：无。** `scripts/pending-categories.mjs` 的白名单已清空，
校验器现在要求「23 个分类全部有题」——这是题库建设的完成态。

### 频率分布的口径

`frequency` 表示**「面试被问到的频率」**，与 `difficulty` 是两个正交维度：
难题也可能是高频考点（如「ES 堆内存怎么配」「RAID 怎么选」），
简单题也可能只是偏门小知识。

每个分类内的分布目标为 **高频 40% / 中频 40% / 低频 20%**，
依据是「必问题约占 4 成、会问但不一定约 4 成、偏门/深入追问才涉及约 2 成」。

> ⚠️ **不要把 difficulty 机械映射成 frequency**。批 8 曾用「简单→高频、中等→中频、
> 困难→低频」的规则自动填充，结果低频只剩 32 题（完全无法用于筛选），
> 中频被塞进 516 题。频率必须按「题目主题的实际热度」判断。

### 分类与编号段

题目按分类**分段编号**，避免未来插题重排 id 打乱用户学习记录：

| 分类 | id 段 | 分类 | id 段 |
|---|---|---|---|
| 早期题目（各分类） | 1 – 119 | DNS | 1000 – 1199 |
| iptables/firewalld | 1200 – 1399 | Nginx | 1400 – 1599 |
| LVS/HAProxy | 1600 – 1799 | Tomcat/JVM | 1800 – 1999 |
| MongoDB | 2000 – 2199 | 消息队列 | 2200 – 2399 |
| 存储与备份 | 2400 – 2599 | 虚拟化 | 2600 – 2799 |
| Git/GitLab | 2800 – 2999 | 日志与ELK | 3000 – 3199 |
| 自动化与配置管理 | 3200 – 3399 | 云与高可用 | 3400 – 3599 |
| MySQL（扩充） | 3600 – 3799 | Redis（扩充） | 3800 – 3999 |
| Linux基础（扩充） | 4000 – 4199 | Shell脚本（扩充） | 4200 – 4399 |
| 网络基础（扩充） | 4400 – 4599 | 容器与K8s（扩充） | 4600 – 4799 |
| CI/CD（扩充） | 4800 – 4999 | 监控告警（扩充） | 5000 – 5199 |
| 安全与跳板机（扩充） | 5200 – 5399 | 综合场景题（扩充） | 5400 – 5599 |

> 编号段定义在 `scripts/merge-batch.mjs` 的 `ID_RANGES`，新增分类时在此登记。

### 分批合并（推荐方式）

大批量加题时不要直接改 `questions.json`，而是：

```bash
# 1. 把题目写到 scripts/batchN-xxx.json（数组格式）
# 2. 合并进主库（按 id 去重、校验分类与编号段）
node scripts/merge-batch.mjs scripts/batch1-dns.json scripts/batch1-nginx.json

# 3. 校验
npm run validate:data
```

合并脚本会拦住：分类不在枚举内、id 超出该分类的编号段、id 重复（自动跳过）。

分批施工期间，尚未填充的分类登记在 `scripts/pending-categories.mjs`，
校验脚本对它们只提示不报错；**每完成一批就从该文件删掉对应项**，全部删完代表题库完备。

### 编写题目时的质量要求

1. **简答题力求简短易记**：答案控制在能「直接背诵」的长度，要点分行、用短句，避免长篇大论
2. **简答与选择考不同知识点**：同一分类下，简答题讲原理/流程，选择题考点细节/命令/参数，不要互相改写凑数
3. **答案可带 `**强调**`**：标出最关键的词（渲染层支持粗体）
4. **可用 `[[图:id]]` 插图**：流程/链路/对比类题目建议配图（见「答案插图」一节）
5. **必须可验证**：涉及命令、参数、阈值的，写在主流稳定版本范围内，避免强依赖易变细节
6. **`difficulty` 与 `frequency` 是两个独立字段**：前者是「难度」（简单/中等/困难），后者是「考察频率」（高频/中频/低频）。批量生成时极易把「困难」误填进 `frequency`——`npm run validate:data` 会拦下，别手改绕过校验。

> 实测教训：`difficulty` 误填入 `frequency` 的问题在第五、六、七批各出现过一次（分别 14、6、11 题），全部由校验脚本拦下。写题时建议先把两个字段分开列清楚再合并。

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

- 每页 **10 条**（改 `src/utils/constants.js` 的 `PAGE_SIZE` 全局生效）。
  10 条约 3-4 屏，扫一遍就能到底；15 条时要滚很久才见底，容易误以为「列表只有这些、没有下一页」。
- 分页控件**吸底固定**，滚到任何位置都能翻页，不必先滚回顶部。
- 只在**超过一页**时出现；不足一页完全不显示，避免多余 UI。
- 题库页码写进 URL（`/bank?category=MySQL&page=2`），刷新与浏览器后退都能恢复；切换筛选重置回第 1 页。
- 错题本/收藏页在条目减少（答对移出、取消收藏）导致页码越界时，自动收敛到有内容的页。
- 统计页与面试评估页较长，提供悬浮「回到顶部」按钮。

---

## 练习模式（刷题 / 背题）

`/practice` 进入时先出一个**模式选择面板**，选完收起，把整屏让给题卡。

| 模式 | 题库范围 | 适合 |
|---|---|---|
| **刷题模式**（`practice`） | 全部题（简答 + 选择） | 常规复习 |
| **背题模式**（`memorize`） | **只有简答题** | 考前反复背答案 |

### 为什么区分两种模式

选择题考「记住细节」，简答题考「能自己讲出来」。考前冲刺时很多人只想反复过简答题的答案，
不需要每道选择题都点选项。两个模式共用同一套自评/判定逻辑，只是**队列不同**。

### 面板上还有什么

- **题目顺序**：顺序 / 随机（队列模式，`mode` 参数）
- **继续上次**：从上次位置接着刷，文案带「刷题/背题 · 分类 · 第 N 题」
- **直接开始**：跳过选择立刻开刷

### 关键设计

- **`studyMode` 参与续刷判定**：换了练习模式就不算「同一批题」，会从头开始
  （`resolveStartIndex` 同时比对 `mode`、`studyMode`、`category` 三项）。
- **`studyMode` 会存进 progress**（`saveProgress` 一并写入），否则「继续上次」无法恢复上次在练什么。
- 首页的「开始刷题」与「继续上次」**统一跳 `/practice`**，不再预置 `mode` / `category`——
  具体怎么练由刷题页的面板决定，避免「点进去还要再选一次」。
- `/me` 页可设置**默认练习方式**（存 `oi_settings.studyMode`）。

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
/bank?category=MySQL&frequency=高频&difficulty=困难&q=index&page=2
```

- `category` / `frequency` / `difficulty` 非法值会被忽略并回退为「全部」（防止手改 URL 出现异常状态）。
- 搜索 300ms 防抖，匹配范围：题干 + 答案 + 标签 + 选项 + 解析，忽略大小写。
- 列表滚动位置存 `sessionStorage`，从详情页返回时恢复。

### 三个筛选维度

| 维度 | 选项 | 说明 |
|---|---|---|
| **分类** | 全部 + 23 个分类 | **默认折叠**，只显示前 7 个，点「展开全部 23 个分类」再显示其余 |
| **频率** | 全部 / 高频 / 中频 / 低频 | 单行平铺 |
| **难度** | 全部 / 简单 / 中等 / 困难 | 单行平铺，与频率同构 |

**分类为什么要默认折叠**：23 个分类平铺要占 5-6 行，把搜索框和列表挤到很下面，首屏几乎看不到题目。折叠后首屏直接看到题目。

折叠的几条细节：

- 用**限制数量**（前 7 个）而不是 CSS 限高——胶囊宽度随屏幕变化（375px 与 480px 一行能放的个数不同），限高在不同机型下折叠效果不一致。
- **选中的分类一定可见**：若选中项落在被折叠的那批里，会把它补到最前面，避免「选中了却看不见自己的选择」。
- 折叠时按钮上提示 **「已筛选 N 项」**，提醒还有生效中的条件没展开看。
- 分类数 ≤ 7 时**不出现**展开按钮（没有需要展开的东西）。

---

## 「我的」页

- **数据概览**：总进度环 + 已刷题 / 掌握率 / 正确率 / 今日四格，点格子跳对应页面。
- **快捷入口**：开始刷题、背题模式、错题本、收藏（带数量角标）。
- **外观**：浅色 / 深色 / 跟随系统。
- **默认练习方式**：刷题 / 背题（存 `oi_settings.studyMode`，进刷题页时默认选中）。
- **数据管理**：清空学习记录 / 清空收藏，**用页内确认条**（见下）。
- **关于**：版本、存储方式、题库规模。

### 为什么二次确认一律用页内确认条，而不是 `window.confirm`

这一页曾出现「**点了清空按钮完全没反应**」的 bug，根因是用了 `window.confirm`：

- 微信内置浏览器（X5 内核）会**静默返回 `false`** 或干脆不弹窗；
- 部分安卓 WebView、「禁止弹窗」的浏览器设置下同样失效；
- 表现就是「点击无反应」——没有报错、没有提示，用户以为是按钮坏了。

修复：改成**页内确认条**（渲染在 DOM 里，`role="alertdialog"`），任何环境下都能显示与点击。

**这条规则已推广到全项目**，四处二次确认全部改掉：

| 位置 | 确认内容 |
|---|---|
| `/me` | 清空学习记录 / 清空收藏 |
| `/favorites` | 全部取消收藏 |
| `/interview/run` | 退出面试 |

细节：

- 同一时间只展开一个确认条（避免两个确认条同时铺开）；
- 没有收藏时「清空收藏」按钮**禁用**，不会弹空确认；
- 清空成功后弹一个 1.8 秒的轻提示（`.toast`），给出明确反馈；
- `tests/no-native-confirm.test.js` 会**扫描整个 src 目录**，一旦再出现 `window.confirm(` 或裸 `confirm(` 调用就失败——防止回退。

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

## 如何改代码（含 PR 流程）

`main` 分支**已开启保护**，直推会被服务器拒绝：

```
GH006: Protected branch update failed for refs/heads/main.
- Changes must be made through a pull request.
- 2 of 2 required status checks are expected.
```

所以任何改动都必须走 PR。完整流程：

### 1. 从最新 main 开分支

```bash
git checkout main
git pull                      # 确保基于最新代码
git checkout -b feat/你的改动  # 分支名：feat/ / fix/ / docs/ / chore/
```

分支命名建议：

| 前缀 | 用于 |
|---|---|
| `feat/` | 新功能，如 `feat/daily-question` |
| `fix/` | 修 bug，如 `fix/gesture-swipe` |
| `docs/` | 文档 |
| `chore/` | 工程配置、依赖升级 |
| `content/` | 题库内容增删改，如 `content/add-mysql-questions` |

### 2. 改代码

常用命令：

```bash
npm run dev          # 本地开发（http://127.0.0.1:5273）
npm run test:watch   # 改代码时持续跑测试
```

### 3. 提交前必须验证

```bash
npm run verify
```

这一条命令依次执行：编码检查 → 题库校验 → 全部测试 → 生产构建。
**任一环节失败都不要提交**。CI 里跑的是同样的检查，本地能过 CI 才可能过。

如果是 UI 改动，还应在浏览器里把宽度切到 **375px** 看一眼（含深色模式）。

### 4. 提交并推送分支

```bash
git add -A
git commit -m "feat: 一句话说明改了什么"
git push -u origin feat/你的改动
```

> ⚠️ 不要 `git push origin main`，会被拒绝。

### 5. 提 PR 并等待 CI

推送后打开仓库页面，GitHub 会提示 **Compare & pull request**，点进去创建。

PR 描述模板已配置好（`.github/pull_request_template.md`），按模板填即可。

创建后 `CI` 工作流自动运行，**必须等两个 check 都变绿**：

```
测试与构建 (20.x)
测试与构建 (22.x)
```

未通过时 Merge 按钮是灰的。

### 6. 合并

两个 check 全绿后点 **Merge pull request**。

- 选 **Squash and merge**（推荐）：把分支上的多个提交压成一个，main 历史更清晰
- 合并后 GitHub 会提示删除分支，可以放心删

> ⚠️ **单人仓库必须关掉 Require approvals**。
> 如果分支保护勾了 `Require approvals: 1`，PR 会永久卡在
> `Review required — At least 1 approving review is required`，
> 因为 GitHub **不允许自己批准自己的 PR**。
>
> 正确配置（单人开发）：
>
> | 选项 | 设置 |
> |---|---|
> | Require a pull request before merging | ✅ 开 |
> | Require approvals | ❌ **关**（或设为 0） |
> | Require status checks to pass | ✅ 开（选两个 `测试与构建`） |
> | Require branches to be up to date | ✅ 开 |
>
> 这样既能保证「改 main 必须走 PR + CI 必须绿」，又不会被审批卡死。
> 等以后有第二个协作者时，再把 Require approvals 打开。

### 7. 合并后自动发生什么

| 触发 | 结果 |
|---|---|
| 合并进 `main` | `CI` 再跑一遍（验证合并后的代码） |
| 合并进 `main` | `Deploy to GitHub Pages` 自动部署，约 1 分钟后线上更新 |

线上地址：https://fanggafa.github.io/OpsInterview-Bank-H5/

### 8. 同步本地

```bash
git checkout main
git pull
git branch -d feat/你的改动   # 删除已合并的本地分支
```

### 常见情况处理

| 情况 | 处理 |
|---|---|
| CI 失败，但本地能过 | 看 Actions 里具体哪一步失败；常见是忘记 `git add` 某个新文件 |
| 想改已推送的 PR | 直接在分支上继续提交并 push，PR 会自动更新 |
| PR 显示 `This branch has conflicts` | 本地 `git pull origin main` 解决冲突后 push |
| check 列表里搜不到这两项 | 需要一次 `pull_request` 触发的运行，提任意 PR 跑一次即可 |
| **CI 全绿但 Merge 按钮灰、提示 `Review required`** | 单人仓库勾了 Require approvals，而 GitHub 不允许自审。去 Settings → Branches 取消 **Require approvals** |
| 实在要紧急改 main | 不建议。若确有需要，临时关闭分支保护 → 改完立即重新开启 |

### 题库内容的改动

题库改动走同样的 PR 流程，但额外注意：

1. 编辑 `public/data/questions.json`
2. 跑 `npm run validate:data`（`verify` 已包含）
3. **人工检查同分类下是否与其他题重复知识点**——脚本查不出这个
4. 简答题和选择题应是**不同考点**，不要把简答题改写成选项凑数

---

## 答案插图（图表能力）

部分简答题的参考答案里带**内联 SVG 图解**，用来表达流程、链路、优先级对比这类文字难说清的内容。

### 怎么用

在 `answer` 字段里写标记即可：

```json
{
  "answer": "按先后顺序共 5 步：\n\n1. 浏览器缓存\n2. /etc/hosts\n\n[[图:dns-resolve]]\n\n一句话记：缓存越靠前越快。"
}
```

渲染时 `[[图:id]]` 会被替换成对应的 SVG 组件，其余部分由 `AnswerText.vue` 做**结构化渲染**。

### 答案支持的结构化排版

答案不是一堆纯文本，而是按「白名单语法」解析成真实 DOM 块（依然全程 `v-html` free）：

| 写法 | 渲染结果 | 用途 |
|---|---|---|
| `# 标题` ~ `######` | 带层级的标题块 | 分段小标题 |
| `- 项` / `* 项` | 真 `<ul>`，圆点徽标 | 要点罗列 |
| `1. 项` | 真 `<ol>`，序号徽标 | 有先后的步骤 |
| 两空格缩进的 `- 项` | 二级缩进 | 子要点 |
| `\| 表头 \|` + `\|---\|` + 数据行 | **真 `<table>`**，带斑马纹与对齐 | 对照表（最常用） |
| ` ```lang ` 围栏 | `<pre><code>` 带语言标签 | 命令、配置、代码 |
| `**强调**` | `<strong>` 加粗 | 关键结论 |
| `` `行内代码` `` | 等宽高亮 | 命令、参数、配置项 |
| `---` | 分隔线 | 分节 |
| `> 引用` | 引用块 | 补充说明 |

**两条硬性约束**（写题时必须遵守，`npm run validate:data` 会拦）：

1. **代码围栏必须成对闭合**——少一个 ``` 会把后面的正文全吞进代码块
2. **表格必须有分隔行**（第二行 `|---|---|`）——缺了竖线会被当普通段落，渲染成一长串 `|`

这两类错误在 JSON 里肉眼难发现，但页面上会表现为「文字挤成一条 / 竖线外露 / 顺序错乱」，所以交给校验脚本兜住。

### 已注册的插图（21 张）

| id | 内容 | 用在哪 |
|---|---|---|
| `dns-resolve` | DNS 解析链路（5 步流程） | 题 1001、1005 |
| `dns-record-types` | DNS 记录类型对照表 | 题 1002 |
| `iptables-chain-flow` | iptables 五链数据包流向 | 题 1201 |
| `nginx-location-match` | Nginx location 匹配优先级 | 题 1401 |
| `nginx-proxy-pass` | proxy_pass 斜杠差异对比 | 题 1402 |
| `raid-levels` | RAID 0/1/5/6/10 容量与容错对比 | 题 2400 |
| `backup-321` | 备份 3-2-1 原则与勒索时代的补充 | 题 2401 |
| `mysql-replication-flow` | MySQL 主从三线程与复制延迟 | 题 3606 |
| `es-shard-replica` | ES 分片副本分布与 green/yellow/red | 题 3003 |
| `multi-az-arch` | 多可用区架构与「伪双活」断点 | 题 3404 |
| `k8s-rolling-update` | K8s 滚动更新与三种探针 | 题 47 |
| `tcp-handshake` | 三次握手/四次挥手、半连接队列、TIME_WAIT | 题 16 |
| `lvs-modes` | LVS 四种转发模式对比 | 题 1601 |
| `redis-persistence` | RDB/AOF 对比与淘汰策略 | 题 34 |
| `monitor-layers` | 监控四层指标与只看资源的盲区 | 题 54 |
| `container-vs-vm` | 容器与虚拟机的隔离层次 | 题 41 |
| `cpu-bottleneck-tree` | CPU 高时按 us/sy/wa/st/si 定位 | 题 6 |
| `jvm-memory-areas` | JVM 内存区域与四种 OOM 对照 | 题 1801、1821 |
| `mq-delivery` | 消息在三段链路上的丢失与重复 | 题 2203、2215 |
| `mongo-replica-shard` | 副本集高可用 vs 分片水平扩展 | 题 2011 |
| `deploy-strategies` | 滚动/蓝绿/灰度三种发布策略 | 题 49 |

> 图的实际数量以 `FIGURES` 为准，`tests/figures.test.js` 会双向校验：
> **题库引用的 id 必须已注册**，**注册的 id 必须至少被一题用到**（防止死代码与拼错）。
> 选择题的图放在 `explanation` 里（`answer` 是选项数组，没有位置），测试同时扫描这两个字段。

### 新增一张插图

1. 在 `src/components/figures/` 下新建 `.vue` 组件（照抄现有文件的结构）
2. 在 `src/components/figures/index.js` 的 `FIGURES` 里登记一行
3. 在题目答案里写 `[[图:你的-id]]`（选择题写到 `explanation` 里）

**id 只允许小写字母、数字和连字符**（正则 `[a-z0-9-]+`）。写错或未注册的 id 会原样显示成文本，不会注入任何 HTML。

### 插图设计约定

- **必须能表达「文字难说清」的东西**：流程、链路、优先级、对比、状态机。不要为了配图而配图。
- 每张图配 **一句结论式 `figcaption`**，写明「这张图想让人记住的判断」。
- SVG 里的文字要**短**（单行不超过 ~30 个全角字符），否则窄屏会溢出。
- 用 `--fig-node-a/b/c/d` 四个语义色区分层次，**不要用 `currentColor`**（深色主题下全灰看不清）。
- **图不要塞进选择题**——选择题的答案位是选项 key，图只能进解析，靠 `explanation` 开头。

### 安全设计（重要）

**全程不使用 `v-html`**：

- 插图按**白名单 id** 取 Vue 组件渲染
- 文本片段走普通插值（Vue 自动转义）
- 因此题库内容（哪怕被人恶意改动）无法注入脚本

### 插图配色规范

插图不使用 `currentColor`（全灰看着伤眼），而是用一组语义变量，深浅色各一套：

| 变量 | 用途 |
|---|---|
| `--fig-bg` | 插图容器渐变背景 |
| `--fig-stroke` | 容器描边、分隔虚线 |
| `--fig-node-a` / `-b` / `-c` / `-d` | 四类节点配色（蓝 / 紫 / 青绿 / 橙） |
| `--fig-text` / `--fig-muted` | 正文 / 次要文字 |

四个节点色在深色主题下会自动提亮（见 `styles.css` 的 `[data-theme='dark']` 段）。

### 画图注意事项（踩过的坑）

1. **容器样式用 `@import './figure-base.css'`**，那个文件是纯 CSS，**不能带 `<style>` 标签**——
   带了会让整个 CSS 解析失败，插图页面直接白屏报 `Unknown word </style>`。
2. **文字要与色点留出间距**：类型名若用 `text-anchor="middle"` 居中，长单词（如 CNAME）会压到左侧色点上。
   改为左对齐并显式指定 x 坐标。
3. **不要给单个节点加大面积色块**：深色主题下会变成一大团暗色遮挡邻居文字，用细竖线表达"包含多个子步骤"更清晰。
4. **Vue 模板里写 `{` 要加 `v-pre`**，否则 `location /api/ {` 会被渲染成 `{'{'}`。

---

## 视觉配色体系

为避免整站一片蓝灰，引入了一套语义化配色变量（定义在 `src/assets/styles.css`）。

### 1. 分类色板

23 个分类各有专属色，映射在 `src/utils/constants.js` 的 `CATEGORY_HUE`：

```js
export const CATEGORY_HUE = {
  DNS: 'indigo',
  Nginx: 'emerald',
  Redis: 'rose',
  // …省略
}
export function categoryColor(category) // 返回 var(--hue-xxx)
```

用途：
- **首页分类卡片**：左侧色点 + 进度条按分类上色
- **题库列表卡片**：卡片左侧 3px 色条 + 分类徽标上色
- **统计页条形图**：每行进度条按分类上色

新增分类时要：① 在 `CATEGORIES` 加名称 ② 在 `CATEGORY_HUE` 登记颜色键。未登记的分类会退化为主色。

### 2. 渐变与光效

| 变量 | 用途 |
|---|---|
| `--grad-hero` | 首页主卡渐变（蓝→紫） |
| `--grad-indigo` / `--grad-teal` | 快捷入口图标底色（刷题 / 面试） |
| `--grad-card` | 卡片淡色渐变底（"继续上次"） |
| `--shadow-lift` | 强调元素的浮起阴影 |

深色主题下渐变会**自动降饱和**，避免刺眼。

### 3. 组件可覆写变量

部分组件暴露了 CSS 变量供外层定制：

| 组件 | 变量 | 说明 |
|---|---|---|
| `Ring` | `--ring-hole-bg` | 环内圈背景（首页在渐变卡上用白色） |
| `Ring` | `--ring-color` / `--ring-track` | 进度色 / 轨道色 |
| `QuestionCard` | `--qcard-hue` | 卡片左侧色条与分类徽标颜色 |

### 4. 答案排版色（`AnswerText` 专用）

答案解析成表格 / 代码块后需要独立的语义色，深浅主题各一套：

| 变量 | 用途 |
|---|---|
| `--c-code-bg` / `--c-code-head` / `--c-code-border` | 代码块底色 / 语言标签条 / 描边 |
| `--c-code-text` | 代码文字色 |
| `--c-table-head` / `--c-table-line` / `--c-table-zebra` | 表头底 / 分隔线 / 斑马纹 |
| `--c-answer-bg` / `--c-answer-border` | 答案卡底色与描边 |

配色原则：**代码块用中性冷灰、表格用极淡主色斑马纹**，让「对照表」和「命令行」在视觉上能一眼区分，同时不抢正文注意力。

---

## 开发笔记

- **主题**通过 `<html data-theme="light|dark">` + CSS 变量驱动，组件里不写死颜色。
- **深色对比度**经实测：23 个文字元素的对比度最低 5.09，全部 ≥ WCAG AA 的 4.5。
  改颜色时注意 `--c-text-3` 在深色下不能低于 `#8E8E8E`。
- **手势**绑定用 `watch(stageRef, { flush: 'post' })` 而非 `onMounted`——
  卡片在异步加载后才渲染，`onMounted` 时 DOM 还是骨架屏，会导致手势从未生效。
- **无数据占位**「—」在大字号下易被误读成装饰线，需用小字号 + 中性色渲染。
  若该元素用渐变文字（`-webkit-text-fill-color: transparent`），空态必须显式重置，否则「—」会消失。
- **答案一律走 `AnswerText` 渲染**，不要再写 `<pre>{{ answer }}</pre>`。
  纯 `<pre>` 会把 Markdown 表格渲染成一长串 `|`、把列表渲染成挤在一起的行——
  这正是「文字排序错乱」的根因。`AnswerText` 把答案解析成表格/列表/代码块的真实 DOM，
  并且新增了 `validate:data` 的围栏成对与表格分隔行检查兜底。
- **路由模式**由 `VITE_ROUTER_MODE` 控制：默认 history（需 rewrite），
  `hash` 用于 Pages 等无 rewrite 环境。不要为部署改源码。
- **`.chip` 这类胶囊一律要 `min-width: 0`**：flex 子项默认 `min-width:auto`，
  内容比容器宽时不会收缩，文字会直接溢出边框。分类胶囊因此踩过坑（见下条）。
- **分类筛选不要用固定列宽 grid**：分类名长度差得远（`MySQL` 5 字符 vs
  `iptables/firewalld` 19 字符），`grid-template-columns: minmax(104px, 1fr)`
  会让长名字撑破胶囊。改用 `flex-wrap` + 每个胶囊按内容自适应宽度。
  `tests/chip-overflow.test.js` 会检查这条不被回退。
- 改动后务必跑**全量** `npm run test`，不能只看被改动的文件。

---

## 已知限制

- 无后端 / 无 AI：模拟面试的「评估」为**自评统计**，不做自动判分。
- 不支持多设备同步；换浏览器或清缓存会丢记录。
- 题库规模按 ≤1000 题设计，不做虚拟滚动；列表已分页（10 条/页）。
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

