# 项目：运维面试题库 H5 应用（OpsInterview Bank）

> 版本：v1.3　修订说明：v1.2 基础上新增**题型体系**（简答题 / 单选题 / 多选题）、选择题判定与统计口径（掌握率仅统计简答题）、移动端布局密度规范（沉浸式刷题页 + 紧凑列表）。

## 一、项目概述

开发一个面向运维工程师（Linux / 网络 / 数据库 / 云原生 / DevOps）的面试题库 H5 应用，
帮助用户利用碎片时间（手机浏览器、微信内打开）刷题、背诵、自测。

- 技术栈：**Vue 3 + Vite + Vue Router + Pinia**，全部 JavaScript（不引入 TypeScript），纯前端。
- 运行环境：Node.js ≥ 18，包管理器 npm。
- 形态：单页应用（SPA），移动端优先，可部署到任意静态托管（Vercel / Netlify / Nginx），**无后端、无 API Key、无登录**。
- 路由模式：`createWebHistory`（history 模式），仓库内附三套部署 rewrite 配置（见 §五.7）。

## 二、核心功能需求（按优先级）

### P0（必须实现）

1. **题库浏览**
   - 分类（10 个，枚举值必须与 `utils/constants.js` 完全一致）：
     `Linux基础`、`Shell脚本`、`网络基础`、`MySQL`、`Redis`、`Docker/K8s`、`CI/CD`、`监控告警`、`安全`、`综合场景题`
   - 题库页：分类筛选 Tab + 关键词搜索 + 频率筛选（全部/高频/中频/低频）
   - 题目卡片显示：题干摘要（截断 50 字，超出加省略号）、难度徽标、频率徽标、收藏星标、当前掌握状态（未刷/会/不会）
   - 题目详情页 `/question/:id`：完整题干；参考答案默认折叠、点击展开（带高度过渡）；标签、难度、频率、收藏按钮；底部同样提供「会/不会」自评按钮，与刷题页共用同一 store action。
2. **刷题模式** `/practice`
   - 三种入口：顺序刷题（全量）、随机刷题、按分类刷题、错题专项；query 参数 `?category=xx&mode=sequential|random|wrong`
   - **无参数进入的默认行为（必须实现）**：`mode` 缺省为 `sequential`、`category` 缺省为全部；若 `oi_progress` 存在且 `mode`/`category` 与本次一致，则从 `index` 断点续刷并顶部提示「已从上次位置继续」，否则从第 1 题开始。
   - 交互：看题 → 展开答案 → 自评（会/不会）→ 下一题；带进度「第 n / m 题」；最后一题的自评后展示「本轮完成」小结（会 n / 不会 m，可「再来一轮」或「回首页」）。
   - 每题自评写入 records，`localStorage` 持久化，刷新不丢；最近位置写 `oi_progress`，供首页「继续上次刷题」。
3. **收藏功能** `/favorites`：收藏列表（按收藏时间**倒序**，即最近收藏在前），支持取消收藏；从详情页/刷题页星标即改即生效。
4. **学习数据统计** `/stats`
   - 环形图（总进度）+ 各分类掌握度条形图 + 错题本入口 + 收藏入口
   - **只用 CSS（`conic-gradient`）与内联 SVG 绘制，不引入任何图表库**（echarts / chart.js / d3 一律不用）
   - 统计口径（全局唯一，见 §五.4）：掌握率、总进度、今日已刷数三个指标必须按定义计算，不允许各地各算。

### P1（尽量实现）

5. **模拟面试模式** `/interview`
   - 设置页：题数（5/10/15/20，默认 10）+ 分类范围（全选或勾选分类）
   - 流程页：随机抽题（不重复）、逐题作答（可展开答案）、自评会/不会
   - **评估总结页 = 基于自评的统计评估**：
     - 得分：百分制 `Math.round(knowCount / total * 100)`
     - 按题数展示「会 n 题 / 不会 m 题」
     - 分类正确率：各分类 `know/(know+unknown)`（分母为 0 不展示该分类）
     - 薄弱分类：按正确率升序取前 3，附该分类的复习建议文案（按分类维护一段 `advice` 文案，见 `constants.js`）
     - ⚠️ 本应用无后端、不调用任何 AI，**不做也不宣传「AI 判分」**；文案统一称为「自评评估」。
   - 会话数据只存 Pinia，**刷新即失效**，流程页刷新后自动跳回 `/interview` 并提示「面试会话已失效，请重新开始」。
