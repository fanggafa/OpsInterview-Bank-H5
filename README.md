# 运维面试题库 H5（OpsInterview Bank）

面向运维工程师的面试题库刷题工具：手机浏览器 / 微信内打开，利用碎片时间背题自测。

- 技术栈：Vue 3 + Vite + Vue Router + Pinia（纯 JavaScript，无 TypeScript）
- 形态：SPA，移动端优先，**无后端、无登录、无 API Key**，可部署到任意静态托管
- 题库：**2547 题**（835 简答 + 1540 单选 + 172 多选），25 个分类；含 **340 张内联 SVG 图解**（340 题带图）
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
| `npm run test` | 运行 vitest（39 个文件 / 722 个用例） |
| `npm run validate:data` | 校验题库结构（枚举 / id / 题数 / 字段） |
| `npm run check:encoding` | 编码守卫（防中文被写坏，见[编码守卫](#编码守卫)） |
| `npm run check:figures` | 插图文字溢出检查（防被 SVG 裁掉半句，见[画图注意事项](#画图注意事项踩过的坑)） |
| `npm run check:figure-sfc` | 插图结构检查：SFC 完整性 + **文字压字 / 行距过紧**（连同名文件过滤可用） |
| `npm run split:data` | 由 `questions.json` 生成轻量索引 + 按分类的答案分片（见[分片数据](#分片数据p0-性能优化第一步)） |
| `npm run verify` | **提交前跑这个**：编码 + 题库 + 插图 + 测试 + 构建 全流程 |

环境要求：Node.js ≥ 18。

部署到子目录时用 `BASE_PATH=/子目录/ npm run build`（详见[部署](#部署)第 3 节）。

---

## 功能一览

| 页面 | 说明 |
|---|---|
| `/` 首页 | 总进度环、三个指标、**继续刷题入口**、**每日一题**、**复习巩固（每日复习 / 错题复习）** |
| `/bank` 题库 | 分类（默认折叠）+ 频率 + 难度筛选、防抖搜索、分页（10 条/页，页码进 URL） |
| `/question/:id` | 简答折叠答案 + 自评；选择题选项判定 + 解析；**左右滑动切题** |
| `/practice` | 两步：**先选做题 / 背题，再出题卡**（做题=选择题，背题=简答题）；顺序 / 随机，滑动 + 键盘，断点自动续刷 |
| `/practice?review=daily\|wrong` | **复习赛**：直接出题、一次性题组（每日复习 15 题 / 错题复习 10 题），不写断点 |
| `/wrong` 错题本 | **连对 3 次才移出**，每题显示连对进度；入口进错题复习 |
| `/favorites` 收藏 | 按收藏时间倒序，分页 |
| `/me` | 个人卡、四宫格数据、**分类图表（折叠）**、错题本/收藏入口、设置入口 |
| `/settings` | 外观主题、默认练习方式、清空数据、关于 |

一共 9 条路由（含 404）。首页与「我的」的分工见下。

### 页面职责划分（为什么拆出设置页）

「我的」页曾把外观主题、默认练习方式、清空数据、关于全塞在一起，页面很长。
现在按「每天要看」与「偶尔才改」拆开：

| 页面 | 放什么 | 判断标准 |
|---|---|---|
| **首页** | 今天做什么：继续刷题、每日一题、两个复习入口 | 打开就想动手 |
| **我的** | 数据（进度、掌握率、分类图表）、错题本/收藏入口 | 每次打开都要看 |
| **设置** | 主题、默认模式、清空数据、版本信息 | 偶尔才改一次 |

设置入口在「我的」页头右上角，齿轮图标。

> **模拟面试已移除**（需求调整）：原 `/interview`、`/interview/run`、`/interview/result`
> 三条路由与对应视图、store 全部删除。相关回归由 `tests/studyMode.test.js`
> 的「模拟面试已移除」用例守住（断言路由与页面里不再出现 interview）。

### 底部导航栏

4 个一级页签：**首页 / 题库 / 刷题 / 我的**。

- **首页必须在底部栏里**：早先版本只有 4 项（不含首页），从首页进到其他 Tab 后底部栏没有回首页的入口，只能靠浏览器后退——在 PWA/微信里体验很差。
- 沉浸式页面（`/practice`）不显示底部栏，它要占满整屏。
- 二级页面通过路由 `meta.parent` 让所属 Tab 保持高亮（如 `/question/:id` 高亮「题库」）。
- 统计页已并入「我的」，不再单独占一个 Tab。

### 主题切换

- **首页右上角按钮：点一下直接切浅色/深色**（不再跳「我的」页再选）。
  按钮图标随状态变化：深色下显示太阳、浅色下显示月亮，`aria-label` 同步说明「切换到浅色/深色主题」。
- `/me` 页保留三态选择（浅色 / 深色 / 跟随系统）——「跟随系统」只能在设置里选，快捷按钮只在明暗之间切。
- 主题通过 `<html data-theme>` + CSS 变量驱动，切换时同步 `theme-color` meta。

---

## 目录结构

```
ops-interview-h5/
├── docs/
│   ├── ops-interview-bank-PRD.md    # 产品需求文档
│   ├── figures-registry.md          # 340 张插图的完整注册表（按分类分组）
│   ├── batch-choice-spec.md         # 选择题补题规范
│   └── figure-text-rules.md         # 插图文字排版规则（修超界时照这个做）
├── public/data/questions.json       # 题库（2529 题）
├── scripts/
│   ├── validate-data.mjs            # 题库结构校验
│   ├── check-encoding.mjs           # 编码守卫
│   ├── check-figure-text.mjs        # 插图文字溢出检查（防被 SVG 裁掉）
│   └── measure.mjs                  # 移动端布局实测（CDP，需本地起 dev）
├── src/
│   ├── api/dataService.js           # 题库加载封装（缓存 + 错误包装）
│   ├── stores/
│   │   ├── bankStore.js             # 题库数据与 loading/error/empty 三态
│   │   ├── studyStore.js            # 学习记录 / 收藏 / 进度 / 全部统计口径
│   │   └── settingsStore.js         # 主题（light|dark|system）
│   ├── router/index.js              # 9 条路由 + 守卫 + 页面 title
│   ├── views/                       # 页面（9 个 + 404）
│   ├── components/                  # TabBar / AppHeader / QuestionCard / AnswerText / Pagination / Ring …
│   ├── assets/styles.css            # CSS 变量与全局样式（含深色主题）
│   └── utils/
│       ├── constants.js             # 枚举、存储 key、PAGE_SIZE、复习题量、连对门槛
│       ├── storage.js               # localStorage 封装（容错 / 配额降级 / 节流落盘）
│       ├── format.js                # 截断、百分比、相对时间、洗牌、关键词匹配
│       ├── question.js              # 题型判定（简答 / 单选 / 多选）
│       ├── filter.js                # 题库筛选 + URL query 序列化
│       ├── paginate.js              # 分页计算
│       ├── practice.js              # 刷题队列、断点续刷、复习赛抽题
│       ├── daily.js                 # 每日一题（日期种子 → 稳定选题）
│       ├── pinch.js                 # 看图缩放（双指 + 滚轮）
│       ├── gestures.js              # 滑动手势判定（轴锁定 + 阈值 + 速度）
│       └── scroll.js                # 回到顶部（兼容测试环境）
├── tests/                           # vitest（37 个文件 / 708 个用例）
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
- 错题本**由 `inWrong` 标记驱动**：答错 / 自评「不会」进入，之后任意方式（刷题、每日一题、
  复习赛）连续答对 **3** 次才自动移出。详见 [错题本与连对毕业](#错题本与连对毕业)。
- 未知 id 保留在 localStorage（便于题库回滚），但不参与统计与列表展示。

---

## 本地存储

| key | 结构 |
|---|---|
| `oi_records` | `{ [id]: { status: "know"\|"unknown", times: number, lastReviewed: number, streak: number, inWrong: boolean } }` |
| `oi_favorites` | `[id, ...]`（按收藏先后 push，展示倒序） |
| `oi_settings` | `{ theme: "light"\|"dark"\|"system" }` |
| `oi_progress` | `{ mode, studyMode, category, index, updatedAt }`（断点续刷；复习赛不写） |

- 写入采用 ≥200ms 节流，并在 `visibilitychange(hidden)` / `pagehide` 时强制落盘。
- JSON 损坏会自动回退默认值并清理脏数据；配额超限时静默降级，不阻塞使用。
- `streak` / `inWrong` 是后加字段：`normalizeRecord()` 读取时补齐，
  旧数据按「最近一次是否答错」推断 `inWrong` —— 升级后错题本不会被凭空清空，
  已毕业的题也不会复活。

---

## 维护题库

题库共 **2547 题**：835 道简答题 + 1540 道单选题 + 172 道多选题，分布在 25 个分类中。

### 当前进度

做题模式改为**只含选择题**后，每个分类都补充了选择题，现在：
**23 个分类的选择题均 ≥ 45 道**（最少 51、最多 84），满足做题模式的可用性；
Python 分类目前只有简答题，做题模式暂不覆盖。

| 分类 | 总题数 | 简答 | 单选 | 多选 | 选择题 |
|---|---|---|---|---|---|
| 网络基础 | **124** | 45 | 70 | 9 | 79 |
| Shell脚本 | **122** | 45 | 69 | 8 | 77 |
| 容器与K8s | **122** | 38 | 73 | 11 | 84 |
| 综合场景题 | **121** | 70 | 43 | 8 | 51 |
| Linux基础 | **120** | 40 | 70 | 10 | 80 |
| MySQL | **110** | 32 | 70 | 8 | 78 |
| Redis | **110** | 32 | 70 | 8 | 78 |
| 监控告警 | **110** | 35 | 68 | 7 | 75 |
| CI/CD | **106** | 34 | 66 | 6 | 72 |
| MongoDB | **101** | 24 | 69 | 8 | 77 |
| 消息队列 | **101** | 23 | 70 | 8 | 78 |
| 日志与ELK | **101** | 29 | 66 | 6 | 72 |
| 自动化与配置管理 | **101** | 31 | 64 | 6 | 70 |
| 云与高可用 | **101** | 30 | 64 | 7 | 71 |
| 安全与跳板机 | **100** | 32 | 62 | 6 | 68 |
| LVS/HAProxy | **100** | 24 | 69 | 7 | 76 |
| 存储与备份 | **100** | 28 | 66 | 6 | 72 |
| DNS | **95** | 19 | 69 | 7 | 76 |
| iptables/firewalld | **95** | 22 | 67 | 6 | 73 |
| Nginx | **95** | 22 | 67 | 6 | 73 |
| Tomcat/JVM | **95** | 21 | 68 | 6 | 74 |
| 虚拟化 | **95** | 27 | 62 | 6 | 68 |
| Git/GitLab | **95** | 23 | 65 | 7 | 72 |

**待填充：无。** `scripts/pending-categories.mjs` 的白名单已清空，
校验器现在要求「24 个分类全部有题」——这是题库建设的完成态。

### 选择题补题规范

批量补选择题有专门规范 [`docs/batch-choice-spec.md`](docs/batch-choice-spec.md)，
要点：

- **口径**：「每类补充 45 题，简单 20 / 中等 15 / 困难 10」中，
  `20+15+10=45` 说明这三项是**新增题目内部的难度配比**，45 是**新增量**
  （不是「补足到 45 道」）。
- **流程**：写到 `scripts/batch-choice-*.json`，再用 `merge-batch.mjs` 合并；
  **不要直接改 `public/data/questions.json`**。
- **解析质量**（用户明确要求过「答案不要过于简洁」）：每条解析 400~700 字，
  覆盖「为什么对 / 干扰项错在哪 / 排查链路与关键命令 / 具体案例 / 易混点」。

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

题目按分类**分段编号**，避免未来插题重排 id 打乱用户学习记录。
早期题目已全部迁入各自编号段（原 1–119 不再使用，见下文「编号段迁移」）：

| 分类 | id 段 | 分类 | id 段 |
|---|---|---|---|
| DNS | 1000 – 1199 | iptables/firewalld | 1200 – 1399 |
| Nginx | 1400 – 1599 | LVS/HAProxy | 1600 – 1799 |
| Tomcat/JVM | 1800 – 1999 | MongoDB | 2000 – 2199 |
| 消息队列 | 2200 – 2399 | 存储与备份 | 2400 – 2599 |
| 虚拟化 | 2600 – 2799 | Git/GitLab | 2800 – 2999 |
| 日志与ELK | 3000 – 3199 | 自动化与配置管理 | 3200 – 3399 |
| 云与高可用 | 3400 – 3599 | MySQL | 3600 – 3799 |
| Redis | 3800 – 3999 | Linux基础 | 4000 – 4199 |
| Shell脚本 | 4200 – 4399 | 网络基础 | 4400 – 4599 |
| 容器与K8s | 4600 – 4799 | CI/CD | 4800 – 4999 |
| 监控告警 | 5000 – 5199 | 安全与跳板机 | 5200 – 5399 |
| 综合场景题 | 5400 – 5599 | Python | 5600 – 5799 |
| **AI与大模型** | **5800 – 5999** | | |

> 编号段定义在 `scripts/merge-batch.mjs` 的 `ID_RANGES`，新增分类时**必须两处同步更新**
> （`ID_RANGES` + 本表），否则会漏记。Python 分类曾漏登记本表，已补。

### 编号段迁移（1–119 → 各分类段）

早期题库用 1–119 连续编号，与「按分类分段」的约定不一致，已迁移：

| 分类 | 题数 | 迁移后 id 段 |
|---|---|---|
| Linux基础 | 12 | 4115 – 4126 |
| Shell脚本 | 15 | 4315 – 4329 |
| 网络基础 | 14 | 4515 – 4528 |
| MySQL | 13 | 3715 – 3727 |
| Redis | 12 | 3915 – 3926 |
| 容器与K8s | 11 | 4715 – 4725 |
| CI/CD | 11 | 4915 – 4925 |
| 监控告警 | 12 | 5115 – 5126 |
| 安全与跳板机 | 7 | 5315 – 5321 |
| 综合场景题 | 12 | 5540 – 5551 |

迁移只改 `id`，题目内容、插图挂点、答案内的 `[[图:id]]` 全部不动。
**用户本地学习记录会受影响**：进度按 id 存储，老 id 的记录会变成「未知 id」
（保留但不计入统计）。为此 `src/utils/idMigration.js` 在启动时自动把旧记录按上表映射改写。


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

### 选择题判定后**停在本题**，不自动翻页

早期实现在判定 1.4 秒后自动 `goTo` 下一题，本意是「刷得快」，但用户反馈：
「判断对错后不要自动进入下一题，不然我看不了解析，怎么学习呢」。

选择题的价值几乎全在解析里（为什么错、正确答案为什么对），1.4 秒连滚动到解析都不够。
现在判定后停在本题，前进的出口是用户自己给的：吸底「下一题 →」/ 左滑 / `→` 键。
末题按钮文案是「完成本轮」，避免点「下一题」却直接结束的语义错位。

### 以后要加新题型（判断、填空等）

1. `src/utils/constants.js` 的 `QUESTION_TYPES` 加值，`TYPE_LABEL` 加标签
2. `src/utils/question.js` 加判定函数，`getType()` 已做缺省回退，旧数据不受影响
3. `scripts/validate-data.mjs` 加对应校验分支
4. 在 `QuestionView` / `PracticeView` 加渲染分支（两者结构一致）

---

## 列表分页

题库 / 错题本 / 收藏页统一分页，**不做无限滚动**：

- 每页 **10 条**（改 `src/utils/constants.js` 的 `PAGE_SIZE` 全局生效）。
  10 条约 3-4 屏，扫一遍就能到底；15 条时要滚很久才见底，容易误以为「列表只有这些、没有下一页」。
- 分页控件**吸底固定**，滚到任何位置都能翻页，不必先滚回顶部。
- 只在**超过一页**时出现；不足一页完全不显示，避免多余 UI。
- 题库页码写进 URL（`/bank?category=MySQL&page=2`），刷新与浏览器后退都能恢复；切换筛选重置回第 1 页。
- 错题本/收藏页在条目减少（连对毕业、取消收藏）导致页码越界时，自动收敛到有内容的页。
- 统计页较长，提供悬浮「回到顶部」按钮。

---

## 错题本与连对毕业

**答错 / 自评「不会」进错题本，连续答对 3 次才移出**（`WRONG_CLEAR_STREAK`）。

```
答错 / 不会  →  inWrong = true,  streak = 0
答对 / 会    →  streak + 1
               若本来在错题本且 streak >= 3  →  inWrong = false（毕业）
               本来不在错题本 → 永远不因「答对」而进来
```

**为什么不是「答对一次就移出」**：一次性答对只说明刚背下来了，可能只是蒙对；
3 次才对得起「已掌握」这个判断。这也是最初实现的反面——早期是「最近一次答错」
的实时镜像，答对即消失，等于把最该复习的题过早清掉。

规则由 `studyStore.mark()` **一处**实现，所以刷题、每日一题、复习赛三条路径自动一致，
不需要各页面自己判断。

页面表达（否则用户会以为是 bug）：

- 错题本列表上方一行：`连对 3 次自动移出 · 任意方式刷到都算`
- 每题三个小圆点 + `连对 1 / 3`
- 刷题/复习时题头显示 `错题 2/3` 胶囊（只在题确实在错题本时）

老数据兼容：`normalizeRecord()` 给旧记录补 `streak = 0`、`inWrong` 按「最近一次是否答错」
推断，升级后错题本不会被凭空清空，已毕业的题也不会复活。

---

## 首页的两个「今天做什么」

### 每日一题

以**本地日期**为种子从题库挑一道，同一天刷新多少次都是同一题，跨天自动换。

- **固定而非随机**：随机的话刷新一次就换题，「今天这题」就没有任何意义。
- **优先高频题**：只有一道题的位置，不该落在低频偏题上。
- **按 id 排序后再取**：否则题库一旦重新排序（补题、整理），当天的题会跟着变，
  用户手里的链接和昨天读过的内容就对不上。
- 点进去是**题目详情页**（能看解析、能收藏、能重做），与刷题页的连续作答不重复。
- 今天答过显示「今天答对了 / 答错了」并转绿转红；只认今天的记录。

实现在 `src/utils/daily.js`：`hashString`（FNV-1a）、`dateKey`（本地时区 YYYYMMDD）、
`pickDailyQuestion`。纯函数，测试可注入日期。

### 复习巩固（复习赛）

| 入口 | 题量 | 题池 |
|---|---|---|
| **每日复习** | 15 题 | 全库随机 |
| **错题复习** | 10 题（错题不足则全取） | 错题本随机 |

与「连续刷」的队列是两个东西，所以单独建模（`REVIEW_MODES` / `REVIEW_SIZES` /
`pickReviewSet`）：

- 进入方式 `/practice?review=daily|wrong`，**直接出题**，跳过「选择练习方式」
- **不写断点进度**：这是「今天练这一批」，下次进来要重新抽才有意义
- 顶栏换成「每日复习 / 错题复习」标题，不显示顺序胶囊与模式切换（抽出来的题换顺序没意义）
- 完成页按钮是「再来一批」（重新抽）与「回首页」

`pickReviewSet(questions, { size })` 洗牌后取前 N 个；题池不足时返回全部（不凑数、不重复），
可注入 `random` 固定结果以便测试。

---

## 练习模式（做题 / 背题）

`/practice` 是**两步流程**：

```
第一步：选择页（不显示题目）
┌──────────────────────────┐
│ ⚡ 做题模式                │   只有选择题 · 点选项即判定
│ 📖 背题模式                │   只有简答题 · 看题背答案
└──────────────────────────┘

第二步：题卡页
[ 顺序 ] [ 随机 ]        第 3 / 726 题      ← 只剩题目顺序
右上角：[ 做题模式 ⌄ ]                        ← 点一下切另一种
```

| 模式 | 题型 | 答案默认 | 适合 |
|---|---|---|---|
| **做题模式**（`practice`） | **只有选择题** | —（选项即作答） | 快速过细节、查漏 |
| **背题模式**（`memorize`） | **只有简答题** | **展开**（直接看答案） | 考前反复背 |

### 为什么两个模式的题型互斥

选择题「点一下就判对错」，是快节奏的做；简答题要自己讲出来再对照答案自评，
节奏慢，是背。混在一个队列里，两种节奏会互相打断。

原本 `practice` 是「全部题」，2026-10 按用户要求改成只含选择题 ——
刷题时专心做选择题，背题时专心背简答，两边都不被打断。

### 为什么改名叫「做题模式」

它现在只含选择题，而「刷题」在运维人的语感里泛指所有练习，名字会误导。
「做题 / 背题」两字对仗，一眼看出差别：一个动手选，一个开口背。

> 改名的连带影响：`describeProgress` 的 `studyModeLabel` 由「刷题」改为「做题」；
> 首页 CTA 从「开始刷题 / 继续刷题」改为「开始练习 / 继续练习」
> （它指向的是两条路，不该只说其中一条）。底部 Tab 仍叫「刷题」，
> 因为那是页面名，页面里同时提供做题与背题两种模式。

### 交互的演进（三轮调整后的最终形态）

| 版本 | 交互 | 问题 |
|---|---|---|
| v1 | 进入即出题卡，顶部一行模式按钮 + 说明面板 | 太花哨，题目和选择混在一起 |
| v2 | 进入先出两个大按钮，选定后出题卡 | 方向对了，但视觉单调 |
| **v3（当前）** | 两步流程 + 按钮带图标与说明 + 右上角一个切换按钮 | — |

三个细节：

- **右上角切换按钮**：进入刷题后，练习方式不再是页面里的一行（省掉一整行高度），
  收进页头右上角，**点一下切到另一种**——和首页的主题切换是同一个交互习惯。
- **背题模式默认展开答案**：它的用途就是「看题背答案」，进来还要自己点「看答案」是多余的。
- **收藏按钮跟着题目走**：原来在页头右上角，容易被误解为「收藏整个页面」；
  现在放在**题卡题头行的末尾**，视觉上明确属于当前这道题。
- **复习赛也按模式收窄题型**：从做题页进复习只抽选择题，否则会抽到简答题、
  又要手点「看答案」+ 自评，节奏完全不同。

### 关键设计

- **`studyMode` 参与续刷判定**：换了练习模式就不算「同一批题」，会从头开始
  （`resolveStartIndex` 同时比对 `mode`、`studyMode`、`category` 三项）。
- **`studyMode` 会存进 progress**（`saveProgress` 一并写入），否则自动续刷无法恢复上次在练什么。
- **断点自动续刷**：进入页面不需要点「继续上次」，直接从上次位置恢复，顶部一行提示告知。
- 首页不再有「开始刷题 / 继续上次」入口，**统一走底部 Tab 的「刷题」**。
- `/settings` 可设默认练习方式（存 `oi_settings.studyMode`）。

---

## 已移除：模拟面试

原设计有 `/interview` → `/interview/run` → `/interview/result` 三步模拟面试
（随机抽题 + 自评评估 + 写入学习记录）。

**已按需求全部移除**：三条路由、三个视图、`interviewStore` 与对应测试文件均已删除，
首页与统计页的入口卡片也一并去掉。`tests/studyMode.test.js` 里有「模拟面试已移除」
的源码级断言，防止后续被误加回来。

---

## 题目详情页：左右滑动切题

`/question/:id` 底部**没有「上一题 / 下一题」按钮**，改为左右滑动：

- 左滑 → 下一题，右滑 → 上一题（复用 `utils/gestures.js` 的 `attachSwipe`）
- **首尾不循环**：`go(q)` 里判空，第一题右滑、最后一题左滑都不会跳转
- 底部只留一行淡色提示「左右滑动切换上一题 / 下一题」

### 必须同时设置 touch-action

```css
.stage,
.stage * {
  touch-action: pan-y;
}
```

**这个坑踩过一次**：只给 `.stage` 设 `touch-action` 是不够的，因为该属性**不继承**——
手指落在子元素（标题、答案文本、表格）上时，手机浏览器会先接管横向手势，导致滑动失灵。
必须用 `.stage *` 覆盖所有子孙。`tests/bank-detail.test.js` 与 `tests/touch-action.test.js`
都会读源码断言这两条规则存在。

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
| 题库页一直转圈 / 显示加载失败 | 索引或分片路径错、未上传，或改了题库没重新生成分片 | 确认 `dist/data/questions-index.json` 与 `dist/data/answers/manifest.json` 存在；本地跑 `npm run split:data` 再构建；点页面上的「重试」 |
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
| **分类** | 全部 + 24 个分类 | **默认折叠**，只显示前 7 个，点「展开全部 24 个分类」再显示其余 |
| **频率** | 全部 / 高频 / 中频 / 低频 | 单行平铺 |
| **难度** | 全部 / 简单 / 中等 / 困难 | 单行平铺，与频率同构 |

**分类为什么要默认折叠**：24 个分类平铺要占 5-6 行，把搜索框和列表挤到很下面，首屏几乎看不到题目。折叠后首屏直接看到题目。

折叠的几条细节：

- 用**限制数量**（前 7 个）而不是 CSS 限高——胶囊宽度随屏幕变化（375px 与 480px 一行能放的个数不同），限高在不同机型下折叠效果不一致。
- **选中的分类一定可见**：若选中项落在被折叠的那批里，会把它补到最前面，避免「选中了却看不见自己的选择」。
- 折叠时按钮上提示 **「已筛选 N 项」**，提醒还有生效中的条件没展开看。
- 分类数 ≤ 7 时**不出现**展开按钮（没有需要展开的东西）。

---

## 「我的」页与「设置」页

### 我的（`/me`）

只放「每次打开都要看」的内容：

- **个人卡**：头像 + 总进度文字 + 三格数字（已刷 / 错题 / 收藏，点击跳对应页）
- **掌握情况**：四宫格（简答掌握率 / 选择正确率 / 今日已刷 / 题库总量）
- **各分类掌握度**、**各分类选择正确率**：**默认折叠**，点标题展开（避免页面过长）
- **我的题目**：错题本、我的收藏入口（带数量）
- **设置入口**：页头右上角齿轮图标

### 设置（`/settings`）

只放「偶尔才改」的内容：

- **外观**：浅色 / 深色 / 跟随系统（三态分段控件）
- **默认练习方式**：刷题 / 背题（进刷题页时默认选中）
- **数据管理**：清空学习记录 / 清空收藏
- **关于**：版本、存储方式、题库规模

### 为什么拆成两个页面

原来「我的」页把主题、默认模式、清空数据、关于全塞在一起，页面很长，
而其中大部分内容一个月也不会点一次。按「看数据」和「改配置」拆开后，
两边都变短了。

### 为什么二次确认一律用页内确认条，而不是 `window.confirm`

这一页曾出现「**点了清空按钮完全没反应**」的 bug，根因是用了 `window.confirm`：

- 微信内置浏览器（X5 内核）会**静默返回 `false`** 或干脆不弹窗；
- 部分安卓 WebView、「禁止弹窗」的浏览器设置下同样失效；
- 表现就是「点击无反应」——没有报错、没有提示，用户以为是按钮坏了。

修复：改成**页内确认条**（渲染在 DOM 里，`role="alertdialog"`），任何环境下都能显示与点击。

**这条规则已推广到全项目**，三处二次确认全部改掉：

| 位置 | 确认内容 |
|---|---|
| `/settings` | 清空学习记录 / 清空收藏 |
| `/favorites` | 全部取消收藏 |

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

#### CI 突然变慢怎么排查

**先分清是「步骤变慢」还是「runner 开销」**，两者处置完全不同：

```
runner 开销 = job 总耗时 − 各 steps 耗时之和
```

用 GitHub API 取数据：

```bash
# 逐个 job 打印「总耗时 / steps 之和 / 差值」
curl -s "https://api.github.com/repos/<owner>/<repo>/actions/runs/<run_id>/jobs" \
  | jq -r '.jobs[] | "\(.name)\t\(.started_at)\t\(.completed_at)"'
```

实测一次的异常数据（`run 84`）：

| job | 总耗时 | steps 之和 | **runner 开销** |
|---|---|---|---|
| 22.x | 207s | 38s | **169s** |
| 20.x | 132s | 37s | **95s** |

对比同一天的正常 run（81/82/83）：steps 之和 27~40s，**开销只有 2~4s**。

**结论：多出来的 4~5 分钟全在「步骤之间」**，是 GitHub 托管 runner 的调度/IO 抖动，
不是测试或构建变慢（单元测试步骤始终稳定在 20s 左右）。处置就是 **Re-run jobs**。

**踩过的坑（别重复）**：曾以为「BASE_PATH 构建 + 产物校验 + 上传 artifact」
是耗时大头，把这三步限定到只让 22.x 跑。**实测只省了 4 秒**
（子目录构建 4s、校验 0s、上传 0s）—— CI 总时长由「最慢的那个 job」决定，
而这几个步骤本来就不是瓶颈。

> 要真正减少 CI 等待时间，方向是**减少 matrix**（如 PR 只跑 22.x、main 才跑双版本），
> 而不是砍掉单个 job 里的轻量步骤。

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

这一条命令依次执行：编码检查 → 题库校验 → 插图文字检查 → 全部测试 → 生产构建。
**任一环节失败都不要提交**。CI 里跑的是同样的检查，本地能过 CI 才可能过。

如果是 UI 改动，还应在浏览器里把宽度切到 **375px** 看一眼（含深色模式）。

> **README 要跟着改**：每次变更都要同步更新本文档对应章节——
> 新增/移除的页面与路由（功能一览）、交互规则（如判定后停不跳题、连对毕业门槛）、
> 存储结构变化（`oi_records` 的字段）、测试文件与用例数、目录结构、
> 「未实现」清单（做完的要从里面移走）。文档与代码对不上，比没有文档更糟。

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

### 看大图：双击打开 + 滚轮/双指缩放

图解的 SVG 画布固定 340 宽，在手机上被缩到 ~0.85 倍，里面 7.5~9px 的标注字实际只剩
6~8px —— 正常视力都吃力。重排 34 张图不现实，所以给一个「点开看大的」出口：

- **点任意图解** → 全屏查看层（`Teleport` 到 body，模态：锁背景滚动、吞掉刷题快捷键）
- **桌面：滚轮缩放**（触控板捏合在浏览器里也派发 `wheel`，一并生效）
- **移动端：双指缩放**
- 缩放范围 **0.35 ~ 5 倍**；双击复位；`Esc` / 点空白 / ✕ 关闭
- 顶栏显示当前百分比

**图宽按可视区平铺，不是固定像素**：

```css
.ans-zoom__inner        { box-sizing: border-box; width: 100%; }
.ans-zoom__inner .fig   { width: calc(100% * var(--zoom, 1)); }
```

`100%` 参照画布的**内容盒**，内边距与桌面滚动条被自动扣掉，所以 100% 时正好铺满
可视区、不越界；放大只是在这之上乘倍数。

**为什么用 CSS 宽度而不是 `transform: scale()`**：transform 不改变布局尺寸，
滚动范围不会跟着变，放大后超出屏幕的部分拖不过去，等于被裁掉。

实现见 `src/utils/pinch.js`，几个容易踩的坑：

| 坑 | 现象 | 处理 |
|---|---|---|
| `touch-action: pan-x pan-y` 会禁用 pinch-zoom | 两指一捏，图没动（浏览器接管并 `pointercancel`） | 第二根手指落下瞬间把元素 `touch-action` 改成 `none`，抬手/取消/解绑还原 |
| 单指也挂不挂 window 监听 | **单指一挪图就缩放**（抬起记录清不掉，下次凑成两条指针） | 第一个 `pointerdown` 就挂监听，`up/cancel` 都清记录 |
| 起手间距直接当分母 | **轻轻一挪就放得很大**（两指隔 25px 时分开到 50px 就是 2 倍） | 分母下限 48px + 6% 死区 + 0.62 次幂阻尼 |
| `margin: 0 auto` 居中超宽子元素 | 放大后左侧被推到容器外、滚不回来 | 内层 flex + `flex-start`，子项 `flex: 0 0 auto` |
| 缩放下限设成 1 | **只能放大不能缩小**（基准已是屏宽 2.6 倍） | 下限放到 0.35 |

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

### 已注册的插图

共 **340 张**，按 25 个分类分组维护 —— 完整清单见 [`docs/figures-registry.md`](docs/figures-registry.md)
（含每张图的 id、内容与挂载题目）。

新增插图后需要同步该文档（追加一行），否则清单会与实际不符。

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
5. **文字必须留在画布内**：画布固定 340 宽，说明行写超了会被 SVG **直接裁掉**，
   放大也救不回来（裁切发生在画布坐标系里）。`npm run check:figures` 会按字符宽度
   估算每条 `<text>` 的实际占用并报出超界位置，已接入 `npm run verify`。
   修法见 [`docs/figure-text-rules.md`](docs/figure-text-rules.md)：拆行、加高画布，
   **不要缩小字号**（字号偏小正是要解决的问题）。
6. **文字不能互相压住、行距不能过紧**：这是第 5 条管不到的盲区 ——
   每行都没超边界，但两行挤在一起照样看不清。`check:figure-sfc` 现在会报两类：
   - **压字**：两个 `<text>` 横向重叠 >6px 且纵向重叠 >3px（同一行写了两段）；
   - **行距过紧**：同列相邻行间距 < 字号的 1.05 倍。

   阈值来自对现有 340 张图的实测分布（比值 ≤1.0 的 6 处全是真贴边，≤1.2 开始出现
   正常的两行说明），所以取 1.05 只抓真问题、不误伤。

   修法：把行距拉开（改 `y`）并同步加高 `viewBox`，或把长句拆成两条 `<text>`。
   注意 **左右分栏**（一列 `x=14`、另一列 `x=184`）里两列的 `y` 常常完全相同，
   规则已用「横向重叠 >6px」把它们排除掉。

   并行写图时可用文件名过滤，只看自己那几张：
   ```bash
   node scripts/check-figure-sfc.mjs MyFigure.vue
   node scripts/check-figure-text.mjs MyFigure.vue
   ```

### 答案正文的可读性

答案正文起始只有 13.5px，手机上长段落非常吃力（用户反馈「近视的都看不清」）。
现在正文 **16px / 行高 1.75**，标题 18px、表格 14px、代码 13.5px、列表续行 14px、
图注 12px —— 全链路一起抬，避免「正文大了、注释还是小字」。

`tests/answer-readability.test.js` 用「读源码断言阈值」的方式守住这些下限
（jsdom 不做排版计算，只能这样守护）。

---

## 视觉配色体系

为避免整站一片蓝灰，引入了一套语义化配色变量（定义在 `src/assets/styles.css`）。

### 1. 分类色板

24 个分类各有专属色，映射在 `src/utils/constants.js` 的 `CATEGORY_HUE`：

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
- **不要在 PowerShell 里用 `node -e "..."` 内联脚本改文件**（Windows 上这是最大的效率杀手）。
  PowerShell 会先解析命令行，`"` `'` `$` 和反引号会在 Node 看到之前被吃掉，
  表现为各种随机错误：`Unterminated string constant`、`Expected ',', got 'ident'`、
  `一元运算符后缺少表达式`，甚至把中文变成乱码再塞进文件。
  **正确做法**：把要改的内容写进 `.mjs` / `.json` 文件，再用纯参数调用脚本。
  注册插图与挂图用 `scripts/fig.mjs`（数据驱动，参数只有文件路径）：
  ```bash
  node scripts/fig.mjs register scripts/batch.json --dry-run   # 先看要做什么
  node scripts/fig.mjs register scripts/batch.json             # 实际写入
  ```
  `batch.json` 结构见 `scripts/fig.mjs` 头部注释。它幂等、锚点落进表格时自动退回开头，
  替代了此前散落的 50 多个 `register-batchN.mjs` / `attach-batchN.mjs`。
- **Windows 上 `vite build` 会随机失败**，报
  `[vite:esbuild-transpile] remove ...Temp\esbuild-xxxx: Access is denied`。
  **不是代码问题**：esbuild 把待转译模块写到 `%TEMP%` 再删除，而 QQProtect 等
  安全组件的实时扫描会短暂锁住新建文件，删除就失败。实测同一个工作区里，
  加 8 个新组件必现、去掉后连续 3 次全过——文件越多撞锁概率越高。
  **已修**：`npm run build` 改走 `scripts/build.mjs`，它把 `TMP`/`TEMP` 指到项目内的
  `.buildtmp/`（扫描器不覆盖），跑完自动清理。真身仍在 `npm run build:raw`（`vite build`）。
  若在别的机器上又遇到同样报错，先检查是否有杀软在扫系统 TEMP。
- **别用 PowerShell 的 `Set-Content` 写 `package.json`**：它会加上 UTF-8 BOM，
  导致 Vite 报 `Unexpected token '', "{" ... is not valid JSON`。
  用 Node 的 `writeFileSync` 写（不带 BOM）。`check:encoding` 能查出来这类问题。

---

## 分片数据（P0 性能优化第一步）

首屏慢的根源是「一次拉全量题库」：`questions.json` 4.20 MB / **gzip 1455 KB**。
而列表页其实只需要 `id / type / category / difficulty / frequency / question` 几个字段。

`npm run split:data` 会从 `questions.json` 生成两套产物：

| 产物 | 内容 | 原始 | gzip |
|---|---|---|---|
| `public/data/questions-index.json` | 列表页索引（7 字段） | 308 KB | **121 KB** |
| `public/data/answers/<slug>.json` | 25 个分类的答案分片（answer/explanation/options） | — | 最大 **85 KB**（k8s） |
| `public/data/answers/manifest.json` | 分类 → slug 映射 + 每片题数 | 很小 | — |

**体积收益**：首屏最坏情况（索引 + 最大分片）约 **gzip 206 KB**，
相比原来的 1455 KB 减少约 **86%**。

### 已切换：列表页走索引，详情/刷题按分类补答案

**已生效**。加载策略分两条路径：

| 场景 | 走哪个 | 拉多少 |
|---|---|---|
| 首页 / 题库列表 / 收藏 / 错题 / 统计 | `bank.loadIndex()` | 只有索引（gzip 121 KB） |
| 题目详情 | `loadIndex()` + `hydrateCategory(该题分类)` | 索引 + 1 个分片 |
| 刷题 / 复习（指定分类） | 同上 | 索引 + 1 个分片 |
| 刷题（全部分类） | `hydrateCategory('')` | 索引 + 全部 25 个分片 |

**实测首屏数据体积**（dev server 不压缩，取原始字节）：

```
questions-index.json      459 KB   ← 首屏只拉这个
answers/manifest.json       1 KB
────────────────────────────────
首屏合计                  ~460 KB   （旧方案 questions.json 是 4297 KB，减少 89%）
```

线上开启 gzip 后索引约 **121 KB**，相比原来的 **1455 KB** 减少 **92%**。

### 实现要点（改动这几处）

- `bankStore` 新增 `loadIndex()` / `hydrateCategory(category)` / `retryIndex()`
  - `loadIndex()` 有个守卫：**内存里已有题目时直接复用，不重复请求**
  - `hydrateCategory()` 同理：题目已带 `answer` 字段时不再请求分片
    （这条守卫让原有测试直接注入 FIXTURE 的模式继续有效）
- `main.js` 的预热从 `load()` 改为 `loadIndex()`
- 4 个列表页（`BankView` / `FavoritesView` / `HomeView` / `WrongView`）改 `loadIndex()`
- `QuestionView` 先取索引，再按该题分类补答案；**左右滑动切题时也会补**（切到的题可能属于别的分类）
- `PracticeView` 按当前分类补；`category` 为空（全部分类）时才拉全部分片

`fetchQuestions()` 与 `questions.json` **暂时保留** —— 作为兜底，等新路径稳定后再删。

**修改题库后必须重新生成分片**，否则会脱节（列表能看到题、点进去没答案）：

```bash
npm run split:data
```

`tests/splitData.test.js` 会校验索引与分片能否还原出 `questions.json` 的全部内容，
包括答案一致性、分类覆盖、slug 的 URL 安全性，以及 gzip 体积预算 —— 脱节会被测试拦住。

### 构建时剔除源数据（`questions.json` 不再部署）

`public/data/questions.json`（4.3 MB）**现在是编辑期数据源**：`merge-batch.mjs`、
`fig.mjs`、`check-figure-placement.mjs`、`validate:data` 等都读它。运行时已完全不碰。

所以构建时用 `scripts/vite-plugin-strip-data.mjs` 把它从 `dist` 里删掉
（Vite 5 只能整体开关 `publicDir` 拷贝，没有「排除个别文件」的配置，所以用
`closeBundle` 钩子事后删除）：

```
构建输出： stripped 1 source file(s) from dist (4300 KB)
dist/data 从 7.83 MB 降到 3.63 MB
```

**为什么必须用插件而不是删文件**：删了仓库里的 `questions.json`，整套编辑工具链就没了。
它必须留在仓库、但不出现在部署产物 —— 这是「源数据」与「运行时数据」的区别。

`tests/distData.test.js` 守住这条：校验插件确实挂了、剔除目标正确，
并扫描 `src` 确认没有 URL 常量再指向 `questions.json`（防止有人加了新的全量请求）。

### 为什么分片文件要提交进 git

GitHub Pages 直接发布构建产物，而构建不会自动跑 `split:data`，
所以分片必须以「已生成」的状态存在于仓库（不是构建产物）。

---


## 已知限制

- 无后端 / 无 AI：所有判定都在本地完成，不调用任何远程接口。
- 不支持多设备同步；换浏览器或清缓存会丢记录。
- 题库规模按 ≤1000 题设计，不做虚拟滚动；列表已分页（10 条/页）。
- `validate:data` 只校验结构，**不判断主题重复**，加题后需人工过一遍同分类列表。

---

## 未实现（P2 扩展点已预留）

| 功能 | 预留位置 |
|---|---|
| 登录 / 云同步 | `src/api/dataService.js`（替换 fetch 实现即可，store 不用改） |
| PWA 离线 | 接入 `vite-plugin-pwa`，无需改业务代码 |
| 导出 / 导入学习记录 | `studyStore` 的 records/favorites 已是纯 JSON，加序列化即可 |
| 艾宾浩斯复习计划 | `streak` / `lastReviewed` 已在记录里，可加间隔调度 |

> 「每日一题」已实现，见[首页的两个「今天做什么」](#首页的两个今天做什么)。
> 「模拟面试」已移除，不再是扩展点。

---

## 技术评估：待改进项清单

以下按「已实测到的问题」与「产品能力缺口」分开列。每项都标了**证据**与**建议做法**，
不是泛泛而谈「可以优化性能」。

### P0 — 已确认的性能问题

> **先看压缩后的真实数字**（用 `zlib` 实测，不是估算）：
>
> | 数据 | 原始 | gzip | brotli |
> |---|---|---|---|
> | `questions.json`（全量题库） | 4.20 MB | **1455 KB** | 1057 KB |
> | 列表页所需字段组成的索引 | 226 KB | **89 KB** | — |
> | 按分类拆分后最大单片（容器与K8s） | — | 79 KB | — |
>
> 结论：**首屏瓶颈是题库本身的 1.46 MB（gzip 后），不是插图组件的 chunk 体积。**
> 下面两条按这个结论排优先级。

**1. 题库 4.2 MB 单文件全量加载（gzip 后仍 1.46 MB）— 最优先**

`public/data/questions.json` 实测 4.20 MB / gzip 1455 KB，`fetchQuestions()` 一次 `fetch`
全量拉取，且 `cache: 'no-cache'`（每次强行走网络校验）。手机弱网下首屏会很慢。

而首屏真正需要的信息量很小：列表页只用
`id / type / category / difficulty / frequency / question`，
这些字段组成的索引实测 **226 KB（gzip 89 KB）**，只占全量的 **6%**。

建议做法（已实测过体积）：

```
questions-index.json         226 KB / gzip  89 KB   ← 列表页只用这个
data/<分类>.json             最大 gzip 79 KB          ← 进分类/看详情时按需加载
```

- 索引方案首屏 gzip 从 1455 KB 降到 **89 KB（-94%）**；
- 最坏情况（进一个大分类）是 89 + 79 = 168 KB；
- 代价：题库从 1 个文件变 26 个，`validate:data`、`merge-batch.mjs`、
  `dataService`、`bankStore` 都要跟着改，详情页需要处理短暂加载态。

**2. 340 个插图组件全量打进共享 chunk（未压缩 892 KB，gzip 265 KB）— 次优先**

实测 `npm run build`：`gestures-*.js 892.05 kB`，Vite 警告超过 500 kB。

**根因不是 chunk 划分策略**：用字符串检索确认该 chunk 里装的是
340 个插图组件的渲染代码（含 `t("rect", …)` 形式的组件渲染语句）。
`index.js` 用静态 `import` 引入全部 340 个组件，而 `AnswerText.vue` 会用到整张注册表，
于是它们被打包成一个共享 chunk，**任何页面都会下载全部插图**。

⚠️ **重要修正**：这一条之前建议用 `manualChunks` 切分，**那个建议是错的** ——
切分只会把它拆得更零碎，不会减少总量。正确的方向是「按需加载」。

⚠️ **实测踩坑**：试过把 `index.js` 改成 `defineAsyncComponent(() => import(...))`，
构建产物从 892 KB 降到 80 KB（-812 KB），**但会破坏功能**：
`getFigure()` 返回的 `AsyncComponentWrapper` 在测试环境下渲染不出任何内容
（`.fig` / `svg` 均为 0），图解放大层随之失效。
试过 `flushPromises` 循环等待、`<Suspense>` 包裹、`suspensible: false`，**均无效**。
对照组：直接 `await import('./DnsResolve.vue')` 再挂载完全正常，
说明问题出在 `defineAsyncComponent` 与该测试环境（`@vue/test-utils` + jsdom）的交互。

所以这条**暂缓**，前置条件是先有浏览器级验证手段（见 P2 的 Playwright 一条），
否则改了无法确认核心交互没坏。压缩后的实际收益约 200 KB，也小于第 1 条的 1.37 MB。

**3. 加载时间预算与重试退避 — ✅ 已解决**

实现内容：

- **请求超时 15 秒**（`dataService` 的 `REQUEST_TIMEOUT_MS`）。浏览器原生 `fetch`
  没有超时，弱网或中间设备挂住会一直转圈，用户既看不到错误也用不上重试。
  用 `AbortController` 主动中断，中断包装成可重试的 `DataError`。
  > 为什么是 15 秒：索引 gzip 后 121 KB，4G 弱网约 1.2 秒、极弱网约 6 秒，留一倍余量。
- **错误分级**：`DataError` 带 `retryable` / `timeout` 标记 ——
  网络异常与超时、5xx/408/429 判定为可重试；**数据格式错误与 4xx 判定为不可重试**
  （重试也没用，直接告诉用户根因）。
- **指数退避**：连续失败间隔 1s → 2s → 4s → 8s，**封顶 15 秒**（与请求超时同量级）。
  成功即清零。防止用户连点「重试」或将来接入自动重试时把带宽打满。
- **界面反馈**：错误态文案会说明「重试过于频繁，请 N 秒后再试」，
  冷却期内「重试」按钮置灰；不可重试类错误则提示「请运行 `npm run split:data` 后重新构建」。
  文案逻辑统一在 `src/utils/retryHint.js`（5 个视图共用，避免各写一遍改漏）。

测试见 `tests/retryBackoff.test.js`（6 个用例，用 mock `dataService` 驱动真实
`loadIndex()`，验证递增、封顶、清零、不可重试不设冷却）。

### P1 — 产品能力缺口

| 缺口 | 现状 | 建议 |
|---|---|---|
| **搜索关键词高亮** | ✅ **已实现**：列表卡片命中处渲染 `<mark>` | 见下节说明 |
| **错题本按知识点归类** | 只有列表与「连对毕业」 | 按分类聚合错误率，生成「薄弱环节 TOP5」 |
| **学习数据可视化** | 「我的」页有分类掌握度图表 | 加时间维度（本周/本月趋势、连续打卡曲线） |
| **模拟面试** | 已移除 | 可回归为「随机抽 N 题 + 计时 + 评分卡」 |
| **协作/分享** | 无 | 分享某道题/某个题单的链接（带 `?ids=` 参数） |
| **题库版本化** | 无 | 题库加 `version` 字段，本地记录带上版本，升级时提示「题目已更新」 |
| **离线可用** | 无 PWA | 已在 P2 列表，优先级可提到 P1（4.2 MB 恰好适合一次性缓存） |

#### 搜索关键词高亮（已实现）

列表卡片的题干命中处会渲染 `<mark>`，多关键词、大小写不敏感都支持。

**实现要点**：

- `src/utils/highlight.js` 把文本切成 `{ text, hit }` 片段数组；
- 模板用 `<mark v-if="seg.hit">` 插值渲染，**全程不使用 `v-html`**
  （题库内容可能含 `<script>` 等任意字符，用 HTML 拼接就有注入风险）；
- **先截断、再高亮**：卡片只显示题干前 50 字，若反过来先高亮再截断，
  截断点会切在片段中间导致缺字；
- 高亮底色用 `color-mix(in srgb, var(--c-warning) 32%, transparent)` ——
  半透明底与文字保持原有对比关系，深浅两套主题都清晰。

测试：`tests/highlight.test.js`（16 个，覆盖重叠/相邻/边界/拼接还原）、
`tests/questionCardHighlight.test.js`（8 个，含 XSS 防护验证）。

**关于「搜索答案」的说明**：搜索本身覆盖题干/标签（分片改造后列表页只有索引，
不含答案字段）。**不需要扩展到答案** —— 搜到题目点进去就能看答案，
为搜答案而加载全部分片（约 3 MB）属于伪需求。已明确不做。

### P2 — 工程质量

| 项 | 现状 | 建议 |
|---|---|---|
| **E2E 测试** | 无（只有 717 个单元/组件测试） | 加 Playwright 覆盖「进分类→刷题→答题→看解析」主流程 |
| **错误上报** | 无埋点（`sendBeacon`/`reportError` 计数为 0） | 加最小可用错误上报，至少记录解析失败的题目 id |
| **a11y 完整性** | 有 111 处 `aria-*`/`role`，但未做系统性审计 | 跑一次 axe 检查，补齐焦点管理与键盘可达 |
| **i18n** | 无 | 若只面向中文可不做，但需明确「不做的理由」 |
| **题库质量校验** | `validate:data` 只校验结构，不判主题重复 | 加「同类题目干相似度」检测（如编辑距离/向量相似），提示可能重复 |
| **图片资源** | 无图片（全用内联 SVG，这是优点） | 保持；若将来加截图，需加体积守卫 |

### 已知取舍（不建议改）

这几项看似可优化，但当前选择是合理的，写下来避免反复讨论：

- **无后端、无登录**：定位是「离线可用的个人题库」，加后端会带来隐私与运维成本；
- **内联 SVG 而非图片**：可缩放、可随主题变色、体积可控，比 PNG 更合适；
- **本地分页而非虚拟滚动**：4.2 MB 里单分类最多几百题，分页 10 条足够，
  虚拟滚动会显著增加复杂度。


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

