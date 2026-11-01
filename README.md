# 运维面试题库 H5（OpsInterview Bank）

面向运维工程师的面试题库刷题工具：手机浏览器 / 微信内打开，利用碎片时间背题自测。

- 技术栈：Vue 3 + Vite + Vue Router + Pinia（纯 JavaScript，无 TypeScript）
- 形态：SPA，移动端优先，**无后端、无登录、无 API Key**，可部署到任意静态托管
- 题库：**2892 题**（1000 简答 + 1720 单选 + 172 多选），26 个分类；含 **363 张内联 SVG 图解**
- 线上演示：**https://fanggafa.github.io/OpsInterview-Bank-H5/**

> 只想部署出去用？看 [deployment](docs/deployment.md) 的 hash 模式一节，一行改动零配置上线。

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
| `npm run test` | 运行 vitest（48 个文件 / 791 个用例） |
| `npm run validate:data` | 校验题库结构（枚举 / id / 题数 / 字段） |
| `npm run split:data` | 由 `questions.json` 生成索引 + 答案分片 |
| `npm run check:encoding` | 编码守卫（防中文被写坏） |
| `npm run check:import-case` | 导入路径大小写检查 |
| `npm run check:figures` | 插图文字溢出检查 |
| `npm run check:figure-sfc` | 插图结构检查（SFC 完整性 + 文字压字） |
| `npm run check:figure-placement` | 插图挂载检查（图是否被正确引用） |
| **`npm run verify`** | **提交前跑这个**：编码 + 题库 + 插图 + 测试 + 构建 全流程 |

环境要求：Node.js ≥ 18。

部署到子目录时用 `BASE_PATH=/子目录/ npm run build`（详见 [deployment](docs/deployment.md)）。

---

## 功能一览

| 页面 | 说明 |
|---|---|
| `/` 首页 | 总进度环、三个指标、**开始/继续练习**、**每日一题**、**复习巩固（每日复习 / 错题复习 / 薄弱分类）** |
| `/bank` 题库 | 分类（默认折叠）+ 频率 + 难度筛选、防抖搜索、分页（页码进 URL） |
| `/question/:id` | 简答折叠答案 + 自评；选择题选项判定 + 解析；**左右滑动切题** |
| `/practice` | 两步：**先选做题 / 背题，再出题卡**；**默认随机**（可切顺序），滑动 + 键盘，**仅顺序模式**自动续刷 |
| `/practice?review=daily\|wrong` | **复习赛**：直接出题、一次性题组（每日复习 15 题 / 错题复习 10 题），不写断点 |
| `/wrong` 错题本 | **连对 3 次才移出**，每题显示连对进度 |
| `/weak` 薄弱分类 | 按分类掌握率升序，可下钻到分类刷题或题库；样本门槛 = 刷过 ≥3 题且含错题 |
| `/favorites` 收藏 | 按收藏时间倒序，分页 |
| `/me` | 个人卡、四宫格数据、**分类图表（折叠）**、入口 |
| `/settings` | 外观主题、默认练习方式、清空数据、关于 |

共 9 条业务路由 + 404。底部 TabBar 4 项（首页 / 刷题 / 题库 / 我的）。

**详细需求与验收标准**：[PRD](docs/ops-interview-bank-PRD.md)

---

## 文档索引

文档按职责拆分，**不要把内容全塞进 README**：

| 文档 | 职责 |
|---|---|
| [PRD](docs/ops-interview-bank-PRD.md) | 需求规格、功能边界、验收标准、明确不做的项 |
| [architecture](docs/architecture.md) | 目录结构、数据流、分片、本地存储、统计口径、渲染 |
| [conventions](docs/conventions.md) | 编码约定、测试要求、提交与 PR 流程、编码守卫 |
| [deployment](docs/deployment.md) | 部署（rewrite / hash / 子目录）、CI、PWA、故障速查 |
| [question-authoring](docs/question-authoring.md) | 出题格式、编号段、字段约束、校验规则 |
| [figure-authoring](docs/figure-authoring.md) | 插图 SVG 规范、颜色变量、字号下限、溢出修复 |
| [figures-registry](docs/figures-registry.md) | 363 张插图的完整注册表（按分类分组） |

**改动前的必读顺序**：要改交互 → PRD；要加题 → question-authoring；
要画图 → figure-authoring；要提交 → conventions；要上线 → deployment。

---

## 目录结构

```
ops-interview-h5/
├── docs/                       # 文档（见上方索引）
├── public/data/
│   ├── questions.json          # 题库源数据（唯一真相）
│   ├── questions-index.json    # 生成的轻量索引（6 字段）
│   └── answers/                # 生成的答案分片 + manifest.json
├── scripts/                    # 构建/校验/生成脚本（Node .mjs）
├── src/
│   ├── api/dataService.js      # 题库加载封装
│   ├── stores/                 # bankStore / studyStore / settingsStore
│   ├── router/index.js         # 9 条路由 + 守卫
│   ├── views/                  # 页面（9 个 + 404）
│   ├── components/             # 通用组件 + figures/（363 张插图）
│   ├── assets/styles.css       # CSS 变量与全局样式
│   └── utils/                  # 纯函数工具
├── tests/                      # vitest（48 个文件 / 791 个用例）
├── deploy/nginx.conf.snippet
├── vercel.json / netlify.toml
└── index.html
```

**详细结构说明**（含每个 utils 文件的职责）：[architecture](docs/architecture.md#目录结构)

---

## 几个关键约定（速查）

| 项 | 约定 |
|---|---|
| **默认题序** | **随机**；「顺序」是可选项 |
| **断点续刷** | **仅顺序模式**；随机模式不写断点、不显示「上次停在」 |
| **掌握率** | **只算简答题**，选择题单独算正确率 |
| **搜索** | 只匹配题干（标签已移出索引） |
| **加题方式** | 不许直接改 `questions.json`，写 batch 文件跑 `merge-batch.mjs` |
| **插图字号** | 最小 7px，不许为了塞下而缩小 |
| **`<path>` 线条** | 必须 `fill="none"`，否则会填成黑块 |
| **全程无 `v-html`** | 安全底线，不要为了渲染方便破例 |

**为什么这样定**：[architecture](docs/architecture.md) 与各规范文档里有理由与踩坑记录。

---

## 常见问题

| 问题 | 答案 |
|---|---|
| 学习记录会丢吗 | 存在**浏览器 localStorage**，换设备 / 清缓存即丢失（无后端，属预期） |
| 需要后端吗 | 不需要。纯静态托管即可 |
| 能离线用吗 | 能，已实现 PWA 全量预缓存 |
| 题库怎么加题 | 见 [question-authoring](docs/question-authoring.md) |
| 部署后刷新 404 | 缺 rewrite 回退，见 [deployment](docs/deployment.md#先理解为什么需要-rewrite) |
| 提交被拒 `GH006` | `main` 有保护，必须走 PR，见 [conventions](docs/conventions.md#提交与-pr) |

---

## 许可

个人学习项目，题库内容仅用于面试复习。