6. **搜索**：题库页顶部搜索框，匹配范围 = 题干 + 答案 + 标签，300ms 防抖，空结果走空状态。
7. **错题本** `/wrong`：**由 records 实时派生，不单独存储**。规则：某题 `status === "unknown"` 时出现在错题本，之后被判为 `"know"` 即自动移出（即「最近一次自评」为准）。支持「错题专项刷题」（复用 `/practice?mode=wrong`）。
8. **夜间模式**：`settings.theme` 三态 `light | dark | system`（默认 `system`），跟随 `prefers-color-scheme` 并在系统变化时实时响应；手动切换后持久化；`<html data-theme>` 驱动 CSS 变量；切换时同步更新 `<meta name="theme-color">`。

### P2（可选项：只在文档与代码中留清晰 TODO 占位，不实现）

9. 用户登录、云同步进度（预留 `dataService` 抽象层接口即可）
10. PWA：manifest.json + Service Worker，支持添加到主屏幕、离线访问
11. 每日一题：基于日期种子随机推题（无需后端）
12. 面试单题倒计时（可选增强，最后有余力再做；默认关闭，不影响主流程）

## 三、数据模型（务必遵守）

### 0. 题型体系（v1.3 新增）

支持三种题型，由 `type` 字段区分：

| type | 说明 | 判定方式 | 判定结果 |
|---|---|---|---|
| `short` | 简答题（默认，可省略该字段） | 用户自评 | 「会」/「不会」 |
| `single` | 单选题 | 选项与 `answer` 比对 | 「答对」/「答错」 |
| `multiple` | 多选题 | 选项集合与 `answer` 集合**全等** | 「答对」/「答错」 |

- 填空题、判断题等后续题型通过新增 `type` 值扩展，UI 按 `type` 分发渲染组件。
- **判定结果统一映射到既有自评体系**：答对 → `know`，答错 → `unknown`。
  这样错题本、今日已刷数、`oi_records` 结构均无需改动。
- **统计口径差异（重要）**：选择题**不计入掌握率**，详见 §五.4。
- 多选题判定：**全对才算对**；漏选、多选、错选一律算错（不设部分分）。

### 1. 题目结构

```json
{
  "id": 1,
  "type": "short",
  "category": "Linux基础",
  "difficulty": "中等",
  "question": "简述 Linux 的 load average 含义，以及如何判断系统负载是否过高。",
  "answer": "load average 表示 1/5/15 分钟内的平均可运行+不可中断进程数……\n判断方式：与 CPU 核心数比较，1 分钟值持续大于核心数 2 倍即需排查。",
  "tags": ["负载", "性能排查"],
  "frequency": "高频"
}
```

选择题结构（`type` 为 `single` / `multiple`）：

```json
{
  "id": 73,
  "type": "single",
  "category": "MySQL",
  "difficulty": "中等",
  "question": "InnoDB 默认的事务隔离级别是？",
  "options": [
    { "key": "A", "text": "读未提交 READ UNCOMMITTED" },
    { "key": "B", "text": "读已提交 READ COMMITTED" },
    { "key": "C", "text": "可重复读 REPEATABLE READ" },
    { "key": "D", "text": "串行化 SERIALIZABLE" }
  ],
  "answer": ["C"],
  "explanation": "InnoDB 默认 REPEATABLE READ……",
  "tags": ["事务", "隔离级别"],
  "frequency": "高频"
}
```

