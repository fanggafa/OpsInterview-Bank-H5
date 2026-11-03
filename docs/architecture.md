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

> **从列表进详情还要带「范围」**：`?scope=wrong|favorites&category=X`。
> 详情页据此把左右滑动的上一题/下一题**限定在那一批题**内。
>
> 不带 scope 时按全库顺序切（题库页那种浏览场景）。**二级页内部跳转时要保留 scope**，
> 否则切一次就退回全库 —— 用户会看到「这个分类明明 6 题，滑两下就跑到别的分类」。
>
> 这个坑的本质是「**列表页呈现一批，切题却走另一批**」：
> 列表页从 `study.wrongList` 取题，详情页却从 `bank.questions` 取前后题。
> 凡是「从一个子集进详情、且详情支持前后切换」的场景，都要把子集身份带过去。

> **「返回」只有一种长相**：图标统一是带横线的 `←`（`d="M20 12H5M11 6l-6 6 6 6"`），
> 外观统一是**透明底 + 圆形**，只在 `:active` 给一层淡色反馈。
> 常规页用 `AppHeader`（44×44）；刷题页是 48px 紧凑顶栏，尺寸降到 32×32，
> **但底色/边框/圆角/图标必须与 AppHeader 一致** —— 同一个动作不该在不同页面长出两张脸。

> **跨页面复用的样式放全局 `styles.css`，不要每个页面各写一份**。
>
> 判断标准：**两个页面上同一个功能的「外壳」应该长得一样** → 抽到全局。
> 典型例子是折叠答案区（`.answer` / `.answer__inner` / `.answer__body`）——
> 早先详情页和刷题页各自 scoped 写了一份，内边距悄悄跑偏（12/13 vs 11/12），
> 同一个「展开答案」在两个页面尺寸不同。
>
> 但**不要把「有意不同」的部分也强行统一**：
> 折叠区的**按钮**两页就不一样 —— 详情页是 44px 大条（页面主要操作），
> 刷题页是 28px 小胶囊（题头一行要省空间）。这类差异是设计决定，该留就留。
>
> 只抽样式、不抽结构：这样改动最小，不用碰任何模板。
> 若连结构也要统一（按钮与面板的 DOM 关系），才考虑抽成组件 ——
> 但那要额外处理「按钮在上、面板在下分处两处」的布局差异，成本高得多。

> **带状态的跨页面交互，抽成「逻辑 + 展示」两件套**。
>
> 例子是滑动越界提示（「已经是第一题 / 最后一题」）：
>
> | 文件 | 职责 |
> |---|---|
> | `src/utils/swipeBoundary.js` | `useSwipeBoundaryToast()`：状态与计时 |
> | `src/components/SwipeBoundaryToast.vue` | 纯展示浮层（样式、淡入淡出） |
>
> **为什么拆两个文件**：SFC 的 `<script setup>` 只能导出组件本身，
> 没法额外导出一个函数给页面调用。所以状态逻辑放 utils、展示放组件。
> 这也是本项目里「有状态的共用交互」的统一写法。
>
> **为什么不能只做一个页面**：滑动手势只存在于两个页面
> （详情页 `QuestionView`、刷题页 `PracticeView`），
> 越界提示必须两边都有。早先只有详情页做了，刷题页静默不动 ——
> 用户以为手势失灵。这种「一个页面做了、另一个忘了」的分叉，
> 靠复制只会再发生一次。

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

> **需要「撑满剩余高度」的页面，外层要带 `page--fill`**。
> `.page--fill` 提供 `display: flex; flex-direction: column; flex: 1`，
> 子元素（如滑动区 `.stage`）才能用 `flex: 1` 吃掉剩余空间。
>
> 只给子元素写 `flex: 1`、父级还是普通 `.page`，flex 链在父级就断了 ——
> 子元素高度仍会由内容撑开。详情页曾踩过这个坑：
> 滑动区只有卡片那么大，用户以为「只有卡片那块能左右滑」。
>
> 判断方法：`flex: 1` 不生效时先往上找，看父级是不是 `.page--fill`。

## 目录结构

