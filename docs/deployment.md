# 部署与运维

> 说明「怎么构建、怎么上线、出问题怎么查」。
> 架构见 [architecture](architecture.md)，协作规范见 [conventions](conventions.md)。

## 先理解：为什么需要 rewrite

项目默认使用 **history 路由**（`createWebHistory`），URL 是 `/bank`、`/question/3` 这样的真实路径。
服务器找不到对应文件时，**必须回退到 `index.html`** 让前端路由接管，否则刷新子页面会 404。

```
用户访问 /bank  →  服务器没有 bank.html  →  [未配置] 404
                                        →  [已配置] 返回 index.html → 前端路由渲染题库页
```

首页 `/` 永远正常，所以**这个坑只在刷新/直接分享子页面时出现**，很容易上线后才发现。

## 构建

```bash
npm install
npm run build          # 产物在 dist/
npm run preview        # 本地预览构建产物（127.0.0.1:5274）
```

构建脚本是 `scripts/build.mjs`（不是直接 `vite build`），它包裹了
`stripSourceData`（从产物里剔除 `questions.json` 源文件）等插件。

## 部署到根路径

直接把 `dist/` 传上去。仓库已带各平台配置：

**Vercel**（`vercel.json`）

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify**（`netlify.toml`）

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx**（完整片段见 `deploy/nginx.conf.snippet`）

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

> ⚠️ 只写 `root` + `index` 是不够的，必须加 `try_files`，否则刷新 `/bank` 会 404。

**其他静态托管**（GitHub Pages / OSS / COS / 宝塔等）：
找到「404 回退到 index.html」的开关打开；没有该功能的，用 hash 模式。

## 部署到子目录

默认构建产物引用绝对路径 `/assets/...`，**直接放子目录会白屏**。构建时指定 `BASE_PATH`：

```bash
# Linux / macOS
BASE_PATH=/ops/ npm run build

# Windows PowerShell
$env:BASE_PATH='/ops/'; npm run build
```

产物路径变成 `/ops/assets/...`，`index.html`、路由、题库数据会同步适配
（代码里所有资源路径都走 `import.meta.env.BASE_URL`，无需改业务代码）。

Nginx 对应配置：

```nginx
location /ops/ {
    alias /usr/share/nginx/html/ops/;
    try_files $uri $uri/ /ops/index.html;
}
```

## 不想配 rewrite？改用 hash 模式

**不用改源码**，构建时指定环境变量即可：

```bash
VITE_ROUTER_MODE=hash BASE_PATH=/你的子目录/ npm run build
```

URL 变成 `/#/bank`、`/#/question/3`。**任何静态托管、甚至直接双击 html 都能用，零配置**。
代价是 URL 带 `#`，不好看，且部分统计/分享工具处理 hash 不佳。

## GitHub Pages（已配置自动部署）

**线上地址：https://fanggafa.github.io/OpsInterview-Bank-H5/**

`.github/workflows/deploy-pages.yml` 在推送 `main` 后自动发布，
含 `configure-pages` 的 `enablement: true`，**首次部署会自己开启 Pages**。

工作流已处理 Pages 的两个特殊要求：

| 要求 | 处理方式 |
|---|---|
| 项目站点在子路径下 | 自动设 `BASE_PATH=/<仓库名>/` |
| **Pages 不支持服务器端 rewrite** | 自动用 `VITE_ROUTER_MODE=hash` |

> ⚠️ 这一点很关键：已实测确认，history 模式在纯静态托管上，`/bank`、`/question/1`
> 都会直接 404，只有首页能用。所以 Pages 必须用 hash 模式。

**hash 模式的固有行为**：

- ✅ 分享 `.../#/question/3` 可直达详情
- ❌ 分享 `.../bank`（不带 `#`）会 404 —— 不是 bug

## 部署后必须验证的 4 件事

按顺序点一遍，前两条最容易踩：

1. **直接刷新子路由**：打开 `/bank` 后按 F5 → 不能 404
2. **深链接直达**：把 `/question/3` 发给别人打开 → 能正常显示
3. **题库加载**：题库页能看到题
4. **手机真机**：微信内置浏览器打开 → 布局正常、能滑动切题

> `npm run preview` 对所有路径都返回 200，**不能代表线上一定没问题**
> （那是预览服务器的默认行为）。真正要验证的是部署平台上的 rewrite 配置。

