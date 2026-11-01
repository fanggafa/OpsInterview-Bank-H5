# 出题规范

> 说明「题目怎么写、编号怎么分、校验规则是什么」。
> 插图规范见 [figure-authoring](figure-authoring.md)，架构见 [architecture](architecture.md)。

## 题库现状

当前 **2892 题**：1000 简答 + 1720 单选 + 172 多选，分布在 26 个分类。

| 分类 | 题数 | 分类 | 题数 |
|---|---|---|---|
| Kubernetes | 174 | 综合场景题 | 173 |
| Linux基础 | 161 | 网络基础 | 148 |
| MySQL | 142 | Shell脚本 | 140 |
| 云与高可用 | 134 | 监控告警 | 126 |
| CI/CD | 124 | 消息队列 | 120 |
| Redis | 118 | 自动化与配置管理 | 117 |
| Nginx | 107 | 存储与备份 | 103 |
| LVS/HAProxy | 102 | MongoDB | 101 |
| 日志与ELK | 101 | 安全与跳板机 | 100 |
| Tomcat/JVM | 98 | DNS | 95 |
| iptables/firewalld | 95 | 虚拟化 | 95 |
| Git/GitLab | 95 | AI与大模型 | 58 |
| Docker | 33 | Python | 32 |

做题模式只含选择题，背题模式只含简答题。

## 题目结构

### 简答题

```json
{
  "id": 8501,
  "type": "short",
  "category": "Linux基础",
  "difficulty": "中等",
  "frequency": "高频",
  "question": "……",
  "answer": "纯文本，可用 \\n 换行与缩进",
  "tags": ["负载", "性能排查"]
}
```

**简答题不能有 `options` 字段**（有会被校验拦下）。

### 选择题（单选 / 多选）

```json
{
  "id": 7601,
  "type": "single",
  "category": "MySQL",
  "difficulty": "中等",
  "frequency": "高频",
  "question": "InnoDB 默认的事务隔离级别是？",
  "options": [
    { "key": "A", "text": "READ UNCOMMITTED" },
    { "key": "B", "text": "READ COMMITTED" },
    { "key": "C", "text": "REPEATABLE READ" },
    { "key": "D", "text": "SERIALIZABLE" }
  ],
  "answer": ["C"],
  "explanation": "InnoDB 默认 REPEATABLE READ……",
  "tags": ["事务", "隔离级别"]
}
```

## 字段约束

| 字段 | 约束 |
|---|---|
| `id` | 正整数，唯一，**必须落在所属分类的编号段内** |
| `type` | `short` / `single` / `multiple`（缺省为 `short`） |
| `category` | 26 个分类之一（枚举在 `src/utils/constants.js`） |
| `difficulty` | **简单 / 中等 / 困难** |
| `frequency` | **高频 / 中频 / 低频** |
| `question` | 非空，**≤ 120 字**（超长会被拦，代码块也算在内） |
| `answer` | 简答：非空字符串；单选：**恰好 1 个 key**；多选：**≥ 2 个 key** |
| `options` | 仅选择题，2–6 项，key 必须**从 A 起连续** |
| `explanation` | 仅选择题，≥ 10 字 |
| `tags` | **数组**，2–5 个，不带 `#` |

### 最容易犯的三个错

| 坑 | 后果 | 做法 |
|---|---|---|
| `difficulty` 的值写进 `frequency` | 筛选器失效（曾发生 4 次） | 两个字段分开列清楚再合并，别让脚本自动填充 |
| `tags` 写成字符串 | 校验拦下 | 必须写成数组 |
| JSON 字符串里有**裸换行** | `JSON.parse` 失败 | 写成 `\n` 转义；用脚本生成而非手写 |

> **不要把 `difficulty` 机械映射成 `frequency`**。批 8 曾用「简单→高频、中等→中频、困难→低频」
> 自动填充，结果低频只剩 32 题（无法用于筛选），中频被塞进 516 题。
> 频率必须按「题目主题的实际热度」判断。

**频率分布目标**：每个分类内 **高频 40% / 中频 40% / 低频 20%**。
依据是「必问题约 4 成、会问但不一定约 4 成、偏门/深入追问约 2 成」。

`difficulty` 与 `frequency` 是两个**正交**维度：难题也可能是高频考点，
简单题也可能只是偏门小知识。

## 分类与编号段

每个分类预留 **500 个 id**。定义在 `scripts/merge-batch.mjs` 的 `ID_RANGES`。

| 分类 | id 段 | 分类 | id 段 |
|---|---|---|---|
| DNS | 1000 – 1499 | iptables/firewalld | 1500 – 1999 |
| Nginx | 2000 – 2499 | LVS/HAProxy | 2500 – 2999 |
| Tomcat/JVM | 3000 – 3499 | MongoDB | 3500 – 3999 |
| 消息队列 | 4000 – 4499 | 存储与备份 | 4500 – 4999 |
| 虚拟化 | 5000 – 5499 | Git/GitLab | 5500 – 5999 |
| 日志与ELK | 6000 – 6499 | 自动化与配置管理 | 6500 – 6999 |
| 云与高可用 | 7000 – 7499 | MySQL | 7500 – 7999 |
| Redis | 8000 – 8499 | Linux基础 | 8500 – 8999 |
| Shell脚本 | 9000 – 9499 | 网络基础 | 9500 – 9999 |
| Kubernetes | 10000 – 10499 | CI/CD | 10500 – 10999 |
| 监控告警 | 11000 – 11499 | 安全与跳板机 | 11500 – 11999 |
| 综合场景题 | 12000 – 12499 | Python | 12500 – 12999 |
| AI与大模型 | 13000 – 13499 | **Docker** | **13500 – 13999** |