```
ops-interview-h5/
├── .gitattributes              # 换行符统一为 LF（详见 conventions.md）
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
| `installGuide.js` | 安装引导。**两个入口**：`installGuideAll()` 给设置页列出全部平台（`{ current, installed, groups }`）；`installGuide()` / `installSteps()` 供单平台查询。含 iPadOS 伪装 macOS 的处理 |
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

## 视觉材质：液态玻璃（Liquid Glass）

2026-11 全站改用 iOS 26 的液态玻璃质感。核心是三层，**缺一层都出不来效果**：

| 层 | 实现 | 缺了会怎样 |
|---|---|---|
| **① 背景光晕** | `body` 的 `background-image` 铺三团错位径向渐变 | 纯色背景上 `backdrop-filter` 只是「模糊一层」，看着像半透明白卡 |
| **② 玻璃材质** | 半透明底 + `backdrop-filter: blur + saturate` + 上沿内高光 | 没有 `saturate` → 灰白毛玻璃；没有内高光 → 像半透明塑料 |
| **③ 材质复用** | 全部走 `--glass-*` token，`.card` / `.review` / TabBar / AppHeader 共用 | 各写一套 → 换主题时要改好几处，容易走样 |

关键 token（`src/assets/styles.css`）：

```css
--glass-bg: rgba(255,255,255,.42);       /* 浅色卡片：透明度是玻璃感的关键参数 */
--glass-bg-strong: rgba(255,255,255,.62);/* 需要稍实一点的容器 */
--glass-bar-bg: rgba(255,255,255,.58);   /* 页头 / 底栏：贴边条状 + 压着文字 */
--glass-border: rgba(255,255,255,.75);   /* 白色细边是玻璃唯一能看清的形状来源 */
--glass-highlight: rgba(255,255,255,.95);/* 上沿反光 */
--glass-blur: 20px;
--glass-saturate: 190%;
--glass-glow-1/2/3;                      /* 三团光晕色，随主题切换 */
```

### 必须遵守的几条

> **1. 光晕要画在 `body` 的背景层，不能用 `body::before` + `z-index:-1`。**
> `body` 自己有不透明的 `background-color`，伪元素会被它压住、完全不可见
> （实测卡片仍是死白一片，排查了很久）。

> **2. `.app-shell` 背景必须是 `transparent`。**
> 它早先写着 `background: var(--c-bg)`，会把 `body` 的光晕整个盖掉 ——
> 玻璃体下方又变回纯色，效果消失。

> **3. `-webkit-backdrop-filter` 必须和无前缀版本并排写。**
> iOS Safari 16 以下只认带前缀的，而本项目主要跑在手机浏览器 / 微信里。

> **4. 必须有不支持 `backdrop-filter` 的降级。**
> 用 `@supports not (...)` 退回接近实色的底 —— 宁可不好看，不能读不清。

> **5. 深色玻璃的底色是「白色低透明度」(`rgba(255,255,255,.08)`)，不是黑色。**
> 黑色叠在深背景上会让卡片糊成一片、失去层次；白色 8% 微提亮，才像「玻璃浮在暗处」。

> **6. 页头 / 底栏 / 刷题顶栏是「浮动圆角胶囊」，不是通栏条。**
>
> 这是本轮返工最多次的一处，踩了五个坑，全部记下来：
>
> | 坑 | 现象 | 正确做法 |
> |---|---|---|
> | 通栏 + 白色内高光当边 | 深色下那 1px 亮线成了刺眼的一条，整条像贴上去的板子 | 不加边框/内高光，圆角胶囊 |
> | 透明度提到 86% 求「标题清晰」 | 变成不透明实色板子，玻璃感丢失 | 55%（浅）/ 10%（深） |
> | `bottom: 0` 贴底、`margin-bottom: 0` | 与下方搜索框粘连成一片 | 底部留白 10~12px |
> | `margin: 0 -16px` 通栏但父级 padding 是 12px | 比视口宽 8px（实测 398 > 390），右侧被切、边缘有接缝 | 留白，不要通栏 |
> | **`margin: 0 12px` 叠加父级 padding 12px** | 页头左右各内缩 12px（实测 left=24 / right=366），而搜索框、卡片、TabBar 都是 12 / 378 —— 截图上一眼看出页头比下面窄一圈 | **左右 margin 必须是 0**，与内容区同宽 |
>
> **最后一条**是用户第二次指出的：「页头效果 ok 了，但怎么没有对齐两边的边框，底栏就是对的」。
> 底栏是 `position: fixed` + `calc(100% - 24px)`，天然对齐；页头在 `.app-main`
> （`padding: 0 12px`）里，再叠加 12px margin 就多缩了一圈。
>
> **记住这条通用规则**：`.app-main` 已经有左右 12px 内边距，
> 里面任何元素想与其它内容对齐，**左右 margin 必须是 0**，不要再自己加。
>
> **形态**：`border-radius: 16px` + 左右贴齐内容区 + 上下留白 + `--glass-shadow` 柔和投影。
> **饱和度单独调低**（`--glass-bar-saturate: 130%`）：卡片用 190% 是对的，
> 但条状区域面积大，190% 会把背后那团蓝光拉成一整块深蓝板子（深色下尤其丑）。
>
> **所有「条状固定区域」都要一起改**，否则会剩下突兀的实色块：
> `AppHeader`（页面标题）、`TabBar`（底部导航）、`PracticeView` 的 `.ptop`（刷题顶栏）
> 与 `.actions`（吸底操作区）。刷题页那两块曾漏改，用户截图指出才发现。

> **7. 底部留白要连动改三处。**
> TabBar 改成浮动胶囊后底部多出 10px，`.app-main` 的 `padding-bottom`
> 与 `.app-main--full` 的 `height` 都要同步扣掉这 10px，否则最后一屏内容被胶囊压住。

> **7. 页头的负外边距必须与父容器内边距同值。**
> `.app-main` 是 `padding: 0 12px`，页头就只能是 `margin: 0 -12px`。
> 早先写成 `-16px`，实测页头宽 **398px > 390px 视口**（x 变成 -4），
> 右侧被切、左侧溢出，标题看着偏、边缘还有一条割裂感很强的接缝。

### 主色与配套渐变

改玻璃质感时一并换了主色：靛蓝 `#4f7cff`（偏紫偏灰，在玻璃上显脏）
→ **iOS 系统蓝 `#0a84ff`**（浅色）/ `#5ac8fa`（深色，深底上更像发光）。
成功/警告/危险三色也同步换成 iOS 语义色。