字段约束：

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | number | 唯一、正整数、从 1 连续递增 |
| `type` | string | `short` \| `single` \| `multiple`；缺省视为 `short` |
| `category` | string | 必须是 §二.1 的 10 个枚举值之一 |
| `difficulty` | string | `简单` \| `中等` \| `困难` |
| `question` | string | 非空，≤ 120 字 |
| `answer` | string \| string[] | 简答题：非空字符串（纯文本，允许 `\n`）；选择题：选项 key 数组 |
| `options` | array | **仅选择题必填**，2–6 项，每项 `{ key, text }`，`key` 唯一且为大写字母，`text` 非空 |
| `explanation` | string | 仅选择题，可选；选项之外的补充说明，展示在判定结果下方 |
| `tags` | string[] | 2–5 个，不带 `#` 前缀（UI 渲染时自行加） |
| `frequency` | string | `高频` \| `中频` \| `低频` |

选择题额外约束：
- `answer` 必须是 `options` 中存在的 key；`single` 恰好 1 个，`multiple` ≥ 2 个。
- `single` 不设 `answer` 为多值，避免 UI 与判定歧义。

### 2. 答案渲染规则

- 统一用 `{{ question.answer }}` 文本插值 + CSS `white-space: pre-wrap; word-break: break-word;` 渲染，**禁止 `v-html`**（零 XSS 风险，命令缩进完整保留）。
- 答案区字体：等宽字体栈 `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`，行高 1.7。

### 3. 题库数据

- 位置：`public/data/questions.json`（顶层为数组）。
- 规模：**目标 72 道**，每分类 6–8 道，总计 60–80 道区间内。
- 内容要求：专业、准确、可直接背诵；答案限定在当前主流稳定版本范围内，避免强依赖易变版本细节。
- 加载：`fetch('/data/questions.json')`，处理 loading / 失败（含「重试」按钮）/ 空数组三态；加载成功的题库存入 `bankStore` 全局复用，不重复请求；`/bank`、`/practice`、`/stats`、`/interview` 进入前确保已加载（未加载则显示骨架并等待）。

### 4. 数据校验脚本

- `scripts/validate-data.mjs`，npm script：`npm run validate:data`
- 校验项：JSON 可解析、id 唯一且连续、枚举值合法、必填字段非空、`question` ≤120 字、tags 数量 2–5、分类覆盖与每类题数（每类 ≥6）、答案长度下限（≥30 字）。
- 任一校验失败即非零退出，并在控制台列出具体题目 id 与原因。

## 四、页面结构与路由（Vue Router，history 模式）

| # | 路由 | 页面 | 说明 |
|---|---|---|---|
| 1 | `/` | 首页 | 分类入口卡片（10 个）+ 今日学习概览（今日已刷数、进度环）+「继续上次刷题」入口 |
| 2 | `/bank` | 题库页 | 分类 Tab + 搜索 + 频率筛选 + 列表；**不做虚拟滚动**（规模 ≤500 题时无必要） |
| 3 | `/question/:id` | 题目详情页 | 题干、折叠答案、标签、自评、收藏；id 不存在 → 404 视图 |
| 4 | `/practice` | 刷题页 | `?category=&mode=sequential|random|wrong`，默认行为见 §二.2；卡片式单题交互 + 左右滑动 + 键盘 ←/→ |
| 5 | `/interview` | 模拟面试设置 | 题数 + 分类范围 → 生成会话 |
| 6 | `/interview/run` | 面试答题中 | 逐题作答与自评；无会话时重定向 `/interview` |
| 7 | `/interview/result` | 面试评估总结 | 得分、各分类正确率、薄弱分类、复习建议；无结果时重定向 `/interview` |
| 8 | `/stats` | 统计页 | 总进度环、各分类掌握度条形图、错题/收藏入口 |
| 9 | `/favorites` | 收藏页 | 从「统计」或「我的」下钻进入 |
| 10 | `/wrong` | 错题本 | 派生自 records，从「统计」下钻进入 |
| 11 | `/me` | 我的 | 主题切换（三态）、数据管理（清空学习记录/清空收藏，需二次确认）、题量与版本信息 |
| 12 | `/:pathMatch(.*)*` | 404 | 友好提示 + 回首页 |

- 底部 TabBar（**4 项，不含首页**）：题库 `/bank`、刷题 `/practice`、统计 `/stats`、我的 `/me`。
  首页 `/` 是启动首屏，进入二级页后通过 `AppHeader` 左侧站点标题点击返回；TabBar 高亮规则：精确匹配该路由或为其子路由时高亮，`/question/:id`、`/practice` 保持父级高亮。
