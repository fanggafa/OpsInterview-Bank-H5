# 出题任务规范（按清单补题）

## 总目标

按用户给定的 11 个能力模块清单，补齐题库。目标分类与题量：

| 分类 | 题量 | id 区间 | 起始 id |
|---|---|---|---|
| Shell脚本 | 18 | 9000–9499 | 9092 |
| 网络基础 | 18 | 9500–9999 | 9595 |
| 自动化与配置管理 | 16 | 6500–6999 | 6586 |
| MySQL | 20 | 7500–7999 | 7500 |
| Docker（新建分类） | 18 | 13500–13999 | 13500 |
| 容器与K8s | 18 | 10000–10499 | 10096 |
| CI/CD | 18 | 10500–10999 | 10580 |
| 监控告警 | 16 | 11000–11499 | 11083 |
| 云与高可用 | 18 | 7000–7499 | 7086 |

**全部是单选题**（`type: "single"`）。

---

## 输出格式（严格）

产出一个 JSON 数组文件，路径按你分到的组指定。每条形如：

```json
{
  "id": 9092,
  "type": "single",
  "category": "Shell脚本",
  "difficulty": "中等",
  "frequency": "高频",
  "question": "题干（可以带 `代码` 反引号，也可以是多行代码块）",
  "options": [
    { "key": "A", "text": "选项文字" },
    { "key": "B", "text": "..." },
    { "key": "C", "text": "..." },
    { "key": "D", "text": "..." }
  ],
  "answer": ["C"],
  "explanation": "解析（Markdown，见下）",
  "tags": ["标签1", "标签2"]
}
```

### 硬性校验规则（`npm run validate:data` 会拦）

| 字段 | 要求 |
|---|---|
| `id` | **在你分到的区间内**、且不与现有题目冲突（起始 id 见上表，按顺序递增） |
| `type` | 固定 `"single"` |
| `category` | **必须与分配的分类名完全一致**（含斜杠、大小写） |
| `difficulty` | 只能是 `简单` / `中等` / `困难` |
| `frequency` | 只能是 `低频` / `中频` / `高频` |
| `options` | **4 个**（`MIN_OPTIONS=2`，但统一 4 个），key 必须是 **A/B/C/D 连续** |
| `answer` | **数组**，单选必须**恰好 1 个元素**，且必须是 options 里存在的 key |
| `explanation` | 非空字符串，**至少 10 字** |
| `tags` | **必须是数组**，1–4 个标签 |

### JSON 书写注意（最容易出错）

- 字符串里的换行**必须写成 `\n` 转义**，不能有裸换行
- 繁简/全角标点正常用，但**不要写 BOM**
- 中文与数字之间不加空格

---

## 题目质量要求

### 题干

- 要像真实面试题，**不要写成「以下哪个是...的说法」这种凑数句式**
- 可以带代码块（用 `\n` 换行 + 空格缩进），代码用 `python` / `bash` / `yaml` 风格
- 难度分布参考：**简单 25% / 中等 55% / 困难 20%**

### 选项

- **4 个选项都要像回事**，错误选项要是「常见的误解」而不是明显胡扯
- 错误选项要能区分「懂一半」和「真懂」

### 解析（这是重点，决定题目价值）

每题解析必须包含：

1. **一句话结论**（加粗开头）
2. **为什么**（原理说明）
3. **对比表格或代码示例**（Markdown 表格 `| ... |` 或 ``` 代码块）
4. **常见坑 / 实践建议**（用 `⚠️` 或「坑」标注）

参考风格（解析要有信息密度，不是「因为 A 是对的所以选 A」）：

```markdown
**`set -e` 只对「简单命令」生效，命令替换、管道、`||` 后面的命令都不触发。**

| 场景 | set -e 是否生效 |
|---|---|
| `false` | ✅ 退出 |
| `cmd1 \| cmd2`（中间的失败） | ❌ 不退出 |
| `if false; then` | ❌ 不退出（条件判断不算失败） |

**实践建议**：用 `set -euo pipefail` 而非只有 `set -e` —— `-o pipefail` 才让管道中间失败也退出。
```

---

## 必须遵守的内容原则

### 1. 过时技术要「保留 + 纠正」

清单里有几处已过时的点，**题目照出，但解析里必须说明现状**：

| 过时点 | 现状（必须写进解析） |
|---|---|
| `query_cache_size` / `query_cache_type` | **MySQL 8.0 已完全移除**该特性（5.7 默认就关闭，因并发下命中率低且争用严重） |
| `MyISAM` | 已淘汰：无事务、表锁、崩溃后需 repair。InnoDB 才是默认与推荐 |
| `Docker Swarm` | 已被 K8s 边缘化，生产基本不用；提它是为了「知道它存在、知道为何不用」 |
| `Puppet` / `Chef` | 国内主流是 Ansible（agentless），Puppet/Chef 需装 agent、学习曲线陡 |
| `SET NX` 分布式锁 | 单靠它不安全，要讲 Redlock / 幂等兜底 |

### 2. 不要与现有题库重复

**出题前先查题库**：

```bash
node -e "const q=require('./public/data/questions.json');q.filter(x=>x.category==='Shell脚本').forEach(x=>console.log(x.id, x.question))"
```

现有题库已覆盖的主题**不要重复出**，应该出「清单里提到但题库没覆盖」的角度。下面每组都给了「已知未覆盖点」，优先从这些角度出题。

### 3. 中文规范

- 术语首次出现给中文 + 英文（如「无状态地址自动配置（SLAAC）」）
- 不要用「的的」「了了」这类冗余
- 数字与英文词之间保持可读

---

## 交付要求

1. 只写你自己的那个 `.json` 文件，**不要动 `public/data/questions.json`**
2. 写完后自检：
   ```bash
   node -e "
   const fs=require('fs');
   const a=JSON.parse(fs.readFileSync('<你的文件>','utf8'));
   console.log('条数:', a.length);
   let bad=[];
   for(const x of a){
     const keys=x.options.map(o=>o.key);
     const exp=keys.map((_,i)=>String.fromCharCode(65+i));
     if(keys.join('')!==exp.join('')) bad.push(x.id+' key不连续');
     if(x.answer.length!==1) bad.push(x.id+' 单选答案数≠1');
     if(!x.answer.every(k=>keys.includes(k))) bad.push(x.id+' 答案含非法key');
     if(!x.tags||!Array.isArray(x.tags)) bad.push(x.id+' tags缺失');
     if(!['简单','中等','困难'].includes(x.difficulty)) bad.push(x.id+' difficulty非法');
     if(!['低频','中频','高频'].includes(x.frequency)) bad.push(x.id+' frequency非法');
   }
   console.log('问题:', bad.length? bad.join('; '):'无');
   "
   ```
   **必须输出「问题: 无」**

3. 汇报：文件路径、条数、自检输出、难度分布

**绝对不要**：改 `public/data/questions.json`、改别的组的文件、改 `src/utils/constants.js`、跑 `git` 命令。