> **换主色时必须一起换 `--grad-hero`。**
> 首页 hero 主卡的渐变早先是 `#4f7cff → #7b6cf6 → #a06af5`（靛蓝→紫→品红），
> 只改 `--c-primary` 不改它，会得到「按钮是蓝的、主卡还是紫的」的割裂观感
> —— 用户直接反馈「这不是没改颜色吗」。
>
> 现在浅色 `#0a84ff → #3e9bff → #64d2ff`、深色 `#0b5ed7 → #1470c8 → #1a86b8`，
> 都保持在蓝色到天蓝之间，**只做同色族的深浅变化，不跑色相**。

> 同理 `--shadow-lift`、`--c-table-zebra` 这些带主色成分的变量也要一起换，
> 否则会残留旧靛蓝的痕迹。

### 滚动条

浏览器默认滚动条又粗又白（桌面 Chrome 约 15px，实白底 + 灰滑块），
放在液态玻璃页面上格外突兀 —— 用户反馈「太粗了，颜色也不搭」。

改用细滚动条，**浅色/深色各一套**：

```css
--scrollbar-size: 6px;
--scrollbar-thumb: rgba(10,132,255,.32);   /* 浅色：主色系半透明 */
--scrollbar-thumb-hover: rgba(10,132,255,.5);
--scrollbar-track: transparent;
/* 深色改为 rgba(90,200,250,.28)，用浅蓝低透明度，不扎眼又看得见 */
```

两套写法都要给：`::-webkit-scrollbar`（Chrome/Safari/微信内核）
与 `scrollbar-width` / `scrollbar-color`（Firefox 与新版标准）。

> 只给 webkit 写法，Firefox 会退回粗默认滚动条；只给标准属性，
> 老内核（微信常见）不生效。

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

**答题结果统一映射到 `know` / `unknown`**，所以「今日已刷数」无需按题型特殊处理。

> **但题型决定「进不进哪些集合」** —— 这条规则在 `studyStore` 里集中实现，
> 页面不要各自再判一遍：
>
> | 集合 | 只收 | 拦截点 |
> |---|---|---|
> | 错题本 `inWrong` | **选择题** | `mark()`：简答题答错也不写 `inWrong` |
> | 收藏 `favorites` | **简答题** | `toggleFavorite()`：选择题不写（取消不拦，允许清历史） |
> | 薄弱分类统计 | **选择题** | `weakCategories`：`total` / `reviewed` 跳过简答题 |
>
> **为什么在 store 而不在页面**：错题本列表、错题复习、首页计数、薄弱统计
> 都从这些集合派生。源头拦住，下游自动全对；
> 在页面过滤则每个下游都要记得写一遍，漏一个就是 bug（这个坑踩过）。
>
> 对应的 UI 约束：选择题在**题卡 / 详情页 / 刷题页**三处都**不渲染收藏按钮**，
> 而不是渲染出来再禁用 —— 禁用会让用户以为是自己没权限。

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