- 全局组件：TabBar、AppHeader（返回 + 标题，左侧站点名可回首页）、QuestionCard、DifficultyBadge、FrequencyBadge、EmptyState、Ring（环形进度）、SlideTransition。
- 每个路由设置 `document.title`（如「Linux基础 · 题库」）。
- 从列表进详情返回时恢复列表滚动位置（`scrollBehavior` + 记录 scrollTop）。
- 路由守卫：`/interview/run`、`/interview/result` 在无会话/无结果时 `replace` 到 `/interview`。

## 五、技术架构要求

### 1. 目录结构（必须遵守）

```
ops-interview-h5/
├── docs/ops-interview-bank-PRD.md
├── public/
│   └── data/questions.json
├── scripts/validate-data.mjs
├── src/
│   ├── api/dataService.js      # 题库加载、搜索封装（含缓存与错误包装）
│   ├── stores/
│   │   ├── studyStore.js       # records / favorites / progress
│   │   ├── settingsStore.js    # theme
│   │   ├── bankStore.js        # 题库数据与加载态
│   │   └── interviewStore.js   # 面试会话（仅内存，不持久化）
│   ├── router/index.js
│   ├── views/                  # 11 个页面 + NotFound（共 12 个视图）
│   ├── components/             # 通用组件
│   ├── assets/                 # 全局样式、CSS 变量
│   └── utils/
│       ├── storage.js          # localStorage 封装（JSON 容错、配额降级、命名空间）
│       ├── constants.js        # 分类/难度/频率枚举、存储 key、主题枚举、分类建议文案
│       ├── gestures.js         # 滑动判定
│       └── format.js           # 摘要截断、日期、百分比
├── tests/                      # vitest 单测
├── vercel.json
├── netlify.toml
├── deploy/nginx.conf.snippet
└── README.md
```

### 2. 技术约束

- 依赖仅限：`vue`、`vue-router`、`pinia`；构建/测试：`vite`、`@vitejs/plugin-vue`、`vitest`（+ `jsdom`）。**不引入 UI 组件库、图表库、手势库、markdown 库**。
- `vite.config.js`：`build.target: 'es2018'`（兼容微信内置浏览器 / 老 X5）。
- `index.html` 必须包含：
  - `<html lang="zh-CN">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`（否则 iOS 安全区失效）
  - `<meta name="theme-color" content="#4F7CFF">`（切换主题时动态更新）
  - `<meta name="apple-mobile-web-app-capable" content="yes">` + `<meta name="format-detection" content="telephone=no">`
  - `<title>运维面试题库</title>` 与 `favicon`（用内联 SVG data URI，不新增图片文件）
- 枚举与文案常量集中在 `utils/constants.js`，组件内禁止硬编码中文字面量做比较。

### 3. 存储设计（localStorage）

| key | 类型 | 结构 |
|---|---|---|
| `oi_records` | object | `{ [id]: { status: "know"\|"unknown", times: number, lastReviewed: number } }` |
| `oi_favorites` | array | `[id, ...]`（按收藏先后 push，展示时倒序） |
| `oi_settings` | object | `{ theme: "light"\|"dark"\|"system" }` |
| `oi_progress` | object | `{ mode, category, index, updatedAt }`（「继续上次刷题」用） |

- `storage.js`：读写包 `try/catch`，JSON 解析失败回退默认值并清理脏数据；`QuotaExceededError` 时降级（写失败返回 false，上层提示「本地存储已满」）；所有 key 统一加 `oi_` 前缀。
- **落盘时机**：写入内存态后按 ≥200ms 节流合并写；并在 `visibilitychange(hidden)` 与 `pagehide` 时强制 flush，避免切后台/关闭页面丢数据。
- **脏数据口径**：题库加载后，records/favorites/progress 中的 id 与题库求交集；**未知 id 保留在 localStorage（便于题库回滚）但不参与任何统计与列表展示**。

### 4. 统计口径（全局唯一定义，写在 `studyStore` getters）

