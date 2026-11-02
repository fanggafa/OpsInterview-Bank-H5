# 架构与数据流

> 说明「代码怎么组织、数据怎么流动、页面怎么协作」。
> 需求与验收见 [PRD](ops-interview-bank-PRD.md)，编码约定见 [conventions](conventions.md)。

## 技术栈与形态

| 项 | 值 |
|---|---|
| 框架 | Vue 3（`<script setup>`）+ Vite + Vue Router + Pinia |
| 语言 | 纯 JavaScript，**不引入 TypeScript** |
| 形态 | SPA，移动端优先，**无后端 / 无登录 / 无 API Key** |
| 路由 | 默认 `createWebHistory`；`VITE_ROUTER_MODE=hash` 时切 hash（GitHub Pages 等无 rewrite 的环境） |
| 部署 | 任意静态托管（GitHub Pages / Vercel / Netlify / Nginx / OSS / COS） |

> **进入二级页要带来源**：跳到 `/question/:id` 时用 `?from=<来源路径>` 传「从哪儿来的」，
> 二级页的返回按钮据此回到该页（而不是写死某个目标）。
> `from` 必须在白名单内，防止被构造成任意跳转；二级页内部再跳转时要**保留** `from`。

> **「返回」只有一种长相**：图标统一是带横线的 `←`（`d="M20 12H5M11 6l-6 6 6 6"`），
> 外观统一是**透明底 + 圆形**，只在 `:active` 给一层淡色反馈。
> 常规页用 `AppHeader`（44×44）；刷题页是 48px 紧凑顶栏，尺寸降到 32×32，
> **但底色/边框/圆角/图标必须与 AppHeader 一致** —— 同一个动作不该在不同页面长出两张脸。

> **页头一律走 `AppHeader`，不要自造**。标题样式（16px / 600 / 居中）、
> 返回按钮、右侧槽位都在那一个组件里。
>
> 曾经题库页自己写了一套 `.bank-head`（左边 20px 大标题 + 右边计数），
> 结果全站改标题样式时它没跟着变，一改就是「标题怎么只有这一页不对」。
>
> - **一级页面**（在底部 TabBar 里）用 `:back="false"`，不显示返回箭头 ——
>   没有「上一页」可回，箭头只会让人以为能退到别处。题库就属于这类。
> - 二级页面用 `back-to` 指定目标（见上一条约定）。
> - 标题文案本身不要塞进品牌名（「运维面试题库」属于 hero / 首页，不是页头）。

## 目录结构

```
ops-interview-h5/
├── docs/                       # 文档（见文末索引）
├── public/data/
│   ├── questions.json          # 题库源数据（唯一真相）
│   ├── questions-index.json    # 生成的轻量索引（6 字段，不含 tags）
│   └── answers/                # 生成的答案分片 + manifest.json
├── scripts/                    # 构建/校验/生成脚本（全部 Node .mjs）
├── src/
│   ├── api/dataService.js      # 题库加载封装（缓存 + 错误包装）
│   ├── stores/
│   │   ├── bankStore.js        # 题库数据与 loading/error/empty 三态
│   │   ├── studyStore.js       # 学习记录 / 收藏 / 进度 / 全部统计口径
│   │   └── settingsStore.js    # 主题（light | dark | system）
│   ├── router/index.js         # 9 条路由 + 守卫 + 页面 title
│   ├── views/                  # 页面（9 个 + 404）
│   ├── components/             # TabBar / AppHeader / QuestionCard / AnswerText / Pagination / Ring …
│   │   └── figures/            # 363 张内联 SVG 插图组件 + index.js 注册表
│   ├── assets/styles.css       # CSS 变量与全局样式（含深色主题）
│   └── utils/                  # 纯函数工具（见下）
├── tests/                      # vitest（48 个文件 / 791 个用例）
├── deploy/nginx.conf.snippet
├── vercel.json / netlify.toml
└── index.html
```

### `src/utils/` 职责

| 文件 | 职责 |
|---|---|
| `constants.js` | 枚举、存储 key、`PAGE_SIZE`、复习题量、连对门槛、分类顺序 |
| `storage.js` | localStorage 封装（容错 / 配额降级 / 节流落盘） |
| `format.js` | 截断、百分比、相对时间、洗牌、关键词匹配 |
| `question.js` | 题型判定（简答 / 单选 / 多选），`getType()` 带缺省回退 |
| `filter.js` | 题库筛选 + URL query 序列化 |
| `paginate.js` | 分页计算 |
| `groupByCategory.js` | 按分类分组（错题本 / 收藏共用；组顺序跟随 `CATEGORIES`） |
| `practice.js` | 刷题队列（默认随机）、断点续刷（仅顺序）、复习赛抽题 |
| `daily.js` | 每日一记（日期种子 → 稳定选题） |
| `installGuide.js` | 安装引导（UA 识别平台 → 对应步骤；含 iPadOS 伪装 macOS 的处理） |
| `pinch.js` | 看图缩放（双指 + 滚轮） |
| `gestures.js` | 滑动手势判定（轴锁定 + 阈值 + 速度） |