## 缓存与更新

| 资源 | 策略 |
|---|---|
| `assets/*`（文件名带 hash） | 长缓存（`expires 1y` + `immutable`） |
| `index.html` | **不要强缓存**，否则引用旧 hash 资源 → 白屏 |
| `data/questions-index.json` 与分片 | 建议 `no-cache`，更新题库后刷新即生效 |

## 其他注意事项

| 事项 | 说明 |
|---|---|
| **HTTPS** | 必须用。微信内打开、`prefers-color-scheme` 都依赖安全上下文 |
| 数据存储 | 学习记录存**用户浏览器本地**，换设备/清缓存即丢失 |
| CDN | 若走 CDN，记得在 CDN 层也配「404 → index.html」 |
| 微信分享 | 卡片标题取 `index.html` 的 `<title>`；自定义需接 JSSDK |
| 多环境 | localStorage key 固定 `oi_*`，同域名下不同部署会共用记录 |

## 故障速查

| 现象 | 原因 | 解决 |
|---|---|---|
| 首页正常，刷新 `/bank` 404 | 缺 rewrite 回退 | 加 `try_files $uri $uri/ /index.html;`，或改 hash 模式 |
| 全白，控制台 `Failed to load module script` | 子目录部署但没设 base | `BASE_PATH=/子目录/ npm run build` |
| 白屏且旧 hash 文件 404 | `index.html` 被强缓存 | 给 `index.html` 设 `no-cache` |
| 题库页一直转圈 / 加载失败 | 索引或分片路径错、未上传，或改了题库没重新生成分片 | 确认 `dist/data/questions-index.json` 与 `dist/data/answers/manifest.json` 存在；本地 `npm run split:data` 再构建；点页面「重试」 |
| CDN 后面仍 404 | CDN 层没配回退 | 在 CDN 的「自定义错误页 / 回源规则」里也做 404→index.html |
| 手机上滑动切题没反应 | 极老内核未触发 pointer 事件 | 用键盘/按钮切题 |
| 深色模式不跟随系统 | 不支持 `prefers-color-scheme` 或非 HTTPS | 手动固定为深色；生产用 HTTPS |

## CI

`.github/workflows/ci.yml` 在每次 push / PR 到 `main` 自动执行，
顺序刻意把编码检查放在最前（编码坏了会污染后面所有步骤的排查）：

```
编码检查 → 题库校验 → 单元测试 → 构建 → BASE_PATH 构建 → 校验产物 → 上传 artifact
```

- Node 20.x 与 22.x 双版本矩阵
- 构建产物在 Actions 页面可直接下载部署
- 同分支新推送自动取消旧任务

### CI 突然变慢怎么排查

**先分清是「步骤变慢」还是「runner 开销」**：

```
runner 开销 = job 总耗时 − 各 steps 耗时之和
```

```bash
curl -s "https://api.github.com/repos/<owner>/<repo>/actions/runs/<run_id>/jobs" \
  | jq -r '.jobs[] | "\(.name)\t\(.started_at)\t\(.completed_at)"'
```

若「步骤之和」明显小于「总耗时」，说明是 runner 排队/启动开销，优化步骤没有意义。

## PWA 离线

目标场景：**通勤/地铁没网时也能刷题**。

**缓存策略：全量预缓存**。`vite-plugin-pwa` 的 `globPatterns` 显式包含 `json`，
把索引与全部分片纳入 precache —— 实测 `precache 71 entries (~5.2 MB)`。

> 为什么不只缓存首屏：只缓存首屏会导致「离线能打开列表、点进题目没答案」，
> 那等于不能刷题。全量缓存只多下几 MB。

**更新策略：手动提示**（`registerType: 'prompt'`）。

新版本安装完成后**不自动接管**，通过 `usePwaUpdate` 暴露 `needRefresh`，
由 `PwaUpdateBar` 弹出页内提示条（「稍后 / 立即更新」）。

> 为什么不自动更新：用户可能正在刷题，SW 立刻接管会强制重载页面、丢失作答状态。
> 另设每小时一次 `registration.update()` 检查。

**关键实现细节**：

- SW 注册放在 `app.mount()` **之后**，不与首屏抢带宽与主线程
- `virtual:pwa-register` 用**动态 import** —— 它是构建期生成的虚拟模块，
  静态 import 会让单元测试崩溃；无 SW 环境时 `register()` 静默跳过