> **新增分类时必须同步 4 处**：`ID_RANGES`（merge-batch.mjs）、`CAT_SLUG`（split-data.mjs）、
> `CATEGORIES` 与 `CATEGORY_ADVICE`/颜色（constants.js），以及本文档上表 + README。
> 漏改会被 `tests/idRange.test.js` 与 `tests/categoryOrder.test.js` 拦下。

### 分配新 id 时必须先查空闲块

区间里的 id **不是连续占用的**（历史新增散落各处）。直接用「区间起点 + n」会撞号，
撞号会被 merge-batch 静默跳过（题目丢失）。

```bash
node -e "
const q=require('./public/data/questions.json');
const used=new Set(q.map(x=>x.id));
const free=[];
for(let i=13500;i<=13999;i++) if(!used.has(i)) free.push(i);
console.log('Docker 区间空闲 '+free.length+' 个，从 '+free[0]+' 开始');
"
```

## 分批合并（推荐方式）

**不要直接改 `public/data/questions.json`**，大批量加题时：

```bash
# 1. 把题目写到 scripts/batchN-xxx.json（数组格式）
# 2. 合并进主库（按 id 去重、校验分类与编号段）
node scripts/merge-batch.mjs scripts/batchN-xxx.json

# 3. 校验
npm run validate:data

# 4. 重新生成分片
npm run split:data
```

合并脚本会拦住：分类不在枚举内、id 超出该分类编号段、id 重复（自动跳过）。

改完题库**必须重新跑 `npm run split:data`**，否则前端拿到的还是旧分片。

## 内容质量要求

### 简答题

1. **力求简短易记**：答案控制在能「直接背诵」的长度，要点分行、用短句
2. **与选择题考不同知识点**：简答讲原理/流程，选择题考细节/命令/参数，不要互相改写凑数
3. **可带 `**强调**`** 标出关键词
4. **可用 `[[图:id]]` 插图**（见 [figure-authoring](figure-authoring.md)）
5. **必须可验证**：命令、参数、阈值写在主流稳定版本范围内

### 选择题解析（决定题目价值）

**用户明确反馈过「一些题目的答案过于简洁了」**，所以解析要写成**能学到东西**的内容。
目标 **400~700 字**（按题意取舍，不必强行凑字数）。

每条解析应包含：

1. **一句话结论**（加粗开头）
2. **为什么**（原理说明）
3. **对比表格或代码示例**
4. **常见坑 / 实践建议**（用 ⚠️ 标注）

**不要在解析里写「选项 X 正确」** —— 选项在渲染时可能被打乱，这句话会失配。

参考风格：

```markdown
**`set -e` 只对「简单命令」生效，命令替换、管道、`||` 后面的命令都不触发。**

| 场景 | set -e 是否生效 |
|---|---|
| `false` | ✅ 退出 |
| `cmd1 | cmd2`（中间的失败） | ❌ 不退出 |
| `if false; then` | ❌ 不退出（条件判断不算失败） |

**实践建议**：用 `set -euo pipefail` 而非只有 `set -e` —— `-o pipefail` 才让管道中间失败也退出。
```

### 过时技术要「保留 + 纠正」

题目照出，但解析里必须说明现状：

| 过时点 | 解析里要写的现状 |
|---|---|
| `query_cache_size` | MySQL 8.0 **已完全移除**（5.7 就默认关闭） |
| `MyISAM` | 已淘汰：无事务、表锁、崩溃需 repair |
| `Docker Swarm` | 生产已被 K8s 取代，讲「为何不用」 |
| `Puppet` / `Chef` | 需装 agent、曲线陡，国内主流是 Ansible agentless |

### 答案排版：两条硬性约束

答案按**白名单语法**渲染成真实 DOM 块（标题/列表/表格/代码块/引用），
`answer` 与 `explanation` 都要遵守：

1. **代码围栏必须成对闭合** —— 少一个会把后面正文全吞进代码块
2. **表格必须有分隔行**（第二行 `|---|---|`）—— 缺了会渲染成一长串 `|`

这两类错误人群肉眼难发现，但页面上会表现为「文字挤成一条 / 竖线外露」，
所以 `npm run validate:data` 会拦。

### 插图

流程/链路/对比类题目建议配图，规范见 [figure-authoring](figure-authoring.md)。
**图不要塞进选择题的题干** —— 选择题的答案位是选项 key，图只能进 `explanation`。

## 校验规则

`npm run validate:data` 检查：

| 项 | 约束 |
|---|---|
| 总题数 | 90 – 3000 |
| 每类下限 | 至少 6 题 |
| `question` 长度 | ≤ 120 字 |
| `tags` | 2–5 个，必须是数组 |
| `options` | 2–6 项，key 从 A 起连续 |
| `answer` | 单选恰好 1 个；多选 ≥ 2 个；引用的 key 必须存在 |
| 枚举 | `category` / `difficulty` / `frequency` 必须在枚举内 |
| JSON 标记 | 代码围栏成对、表格有分隔行 |
| 简答 vs 选择 | 简答**不能有** `options` |

**它不校验的东西**：主题重复（脚本查不出，必须人眼过一遍同分类列表）。

## 新增分类的完整步骤

1. `src/utils/constants.js`：`CATEGORIES` 加值、`CATEGORY_ADVICE` 加建议、颜色映射加一项
2. `scripts/merge-batch.mjs`：`ID_RANGES` 加区间（500 宽）
3. `scripts/split-data.mjs`：`CAT_SLUG` 加 slug
4. `tests/categoryOrder.test.js`：`EXPECTED` 数组加值（顺序也要正确）
5. 本文档的分类表 + README 的功能一览
6. 往该分类加至少 6 题（否则校验报「低于每类下限」）
7. `npm run validate:data && npm run split:data && npm test`