> **`CATEGORIES` 是分类顺序的唯一真相源**（业务优先级，非字母序）。
> 凡是要列「所有分类」的地方，都必须按它排序 —— 题库页筛选、我的页掌握度图表、
> 首页与设置页的分类相关展示、`groupByCategory` 的分组顺序都遵守这条。
> **不要**按题库遍历顺序或 id 顺序排，那会让同一批分类在两个页面上排列不同。
| `scroll.js` | 回到顶部（兼容测试环境） |

## 数据流

```
public/data/questions.json（源）
   │
   ├── npm run split:data ──► questions-index.json（列表页用）
   │                     └──► answers/<slug>.json + manifest.json（详情/刷题用）
   │
   ▼
bankStore.loadIndex()      → 列表页（首页/题库/收藏/错题/我的）
bankStore.hydrateCategory() → 在索引之上按分类补答案，得到完整题目
   │
   ▼
studyStore（records / favorites / progress）→ localStorage
```

### 两条加载路径

| 场景 | 走哪个 | 拉多少 |
|---|---|---|
| 首页 / 题库列表 / 收藏 / 错题 / 统计 | `loadIndex()` | 只有索引 |
| 题目详情 | `loadIndex()` + `hydrateCategory(该题分类)` | 索引 + 1 个分片 |
| 刷题 / 复习（指定分类） | 同上 | 索引 + 1 个分片 |
| 刷题（全部分类） | `hydrateCategory('')` | 索引 + 全部分片 |

`hydrateCategory` 有守卫：题目已带 `answer` 字段时不再请求分片
（这让测试直接注入 fixture 的模式继续有效）。

## 数据分片

首屏慢的根源是「一次拉全量题库」。列表页其实只需要
`id / type / category / difficulty / frequency / question` 这几个字段。

| 产物 | 内容 |
|---|---|
| `questions-index.json` | 列表页索引（**6 字段，不含 tags**） |
| `answers/<slug>.json` | 分类答案分片（answer / explanation / options / tags） |
| `answers/manifest.json` | 分类 → `slugs` 数组映射 + 每片题数 |

**索引不含 tags 的原因**：列表卡片与筛选都不用它，只有详情页/刷题页显示标签，
而那两个场景本来就要拉答案分片。它曾占索引原始体积约 100 KB，是首屏最大的单笔开销。
代价是**搜索只匹配题干**。

**大分类自动拆片**：`scripts/split-data.mjs` 的 `SPLIT_THRESHOLD = 180 KB`，
超过阈值的分类切成 `<slug>-1` / `<slug>-2`。manifest 统一用 **`slugs` 数组**
（单分片时也是数组），前端 `hydrateAnswers` 并行拉取后合并。

**首屏预算**：`索引 + 最大分片` 的 gzip 总量必须 < 220 KB，
由 `tests/splitData.test.js` 守住。题量继续增长时先看这条。

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
- **掌握率只算简答题，选择题单独算正确率** —— 两者的「会」含义不同，混在一起会让数字失真。
- 错题本**由 `inWrong` 标记驱动**：答错 / 自评「不会」进入，之后任意方式连续答对 **3** 次才移出。
- 未知 id 保留在 localStorage（便于题库回滚），但不参与统计与列表展示。

**这三个指标必须在 `studyStore` 的 getters 里算，不允许各地各算。**

## 本地存储

| key | 结构 |
|---|---|
| `oi_records` | `{ [id]: { status: "know"\|"unknown", times, lastReviewed, streak, inWrong } }` |
| `oi_favorites` | `[id, ...]`（按收藏先后 push，展示倒序） |
| `oi_settings` | `{ theme: "light"\|"dark"\|"system", studyMode }` |
| `oi_progress` | `{ mode, studyMode, category, index, updatedAt }`（**仅顺序模式写**） |

### sessionStorage（会话级，关标签页即清）

| key | 结构 | 用途 |
|---|---|---|
| `oi_practice_session` | `{ review, mode, studyMode, category, ids, cursor, roundAnswers, startedAt, elapsedSec, remainSec }` | 刷题进行中快照：**刷新不丢**题组 / 当前位置 / 作答（每日一刷另含倒计时） |