- `reviewedCount` = 有效 records（与题库求交后）中 `times > 0` 的题目数（**含选择题**）
- `progressRate` = `reviewedCount / totalQuestions`（总题数为 0 时返回 `null`，UI 显示「—」）
- `masteryRate` = `shortKnowCount / (shortKnowCount + shortUnknownCount)`
  - **只统计简答题（`type === 'short'`）**；分母为 0 返回 `null`
  - 选择题答对/答错**不影响掌握率**，但在 UI 上仍显示「答对/答错」与错题本归属
- `todayReviewedCount` = `lastReviewed` 落在本地时区「今天 0:00 之后」的题目数（含选择题）
- 分类掌握度 = 该分类内**简答题**的 `know / (know + unknown)`；该分类无简答题时返回 `null`
- 选择题正确率（独立指标，仅在统计页展示）= `choiceKnow / (choiceKnow + choiceUnknown)`
- 百分比统一保留整数（`Math.round`），`null` 一律渲染为「—」而非 0%

### 5. 状态管理（Pinia）

- `studyStore` actions：`markKnow(id)`、`markUnknown(id)`、`toggleFavorite(id)`、`saveProgress(payload)`、`clearRecords()`、`clearFavorites()`、`getMastery()`；getters：`wrongList`、`favoriteList`、各统计指标。
- 所有页面读同一 store，统计页/首页/错题本**无手动刷新**，响应式自动同步。
- 学习记录写入后必须同时更新 `times += 1` 与 `lastReviewed = Date.now()`。

### 6. 手势与键盘

- 手势：`pointerdown/move/up` 实现；判定顺序 = 先轴锁定（`|dx| > |dy| * 1.2 && |dx| > 10px` 才视为横向）→ 横向时 `preventDefault` 阻止页面滚动 → 距离阈值 60px 或滑动速度 >0.3px/ms 触发切换 → 否则回弹。
- 卡片内纵向滚动与横滑互不干扰；动画时长 220ms，`transitionend` 前锁定输入防连击。
- 桌面端键盘：`←/→` 切题、`空格` 展开答案、`1/2` 自评会/不会。

### 7. 部署（history 模式必备 rewrite）

- `vercel.json`：`{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`
- `netlify.toml`：`[[redirects]] from="/*" to="/index.html" status=200`
- `deploy/nginx.conf.snippet`：`try_files $uri $uri/ /index.html;`
- README 必须写明「history 模式刷新子路由需上述 rewrite，否则 404」，并附「改用 hash 模式」的一行改法（`createWebHashHistory`）作为备选。

## 六、UI/UX 要求

### 0. 移动端密度规范（v1.3 新增，因为要部署到服务器用手机刷题）

**布局基准从「桌面居中留白」改为「手机满屏密度」**，桌面端仍需 480px 居中，但内部密度按手机设计。

- 页面左右留白 `16px → 12px`；卡片内边距 `16px → 12~14px`；卡片间距 `10px → 8px`。
- 正文字号：题干 16px（简答）/ 15px（选择题），答案 13px，辅助文字 12px，最小不低于 11px。
- 列表页一屏目标：375×667 下至少可见 **4 张题卡**（当前样式只有约 3 张）。
- **列表必须分页，不允许无限滚动**（v1.3 追加）：
  - 每页 20 条，超过一页才显示分页控件；不足一页不显示。
  - 分页控件吸底固定，滚动到任何位置都可翻页。
  - 题库页码写入 URL query（与筛选态同级），刷新/后退可恢复；切换筛选重置为第 1 页。
  - 列表条目因操作而减少导致页码越界时，自动收敛到有内容的页。
  - 长页面（统计、面试评估）提供「回到顶部」悬浮按钮。
- **刷题页改为沉浸式布局**：
  - 卡片区占满「顶栏以下、操作栏以上」的可视高度（`min-height: calc(100dvh - 顶栏 - 操作栏 - 安全区)`），题干与答案在卡片内部滚动，不再让整页滚动出大片空白。
  - 自评/选项操作栏 `position: sticky` 吸底，始终在拇指区可达处。
  - 无 TabBar 的页面（刷题、详情、面试）底部不留 TabBar 高度。