- 图标由 `scripts/gen-icons.mjs` **手写 PNG 编码器**生成（项目没有 sharp/canvas）
- **与 `stripSourceData` 的顺序是对的**：`sw.js` 里已确认不含 `questions.json`

**CI 与部署工作流都加了 PWA 产物断言**：检查 `sw.js` / `manifest.webmanifest` /
三个图标（含 iOS 的 `apple-touch-icon.png`）存在，并 `grep` 确认 `sw.js`
真的预缓存了索引与答案分片 —— 防止「能装但离线没数据」这种静默失效。

测试：`tests/pwaUpdate.test.js`。

## 安装到手机桌面

**线上地址**：https://fanggafa.github.io/OpsInterview-Bank-H5/

> ⚠️ **必须打开根地址**。GitHub Pages 不支持服务器端 rewrite，站点用的是 **hash 路由**，
> 所以 `https://…/OpsInterview-Bank-H5/#/bank` 可用，
> 而 `https://…/OpsInterview-Bank-H5/bank`（不带 `#`）会 404。

**应用内已有引导**：设置页 →「安装到桌面」，会按平台自动给出对应步骤
（实现在 `src/utils/installGuide.js`）。本节是同一套内容的展开说明。

### iPhone / iPad（必须用 Safari）

1. **Safari** 打开上面的地址（Chrome / 微信内打开**不能**添加）
2. 点底部分享按钮（方框 + 向上箭头）
3. 下滑找到「**添加到主屏幕**」
4. 改名称（默认「运维题库」）→ 点「添加」

### Android —— **优先用手机自带浏览器**

> 🧑‍💻 **这条规则来自一次真实踩坑**（国行小米 + Chrome）：
> 点「安装应用」后 Chrome 弹「正在安装…」，随后静默消失，桌面和应用抽屉都没有图标，
> 却生成了一个 **`.mht` 文件**。
>
> 原因是 Chrome 的「安装」**不在本机完成**：它把站点信息上传到 Google 服务器
> 铸出 WebAPK 再下载回来。国行设备即使装了 GMS，也常因连不上 Google 服务而失败，
> 且失败时系统 Intent 会被降级成「保存网页」——于是产出 `.mht`。

**推荐：手机自带浏览器**

1. 用**自带浏览器**打开上面的地址
2. 菜单 →「**添加到屏幕**」或「**添加到桌面**」
3. 确认 → 桌面立刻出现图标

自带浏览器是**本机直接建快捷方式**，不经过系统安装流程、不依赖 Google，一定能成。

**备选：Chrome**（若菜单同时给出「安装」与「创建快捷方式」）

- 选「**创建快捷方式**」（本机建，成功率高）
- **不要**选「安装」——那条要走 Google 服务器

**其他备选**：Firefox 的「添加到主屏幕」，同样不依赖 Google。

**代价**：走「快捷方式」路径时打开会带浏览器地址栏，不是全屏。
**但离线照样可用**（Service Worker 在工作，数据已预缓存）。

### 安装后的行为

| 项 | 表现 |
|---|---|
| 运行形态 | **「安装应用」路径**：全屏，无地址栏（`display: standalone`）<br>**「创建快捷方式」路径**：带浏览器地址栏，是普通网页 |
| 离线 | **两条路径都可用**（Service Worker 已注册，索引与全部分片已预缓存） |
| 更新 | 不自动重载；新版本就绪后页内弹提示条（「稍后 / 立即更新」） |

> 安卓上「全屏」与「一定能装上」是两个取舍：全屏需要走 Chrome 的 WebAPK（依赖 Google），
> 而快捷方式一定能装但带地址栏。**对刷题来说离线能力才是关键，两条路径都有。**

### 为什么需要 `apple-touch-icon.png`

**iOS 只认 `apple-touch-icon`，不看 web manifest 的 `icons`。**
缺它时 iOS 会拿页面截图缩成桌面图标，看起来像「快捷方式」而不是应用。

该图标由 `scripts/gen-icons.mjs` 生成：180×180、**不透明**、**不加圆角**
（iOS 会自己加圆角遮罩，我们自己再圆角会出现双层毛边）。

CI 已加断言：产物里必须有 `dist/apple-touch-icon.png`，且 `index.html` 里必须有引用。