**普通刷题与每日一刷共用这一份快照**。

> 早先只有每日一刷存快照，普通刷题刷新后会重新 `buildQueue` —— 随机模式下就是
> 「换了一批题」，用户抱怨的「刷新题目变了」正是这个。

恢复条件是**严格匹配**：`review` / `mode` / `studyMode` / `category` 四项全一致才恢复，
否则宁可重抽也不串味（比如用户换了模式或分类）。

另外两个容易踩的点：

- **抽完题要立刻写一次快照**：不写的话，新题组要等第一次作答才落盘，这中间刷新就丢题
- **「已退出」后不再写快照**：`doExit()` 先清快照，但紧接着的 `router.replace` 会让
  `build()` 重跑、把刚清掉的写回来 —— 用一个 `exited` 标记挡住

**为什么用 sessionStorage 而不是 localStorage**：这个快照只该活在当前标签页。
用 localStorage 的话第二天打开还是昨天的题，等于把「一次性自测」变成「跨天续做」。

存储封装在 `storage.js` 里另开一套（`readSessionJSON` / `writeSessionJSON` / `removeSessionJSON`），
容错策略与 localStorage 版一致（解析失败回退并清脏数据）。

- 写入采用 ≥200ms 节流，并在 `visibilitychange(hidden)` / `pagehide` 时强制落盘。
- JSON 损坏自动回退默认值并清理脏数据；配额超限时静默降级，不阻塞使用。
- `streak` / `inWrong` 是后加字段：`normalizeRecord()` 读取时补齐，
  旧数据按「最近一次是否答错」推断 `inWrong` —— 升级后错题本不会被凭空清空。

## 安全设计

**全程不使用 `v-html`**：

- 插图按**白名单 id** 取 Vue 组件渲染
- 文本片段走普通插值（Vue 自动转义）
- 答案走「白名单语法」解析成真实 DOM 块（标题/列表/表格/代码块/引用）

因此题库内容（哪怕被人恶意改动）无法注入脚本。

## 渲染：答案的结构化排版

答案不是一堆纯文本，而是按白名单语法解析成 DOM 块：

| 写法 | 渲染结果 | 用途 |
|---|---|---|
| `# 标题` ~ `######` | 带层级标题块 | 分段小标题 |
| `- 项` / `* 项` | 真 `<ul>` | 要点罗列 |
| `1. 项` | 真 `<ol>` | 有先后的步骤 |
| 两空格缩进的 `- 项` | 二级缩进 | 子要点 |
| `\| 表头 \|` + `\|---\|` + 数据行 | **真 `<table>`** | 对照表（最常用） |
| ` ```lang ` 围栏 | `<pre><code>` | 命令、配置、代码 |
| `**强调**` | `<strong>` | 关键结论 |
| `` `行内代码` `` | 等宽高亮 | 命令、参数 |
| `---` | 分隔线 | 分节 |
| `> 引用` | 引用块 | 补充说明 |

**两条硬性约束**（`npm run validate:data` 会拦）：

1. **代码围栏必须成对闭合** —— 少一个会把后面的正文全吞进代码块
2. **表格必须有分隔行**（第二行 `|---|---|`）—— 缺了会渲染成一长串 `|`

这两类错误在 JSON 里肉眼难发现，但页面上会表现为「文字挤成一条 / 竖线外露」，所以交给脚本兜住。

## 状态管理与组件协作

```
settingsStore ──► <html data-theme> ──► CSS 变量（含插图配色）
bankStore     ──► 题目数据 ──► views/components
studyStore    ──► 记录/收藏/进度 ──► 统计 getters ──► 首页与「我的」
```

**答题结果统一映射到 `know` / `unknown`**，所以错题本、今日已刷数无需按题型特殊处理。

## 文档索引

| 文档 | 职责 |
|---|---|
| [PRD](ops-interview-bank-PRD.md) | 需求规格、功能边界、验收标准 |
| **本文** | 架构、数据流、存储、统计口径 |
| [conventions](conventions.md) | 编码约定、测试要求、提交与 PR 规范 |
| [deployment](deployment.md) | 部署、CI、PWA、故障速查 |
| [question-authoring](question-authoring.md) | 出题格式、编号段、校验规则 |
| [figure-authoring](figure-authoring.md) | 插图 SVG 规范、颜色变量、修溢出 |
| [figures-registry](figures-registry.md) | 363 张插图完整注册表 |