- 底部安全区：所有吸底容器统一 `padding-bottom: max(12px, env(safe-area-inset-bottom))`。
- 触摸目标不小于 44×44px；选项行高度不小于 44px。

### 1. 视觉规范

- 风格：简洁、工具感；主色 `#4F7CFF`，浅色背景 `#F6F7FB`，卡片 `#FFFFFF`，圆角 12px，阴影 `0 1px 3px rgba(0,0,0,.06)`。
- 深色模式：背景 `#121212`，卡片 `#1E1E1E`，边框 `#2A2A2A`；主色在深色下提亮为 `#6E93FF`（保证小字号对比度 ≥4.5:1），文字 `#E6E6E6`／次要 `#A0A0A0`。
- 主题通过 `<html data-theme="light|dark">` + CSS 变量实现，禁止在组件里写死颜色值。
- 移动端优先：以 375px 宽度设计；iOS 安全区 `env(safe-area-inset-bottom)` + `viewport-fit=cover`；TabBar 高度含安全区内边距。
- 桌面端：内容区最大宽度 480px 居中，两侧留白，不做多栏拉伸。
- 难度颜色：简单 `#52C41A`、中等 `#FAAD14`、困难 `#F5222D`（深色下同色系略提亮）；频率徽标用中性灰蓝，不抢难度视觉。
- 转场：路由切换用 `<Transition>`（淡入 + 轻微上移 180ms）；刷题卡片横向滑动过渡。
- 空状态（无收藏 / 无错题 / 无搜索结果 / 题库加载失败）：内联 SVG 手绘小插画 + 一句引导文案 + 行动按钮（如「去刷题」）。
- 无障碍与可用性：点击区 ≥44px；按钮有 `aria-label`；`prefers-reduced-motion` 时关闭滑动动画。
- 404 页：文案 + 回首页按钮。

## 七、交付物

1. 完整工程（`package.json` 含 `dev` / `build` / `preview` / `test` / `validate:data` 脚本），可 `npm install && npm run dev` 直接运行。
2. `public/data/questions.json`：72 道（60–80 区间），通过 `npm run validate:data`。
3. `README.md`：启动方式、架构与目录说明、统计口径、部署（三套 rewrite）、数据维护方式（如何加题 + 校验 + 枚举约束）。
4. 三个部署配置文件。
5. `vitest` 单测：`storage.js`（脏数据/损坏 JSON/配额异常，配额用 mock 抛错模拟）、`studyStore` actions 与统计 getters、`format.js`（截断与百分比）、`gestures.js`（轴锁定与阈值）。
6. 代码完整，不留「此处省略」；关键交互有注释。

## 八、实现顺序（严格逐步，每步完成后等我确认再进入下一步）

- **第一步**：Vite + Vue3 工程骨架、路由（全部 12 条，未实现页给占位）、Pinia、`constants.js` / `storage.js` / `format.js`、`questions.json`（72 题）+ 校验脚本、TabBar 与 AppHeader、全局样式与 CSS 变量、基础单测跑通。
- **第二步**：题库页（分类 Tab / 搜索 / 频率筛选）+ 题目详情页（折叠答案、收藏、自评）。
- **第三步**：刷题页完整流程（顺序/随机/分类/错题、滑动 + 键盘、自评、持久化、`oi_progress`）+ 首页「继续上次刷题」入口（最小可用）。
- **第四步**：统计页 + 错题本 + 收藏页（含空状态与环形/条形图）。
- **第五步**：模拟面试（设置 → 答题 → 自评评估总结，含路由守卫）。
- **第六步**：夜间模式三态 + 首页视觉打磨 + UI 统一 + README + 三套部署配置 + P2 TODO 标注。

> 按「每步等我确认」执行，不再出现「一次输出前两步」的表述。

## 九、每步验收标准（自测清单，逐条勾选）

**零 · v1.3 题型与布局改造（独立验收，先于后续步骤）**
- [ ] 题库含 72 简答 + 24 选择题，`npm run validate:data` 通过；能拦住「single 配多个答案」「answer 引用不存在的 key」「multiple 只配 1 个答案」等错误
- [ ] 选择题在题库/详情/刷题页均按选项渲染，不再显示纯文本答案
- [ ] 单选题点选项即判定；多选题需点「提交」判定，全对才算对（漏选/多选算错）
- [ ] 判定后正确项绿、错选项红，并显示 `explanation`
- [ ] 答对记 `know`、答错记 `unknown`；答错的选择题进入错题本
- [ ] 掌握率只统计简答题；统计页另有「选择题正确率」独立指标
- [ ] 刷题页卡片占满可视高度、操作栏吸底，375×667 下无大片空白
- [ ] 题库列表 375×667 下可见 ≥4 张卡片
- [ ] 桌面端仍为 480px 居中

**第一步**
- [ ] `npm run dev` 启动无报错，首页可访问，TabBar 四项可切换，未实现页有占位文案
- [ ] `npm run validate:data` 通过；故意改错一个枚举值能被脚本拦住
- [ ] 刷新任意路由（dev 下）不白屏；404 路由可见
- [ ] `npm run test` 通过

**第二步**
- [ ] 分类 Tab 切换后列表随之更新，搜索 300ms 防抖，无结果显示空状态
- [ ] 详情页答案默认折叠、点击展开有过渡；收藏在列表/详情/收藏页三处状态一致
- [ ] 不存在的 id 走 404；返回列表恢复滚动位置

**第三步**
- [ ] 左滑下一题、右滑上一题、键盘 ←/→ 均生效；卡片内纵向滚动不误触切换
- [ ] 自评后 `oi_records` 正确（status/times/lastReviewed）；刷新后进度不丢
- [ ] 无参数进入 `/practice` 按 §二.2 默认行为执行；首页「继续上次刷题」可回到上次位置与模式
- [ ] 最后一题后出现「本轮完成」小结

**第四步**
- [ ] 掌握率/总进度/今日已刷数与 §五.4 口径一致，分母为 0 显示「—」
- [ ] 某题由「不会」改判「会」后，错题本自动移除该题
- [ ] 清空收藏/清空错题后空状态正常；收藏页按收藏时间倒序

**第五步**
- [ ] 题数与分类范围生效，题目不重复
- [ ] 总结页得分为百分制 `round(会/总*100)`，薄弱分类按正确率升序，建议文案随分类变化
- [ ] 刷新 `/interview/run` 自动跳回设置页并提示会话失效；中途退出有提示，不产生脏数据

**第六步**
- [x] 主题三态生效且切系统主题实时跟随；刷新后保持；`theme-color` 同步变化
- [x] iPhone 安全区与桌面 480px 居中均正常；深色下主色对比度达标
- [x] `npm run build` 成功，`npm run preview` 下直刷子路由按 README rewrite 可访问
- [x] README 与实际工程一致

**第六步补充（v1.3 追加验收）**
- [x] 首页有总进度环、简答掌握率 / 选择题正确率、刷题与面试快捷入口、分类进度
- [x] 深色模式全部文字对比度 ≥ 4.5（实测最低 5.09，共 23 个元素）
- [x] 无数据时「—」不染强调色、不因大字号被误读成装饰线
- [x] P2（登录/同步、每日一题、PWA）在代码注释中标明扩展点，不实现
- [x] 浅色 + 深色 × 11 个页面 = 22 个组合，均零横向溢出、零运行时报错

## 十、约定与风险提示

- **题库内容责任**：题库由我按公开通用知识编写，版本敏感细节（MySQL 8 参数、K8s 版本特性、Redis 淘汰策略默认值等）**由你在验收时终审**，发现错误直接改 JSON 后跑 `validate:data`。
- **能力边界**：无后端、无 AI，因此「面试评估」只能是自评统计，不做口语评分、不做自动判分。
- **不做的事**：虚拟滚动、UI 组件库、图表库、markdown 渲染、SSR、多语言、账号体系。
- **规模假设**：题库 ≤500 题、单个用户 records ≤500 条，`localStorage` 容量足够；超出时按 §五.3 降级提示。
